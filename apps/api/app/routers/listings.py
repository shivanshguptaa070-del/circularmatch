from app.main import company_view, material_view, evidence_view, passport_readiness, lot_view, listing_view, default_acceptance_spec, acceptance_spec_view, requirement_view, match_card_view, sort_matches, recompute_listing_matches, ensure_listing_matches, recompute_requirement_matches, timeline_for_match
from app.core.responses import envelope, not_found
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status, UploadFile, File
from app.core.dependencies import get_current_user, get_store, require_roles, can_access_listing
from app.core.storage import upload_document, get_download_url
from app.repositories.demo_store import DemoStore
from app.schemas.models import *
from app.services.calculators import *
from app.services.extraction import extract_waste
from app.services.matching import *
from app.services.email_service import send_contact_notification
from app.seed.demo_data import city_coordinates

router = APIRouter()

@router.get("/api/listings")
def get_listings(
    mine: bool = Query(default=False),
    active_only: bool = Query(default=False),
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    company_id = current_user.company_id if mine else None
    listings = store.list_listings(company_id=company_id, active_only=active_only)
    return envelope([listing_view(store, listing) for listing in listings])

@router.get("/api/listings/{listing_id}/passport")
def get_listing_passport(
    listing_id: str,
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    listing = store.get_listing(listing_id)
    if listing is None:
        raise not_found("Listing")
    if not can_access_listing(current_user, listing):
        raise HTTPException(status_code=403, detail="You cannot access this listing's passport.")
    return envelope({
        "listing": listing_view(store, listing),
        "readiness": passport_readiness(store, listing.id),
        "lots": [lot_view(store, lot) for lot in store.list_lots(listing.id)],
        "audit_events": [item.model_dump() for item in store.list_audit_events(entity_id=listing.id)],
        "notice": "Material Passport fields are supplier-entered or evidence-backed records. They are not a laboratory certificate or legal classification.",
    })

@router.get("/api/listings/{listing_id}")
def get_listing(
    listing_id: str,
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    listing = store.get_listing(listing_id)
    if listing is None:
        raise not_found("Listing")
    if not can_access_listing(current_user, listing):
        raise HTTPException(status_code=403, detail="You cannot access this listing.")
    return envelope(listing_view(store, listing))

@router.post("/api/listings", status_code=201)
def create_listing(
    request: CreateListingRequest,
    current_user: User = Depends(require_roles("generator")),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    if current_user.company_id is None:
        raise HTTPException(status_code=400, detail="Please configure your company profile before publishing a listing.")
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
        is_demo=current_user.is_demo,  # Real users get is_demo=False; demo personas get True
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
        is_demo=current_user.is_demo
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
        document_name=request.document_name,
        document_url=request.document_url,
        created_at=store.timestamp(),
        is_demo=current_user.is_demo,  # Inherits from the listing owner
    )
    store.create_evidence(declaration)
    store.add_audit_event(entity_type="listing", entity_id=listing.id, action="listing_created", actor_id=current_user.id, summary="Listing, initial lot, and supplier-declaration evidence were created.", is_demo=current_user.is_demo)
    return envelope({"listing": listing_view(store, listing), "lot": lot_view(store, lot), "message": "Listing published with a Material Passport draft."})

@router.post("/api/listings/{listing_id}/lots", status_code=201)
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
        is_demo=current_user.is_demo
    )
    store.create_lot(lot)
    store.clear_matches_for_listing(listing.id)
    store.add_audit_event(entity_type="listing", entity_id=listing.id, action="lot_created", actor_id=current_user.id, summary=f"Material lot {lot.lot_code} was added to the listing.", is_demo=current_user.is_demo)
    return envelope({"lot": lot_view(store, lot), "readiness": passport_readiness(store, listing.id), "message": "Material lot added. Recompute matches to use the newest available lot."})

@router.post("/api/listings/lots/{lot_id}/evidence", status_code=201)
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
        document_url=request.document_url,
        valid_until=request.valid_until,
        created_at=store.timestamp(),
        is_demo=listing.is_demo,  # Inherits from the listing it belongs to
    )
    store.create_evidence(evidence)
    store.clear_matches_for_listing(listing.id)
    store.add_audit_event(entity_type="lot", entity_id=lot.id, action="evidence_added", actor_id=current_user.id, summary=f"Evidence '{evidence.title}' was added with status {evidence.status}.", is_demo=current_user.is_demo)
    message = "Evidence record added. It remains supplier-uploaded until an admin review." if request.status != evidence_status else "Evidence record added to the Material Passport."
    return envelope({"evidence": evidence_view(evidence), "readiness": passport_readiness(store, listing.id), "message": message})

