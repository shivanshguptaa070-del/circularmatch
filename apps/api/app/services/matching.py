from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.schemas.models import (
    BuyerAcceptanceSpec,
    BuyerRequirement,
    EligibilityCheck,
    MatchRecord,
    Material,
    MaterialLot,
    QualityEvidence,
    SampleRequest,
    ScoringConfig,
    WasteListing,
)
from app.services.calculators import (
    economic_value,
    environmental_impact,
    estimate_logistics_per_kg,
    haversine_km,
    selected_material_use,
)

QUALITY_RANK = {
    "unknown": 0,
    "mixed": 1,
    "standard": 2,
    "industrial": 3,
    "premium": 4,
}
EVIDENCE_RANK = {
    "rejected": 0,
    "expired": 0,
    "self_declared": 1,
    "uploaded": 2,
    "reviewed": 3,
    "test_reviewed": 4,
}


def _clamp(value: float, lower: float = 0, upper: float = 100) -> float:
    return max(lower, min(upper, value))


def _normalize(value: str) -> str:
    return " ".join(value.lower().strip().split())


def material_score(listing: WasteListing, requirement: BuyerRequirement) -> float | None:
    # Controlled MVP catalog: exact canonical material is required. Future catalog
    # mappings can introduce explicitly approved compatible grades here.
    return 100.0 if listing.material_id == requirement.material_id else None


def quality_score(listing: WasteListing, requirement: BuyerRequirement) -> float:
    listing_rank = QUALITY_RANK[listing.quality_grade]
    requirement_rank = QUALITY_RANK[requirement.minimum_quality_grade]
    if listing_rank < requirement_rank:
        return 0.0
    # A declared grade that meets the buyer rule remains usable for a lead, but it
    # cannot score as fully verified or be described as certified.
    return 100.0 if listing.quality_verified else 85.0


def quantity_score(listing: WasteListing, requirement: BuyerRequirement) -> float:
    available = listing.normalized_kg_per_week
    minimum = requirement.minimum_quantity_kg_week
    maximum = requirement.maximum_quantity_kg_week
    if minimum <= available <= maximum:
        return 100.0
    if available < minimum:
        return _clamp(100 * (available / minimum))
    if not requirement.allow_partial_quantity:
        return 0.0
    oversupply_ratio = (available - maximum) / maximum
    return _clamp(100 - 85 * oversupply_ratio, lower=15)


def distance_score(distance_km: float, maximum_distance_km: float) -> float:
    if distance_km > maximum_distance_km:
        return 0.0
    nearby_threshold = min(25.0, maximum_distance_km * 0.25)
    if distance_km <= nearby_threshold:
        return 100.0
    return _clamp(
        100 - ((distance_km - nearby_threshold) / (maximum_distance_km - nearby_threshold)) * 60,
        lower=40,
    )


def price_score(listing: WasteListing, requirement: BuyerRequirement, logistics_per_kg: float) -> tuple[float, list[str], float | None]:
    flags: list[str] = []
    if listing.asking_price_per_kg is None or requirement.target_price_per_kg is None:
        flags.append("Price comparison is neutral because an illustrative listing price or buyer target is missing.")
        delivered_cost = round(listing.asking_price_per_kg + logistics_per_kg, 2) if listing.asking_price_per_kg is not None else None
        return 50.0, flags, delivered_cost

    delivered_cost = round(listing.asking_price_per_kg + logistics_per_kg, 2)
    score = _clamp((requirement.target_price_per_kg / delivered_cost) * 100)
    if delivered_cost > requirement.target_price_per_kg:
        flags.append("Illustrative delivered cost is above the buyer's demo target; price discussion may be needed.")
    return score, flags, delivered_cost


def environment_score(material: Material, listing: WasteListing, requirement: BuyerRequirement, distance_km: float) -> float:
    material_use = selected_material_use(material, listing.selected_use_id)
    distance_penalty = (distance_km / requirement.maximum_distance_km) * 15
    # A documented decision signal—not a scientific optimisation or LCA.
    return round(_clamp(material_use.recovery_factor * 100 - distance_penalty), 1)


def _best_evidence_status(evidence: list[QualityEvidence]) -> str:
    if not evidence:
        return "rejected"
    return max(evidence, key=lambda item: EVIDENCE_RANK[item.status]).status


def _data_completeness(lot: MaterialLot | None, evidence: list[QualityEvidence]) -> float:
    if lot is None:
        return 35.0
    available = 40.0
    if lot.material_form and _normalize(lot.material_form) != "not specified":
        available += 15
    if lot.colour and _normalize(lot.colour) != "not specified":
        available += 10
    if lot.packaging and _normalize(lot.packaging) != "not specified":
        available += 10
    if lot.storage_condition and _normalize(lot.storage_condition) != "not specified":
        available += 10
    if evidence:
        available += 15
    return round(_clamp(available), 1)


def _check_buyer_spec(
    lot: MaterialLot | None,
    acceptance_spec: BuyerAcceptanceSpec | None,
    evidence: list[QualityEvidence],
) -> tuple[list[EligibilityCheck], bool, bool, bool]:
    """Return checks and booleans for blocked, missing evidence, needs sample."""
    checks: list[EligibilityCheck] = []
    blocked = False
    missing_evidence = False
    needs_sample = False

    if lot is None:
        checks.append(EligibilityCheck(key="lot", label="Dispatchable lot", status="warning", detail="No lot-level material passport exists yet."))
        missing_evidence = True
    else:
        checks.append(EligibilityCheck(key="lot", label="Dispatchable lot", status="pass", detail=f"Lot {lot.lot_code} is available as {lot.material_form}."))

    if acceptance_spec is None:
        checks.append(EligibilityCheck(key="buyer_spec", label="Buyer acceptance template", status="warning", detail="Buyer has not published detailed acceptance criteria."))
        return checks, blocked, missing_evidence, needs_sample

    if lot and acceptance_spec.accepted_forms:
        allowed_forms = {_normalize(item) for item in acceptance_spec.accepted_forms}
        if _normalize(lot.material_form) in allowed_forms:
            checks.append(EligibilityCheck(key="form", label="Material form", status="pass", detail=f"{lot.material_form} is accepted by this buyer template."))
        else:
            checks.append(EligibilityCheck(key="form", label="Material form", status="warning", detail=f"{lot.material_form} is not explicitly in the buyer's accepted forms: {', '.join(acceptance_spec.accepted_forms)}. A physical sample may be required."))
            needs_sample = True

    if lot and acceptance_spec.accepted_colours:
        allowed_colours = {_normalize(item) for item in acceptance_spec.accepted_colours}
        if _normalize(lot.colour) in allowed_colours:
            checks.append(EligibilityCheck(key="colour", label="Colour", status="pass", detail=f"{lot.colour} is accepted by the buyer template."))
        elif _normalize(lot.colour) == "not specified":
            checks.append(EligibilityCheck(key="colour", label="Colour", status="warning", detail="Buyer has colour constraints but the lot colour is not specified."))
            missing_evidence = True
        else:
            checks.append(EligibilityCheck(key="colour", label="Colour", status="warning", detail=f"{lot.colour} is not explicitly in the buyer's listed accepted colours. A physical sample may be required."))
            needs_sample = True

    best_status = _best_evidence_status(evidence)
    required_rank = EVIDENCE_RANK[acceptance_spec.required_evidence_status]
    actual_rank = EVIDENCE_RANK[best_status]
    if actual_rank >= required_rank:
        detail = f"Best available evidence is {best_status.replace('_', ' ')}; buyer requires {acceptance_spec.required_evidence_status.replace('_', ' ')} or stronger."
        checks.append(EligibilityCheck(key="evidence", label="Quality evidence", status="pass", detail=detail))
    else:
        detail = f"Best available evidence is {best_status.replace('_', ' ')}; buyer requires {acceptance_spec.required_evidence_status.replace('_', ' ')} or stronger."
        checks.append(EligibilityCheck(key="evidence", label="Quality evidence", status="warning", detail=detail))
        missing_evidence = True

    if lot and lot.compliance_triage in {"needs_compliance_review", "regulated_or_hazardous_route"}:
        checks.append(EligibilityCheck(key="compliance", label="Compliance triage", status="warning", detail="This lot requires route-specific compliance review; the platform is not making a legal classification."))
        missing_evidence = True
    elif lot:
        checks.append(EligibilityCheck(key="compliance", label="Compliance triage", status="warning", detail="Compliance route is not assessed in this demo. Confirm applicable requirements before transaction."))

    if acceptance_spec.requires_sample:
        checks.append(EligibilityCheck(key="sample", label="Sample / inspection", status="warning", detail="Buyer template requires a sample or inspection before commercial acceptance."))
        needs_sample = True
    else:
        checks.append(EligibilityCheck(key="sample", label="Sample / inspection", status="pass", detail="Buyer template does not mandate a sample at this screening stage."))

    return checks, blocked, missing_evidence, needs_sample


def calculate_match(
    listing: WasteListing,
    requirement: BuyerRequirement,
    material: Material,
    scoring_config: ScoringConfig,
    lot: MaterialLot | None = None,
    acceptance_spec: BuyerAcceptanceSpec | None = None,
    evidence: list[QualityEvidence] | None = None,
    sample_requests: list[SampleRequest] | None = None,
) -> MatchRecord | None:
    if listing.status != "active" or requirement.status != "active":
        return None

    calculated_material_score = material_score(listing, requirement)
    if calculated_material_score is None:
        return None

    evidence = evidence or []
    sample_requests = sample_requests or []
    checks, spec_blocked, spec_missing_evidence, spec_needs_sample = _check_buyer_spec(lot, acceptance_spec, evidence)
    flags: list[str] = []

    calculated_quality_score = quality_score(listing, requirement)
    quality_blocked = calculated_quality_score == 0
    if quality_blocked:
        checks.append(EligibilityCheck(key="quality_grade", label="Stated quality grade", status="warning", detail=f"Listing grade {listing.quality_grade} is below the buyer minimum {requirement.minimum_quality_grade}. A concession may be required."))
    elif listing.quality_verified:
        checks.append(EligibilityCheck(key="quality_grade", label="Stated quality grade", status="pass", detail="Stated grade meets the buyer minimum and is marked verified in the record."))
    else:
        checks.append(EligibilityCheck(key="quality_grade", label="Stated quality grade", status="warning", detail="Stated grade meets the buyer minimum but remains supplier-declared and not verified."))
        flags.append("Verification required: quality is supplier-declared and not verified.")

    distance_km = haversine_km(listing.latitude, listing.longitude, requirement.latitude, requirement.longitude)
    calculated_distance_score = distance_score(distance_km, requirement.maximum_distance_km)
    distance_blocked = calculated_distance_score == 0
    if distance_blocked:
        checks.append(EligibilityCheck(key="distance", label="Serviceable distance", status="warning", detail=f"{distance_km:.1f} km exceeds the buyer's {requirement.maximum_distance_km:.0f} km screening radius. Freight negotiations needed."))
    else:
        checks.append(EligibilityCheck(key="distance", label="Serviceable distance", status="pass", detail=f"{distance_km:.1f} km is within the buyer's {requirement.maximum_distance_km:.0f} km screening radius."))

    calculated_quantity_score = quantity_score(listing, requirement)
    if requirement.minimum_quantity_kg_week <= listing.normalized_kg_per_week <= requirement.maximum_quantity_kg_week:
        checks.append(EligibilityCheck(key="quantity", label="Quantity and capacity", status="pass", detail="Listed weekly quantity falls within the buyer's requested range."))
    else:
        checks.append(EligibilityCheck(key="quantity", label="Quantity and capacity", status="warning", detail="Quantity is outside the preferred range; partial acceptance or aggregation needs confirmation."))
        flags.append("Quantity is outside the preferred range; partial/aggregated logistics should be confirmed.")

    if acceptance_spec and acceptance_spec.available_capacity_kg_week and listing.normalized_kg_per_week > acceptance_spec.available_capacity_kg_week:
        checks.append(EligibilityCheck(key="capacity", label="Published capacity", status="warning", detail=f"Listing volume exceeds the buyer's published {acceptance_spec.available_capacity_kg_week:,.0f} kg/week capacity; a partial allocation may be needed."))
        flags.append("Published buyer capacity is lower than this listing volume; confirm an allocation before quote.")

    logistics_per_kg = estimate_logistics_per_kg(distance_km)
    calculated_price_score, price_flags, delivered_cost = price_score(listing, requirement, logistics_per_kg)
    flags.extend(price_flags)
    calculated_environment_score = environment_score(material, listing, requirement, distance_km)

    accepted_sample = any(item.status == "accepted" for item in sample_requests)
    if accepted_sample:
        spec_needs_sample = False
        checks = [
            EligibilityCheck(key=item.key, label=item.label, status=("pass" if item.key == "sample" else item.status), detail=("A demo sample acceptance is recorded for this match." if item.key == "sample" else item.detail))
            for item in checks
        ]

    if listing.frequency == "one_time":
        flags.append("This is a one-time lot; recurring supply should be confirmed.")

    # All checks have been softened to warnings per user request
    blocked = False
    if blocked:
        eligibility_status = "blocked"
        next_action = "Review blocked technical or logistics criteria"
    elif spec_missing_evidence:
        eligibility_status = "missing_evidence"
        next_action = "Upload or review the required evidence"
    elif spec_needs_sample:
        eligibility_status = "needs_sample"
        next_action = "Request a sample or buyer inspection"
    else:
        eligibility_status = "eligible"
        next_action = "Invite buyer to an RFQ or offer"

    if eligibility_status == "missing_evidence":
        flags.insert(0, "More evidence is required before this buyer template can move to sample or commercial acceptance.")
    elif eligibility_status == "needs_sample":
        flags.insert(0, "Buyer template requires sample or inspection before commercial acceptance.")
    elif eligibility_status == "blocked":
        flags.insert(0, "This route is blocked by at least one explicit screening rule.")

    scores = {
        "material": calculated_material_score,
        "quality": calculated_quality_score,
        "quantity": calculated_quantity_score,
        "distance": calculated_distance_score,
        "price": calculated_price_score,
        "environment": calculated_environment_score,
    }
    total_score = round(sum(scores[key] * scoring_config.weights[key] for key in scores), 1)
    material_use = selected_material_use(material, listing.selected_use_id)
    economic = economic_value(listing, requirement, distance_km)
    impact = environmental_impact(listing, material, material_use, requirement, distance_km)

    return MatchRecord(
        id=f"match-{listing.id}-{requirement.id}",
        listing_id=listing.id,
        buyer_requirement_id=requirement.id,
        scoring_config_id=scoring_config.id,
        total_score=total_score,
        material_score=round(calculated_material_score, 1),
        quality_score=round(calculated_quality_score, 1),
        quantity_score=round(calculated_quantity_score, 1),
        distance_score=round(calculated_distance_score, 1),
        price_score=round(calculated_price_score, 1),
        environment_score=round(calculated_environment_score, 1),
        distance_km=distance_km,
        estimated_logistics_per_kg=logistics_per_kg,
        delivered_cost_per_kg=delivered_cost,
        eligibility_status=eligibility_status,
        eligibility_checks=checks,
        data_completeness_score=_data_completeness(lot, evidence),
        next_action=next_action,
        lot_id=lot.id if lot else None,
        flags=list(dict.fromkeys(flags)),
        explanation_inputs={
            "material_name": material.canonical_name,
            "listing_quantity_kg_week": listing.normalized_kg_per_week,
            "requirement_min_quantity_kg_week": requirement.minimum_quantity_kg_week,
            "requirement_max_quantity_kg_week": requirement.maximum_quantity_kg_week,
            "listing_quality_grade": listing.quality_grade,
            "quality_verified": listing.quality_verified,
            "required_quality_grade": requirement.minimum_quality_grade,
            "maximum_distance_km": requirement.maximum_distance_km,
            "buyer_target_price_per_kg": requirement.target_price_per_kg,
            "listing_asking_price_per_kg": listing.asking_price_per_kg,
            "potential_use": material_use.title,
            "lot_code": lot.lot_code if lot else None,
            "lot_form": lot.material_form if lot else None,
            "evidence_status": _best_evidence_status(evidence),
            "acceptance_spec_id": acceptance_spec.id if acceptance_spec else None,
            "economic": economic,
            "impact": impact,
            "component_scores": scores,
            "weights": scoring_config.weights,
            "decision_rule_label": "MVP decision rules — configurable, not scientifically optimal.",
        },
        created_at=datetime.now(timezone.utc).isoformat(),
    )


def match_explanation(match: MatchRecord, listing: WasteListing, requirement: BuyerRequirement, buyer_name: str) -> dict[str, Any]:
    facts = match.explanation_inputs
    quality_phrase = (
        "The stated grade meets the buyer minimum and is marked verified in the record."
        if facts["quality_verified"]
        else "The stated grade meets the buyer minimum, but it remains supplier-declared and Not verified."
    )
    quantity = facts["listing_quantity_kg_week"]
    minimum = facts["requirement_min_quantity_kg_week"]
    maximum = facts["requirement_max_quantity_kg_week"]
    if minimum <= quantity <= maximum:
        quantity_phrase = f"{quantity:,.0f} kg/week falls within the requested {minimum:,.0f}–{maximum:,.0f} kg/week range."
    else:
        quantity_phrase = f"{quantity:,.0f} kg/week is outside the preferred {minimum:,.0f}–{maximum:,.0f} kg/week range; quantity coordination is required."

    eligibility_copy = {
        "eligible": "The current screening checks are eligible for an RFQ or offer, subject to normal buyer acceptance.",
        "needs_sample": "The buyer template needs a sample or inspection before commercial acceptance.",
        "missing_evidence": "The buyer template needs more evidence before this route can advance.",
        "blocked": "At least one explicit material, quality, form, colour, or logistics rule blocks this route.",
    }[match.eligibility_status]

    reasons = [
        f"{buyer_name} accepts {facts['material_name']} through an exact controlled-catalog match.",
        quantity_phrase,
        quality_phrase,
        f"The demo distance is {match.distance_km:.1f} km, compared with the buyer's {facts['maximum_distance_km']:.0f} km screening radius.",
        eligibility_copy,
        f"Potential pathway: {facts['potential_use']} — suitability must still be confirmed by the processor.",
    ]
    if facts["listing_asking_price_per_kg"] is not None and facts["buyer_target_price_per_kg"] is not None:
        reasons.append("The price component compares illustrative delivered cost with an illustrative buyer target; it is not a quote.")

    return {
        "headline": f"{buyer_name} is shown with transparent screening checks and MVP decision rules, not a black-box recommendation.",
        "reasons": reasons,
        "flags": match.flags,
        "eligibility_status": match.eligibility_status,
        "eligibility_checks": [item.model_dump() for item in match.eligibility_checks],
        "next_action": match.next_action,
        "score_breakdown": [
            {"key": "material", "label": "Material compatibility", "score": match.material_score, "weight": facts["weights"]["material"]},
            {"key": "quality", "label": "Quality compatibility", "score": match.quality_score, "weight": facts["weights"]["quality"]},
            {"key": "quantity", "label": "Quantity compatibility", "score": match.quantity_score, "weight": facts["weights"]["quantity"]},
            {"key": "distance", "label": "Distance & logistics", "score": match.distance_score, "weight": facts["weights"]["distance"]},
            {"key": "price", "label": "Price & economic value", "score": match.price_score, "weight": facts["weights"]["price"]},
            {"key": "environment", "label": "Environmental benefit", "score": match.environment_score, "weight": facts["weights"]["environment"]},
        ],
        "decision_rule_label": facts["decision_rule_label"],
    }
