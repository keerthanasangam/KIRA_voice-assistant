import os
import json
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Request, Response, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import SessionLocal
from app.database.models import Call, Caller, Message, Organization, CallSummary, ActionItem
from app.services.kira_agent import generate_kira_response, generate_call_summary
from app.services.action_dispatcher import detect_dispatch_intent, dispatch_in_call_action

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter(tags=["Twilio Telephony & Real Phone Gateway"])

SETTINGS_FILE = os.path.join(os.path.dirname(__file__), "..", "telephony_settings.json")

def load_telephony_settings() -> dict:
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "account_sid": "",
        "auth_token": "",
        "phone_number": "",
        "webhook_base_url": "",
        "enabled": False
    }

def save_telephony_settings(settings: dict):
    os.makedirs(os.path.dirname(SETTINGS_FILE), exist_ok=True)
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(settings, f, indent=2)


class TelephonySettingsPayload(BaseModel):
    account_sid: Optional[str] = ""
    auth_token: Optional[str] = ""
    phone_number: Optional[str] = ""
    webhook_base_url: Optional[str] = ""
    enabled: Optional[bool] = False


# ==================================================
# TELEPHONY CONFIGURATION ENDPOINTS
# ==================================================

@router.get("/settings/telephony")
def get_telephony_settings():
    s = load_telephony_settings()
    token = s.get("auth_token", "")
    masked_token = (token[:4] + "••••••••" + token[-4:]) if len(token) > 8 else ("••••••••" if token else "")
    return {
        "account_sid": s.get("account_sid", ""),
        "auth_token": masked_token,
        "has_auth_token": bool(token),
        "phone_number": s.get("phone_number", ""),
        "webhook_base_url": s.get("webhook_base_url", ""),
        "enabled": s.get("enabled", False),
        "recommended_webhook_path": "/telephony/twilio/voice",
        "instructions": [
            "1. Start ngrok on your backend port: `ngrok http 8000`",
            "2. Copy the Forwarding URL (e.g. `https://xxxx.ngrok-free.app`)",
            "3. Paste the URL into 'Webhook Base URL' above and save",
            "4. In your Twilio Console -> Phone Numbers -> Active Numbers -> Configure:",
            "   Under 'A CALL COMES IN', select 'Webhook' (HTTP POST) and set URL to:",
            "   `https://your-ngrok-url/telephony/twilio/voice`",
            "5. Call your Twilio phone number from any smartphone and KIRA will answer live!"
        ]
    }


@router.post("/settings/telephony")
def update_telephony_settings(payload: TelephonySettingsPayload):
    current = load_telephony_settings()
    token = payload.auth_token if payload.auth_token and "••••" not in payload.auth_token else current.get("auth_token", "")

    updated = {
        "account_sid": payload.account_sid.strip() if payload.account_sid else "",
        "auth_token": token.strip() if token else "",
        "phone_number": payload.phone_number.strip() if payload.phone_number else "",
        "webhook_base_url": payload.webhook_base_url.strip().rstrip("/") if payload.webhook_base_url else "",
        "enabled": bool(payload.enabled)
    }
    save_telephony_settings(updated)
    return {"success": True, "message": "Telephony configuration saved successfully."}


# ==================================================
# TWILIO TWIML WEBHOOKS
# ==================================================

@router.post("/telephony/twilio/voice")
async def twilio_inbound_voice(request: Request, db: Session = Depends(get_db)):
    """
    TwiML Entry point for real inbound calls from Twilio.
    Greets caller, logs to Postgres database, and prompts for speech.
    """
    form_data = await request.form()
    caller_phone = form_data.get("From", "Unknown Phone")
    call_sid = form_data.get("CallSid", "")

    # Ensure Organization exists
    org = db.query(Organization).first()
    if not org:
        org = Organization(name="Keerthana's Desk", email="keerthana@example.com")
        db.add(org)
        db.commit()
        db.refresh(org)

    # Look up or create caller
    caller = db.query(Caller).filter(Caller.phone == caller_phone).first()
    if not caller:
        caller = Caller(
            organization_id=org.id,
            name="Phone Caller",
            phone=caller_phone,
            registered_mode="Student",
            memory_notes="Inbound phone call via Twilio",
            is_vip=False
        )
        db.add(caller)
        db.commit()
        db.refresh(caller)

    caller_name = caller.name if caller.name and caller.name.lower() != "phone caller" else "there"
    is_vip = bool(getattr(caller, "is_vip", False))

    # Create Call session in database
    call = Call(
        caller_id=caller.id,
        status="in_progress",
        purpose="Inbound Twilio Phone Call",
        mode=caller.registered_mode or "Student",
        language="English",
        call_type="General Inquiry"
    )
    db.add(call)
    db.commit()
    db.refresh(call)

    # Build greeting
    if is_vip:
        greeting = f"Hello {caller_name}! It is an honor to speak with you. You have reached Keerthana's desk. As one of her VIP contacts, your call is our highest priority. Please speak after the tone and tell me how I can assist you."
    else:
        greeting = f"Hello {caller_name}. You have reached Keerthana's desk. She is currently unavailable. I am KIRA, her AI assistant. Please speak after the tone and tell me how I can help."

    # Record initial greeting in messages
    initial_msg = Message(
        call_id=call.id,
        speaker="kira",
        content=greeting
    )
    db.add(initial_msg)
    db.commit()

    gather_url = f"/telephony/twilio/gather?call_id={call.id}"

    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Aditi">{greeting}</Say>
    <Gather input="speech" action="{gather_url}" timeout="4" speechTimeout="auto">
        <Say voice="Polly.Aditi">I am listening.</Say>
    </Gather>
    <Say voice="Polly.Aditi">I did not hear anything. I will let Keerthana know you called. Goodbye.</Say>
    <Hangup/>
</Response>"""
    return Response(content=twiml, media_type="application/xml")


@router.post("/telephony/twilio/gather")
async def twilio_gather_speech(request: Request, call_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Receives caller speech transcription from Twilio, generates KIRA response,
    logs to DB, and speaks it back over the live phone line.
    """
    form_data = await request.form()
    speech_result = form_data.get("SpeechResult", "").strip()
    caller_phone = form_data.get("From", "Unknown")

    call = None
    if call_id:
        call = db.query(Call).filter(Call.id == call_id).first()

    if not speech_result:
        twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Aditi">Thank you for calling Keerthana. Goodbye.</Say>
    <Hangup/>
</Response>"""
        if call:
            call.status = "completed"
            call.ended_at = datetime.utcnow()
            db.commit()
        return Response(content=twiml, media_type="application/xml")

    # Record caller message
    if call:
        caller_msg = Message(
            call_id=call.id,
            speaker="caller",
            content=speech_result
        )
        db.add(caller_msg)
        db.commit()

        # Build conversation history
        messages = db.query(Message).filter(Message.call_id == call.id).order_by(Message.timestamp).all()
        conversation = [{"speaker": m.speaker, "content": m.content} for m in messages]
        caller_context = {
            "name": call.caller.name if call.caller else "Caller",
            "calls_count": db.query(Call).filter(Call.caller_id == call.caller_id).count() if call.caller_id else 1,
            "memory_notes": call.caller.memory_notes if call.caller else "",
            "is_vip": bool(getattr(call.caller, "is_vip", False)) if call.caller else False
        }
        desk_mode = call.mode or "Student"
    else:
        conversation = [{"speaker": "caller", "content": speech_result}]
        caller_context = None
        desk_mode = "Student"

    # Generate KIRA response
    kira_reply = generate_kira_response(conversation, mode=desk_mode, caller_context=caller_context)

    # Check for in-call action dispatch intent
    matched_action = detect_dispatch_intent(speech_result, mode=desk_mode)
    if matched_action:
        recipient_num = call.caller.phone if (call and call.caller and call.caller.phone) else "+91 90000 12345"
        try:
            dispatch_in_call_action(
                action_type=matched_action["id"],
                recipient_phone=recipient_num,
                call_id=call.id if call else None
            )
            if matched_action.get("announcement"):
                kira_reply = f"{matched_action['announcement']} {kira_reply}"
        except Exception as e:
            print(f"[TELEPHONY_DISPATCH] Error: {e}")

    if call:
        kira_msg = Message(
            call_id=call.id,
            speaker="kira",
            content=kira_reply
        )
        db.add(kira_msg)
        db.commit()

    # Check if caller wants to end call
    ending_phrases = ["that's all", "that is all", "goodbye", "bye", "thank you, bye", "no that's it", "nothing else"]
    is_ending = any(p in speech_result.lower() for p in ending_phrases)

    if is_ending and call:
        # Generate summary
        try:
            messages = db.query(Message).filter(Message.call_id == call.id).order_by(Message.timestamp).all()
            full_conv = [{"speaker": m.speaker, "content": m.content} for m in messages]
            summary_data = generate_call_summary(full_conv, mode=desk_mode)
            call.call_type = summary_data.get("call_type", "General Inquiry")

            new_summary = CallSummary(
                call_id=call.id,
                summary=summary_data.get("summary", ""),
                requested_action=summary_data.get("action_required", ""),
                action_required=summary_data.get("action_required", ""),
                key_points=json.dumps(summary_data.get("key_points", [])),
                suggested_follow_up=summary_data.get("suggested_follow_up", "Today"),
                urgency=summary_data.get("urgency", "medium"),
                meeting_detected=summary_data.get("meeting_detected", False),
                meeting_details=summary_data.get("meeting_details", "")
            )
            db.add(new_summary)

            action_item = ActionItem(
                call_id=call.id,
                caller_id=call.caller_id,
                title=summary_data.get("action_required") or "Follow up on phone call",
                description=summary_data.get("summary", ""),
                urgency=summary_data.get("urgency", "medium"),
                due_hint=summary_data.get("suggested_follow_up", "Today"),
                is_completed=False
            )
            db.add(action_item)
            call.status = "completed"
            call.ended_at = datetime.utcnow()
            db.commit()
        except Exception as e:
            print(f"Telephony summary error: {e}")

        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Aditi">{kira_reply}</Say>
    <Say voice="Polly.Aditi">Thank you for calling Keerthana's desk. Have a wonderful day.</Say>
    <Hangup/>
</Response>"""
        return Response(content=twiml, media_type="application/xml")

    # Continue conversation
    next_gather_url = f"/telephony/twilio/gather?call_id={call.id if call else ''}"

    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Aditi">{kira_reply}</Say>
    <Gather input="speech" action="{next_gather_url}" timeout="5" speechTimeout="auto">
    </Gather>
    <Say voice="Polly.Aditi">Thank you for your message. I have recorded everything for Keerthana. Have a great day.</Say>
    <Hangup/>
</Response>"""
    return Response(content=twiml, media_type="application/xml")


@router.post("/telephony/twilio/status")
async def twilio_call_status(request: Request, db: Session = Depends(get_db)):
    """
    Webhook for call completion / status events from Twilio.
    """
    form_data = await request.form()
    call_status = form_data.get("CallStatus", "unknown")
    call_duration = form_data.get("CallDuration", "0")
    print(f"Twilio Call Status: {call_status}, Duration: {call_duration}s")
    return {"status": "ok"}
