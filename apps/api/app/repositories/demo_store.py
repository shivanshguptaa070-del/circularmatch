from __future__ import annotations

from datetime import datetime, timezone
from threading import RLock
from typing import Any
from uuid import uuid4

from app.schemas.models import (
    AuditEvent,
    BuyerAcceptanceSpec,
    BuyerRequirement,
    Company,
    ImpactMethodology,
    Material,
    MaterialLot,
    MatchRecord,
    Notification,
    Offer,
    QualityEvidence,
    SampleRequest,
    ScoringConfig,
    Shipment,
    User,
    WasteListing,
)
from app.seed.demo_data import fresh_seed_data


class DemoStore:
    """In-memory repository for a reliable, clearly labelled hackathon demo.

    Its records mirror the production-oriented schema: listing streams, dispatchable
    lots, evidence, buyer acceptance templates, match checks and transaction events.
    Every state reset returns the fictional Delhi NCR dataset.
    """

    def __init__(self) -> None:
        self._lock = RLock()
        self.reset()

    @staticmethod
    def timestamp() -> str:
        return datetime.now(timezone.utc).isoformat()

    def reset(self, include_sample_entities: bool = True) -> None:
        with self._lock:
            seed = fresh_seed_data(include_sample_entities=include_sample_entities)
            self.materials: dict[str, Material] = {item.id: item for item in seed["materials"]}
            self.companies: dict[str, Company] = {item.id: item for item in seed["companies"]}
            self.users: dict[str, User] = {item.id: item for item in seed["users"]}
            self.listings: dict[str, WasteListing] = {item.id: item for item in seed["listings"]}
            self.requirements: dict[str, BuyerRequirement] = {item.id: item for item in seed["requirements"]}
            self.lots: dict[str, MaterialLot] = {item.id: item for item in seed.get("lots", [])}
            self.evidence: dict[str, QualityEvidence] = {
                item.id: item if isinstance(item, QualityEvidence) else QualityEvidence(**item)
                for item in seed.get("evidence", [])
            }
            self.acceptance_specs: dict[str, BuyerAcceptanceSpec] = {
                item.buyer_requirement_id: item if isinstance(item, BuyerAcceptanceSpec) else BuyerAcceptanceSpec(**item)
                for item in seed.get("acceptance_specs", [])
            }
            self.impact_methodologies: dict[str, ImpactMethodology] = {
                item.id: item if isinstance(item, ImpactMethodology) else ImpactMethodology(**item)
                for item in seed.get("impact_methodologies", [])
            }
            self.sample_requests: dict[str, SampleRequest] = {
                item["id"] if isinstance(item, dict) else item.id: item if isinstance(item, SampleRequest) else SampleRequest(**item)
                for item in seed.get("sample_requests", [])
            }
            self.offers: dict[str, Offer] = {
                item["id"] if isinstance(item, dict) else item.id: item if isinstance(item, Offer) else Offer(**item)
                for item in seed.get("offers", [])
            }
            self.shipments: dict[str, Shipment] = {
                item["id"] if isinstance(item, dict) else item.id: item if isinstance(item, Shipment) else Shipment(**item)
                for item in seed.get("shipments", [])
            }
            self.audit_events: list[AuditEvent] = [
                item if isinstance(item, AuditEvent) else AuditEvent(**item)
                for item in seed.get("audit_events", [])
            ]
            self.matches: dict[str, MatchRecord] = {}
            self.notifications: dict[str, Notification] = {}
            self.transactions: list[dict[str, Any]] = seed["transactions"]
            self.scoring_config: ScoringConfig = seed["scoring_config"]

    # Query helpers ---------------------------------------------------------
    def get_user(self, user_id: str) -> User | None:
        return self.users.get(user_id)

    def user_for_persona(self, persona: str) -> User | None:
        for user in self.users.values():
            if user.role == persona:
                return user
        return None

    def get_company(self, company_id: str) -> Company | None:
        return self.companies.get(company_id)

    def get_material(self, material_id: str) -> Material | None:
        return self.materials.get(material_id)

    def list_materials(self) -> list[Material]:
        return list(self.materials.values())

    def get_listing(self, listing_id: str) -> WasteListing | None:
        return self.listings.get(listing_id)

    def get_requirement(self, requirement_id: str) -> BuyerRequirement | None:
        return self.requirements.get(requirement_id)

    def get_match(self, match_id: str) -> MatchRecord | None:
        return self.matches.get(match_id)

    def get_lot(self, lot_id: str) -> MaterialLot | None:
        return self.lots.get(lot_id)

    def list_lots(self, listing_id: str, *, available_only: bool = False) -> list[MaterialLot]:
        lots = [item for item in self.lots.values() if item.listing_id == listing_id]
        if available_only:
            lots = [item for item in lots if item.status == "available"]
        return sorted(lots, key=lambda item: item.created_at, reverse=True)

    def primary_lot_for_listing(self, listing_id: str) -> MaterialLot | None:
        lots = self.list_lots(listing_id, available_only=True)
        if lots:
            return lots[0]
        lots = self.list_lots(listing_id)
        return lots[0] if lots else None

    def list_evidence(self, lot_id: str) -> list[QualityEvidence]:
        return sorted(
            [item for item in self.evidence.values() if item.lot_id == lot_id],
            key=lambda item: item.created_at,
            reverse=True,
        )

    def get_evidence(self, evidence_id: str) -> QualityEvidence | None:
        return self.evidence.get(evidence_id)

    def get_acceptance_spec(self, requirement_id: str) -> BuyerAcceptanceSpec | None:
        return self.acceptance_specs.get(requirement_id)

    def list_impact_methodologies(self) -> list[ImpactMethodology]:
        return list(self.impact_methodologies.values())

    def list_sample_requests(self, match_id: str) -> list[SampleRequest]:
        return sorted(
            [item for item in self.sample_requests.values() if item.match_id == match_id],
            key=lambda item: item.created_at,
        )

    def list_offers(self, match_id: str) -> list[Offer]:
        return sorted(
            [item for item in self.offers.values() if item.match_id == match_id],
            key=lambda item: item.created_at,
        )

    def list_shipments(self, match_id: str) -> list[Shipment]:
        return sorted(
            [item for item in self.shipments.values() if item.match_id == match_id],
            key=lambda item: item.created_at,
        )

    def list_audit_events(self, *, entity_id: str | None = None, limit: int = 50) -> list[AuditEvent]:
        records = self.audit_events
        if entity_id:
            records = [item for item in records if item.entity_id == entity_id]
        return sorted(records, key=lambda item: item.created_at, reverse=True)[:limit]

    def list_listings(self, *, company_id: str | None = None, active_only: bool = False) -> list[WasteListing]:
        records = list(self.listings.values())
        if company_id:
            records = [item for item in records if item.company_id == company_id]
        if active_only:
            records = [item for item in records if item.status == "active"]
        return sorted(records, key=lambda item: item.created_at, reverse=True)

    def list_requirements(self, *, company_id: str | None = None, active_only: bool = False) -> list[BuyerRequirement]:
        records = list(self.requirements.values())
        if company_id:
            records = [item for item in records if item.company_id == company_id]
        if active_only:
            records = [item for item in records if item.status == "active"]
        return sorted(records, key=lambda item: item.created_at, reverse=True)

    @staticmethod
    def _match_sort_key(item: MatchRecord) -> tuple[float, int]:
        # Preserve a transparent score ranking while exposing eligibility state
        # prominently in the UI; a lower rank must never hide a blocked/missing-evidence flag.
        status_rank = {"eligible": 0, "needs_sample": 1, "missing_evidence": 2, "blocked": 3}
        return -item.total_score, status_rank[item.eligibility_status]

    def list_matches_for_listing(self, listing_id: str) -> list[MatchRecord]:
        return sorted(
            [item for item in self.matches.values() if item.listing_id == listing_id],
            key=self._match_sort_key,
        )

    def list_matches_for_requirement(self, requirement_id: str) -> list[MatchRecord]:
        return sorted(
            [item for item in self.matches.values() if item.buyer_requirement_id == requirement_id],
            key=self._match_sort_key,
        )

    # Mutation helpers ------------------------------------------------------
    def create_listing(self, listing: WasteListing) -> WasteListing:
        with self._lock:
            self.listings[listing.id] = listing
        return listing

    def update_listing(self, listing_id: str, updates: dict[str, Any]) -> WasteListing | None:
        with self._lock:
            current = self.listings.get(listing_id)
            if current is None:
                return None
            updated = WasteListing(**(current.model_dump() | updates))
            self.listings[listing_id] = updated
            return updated

    def create_lot(self, lot: MaterialLot) -> MaterialLot:
        with self._lock:
            self.lots[lot.id] = lot
        return lot

    def create_evidence(self, evidence: QualityEvidence) -> QualityEvidence:
        with self._lock:
            self.evidence[evidence.id] = evidence
            lot = self.lots.get(evidence.lot_id)
            if lot and evidence.id not in lot.evidence_ids:
                self.lots[lot.id] = MaterialLot(**(lot.model_dump() | {"evidence_ids": [*lot.evidence_ids, evidence.id]}))
        return evidence

    def update_evidence(self, evidence_id: str, updates: dict[str, Any]) -> QualityEvidence | None:
        with self._lock:
            current = self.evidence.get(evidence_id)
            if current is None:
                return None
            updated = QualityEvidence(**(current.model_dump() | updates))
            self.evidence[evidence_id] = updated
            return updated

    def create_requirement(self, requirement: BuyerRequirement) -> BuyerRequirement:
        with self._lock:
            self.requirements[requirement.id] = requirement
        return requirement

    def save_acceptance_spec(self, spec: BuyerAcceptanceSpec) -> BuyerAcceptanceSpec:
        with self._lock:
            self.acceptance_specs[spec.buyer_requirement_id] = spec
        return spec

    def clear_matches_for_listing(self, listing_id: str) -> None:
        with self._lock:
            match_ids = [match_id for match_id, item in self.matches.items() if item.listing_id == listing_id]
            for match_id in match_ids:
                del self.matches[match_id]

    def clear_matches_for_requirement(self, requirement_id: str) -> None:
        with self._lock:
            match_ids = [match_id for match_id, item in self.matches.items() if item.buyer_requirement_id == requirement_id]
            for match_id in match_ids:
                del self.matches[match_id]

    def save_match(self, match: MatchRecord) -> MatchRecord:
        with self._lock:
            self.matches[match.id] = match
        return match

    def update_match(self, match_id: str, updates: dict[str, Any]) -> MatchRecord | None:
        with self._lock:
            current = self.matches.get(match_id)
            if current is None:
                return None
            updated = MatchRecord(**(current.model_dump() | updates))
            self.matches[match_id] = updated
            return updated

    def create_sample_request(self, sample: SampleRequest) -> SampleRequest:
        with self._lock:
            self.sample_requests[sample.id] = sample
        return sample

    def update_sample_request(self, sample_id: str, updates: dict[str, Any]) -> SampleRequest | None:
        with self._lock:
            current = self.sample_requests.get(sample_id)
            if current is None:
                return None
            updated = SampleRequest(**(current.model_dump() | updates | {"updated_at": self.timestamp()}))
            self.sample_requests[sample_id] = updated
            return updated

    def create_offer(self, offer: Offer) -> Offer:
        with self._lock:
            self.offers[offer.id] = offer
        return offer

    def update_offer(self, offer_id: str, updates: dict[str, Any]) -> Offer | None:
        with self._lock:
            current = self.offers.get(offer_id)
            if current is None:
                return None
            updated = Offer(**(current.model_dump() | updates))
            self.offers[offer_id] = updated
            return updated

    def create_shipment(self, shipment: Shipment) -> Shipment:
        with self._lock:
            self.shipments[shipment.id] = shipment
        return shipment

    def update_shipment(self, shipment_id: str, updates: dict[str, Any]) -> Shipment | None:
        with self._lock:
            current = self.shipments.get(shipment_id)
            if current is None:
                return None
            updated = Shipment(**(current.model_dump() | updates | {"updated_at": self.timestamp()}))
            self.shipments[shipment_id] = updated
            return updated

    def add_audit_event(self, entity_type: str, entity_id: str, action: str, summary: str, actor_id: str | None = None) -> AuditEvent:
        event = AuditEvent(
            id=self.new_id("audit"),
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            actor_id=actor_id,
            summary=summary,
            created_at=self.timestamp(),
            is_demo=True,
        )
        with self._lock:
            self.audit_events.append(event)
        return event

    def create_notification(self, notification: Notification) -> None:
        with self._lock:
            self.notifications[notification.id] = notification

    def get_user_notifications(self, user_id: str) -> list[Notification]:
        with self._lock:
            return sorted(
                [n for n in self.notifications.values() if n.user_id == user_id],
                key=lambda x: x.created_at,
                reverse=True,
            )

    def mark_notification_read(self, notification_id: str) -> Notification | None:
        with self._lock:
            if notification_id in self.notifications:
                self.notifications[notification_id].is_read = True
                return self.notifications[notification_id]
            return None

    def add_transaction(self, *, match_id: str, listing_id: str, initiated_by: str, note: str) -> dict[str, Any]:
        transaction = {
            "id": f"txn-{uuid4().hex[:10]}",
            "match_id": match_id,
            "listing_id": listing_id,
            "initiated_by": initiated_by,
            "status": "contacted",
            "agreed_quantity_kg": 0,
            "note": note,
            "created_at": self.timestamp(),
            "is_demo": True,
        }
        with self._lock:
            self.transactions.append(transaction)
        return transaction

    def set_scoring_weights(self, weights: dict[str, float]) -> ScoringConfig:
        with self._lock:
            self.scoring_config = ScoringConfig(
                id=self.scoring_config.id,
                name=self.scoring_config.name,
                weights=weights,
                version=self.scoring_config.version + 1,
                is_demo=True,
            )
            return self.scoring_config

    @staticmethod
    def new_id(prefix: str) -> str:
        return f"{prefix}-{uuid4().hex[:12]}"
