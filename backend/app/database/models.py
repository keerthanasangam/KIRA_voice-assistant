from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from app.database.database import Base


# --------------------------------------------------
# User (Executive / Owner Account)
# --------------------------------------------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="owner", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# --------------------------------------------------
# Organization
# --------------------------------------------------

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(30), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    callers = relationship("Caller", back_populates="organization")


# --------------------------------------------------
# Caller
# --------------------------------------------------

class Caller(Base):
    __tablename__ = "callers"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    name = Column(String(150), nullable=True)
    phone = Column(String(30), nullable=False)
    email = Column(String(255), nullable=True)
    company_or_org = Column(String(150), nullable=True)
    registered_mode = Column(String(50), default="Student", nullable=True)  # Student, Freelancer, Small Business, Professional
    is_vip = Column(Boolean, default=False, nullable=True)
    memory_notes = Column(Text, default="", nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="callers")
    calls = relationship("Call", back_populates="caller", cascade="all, delete-orphan")
    action_items = relationship("ActionItem", back_populates="caller")


# --------------------------------------------------
# Call
# --------------------------------------------------

class Call(Base):
    __tablename__ = "calls"

    id = Column(Integer, primary_key=True, index=True)
    caller_id = Column(Integer, ForeignKey("callers.id"), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="received")  # received, in_progress, completed
    purpose = Column(String(255), nullable=True)
    call_type = Column(String(50), default="General Inquiry")  # Internship, Project, Collaboration, College, Meeting, Personal, Lead, General Inquiry
    mode = Column(String(50), default="Student")  # Student, Freelancer, Small Business, Professional
    language = Column(String(30), default="English")  # English, Telugu, Hindi
    is_spam = Column(Boolean, default=False)

    caller = relationship("Caller", back_populates="calls")
    messages = relationship("Message", back_populates="call", cascade="all, delete-orphan")
    summary = relationship("CallSummary", back_populates="call", uselist=False, cascade="all, delete-orphan")
    action_items = relationship("ActionItem", back_populates="call", cascade="all, delete-orphan")


# --------------------------------------------------
# Message
# --------------------------------------------------

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey("calls.id"), nullable=False)
    speaker = Column(String(20), nullable=False)  # caller, kira
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    call = relationship("Call", back_populates="messages")


# --------------------------------------------------
# Call Summary
# --------------------------------------------------

class CallSummary(Base):
    __tablename__ = "call_summaries"

    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey("calls.id"), nullable=False, unique=True)
    summary = Column(Text, nullable=False)
    requested_action = Column(Text, nullable=True)
    action_required = Column(Text, nullable=True)
    key_points = Column(Text, nullable=True)  # JSON string of bullet points
    suggested_follow_up = Column(String(50), default="This week", nullable=True)
    urgency = Column(String(30), default="medium")  # high, medium, low
    meeting_detected = Column(Boolean, default=False)
    meeting_details = Column(Text, nullable=True)  # JSON string
    lead_info = Column(Text, nullable=True)  # JSON string (budget, timeline)
    created_at = Column(DateTime, default=datetime.utcnow)

    call = relationship("Call", back_populates="summary")


# --------------------------------------------------
# Action Item (Tasks for Keerthana)
# --------------------------------------------------

class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey("calls.id"), nullable=True)
    caller_id = Column(Integer, ForeignKey("callers.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    urgency = Column(String(20), default="medium")  # high, medium, low
    due_hint = Column(String(50), default="Today")
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    call = relationship("Call", back_populates="action_items")
    caller = relationship("Caller", back_populates="action_items")