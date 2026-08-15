import asyncio

from app.seed.demo_data import fresh_seed_data
from app.services.extraction import extract_waste


def test_sample_pet_sentence_becomes_reviewable_draft() -> None:
    materials = fresh_seed_data()["materials"]
    result = asyncio.run(
        extract_waste(
            "We generate around 3 tonnes of PET manufacturing scrap every week in Noida. The material is clean industrial-grade scrap and is available every Monday.",
            materials,
            None,
        )
    )
    structured = result["structured"]
    assert result["provider"] == "rule-based-fallback"
    assert structured["material_id"] == "mat-pet"
    assert structured["quantity_kg"] == 3000
    assert structured["normalized_kg_per_week"] == 3000
    assert structured["city"] == "Noida"
    assert structured["quality_grade"] == "industrial"
    assert structured["quality_verified"] is False
    assert structured["quality_display"] == "Not verified"
    assert structured["availability"] == "Every Monday"
