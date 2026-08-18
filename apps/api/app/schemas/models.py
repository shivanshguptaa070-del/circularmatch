from __future__ import annotations

from typing import Any, Literal
from pydantic import BaseModel, Field, field_validator, model_validator


Role = Literal["generator", "buyer", "admin"]
QualityGrade = Literal["unknown", "mixed", "standard", "industrial", "premium"]
ListingStatus = Literal["draft", "active", "paused", "archived"]
RequirementStatus = Literal["active", "paused", "archived"]
MatchStatus = Literal["suggested", "contacted", "accepted", "rejected"]
EvidenceStatus = Literal["self_declared", "uploaded", "reviewed", "test_reviewed", "rejected", "expired"]
EvidenceType = Literal["supplier_declaration", "photo", "test_report", "certificate", "invoice", "weighbridge", "compliance_document", "other"]
LotReadiness = Literal["draft", "missing_evidence", "buyer_ready", "sample_ready", "compliance_review_needed"]
ComplianceTriage = Literal["not_assessed", "ordinary_secondary_material", "needs_compliance_review", "regulated_or_hazardous_route"]
EligibilityStatus = Literal["eligible", "needs_sample", "missing_evidence", "blocked"]
CheckStatus = Literal["pass", "warning", "fail"]
SampleStatus = Literal["requested", "approved", "received", "accepted", "rejected", "cancelled"]
OfferStatus = Literal["draft", "sent", "accepted", "rejected", "superseded"]
ShipmentStatus = Literal["planned", "dispatched", "received", "disputed", "cancelled"]


class MaterialUse(BaseModel):
    id: str
    material_id: str
    title: str
    description: str
    pathway_type: str
    recovery_factor: float = Field(ge=0, le=1)
    virgin_displacement_factor: float = Field(ge=0, le=2)
    assumptions: dict[str, Any] = Field(default_factory=dict)


class Material(BaseModel):
    id: str
    canonical_name: str
    category: str
    aliases: list[str] = Field(default_factory=list)
    quality_scale: list[str] = Field(default_factory=list)
    supported: bool = True
    notes: str = ""
    uses: list[MaterialUse] = Field(default_factory=list)


class Company(BaseModel):
    id: str
    owner_user_id: str | None = None
    name: str
    company_type: Literal["generator", "buyer", "recycler", "processor"]
    city: str
    address_label: str
    latitude: float
    longitude: float
    verification_status: Literal["demo", "unverified", "verified"] = "demo"
    is_demo: bool = True


class User(BaseModel):
    id: str
    full_name: str
    email: str
    role: Role
    company_id: str | None = None
    is_demo: bool = True


class WasteListing(BaseModel):
    id: str
    company_id: str
    material_id: str
    raw_description: str
    source: Literal["manual", "ai_assisted", "demo"] = "manual"
    quantity_kg: float = Field(gt=0)
    frequency: Literal["weekly", "monthly", "one_time"] = "weekly"
    normalized_kg_per_week: float = Field(gt=0)
    quality_grade: QualityGrade = "unknown"
    quality_verified: bool = False
    quality_notes: str = ""
    availability: str = "To be confirmed"
    city: str
    latitude: float
    longitude: float
    asking_price_per_kg: float | None = Field(default=None, ge=0)
    disposal_cost_per_kg: float | None = Field(default=None, ge=0)
    status: ListingStatus = "active"
    selected_use_id: str | None = None
    is_demo: bool = True
    created_at: str


class MaterialLot(BaseModel):
    """A specific dispatchable batch under a recurring waste listing.

    This keeps a material stream (listing) separate from a particular lot that can be
    sampled, quoted, transported and received.
    """

    id: str
    listing_id: str
    lot_code: str
    available_quantity_kg: float = Field(gt=0)
    material_form: str = "Not specified"
    source_status: Literal["pre_consumer", "post_consumer", "unknown"] = "unknown"
    colour: str = "Not specified"
    packaging: str = "Not specified"
    storage_condition: str = "Not specified"
    sample_available: bool = False
    compliance_triage: ComplianceTriage = "not_assessed"
    declared_spec: dict[str, Any] = Field(default_factory=dict)
    evidence_ids: list[str] = Field(default_factory=list)
    status: Literal["available", "reserved", "dispatched", "closed"] = "available"
    created_at: str


class QualityEvidence(BaseModel):
    id: str
    lot_id: str
    evidence_type: EvidenceType
    title: str
    issuer: str = "Supplier"
    status: EvidenceStatus = "self_declared"
    summary: str = ""
    document_name: str | None = None
    valid_until: str | None = None
    reviewed_by: str | None = None
    reviewed_at: str | None = None
    is_demo: bool = True
    created_at: str


class BuyerRequirement(BaseModel):
    id: str
    company_id: str
    material_id: str
    minimum_quantity_kg_week: float = Field(ge=0)
    maximum_quantity_kg_week: float = Field(gt=0)
    minimum_quality_grade: QualityGrade = "standard"
    maximum_distance_km: float = Field(gt=0)
    target_price_per_kg: float | None = Field(default=None, ge=0)
    allow_partial_quantity: bool = True
    city: str
    latitude: float
    longitude: float
    status: RequirementStatus = "active"
    is_demo: bool = True
    created_at: str

    @model_validator(mode="after")
    def valid_range(self) -> "BuyerRequirement":
        if self.minimum_quantity_kg_week > self.maximum_quantity_kg_week:
            raise ValueError("Minimum quantity cannot exceed maximum quantity.")
        return self


class BuyerAcceptanceSpec(BaseModel):
    id: str
    buyer_requirement_id: str
    accepted_forms: list[str] = Field(default_factory=list)
    accepted_colours: list[str] = Field(default_factory=list)
    prohibited_materials: list[str] = Field(default_factory=list)
    required_evidence_status: EvidenceStatus = "self_declared"
    requires_sample: bool = False
    available_capacity_kg_week: float | None = Field(default=None, gt=0)
    route_note: str = ""
    review_note: str = ""
    is_demo: bool = True
    updated_at: str


class EligibilityCheck(BaseModel):
    key: str
    label: str
    status: CheckStatus
    detail: str


class MatchRecord(BaseModel):
    id: str
    listing_id: str
    buyer_requirement_id: str
    scoring_config_id: str
    total_score: float = Field(ge=0, le=100)
    material_score: float = Field(ge=0, le=100)
    quality_score: float = Field(ge=0, le=100)
    quantity_score: float = Field(ge=0, le=100)
    distance_score: float = Field(ge=0, le=100)
    price_score: float = Field(ge=0, le=100)
    environment_score: float = Field(ge=0, le=100)
    distance_km: float = Field(ge=0)
    estimated_logistics_per_kg: float | None = Field(default=None, ge=0)
    delivered_cost_per_kg: float | None = Field(default=None, ge=0)
    status: MatchStatus = "suggested"
    eligibility_status: EligibilityStatus = "eligible"
    eligibility_checks: list[EligibilityCheck] = Field(default_factory=list)
    data_completeness_score: float = Field(default=0, ge=0, le=100)
    next_action: str = "Review match"
    lot_id: str | None = None
    flags: list[str] = Field(default_factory=list)
    explanation_inputs: dict[str, Any] = Field(default_factory=dict)
    created_at: str


class SampleRequest(BaseModel):
    id: str
    match_id: str
    requested_by: str
    requested_quantity_kg: float = Field(gt=0)
    status: SampleStatus = "requested"
    note: str = ""
    created_at: str
    updated_at: str
    is_demo: bool = True


class Offer(BaseModel):
    id: str
    match_id: str
    offered_by: str
    price_per_kg: float = Field(ge=0)
    quantity_kg: float = Field(gt=0)
    pickup_model: Literal["buyer_pickup", "generator_delivery", "quote_required"] = "buyer_pickup"
    status: OfferStatus = "sent"
    note: str = ""
    created_at: str
    is_demo: bool = True


class Shipment(BaseModel):
    id: str
    match_id: str
    planned_quantity_kg: float = Field(gt=0)
    pickup_date: str
    pickup_model: Literal["buyer_pickup", "generator_delivery", "platform_quote"] = "buyer_pickup"
    carrier_name: str = "To be confirmed"
    status: ShipmentStatus = "planned"
    dispatched_weight_kg: float | None = Field(default=None, ge=0)
    received_weight_kg: float | None = Field(default=None, ge=0)
    receipt_note: str = ""
    created_at: str
    updated_at: str
    is_demo: bool = True


class ImpactMethodology(BaseModel):
    id: str
    name: str
    version: str
    functional_unit: str
    system_boundary: str
    factor_source: str
    data_quality_tier: Literal["demo_scenario", "estimated", "evidence_backed"] = "demo_scenario"
    notes: str
    is_demo: bool = True


class Notification(BaseModel):
    id: str
    user_id: str
    type: Literal["new_match"]
    title: str
    message: str
    reference_url: str | None = None
    is_read: bool = False
    created_at: str


class AuditEvent(BaseModel):
    id: str
    entity_type: str
    entity_id: str
    action: str
    actor_id: str | None = None
    summary: str
    created_at: str
    is_demo: bool = True


class ScoringConfig(BaseModel):
    id: str = "demo-default-v1"
    name: str = "Default MVP decision rules"
    weights: dict[str, float] = Field(
        default_factory=lambda: {
            "material": 0.35,
            "quality": 0.20,
            "quantity": 0.15,
            "distance": 0.15,
            "price": 0.10,
            "environment": 0.05,
        }
    )
    version: int = 1
    is_demo: bool = True

    @field_validator("weights")
    @classmethod
    def valid_weights(cls, value: dict[str, float]) -> dict[str, float]:
        required = {"material", "quality", "quantity", "distance", "price", "environment"}
        if set(value) != required:
            raise ValueError("Weights must include material, quality, quantity, distance, price, and environment.")
        if any(weight < 0 for weight in value.values()):
            raise ValueError("Weights cannot be negative.")
        if abs(sum(value.values()) - 1) > 0.001:
            raise ValueError("Weights must sum to 1.0.")
        return value


class DemoLoginRequest(BaseModel):
    persona: Literal["generator", "buyer", "admin"]


class ExtractWasteRequest(BaseModel):
    description: str = Field(min_length=8, max_length=2000)


class CreateListingRequest(BaseModel):
    material_id: str
    raw_description: str = Field(min_length=3, max_length=2000)
    quantity_kg: float = Field(gt=0, le=10_000_000)
    frequency: Literal["weekly", "monthly", "one_time"] = "weekly"
    quality_grade: QualityGrade = "unknown"
    quality_verified: bool = False
    quality_notes: str = Field(default="", max_length=500)
    availability: str = Field(default="To be confirmed", max_length=200)
    city: str = Field(min_length=2, max_length=100)
    asking_price_per_kg: float | None = Field(default=None, ge=0, le=1_000_000)
    disposal_cost_per_kg: float | None = Field(default=None, ge=0, le=1_000_000)
    selected_use_id: str | None = None
    # Material Passport v0 fields. These remain supplier-declared until evidence is reviewed.
    material_form: str = Field(default="Manufacturing scrap", max_length=120)
    source_status: Literal["pre_consumer", "post_consumer", "unknown"] = "unknown"
    colour: str = Field(default="Not specified", max_length=120)
    packaging: str = Field(default="Not specified", max_length=160)
    storage_condition: str = Field(default="Not specified", max_length=240)
    sample_available: bool = False
    compliance_triage: ComplianceTriage = "not_assessed"
    document_name: str | None = Field(default=None, max_length=200)


class UpdateListingRequest(BaseModel):
    quantity_kg: float | None = Field(default=None, gt=0, le=10_000_000)
    frequency: Literal["weekly", "monthly", "one_time"] | None = None
    quality_grade: QualityGrade | None = None
    quality_verified: bool | None = None
    quality_notes: str | None = Field(default=None, max_length=500)
    availability: str | None = Field(default=None, max_length=200)
    asking_price_per_kg: float | None = Field(default=None, ge=0, le=1_000_000)
    disposal_cost_per_kg: float | None = Field(default=None, ge=0, le=1_000_000)
    status: ListingStatus | None = None


class CreateMaterialLotRequest(BaseModel):
    lot_code: str = Field(min_length=2, max_length=80)
    available_quantity_kg: float = Field(gt=0, le=10_000_000)
    material_form: str = Field(min_length=2, max_length=120)
    source_status: Literal["pre_consumer", "post_consumer", "unknown"] = "unknown"
    colour: str = Field(default="Not specified", max_length=120)
    packaging: str = Field(default="Not specified", max_length=160)
    storage_condition: str = Field(default="Not specified", max_length=240)
    sample_available: bool = False
    compliance_triage: ComplianceTriage = "not_assessed"
    declared_spec: dict[str, Any] = Field(default_factory=dict)


class CreateEvidenceRequest(BaseModel):
    evidence_type: EvidenceType
    title: str = Field(min_length=2, max_length=160)
    issuer: str = Field(default="Supplier", max_length=160)
    status: EvidenceStatus = "uploaded"
    summary: str = Field(default="", max_length=1000)
    document_name: str | None = Field(default=None, max_length=240)
    valid_until: str | None = Field(default=None, max_length=32)


class ReviewEvidenceRequest(BaseModel):
    status: Literal["reviewed", "test_reviewed", "rejected", "expired"]
    review_note: str = Field(default="", max_length=1000)


class CreateRequirementRequest(BaseModel):
    material_id: str
    minimum_quantity_kg_week: float = Field(ge=0, le=10_000_000)
    maximum_quantity_kg_week: float = Field(gt=0, le=10_000_000)
    minimum_quality_grade: QualityGrade = "standard"
    maximum_distance_km: float = Field(gt=0, le=2500)
    target_price_per_kg: float | None = Field(default=None, ge=0, le=1_000_000)
    allow_partial_quantity: bool = True
    city: str = Field(min_length=2, max_length=100)

    @model_validator(mode="after")
    def valid_range(self) -> "CreateRequirementRequest":
        if self.minimum_quantity_kg_week > self.maximum_quantity_kg_week:
            raise ValueError("Minimum quantity cannot exceed maximum quantity.")
        return self


class UpdateBuyerAcceptanceSpecRequest(BaseModel):
    accepted_forms: list[str] = Field(default_factory=list)
    accepted_colours: list[str] = Field(default_factory=list)
    prohibited_materials: list[str] = Field(default_factory=list)
    required_evidence_status: EvidenceStatus = "self_declared"
    requires_sample: bool = False
    available_capacity_kg_week: float | None = Field(default=None, gt=0)
    route_note: str = Field(default="", max_length=1000)
    review_note: str = Field(default="", max_length=1000)


class CreateSampleRequest(BaseModel):
    requested_quantity_kg: float = Field(default=25, gt=0, le=10_000)
    note: str = Field(default="", max_length=1000)


class UpdateSampleRequest(BaseModel):
    status: SampleStatus
    note: str = Field(default="", max_length=1000)


class CreateOfferRequest(BaseModel):
    price_per_kg: float = Field(ge=0, le=1_000_000)
    quantity_kg: float = Field(gt=0, le=10_000_000)
    pickup_model: Literal["buyer_pickup", "generator_delivery", "quote_required"] = "buyer_pickup"
    note: str = Field(default="", max_length=1000)


class UpdateOfferRequest(BaseModel):
    status: OfferStatus
    note: str = Field(default="", max_length=1000)


class CreateShipmentRequest(BaseModel):
    planned_quantity_kg: float = Field(gt=0, le=10_000_000)
    pickup_date: str = Field(min_length=4, max_length=40)
    pickup_model: Literal["buyer_pickup", "generator_delivery", "platform_quote"] = "buyer_pickup"
    carrier_name: str = Field(default="To be confirmed", max_length=160)


class UpdateShipmentRequest(BaseModel):
    status: ShipmentStatus | None = None
    dispatched_weight_kg: float | None = Field(default=None, ge=0)
    received_weight_kg: float | None = Field(default=None, ge=0)
    receipt_note: str | None = Field(default=None, max_length=1000)


class UpdateScoringConfigRequest(BaseModel):
    weights: dict[str, float]

    @field_validator("weights")
    @classmethod
    def valid_weights(cls, value: dict[str, float]) -> dict[str, float]:
        return ScoringConfig(weights=value).weights


class ContactMatchRequest(BaseModel):
    note: str = Field(default="", max_length=500)
