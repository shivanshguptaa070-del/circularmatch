from app.main import company_view, material_view, evidence_view, passport_readiness, lot_view, listing_view, default_acceptance_spec, acceptance_spec_view, requirement_view, match_card_view, sort_matches, recompute_listing_matches, ensure_listing_matches, recompute_requirement_matches, timeline_for_match
from app.core.responses import envelope, not_found
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status, UploadFile, File
from app.core.dependencies import get_current_user, get_store, require_roles, can_access_listing, can_access_requirement, can_participate_in_match
from app.core.storage import upload_document, get_download_url
from app.repositories.demo_store import DemoStore
from app.schemas.models import *
from app.services.calculators import *
from app.services.extraction import extract_waste
from app.services.matching import *
from app.services.email_service import send_contact_notification
from app.seed.demo_data import city_coordinates

router = APIRouter()

@router.post("/api/listings/{listing_id}/recompute-matches")
@router.post("/api/listings/{listing_id}/matches/recompute")
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
    store.add_audit_event(entity_type="listing", entity_id=listing.id, action="matches_recomputed", actor_id=current_user.id, summary=f"{len(matches)} material-compatible buyer requirements analyzed; {eligible_count} eligible and {attention_count} requiring attention.", is_demo=current_user.is_demo)
    return envelope({
        "listing": listing_view(store, listing),
        "matches": [match_card_view(store, item) for item in matches],
        "decision_rule_label": "MVP decision rules — configurable, not scientifically optimal.",
        "message": f"Analyzed {len(store.list_requirements(active_only=True))} active buyer requirements. {eligible_count} are eligible now; the rest show explicit next actions.",
    })

@router.get("/api/listings/{listing_id}/matches")
def get_listing_matches(
    listing_id: str,
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    listing = store.get_listing(listing_id)
    if listing is None:
        raise not_found("Listing")
    if not can_access_listing(current_user, listing):
        raise HTTPException(status_code=403, detail="You cannot access matches for this listing.")
    matches = ensure_listing_matches(store, listing)
    return envelope({
        "listing": listing_view(store, listing),
        "matches": [match_card_view(store, item) for item in matches],
        "decision_rule_label": "MVP decision rules — configurable, not scientifically optimal.",
    })

@router.get("/api/buyer-requirements/{requirement_id}/matches")
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

@router.get("/api/matches/{match_id}/timeline")
def get_match_timeline(
    match_id: str,
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    match = store.get_match(match_id)
    if match is None:
        raise not_found("Match")
    listing = store.get_listing(match.listing_id)
    requirement = store.get_requirement(match.buyer_requirement_id)
    if not listing or not requirement or not can_participate_in_match(current_user, listing, requirement):
        raise HTTPException(status_code=403, detail="You cannot access this match's timeline.")
    return envelope({
        "match_id": match_id,
        "events": timeline_for_match(store, match_id),
        "notice": "Timeline entries are demo operational records, not a contract, payment record, or legally sufficient chain-of-custody document.",
    })

@router.get("/api/matches/{match_id}")
def get_match_detail(
    match_id: str,
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
        raise HTTPException(status_code=403, detail="You cannot access this match.")
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

@router.post("/api/matches/{match_id}/contact")
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
    if match.status != "suggested":
        raise HTTPException(status_code=409, detail="Workflow out of sequence: Match has already been contacted or completed.")
    if not can_participate_in_match(current_user, listing, requirement):
        raise HTTPException(status_code=403, detail="You are not a participant in this match.")

    updated = store.update_match(match_id, {"status": "contacted"})
    note = request.note.strip()

    # Get the quantity from the listing for the transaction record
    matched_quantity_kg = listing.normalized_kg_per_week or 0

    transaction = store.add_transaction(
        match_id=match_id,
        listing_id=listing.id,
        initiated_by=current_user.id,
        note=note or "Contact made — match accepted.",
        # Mark as accepted so the dashboard Successful Matches / Sales / Purchases counter increments
        status="accepted",
        agreed_quantity_kg=matched_quantity_kg,
        is_demo=current_user.is_demo,
    )
    store.add_audit_event(
        entity_type="match",
        entity_id=match_id,
        action="contact_recorded",
        actor_id=current_user.id,
        summary=f"Contact made by {current_user.full_name} ({current_user.role}, is_demo=current_user.is_demo) — match recorded as successful.",
    )

    # ── Find the other party and send them a real email ─────────────────────
    material = store.get_material(listing.material_id)
    material_name = material.canonical_name if material else "waste material"
    match_url = f"{settings.frontend_base_url}/matches/{match_id}"

    # Determine who is the recipient (the other party)
    sender_role = current_user.role  # "buyer" or "generator"
    if current_user.role == "buyer":
        # Buyer is contacting the generator — find the generator's user account
        gen_company = store.get_company(listing.company_id)
        recipient_user = next(
            (
                u for u in store.users.values()
                if u.company_id == listing.company_id and u.role == "generator"
            ),
            None,
        )
    else:
        # Generator is contacting the buyer — find the buyer's user account
        gen_company = store.get_company(requirement.company_id)
        recipient_user = next(
            (
                u for u in store.users.values()
                if u.company_id == requirement.company_id and u.role == "buyer"
            ),
            None,
        )

    email_sent = False
    delivery_msg = "Contact intent recorded."
    if recipient_user is not None:
        email_sent, delivery_msg = send_contact_notification(
            api_key=settings.resend_api_key,
            recipient_name=recipient_user.full_name,
            recipient_email=recipient_user.email,
            sender_name=current_user.full_name,
            sender_email=current_user.email,
            material=material_name,
            match_score=match.total_score,
            note=note,
            match_url=match_url,
            sender_role=sender_role,
            admin_email=settings.admin_email,
        )
    else:
        delivery_msg = "Contact recorded (no recipient account linked to listing)."
        logger.warning(
            "contact_match: could not find a recipient user for match %s (role=%s)",
            match_id,
            sender_role,
        )

    return envelope({
        "match": match_card_view(store, updated or match),
        "transaction": transaction,
        "email_sent": email_sent,
        "message": delivery_msg,
    })

@router.post("/api/matches/{match_id}/sample-requests", status_code=201)
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
    if match.status not in ["suggested", "contacted"]:
        raise HTTPException(status_code=409, detail="Workflow out of sequence: Cannot request sample for a completed or rejected match.")
    sample = SampleRequest(
        id=store.new_id("sample"),
        match_id=match_id,
        requested_by=current_user.id,
        requested_quantity_kg=request.requested_quantity_kg,
        note=request.note,
        created_at=store.timestamp(),
        updated_at=store.timestamp(),
        is_demo=current_user.is_demo,
    )
    store.create_sample_request(sample)
    store.update_match(match_id, {"status": "contacted"})
    store.add_audit_event(entity_type="match", entity_id=match_id, action="sample_requested", actor_id=current_user.id, summary=f"A {sample.requested_quantity_kg:,.0f} kg demo sample/inspection request was created.", is_demo=current_user.is_demo)
    return envelope({"sample_request": sample.model_dump(), "timeline": timeline_for_match(store, match_id), "message": "Demo sample request recorded. It is not a transport instruction or quality acceptance."})

@router.post("/api/matches/{match_id}/offers", status_code=201)
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
    if match.status not in ["suggested", "contacted"]:
        raise HTTPException(status_code=409, detail="Workflow out of sequence: Cannot create offer for a completed or rejected match.")
    offer = Offer(
        id=store.new_id("offer"),
        match_id=match_id,
        offered_by=current_user.id,
        price_per_kg=request.price_per_kg,
        quantity_kg=request.quantity_kg,
        pickup_model=request.pickup_model,
        note=request.note,
        created_at=store.timestamp(),
        is_demo=current_user.is_demo,
    )
    store.create_offer(offer)
    store.add_audit_event(entity_type="match", entity_id=match_id, action="offer_sent", actor_id=current_user.id, summary=f"Demo offer sent for {offer.quantity_kg:,.0f} kg at ₹{offer.price_per_kg:,.2f}/kg.", is_demo=current_user.is_demo)
    return envelope({"offer": offer.model_dump(), "timeline": timeline_for_match(store, match_id), "message": "Illustrative offer recorded. It is not a binding commercial agreement."})

@router.post("/api/matches/{match_id}/shipments", status_code=201)
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
    if match.status in ["rejected"]:
        raise HTTPException(status_code=409, detail="Workflow out of sequence: Cannot create shipment for a rejected match.")
    shipment = Shipment(
        id=store.new_id("shipment"),
        match_id=match_id,
        planned_quantity_kg=request.planned_quantity_kg,
        pickup_date=request.pickup_date,
        pickup_model=request.pickup_model,
        carrier_name=request.carrier_name,
        created_at=store.timestamp(),
        updated_at=store.timestamp(),
        is_demo=current_user.is_demo,
    )
    store.create_shipment(shipment)
    store.add_audit_event(entity_type="match", entity_id=match_id, action="pickup_planned", actor_id=current_user.id, summary=f"Demo pickup planned for {shipment.planned_quantity_kg:,.0f} kg on {shipment.pickup_date}.", is_demo=current_user.is_demo)
    return envelope({"shipment": shipment.model_dump(), "timeline": timeline_for_match(store, match_id), "message": "Demo pickup plan recorded. It is not live fleet dispatch or a transport contract."})


@router.patch("/api/sample-requests/{sample_id}")
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
    store.add_audit_event(
        entity_type="match",
        entity_id=match.id,
        action="sample_updated",
        actor_id=current_user.id,
        summary=f"Demo sample request updated to {updated.status}.",
        is_demo=current_user.is_demo,
    )
    return envelope({
        "sample_request": updated.model_dump(),
        "timeline": timeline_for_match(store, match.id),
        "message": "Sample status updated in Demo Mode. Recomputed eligibility will use the new sample status.",
    })


@router.patch("/api/offers/{offer_id}")
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
    store.add_audit_event(
        entity_type="match",
        entity_id=match.id,
        action="offer_updated",
        actor_id=current_user.id,
        summary=f"Demo offer updated to {updated.status}.",
        is_demo=current_user.is_demo,
    )
    return envelope({
        "offer": updated.model_dump(),
        "timeline": timeline_for_match(store, match.id),
        "message": "Offer status updated in Demo Mode. It remains non-binding.",
    })


@router.patch("/api/shipments/{shipment_id}")
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
    store.add_audit_event(
        entity_type="match",
        entity_id=match.id,
        action="shipment_updated",
        actor_id=current_user.id,
        summary=audit_summary,
        is_demo=current_user.is_demo,
    )
    return envelope({
        "shipment": updated.model_dump(),
        "timeline": timeline_for_match(store, match.id),
        "message": "Shipment status updated in Demo Mode. It remains illustrative.",
    })

