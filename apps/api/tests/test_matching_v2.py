import pytest
from app.schemas.models import BuyerRequirement, WasteListing, MaterialLot, QualityEvidence, ScoringConfig, Material
from app.services.matching import (
    material_score,
    quantity_score,
    quality_score,
    location_score,
    evidence_score,
    calculate_match,
)


@pytest.fixture
def base_material():
    return Material(
        id="mat-pet",
        canonical_name="Polyethylene Terephthalate (PET)",
        category="Plastics",
        aliases=[],
        quality_scale=["mixed", "standard", "industrial", "premium"],
        supported=True,
        notes="",
        uses=[],
    )


@pytest.fixture
def base_listing():
    return WasteListing(
        id="listing-1",
        company_id="comp-1",
        material_id="mat-pet",
        raw_description="Clean washed PET flake",
        quantity_kg=2000,
        frequency="weekly",
        normalized_kg_per_week=2000,
        quality_grade="industrial", # Grade A
        contamination_level="low",
        city="Noida",
        latitude=28.5355,
        longitude=77.3910,
        created_at="2026-09-20T10:00:00Z",
    )


@pytest.fixture
def base_requirement():
    return BuyerRequirement(
        id="req-1",
        company_id="comp-2",
        material_id="mat-pet",
        material_category="Plastics",
        minimum_quantity_kg_week=1000,
        maximum_quantity_kg_week=3000,
        minimum_grade="A",
        maximum_contamination="low",
        city="Noida",
        preferred_location="Noida",
        maximum_distance_km=100,
        latitude=28.5355,
        longitude=77.3910,
        created_at="2026-09-20T10:00:00Z",
    )


def test_material_score(base_listing, base_requirement, base_material):
    # Exact category match = 35
    assert material_score(base_listing, base_requirement, base_material) == 35.0

    # No match = 0
    diff_req = base_requirement.model_copy(update={"material_category": "Metals", "material_id": "mat-steel"})
    assert material_score(base_listing, diff_req, base_material) == 0.0


def test_quantity_score(base_listing, base_requirement):
    # Supplier qty within buyer range (1000-3000, supplier is 2000) = 20
    assert quantity_score(base_listing, base_requirement) == 20.0

    # Within 20% of range:
    # 20% below min (800-999) or 20% above max (3001-3600) = 12
    near_listing = base_listing.model_copy(update={"normalized_kg_per_week": 3400})
    assert quantity_score(near_listing, base_requirement) == 12.0

    # Outside range (> 3600 or < 800) = 5
    far_listing = base_listing.model_copy(update={"normalized_kg_per_week": 5000})
    assert quantity_score(far_listing, base_requirement) == 5.0


def test_quality_score(base_listing, base_requirement):
    # Listing is industrial (Grade A), contamination is low
    # Requirement is Grade A, max contamination low
    # Both meet -> 15 + 5 = 20
    assert quality_score(base_listing, base_requirement) == 20.0

    # Contamination exceeded: listing has med, req has low -> grade 15 + contam 0 = 15
    dirty_listing = base_listing.model_copy(update={"contamination_level": "med"})
    assert quality_score(dirty_listing, base_requirement) == 15.0

    # Grade not met: listing is mixed (Grade C), req is Grade A -> grade 0 + contam 5 = 5
    low_grade_listing = base_listing.model_copy(update={"quality_grade": "mixed", "contamination_level": "low"})
    assert quality_score(low_grade_listing, base_requirement) == 5.0


def test_location_score(base_listing, base_requirement):
    # Same city (Noida vs Noida) = 15
    assert location_score(base_listing, base_requirement) == 15.0

    # Same state (Noida and Ghaziabad are both Uttar Pradesh) = 10
    gzb_req = base_requirement.model_copy(update={"preferred_location": "Ghaziabad", "city": "Ghaziabad"})
    assert location_score(base_listing, gzb_req) == 10.0

    # Different state (Noida is UP, Bhiwadi is Rajasthan) = 5
    raj_req = base_requirement.model_copy(update={"preferred_location": "Bhiwadi", "city": "Bhiwadi"})
    assert location_score(base_listing, raj_req) == 5.0


def test_evidence_score():
    # 5 items: form, colour, packaging, storage, evidence doc
    lot_full = MaterialLot(
        id="lot-1",
        listing_id="listing-1",
        lot_code="LOT-1",
        available_quantity_kg=1000,
        material_form="Flakes",
        colour="Clear",
        packaging="Bales",
        storage_condition="Indoor warehouse",
        created_at="2026-09-20T10:00:00Z",
    )
    evidence_list = [
        QualityEvidence(
            id="ev-1",
            lot_id="lot-1",
            evidence_type="test_report",
            title="Lab Test",
            created_at="2026-09-20T10:00:00Z",
        )
    ]
    # 5 items = 10
    assert evidence_score(lot_full, evidence_list) == 10.0

    # 4 items (remove evidence doc) = 8
    assert evidence_score(lot_full, []) == 8.0

    # 3 items (remove colour) = 5
    lot_3 = lot_full.model_copy(update={"colour": "not specified"})
    assert evidence_score(lot_3, []) == 5.0

    # Below 3 = 2
    lot_1 = lot_full.model_copy(update={"colour": "not specified", "packaging": "not specified", "storage_condition": "not specified"})
    assert evidence_score(lot_1, []) == 2.0


def test_total_composite_score_and_storage(base_listing, base_requirement, base_material):
    lot_full = MaterialLot(
        id="lot-1",
        listing_id="listing-1",
        lot_code="LOT-1",
        available_quantity_kg=1000,
        material_form="Flakes",
        colour="Clear",
        packaging="Bales",
        storage_condition="Indoor warehouse",
        created_at="2026-09-20T10:00:00Z",
    )
    evidence_list = [
        QualityEvidence(
            id="ev-1",
            lot_id="lot-1",
            evidence_type="test_report",
            title="Lab Test",
            created_at="2026-09-20T10:00:00Z",
        )
    ]
    scoring_config = ScoringConfig()
    match = calculate_match(
        base_listing,
        base_requirement,
        base_material,
        scoring_config,
        lot=lot_full,
        evidence=evidence_list,
    )

    assert match is not None
    # Perfect match: 35 + 20 + 20 + 15 + 10 = 100 pts
    assert match.total_score == 100.0
    assert match.material_score == 35.0
    assert match.quantity_score == 20.0
    assert match.quality_score == 20.0
    assert match.distance_score == 15.0 # Location
    assert match.environment_score == 10.0 # Evidence
    # MatchRecord stores buyer_requirement_id, material_id, total_score, individual scores, timestamp
    assert match.buyer_requirement_id == base_requirement.id
    assert match.material_id == base_listing.material_id
    assert match.created_at is not None
