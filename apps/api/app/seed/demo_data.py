from __future__ import annotations

from copy import deepcopy
from typing import Any

from app.schemas.models import (
    BuyerAcceptanceSpec,
    BuyerRequirement,
    Company,
    ImpactMethodology,
    Material,
    MaterialLot,
    MaterialUse,
    QualityEvidence,
    ScoringConfig,
    User,
    WasteListing,
)

DEMO_TIMESTAMP = "2026-08-12T09:30:00+05:30"

# These are city-centre/sample coordinates for a fictional demonstration only.
CITY_COORDINATES: dict[str, tuple[float, float]] = {
    "noida": (28.5355, 77.3910),
    "ghaziabad": (28.6692, 77.4538),
    "new delhi": (28.6139, 77.2090),
    "delhi": (28.6139, 77.2090),
    "gurugram": (28.4595, 77.0266),
    "gurgaon": (28.4595, 77.0266),
    "faridabad": (28.4089, 77.3178),
    "manesar": (28.3553, 76.9369),
    "bhiwadi": (28.2100, 76.8606),
    "sonipat": (28.9931, 77.0151),
}


def city_coordinates(city: str) -> tuple[float, float] | None:
    normalized = city.strip().lower()
    if normalized in CITY_COORDINATES:
        return CITY_COORDINATES[normalized]
    for known_city, coords in CITY_COORDINATES.items():
        if known_city in normalized or normalized in known_city:
            return coords
    return None


def build_seed_data(include_sample_entities: bool = False) -> dict[str, Any]:
    pet_uses = [
        MaterialUse(
            id="use-pet-recycling",
            material_id="mat-pet",
            title="Recycled PET feedstock",
            description="Potential use after buyer-side sorting, processing, and quality checks.",
            pathway_type="mechanical_recycling",
            recovery_factor=0.85,
            virgin_displacement_factor=0.85,
            assumptions={
                "label": "Illustrative / Demo Data",
                "recovery_note": "Illustrative recovery factor; not a yield guarantee.",
            },
        ),
        MaterialUse(
            id="use-pet-fibre",
            material_id="mat-pet",
            title="Polyester fibre feedstock",
            description="Potential downstream use where the recycler and buyer confirm suitability.",
            pathway_type="secondary_feedstock",
            recovery_factor=0.76,
            virgin_displacement_factor=0.70,
            assumptions={"label": "Illustrative / Demo Data"},
        ),
        MaterialUse(
            id="use-pet-products",
            material_id="mat-pet",
            title="Plastic processing feedstock",
            description="Potential use in suitable non-food processing pathways after verification.",
            pathway_type="secondary_feedstock",
            recovery_factor=0.70,
            virgin_displacement_factor=0.65,
            assumptions={"label": "Illustrative / Demo Data"},
        ),
    ]
    paper_uses = [
        MaterialUse(
            id="use-paper-board",
            material_id="mat-paper-cardboard",
            title="Recycled paperboard feedstock",
            description="Potential pulping route subject to moisture and contamination checks.",
            pathway_type="paper_recycling",
            recovery_factor=0.82,
            virgin_displacement_factor=0.75,
            assumptions={"label": "Illustrative / Demo Data"},
        ),
        MaterialUse(
            id="use-paper-pulp",
            material_id="mat-paper-cardboard",
            title="Moulded pulp products",
            description="Potential use after buyer-side fibre and contamination evaluation.",
            pathway_type="paper_recycling",
            recovery_factor=0.70,
            virgin_displacement_factor=0.62,
            assumptions={"label": "Illustrative / Demo Data"},
        ),
    ]

    materials = [
        Material(
            id="mat-pet",
            canonical_name="PET industrial scrap",
            category="Plastic",
            aliases=["pet scrap", "pet manufacturing scrap", "pet waste", "polyethylene terephthalate"],
            quality_scale=["unknown", "mixed", "standard", "industrial", "premium"],
            notes="Controlled MVP material. Quality remains Not verified unless documentary verification is recorded.",
            uses=pet_uses,
        ),
        Material(
            id="mat-paper-cardboard",
            canonical_name="Corrugated cardboard and paper trim",
            category="Paper / Cardboard",
            aliases=["cardboard waste", "occ", "paper trim", "corrugated scrap"],
            quality_scale=["unknown", "mixed", "standard", "industrial", "premium"],
            notes="Controlled MVP material. Moisture and contamination must be checked by buyer.",
            uses=paper_uses,
        ),
    ]

    companies = [
        Company(
            id="comp-gen-pet",
            owner_user_id="user-generator",
            name="Noida PackForm Industries",
            company_type="generator",
            city="Noida",
            address_label="Sector 63, Noida — Demo location",
            latitude=28.5355,
            longitude=77.3910,
        ),
        Company(
            id="comp-gen-paper",
            name="GreenFold Paperboard",
            company_type="generator",
            city="Faridabad",
            address_label="Sector 24, Faridabad — Demo location",
            latitude=28.4050,
            longitude=77.3100,
        ),
        Company(
            id="comp-buyer-pet-top",
            owner_user_id="user-buyer",
            name="ReLoop Polymers",
            company_type="recycler",
            city="Manesar",
            address_label="Industrial Area, Manesar — Demo location",
            latitude=28.3553,
            longitude=76.9369,
        ),
    ]

    users = [
        User(
            id="user-generator",
            full_name="Aarav Sharma",
            email="generator@circularmatch.demo",
            role="generator",
            company_id="comp-gen-pet",
        ),
        User(
            id="user-buyer",
            full_name="Kiran Mehta",
            email="buyer@circularmatch.demo",
            role="buyer",
            company_id="comp-buyer-pet-top",
        ),
        User(
            id="user-admin",
            full_name="Rhea Kapoor",
            email="admin@circularmatch.demo",
            role="admin",
            company_id=None,
        ),
    ]

    listings = [
        WasteListing(
            id="listing-pet-demo",
            company_id="comp-gen-pet",
            material_id="mat-pet",
            raw_description="Illustrative demo listing: approximately 2.6 tonnes of clean PET manufacturing scrap each week in Noida.",
            source="demo",
            quantity_kg=2600,
            frequency="weekly",
            normalized_kg_per_week=2600,
            quality_grade="industrial",
            quality_verified=False,
            quality_notes="Supplier-declared clean industrial scrap. Certification not supplied in demo data.",
            availability="Every Monday",
            city="Noida",
            latitude=28.5355,
            longitude=77.3910,
            asking_price_per_kg=14.0,
            disposal_cost_per_kg=8.0,
            selected_use_id="use-pet-recycling",
            is_demo=True,
            created_at=DEMO_TIMESTAMP,
        ),
        WasteListing(
            id="listing-paper-demo",
            company_id="comp-gen-paper",
            material_id="mat-paper-cardboard",
            raw_description="Illustrative demo listing: corrugated cardboard and paper trim from Faridabad.",
            source="demo",
            quantity_kg=6000,
            frequency="weekly",
            normalized_kg_per_week=6000,
            quality_grade="industrial",
            quality_verified=False,
            quality_notes="Moisture and contamination not verified in demo data.",
            availability="Weekdays",
            city="Faridabad",
            latitude=28.4050,
            longitude=77.3100,
            asking_price_per_kg=6.5,
            disposal_cost_per_kg=3.0,
            selected_use_id="use-paper-board",
            is_demo=True,
            created_at=DEMO_TIMESTAMP,
        ),
    ]

    requirements = [
        BuyerRequirement(
            id="req-pet-top",
            company_id="comp-buyer-pet-top",
            material_id="mat-pet",
            minimum_quantity_kg_week=2000,
            maximum_quantity_kg_week=5000,
            minimum_quality_grade="industrial",
            maximum_distance_km=150,
            target_price_per_kg=17.5,
            allow_partial_quantity=True,
            city="Manesar",
            latitude=28.3553,
            longitude=76.9369,
            created_at=DEMO_TIMESTAMP,
        ),
    ]

    lots = [
        MaterialLot(
            id="lot-pet-demo",
            listing_id="listing-pet-demo",
            lot_code="PET-NOI-W33",
            available_quantity_kg=2600,
            material_form="Manufacturing trim",
            source_status="pre_consumer",
            colour="Clear",
            packaging="Baled sacks",
            storage_condition="Covered indoor storage; supplier-declared dry condition.",
            sample_available=True,
            compliance_triage="not_assessed",
            declared_spec={
                "supplier_statement": "Clean PET manufacturing trim; composition and contamination are not independently verified.",
                "intended_route": "Potential non-food mechanical recycling pathway only.",
            },
            evidence_ids=["evidence-pet-declaration", "evidence-pet-photo"],
            created_at=DEMO_TIMESTAMP,
        ),
        MaterialLot(
            id="lot-paper-demo",
            listing_id="listing-paper-demo",
            lot_code="PAPER-FBD-W33",
            available_quantity_kg=6000,
            material_form="Corrugated trim",
            source_status="pre_consumer",
            colour="Brown kraft",
            packaging="Baled",
            storage_condition="Covered warehouse storage; moisture not independently verified.",
            sample_available=False,
            compliance_triage="not_assessed",
            declared_spec={"supplier_statement": "Corrugated cardboard and paper trim."},
            evidence_ids=["evidence-paper-declaration"],
            created_at=DEMO_TIMESTAMP,
        ),
    ]

    evidence = [
        QualityEvidence(
            id="evidence-pet-declaration",
            lot_id="lot-pet-demo",
            evidence_type="supplier_declaration",
            title="Supplier declaration — PET manufacturing trim",
            issuer="Noida PackForm Industries",
            status="self_declared",
            summary="Supplier describes the lot as clean industrial PET manufacturing trim. This is not a laboratory result or composition certificate.",
            created_at=DEMO_TIMESTAMP,
        ),
        QualityEvidence(
            id="evidence-pet-photo",
            lot_id="lot-pet-demo",
            evidence_type="photo",
            title="Lot photo record — demo placeholder",
            issuer="Noida PackForm Industries",
            status="uploaded",
            summary="Demo placeholder for visual lot evidence. Images do not verify composition or contamination.",
            document_name="pet-lot-demo-photo.jpg",
            created_at=DEMO_TIMESTAMP,
        ),
        QualityEvidence(
            id="evidence-paper-declaration",
            lot_id="lot-paper-demo",
            evidence_type="supplier_declaration",
            title="Supplier declaration — corrugated trim",
            issuer="GreenFold Paperboard",
            status="self_declared",
            summary="Supplier describes corrugated cardboard/paper trim; moisture and contamination remain unverified.",
            created_at=DEMO_TIMESTAMP,
        ),
    ]

    acceptance_specs = [
        BuyerAcceptanceSpec(
            id="spec-pet-top",
            buyer_requirement_id="req-pet-top",
            accepted_forms=["Manufacturing trim", "Regrind", "Sheet scrap"],
            accepted_colours=["Clear", "Transparent light blue"],
            prohibited_materials=["PVC", "PETG", "Free-flowing liquids"],
            required_evidence_status="self_declared",
            requires_sample=True,
            available_capacity_kg_week=5000,
            route_note="Potential non-food mechanical recycling feedstock only, subject to buyer inspection and sample approval.",
            review_note="Demo buyer acceptance template — not a universal PET specification.",
            updated_at=DEMO_TIMESTAMP,
        ),
    ]

    impact_methodologies = [
        ImpactMethodology(
            id="method-demo-impact-v1",
            name="CircularMatch illustrative pathway scenario",
            version="demo-impact-v1",
            functional_unit="1 kg of the listed material lot allocated to the matched buyer route",
            system_boundary="Illustrative scenario from listed lot through demo transport and assumed recovery pathway; not a full lifecycle assessment.",
            factor_source="Seeded CircularMatch demo assumptions only — replace with reviewed, route-specific sources before external reporting.",
            data_quality_tier="demo_scenario",
            notes="Potential avoided-emissions scenarios are presented separately from a verified GHG inventory.",
        )
    ]

    return {
        "materials": materials,
        "companies": companies if include_sample_entities else [],
        "users": users if include_sample_entities else [],
        "listings": listings if include_sample_entities else [],
        "requirements": requirements if include_sample_entities else [],
        "lots": lots if include_sample_entities else [],
        "evidence": evidence if include_sample_entities else [],
        "acceptance_specs": acceptance_specs if include_sample_entities else [],
        "impact_methodologies": impact_methodologies,
        "sample_requests": [
            {
                "id": "sample-pet-demo",
                "match_id": "match-listing-pet-demo-req-pet-top",
                "requested_by": "user-buyer",
                "requested_quantity_kg": 25,
                "status": "requested",
                "note": "Sample request for testing",
                "created_at": DEMO_TIMESTAMP,
                "updated_at": DEMO_TIMESTAMP,
                "is_demo": True,
            }
        ] if include_sample_entities else [],
        "offers": [],
        "shipments": [],
        "audit_events": [],
        "scoring_config": ScoringConfig(),
        "transactions": [],
    }


def fresh_seed_data(include_sample_entities: bool = True) -> dict[str, Any]:
    """Return a deep copy so unit tests and demo mode have sample records."""
    return deepcopy(build_seed_data(include_sample_entities=include_sample_entities))
