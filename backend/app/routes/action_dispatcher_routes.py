from typing import Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from app.services.action_dispatcher import (
    load_action_snippets,
    save_action_snippets,
    load_dispatch_history,
    dispatch_in_call_action,
    detect_dispatch_intent
)

router = APIRouter(prefix="/tools", tags=["Autonomous In-Call Action Dispatcher"])

class UpdateSnippetPayload(BaseModel):
    id: str
    title: Optional[str] = None
    channel: Optional[str] = None
    template: Optional[str] = None
    announcement: Optional[str] = None

class TestDispatchPayload(BaseModel):
    action_type: str
    recipient_phone: str
    custom_content: Optional[str] = None
    call_id: Optional[int] = None

class IntentCheckPayload(BaseModel):
    caller_speech: str
    mode: Optional[str] = "Student"

@router.get("/snippets")
def get_action_snippets():
    """
    Get all active in-call dispatch action templates (Delivery, Resume, Calendar, Pricing).
    """
    return {
        "success": True,
        "snippets": load_action_snippets()
    }

@router.post("/snippets")
def update_action_snippet(payload: UpdateSnippetPayload):
    """
    Update a personal snippet template (e.g. customized address, resume link, Calendly URL).
    """
    snippets = load_action_snippets()
    if payload.id not in snippets:
        raise HTTPException(status_code=404, detail=f"Snippet '{payload.id}' not found.")
    
    current = snippets[payload.id]
    if payload.title:
        current["title"] = payload.title
    if payload.channel:
        current["channel"] = payload.channel
    if payload.template:
        current["template"] = payload.template
    if payload.announcement:
        current["announcement"] = payload.announcement
    
    snippets[payload.id] = current
    save_action_snippets(snippets)
    
    return {
        "success": True,
        "message": f"Snippet '{payload.id}' updated successfully.",
        "snippet": current
    }

@router.post("/dispatch")
def trigger_action_dispatch(payload: TestDispatchPayload):
    """
    Triggers an in-call action dispatch via WhatsApp or SMS.
    """
    receipt = dispatch_in_call_action(
        action_type=payload.action_type,
        recipient_phone=payload.recipient_phone,
        call_id=payload.call_id,
        custom_content=payload.custom_content
    )
    return {
        "success": True,
        "receipt": receipt
    }

@router.get("/history")
def get_action_history():
    """
    Returns recent in-call tool execution history with delivery status.
    """
    return {
        "success": True,
        "history": load_dispatch_history()
    }

@router.post("/detect")
def check_intent(payload: IntentCheckPayload):
    """
    Checks if a caller speech string triggers an autonomous in-call dispatch.
    """
    matched = detect_dispatch_intent(payload.caller_speech, payload.mode or "Student")
    return {
        "has_action": bool(matched),
        "action": matched
    }
