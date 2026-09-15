from __future__ import annotations

import logging
import uuid
from typing import Any
from fastapi import UploadFile, HTTPException, status
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

DOCUMENTS_BUCKET = "circularmatch-documents"

def _base_headers() -> dict[str, str]:
    key = settings.supabase_service_role_key or ""
    return {
        "Authorization": f"Bearer {key}",
        "apikey": key,
    }

def _bucket_url() -> str:
    return f"{settings.supabase_url}/storage/v1/bucket"

def _object_url(path: str) -> str:
    return f"{settings.supabase_url}/storage/v1/object/{DOCUMENTS_BUCKET}/{path}"

def _available() -> bool:
    return bool(settings.supabase_url and settings.supabase_service_role_key)

def ensure_documents_bucket() -> None:
    if not _available():
        logger.warning("Storage: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set.")
        return
    try:
        with httpx.Client(timeout=10) as client:
            resp = client.post(
                _bucket_url(),
                json={"id": DOCUMENTS_BUCKET, "name": DOCUMENTS_BUCKET, "public": False},
                headers=_base_headers(),
            )
        if resp.status_code in (200, 201):
            logger.info("Storage: bucket '%s' created.", DOCUMENTS_BUCKET)
        elif resp.status_code == 400 and "already" in (resp.text or "").lower():
            pass
        else:
            logger.debug("Storage: bucket check returned %s: %s", resp.status_code, resp.text[:200])
    except Exception as exc:
        logger.warning("Storage: could not verify/create bucket: %s", exc)

async def upload_document(file: UploadFile) -> str:
    if not _available():
        # Fallback for local development without Supabase configured
        return file.filename or "uploaded_document"
        
    try:
        file_bytes = await file.read()
        file_ext = file.filename.split('.')[-1] if file.filename and '.' in file.filename else 'bin'
        file_id = str(uuid.uuid4())
        path = f"{file_id}.{file_ext}"
        
        with httpx.Client(timeout=30) as client:
            resp = client.post(
                _object_url(path),
                content=file_bytes,
                headers={
                    **_base_headers(),
                    "Content-Type": file.content_type or "application/octet-stream",
                },
            )
        if resp.status_code not in (200, 201):
            logger.error("Storage upload failed: %s %s", resp.status_code, resp.text)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to upload file")
            
        return path
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Storage upload exception: %s", exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to upload file")

def get_download_url(path: str) -> str:
    """Gets a short-lived signed URL for download."""
    if not _available() or not path or '.' not in path:
        return "" # Fake/legacy local path
        
    try:
        with httpx.Client(timeout=10) as client:
            resp = client.post(
                f"{settings.supabase_url}/storage/v1/object/sign/{DOCUMENTS_BUCKET}/{path}",
                json={"expiresIn": 3600},
                headers=_base_headers(),
            )
        if resp.status_code == 200:
            data = resp.json()
            return f"{settings.supabase_url}/storage/v1{data['signedURL']}"
    except Exception as exc:
        logger.error("Storage signed URL exception: %s", exc)
    return ""
