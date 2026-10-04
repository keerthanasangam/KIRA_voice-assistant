import sys
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
        sys.stderr.reconfigure(encoding="utf-8", errors="backslashreplace")
    except Exception:
        pass

import logging
import os

# --------------------------------------------------
# Production Application Logging
# --------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("kira")

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.database import SessionLocal
from app.database.models import (
    Organization,
    Caller,
    Call,
    Message,
    CallSummary,
)

from app.routes.chat import router as chat_router
from app.routes.voice import router as voice_router
from app.routes.calls import router as calls_router
from app.routes.telephony import router as telephony_router
from app.routes.export import router as export_router
from app.routes.auth import router as auth_router
from app.routes.action_dispatcher_routes import router as action_dispatcher_router


# ==================================================
# KIRA AI Voice Agent
# ==================================================

app = FastAPI(
    title="KIRA AI Voice Agent",
    description="AI-powered intelligent voice communication platform",
    version="2.0.0"
)

# --------------------------------------------------
# Configurable Production CORS
# --------------------------------------------------
DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

env_cors = os.getenv("CORS_ORIGINS", "")
allowed_origins = list(DEFAULT_CORS_ORIGINS)
if env_cors:
    for origin in env_cors.split(","):
        clean_origin = origin.strip()
        if clean_origin and clean_origin not in allowed_origins:
            allowed_origins.append(clean_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=[
        "x-caller-text",
        "x-kira-text",
        "x-call-status",
        "x-call-type",
        "x-action-dispatched"
    ]
)

# --------------------------------------------------
# Global Error Handling (Masks raw traces in production)
# --------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log internal error with full traceback on the server only
    logger.error(f"Unhandled error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."}
    )

# ==================================================
# Register Routers
# ==================================================

app.include_router(auth_router)
app.include_router(calls_router)
app.include_router(chat_router)
app.include_router(voice_router)
app.include_router(telephony_router)
app.include_router(export_router)
app.include_router(action_dispatcher_router)


# ==================================================
# Database Dependency
# ==================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ==================================================
# Home
# ==================================================

@app.get("/")
def home():
    return {
        "message": "KIRA AI Voice Agent is running!",
        "status": "online"
    }


# ==================================================
# Health Check (Database + Service connectivity)
# ==================================================

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        logger.warning(f"Database health check ping failed: {e}")
        db_status = "disconnected"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "service": "KIRA AI Voice Agent",
        "version": "2.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }


# ==================================================
# Create Organization
# ==================================================

@app.post("/organizations")
def create_organization(
    name: str,
    email: str | None = None,
    phone: str | None = None,
    db: Session = Depends(get_db)
):

    organization = Organization(
        name=name,
        email=email,
        phone=phone
    )

    db.add(organization)
    db.commit()
    db.refresh(organization)

    return {
        "message": "Organization created successfully",
        "organization_id": organization.id,
        "name": organization.name,
        "email": organization.email,
        "phone": organization.phone
    }


# ==================================================
# Create Caller
# ==================================================

@app.post("/callers")
def create_caller(
    name: str,
    phone: str,
    organization_id: int,
    email: str | None = None,
    db: Session = Depends(get_db)
):

    # Check organization exists
    organization = (
        db.query(Organization)
        .filter(Organization.id == organization_id)
        .first()
    )

    if not organization:
        raise HTTPException(
            status_code=404,
            detail="Organization not found"
        )

    caller = Caller(
        name=name,
        phone=phone,
        email=email,
        organization_id=organization_id
    )

    db.add(caller)
    db.commit()
    db.refresh(caller)

    return {
        "message": "Caller created successfully",
        "caller_id": caller.id,
        "name": caller.name,
        "phone": caller.phone,
        "email": caller.email,
        "organization_id": caller.organization_id
    }


# ==================================================
# Create Call
# ==================================================

@app.post("/calls")
def create_call(
    caller_id: int,
    purpose: str | None = None,
    db: Session = Depends(get_db)
):

    # Check whether caller exists
    caller = (
        db.query(Caller)
        .filter(Caller.id == caller_id)
        .first()
    )

    if not caller:
        raise HTTPException(
            status_code=404,
            detail="Caller not found"
        )

    # Create new call
    call = Call(
        caller_id=caller_id,
        purpose=purpose,
        status="in_progress"
    )

    db.add(call)
    db.commit()
    db.refresh(call)

    return {
        "message": "Call created successfully",
        "call_id": call.id,
        "caller_id": call.caller_id,
        "status": call.status,
        "purpose": call.purpose,
        "started_at": call.started_at
    }


# ==================================================
# Add Manual Message
# ==================================================

@app.post("/calls/{call_id}/messages")
def add_message(
    call_id: int,
    speaker: str,
    content: str,
    db: Session = Depends(get_db)
):

    # Check whether call exists
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

    # Don't allow messages after completion
    if call.status == "completed":
        raise HTTPException(
            status_code=400,
            detail="This call has already been completed."
        )

    # Validate speaker
    if speaker not in ["caller", "kira"]:
        raise HTTPException(
            status_code=400,
            detail="Speaker must be 'caller' or 'kira'"
        )

    # Create message
    message = Message(
        call_id=call_id,
        speaker=speaker,
        content=content
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return {
        "message": "Message saved successfully",
        "message_id": message.id,
        "call_id": message.call_id,
        "speaker": message.speaker,
        "content": message.content,
        "timestamp": message.timestamp
    }


# ==================================================
# Create Call Summary
# ==================================================

@app.post("/calls/{call_id}/summary")
def create_call_summary(
    call_id: int,
    summary: str,
    requested_action: str | None = None,
    urgency: str | None = None,
    db: Session = Depends(get_db)
):

    # Check whether call exists
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

    # Check if summary already exists
    existing_summary = (
        db.query(CallSummary)
        .filter(CallSummary.call_id == call_id)
        .first()
    )

    if existing_summary:
        raise HTTPException(
            status_code=400,
            detail="Summary already exists for this call"
        )

    # Create summary
    call_summary = CallSummary(
        call_id=call_id,
        summary=summary,
        requested_action=requested_action,
        urgency=urgency
    )

    db.add(call_summary)

    # Mark call as completed
    call.status = "completed"

    # Record end time
    from datetime import datetime
    call.ended_at = datetime.utcnow()

    db.commit()
    db.refresh(call_summary)

    return {
        "message": "Call summary created successfully",
        "summary_id": call_summary.id,
        "call_id": call_summary.call_id,
        "summary": call_summary.summary,
        "requested_action": call_summary.requested_action,
        "urgency": call_summary.urgency,
        "call_status": call.status,
        "ended_at": call.ended_at
    }




@app.get("/calls/{call_id}/summary")
def get_call_summary(
    call_id: int,
    db: Session = Depends(get_db)
):
    call = db.query(Call).filter(Call.id == call_id).first()

    if not call:
        raise HTTPException(
            status_code=404,
            detail="Call not found"
        )

    summary = (
        db.query(CallSummary)
        .filter(CallSummary.call_id == call_id)
        .first()
    )

    if not summary:
        return {
            "call_id": call_id,
            "summary_available": False,
            "message": "Summary is not available for this call yet."
        }

    return {
        "call_id": call_id,
        "summary_available": True,
        "summary": summary.summary,
        "requested_action": summary.requested_action,
        "urgency": summary.urgency,
        "created_at": summary.created_at
    }