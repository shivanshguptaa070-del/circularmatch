from fastapi.testclient import TestClient

from app.core.dependencies import store
from app.main import app

client = TestClient(app)
GENERATOR = {"X-Demo-User-Id": "user-generator"}
BUYER = {"X-Demo-User-Id": "user-buyer"}
ADMIN = {"X-Demo-User-Id": "user-admin"}


def test_material_passport_and_eligibility_gate_flow() -> None:
    store.reset()

    passport_response = client.get("/api/listings/listing-pet-demo/passport", headers=GENERATOR)
    assert passport_response.status_code == 200
    passport = passport_response.json()["data"]
    assert passport["lots"][0]["lot_code"] == "PET-NOI-W33"
    assert passport["lots"][0]["evidence"][0]["status"] in {"uploaded", "self_declared"}
    assert passport["readiness"]["status"] == "sample_ready"

    ranked_response = client.post("/api/listings/listing-pet-demo/matches/recompute", headers=GENERATOR)
    assert ranked_response.status_code == 200
    matches = ranked_response.json()["data"]["matches"]
    top = matches[0]
    assert top["buyer"] == "ReLoop Polymers"
    assert top["eligibility_status"] == "needs_sample"
    assert top["lot_id"] == "lot-pet-demo"
    assert any(check["key"] == "sample" for check in top["eligibility_checks"])

    spec_response = client.patch(
        "/api/buyer-requirements/req-pet-top/acceptance-spec",
        headers=BUYER,
        json={
            "accepted_forms": ["Manufacturing trim"],
            "accepted_colours": ["Clear"],
            "prohibited_materials": ["PVC"],
            "required_evidence_status": "self_declared",
            "requires_sample": False,
            "available_capacity_kg_week": 5000,
            "route_note": "Demo non-food route.",
            "review_note": "Demo update.",
        },
    )
    assert spec_response.status_code == 200

    refreshed = client.post("/api/listings/listing-pet-demo/matches/recompute", headers=GENERATOR).json()["data"]["matches"]
    assert refreshed[0]["eligibility_status"] == "eligible"


def test_evidence_review_and_transaction_timeline() -> None:
    store.reset()
    # A generator cannot self-elevate uploaded evidence into a reviewed/test-reviewed state.
    evidence_response = client.post(
        "/api/lots/lot-pet-demo/evidence",
        headers=GENERATOR,
        json={
            "evidence_type": "test_report",
            "title": "Demo material report",
            "issuer": "Demo laboratory",
            "status": "test_reviewed",
            "summary": "Demo report; not a real laboratory result.",
            "document_name": "demo-report.pdf",
        },
    )
    assert evidence_response.status_code == 201
    evidence = evidence_response.json()["data"]["evidence"]
    assert evidence["status"] == "uploaded"

    reviewed = client.patch(
        f"/api/admin/evidence/{evidence['id']}/review",
        headers=ADMIN,
        json={"status": "test_reviewed", "review_note": "Admin demo review."},
    )
    assert reviewed.status_code == 200
    assert reviewed.json()["data"]["evidence"]["status"] == "test_reviewed"

    matches = client.post("/api/listings/listing-pet-demo/matches/recompute", headers=GENERATOR).json()["data"]["matches"]
    match_id = matches[0]["id"]

    sample = client.post(
        f"/api/matches/{match_id}/sample-requests",
        headers=BUYER,
        json={"requested_quantity_kg": 20, "note": "Demo sample before commercial decision."},
    )
    assert sample.status_code == 201

    offer = client.post(
        f"/api/matches/{match_id}/offers",
        headers=BUYER,
        json={"price_per_kg": 15, "quantity_kg": 2500, "pickup_model": "buyer_pickup", "note": "Demo offer only."},
    )
    assert offer.status_code == 201

    shipment = client.post(
        f"/api/matches/{match_id}/shipments",
        headers=GENERATOR,
        json={"planned_quantity_kg": 2500, "pickup_date": "2026-08-17", "pickup_model": "buyer_pickup", "carrier_name": "Demo carrier"},
    )
    assert shipment.status_code == 201

    sample_id = sample.json()["data"]["sample_request"]["id"]
    offer_id = offer.json()["data"]["offer"]["id"]
    shipment_id = shipment.json()["data"]["shipment"]["id"]
    assert client.patch(f"/api/sample-requests/{sample_id}", headers=BUYER, json={"status": "accepted", "note": "Demo sample accepted."}).status_code == 200
    assert client.patch(f"/api/offers/{offer_id}", headers=BUYER, json={"status": "accepted", "note": "Demo offer accepted."}).status_code == 200
    received = client.patch(
        f"/api/shipments/{shipment_id}",
        headers=GENERATOR,
        json={"status": "received", "dispatched_weight_kg": 2500, "received_weight_kg": 2480, "receipt_note": "Demo receipt record."},
    )
    assert received.status_code == 200

    timeline = client.get(f"/api/matches/{match_id}/timeline", headers=GENERATOR)
    assert timeline.status_code == 200
    timeline_events = timeline.json()["data"]["events"]
    timeline_types = {item["type"] for item in timeline_events}
    assert {"sample_request", "offer", "shipment"}.issubset(timeline_types)
    assert any(item["type"] == "shipment" and item["status"] == "received" for item in timeline_events)
