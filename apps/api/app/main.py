from __future__ import annotations

import logging
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
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
    allow_headers=["Authorization", "Content-Type", "X-Demo-User-Id"],
    max_age=600,
)



# ── Global exception handler — never leak stack traces ────────────────────────
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again later."},
    )

DEMO_LABEL = "Illustrative / Demo Data"
ELIGIBILITY_ORDER = {"eligible": 0, "needs_sample": 1, "missing_evidence": 2, "blocked": 3}


def envelope(data: Any) -> dict[str, Any]:
    return {
        "data_mode": "demo" if settings.demo_mode else "production",
        "dataset_label": DEMO_LABEL if settings.demo_mode else None,
        "data": data,
    }


def not_found(resource: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{resource} was not found.")


def send_notification_email(user_email: str, title: str, message: str) -> None:
    """
    Simulates sending an email by printing to the server console.
    In a real MVP, this would integrate with SendGrid, SES, or Postmark.
    """
    logger.info("=" * 60)
    logger.info(f"📧 EMAIL SENT TO: {user_email}")
    logger.info(f"SUBJECT: {title}")
    logger.info(f"BODY: {message}")
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
        is_demo=True,
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
    payload["category"] = material.category if material else "Uncategorized"
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


def can_access_listing(current_user: User, listing: WasteListing) -> bool:
    return current_user.role == "admin" or (current_user.company_id is not None and listing.company_id == current_user.company_id)


def can_access_requirement(current_user: User, requirement: BuyerRequirement) -> bool:
    return current_user.role == "admin" or (current_user.company_id is not None and requirement.company_id == current_user.company_id)


def can_participate_in_match(current_user: User, listing: WasteListing, requirement: BuyerRequirement) -> bool:
    return current_user.role == "admin" or current_user.company_id in {listing.company_id, requirement.company_id}


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
                            created_at=store.timestamp()
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
                            created_at=store.timestamp()
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
    for transaction in store.transactions:
        if transaction.get("match_id") == match_id:
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
        "ai_provider": "gemini" if settings.gemini_api_key else "demo-rule-based-fallback",
        "notice": "Demo mode uses fictional Delhi NCR data and illustrative calculations.",
        "pilot_core": "Material passport, evidence, buyer templates, eligibility checks, and demo transaction timeline are enabled.",
    })


@app.post("/api/demo/login")
def demo_login(request: DemoLoginRequest, store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    user = store.user_for_persona(request.persona)
    if user is None:
        raise not_found("Demo persona")
    return envelope({"user": user.model_dump(), "company": company_view(store, user.company_id)})


# ── Notifications ──────────────────────────────────────────────────────────

@app.get("/api/notifications")
def get_notifications(
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    notifications = store.get_user_notifications(current_user.id)
    return envelope({"notifications": [n.model_dump() for n in notifications]})


@app.patch("/api/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    notification = store.notifications.get(notification_id)
    if not notification:
        raise not_found("Notification")
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to read this notification.")
    updated = store.mark_notification_read(notification_id)
    return envelope({"notification": updated.model_dump() if updated else None})


# ── Demo / Session ─────────────────────────────────────────────────────────

@app.post("/api/demo/reset")
def demo_reset(current_user: User = Depends(require_roles("admin")), store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    store.reset()
    return envelope({"message": "Demo Dataset reset to its fictional seed state, including lots, evidence, buyer templates, and timeline records."})


@app.get("/api/me")
def get_me(current_user: User = Depends(get_current_user), store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    return envelope({"user": current_user.model_dump(), "company": company_view(store, current_user.company_id)})


@app.get("/api/materials")
def get_materials(store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    return envelope([material.model_dump() for material in store.list_materials() if material.supported])


@app.get("/api/materials/{material_id}/uses")
def get_material_uses(material_id: str, store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    material = store.get_material(material_id)
    if material is None:
        raise not_found("Material")
    return envelope({
        "material": material.canonical_name,
        "uses": [{**item.model_dump(), "label": "Potential use — verify suitability with buyer"} for item in material.uses],
    })


@app.get("/api/impact-methodologies")
def get_impact_methodologies(store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    return envelope({
        "methodologies": [item.model_dump() for item in store.list_impact_methodologies()],
        "notice": "These are demo methodology records. They are not a verified LCA, GHG inventory, or external reporting claim.",
    })


@app.post("/api/ai/extract-waste")
async def ai_extract_waste(request: ExtractWasteRequest, store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    result = await extract_waste(request.description, store.list_materials(), settings.gemini_api_key)
    return envelope(result)


@app.get("/api/listings")
def get_listings(
    mine: bool = Query(default=False),
    active_only: bool = Query(default=False),
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    company_id = current_user.company_id if mine and current_user.company_id else None
    listings = store.list_listings(company_id=company_id, active_only=active_only)
    return envelope([listing_view(store, listing) for listing in listings])


@app.get("/api/listings/{listing_id}/passport")
def get_listing_passport(listing_id: str, store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    listing = store.get_listing(listing_id)
    if listing is None:
        raise not_found("Listing")
    return envelope({
        "listing": listing_view(store, listing),
        "readiness": passport_readiness(store, listing.id),
        "lots": [lot_view(store, lot) for lot in store.list_lots(listing.id)],
        "audit_events": [item.model_dump() for item in store.list_audit_events(entity_id=listing.id)],
        "notice": "Material Passport fields are supplier-entered or evidence-backed records. They are not a laboratory certificate or legal classification.",
    })


@app.get("/api/listings/{listing_id}")
def get_listing(listing_id: str, store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    listing = store.get_listing(listing_id)
    if listing is None:
        raise not_found("Listing")
    return envelope(listing_view(store, listing))


@app.post("/api/listings", status_code=status.HTTP_201_CREATED)
def create_listing(
    request: CreateListingRequest,
    current_user: User = Depends(require_roles("generator")),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    if current_user.company_id is None:
        raise HTTPException(status_code=400, detail="Demo generator has no company configured.")
    material = store.get_material(request.material_id)
    if material is None or not material.supported:
        raise HTTPException(status_code=422, detail="Choose a supported controlled-catalog material.")
    coordinates = city_coordinates(request.city)
    if coordinates is None:
        raise HTTPException(status_code=422, detail="Use a Delhi NCR demo city (e.g., Noida, Ghaziabad, Delhi, Gurugram, Faridabad, Manesar, Bhiwadi).")
    if request.selected_use_id and not any(item.id == request.selected_use_id for item in material.uses):
        raise HTTPException(status_code=422, detail="Selected potential use does not belong to this material.")

    listing = WasteListing(
        id=store.new_id("listing"),
        company_id=current_user.company_id,
        material_id=request.material_id,
        raw_description=request.raw_description,
        source="ai_assisted",
        quantity_kg=request.quantity_kg,
        frequency=request.frequency,
        normalized_kg_per_week=normalize_to_week(request.quantity_kg, request.frequency),
        quality_grade=request.quality_grade,
        quality_verified=False,  # No user text is elevated into a certification claim.
        quality_notes=request.quality_notes,
        availability=request.availability,
        city=request.city,
        latitude=coordinates[0],
        longitude=coordinates[1],
        asking_price_per_kg=request.asking_price_per_kg,
        disposal_cost_per_kg=request.disposal_cost_per_kg,
        selected_use_id=request.selected_use_id,
        is_demo=True,
        created_at=store.timestamp(),
    )
    store.create_listing(listing)
    lot = MaterialLot(
        id=store.new_id("lot"),
        listing_id=listing.id,
        lot_code=f"LOT-{listing.id[-6:].upper()}",
        available_quantity_kg=request.quantity_kg,
        material_form=request.material_form,
        source_status=request.source_status,
        colour=request.colour,
        packaging=request.packaging,
        storage_condition=request.storage_condition,
        sample_available=request.sample_available,
        compliance_triage=request.compliance_triage,
        declared_spec={"supplier_statement": request.quality_notes or "Supplier description captured during listing intake."},
        created_at=store.timestamp(),
    )
    store.create_lot(lot)
    declaration = QualityEvidence(
        id=store.new_id("evidence"),
        lot_id=lot.id,
        evidence_type="supplier_declaration",
        title="Supplier declaration created with listing",
        issuer=store.get_company(listing.company_id).name if store.get_company(listing.company_id) else "Supplier",
        status="self_declared",
        summary=request.quality_notes or "Supplier-provided material statement; not independently verified.",
        created_at=store.timestamp(),
        is_demo=True,
    )
    store.create_evidence(declaration)
    store.add_audit_event(entity_type="listing", entity_id=listing.id, action="listing_created", actor_id=current_user.id, summary="Listing, initial lot, and supplier-declaration evidence were created.")
    return envelope({"listing": listing_view(store, listing), "lot": lot_view(store, lot), "message": "Listing published with a Material Passport draft in the Demo Dataset."})


@app.post("/api/listings/{listing_id}/lots", status_code=status.HTTP_201_CREATED)
def create_material_lot(
    listing_id: str,
    request: CreateMaterialLotRequest,
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    listing = store.get_listing(listing_id)
    if listing is None:
        raise not_found("Listing")
    if not can_access_listing(current_user, listing):
        raise HTTPException(status_code=403, detail="You cannot add a lot to this listing.")
    lot = MaterialLot(
        id=store.new_id("lot"),
        listing_id=listing.id,
        lot_code=request.lot_code,
        available_quantity_kg=request.available_quantity_kg,
        material_form=request.material_form,
        source_status=request.source_status,
        colour=request.colour,
        packaging=request.packaging,
        storage_condition=request.storage_condition,
        sample_available=request.sample_available,
        compliance_triage=request.compliance_triage,
        declared_spec=request.declared_spec,
        created_at=store.timestamp(),
    )
    store.create_lot(lot)
    store.clear_matches_for_listing(listing.id)
    store.add_audit_event(entity_type="listing", entity_id=listing.id, action="lot_created", actor_id=current_user.id, summary=f"Material lot {lot.lot_code} was added to the listing.")
    return envelope({"lot": lot_view(store, lot), "readiness": passport_readiness(store, listing.id), "message": "Material lot added. Recompute matches to use the newest available lot."})


@app.post("/api/lots/{lot_id}/evidence", status_code=status.HTTP_201_CREATED)
def create_quality_evidence(
    lot_id: str,
    request: CreateEvidenceRequest,
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    lot = store.get_lot(lot_id)
    if lot is None:
        raise not_found("Material lot")
    listing = store.get_listing(lot.listing_id)
    if listing is None:
        raise HTTPException(status_code=409, detail="Lot source listing is unavailable.")
    if not can_access_listing(current_user, listing):
        raise HTTPException(status_code=403, detail="You cannot add evidence to this lot.")
    evidence_status = request.status
    if evidence_status in {"reviewed", "test_reviewed"} and current_user.role != "admin":
        evidence_status = "uploaded"
    evidence = QualityEvidence(
        id=store.new_id("evidence"),
        lot_id=lot.id,
        evidence_type=request.evidence_type,
        title=request.title,
        issuer=request.issuer,
        status=evidence_status,
        summary=request.summary,
        document_name=request.document_name,
        valid_until=request.valid_until,
        created_at=store.timestamp(),
        is_demo=True,
    )
    store.create_evidence(evidence)
    store.clear_matches_for_listing(listing.id)
    store.add_audit_event(entity_type="lot", entity_id=lot.id, action="evidence_added", actor_id=current_user.id, summary=f"Evidence '{evidence.title}' was added with status {evidence.status}.")
    message = "Evidence record added. It remains supplier-uploaded until an admin review." if request.status != evidence_status else "Evidence record added to the Material Passport."
    return envelope({"evidence": evidence_view(evidence), "readiness": passport_readiness(store, listing.id), "message": message})


@app.patch("/api/admin/evidence/{evidence_id}/review")
def review_quality_evidence(
    evidence_id: str,
    request: ReviewEvidenceRequest,
    current_user: User = Depends(require_roles("admin")),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    evidence = store.get_evidence(evidence_id)
    if evidence is None:
        raise not_found("Evidence")
    updated = store.update_evidence(evidence_id, {
        "status": request.status,
        "reviewed_by": current_user.id,
        "reviewed_at": store.timestamp(),
        "summary": f"{evidence.summary}\nReview note: {request.review_note}".strip(),
    })
    assert updated is not None
    lot = store.get_lot(updated.lot_id)
    if lot:
        store.clear_matches_for_listing(lot.listing_id)
        store.add_audit_event(entity_type="lot", entity_id=lot.id, action="evidence_reviewed", actor_id=current_user.id, summary=f"Evidence '{updated.title}' was reviewed as {updated.status}.")
    return envelope({"evidence": evidence_view(updated), "message": "Evidence review status updated. Matches will apply it on next recompute."})


@app.patch("/api/listings/{listing_id}")
def update_listing(
    listing_id: str,
    request: UpdateListingRequest,
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    listing = store.get_listing(listing_id)
    if listing is None:
        raise not_found("Listing")
    if not can_access_listing(current_user, listing):
        raise HTTPException(status_code=403, detail="You cannot edit this listing.")
    updates = request.model_dump(exclude_unset=True)
    if "quantity_kg" in updates or "frequency" in updates:
        quantity = updates.get("quantity_kg", listing.quantity_kg)
        frequency = updates.get("frequency", listing.frequency)
        updates["normalized_kg_per_week"] = normalize_to_week(quantity, frequency)
    updated = store.update_listing(listing_id, updates)
    assert updated is not None
    store.clear_matches_for_listing(listing_id)
    store.add_audit_event(entity_type="listing", entity_id=listing_id, action="listing_updated", actor_id=current_user.id, summary="Listing fields were updated and matching was invalidated.")
    return envelope({"listing": listing_view(store, updated), "message": "Listing updated; previous match suggestions were refreshed."})


@app.get("/api/buyer-requirements")
def get_requirements(
    mine: bool = Query(default=False),
    active_only: bool = Query(default=False),
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    company_id = current_user.company_id if mine and current_user.company_id else None
    requirements = store.list_requirements(company_id=company_id, active_only=active_only)
    return envelope([requirement_view(store, requirement) for requirement in requirements])


@app.get("/api/buyer-requirements/{requirement_id}/acceptance-spec")
def get_acceptance_spec(
    requirement_id: str,
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    requirement = store.get_requirement(requirement_id)
    if requirement is None:
        raise not_found("Buyer requirement")
    if not can_access_requirement(current_user, requirement):
        raise HTTPException(status_code=403, detail="You cannot view this buyer acceptance template.")
    return envelope({"requirement": requirement_view(store, requirement), "acceptance_spec": acceptance_spec_view(store, requirement)})


@app.patch("/api/buyer-requirements/{requirement_id}/acceptance-spec")
def update_acceptance_spec(
    requirement_id: str,
    request: UpdateBuyerAcceptanceSpecRequest,
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    requirement = store.get_requirement(requirement_id)
    if requirement is None:
        raise not_found("Buyer requirement")
    if not can_access_requirement(current_user, requirement):
        raise HTTPException(status_code=403, detail="You cannot edit this buyer acceptance template.")
    previous = store.get_acceptance_spec(requirement.id) or default_acceptance_spec(store, requirement)
    spec = BuyerAcceptanceSpec(
        id=previous.id,
        buyer_requirement_id=requirement.id,
        accepted_forms=[item.strip() for item in request.accepted_forms if item.strip()],
        accepted_colours=[item.strip() for item in request.accepted_colours if item.strip()],
        prohibited_materials=[item.strip() for item in request.prohibited_materials if item.strip()],
        required_evidence_status=request.required_evidence_status,
        requires_sample=request.requires_sample,
        available_capacity_kg_week=request.available_capacity_kg_week,
        route_note=request.route_note,
        review_note=request.review_note,
        updated_at=store.timestamp(),
        is_demo=True,
    )
    store.save_acceptance_spec(spec)
    store.clear_matches_for_requirement(requirement.id)
    store.add_audit_event(entity_type="buyer_requirement", entity_id=requirement.id, action="acceptance_spec_updated", actor_id=current_user.id, summary="Buyer acceptance template was updated; matching will recompute using the new gates.")
    return envelope({"acceptance_spec": acceptance_spec_view(store, requirement), "message": "Buyer acceptance template updated. Existing match suggestions will refresh on next analysis."})


@app.post("/api/buyer-requirements", status_code=status.HTTP_201_CREATED)
def create_requirement(
    request: CreateRequirementRequest,
    current_user: User = Depends(require_roles("buyer")),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    if current_user.company_id is None:
        raise HTTPException(status_code=400, detail="Demo buyer has no company configured.")
    if store.get_material(request.material_id) is None:
        raise HTTPException(status_code=422, detail="Choose a supported controlled-catalog material.")
    coordinates = city_coordinates(request.city)
    if coordinates is None:
        raise HTTPException(status_code=422, detail="Choose a Delhi NCR demo city.")
    requirement = BuyerRequirement(
        id=store.new_id("requirement"),
        company_id=current_user.company_id,
        material_id=request.material_id,
        minimum_quantity_kg_week=request.minimum_quantity_kg_week,
        maximum_quantity_kg_week=request.maximum_quantity_kg_week,
        minimum_quality_grade=request.minimum_quality_grade,
        maximum_distance_km=request.maximum_distance_km,
        target_price_per_kg=request.target_price_per_kg,
        allow_partial_quantity=request.allow_partial_quantity,
        city=request.city,
        latitude=coordinates[0],
        longitude=coordinates[1],
        is_demo=True,
        created_at=store.timestamp(),
    )
    store.create_requirement(requirement)
    spec = default_acceptance_spec(store, requirement)
    store.save_acceptance_spec(spec)
    store.add_audit_event(entity_type="buyer_requirement", entity_id=requirement.id, action="buyer_requirement_created", actor_id=current_user.id, summary="Buyer requirement and starter acceptance template were created.")
    return envelope({"requirement": requirement_view(store, requirement), "acceptance_spec": acceptance_spec_view(store, requirement), "message": "Buyer requirement and starter acceptance template published to the Demo Dataset."})


@app.post("/api/listings/{listing_id}/matches/recompute")
def recompute_matches(
    listing_id: str,
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    listing = store.get_listing(listing_id)
    if listing is None:
        raise not_found("Listing")
    if not can_access_listing(current_user, listing):
        raise HTTPException(status_code=403, detail="You cannot calculate matches for this listing.")
    matches = recompute_listing_matches(store, listing)
    eligible_count = len([item for item in matches if item.eligibility_status == "eligible"])
    attention_count = len(matches) - eligible_count
    store.add_audit_event(entity_type="listing", entity_id=listing.id, action="matches_recomputed", actor_id=current_user.id, summary=f"{len(matches)} material-compatible buyer requirements analyzed; {eligible_count} eligible and {attention_count} requiring attention.")
    return envelope({
        "listing": listing_view(store, listing),
        "matches": [match_card_view(store, item) for item in matches],
        "decision_rule_label": "MVP decision rules — configurable, not scientifically optimal.",
        "message": f"Analyzed {len(store.list_requirements(active_only=True))} active buyer requirements. {eligible_count} are eligible now; the rest show explicit next actions.",
    })


@app.get("/api/listings/{listing_id}/matches")
def get_listing_matches(listing_id: str, store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    listing = store.get_listing(listing_id)
    if listing is None:
        raise not_found("Listing")
    matches = ensure_listing_matches(store, listing)
    return envelope({
        "listing": listing_view(store, listing),
        "matches": [match_card_view(store, item) for item in matches],
        "decision_rule_label": "MVP decision rules — configurable, not scientifically optimal.",
    })


@app.get("/api/buyer-requirements/{requirement_id}/matches")
def get_requirement_matches(
    requirement_id: str,
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    requirement = store.get_requirement(requirement_id)
    if requirement is None:
        raise not_found("Buyer requirement")
    if not can_access_requirement(current_user, requirement):
        raise HTTPException(status_code=403, detail="You cannot view matches for this requirement.")
    matches = recompute_requirement_matches(store, requirement)
    return envelope({
        "requirement": requirement_view(store, requirement),
        "acceptance_spec": acceptance_spec_view(store, requirement),
        "matches": [match_card_view(store, item) for item in matches],
        "decision_rule_label": "MVP decision rules — configurable, not scientifically optimal.",
    })


@app.get("/api/matches/{match_id}/timeline")
def get_match_timeline(match_id: str, store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    match = store.get_match(match_id)
    if match is None:
        raise not_found("Match")
    return envelope({
        "match_id": match_id,
        "events": timeline_for_match(store, match_id),
        "notice": "Timeline entries are demo operational records, not a contract, payment record, or legally sufficient chain-of-custody document.",
    })


@app.get("/api/matches/{match_id}")
def get_match_detail(match_id: str, store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    match = store.get_match(match_id)
    if match is None:
        raise not_found("Match")
    listing = store.get_listing(match.listing_id)
    requirement = store.get_requirement(match.buyer_requirement_id)
    if listing is None or requirement is None:
        raise HTTPException(status_code=409, detail="Match source data is unavailable.")
    material = store.get_material(listing.material_id)
    buyer = store.get_company(requirement.company_id)
    if material is None or buyer is None:
        raise HTTPException(status_code=409, detail="Match catalog or buyer data is unavailable.")
    material_use = selected_material_use(material, listing.selected_use_id)
    lot = store.get_lot(match.lot_id) if match.lot_id else store.primary_lot_for_listing(listing.id)
    return envelope({
        "match": match_card_view(store, match),
        "listing": listing_view(store, listing),
        "material_lot": lot_view(store, lot) if lot else None,
        "passport_readiness": passport_readiness(store, listing.id),
        "buyer_requirement": requirement_view(store, requirement),
        "buyer_acceptance_spec": acceptance_spec_view(store, requirement),
        "buyer": buyer.model_dump(),
        "explanation": match_explanation(match, listing, requirement, buyer.name),
        "economic": economic_value(listing, requirement, match.distance_km),
        "impact": environmental_impact(listing, material, material_use, requirement, match.distance_km),
        "timeline": timeline_for_match(store, match_id),
        "map_route": {
            "from": {"name": store.get_company(listing.company_id).name, "latitude": listing.latitude, "longitude": listing.longitude, "city": listing.city},
            "to": {"name": buyer.name, "latitude": buyer.latitude, "longitude": buyer.longitude, "city": buyer.city},
            "distance_km": match.distance_km,
            "label": "Demo/sample route — not live logistics routing",
        },
    })


@app.post("/api/matches/{match_id}/contact")
def contact_match(
    match_id: str,
    request: ContactMatchRequest,
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    match = store.get_match(match_id)
    if match is None:
        raise not_found("Match")
    listing = store.get_listing(match.listing_id)
    requirement = store.get_requirement(match.buyer_requirement_id)
    if listing is None or requirement is None:
        raise HTTPException(status_code=409, detail="Match source data is unavailable.")
    if not can_participate_in_match(current_user, listing, requirement):
        raise HTTPException(status_code=403, detail="You are not a participant in this match.")
    updated = store.update_match(match_id, {"status": "contacted"})
    transaction = store.add_transaction(match_id=match_id, listing_id=listing.id, initiated_by=current_user.id, note=request.note)
    store.add_audit_event(entity_type="match", entity_id=match_id, action="contact_recorded", actor_id=current_user.id, summary="Demo contact intent was recorded.")
    return envelope({"match": match_card_view(store, updated or match), "transaction": transaction, "message": "Demo contact intent recorded. This is not an order, payment, or contract."})


@app.post("/api/matches/{match_id}/sample-requests", status_code=status.HTTP_201_CREATED)
def create_sample_request(
    match_id: str,
    request: CreateSampleRequest,
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    match = store.get_match(match_id)
    if match is None:
        raise not_found("Match")
    listing = store.get_listing(match.listing_id)
    requirement = store.get_requirement(match.buyer_requirement_id)
    if listing is None or requirement is None or not can_participate_in_match(current_user, listing, requirement):
        raise HTTPException(status_code=403, detail="You are not a participant in this match.")
    sample = SampleRequest(
        id=store.new_id("sample"),
        match_id=match_id,
        requested_by=current_user.id,
        requested_quantity_kg=request.requested_quantity_kg,
        note=request.note,
        created_at=store.timestamp(),
        updated_at=store.timestamp(),
        is_demo=True,
    )
    store.create_sample_request(sample)
    store.update_match(match_id, {"status": "contacted"})
    store.add_audit_event(entity_type="match", entity_id=match_id, action="sample_requested", actor_id=current_user.id, summary=f"A {sample.requested_quantity_kg:,.0f} kg demo sample/inspection request was created.")
    return envelope({"sample_request": sample.model_dump(), "timeline": timeline_for_match(store, match_id), "message": "Demo sample request recorded. It is not a transport instruction or quality acceptance."})


@app.patch("/api/sample-requests/{sample_id}")
def update_sample_request(
    sample_id: str,
    request: UpdateSampleRequest,
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    sample = store.sample_requests.get(sample_id)
    if sample is None:
        raise not_found("Sample request")
    match = store.get_match(sample.match_id)
    if match is None:
        raise HTTPException(status_code=409, detail="Sample match is unavailable.")
    listing = store.get_listing(match.listing_id)
    requirement = store.get_requirement(match.buyer_requirement_id)
    if listing is None or requirement is None or not can_participate_in_match(current_user, listing, requirement):
        raise HTTPException(status_code=403, detail="You are not a participant in this sample request.")
    updated = store.update_sample_request(sample_id, {"status": request.status, "note": request.note or sample.note})
    assert updated is not None
    store.clear_matches_for_listing(listing.id)
    recompute_listing_matches(store, listing)
    store.add_audit_event(entity_type="match", entity_id=match.id, action="sample_updated", actor_id=current_user.id, summary=f"Demo sample request updated to {updated.status}.")
    return envelope({"sample_request": updated.model_dump(), "timeline": timeline_for_match(store, match.id), "message": "Sample status updated in Demo Mode. Recomputed eligibility will use the new sample status."})


@app.post("/api/matches/{match_id}/offers", status_code=status.HTTP_201_CREATED)
def create_offer(
    match_id: str,
    request: CreateOfferRequest,
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    match = store.get_match(match_id)
    if match is None:
        raise not_found("Match")
    listing = store.get_listing(match.listing_id)
    requirement = store.get_requirement(match.buyer_requirement_id)
    if listing is None or requirement is None or not can_participate_in_match(current_user, listing, requirement):
        raise HTTPException(status_code=403, detail="You are not a participant in this match.")
    offer = Offer(
        id=store.new_id("offer"),
        match_id=match_id,
        offered_by=current_user.id,
        price_per_kg=request.price_per_kg,
        quantity_kg=request.quantity_kg,
        pickup_model=request.pickup_model,
        note=request.note,
        created_at=store.timestamp(),
        is_demo=True,
    )
    store.create_offer(offer)
    store.add_audit_event(entity_type="match", entity_id=match_id, action="offer_sent", actor_id=current_user.id, summary=f"Demo offer sent for {offer.quantity_kg:,.0f} kg at ₹{offer.price_per_kg:,.2f}/kg.")
    return envelope({"offer": offer.model_dump(), "timeline": timeline_for_match(store, match_id), "message": "Illustrative offer recorded. It is not a binding commercial agreement."})


@app.patch("/api/offers/{offer_id}")
def update_offer(
    offer_id: str,
    request: UpdateOfferRequest,
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    offer = store.offers.get(offer_id)
    if offer is None:
        raise not_found("Offer")
    match = store.get_match(offer.match_id)
    if match is None:
        raise HTTPException(status_code=409, detail="Offer match is unavailable.")
    listing = store.get_listing(match.listing_id)
    requirement = store.get_requirement(match.buyer_requirement_id)
    if listing is None or requirement is None or not can_participate_in_match(current_user, listing, requirement):
        raise HTTPException(status_code=403, detail="You are not a participant in this offer.")
    updated = store.update_offer(offer_id, {"status": request.status, "note": request.note or offer.note})
    assert updated is not None
    store.add_audit_event(entity_type="match", entity_id=match.id, action="offer_updated", actor_id=current_user.id, summary=f"Demo offer updated to {updated.status}.")
    return envelope({"offer": updated.model_dump(), "timeline": timeline_for_match(store, match.id), "message": "Offer status updated in Demo Mode. It remains non-binding."})


@app.post("/api/matches/{match_id}/shipments", status_code=status.HTTP_201_CREATED)
def create_shipment(
    match_id: str,
    request: CreateShipmentRequest,
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    match = store.get_match(match_id)
    if match is None:
        raise not_found("Match")
    listing = store.get_listing(match.listing_id)
    requirement = store.get_requirement(match.buyer_requirement_id)
    if listing is None or requirement is None or not can_participate_in_match(current_user, listing, requirement):
        raise HTTPException(status_code=403, detail="You are not a participant in this match.")
    shipment = Shipment(
        id=store.new_id("shipment"),
        match_id=match_id,
        planned_quantity_kg=request.planned_quantity_kg,
        pickup_date=request.pickup_date,
        pickup_model=request.pickup_model,
        carrier_name=request.carrier_name,
        created_at=store.timestamp(),
        updated_at=store.timestamp(),
        is_demo=True,
    )
    store.create_shipment(shipment)
    store.add_audit_event(entity_type="match", entity_id=match_id, action="pickup_planned", actor_id=current_user.id, summary=f"Demo pickup planned for {shipment.planned_quantity_kg:,.0f} kg on {shipment.pickup_date}.")
    return envelope({"shipment": shipment.model_dump(), "timeline": timeline_for_match(store, match_id), "message": "Demo pickup plan recorded. It is not live fleet dispatch or a transport contract."})


@app.patch("/api/shipments/{shipment_id}")
def update_shipment(
    shipment_id: str,
    request: UpdateShipmentRequest,
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    shipment = store.shipments.get(shipment_id)
    if shipment is None:
        raise not_found("Shipment")
    match = store.get_match(shipment.match_id)
    if match is None:
        raise HTTPException(status_code=409, detail="Shipment match is unavailable.")
    listing = store.get_listing(match.listing_id)
    requirement = store.get_requirement(match.buyer_requirement_id)
    if listing is None or requirement is None or not can_participate_in_match(current_user, listing, requirement):
        raise HTTPException(status_code=403, detail="You are not a participant in this shipment.")
    updated = store.update_shipment(shipment_id, request.model_dump(exclude_unset=True))
    assert updated is not None
    if updated.status == "received":
        store.update_match(match.id, {"status": "accepted"})
        received_quantity = updated.received_weight_kg or updated.dispatched_weight_kg or updated.planned_quantity_kg
        store.transactions.append({
            "id": store.new_id("txn"),
            "match_id": match.id,
            "listing_id": listing.id,
            "initiated_by": current_user.id,
            "status": "accepted",
            "agreed_quantity_kg": received_quantity,
            "note": "Demo receipt record created from shipment update.",
            "created_at": store.timestamp(),
            "is_demo": True,
        })
        audit_summary = f"Demo shipment received; {received_quantity:,.0f} kg recorded as accepted for dashboard demonstration."
    else:
        audit_summary = f"Demo shipment updated to {updated.status}."
    store.add_audit_event(entity_type="match", entity_id=match.id, action="shipment_updated", actor_id=current_user.id, summary=audit_summary)
    return envelope({"shipment": updated.model_dump(), "timeline": timeline_for_match(store, match.id), "message": "Shipment record updated in Demo Mode."})


@app.get("/api/dashboard/summary")
def dashboard_summary(store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    listings = store.list_listings(active_only=True)
    all_matches: list[MatchRecord] = []
    for listing in listings:
        all_matches.extend(ensure_listing_matches(store, listing))
    top_matches_by_listing: dict[str, MatchRecord] = {}
    for match in sort_matches(all_matches):
        if match.eligibility_status != "blocked" and match.listing_id not in top_matches_by_listing:
            top_matches_by_listing[match.listing_id] = match

    total_waste = round(sum(item.normalized_kg_per_week for item in listings), 0)
    top_match_economic = [item.explanation_inputs.get("economic", {}) for item in top_matches_by_listing.values()]
    top_match_impact = [item.explanation_inputs.get("impact", {}) for item in top_matches_by_listing.values()]
    potential_value = round(sum((item.get("net_recovered_value") or 0) for item in top_match_economic), 0)
    potential_co2e = round(sum((item.get("estimated_net_co2e_benefit_kgco2e") or 0) for item in top_match_impact), 0)
    accepted_transactions = [item for item in store.transactions if item.get("status") == "accepted"]
    matched_quantity = round(sum(item.get("agreed_quantity_kg") or 0 for item in accepted_transactions), 0)
    active_buyers = len({item.company_id for item in store.list_requirements(active_only=True)})
    category_totals: dict[str, float] = {}
    for listing in listings:
        material = store.get_material(listing.material_id)
        category = material.category if material else "Uncategorized"
        category_totals[category] = category_totals.get(category, 0) + listing.normalized_kg_per_week

    transaction_count = len(store.transactions)
    success_rate = round((len(accepted_transactions) / transaction_count) * 100, 1) if transaction_count else 0

    return envelope({
        "kpis": {
            "total_waste_listed_kg_week": total_waste,
            "total_waste_matched_kg": matched_quantity,
            "waste_diverted_kg": matched_quantity,
            "potential_economic_value_inr": potential_value,
            "potential_co2e_benefit_kg": potential_co2e,
            "active_buyers": active_buyers,
            "successful_matches": len(accepted_transactions),
        },
        "charts": {
            "waste_by_category": [{"name": category, "value": round(value, 0)} for category, value in category_totals.items()],
            "waste_diverted_over_time": [{"period": "W1", "kg": 0}, {"period": "W2", "kg": 0}, {"period": "W3", "kg": 0}, {"period": "W4", "kg": matched_quantity}],
            "match_success": [{"name": "Accepted", "value": len(accepted_transactions)}, {"name": "In discussion", "value": len([item for item in store.transactions if item.get("status") == "contacted"])}],
            "economic_value": [
                {"period": "PET", "value": round(top_match_economic[0].get("net_recovered_value") or 0, 0) if top_match_economic else 0},
                {"period": "Textile", "value": round(top_match_economic[1].get("net_recovered_value") or 0, 0) if len(top_match_economic) > 1 else 0},
                {"period": "Paper", "value": round(top_match_economic[2].get("net_recovered_value") or 0, 0) if len(top_match_economic) > 2 else 0},
                {"period": "Metal", "value": round(top_match_economic[3].get("net_recovered_value") or 0, 0) if len(top_match_economic) > 3 else 0},
            ],
            "environmental_impact": [
                {"name": "Potential recovery", "value": round(sum((item.get("secondary_material_recovered_kg") or 0) for item in top_match_impact), 0)},
                {"name": "Transport burden", "value": round(sum((item.get("estimated_transport_emissions_kgco2e") or 0) for item in top_match_impact), 0)},
                {"name": "Net benefit", "value": potential_co2e},
            ],
        },
        "match_success_rate_percent": success_rate,
        "labels": {
            "dataset": DEMO_LABEL,
            "impact": "Illustrative calculations based on visible assumptions; not measured impact.",
            "prices": "Illustrative demo inputs; not market prices or quotes.",
            "pilot_core": "Material passports and workflow records are Demo Dataset entries, not verified commercial documents.",
        },
    })


@app.get("/api/map/points")
def map_points(match_id: str | None = Query(default=None), store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    points: list[dict[str, Any]] = []
    for company in store.companies.values():
        related_listings = [item for item in store.listings.values() if item.company_id == company.id]
        related_requirements = [item for item in store.requirements.values() if item.company_id == company.id]
        points.append({
            **company.model_dump(),
            "listings": [listing_view(store, item) for item in related_listings],
            "requirements": [requirement_view(store, item) for item in related_requirements],
        })

    selected_route = None
    if match_id:
        match = store.get_match(match_id)
        if match:
            listing = store.get_listing(match.listing_id)
            requirement = store.get_requirement(match.buyer_requirement_id)
            buyer = store.get_company(requirement.company_id) if requirement else None
            generator = store.get_company(listing.company_id) if listing else None
            if listing and requirement and buyer and generator:
                selected_route = {
                    "from": {"company": generator.name, "latitude": listing.latitude, "longitude": listing.longitude, "city": listing.city},
                    "to": {"company": buyer.name, "latitude": buyer.latitude, "longitude": buyer.longitude, "city": buyer.city},
                    "distance_km": match.distance_km,
                    "match_score": match.total_score,
                    "label": "Demo/sample route — not live GPS, road routing, or freight quote data",
                }

    return envelope({
        "center": {"latitude": 28.6139, "longitude": 77.2090, "label": "Delhi NCR — Demo area"},
        "points": points,
        "selected_route": selected_route,
        "label": "Demo/sample locations only. Do not use for dispatch planning.",
    })


@app.get("/api/admin/scoring-config")
def get_scoring_config(current_user: User = Depends(require_roles("admin")), store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    return envelope({"config": store.scoring_config.model_dump(), "notice": "MVP decision rules — configurable, not scientifically optimal."})


@app.patch("/api/admin/scoring-config")
def update_scoring_config(
    request: UpdateScoringConfigRequest,
    current_user: User = Depends(require_roles("admin")),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    config = store.set_scoring_weights(request.weights)
    store.add_audit_event(entity_type="scoring_config", entity_id=config.id, action="weights_updated", actor_id=current_user.id, summary=f"Scoring configuration v{config.version} was saved.")
    return envelope({"config": config.model_dump(), "message": "New scoring weights will be applied the next time matches are recomputed.", "notice": "MVP decision rules — configurable, not scientifically optimal."})


@app.get("/api/admin/reports")
def get_reports(current_user: User = Depends(require_roles("admin"))) -> dict[str, Any]:
    return envelope({"reports": [], "message": "No demo reports in the fictional dataset."})
