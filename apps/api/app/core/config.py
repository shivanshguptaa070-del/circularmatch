from __future__ import annotations

import os
import sys
from dataclasses import dataclass, field

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    app_name: str = "CircularMatch API"
    demo_mode: bool = field(default_factory=lambda: os.getenv("DEMO_MODE", "true").lower() == "true")
    frontend_origin: str = field(default_factory=lambda: os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"))
    gemini_api_key: str | None = field(default_factory=lambda: os.getenv("GEMINI_API_KEY"))
    supabase_url: str | None = field(default_factory=lambda: os.getenv("SUPABASE_URL"))
    supabase_anon_key: str | None = field(default_factory=lambda: os.getenv("SUPABASE_ANON_KEY"))
    supabase_service_role_key: str | None = field(default_factory=lambda: os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
    # REQUIRED IN PRODUCTION: Supabase project JWT secret (Dashboard > API > JWT Secret).
    # Without this, token signatures are not verified — a critical security gap.
    supabase_jwt_secret: str | None = field(default_factory=lambda: os.getenv("SUPABASE_JWT_SECRET"))

    def validate_production(self) -> None:
        """
        Call this at startup. In production mode, abort if critical secrets are missing.
        This ensures the server never starts in an insecure state silently.
        """
        if self.demo_mode:
            return  # Demo mode allows missing secrets for local development

        errors: list[str] = []
        if not self.supabase_jwt_secret:
            errors.append("SUPABASE_JWT_SECRET is required in production (Supabase Dashboard > API > JWT Secret).")
        if not self.supabase_url:
            errors.append("SUPABASE_URL is required in production.")
        if not self.supabase_service_role_key:
            errors.append("SUPABASE_SERVICE_ROLE_KEY is required in production.")
        if self.frontend_origin == "http://localhost:5173":
            errors.append("FRONTEND_ORIGIN must be set to your production domain in production mode.")

        if errors:
            print("\n[CircularMatch] STARTUP ABORTED — missing critical production configuration:")
            for err in errors:
                print(f"  ✗ {err}")
            print("\nSet these environment variables and restart.\n")
            sys.exit(1)


settings = Settings()
