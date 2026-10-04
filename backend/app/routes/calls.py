import os
import json
import base64
import tempfile
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.database.database import SessionLocal
from app.database.models import (
    Organization,
    Caller,
    Call,
    Message,
    CallSummary,
    ActionItem
)
from app.services.kira_agent import (
    generate_call_summary,
    ask_kira_about_calls,
    build_system_prompt
)
from app.services.voice_service import text_to_speech
from app.services.notifier import (
    dispatch_call_alert,
    load_notification_settings,
    save_notification_settings,
    send_test_alert
)

router = APIRouter(
    tags=["KIRA Calls & Command Center"]
)


# --------------------------------------------------
# Database dependency
# --------------------------------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --------------------------------------------------
# Schemas
# --------------------------------------------------

class StartCallRequest(BaseModel):
    caller_name: Optional[str] = "Guest Caller"
    caller_phone: str = "9876543210"
    caller_email: Optional[str] = None
    mode: Optional[str] = "Student"
    registered_mode: Optional[str] = None
    language: Optional[str] = "English"
    purpose: Optional[str] = None
    is_new_caller: Optional[bool] = False


class RegisterCallerRequest(BaseModel):
    name: str
    phone: str
    registered_mode: str  # Student, Small Business, Freelancer, Professional
    email: Optional[str] = None
    company_or_org: Optional[str] = None


class AskKiraRequest(BaseModel):
    question: str
    mode: Optional[str] = "Student"


class UpdateCallerRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    company_or_org: Optional[str] = None
    memory_notes: Optional[str] = None
    registered_mode: Optional[str] = None
    is_vip: Optional[bool] = None


# --------------------------------------------------
# 1. Start a New Call Session
# --------------------------------------------------

@router.post("/calls/start")
async def start_call(payload: StartCallRequest, db: Session = Depends(get_db)):
    # 1. Find or create default organization
    org = db.query(Organization).first()
    if not org:
        org = Organization(name="Keerthana's Desk", email="keerthana@example.com")
        db.add(org)
        db.commit()
        db.refresh(org)

    # 2. Find or create caller by phone
    caller = db.query(Caller).filter(Caller.phone == payload.caller_phone).first()
    is_returning = False
    prior_calls_count = 0

    clean_payload_name = payload.caller_name.strip() if payload.caller_name else ""
    is_valid_payload_name = clean_payload_name and clean_payload_name.lower() not in ["guest caller", "unknown", "unknown caller"]
    target_mode = payload.registered_mode or payload.mode or "Student"

    if payload.is_new_caller:
        # Explicitly marked as a brand-new first-time caller simulation
        is_returning = False
        prior_calls_count = 0
        if caller:
            caller.name = clean_payload_name or "Guest Caller"
            caller.memory_notes = ""
            caller.registered_mode = target_mode
            if payload.caller_email:
                caller.email = payload.caller_email
            db.commit()
            db.refresh(caller)
        else:
            caller = Caller(
                organization_id=org.id,
                name=clean_payload_name or "Guest Caller",
                phone=payload.caller_phone,
                email=payload.caller_email,
                registered_mode=target_mode,
                memory_notes=""
            )
            db.add(caller)
            db.commit()
            db.refresh(caller)
    elif caller:
        prior_calls_count = db.query(Call).filter(Call.caller_id == caller.id).count()
        # A caller is only returning if they actually have prior completed calls
        # AND had a known name previously that matches the current caller
        has_prior_identity = bool(caller.name and caller.name.strip().lower() not in ["guest caller", "unknown", "unknown caller"])
        name_is_consistent = (not is_valid_payload_name) or (caller.name and caller.name.strip().lower() == clean_payload_name.lower())

        if prior_calls_count > 0 and has_prior_identity and name_is_consistent:
            is_returning = True
        else:
            is_returning = False

        if is_valid_payload_name:
            caller.name = clean_payload_name
        if payload.caller_email and not caller.email:
            caller.email = payload.caller_email
        if payload.registered_mode:
            caller.registered_mode = payload.registered_mode
            target_mode = payload.registered_mode
        elif caller.registered_mode:
            target_mode = caller.registered_mode
        else:
            caller.registered_mode = target_mode
        db.commit()
        db.refresh(caller)
    else:
        caller = Caller(
            organization_id=org.id,
            name=clean_payload_name or "Guest Caller",
            phone=payload.caller_phone,
            email=payload.caller_email,
            registered_mode=target_mode,
            memory_notes=""
        )
        db.add(caller)
        db.commit()
        db.refresh(caller)
        is_returning = False
        prior_calls_count = 0

    # 3. Create call record
    selected_language = payload.language or "English"
    call = Call(
        caller_id=caller.id,
        status="in_progress",
        purpose=payload.purpose,
        mode=target_mode,
        language=selected_language,
        call_type="General Inquiry"
    )
    db.add(call)
    db.commit()
    db.refresh(call)

    # 4. Generate natural opening greeting recognizing caller name and language
    has_name = bool(
        caller.name
        and caller.name.strip()
        and caller.name.strip().lower() not in ["guest caller", "unknown", "unknown caller"]
    )

    if selected_language == "Telugu":
        if getattr(caller, "is_vip", False) and has_name:
            greeting = f"నమస్కారం {caller.name} గారు! మీరు కీర్తన గారి VIP కాంటాక్ట్. మీ కాల్ మాకు అత్యంత ప్రాధాన్యత. నేను మీకు ఎలా సహాయపడగలను?"
        elif is_returning and has_name and prior_calls_count > 0:
            greeting = f"నమస్కారం {caller.name} గారు, మళ్లీ స్వాగతం! కీర్తన గారు ప్రస్తుతం అందుబాటులో లేరు. నేను మీకు ఎలా సహాయపడగలను?"
        elif has_name:
            greeting = f"నమస్కారం {caller.name} గారు! మీరు కీర్తన గారి డెస్క్‌ని సంప్రదించారు. వారు ప్రస్తుతం అందుబాటులో లేరు. నేను వారి AI అసిస్టెంట్ KIRA. మీకు ఏ విధంగా సహాయపడగలను?"
        else:
            greeting = "నమస్కారం! మీరు కీర్తన గారి డెస్క్‌ని సంప్రదించారు. వారు ప్రస్తుతం అందుబాటులో లేరు. నేను KIRA. దయచేసి మీ పేరు మరియు మీరు మాట్లాడాలనుకుంటున్న విషయాన్ని చెప్పగలరా?"
    elif selected_language == "Hindi":
        if getattr(caller, "is_vip", False) and has_name:
            greeting = f"नमस्ते {caller.name} जी! आप कीर्तना जी के विशिष्ट वीआईपी संपर्क हैं। आपकी कॉल हमारे लिए सर्वोच्च प्राथमिकता है। बताइए आज मैं आपकी क्या सेवा कर सकती हूँ?"
        elif is_returning and has_name and prior_calls_count > 0:
            greeting = f"नमस्ते {caller.name} जी, स्वागत है! कीर्तना जी अभी उपलब्ध नहीं हैं। मैं आज आपकी क्या सहायता कर सकती हूँ?"
        elif has_name:
            greeting = f"नमस्ते {caller.name} जी! आपने कीर्तना जी के डेस्क पर संपर्क किया है। वे अभी उपलब्ध नहीं हैं। मैं KIRA, उनकी AI असिस्टेंट हूँ। बताइए मैं आपकी कैसे सहायता कर सकती हूँ?"
        else:
            greeting = "नमस्ते! आपने कीर्तना जी के डेस्क पर संपर्क किया है। वे अभी उपलब्ध नहीं हैं। मैं उनकी AI असिस्टेंट KIRA हूँ। कृपया अपना नाम और कॉल का कारण बताएं?"
    else:
        if getattr(caller, "is_vip", False) and has_name:
            greeting = f"Hello {caller.name}! It's an honor to speak with you. Keerthana is currently unavailable, but as one of her VIP contacts, your message is my highest priority. How can I assist you today?"
        elif is_returning and has_name and prior_calls_count > 0:
            has_substantive_notes = bool(
                caller.memory_notes
                and len(caller.memory_notes.strip()) > 10
                and not any(k in caller.memory_notes.lower() for k in ["unknown caller", "guest caller", "no notes", "no details"])
            )
            if has_substantive_notes:
                greeting = f"Hello {caller.name}, welcome back! Keerthana is unavailable right now, but I remember our previous conversation. How can I help you today?"
            else:
                greeting = f"Hello {caller.name}, welcome back! Keerthana isn't available right now. What would you like to discuss today?"
        elif has_name:
            greeting = f"Hello {caller.name}! You've reached Keerthana's desk. She is currently unavailable, but I'm KIRA, her AI assistant. How can I help you today?"
        else:
            greeting = "Hello! You've reached Keerthana's desk. She is currently unavailable. I'm KIRA, her AI assistant. May I know who is calling and how I can help you?"

    # Record KIRA's initial greeting message
    initial_msg = Message(
        call_id=call.id,
        speaker="kira",
        content=greeting
    )
    db.add(initial_msg)
    db.commit()

    # Synthesize natural initial greeting voice using Edge-TTS in caller's language
    initial_audio_base64 = ""
    output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3").name
    try:
        await text_to_speech(greeting, output_path, language=selected_language)
        with open(output_path, "rb") as f:
            initial_audio_base64 = base64.b64encode(f.read()).decode("utf-8")
    except Exception as e:
        print(f"Initial greeting TTS warning: {e}")
    finally:
        if os.path.exists(output_path):
            try:
                os.remove(output_path)
            except Exception:
                pass

    return {
        "call_id": call.id,
        "caller": {
            "id": caller.id,
            "name": caller.name,
            "phone": caller.phone,
            "email": caller.email,
            "memory_notes": caller.memory_notes,
            "is_returning": is_returning,
            "prior_calls_count": prior_calls_count
        },
        "mode": call.mode,
        "status": call.status,
        "purpose": call.purpose,
        "started_at": call.started_at,
        "initial_greeting": greeting,
        "initial_audio": initial_audio_base64
    }


# --------------------------------------------------
# 2. Get All Calls (Search & Filter)
# --------------------------------------------------

@router.get("/calls")
def get_calls(
    search: Optional[str] = None,
    urgency: Optional[str] = None,
    call_type: Optional[str] = None,
    mode: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Call).order_by(Call.started_at.desc())

    if status:
        query = query.filter(Call.status == status)
    if mode:
        query = query.filter(Call.mode == mode)
    if call_type:
        query = query.filter(Call.call_type == call_type)

    calls = query.all()
    results = []

    for c in calls:
        caller = c.caller
        summary = c.summary

        # Apply search filter if provided
        if search:
            s_lower = search.lower()
            caller_match = caller and (
                (caller.name and s_lower in caller.name.lower()) or
                (caller.phone and s_lower in caller.phone.lower())
            )
            summary_match = summary and (
                (summary.summary and s_lower in summary.summary.lower()) or
                (summary.action_required and s_lower in summary.action_required.lower())
            )
            purpose_match = c.purpose and s_lower in c.purpose.lower()
            if not (caller_match or summary_match or purpose_match):
                continue

        # Filter by urgency
        if urgency and summary:
            if summary.urgency != urgency.lower():
                continue
        elif urgency and not summary:
            continue

        # Parse key points safely
        key_points = []
        if summary and summary.key_points:
            try:
                key_points = json.loads(summary.key_points)
            except Exception:
                key_points = [summary.key_points]

        results.append({
            "call_id": c.id,
            "caller": {
                "id": caller.id if caller else None,
                "name": caller.name if caller else "Unknown",
                "phone": caller.phone if caller else "",
                "email": caller.email if caller else "",
                "memory_notes": caller.memory_notes if caller else ""
            },
            "status": c.status,
            "purpose": c.purpose,
            "mode": c.mode,
            "call_type": c.call_type or (summary.call_type if hasattr(summary, "call_type") else "General Inquiry"),
            "started_at": c.started_at,
            "ended_at": c.ended_at,
            "messages_count": len(c.messages),
            "summary": {
                "summary": summary.summary,
                "requested_action": summary.requested_action,
                "action_required": summary.action_required or summary.requested_action,
                "urgency": summary.urgency,
                "suggested_follow_up": summary.suggested_follow_up,
                "key_points": key_points,
                "meeting_detected": summary.meeting_detected,
                "meeting_details": summary.meeting_details,
                "lead_info": summary.lead_info,
                "created_at": summary.created_at
            } if summary else None
        })

    return {
        "total_calls": len(results),
        "calls": results
    }


# --------------------------------------------------
# 3. Get Call Details & Conversation
# --------------------------------------------------

@router.get("/calls/{call_id}")
def get_call_details(call_id: int, db: Session = Depends(get_db)):
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    caller = call.caller
    summary = call.summary
    messages = (
        db.query(Message)
        .filter(Message.call_id == call_id)
        .order_by(Message.timestamp.asc())
        .all()
    )
    action_items = (
        db.query(ActionItem)
        .filter(ActionItem.call_id == call_id)
        .all()
    )

    key_points = []
    if summary and summary.key_points:
        try:
            key_points = json.loads(summary.key_points)
        except Exception:
            key_points = [summary.key_points]

    return {
        "call_id": call.id,
        "caller": {
            "id": caller.id if caller else None,
            "name": caller.name if caller else "Unknown",
            "phone": caller.phone if caller else "",
            "email": caller.email if caller else "",
            "company_or_org": caller.company_or_org if caller else "",
            "memory_notes": caller.memory_notes if caller else ""
        },
        "status": call.status,
        "mode": call.mode,
        "call_type": call.call_type,
        "purpose": call.purpose,
        "started_at": call.started_at,
        "ended_at": call.ended_at,
        "conversation": [
            {
                "message_id": m.id,
                "speaker": m.speaker,
                "content": m.content,
                "timestamp": m.timestamp
            }
            for m in messages
        ],
        "summary": {
            "summary": summary.summary,
            "action_required": summary.action_required or summary.requested_action,
            "urgency": summary.urgency,
            "suggested_follow_up": summary.suggested_follow_up,
            "key_points": key_points,
            "meeting_detected": summary.meeting_detected,
            "meeting_details": summary.meeting_details,
            "lead_info": summary.lead_info,
            "created_at": summary.created_at
        } if summary else None,
        "action_items": [
            {
                "id": a.id,
                "title": a.title,
                "description": a.description,
                "urgency": a.urgency,
                "due_hint": a.due_hint,
                "is_completed": a.is_completed,
                "created_at": a.created_at
            }
            for a in action_items
        ]
    }


# --------------------------------------------------
# 4. Explicitly End Call & Analyze (Generate Summary + Tasks + Memory)
# --------------------------------------------------

@router.post("/calls/{call_id}/end")
async def end_call(call_id: int, db: Session = Depends(get_db)):
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    messages = (
        db.query(Message)
        .filter(Message.call_id == call_id)
        .order_by(Message.timestamp.asc())
        .all()
    )

    conversation = [
        {"speaker": m.speaker, "content": m.content}
        for m in messages
    ]

    # Generate rich AI summary
    summary_data = generate_call_summary(conversation, mode=call.mode or "Student")

    # Update Call
    is_spam = bool(summary_data.get("is_spam", False))
    call.status = "completed"
    call.ended_at = datetime.utcnow()
    call.call_type = summary_data.get("call_type", "General Inquiry")
    call.is_spam = is_spam

    # Update or Create CallSummary
    existing_summary = db.query(CallSummary).filter(CallSummary.call_id == call_id).first()
    if existing_summary:
        existing_summary.summary = summary_data.get("summary", "")
        existing_summary.requested_action = summary_data.get("action_required", "")
        existing_summary.action_required = summary_data.get("action_required", "")
        existing_summary.key_points = json.dumps(summary_data.get("key_points", []))
        existing_summary.suggested_follow_up = summary_data.get("suggested_follow_up", "This week")
        existing_summary.urgency = summary_data.get("urgency", "medium")
        existing_summary.meeting_detected = summary_data.get("meeting_detected", False)
        existing_summary.meeting_details = summary_data.get("meeting_details", "")
        existing_summary.lead_info = summary_data.get("lead_info", "")
        call_summary = existing_summary
    else:
        call_summary = CallSummary(
            call_id=call_id,
            summary=summary_data.get("summary", ""),
            requested_action=summary_data.get("action_required", ""),
            action_required=summary_data.get("action_required", ""),
            key_points=json.dumps(summary_data.get("key_points", [])),
            suggested_follow_up=summary_data.get("suggested_follow_up", "This week"),
            urgency=summary_data.get("urgency", "medium"),
            meeting_detected=summary_data.get("meeting_detected", False),
            meeting_details=summary_data.get("meeting_details", ""),
            lead_info=summary_data.get("lead_info", "")
        )
        db.add(call_summary)

    # Create ActionItem for Keerthana only if NOT spam
    action_item = None
    if not is_spam and summary_data.get("action_required"):
        action_item = ActionItem(
            call_id=call.id,
            caller_id=call.caller_id,
            title=summary_data.get("action_required"),
            description=summary_data.get("summary", ""),
            urgency=summary_data.get("urgency", "medium"),
            due_hint=summary_data.get("suggested_follow_up", "Today"),
            is_completed=False
        )
        db.add(action_item)

    # Update caller memory
    caller = call.caller
    memory_update = summary_data.get("caller_memory_update", "").strip()
    if caller and memory_update and not is_spam:
        existing_notes = caller.memory_notes or ""
        if memory_update not in existing_notes:
            caller.memory_notes = (existing_notes + " • " + memory_update).strip(" •")

    db.commit()
    db.refresh(call)

    # Dispatch instant notification alert
    alert_info = {"dispatched": False}
    try:
        caller_dict = {
            "name": caller.name if caller else "Unknown",
            "phone": caller.phone if caller else ""
        }
        alert_info = await dispatch_call_alert(summary_data, caller_dict, desk_mode=call.mode or "Student")
    except Exception as e:
        print(f"Alert dispatch warning: {e}")

    return {
        "message": "Call successfully completed and analyzed",
        "call_id": call.id,
        "status": call.status,
        "call_type": call.call_type,
        "ended_at": call.ended_at,
        "is_spam": is_spam,
        "summary": summary_data,
        "alert_dispatched": alert_info,
        "action_created": {
            "id": action_item.id,
            "title": action_item.title,
            "urgency": action_item.urgency,
            "due_hint": action_item.due_hint
        } if action_item else None
    }


# --------------------------------------------------
# 4B. Notification Settings Management
# --------------------------------------------------

@router.get("/settings/notifications")
def get_notification_settings():
    return load_notification_settings()


@router.post("/settings/notifications")
def update_notification_settings(payload: dict):
    return save_notification_settings(payload)


@router.post("/settings/notifications/test")
async def trigger_test_alert():
    return await send_test_alert()


# --------------------------------------------------
# 5. Action Center Endpoints ("What Do I Need To Do?")
# --------------------------------------------------

@router.get("/actions")
def get_actions(
    completed: Optional[bool] = None,
    mode: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ActionItem).order_by(desc(ActionItem.created_at))
    if completed is not None:
        query = query.filter(ActionItem.is_completed == completed)
    if mode and mode != "all":
        query = query.join(Call).filter(Call.mode == mode)

    items = query.all()
    results = []

    for item in items:
        caller = item.caller
        call = item.call
        results.append({
            "id": item.id,
            "call_id": item.call_id,
            "call_mode": call.mode if call else "Student",
            "caller_name": caller.name if caller else "Unknown",
            "caller_phone": caller.phone if caller else "",
            "caller_email": caller.email if caller else "",
            "title": item.title,
            "description": item.description,
            "urgency": item.urgency,
            "due_hint": item.due_hint,
            "is_completed": item.is_completed,
            "created_at": item.created_at
        })

    return {
        "mode": mode or "all",
        "total_actions": len(results),
        "pending_count": sum(1 for a in results if not a["is_completed"]),
        "actions": results
    }


@router.patch("/actions/{action_id}/toggle")
def toggle_action(action_id: int, db: Session = Depends(get_db)):
    item = db.query(ActionItem).filter(ActionItem.id == action_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")

    item.is_completed = not item.is_completed
    db.commit()
    db.refresh(item)

    return {
        "message": "Action updated",
        "action_id": item.id,
        "is_completed": item.is_completed
    }


class CreateActionRequest(BaseModel):
    title: str
    description: Optional[str] = ""
    urgency: Optional[str] = "medium"
    due_hint: Optional[str] = "Today"
    mode: Optional[str] = "Student"


@router.post("/actions")
def create_action(payload: CreateActionRequest, db: Session = Depends(get_db)):
    if not payload.title.strip():
        raise HTTPException(status_code=400, detail="Action title cannot be empty")

    # Associate with latest call of this mode if exists
    call = db.query(Call).filter(Call.mode == payload.mode).order_by(desc(Call.started_at)).first()

    item = ActionItem(
        call_id=call.id if call else None,
        caller_id=call.caller_id if call else None,
        title=payload.title.strip(),
        description=payload.description.strip() if payload.description else "",
        urgency=payload.urgency or "medium",
        due_hint=payload.due_hint or "Today",
        is_completed=False
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    return {
        "message": "Action item created successfully",
        "action": {
            "id": item.id,
            "title": item.title,
            "urgency": item.urgency,
            "due_hint": item.due_hint,
            "call_mode": payload.mode or "Student"
        }
    }


@router.delete("/actions/{action_id}")
def delete_action(action_id: int, db: Session = Depends(get_db)):
    item = db.query(ActionItem).filter(ActionItem.id == action_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")

    db.delete(item)
    db.commit()
    return {"message": f"Action {action_id} deleted successfully"}


# --------------------------------------------------
# 6. Caller Profiles & KIRA Memory Dossier
# --------------------------------------------------

@router.get("/callers")
def get_callers(mode: Optional[str] = None, db: Session = Depends(get_db)):
    callers = db.query(Caller).order_by(desc(Caller.created_at)).all()
    results = []

    for caller in callers:
        calls_query = db.query(Call).filter(Call.caller_id == caller.id).order_by(desc(Call.started_at))
        all_calls = calls_query.all()
        if mode and mode != "all":
            matching_calls = [c for c in all_calls if c.mode == mode]
            if not matching_calls:
                continue
            calls = matching_calls
        else:
            calls = all_calls

        last_call = calls[0] if calls else None
        modes_contacted = list(set(c.mode for c in all_calls if c.mode))

        results.append({
            "id": caller.id,
            "name": caller.name or "Guest Caller",
            "phone": caller.phone,
            "email": caller.email,
            "company_or_org": caller.company_or_org,
            "registered_mode": getattr(caller, "registered_mode", None) or (modes_contacted[0] if modes_contacted else "Student"),
            "is_vip": bool(getattr(caller, "is_vip", False)),
            "memory_notes": caller.memory_notes,
            "total_calls": len(all_calls),
            "modes": modes_contacted or ["Student"],
            "last_mode": last_call.mode if last_call else (modes_contacted[0] if modes_contacted else "Student"),
            "last_call_at": last_call.started_at if last_call else None,
            "last_call_purpose": last_call.purpose if last_call else None,
            "last_call_type": last_call.call_type if last_call else None
        })

    return {
        "mode": mode or "all",
        "total_callers": len(results),
        "callers": results
    }


@router.post("/callers/register")
def register_caller(payload: RegisterCallerRequest, db: Session = Depends(get_db)):
    org = db.query(Organization).first()
    if not org:
        org = Organization(name="Keerthana's Desk", email="keerthana@example.com")
        db.add(org)
        db.commit()
        db.refresh(org)

    clean_phone = payload.phone.strip()
    clean_name = payload.name.strip()
    clean_mode = payload.registered_mode.strip()

    if not clean_phone:
        raise HTTPException(status_code=400, detail="Phone number is required")
    if not clean_name:
        raise HTTPException(status_code=400, detail="Caller name is required")

    caller = db.query(Caller).filter(Caller.phone == clean_phone).first()
    if caller:
        caller.name = clean_name
        caller.registered_mode = clean_mode
        if payload.email:
            caller.email = payload.email.strip()
        if payload.company_or_org:
            caller.company_or_org = payload.company_or_org.strip()
        db.commit()
        db.refresh(caller)
    else:
        caller = Caller(
            organization_id=org.id,
            name=clean_name,
            phone=clean_phone,
            email=payload.email.strip() if payload.email else None,
            company_or_org=payload.company_or_org.strip() if payload.company_or_org else None,
            registered_mode=clean_mode,
            memory_notes=""
        )
        db.add(caller)
        db.commit()
        db.refresh(caller)

    return {
        "success": True,
        "message": f"Caller {caller.name} registered under {caller.registered_mode} desk.",
        "caller": {
            "id": caller.id,
            "name": caller.name,
            "phone": caller.phone,
            "email": caller.email,
            "company_or_org": caller.company_or_org,
            "registered_mode": caller.registered_mode,
            "is_vip": bool(getattr(caller, "is_vip", False))
        }
    }


@router.patch("/callers/{caller_id}")
def update_caller(caller_id: int, payload: UpdateCallerRequest, db: Session = Depends(get_db)):
    caller = db.query(Caller).filter(Caller.id == caller_id).first()
    if not caller:
        raise HTTPException(status_code=404, detail="Caller not found")

    if payload.name is not None:
        clean_name = payload.name.strip()
        if clean_name:
            caller.name = clean_name
    if payload.email is not None:
        caller.email = payload.email.strip() if payload.email.strip() else None
    if payload.company_or_org is not None:
        caller.company_or_org = payload.company_or_org.strip() if payload.company_or_org.strip() else None
    if payload.memory_notes is not None:
        caller.memory_notes = payload.memory_notes.strip()
    if payload.registered_mode is not None:
        caller.registered_mode = payload.registered_mode.strip()
    if payload.is_vip is not None:
        caller.is_vip = bool(payload.is_vip)

    db.commit()
    db.refresh(caller)

    return {
        "success": True,
        "message": f"Caller {caller.name} updated successfully.",
        "caller": {
            "id": caller.id,
            "name": caller.name,
            "phone": caller.phone,
            "email": caller.email,
            "company_or_org": caller.company_or_org,
            "registered_mode": caller.registered_mode,
            "memory_notes": caller.memory_notes,
            "is_vip": bool(getattr(caller, "is_vip", False))
        }
    }


@router.delete("/callers/{caller_id}")
def delete_caller(caller_id: int, db: Session = Depends(get_db)):
    caller = db.query(Caller).filter(Caller.id == caller_id).first()
    if not caller:
        raise HTTPException(status_code=404, detail="Caller not found")

    calls = db.query(Call).filter(Call.caller_id == caller_id).all()
    for c in calls:
        db.query(Message).filter(Message.call_id == c.id).delete()
        db.query(CallSummary).filter(CallSummary.call_id == c.id).delete()
        db.query(ActionItem).filter(ActionItem.call_id == c.id).delete()
        db.delete(c)

    caller_name = caller.name
    db.delete(caller)
    db.commit()

    return {"message": f"Caller {caller_name} deleted successfully"}


# --------------------------------------------------
# 7. Executive Dashboard Analytics
# --------------------------------------------------

@router.get("/analytics")
def get_analytics(mode: Optional[str] = None, db: Session = Depends(get_db)):
    all_calls = db.query(Call).all()

    # Breakdown of calls by persona mode
    modes_distribution = {
        "Student": sum(1 for c in all_calls if c.mode == "Student"),
        "Freelancer": sum(1 for c in all_calls if c.mode == "Freelancer"),
        "Small Business": sum(1 for c in all_calls if c.mode == "Small Business"),
        "Professional": sum(1 for c in all_calls if c.mode == "Professional")
    }

    if mode and mode != "all":
        calls = [c for c in all_calls if c.mode == mode]
    else:
        calls = all_calls

    call_ids = [c.id for c in calls]
    summaries = db.query(CallSummary).filter(CallSummary.call_id.in_(call_ids)).all() if call_ids else []
    actions = db.query(ActionItem).filter(ActionItem.call_id.in_(call_ids)).all() if call_ids else []
    caller_ids = set(c.caller_id for c in calls)

    total_calls = len(calls)
    completed_calls = sum(1 for c in calls if c.status == "completed")
    in_progress_calls = sum(1 for c in calls if c.status == "in_progress")

    # Urgency breakdown
    urgency_counts = {"high": 0, "medium": 0, "low": 0}
    for s in summaries:
        u = (s.urgency or "medium").lower()
        if u in urgency_counts:
            urgency_counts[u] += 1
        else:
            urgency_counts["medium"] += 1

    # Call type breakdown
    type_counts = {}
    for c in calls:
        t = c.call_type or "General Inquiry"
        type_counts[t] = type_counts.get(t, 0) + 1

    # Action items
    pending_actions = sum(1 for a in actions if not a.is_completed)

    return {
        "active_mode": mode or "all",
        "total_calls": total_calls,
        "completed_calls": completed_calls,
        "in_progress_calls": in_progress_calls,
        "total_callers": len(caller_ids),
        "pending_actions": pending_actions,
        "urgency_breakdown": urgency_counts,
        "type_breakdown": type_counts,
        "modes_distribution": modes_distribution
    }


# --------------------------------------------------
# 8. Ask KIRA About Your Calls (AI Query Assistant + Voice Output)
# --------------------------------------------------

class SpeakRequest(BaseModel):
    text: str
    language: Optional[str] = "English"


@router.post("/assistant/ask")
async def ask_assistant(payload: AskKiraRequest, db: Session = Depends(get_db)):
    if not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    query = db.query(Call).order_by(desc(Call.started_at))
    if payload.mode and payload.mode != "all":
        mode_calls = query.filter(Call.mode == payload.mode).limit(30).all()
        calls = mode_calls if mode_calls else query.limit(30).all()
    else:
        calls = query.limit(30).all()

    calls_context = []
    for c in calls:
        caller = c.caller
        summary = c.summary

        key_pts = []
        if summary and summary.key_points:
            try:
                key_pts = json.loads(summary.key_points)
            except Exception:
                key_pts = [summary.key_points]

        calls_context.append({
            "caller_name": caller.name if caller else "Unknown",
            "phone": caller.phone if caller else "",
            "call_type": c.call_type,
            "urgency": summary.urgency if summary else "medium",
            "started_at": c.started_at.strftime("%b %d, %Y at %I:%M %p") if c.started_at else "",
            "summary": summary.summary if summary else (c.purpose or "No details"),
            "action_required": summary.action_required if summary else "None",
            "key_points": key_pts
        })

    answer = ask_kira_about_calls(payload.question, calls_context, mode=payload.mode or "Student")

    # Synthesize natural voice audio response using Edge-TTS
    audio_base64 = ""
    output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3").name
    try:
        await text_to_speech(answer, output_path)
        with open(output_path, "rb") as f:
            audio_base64 = base64.b64encode(f.read()).decode("utf-8")
    except Exception as e:
        print(f"TTS synthesis warning: {e}")
    finally:
        if os.path.exists(output_path):
            try:
                os.remove(output_path)
            except Exception:
                pass

    return {
        "question": payload.question,
        "mode": payload.mode or "Student",
        "answer": answer,
        "audio_base64": audio_base64,
        "total_calls_analyzed": len(calls_context)
    }


# --------------------------------------------------
# 9. Voice Synthesizer Endpoint (Speak Any Summary/Text)
# --------------------------------------------------

@router.post("/assistant/speak")
async def speak_text(payload: SpeakRequest):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3").name
    audio_base64 = ""
    try:
        await text_to_speech(payload.text, output_path, language=payload.language or "English")
        with open(output_path, "rb") as f:
            audio_base64 = base64.b64encode(f.read()).decode("utf-8")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS synthesis failed: {e}")
    finally:
        if os.path.exists(output_path):
            try:
                os.remove(output_path)
            except Exception:
                pass

    return {
        "audio_base64": audio_base64
    }
