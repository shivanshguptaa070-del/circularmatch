from app.main import company_view, material_view, evidence_view, passport_readiness, lot_view, listing_view, default_acceptance_spec, acceptance_spec_view, requirement_view, match_card_view, sort_matches, recompute_listing_matches, ensure_listing_matches, recompute_requirement_matches, timeline_for_match
from app.core.responses import envelope, not_found
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status, UploadFile, File
from app.core.dependencies import get_current_user, get_store, require_roles
from app.core.storage import upload_document, get_download_url
from app.repositories.demo_store import DemoStore
from app.schemas.models import *
from app.services.calculators import *
from app.services.extraction import extract_waste
from app.services.matching import *
from app.services.email_service import send_contact_notification
from app.seed.demo_data import city_coordinates

router = APIRouter()

@router.post("/api/auth/demo-login")
def demo_login(request: DemoLoginRequest, store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    user = store.user_for_persona(request.persona)
    if user is None:
        raise not_found("Demo persona")
    return envelope({"user": user.model_dump(), "company": company_view(store, user.company_id)})

@router.post("/api/auth/demo-reset")
def demo_reset(current_user: User = Depends(require_roles("admin")), store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    store.reset(preserve_real=True)
    return envelope({"message": "Demo Dataset reset to its fictional seed state, including lots, evidence, buyer templates, and timeline records."})

@router.get("/api/auth/me")
def get_me(current_user: User = Depends(get_current_user), store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    return envelope({"user": current_user.model_dump(), "company": company_view(store, current_user.company_id)})

@router.get("/api/notifications")
def get_notifications(current_user: User = Depends(get_current_user), store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    notifs = store.get_user_notifications(current_user.id)
    return envelope({"notifications": [n.model_dump() for n in notifs]})

@router.patch("/api/notifications/{notification_id}/read")
def mark_notification_as_read(notification_id: str, current_user: User = Depends(get_current_user), store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    updated = store.mark_notification_read(notification_id)
    if updated is None:
        raise not_found("Notification")
    return envelope({"notification": updated.model_dump()})


