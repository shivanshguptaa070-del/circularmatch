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

@router.get("/api/reference/materials")
def get_materials(store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    return envelope([material.model_dump() for material in store.list_materials() if material.supported])

@router.get("/api/reference/materials/{material_id}/uses")
def get_material_uses(material_id: str, store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    material = store.get_material(material_id)
    if material is None:
        raise not_found("Material")
    return envelope({
        "material": material.canonical_name,
        "uses": [{**item.model_dump(), "label": "Potential use — verify suitability with buyer"} for item in material.uses],
    })

@router.get("/api/reference/impact-methodologies")
def get_impact_methodologies(store: DemoStore = Depends(get_store)) -> dict[str, Any]:
    return envelope({
        "methodologies": [item.model_dump() for item in store.list_impact_methodologies()],
        "notice": "These are demo methodology records. They are not a verified LCA, GHG inventory, or external reporting claim.",
    })

