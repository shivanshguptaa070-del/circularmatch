from fastapi.testclient import TestClient
from app.core.dependencies import store
from app.main import app
from app.schemas.models import WasteListing

client = TestClient(app)
GENERATOR_HEADERS = {"X-Demo-User-Id": "user-generator"}
BUYER_HEADERS = {"X-Demo-User-Id": "user-buyer"}
ADMIN_HEADERS = {"X-Demo-User-Id": "user-admin"}


def test_demo_accounts_non_zero_kpis() -> None:
    store.reset()

    # 1. Generator dashboard summary
    gen_res = client.get("/api/dashboard/summary", headers=GENERATOR_HEADERS)
    assert gen_res.status_code == 200
    gen_data = gen_res.json()["data"]
    assert gen_data["role"] == "generator"
    kpis = gen_data["kpis"]
    assert kpis["total_waste_listed_kg_week"] > 0
    assert kpis["active_buyer_matches"] > 0
    assert kpis["successful_sales"] > 0
    assert kpis["potential_revenue_inr"] > 0
    assert len(gen_data["charts"]["waste_by_category"]) > 0

    # 2. Buyer dashboard summary
    buyer_res = client.get("/api/dashboard/summary", headers=BUYER_HEADERS)
    assert buyer_res.status_code == 200
    buyer_data = buyer_res.json()["data"]
    assert buyer_data["role"] == "buyer"
    b_kpis = buyer_data["kpis"]
    assert b_kpis["total_procurement_target_kg_week"] > 0
    assert b_kpis["active_seller_matches"] > 0
    assert b_kpis["successful_purchases"] > 0
    assert b_kpis["estimated_cost_savings_inr"] > 0
    assert len(buyer_data["charts"]["procurement_by_category"]) > 0

    # 3. Admin dashboard summary
    admin_res = client.get("/api/dashboard/summary", headers=ADMIN_HEADERS)
    assert admin_res.status_code == 200
    admin_data = admin_res.json()["data"]
    assert admin_data["role"] == "admin"
    a_kpis = admin_data["kpis"]
    assert a_kpis["total_waste_listed_kg_week"] > 0
    assert a_kpis["total_waste_matched_kg"] > 0
    assert a_kpis["active_buyers"] > 0
    assert a_kpis["successful_matches"] > 0
    assert a_kpis["potential_economic_value_inr"] > 0


def test_admin_endpoints_and_audit_events() -> None:
    store.reset()

    listings_res = client.get("/api/admin/listings", headers=ADMIN_HEADERS)
    assert listings_res.status_code == 200
    assert listings_res.json()["data"]["count"] > 0

    matches_res = client.get("/api/admin/matches", headers=ADMIN_HEADERS)
    assert matches_res.status_code == 200
    assert matches_res.json()["data"]["count"] > 0

    audit_res = client.get("/api/admin/audit-events", headers=ADMIN_HEADERS)
    assert audit_res.status_code == 200
    assert audit_res.json()["data"]["count"] > 0


def test_notifications_endpoint() -> None:
    store.reset()
    res = client.get("/api/notifications", headers=GENERATOR_HEADERS)
    assert res.status_code == 200
    notifs = res.json()["data"]["notifications"]
    assert len(notifs) > 0

    # Read notification
    notif_id = notifs[0]["id"]
    read_res = client.patch(f"/api/notifications/{notif_id}/read", headers=GENERATOR_HEADERS)
    assert read_res.status_code == 200
    assert read_res.json()["data"]["notification"]["is_read"] is True


def test_hard_rule_real_user_data_untouched_on_demo_reset() -> None:
    store.reset()

    # Create a real user listing (is_demo=False)
    real_listing = WasteListing(
        id="listing-real-user-12345",
        company_id="comp-real-prod",
        material_id="mat-pet",
        raw_description="Real production user listing that must never be touched",
        source="manual",
        quantity_kg=50000,
        frequency="monthly",
        normalized_kg_per_week=12500,
        quality_grade="industrial",
        quality_verified=True,
        quality_notes="Real verified material",
        availability="Immediate",
        city="Mumbai",
        latitude=19.0760,
        longitude=72.8777,
        asking_price_per_kg=30,
        disposal_cost_per_kg=10,
        status="active",
        selected_use_id="use-pet-recycling",
        is_demo=False,
        created_at="2026-03-01T08:00:00Z",
    )
    store.create_listing(real_listing)

    # Verify it exists
    assert store.get_listing("listing-real-user-12345") is not None
    assert store.get_listing("listing-real-user-12345").is_demo is False

    # Execute demo reset
    reset_res = client.post("/api/auth/demo-reset", headers=ADMIN_HEADERS)
    assert reset_res.status_code == 200

    # Real listing MUST still exist untouched!
    retained_listing = store.get_listing("listing-real-user-12345")
    assert retained_listing is not None
    assert retained_listing.id == "listing-real-user-12345"
    assert retained_listing.is_demo is False
    assert retained_listing.quantity_kg == 50000
