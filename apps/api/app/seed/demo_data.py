from __future__ import annotations

from copy import deepcopy
from typing import Any

from app.schemas.models import (
    Company,
    ImpactMethodology,
    Material,
    MaterialUse,
    ScoringConfig,
    User,
)

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
    textile_uses = [
        MaterialUse(
            id="use-textile-yarn",
            material_id="mat-cotton-textile",
            title="Recycled yarn feedstock",
            description="Potential use after fibre sorting and buyer quality checks.",
            pathway_type="fibre_recycling",
            recovery_factor=0.72,
            virgin_displacement_factor=0.70,
            assumptions={"label": "Illustrative / Demo Data"},
        ),
        MaterialUse(
            id="use-textile-insulation",
            material_id="mat-cotton-textile",
            title="Insulation material",
            description="Potential nonwoven or insulation pathway subject to processing requirements.",
            pathway_type="nonwoven_recovery",
            recovery_factor=0.68,
            virgin_displacement_factor=0.55,
            assumptions={"label": "Illustrative / Demo Data"},
        ),
        MaterialUse(
            id="use-textile-wipes",
            material_id="mat-cotton-textile",
            title="Industrial wiping material",
            description="Potential use where cleanliness and fibre composition are verified.",
            pathway_type="reuse_recovery",
            recovery_factor=0.80,
            virgin_displacement_factor=0.50,
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
    steel_uses = [
        MaterialUse(
            id="use-steel-remelt",
            material_id="mat-steel-scrap",
            title="Steel re-melt feedstock",
            description="Potential use after grade separation and processor acceptance checks.",
            pathway_type="metal_recycling",
            recovery_factor=0.92,
            virgin_displacement_factor=0.90,
            assumptions={"label": "Illustrative / Demo Data"},
        ),
        MaterialUse(
            id="use-steel-blend",
            material_id="mat-steel-scrap",
            title="Secondary scrap blend",
            description="Potential processing pathway subject to buyer specifications.",
            pathway_type="metal_recycling",
            recovery_factor=0.86,
            virgin_displacement_factor=0.80,
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
            id="mat-cotton-textile",
            canonical_name="Cotton textile cutting waste",
            category="Textile",
            aliases=["cotton cutting waste", "textile cutting waste", "cotton scraps", "fabric offcuts"],
            quality_scale=["unknown", "mixed", "standard", "industrial", "premium"],
            notes="Controlled MVP material. Composition and cleanliness require buyer verification.",
            uses=textile_uses,
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
        Material(
            id="mat-steel-scrap",
            canonical_name="Mild-steel fabrication scrap",
            category="Metal",
            aliases=["steel scrap", "mild steel scrap", "metal fabrication scrap", "ms scrap"],
            quality_scale=["unknown", "mixed", "standard", "industrial", "premium"],
            notes="Controlled MVP material. Grade separation and contaminant checks are required.",
            uses=steel_uses,
        ),
    ]

    # Minimal demo companies — only for the unauthenticated demo-persona mode.
    # Real users authenticated via Supabase get their own company created on signup.
    companies = [
        Company(
            id="comp-gen-demo",
            owner_user_id="user-generator",
            name="Demo Generator Co.",
            company_type="generator",
            city="Delhi",
            address_label="Demo location — not a real company",
            latitude=28.6139,
            longitude=77.2090,
            verification_status="demo",
            is_demo=True,
        ),
        Company(
            id="comp-buyer-demo",
            owner_user_id="user-buyer",
            name="Demo Buyer Co.",
            company_type="recycler",
            city="Delhi",
            address_label="Demo location — not a real company",
            latitude=28.6139,
            longitude=77.2090,
            verification_status="demo",
            is_demo=True,
        ),
    ]

    # 3 demo users — only used for unauthenticated demo-persona API access.
    # Real users authenticate via Supabase JWT and are bootstrapped in dependencies.py.
    users = [
        User(
            id="user-generator",
            full_name="Demo Generator",
            email="generator@circularmatch.demo",
            role="generator",
            company_id="comp-gen-demo",
            is_demo=True,
        ),
        User(
            id="user-buyer",
            full_name="Demo Buyer",
            email="buyer@circularmatch.demo",
            role="buyer",
            company_id="comp-buyer-demo",
            is_demo=True,
        ),
        User(
            id="user-admin",
            full_name="Demo Admin",
            email="admin@circularmatch.demo",
            role="admin",
            company_id=None,
            is_demo=True,
        ),
    ]

    return {
        "materials": materials,
        "companies": companies,
        "users": users,
        # All of the following start empty — real user data is loaded from Supabase Storage
        "listings": [],
        "requirements": [],
        "lots": [],
        "evidence": [],
        "acceptance_specs": [],
        "impact_methodologies": [
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
        ],
        "sample_requests": [],
        "offers": [],
        "shipments": [],
        "audit_events": [],
        "scoring_config": ScoringConfig(),
        "transactions": [],
    }

def fresh_seed_data(include_sample_entities: bool = False) -> dict[str, Any]:
    """Return a deep copy of the minimal seed. No demo listings or requirements included."""
    return deepcopy(build_seed_data(include_sample_entities=include_sample_entities))
