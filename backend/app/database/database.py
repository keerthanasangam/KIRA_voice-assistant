import os
from pathlib import Path
from urllib.parse import quote_plus

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


# --------------------------------------------------
# Load .env file
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[2]
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)


# --------------------------------------------------
# Database configuration & Connection URL
# --------------------------------------------------

# 1. Prefer direct DATABASE_URL if configured (e.g., Render, Neon, Supabase, Railway)
RAW_DATABASE_URL = os.getenv("DATABASE_URL")

if RAW_DATABASE_URL:
    # Ensure correct driver prefix for SQLAlchemy 2.x
    if RAW_DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = RAW_DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
    elif RAW_DATABASE_URL.startswith("postgresql://") and not RAW_DATABASE_URL.startswith("postgresql+psycopg2://"):
        DATABASE_URL = RAW_DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
    else:
        DATABASE_URL = RAW_DATABASE_URL
else:
    # 2. Fall back to individual components for local development
    DB_USER = os.getenv("DATABASE_USER")
    DB_PASSWORD = os.getenv("DATABASE_PASSWORD")
    DB_HOST = os.getenv("DATABASE_HOST", "localhost")
    DB_PORT = os.getenv("DATABASE_PORT", "5432")
    DB_NAME = os.getenv("DATABASE_NAME")

    if not DB_USER:
        raise ValueError("DATABASE_USER (or DATABASE_URL) is missing in .env")

    if not DB_PASSWORD:
        raise ValueError("DATABASE_PASSWORD (or DATABASE_URL) is missing in .env")

    if not DB_NAME:
        raise ValueError("DATABASE_NAME (or DATABASE_URL) is missing in .env")

    DATABASE_URL = (
        f"postgresql+psycopg2://"
        f"{DB_USER}:{quote_plus(DB_PASSWORD)}"
        f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )


# --------------------------------------------------
# SQLAlchemy engine with production connection pooling
# --------------------------------------------------

engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,       # Recovers automatically from dropped hosted connections
    pool_recycle=300,          # Recycles connections every 5 minutes
    pool_size=10,              # Production connection pool size
    max_overflow=20            # Burstable connections under load
)


# --------------------------------------------------
# Database session
# --------------------------------------------------

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# --------------------------------------------------
# Base class for database models
# --------------------------------------------------

Base = declarative_base()

def ensure_schema_migrations():
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE calls ADD COLUMN IF NOT EXISTS language VARCHAR(30) DEFAULT 'English';"))
            conn.execute(text("ALTER TABLE calls ADD COLUMN IF NOT EXISTS is_spam BOOLEAN DEFAULT FALSE;"))
            conn.execute(text("ALTER TABLE callers ADD COLUMN IF NOT EXISTS registered_mode VARCHAR(50) DEFAULT 'Student';"))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(150) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    role VARCHAR(50) DEFAULT 'owner',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))
            conn.commit()
    except Exception as e:
        print(f"Schema migration check: {e}")

try:
    ensure_schema_migrations()
except Exception:
    pass

# --------------------------------------------------
# Create database tables
# --------------------------------------------------

if __name__ == "__main__":
    from app.database.models import (
    Organization,
    Caller,
    Call,
    Message,
    CallSummary,
)
    try:
        Base.metadata.create_all(bind=engine)

        print("✅ KIRA successfully connected to PostgreSQL!")
        print("✅ Database:", DB_NAME)
        print("✅ Tables created successfully!")

    except Exception as e:
        print("❌ Database setup failed:")
        print(e)