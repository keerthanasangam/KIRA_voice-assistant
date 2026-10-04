import os
import json
import asyncio
import tempfile
from urllib.parse import quote
from datetime import datetime

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Depends,
    BackgroundTasks
)

from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.database.models import (
    Call,
    Message,
    CallSummary,
    ActionItem
)

from app.services.voice_service import (
    transcribe_audio,
    text_to_speech
)

from app.services.kira_agent import (
    generate_kira_response,
    generate_call_summary
)

from app.services.contact_utils import (
    extract_email,
    is_confirmation,
    is_rejection
)

from app.services.action_dispatcher import (
    detect_dispatch_intent,
    dispatch_in_call_action
)


def cleanup_temp_file(path: str):
    if path and os.path.exists(path):
        try:
            os.remove(path)
        except Exception:
            pass


# ==================================================
# KIRA VOICE ROUTER
# ==================================================

router = APIRouter(
    prefix="/voice",
    tags=["KIRA Voice"]
)


# ==================================================
# DATABASE
# ==================================================

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ==================================================
# PENDING EMAIL CONFIRMATIONS
# ==================================================

# Stores emails temporarily until the caller confirms them.
#
# Example:
# {
#     6: "raul1@gmail.com"
# }

pending_emails = {}


# ==================================================
# END CALL DETECTION
# ==================================================

def is_call_ending(text: str) -> bool:
    if not text:
        return False

    text = text.lower().strip()

    # Common phrases indicating caller is done, thanking, or wrapping up
    ending_phrases = [
        "thank you",
        "thanks",
        "thank u",
        "thank you so much",
        "thanks a lot",
        "ok thanks",
        "okay thanks",
        "ok thank you",
        "okay thank you",
        "no thank you",
        "no thanks",
        "that's all",
        "that is all",
        "that'll be all",
        "that will be all",
        "nothing else",
        "nothing more",
        "no that's it",
        "no, that's it",
        "that's it",
        "that is it",
        "no more",
        "goodbye",
        "bye",
        "bye bye",
        "take care",
        "see you",
        "done",
        "all done",
        "we are done",
        "i'm done",
        "please ask keerthana to contact me",
        "please tell keerthana to contact me",
        "ask keerthana to contact me",
        "tell keerthana to contact me",
        "have her call me",
        "ask her to call"
    ]

    return any(phrase in text for phrase in ending_phrases)


# ==================================================
# GET LAST KIRA MESSAGE
# ==================================================

def get_last_kira_message(
    db,
    call_id: int
):

    return (
        db.query(Message)
        .filter(
            Message.call_id == call_id,
            Message.speaker == "kira"
        )
        .order_by(
            Message.timestamp.desc()
        )
        .first()
    )


# ==================================================
# VOICE TEST
# ==================================================

@router.post("/test")
async def voice_test(
    audio: UploadFile = File(...)
):

    suffix = os.path.splitext(
        audio.filename or ".wav"
    )[1]

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    ) as temp_audio:

        audio_path = temp_audio.name

        content = await audio.read()

        temp_audio.write(content)

    output_path = None

    try:

        # -----------------------------------------
        # Speech → Text
        # -----------------------------------------

        caller_text = transcribe_audio(
            audio_path,
            "English"
        )

        if not caller_text or not caller_text.strip():
            caller_text = "(inaudible)"
            kira_text = "I didn't catch that clearly. Could you please repeat that?"
            output_path = tempfile.NamedTemporaryFile(
                delete=False,
                suffix=".mp3"
            ).name
            await text_to_speech(kira_text, output_path)
            return FileResponse(
                path=output_path,
                media_type="audio/mpeg",
                filename="kira_response.mp3"
            )

        caller_text = caller_text.strip()
        print("\n[CALLER]:")
        print(caller_text)


        # -----------------------------------------
        # KIRA response
        # -----------------------------------------

        conversation = [
            {
                "speaker": "caller",
                "content": caller_text
            }
        ]

        kira_text = generate_kira_response(
            conversation
        )

        print("\n[KIRA]:")
        print(kira_text)


        # -----------------------------------------
        # Text → Speech
        # -----------------------------------------

        output_path = tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".mp3"
        ).name

        await text_to_speech(
            kira_text,
            output_path
        )


        # -----------------------------------------
        # Return audio
        # -----------------------------------------

        return FileResponse(
            path=output_path,
            media_type="audio/mpeg",
            filename="kira_response.mp3"
        )


    finally:

        if os.path.exists(audio_path):

            try:
                os.remove(audio_path)

            except PermissionError:
                pass


# ==================================================
# REAL KIRA VOICE CALL
# ==================================================

@router.post("/{call_id}")
async def voice_call(
    call_id: int,
    audio: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):

    # ---------------------------------------------
    # 1. Find the call
    # ---------------------------------------------

    call = db.query(Call).filter(
        Call.id == call_id
    ).first()

    if not call:

        raise HTTPException(
            status_code=404,
            detail=f"Call {call_id} not found."
        )


    # ---------------------------------------------
    # 2. Check if call completed
    # ---------------------------------------------

    if call.status == "completed":

        raise HTTPException(
            status_code=400,
            detail="This call has already been completed."
        )


    # ---------------------------------------------
    # 3. Save uploaded audio
    # ---------------------------------------------

    suffix = os.path.splitext(
        audio.filename or ".wav"
    )[1]

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    ) as temp_audio:

        audio_path = temp_audio.name

        content = await audio.read()

        temp_audio.write(content)

    output_path = None

    try:

        # -----------------------------------------
        # 4. Whisper (Async non-blocking CPU thread)
        # -----------------------------------------
        call_lang = getattr(call, "language", None) or "English"
        call_mode = getattr(call, "mode", "Student") or "Student"

        caller_text = await asyncio.to_thread(
            transcribe_audio,
            audio_path,
            call_lang,
            call_mode
        )

        if not caller_text or not caller_text.strip():
            kira_text = "I didn't catch that clearly. Could you please repeat that?"
            output_path = tempfile.NamedTemporaryFile(
                delete=False,
                suffix=".mp3"
            ).name
            await text_to_speech(kira_text, output_path)
            if background_tasks:
                background_tasks.add_task(cleanup_temp_file, output_path)
            headers = {
                "x-caller-text": quote("".encode("utf-8")),
                "x-kira-text": quote(kira_text.encode("utf-8")),
                "x-call-status": call.status,
                "x-call-type": call.call_type or "General Inquiry"
            }
            return FileResponse(
                path=output_path,
                media_type="audio/mpeg",
                filename="kira_response.mp3",
                headers=headers
            )

        caller_text = caller_text.strip()
        print("\n[CALLER]:")
        print(caller_text)


        # -----------------------------------------
        # 5. Save caller message
        # -----------------------------------------

        caller_message = Message(
            call_id=call_id,
            speaker="caller",
            content=caller_text
        )

        db.add(caller_message)

        db.commit()

        db.refresh(caller_message)


        # -----------------------------------------
        # 6. Load conversation
        # -----------------------------------------

        messages = db.query(Message).filter(
            Message.call_id == call_id
        ).order_by(
            Message.timestamp
        ).all()

        conversation = []

        for message in messages:

            conversation.append({
                "speaker": message.speaker,
                "content": message.content
            })


        # -----------------------------------------
        # 7. Detect email
        # -----------------------------------------

        detected_email = extract_email(
            caller_text
        )


        # ==================================================
        # EMAIL FOUND
        # ==================================================

        if detected_email:

            print(
                f"\n[EMAIL DETECTED]: "
                f"{detected_email}"
            )

            # Store temporarily.
            # DO NOT save to database yet.
            pending_emails[call_id] = detected_email

            kira_text = (
                f"Just to confirm, did you say "
                f"{detected_email}? "
                "Please say yes if that's correct, "
                "or tell me the correct email address."
            )


        # ==================================================
        # CALLER CONFIRMS EMAIL
        # ==================================================

        elif is_confirmation(caller_text):

            pending_email = pending_emails.get(
                call_id
            )

            if pending_email:

                # -----------------------------------------
                # Save confirmed email to caller
                # -----------------------------------------

                if call.caller:

                    call.caller.email = pending_email

                    db.commit()

                    print(
                        f"\n[EMAIL CONFIRMED AND SAVED]:"
                    )

                    print(
                        pending_email
                    )


                # -----------------------------------------
                # Remove temporary email
                # -----------------------------------------

                pending_emails.pop(
                    call_id,
                    None
                )


                kira_text = (
                    "Perfect. I've recorded that "
                    "email address. Is there anything "
                    "else you'd like me to pass on "
                    "to Keerthana?"
                )


            else:
                caller_context = None
                if call.caller:
                    prior_count = db.query(Call).filter(Call.caller_id == call.caller.id).count()
                    caller_context = {
                        "name": call.caller.name,
                        "calls_count": prior_count,
                        "memory_notes": call.caller.memory_notes or "",
                        "is_vip": bool(getattr(call.caller, "is_vip", False))
                    }

                kira_text = generate_kira_response(
                    conversation,
                    mode=call.mode or "Student",
                    caller_context=caller_context
                )


        # ==================================================
        # CALLER REJECTS EMAIL
        # ==================================================

        elif is_rejection(caller_text):

            pending_email = pending_emails.get(
                call_id
            )

            if pending_email:

                # Remove incorrect email
                pending_emails.pop(
                    call_id,
                    None
                )

                kira_text = (
                    "No problem. Please tell me "
                    "your email address again, "
                    "slowly and clearly."
                )

            else:
                caller_context = None
                if call.caller:
                    prior_count = db.query(Call).filter(Call.caller_id == call.caller.id).count()
                    caller_context = {
                        "name": call.caller.name,
                        "calls_count": prior_count,
                        "memory_notes": call.caller.memory_notes or "",
                        "is_vip": bool(getattr(call.caller, "is_vip", False))
                    }

                kira_text = generate_kira_response(
                    conversation,
                    mode=call.mode or "Student",
                    caller_context=caller_context
                )


        # ==================================================
        # CALLER IS ENDING CALL / THANKING KIRA
        # ==================================================

        elif is_call_ending(caller_text):
            call_ending = True
            kira_text = "You're welcome! I've recorded your message and will notify Keerthana right away. Have a wonderful day, goodbye!"


        # ==================================================
        # NORMAL KIRA CONVERSATION
        # ==================================================

        else:
            call_ending = False
            caller_context = None
            if call.caller:
                prior_count = db.query(Call).filter(Call.caller_id == call.caller.id).count()
                caller_context = {
                    "name": call.caller.name,
                    "calls_count": prior_count,
                    "memory_notes": call.caller.memory_notes or "",
                    "is_vip": bool(getattr(call.caller, "is_vip", False))
                }

            kira_text = generate_kira_response(
                conversation,
                mode=call.mode or "Student",
                caller_context=caller_context
            )

        # -----------------------------------------
        # Check Autonomous In-Call Action Dispatch
        # -----------------------------------------
        action_dispatch_receipt = None
        matched_action = detect_dispatch_intent(caller_text, mode=call.mode or "Student")
        if matched_action:
            recipient_phone = call.caller.phone if (call.caller and call.caller.phone) else "+91 90000 12345"
            try:
                action_dispatch_receipt = dispatch_in_call_action(
                    action_type=matched_action["id"],
                    recipient_phone=recipient_phone,
                    call_id=call_id
                )
                if matched_action.get("announcement") and matched_action["announcement"] not in kira_text:
                    kira_text = f"{matched_action['announcement']} {kira_text}".strip()
            except Exception as e:
                print(f"[ACTION_DISPATCH] Error executing dispatch: {e}")

        print("\n[KIRA]:")
        print(kira_text)


        # -----------------------------------------
        # 8. Save KIRA message
        # -----------------------------------------

        kira_message = Message(
            call_id=call_id,
            speaker="kira",
            content=kira_text
        )

        db.add(kira_message)
        db.commit()
        db.refresh(kira_message)


        # -----------------------------------------
        # 9. Check if caller is ending call
        # -----------------------------------------

        if not call_ending:
            call_ending = is_call_ending(caller_text)


        # -----------------------------------------
        # 10. Generate summary if ending
        # -----------------------------------------

        summary_data = None

        if call_ending:

            print("\n[CALL END DETECTED]")

            # Reload full conversation
            messages = db.query(Message).filter(
                Message.call_id == call_id
            ).order_by(
                Message.timestamp
            ).all()

            conversation = [
                {"speaker": m.speaker, "content": m.content}
                for m in messages
            ]

            # Generate deep call summary & classification
            summary_data = generate_call_summary(
                conversation,
                mode=call.mode or "Student"
            )

            call.call_type = summary_data.get("call_type", "General Inquiry")

            # Check existing summary
            existing_summary = db.query(
                CallSummary
            ).filter(
                CallSummary.call_id == call_id
            ).first()

            if not existing_summary:
                new_summary = CallSummary(
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
                db.add(new_summary)

            # Create ActionItem for Keerthana
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

            # Update caller memory notes
            if call.caller and summary_data.get("caller_memory_update"):
                mem_update = summary_data["caller_memory_update"].strip()
                if mem_update:
                    curr_notes = call.caller.memory_notes or ""
                    if mem_update not in curr_notes:
                        call.caller.memory_notes = (curr_notes + " • " + mem_update).strip(" •")

            # Complete call
            call.status = "completed"
            call.ended_at = datetime.utcnow()
            db.commit()

            # Remove pending email if any
            pending_emails.pop(
                call_id,
                None
            )


        # -----------------------------------------
        # 11. Convert KIRA response to speech
        # -----------------------------------------

        output_path = tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".mp3"
        ).name

        await text_to_speech(
            kira_text,
            output_path
        )

        # Clean up temp mp3 after sending response
        if background_tasks:
            background_tasks.add_task(cleanup_temp_file, output_path)

        # -----------------------------------------
        # 12. Return KIRA audio with metadata headers
        # -----------------------------------------

        headers = {
            "x-caller-text": quote(caller_text.encode("utf-8")),
            "x-kira-text": quote(kira_text.encode("utf-8")),
            "x-call-status": call.status,
            "x-call-type": call.call_type or "General Inquiry"
        }
        if action_dispatch_receipt:
            headers["x-action-dispatched"] = quote(json.dumps(action_dispatch_receipt).encode("utf-8"))

        return FileResponse(
            path=output_path,
            media_type="audio/mpeg",
            filename="kira_response.mp3",
            headers=headers
        )


    finally:

        # -----------------------------------------
        # Delete caller audio
        # -----------------------------------------

        if os.path.exists(audio_path):

            try:
                os.remove(audio_path)

            except PermissionError:
                pass