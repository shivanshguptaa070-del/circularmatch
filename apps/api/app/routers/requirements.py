from app.main import company_view, material_view, evidence_view, passport_readiness, lot_view, listing_view, default_acceptance_spec, acceptance_spec_view, requirement_view, match_card_view, sort_matches, recompute_listing_matches, ensure_listing_matches, recompute_requirement_matches, timeline_for_match
from app.core.responses import envelope, not_found
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status, UploadFile, File
from app.core.dependencies import get_current_user, get_store, require_roles, can_access_requirement
from app.core.storage import upload_document, get_download_url
from app.repositories.demo_store import DemoStore
from app.schemas.models import *
from app.services.calculators import *
from app.services.extraction import extract_waste
from app.services.matching import *
from app.services.email_service import send_contact_notification
from app.seed.demo_data import city_coordinates

router = APIRouter()

@router.get("/api/buyer-requirements")
def get_requirements(
    mine: bool = Query(default=False),
    active_only: bool = Query(default=False),
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    company_id = current_user.company_id if mine else None
    requirements = store.list_requirements(company_id=company_id, active_only=active_only)
    return envelope([requirement_view(store, requirement) for requirement in requirements])

@router.get("/api/buyer-requirements/{requirement_id}/acceptance-spec")
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

@router.post("/api/buyer-requirements")
def create_requirement(
    request: CreateRequirementRequest,
    current_user: User = Depends(require_roles("buyer")),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    if current_user.company_id is None:
        raise HTTPException(status_code=400, detail="Please configure your company profile before adding a requirement.")
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
        is_demo=current_user.is_demo,  # Real users get is_demo=False; demo personas get True
        created_at=store.timestamp(),
    )
    store.create_requirement(requirement)
    spec = default_acceptance_spec(store, requirement)
    store.save_acceptance_spec(spec)
    store.add_audit_event(entity_type="buyer_requirement", entity_id=requirement.id, action="buyer_requirement_created", actor_id=current_user.id, summary="Buyer requirement and starter acceptance template were created.", is_demo=current_user.is_demo)
    return envelope({"requirement": requirement_view(store, requirement), "acceptance_spec": acceptance_spec_view(store, requirement), "message": "Buyer requirement and starter acceptance template published."})

@router.put("/api/buyer-requirements/{requirement_id}")
def update_requirement(
    requirement_id: str,
    request: UpdateRequirementRequest,
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    requirement = store.get_requirement(requirement_id)
    if requirement is None:
        raise not_found("Buyer requirement")
    if not can_access_requirement(current_user, requirement):
        raise HTTPException(status_code=403, detail="You cannot edit this requirement.")

    if request.minimum_quantity_kg_week is not None:
        requirement.minimum_quantity_kg_week = request.minimum_quantity_kg_week
    if request.maximum_quantity_kg_week is not None:
        requirement.maximum_quantity_kg_week = request.maximum_quantity_kg_week
    if request.minimum_quality_grade is not None:
        requirement.minimum_quality_grade = request.minimum_quality_grade
    if request.maximum_distance_km is not None:
        requirement.maximum_distance_km = request.maximum_distance_km
    if request.target_price_per_kg is not None:
        requirement.target_price_per_kg = request.target_price_per_kg
    if request.allow_partial_quantity is not None:
        requirement.allow_partial_quantity = request.allow_partial_quantity
    if request.status is not None:
        requirement.status = request.status

    store.create_requirement(requirement) # It's a dict, so replacing by key updates it
    store.add_audit_event(entity_type="buyer_requirement", entity_id=requirement.id, action="buyer_requirement_updated", actor_id=current_user.id, summary="Buyer requirement updated.", is_demo=current_user.is_demo)
    return envelope({"requirement": requirement_view(store, requirement), "message": "Requirement updated."})

@router.delete("/api/buyer-requirements/{requirement_id}")
def delete_requirement(
    requirement_id: str,
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    requirement = store.get_requirement(requirement_id)
    if requirement is None:
        raise not_found("Buyer requirement")
    if not can_access_requirement(current_user, requirement):
        raise HTTPException(status_code=403, detail="You cannot delete this requirement.")
    
    requirement.status = "archived"
    store.create_requirement(requirement)
    store.add_audit_event(entity_type="buyer_requirement", entity_id=requirement.id, action="buyer_requirement_deleted", actor_id=current_user.id, summary="Buyer requirement deleted (archived).", is_demo=current_user.is_demo)
    return envelope({"message": "Requirement deleted."})
