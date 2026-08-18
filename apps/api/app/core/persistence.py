"""
Store snapshot persistence via Supabase Storage.

Real user data (listings, requirements, lots, evidence, companies, users, matches,
acceptance_specs) is serialised to a single JSON file in a Supabase Storage bucket and
reloaded when the server restarts. This means user data survives:
  * Render free-tier service spin-downs and wake-ups
  * Code pushes / redeploys that restart the process

The bucket (BUCKET_NAME) is created automatically on first startup.
All writes are fire-and-forget - a failure to persist never surfaces to the user.
"""
from __future__ import annotations

import json
import logging
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

BUCKET_NAME = "circularmatch-store"
SNAPSHOT_KEY = "demo_store_snapshot.json"


def _base_headers() -> dict[str, str]:
    key = settings.supabase_service_role_key or ""
    return {
        "Authorization": f"Bearer {key}",
        "apikey": key,
    }


def _snapshot_url() -> str:
    return f"{settings.supabase_url}/storage/v1/object/{BUCKET_NAME}/{SNAPSHOT_KEY}"


def _bucket_url() -> str:
    return f"{settings.supabase_url}/storage/v1/bucket"


def _available() -> bool:
    return bool(settings.supabase_url and settings.supabase_service_role_key)


def ensure_bucket() -> None:
    if not _available():
        logger.warning(
            "Persistence: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. "
            "User data will be lost on server restart."
        )
        return
    try:
        with httpx.Client(timeout=10) as client:
            resp = client.post(
                _bucket_url(),
                json={"id": BUCKET_NAME, "name": BUCKET_NAME, "public": False},
                headers=_base_headers(),
            )
        if resp.status_code in (200, 201):
            logger.info("Persistence: bucket '%s' created.", BUCKET_NAME)
        elif resp.status_code == 400 and "already" in (resp.text or "").lower():
            pass
        else:
            logger.debug("Persistence: bucket check returned %s: %s", resp.status_code, resp.text[:200])
    except Exception as exc:
        logger.warning("Persistence: could not verify/create bucket: %s", exc)


def load_snapshot() -> dict[str, Any] | None:
    if not _available():
        return None
    try:
        with httpx.Client(timeout=10) as client:
            resp = client.get(_snapshot_url(), headers=_base_headers())
        if resp.status_code == 200:
            snapshot: dict[str, Any] = resp.json()
            logger.info(
                "Persistence: snapshot loaded - %d listings, %d requirements, %d companies.",
                len(snapshot.get("listings", [])),
                len(snapshot.get("requirements", [])),
                len(snapshot.get("companies", [])),
            )
            return snapshot
        elif resp.status_code in (404, 400):
            logger.info("Persistence: no snapshot found - starting with seed data only.")
            return None
        else:
            logger.warning("Persistence: unexpected status %s loading snapshot.", resp.status_code)
            return None
    except Exception as exc:
        logger.warning("Persistence: could not load snapshot - %s. Continuing with seed data.", exc)
        return None


def save_snapshot(data: dict[str, Any]) -> None:
    if not _available():
        return
    try:
        payload = json.dumps(data, default=str).encode()
        with httpx.Client(timeout=12) as client:
            resp = client.put(
                _snapshot_url(),
                content=payload,
                headers={
                    **_base_headers(),
                    "Content-Type": "application/json",
                    "x-upsert": "true",
                },
            )
        if resp.status_code not in (200, 201, 204):
            logger.warning("Persistence: snapshot save returned %s: %s", resp.status_code, resp.text[:200])
        else:
            logger.debug("Persistence: snapshot saved (%d bytes).", len(payload))
    except Exception as exc:
        logger.warning("Persistence: could not save snapshot - %s.", exc)
