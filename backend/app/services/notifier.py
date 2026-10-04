import json
import os
import httpx
from typing import Optional, Dict, Any
from datetime import datetime

SETTINGS_FILE = os.path.join(os.path.dirname(__file__), "notification_settings.json")

DEFAULT_SETTINGS = {
    "webhook_url": "",
    "telegram_bot_token": "",
    "telegram_chat_id": "",
    "whatsapp_phone": "",
    "alert_on_high_urgency": True,
    "alert_on_meetings": True,
    "enabled": True
}

def load_notification_settings() -> Dict[str, Any]:
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                merged = {**DEFAULT_SETTINGS, **data}
                return merged
        except Exception as e:
            print(f"Failed to read notification settings: {e}")
    return DEFAULT_SETTINGS.copy()

def save_notification_settings(settings: Dict[str, Any]) -> Dict[str, Any]:
    current = load_notification_settings()
    current.update(settings)
    try:
        with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
            json.dump(current, f, indent=2)
    except Exception as e:
        print(f"Failed to save notification settings: {e}")
    return current

async def dispatch_call_alert(call_summary: Dict[str, Any], caller_info: Dict[str, Any], desk_mode: str = "Student") -> Dict[str, Any]:
    """
    Dispatches instant notification to configured channels (Webhook, Telegram, etc.)
    when a call is high-urgency or requires immediate attention.
    """
    settings = load_notification_settings()
    if not settings.get("enabled", True):
        return {"dispatched": False, "reason": "Notifications disabled"}

    urgency = str(call_summary.get("urgency", "medium")).lower()
    meeting = bool(call_summary.get("meeting_detected", False))
    is_spam = bool(call_summary.get("is_spam", False))

    if is_spam:
        return {"dispatched": False, "reason": "Spam screened, no alert needed"}

    should_alert = False
    if urgency == "high" and settings.get("alert_on_high_urgency", True):
        should_alert = True
    if meeting and settings.get("alert_on_meetings", True):
        should_alert = True

    if not should_alert:
        return {"dispatched": False, "reason": "Call urgency did not meet alert threshold"}

    caller_name = caller_info.get("name") or "Unknown Caller"
    caller_phone = caller_info.get("phone") or "No phone"
    action = call_summary.get("action_required") or "Review call message."
    summary_text = call_summary.get("summary") or "New recorded call."
    due_hint = call_summary.get("suggested_follow_up") or "Today"

    # Executive alert text
    alert_title = f"🚨 KIRA Priority Alert • {desk_mode} Desk"
    alert_message = (
        f"*{alert_title}*\n\n"
        f"👤 *Caller*: {caller_name} (`{caller_phone}`)\n"
        f"📋 *Summary*: {summary_text}\n"
        f"⚡ *Action Required*: {action}\n"
        f"⏱️ *Timeline*: {due_hint}\n"
    )
    if meeting:
        alert_message += f"📅 *Meeting Detected*: {call_summary.get('meeting_details') or 'Yes'}\n"

    payload = {
        "event": "kira_call_alert",
        "timestamp": datetime.utcnow().isoformat(),
        "desk_mode": desk_mode,
        "urgency": urgency,
        "meeting_detected": meeting,
        "caller": {
            "name": caller_name,
            "phone": caller_phone
        },
        "summary": summary_text,
        "action_required": action,
        "due_hint": due_hint,
        "raw_text": alert_message
    }

    results = {"dispatched": True, "channels": []}

    # 1. Custom Webhook Dispatch
    webhook_url = settings.get("webhook_url", "").strip()
    if webhook_url:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(webhook_url, json=payload)
                results["channels"].append({
                    "channel": "webhook",
                    "status": "success" if resp.is_success else f"HTTP {resp.status_code}"
                })
        except Exception as e:
            results["channels"].append({"channel": "webhook", "status": f"error: {str(e)}"})

    # 2. Telegram Bot Dispatch
    tg_token = settings.get("telegram_bot_token", "").strip()
    tg_chat_id = settings.get("telegram_chat_id", "").strip()
    if tg_token and tg_chat_id:
        try:
            tg_url = f"https://api.telegram.org/bot{tg_token}/sendMessage"
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(tg_url, json={
                    "chat_id": tg_chat_id,
                    "text": alert_message,
                    "parse_mode": "Markdown"
                })
                results["channels"].append({
                    "channel": "telegram",
                    "status": "success" if resp.is_success else f"HTTP {resp.status_code}"
                })
        except Exception as e:
            results["channels"].append({"channel": "telegram", "status": f"error: {str(e)}"})

    print(f"KIRA Alert Dispatched [{desk_mode} Desk] -> {results}")
    return results

async def send_test_alert() -> Dict[str, Any]:
    mock_summary = {
        "summary": "This is a simulated urgent alert from KIRA to verify your notification integration.",
        "action_required": "Confirm test notification delivery in your alert channel.",
        "urgency": "high",
        "meeting_detected": True,
        "meeting_details": "Test Sync tomorrow at 10:00 AM",
        "suggested_follow_up": "Immediate"
    }
    mock_caller = {
        "name": "KIRA Autonomous Agent",
        "phone": "+91 90000 00000"
    }
    return await dispatch_call_alert(mock_summary, mock_caller, desk_mode="Executive Desk")
