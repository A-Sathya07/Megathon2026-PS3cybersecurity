import os
from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


class Config:
    SECRET_KEY = os.environ.get("FLASK_SECRET", "dev-fallback-change-me")
    SESSION_PERMANENT = True
    PERMANENT_SESSION_LIFETIME = 60 * 60 * 24 * 7  # 7 days
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"