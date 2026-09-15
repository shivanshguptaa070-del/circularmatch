from typing import Any
from fastapi import HTTPException, status
from app.core.config import settings

DEMO_LABEL = "Illustrative / Demo Data"

def envelope(data: Any) -> dict[str, Any]:
    return {
        "data_mode": "demo" if settings.demo_mode else "production",
        "dataset_label": DEMO_LABEL if settings.demo_mode else None,
        "data": data,
    }

def not_found(resource: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{resource} was not found.")

ELIGIBILITY_ORDER = {"eligible": 0, "needs_sample": 1, "missing_evidence": 2, "blocked": 3}
