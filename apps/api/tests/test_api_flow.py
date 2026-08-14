from fastapi.testclient import TestClient

from app.core.dependencies import store
from app.main import app

client = TestClient(app)
GENERATOR_HEADERS = {"X-Demo-User-Id": "user-generator"}
BUYER_HEADERS = {"X-Demo-User-Id": "user-buyer"}


def test_end_to_end_generator_listing_to_explainable_match() -> None:
    store.reset()
    description = (
        "We generate around 3 tonnes of PET manufacturing scrap every week in Noida. "
        "The material is clean industrial-grade scrap and is available every Monday."
    )
    extraction = client.post("/api/ai/extract-waste", json={"description": description})
    assert extraction.status_code == 200
    structured = extraction.json()["data"]["structured"]
    assert structured["material_id"] == "mat-pet"
    assert structured["quantity_kg"] == 3000
    assert structured["quality_verified"] is False

    listing_response = client.post(
        "/api/listings",
        headers=GENERATOR_HEADERS,
        json={
            "material_id": "mat-pet",
            "raw_description": description,
            "quantity_kg": 3000,
            "frequency": "weekly",
            "quality_grade": "industrial",
            "quality_verified": False,
            "quality_notes": "Supplier-declared industrial grade; not verified.",
            "availability": "Every Monday",
            "city": "Noida",
            "asking_price_per_kg": 14,
            "disposal_cost_per_kg": 8,
            "selected_use_id": "use-pet-recycling",
        },
    )
    assert listing_response.status_code == 201
    listing_id = listing_response.json()["data"]["listing"]["id"]

    ranked_response = client.post(
        f"/api/listings/{listing_id}/matches/recompute",
        headers=GENERATOR_HEADERS,
    )
    assert ranked_response.status_code == 200
    matches = ranked_response.json()["data"]["matches"]
    assert [item["buyer"] for item in matches] == ["ReLoop Polymers", "NorthStar Reclaim", "MouldCycle Materials"]
    assert matches[0]["total_score"] > matches[1]["total_score"] > matches[2]["total_score"]
    assert any("Verification required" in flag for flag in matches[0]["flags"])

    detail = client.get(f"/api/matches/{matches[0]['id']}")
    assert detail.status_code == 200
    payload = detail.json()["data"]
    assert len(payload["explanation"]["reasons"]) >= 5
    assert payload["economic"]["potential_improvement_vs_disposal"] == round(
        payload["economic"]["net_recovered_value"] + payload["economic"]["avoided_disposal_cost"], 2
    )
    assert payload["impact"]["is_illustrative"] is True


def test_buyer_can_rank_compatible_supply() -> None:
    store.reset()
    response = client.get("/api/buyer-requirements/req-pet-top/matches", headers=BUYER_HEADERS)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["requirement"]["material"] == "PET industrial scrap"
    assert data["matches"]
    assert data["matches"][0]["waste_listing"]["material"] == "PET industrial scrap"
