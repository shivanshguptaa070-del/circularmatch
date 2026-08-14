from __future__ import annotations

from math import asin, cos, radians, sin, sqrt
from typing import Any

from app.schemas.models import BuyerRequirement, Material, MaterialUse, WasteListing

# All values below are deliberately illustrative demo parameters—not market freight
# quotes, emissions factors, certifications, or a lifecycle assessment.
LOGISTICS_BASE_PER_KG = 1.20
LOGISTICS_DISTANCE_PER_KM_PER_KG = 0.025
TRANSPORT_CO2E_PER_TONNE_KM = 0.09
DISPOSAL_AVOIDED_CO2E_PER_KG = 0.15
VIRGIN_AVOIDED_CO2E_PER_KG_BY_CATEGORY = {
    "Plastic": 1.80,
    "Textile": 1.30,
    "Paper / Cardboard": 0.95,
    "Metal": 1.65,
}


def normalize_to_week(quantity_kg: float, frequency: str) -> float:
    if frequency == "monthly":
        return round(quantity_kg / 4.345, 2)
    # A one-time listing is treated as its available lot for MVP comparison; the UI
    # says this explicitly rather than claiming recurring weekly supply.
    return round(quantity_kg, 2)


def haversine_km(latitude_a: float, longitude_a: float, latitude_b: float, longitude_b: float) -> float:
    earth_radius_km = 6371.0088
    lat_a, lon_a, lat_b, lon_b = map(radians, [latitude_a, longitude_a, latitude_b, longitude_b])
    delta_lat = lat_b - lat_a
    delta_lon = lon_b - lon_a
    formula = sin(delta_lat / 2) ** 2 + cos(lat_a) * cos(lat_b) * sin(delta_lon / 2) ** 2
    return round(2 * earth_radius_km * asin(sqrt(formula)), 1)


def estimate_logistics_per_kg(distance_km: float) -> float:
    """Illustrative calculator only; it is not a freight quote."""
    return round(LOGISTICS_BASE_PER_KG + (distance_km * LOGISTICS_DISTANCE_PER_KM_PER_KG), 2)


def selected_material_use(material: Material, selected_use_id: str | None) -> MaterialUse:
    if selected_use_id:
        for material_use in material.uses:
            if material_use.id == selected_use_id:
                return material_use
    return material.uses[0]


def economic_value(
    listing: WasteListing,
    requirement: BuyerRequirement,
    distance_km: float,
) -> dict[str, Any]:
    quantity_kg = min(listing.normalized_kg_per_week, requirement.maximum_quantity_kg_week)
    logistics_per_kg = estimate_logistics_per_kg(distance_km)
    reference_price = listing.asking_price_per_kg
    price_source = "listing asking price"
    if reference_price is None and requirement.target_price_per_kg is not None:
        reference_price = requirement.target_price_per_kg
        price_source = "buyer target price (not an offer)"

    transport_cost = round(logistics_per_kg * quantity_kg, 2)
    sale_revenue = round((reference_price or 0) * quantity_kg, 2)
    net_recovered = round(sale_revenue - transport_cost, 2) if reference_price is not None else None
    avoided_disposal = (
        round((listing.disposal_cost_per_kg or 0) * quantity_kg, 2)
        if listing.disposal_cost_per_kg is not None
        else None
    )
    improvement = (
        round(net_recovered + avoided_disposal, 2)
        if net_recovered is not None and avoided_disposal is not None
        else None
    )
    delivered_cost = (
        round(reference_price + logistics_per_kg, 2) if reference_price is not None else None
    )

    return {
        "label": "Illustrative / Demo Data — not a market quote",
        "quantity_kg": quantity_kg,
        "listing_asking_price_per_kg": listing.asking_price_per_kg,
        "buyer_target_price_per_kg": requirement.target_price_per_kg,
        "reference_price_per_kg": reference_price,
        "reference_price_source": price_source if reference_price is not None else "No price provided",
        "estimated_logistics_per_kg": logistics_per_kg,
        "estimated_transport_cost": transport_cost,
        "estimated_sale_revenue": sale_revenue if reference_price is not None else None,
        "net_recovered_value": net_recovered,
        "avoided_disposal_cost": avoided_disposal,
        "potential_improvement_vs_disposal": improvement,
        "delivered_cost_per_kg": delivered_cost,
        "formula": "Net recovered value = illustrative sale revenue − illustrative transport cost. Improvement versus disposal = net recovered value + avoided disposal cost.",
        "assumptions": [
            f"Illustrative logistics = ₹{LOGISTICS_BASE_PER_KG:.2f}/kg base + ₹{LOGISTICS_DISTANCE_PER_KM_PER_KG:.3f}/kg/km × {distance_km:.1f} km.",
            "Listing price and buyer target are demo inputs, not a bid, offer, or market price.",
            "Quantity is capped at the buyer's maximum weekly requirement for this scenario.",
        ],
    }


def environmental_impact(
    listing: WasteListing,
    material: Material,
    material_use: MaterialUse,
    requirement: BuyerRequirement,
    distance_km: float,
) -> dict[str, Any]:
    quantity_kg = min(listing.normalized_kg_per_week, requirement.maximum_quantity_kg_week)
    secondary_material_kg = round(quantity_kg * material_use.recovery_factor, 1)
    virgin_displaced_kg = round(secondary_material_kg * material_use.virgin_displacement_factor, 1)
    virgin_factor = VIRGIN_AVOIDED_CO2E_PER_KG_BY_CATEGORY.get(material.category, 1.0)
    avoided_co2e = round(
        virgin_displaced_kg * virgin_factor + quantity_kg * DISPOSAL_AVOIDED_CO2E_PER_KG,
        1,
    )
    transport_co2e = round(
        distance_km * (quantity_kg / 1000) * TRANSPORT_CO2E_PER_TONNE_KM,
        1,
    )
    net_co2e = round(avoided_co2e - transport_co2e, 1)
    return {
        "label": "Illustrative / Demo Data — not a measured LCA",
        "potential_use": material_use.title,
        "waste_diverted_kg": quantity_kg,
        "secondary_material_recovered_kg": secondary_material_kg,
        "estimated_virgin_material_displaced_kg": virgin_displaced_kg,
        "estimated_transport_emissions_kgco2e": transport_co2e,
        "estimated_avoided_emissions_kgco2e": avoided_co2e,
        "estimated_net_co2e_benefit_kgco2e": net_co2e,
        "assumptions": [
            f"Potential pathway recovery factor: {material_use.recovery_factor:.0%} (illustrative, not a yield guarantee).",
            f"Virgin-material displacement factor: {material_use.virgin_displacement_factor:.0%} (illustrative).",
            f"Illustrative avoided-emissions factor for {material.category}: {virgin_factor:.2f} kgCO2e per kg displaced.",
            f"Illustrative disposal factor: {DISPOSAL_AVOIDED_CO2E_PER_KG:.2f} kgCO2e per kg diverted.",
            f"Illustrative transport factor: {TRANSPORT_CO2E_PER_TONNE_KM:.2f} kgCO2e per tonne-km over {distance_km:.1f} km.",
        ],
        "calculation_version": "demo-impact-v1",
        "methodology": {
            "id": "method-demo-impact-v1",
            "name": "CircularMatch illustrative pathway scenario",
            "functional_unit": "1 kg of the listed material lot allocated to the matched buyer route",
            "system_boundary": "Illustrative scenario from listed lot through demo transport and assumed recovery pathway; not a full lifecycle assessment.",
            "factor_source": "Seeded CircularMatch demo assumptions only — replace with reviewed, route-specific sources before external reporting.",
            "data_quality_tier": "demo_scenario",
            "claim_boundary": "Potential avoided-emissions scenario shown separately from a verified GHG inventory.",
        },
        "is_illustrative": True,
    }
