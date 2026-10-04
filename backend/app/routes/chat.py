import os
import base64
import tempfile
import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.database.models import Call, Message, CallSummary, ActionItem

from app.schemas.chat_schema import ChatRequest

from app.services.kira_agent import (
    generate_kira_response,
    generate_call_summary
)
from app.services.voice_service import text_to_speech


router = APIRouter(
    prefix="/calls",
    tags=["KIRA Chat"]
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
# Chat with KIRA
# --------------------------------------------------

@router.post("/{call_id}/chat")
async def chat_with_kira(
    call_id: int,
    request: ChatRequest,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # 1. Check whether the call exists
    # --------------------------------------------------

    call = (
        db.query(Call)
        .filter(Call.id == call_id)
        .first()
    )

    if not call:
        raise HTTPException(
            status_code=404,
            detail="Call not found"
        )

    # --------------------------------------------------
    # 2. Check whether call is already completed
    # --------------------------------------------------

    if call.status == "completed":
        raise HTTPException(
            status_code=400,
            detail="This call has already been completed."
        )

    # --------------------------------------------------
    # 3. Save caller's message
    # --------------------------------------------------

    caller_message = Message(
        call_id=call_id,
        speaker="caller",
        content=request.message
    )

    db.add(caller_message)
    db.commit()
    db.refresh(caller_message)

    # --------------------------------------------------
    # 4. Get entire conversation
    # --------------------------------------------------

    messages = (
        db.query(Message)
        .filter(Message.call_id == call_id)
        .order_by(Message.timestamp.asc())
        .all()
    )

    conversation = []

    for message in messages:

        conversation.append({
            "speaker": message.speaker,
            "content": message.content
        })

    # --------------------------------------------------
    # 5. Generate KIRA response with caller context & mode
    # --------------------------------------------------

    caller_context = None
    if call.caller:
        prior_count = db.query(Call).filter(Call.caller_id == call.caller.id).count()
        caller_context = {
            "name": call.caller.name,
            "calls_count": prior_count,
            "memory_notes": call.caller.memory_notes or "",
            "is_returning": prior_count > 1
        }

    try:
        kira_response = generate_kira_response(
            conversation,
            mode=call.mode or "Student",
            caller_context=caller_context
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"KIRA AI error: {str(e)}"
        )

    # --------------------------------------------------
    # 6. Save KIRA response
    # --------------------------------------------------

    kira_message = Message(
        call_id=call_id,
        speaker="kira",
        content=kira_response
    )

    db.add(kira_message)
    db.commit()
    db.refresh(kira_message)

    # --------------------------------------------------
    # 7. Check if caller wants to end the conversation
    # --------------------------------------------------

    ending_phrases = [
        "that's all",
        "that is all",
        "nothing else",
        "no that's it",
        "no, that's it",
        "that's it",
        "that is it",
        "no more",
        "goodbye",
        "bye",
        "thanks, bye",
        "thank you, bye",
        "please ask keerthana to contact me",
        "please tell keerthana to contact me",
        "ask keerthana to contact me",
        "tell keerthana to contact me"
    ]

    caller_text = request.message.lower().strip()

    should_complete = any(
        phrase in caller_text
        for phrase in ending_phrases
    )

    # --------------------------------------------------
    # 8. Generate automatic summary if conversation ends
    # --------------------------------------------------

    summary_data = None

    if should_complete:

        # Get latest complete conversation
        messages = (
            db.query(Message)
            .filter(Message.call_id == call_id)
            .order_by(Message.timestamp.asc())
            .all()
        )

        conversation = []

        for message in messages:

            conversation.append({
                "speaker": message.speaker,
                "content": message.content
            })

        try:

            summary_data = generate_call_summary(
                conversation,
                mode=call.mode or "Student"
            )

        except Exception as e:

            raise HTTPException(
                status_code=500,
                detail=f"Summary generation error: {str(e)}"
            )

        call.call_type = summary_data.get("call_type", "General Inquiry")

        # --------------------------------------------------
        # Check whether summary already exists
        # --------------------------------------------------

        existing_summary = (
            db.query(CallSummary)
            .filter(
                CallSummary.call_id == call_id
            )
            .first()
        )

        if not existing_summary:

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

        # Create ActionItem
        action_item = ActionItem(
            call_id=call.id,
            caller_id=call.caller_id,
            title=summary_data.get("action_required") or "Follow up with caller",
            description=summary_data.get("summary", ""),
            urgency=summary_data.get("urgency", "medium"),
            due_hint=summary_data.get("suggested_follow_up", "Today"),
            is_completed=False
        )
        db.add(action_item)

        # Update caller memory
        if call.caller and summary_data.get("caller_memory_update"):
            mem_update = summary_data["caller_memory_update"].strip()
            if mem_update:
                existing_notes = call.caller.memory_notes or ""
                if mem_update not in existing_notes:
                    call.caller.memory_notes = (existing_notes + " • " + mem_update).strip(" •")

        # --------------------------------------------------
        # Mark call as completed
        # --------------------------------------------------

        call.status = "completed"
        call.ended_at = datetime.utcnow()
        db.commit()

    # --------------------------------------------------
    # 9. Return response with audio voice synthesis
    # --------------------------------------------------

    audio_base64 = ""
    output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3").name
    try:
        await text_to_speech(kira_response, output_path)
        with open(output_path, "rb") as f:
            audio_base64 = base64.b64encode(f.read()).decode("utf-8")
    except Exception as e:
        print(f"Chat TTS warning: {e}")
    finally:
        if os.path.exists(output_path):
            try:
                os.remove(output_path)
            except Exception:
                pass

    response = {
        "call_id": call_id,
        "caller_message": request.message,
        "kira_response": kira_response,
        "message_id": kira_message.id,
        "audio_base64": audio_base64
    }

    # --------------------------------------------------
    # 10. Include summary when call is completed
    # --------------------------------------------------

    if should_complete and summary_data:

        response["call_status"] = "completed"

        response["summary"] = {
            "summary": summary_data["summary"],
            "requested_action": summary_data[
                "requested_action"
            ],
            "urgency": summary_data["urgency"]
        }

    else:

        response["call_status"] = call.status

    return response