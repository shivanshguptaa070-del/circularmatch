from __future__ import annotations

import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    app_name: str = "CircularMatch API"
    demo_mode: bool = os.getenv("DEMO_MODE", "true").lower() == "true"
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    gemini_api_key: str | None = os.getenv("GEMINI_API_KEY")
    supabase_url: str | None = os.getenv("SUPABASE_URL")
    supabase_anon_key: str | None = os.getenv("SUPABASE_ANON_KEY")
    supabase_service_role_key: str | None = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


settings = Settings()
