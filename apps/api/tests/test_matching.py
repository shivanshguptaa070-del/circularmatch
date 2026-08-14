from app.seed.demo_data import fresh_seed_data
from app.services.calculators import economic_value, haversine_km
from app.services.matching import calculate_match


def test_pet_demo_ranks_reloop_first_and_keeps_quality_flag() -> None:
    data = fresh_seed_data()
    listing = next(item for item in data["listings"] if item.id == "listing-pet-demo")
    material = next(item for item in data["materials"] if item.id == listing.material_id)
    matches = []
    for requirement in data["requirements"]:
        match = calculate_match(listing, requirement, material, data["scoring_config"])
        if match:
            matches.append(match)
    ranked = sorted(matches, key=lambda item: item.total_score, reverse=True)

    assert [item.buyer_requirement_id for item in ranked] == [
        "req-pet-top",
        "req-pet-nearby",
        "req-pet-volume",
    ]
    assert ranked[0].total_score > ranked[1].total_score > ranked[2].total_score
    assert any("Verification required" in flag for flag in ranked[0].flags)
    assert ranked[0].eligibility_status == "missing_evidence"  # direct unit call has no lot/evidence context
    assert 45 <= ranked[0].distance_km <= 52


def test_incompatible_material_is_not_ranked() -> None:
    data = fresh_seed_data()
    listing = next(item for item in data["listings"] if item.id == "listing-pet-demo")
    steel_requirement = next(item for item in data["requirements"] if item.id == "req-steel")
    material = next(item for item in data["materials"] if item.id == listing.material_id)
    assert calculate_match(listing, steel_requirement, material, data["scoring_config"]) is None


def test_haversine_and_economic_formula_are_transparent() -> None:
    data = fresh_seed_data()
    listing = next(item for item in data["listings"] if item.id == "listing-pet-demo")
    requirement = next(item for item in data["requirements"] if item.id == "req-pet-top")
    distance = haversine_km(listing.latitude, listing.longitude, requirement.latitude, requirement.longitude)
    scenario = economic_value(listing, requirement, distance)

    assert 45 <= distance <= 52
    assert scenario["net_recovered_value"] == round(
        scenario["estimated_sale_revenue"] - scenario["estimated_transport_cost"], 2
    )
    assert scenario["potential_improvement_vs_disposal"] == round(
        scenario["net_recovered_value"] + scenario["avoided_disposal_cost"], 2
    )
