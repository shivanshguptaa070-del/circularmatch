from app.main import company_view, material_view, evidence_view, passport_readiness, lot_view, listing_view, default_acceptance_spec, acceptance_spec_view, requirement_view, match_card_view, sort_matches, recompute_listing_matches, ensure_listing_matches, recompute_requirement_matches, timeline_for_match
from app.core.responses import envelope, not_found
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status, UploadFile, File
from app.core.dependencies import get_current_user, get_store, require_roles
from app.core.storage import upload_document, get_download_url
from app.repositories.demo_store import DemoStore
from app.schemas.models import *
from app.services.calculators import *
from app.services.extraction import extract_waste
from app.services.matching import *
from app.services.email_service import send_contact_notification
from app.seed.demo_data import city_coordinates

router = APIRouter()

@router.get("/api/dashboard/summary")
def dashboard_summary(
    current_user: User = Depends(get_current_user),
    store: DemoStore = Depends(get_store),
) -> dict[str, Any]:
    if current_user.role == "generator":
        listings = store.list_listings(company_id=current_user.company_id, active_only=True)
        all_matches: list[MatchRecord] = []
        for listing in listings:
            all_matches.extend(ensure_listing_matches(store, listing))
        
        top_matches_by_listing: dict[str, MatchRecord] = {}
        for match in sort_matches(all_matches):
            if match.eligibility_status != "blocked" and match.listing_id not in top_matches_by_listing:
                top_matches_by_listing[match.listing_id] = match

        total_waste = round(sum(item.normalized_kg_per_week for item in listings), 0)
        top_match_economic = [item.explanation_inputs.get("economic", {}) for item in top_matches_by_listing.values()]
        potential_value = round(sum((item.get("net_recovered_value") or 0) for item in top_match_economic), 0)

        my_transactions = []
        for m in all_matches:
            t = next((t for t in store.transactions if t.get("match_id") == m.id), None)
            if t: my_transactions.append(t)
        
        accepted_transactions = [t for t in my_transactions if t.get("status") == "accepted"]
        active_buyers = len({m.buyer_requirement_id for m in all_matches if m.eligibility_status != "blocked"})

        category_totals: dict[str, float] = {}
        for listing in listings:
            material = store.get_material(listing.material_id)
            category = material.category if material else "Uncategorized"
            category_totals[category] = category_totals.get(category, 0) + listing.normalized_kg_per_week

        return envelope({
            "role": "generator",
            "kpis": {
                "total_waste_listed_kg_week": total_waste,
                "active_buyer_matches": active_buyers,
                "successful_sales": len(accepted_transactions),
                "potential_revenue_inr": potential_value,
            },
            "charts": {
                "waste_by_category": [{"name": category, "value": round(value, 0)} for category, value in category_totals.items()],
                "revenue_pipeline": [
                    {"name": "Secured", "value": round(sum(t.get("agreed_quantity_kg", 0) * 10 for t in accepted_transactions), 0)},
                    {"name": "Potential", "value": potential_value}
                ]
            }
        })

    elif current_user.role == "buyer":
        requirements = store.list_requirements(company_id=current_user.company_id, active_only=True)
        req_ids = {r.id for r in requirements}
        all_matches = [m for m in store.matches.values() if m.buyer_requirement_id in req_ids]
        # Ensure matches exist for all requirements
        for req in requirements:
            req_matches = [m for m in all_matches if m.buyer_requirement_id == req.id]
            if not req_matches:
                new_matches = recompute_requirement_matches(store, req)
                all_matches.extend(new_matches)
        
        total_procurement_target = round(sum(r.maximum_quantity_kg_week for r in requirements), 0)
        
        top_matches_by_req: dict[str, MatchRecord] = {}
        for match in sort_matches(all_matches):
            if match.eligibility_status != "blocked" and match.buyer_requirement_id not in top_matches_by_req:
                top_matches_by_req[match.buyer_requirement_id] = match
                
        top_match_economic = [item.explanation_inputs.get("economic", {}) for item in top_matches_by_req.values()]
        
        potential_savings = 0.0
        for item in top_match_economic:
            qty = item.get("quantity_kg", 0)
            target = item.get("buyer_target_price_per_kg")
            delivered = item.get("delivered_cost_per_kg")
            if target and delivered and target > delivered:
                potential_savings += (target - delivered) * qty
            else:
                # Fallback for demo if prices are missing
                potential_savings += qty * 4.5
        potential_savings = round(potential_savings, 0)

        my_transactions = []
        for m in all_matches:
            t = next((t for t in store.transactions if t.get("match_id") == m.id), None)
            if t: my_transactions.append(t)
            
        accepted_transactions = [t for t in my_transactions if t.get("status") == "accepted"]
        active_sellers = len({m.listing_id for m in all_matches if m.eligibility_status != "blocked"})
        
        category_totals = {}
        for req in requirements:
            material = store.get_material(req.material_id)
            category = material.category if material else "Uncategorized"
            category_totals[category] = category_totals.get(category, 0) + req.maximum_quantity_kg_week

        return envelope({
            "role": "buyer",
            "kpis": {
                "total_procurement_target_kg_week": total_procurement_target,
                "active_seller_matches": active_sellers,
                "successful_purchases": len(accepted_transactions),
                "estimated_cost_savings_inr": potential_savings,
            },
            "charts": {
                "procurement_by_category": [{"name": category, "value": round(value, 0)} for category, value in category_totals.items()],
                "cost_savings_pipeline": [
                    {"name": "Realized", "value": round(sum(t.get("agreed_quantity_kg", 0) * 12.5 for t in accepted_transactions), 0)},
                    {"name": "Potential", "value": potential_savings}
                ]
            }
        })

    else:
        # Admin / global fallback
        listings = store.list_listings(active_only=True)
        all_matches = []
        for listing in listings:
            all_matches.extend(ensure_listing_matches(store, listing))
        top_matches_by_listing = {}
        for match in sort_matches(all_matches):
            if match.eligibility_status != "blocked" and match.listing_id not in top_matches_by_listing:
                top_matches_by_listing[match.listing_id] = match

        total_waste = round(sum(item.normalized_kg_per_week for item in listings), 0)
        top_match_economic = [item.explanation_inputs.get("economic", {}) for item in top_matches_by_listing.values()]
        top_match_impact = [item.explanation_inputs.get("impact", {}) for item in top_matches_by_listing.values()]
        potential_value = round(sum((item.get("net_recovered_value") or 0) for item in top_match_economic), 0)
        potential_co2e = round(sum((item.get("estimated_net_co2e_benefit_kgco2e") or 0) for item in top_match_impact), 0)
        accepted_transactions = [item for item in store.transactions if item.get("status") == "accepted"]
        matched_quantity = round(sum(item.get("agreed_quantity_kg") or 0 for item in accepted_transactions), 0)
        active_buyers = len({item.company_id for item in store.list_requirements(active_only=True)})
        category_totals = {}
        for listing in listings:
            material = store.get_material(listing.material_id)
            category = material.category if material else "Uncategorized"
            category_totals[category] = category_totals.get(category, 0) + listing.normalized_kg_per_week

        transaction_count = len(store.transactions)
        success_rate = round((len(accepted_transactions) / transaction_count) * 100, 1) if transaction_count else 0

        return envelope({
            "role": "admin",
            "kpis": {
                "total_waste_listed_kg_week": total_waste,
                "total_waste_matched_kg": matched_quantity,
                "waste_diverted_kg": matched_quantity,
                "potential_economic_value_inr": potential_value,
                "potential_co2e_benefit_kg": potential_co2e,
                "active_buyers": active_buyers,
                "successful_matches": len(accepted_transactions),
            },
            "charts": {
                "waste_by_category": [{"name": category, "value": round(value, 0)} for category, value in category_totals.items()],
                "waste_diverted_over_time": [{"period": "W1", "kg": 0}, {"period": "W2", "kg": 0}, {"period": "W3", "kg": 0}, {"period": "W4", "kg": matched_quantity}],
                "match_success": [{"name": "Accepted", "value": len(accepted_transactions)}, {"name": "In discussion", "value": len([item for item in store.transactions if item.get("status") == "contacted" and item.get("match_id") in [m.id for m in all_matches]])}],
                "economic_value": [
                    {"period": "PET", "value": round(top_match_economic[0].get("net_recovered_value") or 0, 0) if top_match_economic else 0},
                    {"period": "Textile", "value": round(top_match_economic[1].get("net_recovered_value") or 0, 0) if len(top_match_economic) > 1 else 0},
                    {"period": "Paper", "value": round(top_match_economic[2].get("net_recovered_value") or 0, 0) if len(top_match_economic) > 2 else 0},
                    {"period": "Metal", "value": round(top_match_economic[3].get("net_recovered_value") or 0, 0) if len(top_match_economic) > 3 else 0},
                ],
                "environmental_impact": [
                    {"name": "Potential recovery", "value": round(sum((item.get("secondary_material_recovered_kg") or 0) for item in top_match_impact), 0)},
                    {"name": "Transport burden", "value": round(sum((item.get("estimated_transport_emissions_kgco2e") or 0) for item in top_match_impact), 0)},
                    {"name": "Net benefit", "value": potential_co2e},
                ],
            },
            "match_success_rate_percent": success_rate,
            "labels": {
                "dataset": "Platform Dataset",
                "impact": "Calculated impact based on systemic assumptions; not a certified LCA.",
                "prices": "Estimated values; real prices vary by specific market condition.",
                "pilot_core": "Material passports and workflow records provide verified platform traceability.",
            },
        })

