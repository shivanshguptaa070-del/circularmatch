from __future__ import annotations

import json
import re
from typing import Any

import httpx

from app.schemas.models import Material
from app.seed.demo_data import city_coordinates
from app.services.calculators import normalize_to_week


QUALITY_PATTERNS = [
    ("premium", [r"\bpremium\b"]),
    ("industrial", [r"industrial[ -]?grade", r"industrial scrap", r"\bclean\b"]),
    ("standard", [r"\bstandard\b", r"sorted"]),
    ("mixed", [r"\bmixed\b", r"unsorted"]),
]


def _detect_material(description: str, materials: list[Material]) -> Material | None:
    normalized = description.lower()
    # Favor exact aliases/canonical fragments with the longest match.
    candidates: list[tuple[int, Material]] = []
    for material in materials:
        aliases = [material.canonical_name, *material.aliases]
        for alias in aliases:
            if alias.lower() in normalized:
                candidates.append((len(alias), material))
    if candidates:
        return sorted(candidates, key=lambda pair: pair[0], reverse=True)[0][1]

    keyword_map = {
        "mat-pet": ["pet", "plastic bottle", "polyester resin"],
        "mat-cotton-textile": ["textile", "cotton", "fabric", "offcut"],
        "mat-paper-cardboard": ["cardboard", "paper", "occ", "corrugated"],
        "mat-steel-scrap": ["steel", "metal", "fabrication"],
    }
    for material in materials:
        if any(keyword in normalized for keyword in keyword_map.get(material.id, [])):
            return material
    return None


def _detect_quantity(description: str) -> tuple[float | None, str | None]:
    match = re.search(
        r"(?:around|approximately|about|roughly)?\s*(\d+(?:\.\d+)?)\s*(tonnes?|tons?|\bt\b|kilograms?|\bkgs?\b|\bkg\b)",
        description,
        flags=re.IGNORECASE,
    )
    if not match:
        return None, None
    value = float(match.group(1))
    unit = match.group(2).lower().strip(".")
    if unit in {"tonne", "tonnes", "ton", "tons", "t"}:
        return round(value * 1000, 2), "kg"
    return round(value, 2), "kg"


def _detect_frequency(description: str) -> str:
    normalized = description.lower()
    if any(token in normalized for token in ["monthly", "per month", "every month", "/month"]):
        return "monthly"
    if any(token in normalized for token in ["one-time", "one time", "single lot", "once only"]):
        return "one_time"
    return "weekly"


def _detect_quality(description: str) -> tuple[str, str]:
    normalized = description.lower()
    for grade, patterns in QUALITY_PATTERNS:
        if any(re.search(pattern, normalized) for pattern in patterns):
            return grade, f"Supplier-described as {grade.replace('_', ' ')}; not independently verified."
    return "unknown", "Quality/certification was not provided and is not verified."


def _detect_location(description: str) -> tuple[str | None, float | None, float | None]:
    normalized = description.lower()
    city_names = ["Noida", "Ghaziabad", "New Delhi", "Delhi", "Gurugram", "Gurgaon", "Faridabad", "Manesar", "Bhiwadi", "Sonipat"]
    for city in city_names:
        if city.lower() in normalized:
            coords = city_coordinates(city)
            if coords:
                return city, coords[0], coords[1]
    return None, None, None


def _detect_availability(description: str) -> str:
    match = re.search(r"(?:available|availability|collection)\s+(?:every\s+|on\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)", description, re.I)
    if match:
        return f"Every {match.group(1).title()}"
    if "weekly" in description.lower() or "every week" in description.lower():
        return "Weekly — day to be confirmed"
    return "To be confirmed"


def rule_based_extract(description: str, materials: list[Material], *, provider_note: str | None = None) -> dict[str, Any]:
    material = _detect_material(description, materials)
    quantity_kg, quantity_unit = _detect_quantity(description)
    frequency = _detect_frequency(description)
    quality_grade, quality_notes = _detect_quality(description)
    city, latitude, longitude = _detect_location(description)
    availability = _detect_availability(description)

    missing_fields: list[str] = []
    if material is None:
        missing_fields.append("Choose a supported material from the controlled catalog.")
    if quantity_kg is None:
        missing_fields.append("Add an approximate quantity.")
    if city is None:
        missing_fields.append("Add a city or location.")

    return {
        "provider": "rule-based-fallback",
        "provider_disclosure": provider_note
        or "Standard extraction — rule-based fallback. It is not AI-verified and must be reviewed before publishing.",
        "status": "needs_review",
        "structured": {
            "material_id": material.id if material else None,
            "material": material.canonical_name if material else "Uncertain — select material",
            "category": material.category if material else "Uncategorized",
            "quantity_value": quantity_kg,
            "quantity_unit": quantity_unit or "kg",
            "quantity_kg": quantity_kg,
            "frequency": frequency,
            "normalized_kg_per_week": normalize_to_week(quantity_kg, frequency) if quantity_kg else None,
            "quality_grade": quality_grade,
            "quality_verified": False,
            "quality_display": "Not verified",
            "quality_notes": quality_notes,
            "city": city,
            "latitude": latitude,
            "longitude": longitude,
            "availability": availability,
            "missing_fields": missing_fields,
            "review_required": True,
        },
        "potential_uses": [
            {
                "id": item.id,
                "title": item.title,
                "description": item.description,
                "label": "Potential use — verify suitability with buyer",
            }
            for item in (material.uses if material else [])
        ],
    }


def _material_from_candidate(candidate: str | None, materials: list[Material]) -> Material | None:
    if not candidate:
        return None
    normalized = candidate.lower().strip()
    for material in materials:
        if normalized in {material.id.lower(), material.canonical_name.lower()}:
            return material
        if any(normalized == alias.lower() for alias in material.aliases):
            return material
    return _detect_material(candidate, materials)


async def gemini_extract(description: str, materials: list[Material], api_key: str) -> dict[str, Any]:
    catalog = [
        {"id": item.id, "name": item.canonical_name, "category": item.category, "aliases": item.aliases}
        for item in materials
    ]
    prompt = f"""You extract a DRAFT industrial-waste record from user text.
Only choose a material from this controlled catalog: {json.dumps(catalog)}.
Do not claim laboratory composition, quality certification, safety, buyer acceptance, price, distance, or environmental impact.
If a quality/certification is not explicitly documented, set quality_verified to false.
Return JSON only with: material_candidate, quantity_value, quantity_unit, frequency, quality_grade, quality_notes, quality_verified, city, availability, missing_fields.
User text: {description}"""
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"response_mime_type": "application/json", "temperature": 0},
    }
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(url, params={"key": api_key}, json=payload)
        response.raise_for_status()
    raw_text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
    result = json.loads(raw_text)
    material = _material_from_candidate(result.get("material_candidate"), materials)
    # Reject unapproved model material suggestions by returning an editable unknown.
    quantity_value = result.get("quantity_value")
    try:
        quantity_value = float(quantity_value) if quantity_value is not None else None
    except (TypeError, ValueError):
        quantity_value = None
    unit = str(result.get("quantity_unit") or "kg").lower()
    quantity_kg = quantity_value * 1000 if unit in {"tonne", "tonnes", "ton", "tons", "t"} else quantity_value
    frequency = str(result.get("frequency") or "weekly").lower()
    if frequency not in {"weekly", "monthly", "one_time"}:
        frequency = "weekly"
    quality_grade = str(result.get("quality_grade") or "unknown").lower()
    if quality_grade not in {"unknown", "mixed", "standard", "industrial", "premium"}:
        quality_grade = "unknown"
    city = str(result.get("city") or "").strip() or None
    coordinates = city_coordinates(city) if city else None
    missing = list(result.get("missing_fields") or [])
    if not material:
        missing.append("Choose a supported material from the controlled catalog.")
    if quantity_kg is None:
        missing.append("Add an approximate quantity.")
    if not city:
        missing.append("Add a city or demo location.")

    return {
        "provider": "gemini",
        "provider_disclosure": "AI-assisted draft extraction. Review every field before publishing; quality is not independently verified.",
        "status": "needs_review",
        "structured": {
            "material_id": material.id if material else None,
            "material": material.canonical_name if material else "Uncertain — select material",
            "category": material.category if material else "Uncategorized",
            "quantity_value": quantity_kg,
            "quantity_unit": "kg",
            "quantity_kg": quantity_kg,
            "frequency": frequency,
            "normalized_kg_per_week": normalize_to_week(quantity_kg, frequency) if quantity_kg else None,
            "quality_grade": quality_grade,
            "quality_verified": False,  # Never take model wording as a certification claim.
            "quality_display": "Not verified",
            "quality_notes": str(result.get("quality_notes") or "Supplier-provided description; not independently verified."),
            "city": city,
            "latitude": coordinates[0] if coordinates else None,
            "longitude": coordinates[1] if coordinates else None,
            "availability": str(result.get("availability") or "To be confirmed"),
            "missing_fields": list(dict.fromkeys(missing)),
            "review_required": True,
        },
        "potential_uses": [
            {
                "id": item.id,
                "title": item.title,
                "description": item.description,
                "label": "Potential use — verify suitability with buyer",
            }
            for item in (material.uses if material else [])
        ],
    }


async def extract_waste(description: str, materials: list[Material], gemini_api_key: str | None) -> dict[str, Any]:
    if gemini_api_key:
        try:
            return await gemini_extract(description, materials, gemini_api_key)
        except Exception:
            # Reliability over pretending that Gemini responded. The disclosure makes
            # the fallback explicit rather than hiding the provider failure.
            return rule_based_extract(
                description,
                materials,
                provider_note="Gemini extraction was unavailable; demo rule-based fallback was used. Review all fields before publishing.",
            )
    return rule_based_extract(description, materials)
