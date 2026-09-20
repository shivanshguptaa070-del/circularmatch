from __future__ import annotations

import logging
from typing import Any
import traceback

from fastapi import Depends, FastAPI, HTTPException, Query, Request, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings

# Abort startup if production secrets are missing
settings.validate_production()

logger = logging.getLogger(__name__)
from app.core.dependencies import get_current_user, get_store, require_roles
from app.core.storage import upload_document, get_download_url
from app.repositories.demo_store import DemoStore
from app.schemas.models import (
    BuyerAcceptanceSpec,
    BuyerRequirement,
    ContactMatchRequest,
    CreateEvidenceRequest,
    CreateListingRequest,
    CreateMaterialLotRequest,
    CreateOfferRequest,
    CreateRequirementRequest,
    CreateSampleRequest,
    CreateShipmentRequest,
    DemoLoginRequest,
    ExtractWasteRequest,
    MaterialLot,
    MatchRecord,
    Notification,
    Offer,
    QualityEvidence,
    ReviewEvidenceRequest,
    SampleRequest,
    Shipment,
    UpdateBuyerAcceptanceSpecRequest,
    UpdateListingRequest,
    UpdateOfferRequest,
    UpdateSampleRequest,
    UpdateScoringConfigRequest,
    UpdateShipmentRequest,
    User,
    WasteListing,
)
from app.seed.demo_data import city_coordinates
from app.services.calculators import (
    economic_value,
    environmental_impact,
    normalize_to_week,
    selected_material_use,
)
from app.services.extraction import extract_waste
from app.services.matching import EVIDENCE_RANK, calculate_match, match_explanation
from app.services.email_service import send_contact_notification

# In production, /docs and /redoc are disabled entirely.
# They are only available during local development (DEMO_MODE=true).
app = FastAPI(
    title="CircularMatch API",
    version="0.2.0",
    description="Explainable industrial waste-to-secondary-material matching with a trusted-pilot material passport workflow.",
    docs_url="/docs" if settings.demo_mode else None,
    redoc_url="/redoc" if settings.demo_mode else None,
    openapi_url="/openapi.json" if settings.demo_mode else None,
)

# ── Rate Limiting ────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# ── Security Headers Middleware ───────────────────────────────────────────────
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds defensive HTTP security headers to every response."""

    async def dispatch(self, request: Request, call_next: Any) -> Any:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
        if not settings.demo_mode:
            # Only send HSTS on production HTTPS endpoints
            response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        return response


app.add_middleware(SecurityHeadersMiddleware)

# ── CORS ─────────────────────────────────────────────────────────────────────
# Always allow the deployed Vercel frontend and Render backend.
_allowed_origins = [
    settings.frontend_origin,
    "https://circularmatch.vercel.app",
    "https://circularmatch.onrender.com",
]
if settings.demo_mode:
    # Allow common local dev ports during demo/development
    _allowed_origins += [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(_allowed_origins)),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Demo-User-Id", "X-Active-Mode"],
    max_age=600,
)



# ── Global exception handler — never leak stack traces ────────────────────────
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": f"{type(exc).__name__}: {str(exc)}", "path": request.url.path},
    )

from app.core.responses import envelope, not_found, DEMO_LABEL, ELIGIBILITY_ORDER

def send_notification_email(user_email: str, title: str, message: str) -> None:
    """
    Simulates sending an email by printing to the server console.
    In a real MVP, this would integrate with SendGrid, SES, or Postmark.
    """
    logger.info("=" * 60)
    logger.info("[NOTIFICATION EMAIL] TO: %s", user_email)
    logger.info("SUBJECT: %s", title)
    logger.info("BODY: %s", message)
    logger.info("=" * 60)


def company_view(store: DemoStore, company_id: str | None) -> dict[str, Any] | None:
    if not company_id:
        return None
    company = store.get_company(company_id)
    return company.model_dump() if company else None


def material_view(store: DemoStore, material_id: str) -> dict[str, Any] | None:
    material = store.get_material(material_id)
    return material.model_dump() if material else None


def evidence_view(evidence: QualityEvidence) -> dict[str, Any]:
    payload = evidence.model_dump()
    payload["status_label"] = evidence.status.replace("_", " ").title()
    payload["is_claim"] = evidence.status == "self_declared"
    return payload


def passport_readiness(store: DemoStore, listing_id: str) -> dict[str, Any]:
    lot = store.primary_lot_for_listing(listing_id)
    if not lot:
        return {
            "status": "draft",
            "score": 10,
            "missing": ["Create a dispatchable lot with form, quantity, storage, and evidence."],
            "lot_count": 0,
            "evidence_count": 0,
            "summary": "No dispatchable material lot has been created yet.",
        }

    evidence = store.list_evidence(lot.id)
    missing: list[str] = []
    score = 40
    if lot.material_form.strip().lower() != "not specified":
        score += 15
    else:
        missing.append("Specify material form.")
    if lot.colour.strip().lower() != "not specified":
        score += 10
    else:
        missing.append("Specify colour or colour mix.")
    if lot.packaging.strip().lower() != "not specified":
        score += 10
    else:
        missing.append("Specify packaging or bale format.")
    if lot.storage_condition.strip().lower() != "not specified":
        score += 10
    else:
        missing.append("Describe storage condition.")
    if evidence:
        score += 15
    else:
        missing.append("Add at least a supplier declaration or supporting evidence.")

    if lot.compliance_triage in {"needs_compliance_review", "regulated_or_hazardous_route"}:
        readiness = "compliance_review_needed"
        missing.insert(0, "Complete route-specific compliance review; this platform does not make a legal classification.")
    elif not evidence or missing:
        readiness = "missing_evidence"
    elif lot.sample_available:
        readiness = "sample_ready"
    else:
        readiness = "buyer_ready"

    return {
        "status": readiness,
        "score": min(score, 100),
        "missing": missing,
        "lot_count": len(store.list_lots(listing_id)),
        "evidence_count": len(evidence),
        "primary_lot_id": lot.id,
        "summary": "Material Passport v0 is a structured supplier record. It is not a laboratory certificate or legal classification.",
    }


def lot_view(store: DemoStore, lot: MaterialLot) -> dict[str, Any]:
    payload = lot.model_dump()
    payload["evidence"] = [evidence_view(item) for item in store.list_evidence(lot.id)]
    payload["evidence_count"] = len(payload["evidence"])
    payload["triage_label"] = lot.compliance_triage.replace("_", " ").title()
    return payload


def listing_view(store: DemoStore, listing: WasteListing) -> dict[str, Any]:
    payload = listing.model_dump()
    material = store.get_material(listing.material_id)
    company = store.get_company(listing.company_id)
    payload["material"] = material.canonical_name if material else "Unknown material"
    payload["category"] = material.category if material else "Uncategorized"
    payload["company"] = company.name if company else "Unknown company"
    payload["quality_display"] = listing.quality_grade.replace("_", " ").title()
    payload["quality_status"] = "Verified" if listing.quality_verified else "Not verified"
    payload["passport"] = passport_readiness(store, listing.id)
    payload["demo_label"] = DEMO_LABEL
    return payload


def default_acceptance_spec(store: DemoStore, requirement: BuyerRequirement) -> BuyerAcceptanceSpec:
    templates: dict[str, dict[str, Any]] = {
        "mat-pet": {
            "accepted_forms": ["Manufacturing trim", "Regrind", "Sheet scrap"],
            "accepted_colours": ["Clear", "Transparent light blue"],
            "prohibited_materials": ["PVC", "PETG", "Free-flowing liquids"],
            "required_evidence_status": "self_declared",
            "requires_sample": True,
            "route_note": "Potential non-food PET pathway pending buyer inspection and sample acceptance.",
        },
        "mat-cotton-textile": {
            "accepted_forms": ["Cutting offcuts"],
            "accepted_colours": [],
            "prohibited_materials": ["Wet material", "Medical textiles"],
            "required_evidence_status": "self_declared",
            "requires_sample": True,
            "route_note": "Potential fibre pathway pending composition and sample review.",
        },
        "mat-paper-cardboard": {
            "accepted_forms": ["Corrugated trim", "Baled cardboard"],
            "accepted_colours": ["Brown kraft"],
            "prohibited_materials": ["Wet material", "Food residue"],
            "required_evidence_status": "self_declared",
            "requires_sample": False,
            "route_note": "Potential paperboard route pending buyer moisture and contamination review.",
        },
        "mat-steel-scrap": {
            "accepted_forms": ["Fabrication offcuts", "Turnings"],
            "accepted_colours": [],
            "prohibited_materials": ["Sealed containers", "Oily residue"],
            "required_evidence_status": "self_declared",
            "requires_sample": True,
            "route_note": "Potential re-melt route pending grade and coating inspection.",
        },
    }
    template = templates.get(requirement.material_id, {})
    return BuyerAcceptanceSpec(
        id=store.new_id("spec"),
        buyer_requirement_id=requirement.id,
        accepted_forms=template.get("accepted_forms", []),
        accepted_colours=template.get("accepted_colours", []),
        prohibited_materials=template.get("prohibited_materials", []),
        required_evidence_status=template.get("required_evidence_status", "self_declared"),
        requires_sample=template.get("requires_sample", False),
        available_capacity_kg_week=requirement.maximum_quantity_kg_week,
        route_note=template.get("route_note", "Buyer acceptance template has not been tailored yet."),
        review_note="Demo template — buyer must validate before real use.",
        updated_at=store.timestamp(),
        is_demo=requirement.is_demo,
    )


def acceptance_spec_view(store: DemoStore, requirement: BuyerRequirement) -> dict[str, Any]:
    spec = store.get_acceptance_spec(requirement.id)
    if spec is None:
        spec = default_acceptance_spec(store, requirement)
        store.save_acceptance_spec(spec)
    payload = spec.model_dump()
    payload["required_evidence_label"] = spec.required_evidence_status.replace("_", " ").title()
    payload["buyer"] = company_view(store, requirement.company_id)
    payload["material"] = material_view(store, requirement.material_id)
    payload["notice"] = "Buyer acceptance template is a configurable screening profile, not a universal material standard or legal approval."
    return payload


def requirement_view(store: DemoStore, requirement: BuyerRequirement) -> dict[str, Any]:
    payload = requirement.model_dump()
    material = store.get_material(requirement.material_id)
    company = store.get_company(requirement.company_id)
    payload["material"] = material.canonical_name if material else "Unknown material"
    payload["category"] = requirement.material_category or (material.category if material else "Uncategorized")
    payload["company"] = company.name if company else "Unknown company"
    spec = store.get_acceptance_spec(requirement.id)
    payload["acceptance_spec_summary"] = {
        "id": spec.id,
        "requires_sample": spec.requires_sample,
        "required_evidence_status": spec.required_evidence_status,
        "available_capacity_kg_week": spec.available_capacity_kg_week,
    } if spec else None
    return payload


def match_card_view(store: DemoStore, match: MatchRecord) -> dict[str, Any]:
    payload = match.model_dump()
    requirement = store.get_requirement(match.buyer_requirement_id)
    listing = store.get_listing(match.listing_id)
    company = store.get_company(requirement.company_id) if requirement else None
    material = store.get_material(listing.material_id) if listing else None
    economic = match.explanation_inputs.get("economic", {})
    impact = match.explanation_inputs.get("impact", {})
    lot = store.get_lot(match.lot_id) if match.lot_id else None
    payload.update(
        {
            "buyer": company.name if company else "Unknown buyer",
            "buyer_company": company.model_dump() if company else None,
            "buyer_requirement": requirement_view(store, requirement) if requirement else None,
            "buyer_acceptance_spec": acceptance_spec_view(store, requirement) if requirement else None,
            "waste_listing": listing_view(store, listing) if listing else None,
            "material_lot": lot_view(store, lot) if lot else None,
            "material": material.canonical_name if material else "Unknown material",
            "estimated_net_value": economic.get("net_recovered_value"),
            "estimated_waste_diverted_kg": impact.get("waste_diverted_kg"),
            "potential_use": impact.get("potential_use"),
            "eligibility_label": match.eligibility_status.replace("_", " ").title(),
            "demo_label": DEMO_LABEL,
        }
    )
    return payload





def sort_matches(matches: list[MatchRecord]) -> list[MatchRecord]:
    # Match score remains a comparison aid; eligibility state is separately displayed
    # and never hidden by the rank order.
    return sorted(matches, key=lambda item: (-item.total_score, ELIGIBILITY_ORDER[item.eligibility_status]))


def recompute_listing_matches(store: DemoStore, listing: WasteListing) -> list[MatchRecord]:
    material = store.get_material(listing.material_id)
    if material is None:
        return []
    lot = store.primary_lot_for_listing(listing.id)
    evidence = store.list_evidence(lot.id) if lot else []
    store.clear_matches_for_listing(listing.id)
    matches: list[MatchRecord] = []
    for requirement in store.list_requirements(active_only=True):
        spec = store.get_acceptance_spec(requirement.id) or default_acceptance_spec(store, requirement)
        store.save_acceptance_spec(spec)
        match_id = f"match-{listing.id}-{requirement.id}"
        computed = calculate_match(
            listing,
            requirement,
            material,
            store.scoring_config,
            lot=lot,
            acceptance_spec=spec,
            evidence=evidence,
            sample_requests=store.list_sample_requests(match_id),
        )
        if computed:
            store.save_match(computed)
            matches.append(computed)
            
            # TRIGGER NOTIFICATION FOR BUYER
            if computed.total_score >= 60:
                buyer = store.get_company(requirement.company_id)
                buyer_user = store.get_user(buyer.owner_user_id) if buyer and buyer.owner_user_id else None
                if buyer_user:
                    notification_id = f"notif-match-{computed.id}-buyer"
                    # Prevent duplicate notifications for the same match
                    if not any(n.id == notification_id for n in store.notifications.values()):
                        notification = Notification(
                            id=notification_id,
                            user_id=buyer_user.id,
                            type="new_match",
                            title=f"New {computed.total_score:.0f}% Match Found",
                            message=f"A new listing for {material.canonical_name} matches your requirement.",
                            reference_url=f"/matches/{computed.id}",
                            created_at=store.timestamp(),
                            is_demo=buyer_user.is_demo
                        )
                        store.create_notification(notification)
                        send_notification_email(
                            user_email=buyer_user.email,
                            title=notification.title,
                            message=notification.message + f"\nView it here: {settings.frontend_origin}{notification.reference_url}"
                        )
                        
    return sort_matches(matches)


def ensure_listing_matches(store: DemoStore, listing: WasteListing) -> list[MatchRecord]:
    stored = store.list_matches_for_listing(listing.id)
    return stored if stored else recompute_listing_matches(store, listing)


def recompute_requirement_matches(store: DemoStore, requirement: BuyerRequirement) -> list[MatchRecord]:
    store.clear_matches_for_requirement(requirement.id)
    spec = store.get_acceptance_spec(requirement.id) or default_acceptance_spec(store, requirement)
    store.save_acceptance_spec(spec)
    matches: list[MatchRecord] = []
    for listing in store.list_listings(active_only=True):
        material = store.get_material(listing.material_id)
        if material is None:
            continue
        lot = store.primary_lot_for_listing(listing.id)
        evidence = store.list_evidence(lot.id) if lot else []
        match_id = f"match-{listing.id}-{requirement.id}"
        computed = calculate_match(
            listing,
            requirement,
            material,
            store.scoring_config,
            lot=lot,
            acceptance_spec=spec,
            evidence=evidence,
            sample_requests=store.list_sample_requests(match_id),
        )
        if computed:
            store.save_match(computed)
            matches.append(computed)
            
            # TRIGGER NOTIFICATION FOR SELLER/GENERATOR
            if computed.total_score >= 60:
                seller = store.get_company(listing.company_id)
                seller_user = store.get_user(seller.owner_user_id) if seller and seller.owner_user_id else None
                if seller_user:
                    notification_id = f"notif-match-{computed.id}-seller"
                    if not any(n.id == notification_id for n in store.notifications.values()):
                        notification = Notification(
                            id=notification_id,
                            user_id=seller_user.id,
                            type="new_match",
                            title=f"New {computed.total_score:.0f}% Match Found",
                            message=f"A buyer requirement matches your listing for {material.canonical_name}.",
                            reference_url=f"/matches/{computed.id}",
                            created_at=store.timestamp(),
                            is_demo=seller_user.is_demo
                        )
                        store.create_notification(notification)
                        send_notification_email(
                            user_email=seller_user.email,
                            title=notification.title,
                            message=notification.message + f"\nView it here: {settings.frontend_origin}{notification.reference_url}"
                        )

    return sort_matches(matches)


def timeline_for_match(store: DemoStore, match_id: str) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    for sample in store.list_sample_requests(match_id):
        events.append({
            "id": sample.id,
            "type": "sample_request",
            "status": sample.status,
            "title": "Sample / inspection request",
            "detail": f"{sample.requested_quantity_kg:,.0f} kg requested. {sample.note}".strip(),
            "created_at": sample.created_at,
            "record": sample.model_dump(),
        })
    for offer in store.list_offers(match_id):
        events.append({
            "id": offer.id,
            "type": "offer",
            "status": offer.status,
            "title": "Commercial offer",
            "detail": f"Illustrative offer: ₹{offer.price_per_kg:,.2f}/kg for {offer.quantity_kg:,.0f} kg. {offer.note}".strip(),
            "created_at": offer.created_at,
            "record": offer.model_dump(),
        })
    for shipment in store.list_shipments(match_id):
        events.append({
            "id": shipment.id,
            "type": "shipment",
            "status": shipment.status,
            "title": "Pickup / receipt plan",
            "detail": f"{shipment.planned_quantity_kg:,.0f} kg planned for {shipment.pickup_date}; {shipment.pickup_model.replace('_', ' ')}.",
            "created_at": shipment.created_at,
            "record": shipment.model_dump(),
        })
    canonical_id = store.canonical_match_id(match_id)
    for transaction in store.transactions:
        if transaction.get("match_id") in (match_id, canonical_id):
            events.append({
                "id": transaction["id"],
                "type": "contact",
                "status": transaction.get("status", "contacted"),
                "title": "Contact intent",
                "detail": transaction.get("note") or "Demo contact intent recorded.",
                "created_at": transaction.get("created_at"),
                "record": transaction,
            })
    for audit in store.list_audit_events(entity_id=match_id):
        events.append({
            "id": audit.id,
            "type": "audit",
            "status": audit.action,
            "title": "Audit event",
            "detail": audit.summary,
            "created_at": audit.created_at,
            "record": audit.model_dump(),
        })
    return sorted(events, key=lambda item: item["created_at"] or "")


@app.get("/")
def root() -> dict[str, Any]:
    return envelope({"name": "CircularMatch API", "message": "Explainable industrial waste-to-secondary-material matching demo.", "docs": "/docs"})


@app.get("/api/health")
def health() -> dict[str, Any]:
    return envelope({
        "status": "ok",
        "mode": "demo" if settings.demo_mode else "production",
        "ai_provider": "gemini" if settings.gemini_api_key else "rule-based-fallback",
        "notice": "Demo mode uses fictional Delhi NCR data and illustrative calculations.",
        "pilot_core": "Material passport, evidence, buyer templates, eligibility checks, and demo transaction timeline are enabled.",
    })



from app.routers import auth, documents, reference, listings, requirements, matches, admin, dashboard, map

app.include_router(auth.router, tags=['auth'])
app.include_router(documents.router, tags=['documents'])
app.include_router(reference.router, tags=['reference'])
app.include_router(listings.router, tags=['listings'])
app.include_router(requirements.router, tags=['requirements'])
app.include_router(matches.router, tags=['matches'])
app.include_router(admin.router, tags=['admin'])
app.include_router(dashboard.router, tags=['dashboard'])
app.include_router(map.router, tags=['map'])
