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

@router.get("/api/map/points")
def map_points(
    match_id: str | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    points: list[dict[str, Any]] = []
    
    # Pre-calculate active matches for anonymization exceptions
    active_match_company_ids = set()
    if current_user.role != "admin" and current_user.company_id:
        active_match_company_ids.add(current_user.company_id)
        # Find all matches involving the user
        for match in store.matches.values():
            if match.eligibility_status != "blocked":
                req = store.get_requirement(match.buyer_requirement_id)
                listng = store.get_listing(match.listing_id)
                if req and listng:
                    if req.company_id == current_user.company_id:
                        active_match_company_ids.add(listng.company_id)
                    elif listng.company_id == current_user.company_id:
                        active_match_company_ids.add(req.company_id)

    for company in store.companies.values():
        related_listings = [item for item in store.listings.values() if item.company_id == company.id]
        related_requirements = [item for item in store.requirements.values() if item.company_id == company.id]
        
        company_data = company.model_dump()
        
        # We are intentionally removing anonymization per user request so proper Indian company names are visible.
        # Original logic fuzzed coordinates and scrubbed names if the user had not interacted with them.
            
        points.append({
            **company_data,
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

