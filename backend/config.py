import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SECRET_KEY = os.environ.get("SUPABASE_SECRET_KEY")

print("Supabase URL loaded:", bool(SUPABASE_URL))
print("Supabase secret key loaded:", bool(SUPABASE_SECRET_KEY))

if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL is missing from backend/.env")

if not SUPABASE_SECRET_KEY:
    raise RuntimeError("SUPABASE_SECRET_KEY is missing from backend/.env")

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_SECRET_KEY
)


class Config:
    SECRET_KEY = os.environ.get(
        "FLASK_SECRET",
        "dev-fallback-change-me"
    )

    SESSION_PERMANENT = True
    PERMANENT_SESSION_LIFETIME = 60 * 60 * 24 * 7

    SESSION_COOKIE_NAME = "ragshield_session"
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SECURE = False
    SESSION_COOKIE_SAMESITE = "Lax"