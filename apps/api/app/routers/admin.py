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

@router.post("/api/admin/purge")
def purge_demo_data(
    dry_run: bool = Query(default=True, description="If true, only returns what would be deleted without deleting."),
    current_user: User = Depends(require_roles("admin")),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    """Admin-only: Remove all seed/demo records. Use dry_run=true first to preview."""
    counts = store.purge_demo_data(dry_run=dry_run)
    message = (
        f"DRY RUN: Would delete {counts}. Call with dry_run=false to execute."
        if dry_run
        else f"Purged all demo/seed data: {counts}. Snapshot saved with real user data only."
    )
    return envelope({"dry_run": dry_run, "deleted_counts": counts, "message": message})

@router.get("/api/admin/scoring")
def get_scoring_config(current_user: User = Depends(require_roles("admin")), store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    return envelope({"config": store.scoring_config.model_dump(), "notice": "MVP decision rules — configurable, not scientifically optimal."})

@router.patch("/api/admin/scoring-config")
def update_scoring_config(request: UpdateScoringConfigRequest, current_user: User = Depends(require_roles("admin")), store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    if abs(sum(request.weights.values()) - 1.0) > 0.001:
        raise HTTPException(status_code=422, detail="Weights must sum to 1.0")
    store.scoring_config.weights = request.weights
    store.scoring_config.notes = request.notes
    return envelope({"config": store.scoring_config.model_dump(), "message": "Scoring config updated"})

@router.patch("/api/admin/evidence/{evidence_id}/review")
def review_evidence(evidence_id: str, request: ReviewEvidenceRequest, current_user: User = Depends(require_roles("admin")), store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    evidence = store.get_evidence(evidence_id)
    if not evidence:
        return not_found("Evidence", evidence_id)
    evidence.status = request.status
    if request.review_note:
        evidence.review_note = request.review_note
    if request.status in {"reviewed", "test_reviewed"}:
        lot = store.get_lot(evidence.lot_id)
        if lot:
            store.add_audit_event("lot", lot.id, "evidence_reviewed", current_user.id, f"Admin reviewed evidence {evidence.title} ({evidence.status})", current_user.is_demo)
    return envelope({"evidence": evidence_view(evidence), "message": "Evidence reviewed"})

@router.get("/api/admin/reports")
def get_reports(current_user: User = Depends(require_roles("admin"))) -> dict[str, Any]:
    return envelope({"reports": [], "message": "No demo reports in the fictional dataset."})
