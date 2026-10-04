import hashlib
import secrets
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.database.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


# --------------------------------------------------
# Password Hashing & Verification (PBKDF2-HMAC-SHA256)
# --------------------------------------------------

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100_000
    )
    return f"{salt}${key.hex()}"


def verify_password(stored_hash: str, provided_password: str) -> bool:
    try:
        salt, key_hex = stored_hash.split("$")
        key = hashlib.pbkdf2_hmac(
            "sha256",
            provided_password.encode("utf-8"),
            salt.encode("utf-8"),
            100_000
        )
        return secrets.compare_digest(key.hex(), key_hex)
    except Exception:
        return False


# --------------------------------------------------
# Database Dependency
# --------------------------------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --------------------------------------------------
# Request & Response Schemas
# --------------------------------------------------

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "owner"


class LoginRequest(BaseModel):
    email: str
    password: str


# --------------------------------------------------
# Seed Default Account for Keerthana
# --------------------------------------------------

def seed_default_user_if_needed():
    db = SessionLocal()
    try:
        default_user = db.query(User).filter(User.email == "keerthana@kira.ai").first()
        if not default_user:
            new_user = User(
                name="Keerthana Sangam",
                email="keerthana@kira.ai",
                password_hash=hash_password("kira123"),
                role="owner"
            )
            db.add(new_user)
            db.commit()
            print("Seeded default owner account: keerthana@kira.ai")
    except Exception as e:
        print(f"Seed user notice: {e}")
    finally:
        db.close()

try:
    seed_default_user_if_needed()
except Exception:
    pass


# --------------------------------------------------
# 1. Register New User
# --------------------------------------------------

@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    clean_name = payload.name.strip()

    if not clean_name:
        raise HTTPException(status_code=400, detail="Name cannot be empty")
    if not clean_email or "@" not in clean_email:
        raise HTTPException(status_code=400, detail="Valid email is required")
    if len(payload.password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters")

    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    hashed_pw = hash_password(payload.password)
    user = User(
        name=clean_name,
        email=clean_email,
        password_hash=hashed_pw,
        role=payload.role or "owner"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = f"kira_sess_{secrets.token_hex(24)}"
    return {
        "success": True,
        "message": f"Welcome, {user.name}! Account registered successfully.",
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }


# --------------------------------------------------
# 2. Login User
# --------------------------------------------------

@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()

    if not user or not verify_password(user.password_hash, payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = f"kira_sess_{secrets.token_hex(24)}"
    return {
        "success": True,
        "message": f"Welcome back, {user.name}!",
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }


# --------------------------------------------------
# 3. Get Current User (/auth/me)
# --------------------------------------------------

@router.get("/me")
def get_current_user(email: Optional[str] = None, db: Session = Depends(get_db)):
    if email:
        user = db.query(User).filter(User.email == email.strip().lower()).first()
        if user:
            return {
                "authenticated": True,
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "role": user.role
                }
            }

    # Fallback to first owner
    user = db.query(User).first()
    if user:
        return {
            "authenticated": True,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        }

    return {"authenticated": False, "user": None}
