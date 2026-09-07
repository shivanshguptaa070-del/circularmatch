from __future__ import annotations

import logging
from datetime import datetime, timezone
from threading import RLock
from typing import Any
from uuid import uuid4

logger = logging.getLogger(__name__)

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
        # Restore real user data from Supabase Storage (survives redeploys)
        self._load_persistent_data()

    @staticmethod
    def timestamp() -> str:
        return datetime.now(timezone.utc).isoformat()

    def reset(self, include_sample_entities: bool = True) -> None:
        with self._lock:
            # SAFETY: Preserve real user records from memory before wiping.
            # This means reset() is safe even if Supabase is temporarily unreachable —
            # real user data is never lost because we never depend on the network here.
            real_companies = {k: v for k, v in self.companies.items() if not v.is_demo} if hasattr(self, "companies") else {}
            real_users = {k: v for k, v in self.users.items() if not v.is_demo} if hasattr(self, "users") else {}
            real_listings = {k: v for k, v in self.listings.items() if not v.is_demo} if hasattr(self, "listings") else {}
            real_requirements = {k: v for k, v in self.requirements.items() if not v.is_demo} if hasattr(self, "requirements") else {}
            real_lots = {k: v for k, v in self.lots.items() if not v.is_demo} if hasattr(self, "lots") else {}
            real_evidence = {k: v for k, v in self.evidence.items() if not v.is_demo} if hasattr(self, "evidence") else {}
            real_specs = {k: v for k, v in self.acceptance_specs.items() if not v.is_demo} if hasattr(self, "acceptance_specs") else {}
            
            real_listing_ids = set(real_listings.keys())
            real_req_ids = set(real_requirements.keys())

            real_matches = {k: v for k, v in self.matches.items() if v.listing_id in real_listing_ids or v.buyer_requirement_id in real_req_ids} if hasattr(self, "matches") else {}
            real_samples = {k: v for k, v in self.sample_requests.items() if not v.is_demo} if hasattr(self, "sample_requests") else {}
            real_offers = {k: v for k, v in self.offers.items() if not v.is_demo} if hasattr(self, "offers") else {}
            real_shipments = {k: v for k, v in self.shipments.items() if not v.is_demo} if hasattr(self, "shipments") else {}
            real_audits = [a for a in self.audit_events if getattr(a, "is_demo", True) is False] if hasattr(self, "audit_events") else []
            real_txns = [t for t in self.transactions if not t.get("is_demo", True)] if hasattr(self, "transactions") else []
            real_notifications = {k: v for k, v in self.notifications.items() if not v.is_demo} if hasattr(self, "notifications") else {}

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

            # RESTORE: Merge real user records back on top of seed data
            self.companies.update(real_companies)
            self.users.update(real_users)
            self.listings.update(real_listings)
            self.requirements.update(real_requirements)
            self.lots.update(real_lots)
            self.evidence.update(real_evidence)
            self.acceptance_specs.update(real_specs)
            self.matches.update(real_matches)
            self.sample_requests.update(real_samples)
            self.offers.update(real_offers)
            self.shipments.update(real_shipments)
            self.audit_events.extend(real_audits)
            self.transactions.extend(real_txns)
            self.notifications.update(real_notifications)
            if real_users:
                logger.info(
                    "DemoStore.reset(): preserved %d real companies, %d real users, %d real listings.",
                    len(real_companies), len(real_users), len(real_listings),
                )

    def _load_persistent_data(self) -> None:
        """Restore non-demo user records from Supabase Storage snapshot on startup.

        Also runs a one-time migration: if a real user (is_demo=False) has a company
        that is still tagged is_demo=True (historical bug), we correct it on load so
        that it gets written back correctly in the next snapshot save.
        """
        try:
            from app.core.persistence import ensure_bucket, load_snapshot
            ensure_bucket()
            snapshot = load_snapshot()
        except Exception as exc:
            logger.warning("DemoStore: persistence load failed: %s", exc)
            return
        if not snapshot:
            return

        with self._lock:
            # Build a set of company IDs owned by real users so we can fix their is_demo flag
            real_user_company_ids: set[str] = set()
            for raw in snapshot.get("users", []):
                if not raw.get("is_demo", True):
                    cid = raw.get("company_id")
                    if cid:
                        real_user_company_ids.add(cid)

            # Load companies — fix is_demo for real-user-owned companies (one-time migration)
            for raw in snapshot.get("companies", []):
                try:
                    if raw.get("id") in real_user_company_ids and raw.get("is_demo", True):
                        raw = dict(raw)  # copy so we don't mutate the snapshot dict
                        raw["is_demo"] = False
                        logger.info(
                            "DemoStore: one-time fix — company %s corrected from is_demo=True to False (real user).",
                            raw["id"],
                        )
                    obj = Company(**raw)
                    self.companies[obj.id] = obj
                except Exception as exc:
                    logger.warning("DemoStore: failed to load company: %s", exc)

            # Load users
            for raw in snapshot.get("users", []):
                try:
                    obj = User(**raw)
                    self.users[obj.id] = obj
                except Exception as exc:
                    logger.warning("DemoStore: failed to load user: %s", exc)

            # Build set of real listing/requirement company IDs so we can fix them too
            real_company_ids = {c.id for c in self.companies.values() if not c.is_demo}

            for raw in snapshot.get("listings", []):
                try:
                    # Fix listings owned by real companies
                    if raw.get("company_id") in real_company_ids and raw.get("is_demo", True):
                        raw = dict(raw)
                        raw["is_demo"] = False
                        logger.info(
                            "DemoStore: one-time fix — listing %s corrected to is_demo=False.", raw.get("id")
                        )
                    obj = WasteListing(**raw)
                    self.listings[obj.id] = obj
                except Exception as exc:
                    logger.warning("DemoStore: failed to load listing: %s", exc)
            for raw in snapshot.get("requirements", []):
                try:
                    if raw.get("company_id") in real_company_ids and raw.get("is_demo", True):
                        raw = dict(raw)
                        raw["is_demo"] = False
                        logger.info(
                            "DemoStore: one-time fix — requirement %s corrected to is_demo=False.", raw.get("id")
                        )
                    obj = BuyerRequirement(**raw)
                    self.requirements[obj.id] = obj
                except Exception as exc:
                    logger.warning("DemoStore: failed to load requirement: %s", exc)
            for raw in snapshot.get("lots", []):
                try:
                    obj = MaterialLot(**raw)
                    self.lots[obj.id] = obj
                except Exception as exc:
                    logger.warning("DemoStore: failed to load lot: %s", exc)
            for raw in snapshot.get("evidence", []):
                try:
                    obj = QualityEvidence(**raw)
                    self.evidence[obj.id] = obj
                except Exception as exc:
                    logger.warning("DemoStore: failed to load evidence: %s", exc)
            for raw in snapshot.get("acceptance_specs", []):
                try:
                    obj = BuyerAcceptanceSpec(**raw)
                    self.acceptance_specs[obj.buyer_requirement_id] = obj
                except Exception as exc:
                    logger.warning("DemoStore: failed to load acceptance spec: %s", exc)
            for raw in snapshot.get("matches", []):
                try:
                    obj = MatchRecord(**raw)
                    self.matches[obj.id] = obj
                except Exception as exc:
                    logger.warning("DemoStore: failed to load match: %s", exc)

            for raw in snapshot.get("sample_requests", []):
                try:
                    obj = SampleRequest(**raw)
                    self.sample_requests[obj.id] = obj
                except Exception as exc:
                    logger.warning("DemoStore: failed to load sample_request: %s", exc)
            for raw in snapshot.get("offers", []):
                try:
                    obj = Offer(**raw)
                    self.offers[obj.id] = obj
                except Exception as exc:
                    logger.warning("DemoStore: failed to load offer: %s", exc)
            for raw in snapshot.get("shipments", []):
                try:
                    obj = Shipment(**raw)
                    self.shipments[obj.id] = obj
                except Exception as exc:
                    logger.warning("DemoStore: failed to load shipment: %s", exc)
            for raw in snapshot.get("audit_events", []):
                try:
                    obj = AuditEvent(**raw)
                    self.audit_events.append(obj)
                except Exception as exc:
                    logger.warning("DemoStore: failed to load audit_event: %s", exc)
            self.transactions.extend(snapshot.get("transactions", []))
            for raw in snapshot.get("notifications", []):
                try:
                    obj = Notification(**raw)
                    self.notifications[obj.id] = obj
                except Exception as exc:
                    logger.warning("DemoStore: failed to load notification: %s", exc)

        real_users_loaded = sum(1 for u in self.users.values() if not u.is_demo)
        real_cos_loaded = sum(1 for c in self.companies.values() if not c.is_demo)
        logger.info(
            "DemoStore: restored %d real users, %d real companies, %d listings, %d requirements from snapshot.",
            real_users_loaded, real_cos_loaded, len(self.listings), len(self.requirements),
        )

        # Immediately re-save the corrected snapshot so the fixes are persisted
        if real_users_loaded > 0:
            self._save_snapshot()


    def _save_snapshot(self) -> None:
        """Serialize real user data (is_demo=False only) and upload snapshot to Supabase Storage.

        Demo/seed records are never included in the snapshot — they are always reconstructed
        from demo_data.py at startup. This ensures the snapshot is a pure real-user-data backup
        and can never be contaminated by demo records.
        """
        try:
            from app.core.persistence import save_snapshot
            with self._lock:
                # Add a timestamp so we can track versions and avoid race conditions
                version = datetime.now(timezone.utc).timestamp()
                self._last_snapshot_version = version

                # CRITICAL: Only persist real user records (is_demo=False).
                # Seed/demo records are never written to storage.
                # Identify real listings and requirements to filter matches
                real_listing_ids = {l.id for l in self.listings.values() if not l.is_demo}
                real_req_ids = {r.id for r in self.requirements.values() if not r.is_demo}

                data = {
                    "companies": [c.model_dump() for c in self.companies.values() if not c.is_demo],
                    "users": [u.model_dump() for u in self.users.values() if not u.is_demo],
                    "listings": [l.model_dump() for l in self.listings.values() if not l.is_demo],
                    "requirements": [r.model_dump() for r in self.requirements.values() if not r.is_demo],
                    "lots": [lot.model_dump() for lot in self.lots.values() if not lot.is_demo],
                    "evidence": [e.model_dump() for e in self.evidence.values() if not e.is_demo],
                    "acceptance_specs": [s.model_dump() for s in self.acceptance_specs.values() if not s.is_demo],
                    "matches": [m.model_dump() for m in self.matches.values() if m.listing_id in real_listing_ids or m.buyer_requirement_id in real_req_ids],
                    "sample_requests": [s.model_dump() for s in self.sample_requests.values() if not s.is_demo],
                    "offers": [o.model_dump() for o in self.offers.values() if not o.is_demo],
                    "shipments": [s.model_dump() for s in self.shipments.values() if not s.is_demo],
                    "audit_events": [a.model_dump() for a in self.audit_events if getattr(a, "is_demo", True) is False],
                    "transactions": [t for t in self.transactions if not t.get("is_demo", True)],
                    "notifications": [n.model_dump() for n in self.notifications.values() if not n.is_demo],
                }
            
            import threading
            def bg_save():
                try:
                    with self._lock:
                        if self._last_snapshot_version != version:
                            return # A newer snapshot is already pending or saved
                    save_snapshot(data)
                except Exception as exc:
                    logger.warning("DemoStore: snapshot background save failed: %s", exc)
                    
            threading.Thread(target=bg_save, daemon=True).start()
        except Exception as exc:
            logger.warning("DemoStore: snapshot save failed: %s", exc)

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
    def create_user(self, user: User) -> User:
        with self._lock:
            self.users[user.id] = user
        self._save_snapshot()
        return user

    def create_company(self, company: Company) -> Company:
        with self._lock:
            self.companies[company.id] = company
        self._save_snapshot()
        return company

    def create_listing(self, listing: WasteListing) -> WasteListing:
        with self._lock:
            self.listings[listing.id] = listing
        self._save_snapshot()
        return listing

    def update_listing(self, listing_id: str, updates: dict[str, Any]) -> WasteListing | None:
        with self._lock:
            current = self.listings.get(listing_id)
            if current is None:
                return None
            updated = WasteListing(**(current.model_dump() | updates))
            self.listings[listing_id] = updated
        self._save_snapshot()
        return updated

    def create_lot(self, lot: MaterialLot) -> MaterialLot:
        with self._lock:
            self.lots[lot.id] = lot
        self._save_snapshot()
        return lot

    def create_evidence(self, evidence: QualityEvidence) -> QualityEvidence:
        with self._lock:
            self.evidence[evidence.id] = evidence
            lot = self.lots.get(evidence.lot_id)
            if lot and evidence.id not in lot.evidence_ids:
                self.lots[lot.id] = MaterialLot(**(lot.model_dump() | {"evidence_ids": [*lot.evidence_ids, evidence.id]}))
        self._save_snapshot()
        return evidence

    def update_evidence(self, evidence_id: str, updates: dict[str, Any]) -> QualityEvidence | None:
        with self._lock:
            current = self.evidence.get(evidence_id)
            if current is None:
                return None
            updated = QualityEvidence(**(current.model_dump() | updates))
            self.evidence[evidence_id] = updated
        self._save_snapshot()
        return updated

    def create_requirement(self, requirement: BuyerRequirement) -> BuyerRequirement:
        with self._lock:
            self.requirements[requirement.id] = requirement
        self._save_snapshot()
        return requirement

    def save_acceptance_spec(self, spec: BuyerAcceptanceSpec) -> BuyerAcceptanceSpec:
        with self._lock:
            self.acceptance_specs[spec.buyer_requirement_id] = spec
        self._save_snapshot()
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
        self._save_snapshot()
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
        self._save_snapshot()
        return sample

    def update_sample_request(self, sample_id: str, updates: dict[str, Any]) -> SampleRequest | None:
        with self._lock:
            current = self.sample_requests.get(sample_id)
            if current is None:
                return None
            updated = SampleRequest(**(current.model_dump() | updates | {"updated_at": self.timestamp()}))
            self.sample_requests[sample_id] = updated
        self._save_snapshot()
        return updated

    def create_offer(self, offer: Offer) -> Offer:
        with self._lock:
            self.offers[offer.id] = offer
        self._save_snapshot()
        return offer

    def update_offer(self, offer_id: str, updates: dict[str, Any]) -> Offer | None:
        with self._lock:
            current = self.offers.get(offer_id)
            if current is None:
                return None
            updated = Offer(**(current.model_dump() | updates))
            self.offers[offer_id] = updated
        self._save_snapshot()
        return updated

    def create_shipment(self, shipment: Shipment) -> Shipment:
        with self._lock:
            self.shipments[shipment.id] = shipment
        self._save_snapshot()
        return shipment

    def update_shipment(self, shipment_id: str, updates: dict[str, Any]) -> Shipment | None:
        with self._lock:
            current = self.shipments.get(shipment_id)
            if current is None:
                return None
            updated = Shipment(**(current.model_dump() | updates | {"updated_at": self.timestamp()}))
            self.shipments[shipment_id] = updated
        self._save_snapshot()
        return updated

    def add_audit_event(self, entity_type: str, entity_id: str, action: str, summary: str, actor_id: str | None = None, is_demo: bool = True) -> AuditEvent:
        event = AuditEvent(
            id=self.new_id("audit"),
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            actor_id=actor_id,
            summary=summary,
            created_at=self.timestamp(),
            is_demo=is_demo,
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

    def add_transaction(self, *, match_id: str, listing_id: str, initiated_by: str, note: str, status: str = "contacted", agreed_quantity_kg: float = 0, is_demo: bool = True) -> dict[str, Any]:
        transaction = {
            "id": f"txn-{uuid4().hex[:10]}",
            "match_id": match_id,
            "listing_id": listing_id,
            "initiated_by": initiated_by,
            "status": status,
            "agreed_quantity_kg": agreed_quantity_kg,
            "note": note,
            "created_at": self.timestamp(),
            "is_demo": is_demo,
        }
        with self._lock:
            self.transactions.append(transaction)
        self._save_snapshot()
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

    def purge_demo_data(self, *, dry_run: bool = True) -> dict[str, int]:
        """Remove all seed/demo records (is_demo=True) from every collection.

        Always call with dry_run=True first to see what would be deleted.
        When dry_run=False, the deletion is committed and the snapshot is saved,
        leaving only real user data in storage.

        Returns a dict of entity type -> count of records deleted (or would-be-deleted).
        """
        with self._lock:
            to_delete = {
                "companies": [k for k, v in self.companies.items() if v.is_demo],
                "users": [k for k, v in self.users.items() if v.is_demo],
                "listings": [k for k, v in self.listings.items() if v.is_demo],
                "requirements": [k for k, v in self.requirements.items() if v.is_demo],
                "lots": [k for k, v in self.lots.items()],  # lots have no is_demo field yet
                "evidence": [k for k, v in self.evidence.items() if v.is_demo],
                "acceptance_specs": [k for k, v in self.acceptance_specs.items() if v.is_demo],
                "matches": [k for k, v in self.matches.items()],  # matches have no is_demo field yet
                "transactions": len([t for t in self.transactions if t.get("is_demo", True)]),
            }
            counts = {
                k: (v if isinstance(v, int) else len(v))
                for k, v in to_delete.items()
            }

            if dry_run:
                logger.info("DemoStore.purge_demo_data(dry_run=True): would delete %s", counts)
                return counts

            # Execute deletion
            for k in to_delete["companies"]:
                self.companies.pop(k, None)
            for k in to_delete["users"]:
                self.users.pop(k, None)
            for k in to_delete["listings"]:
                self.listings.pop(k, None)
            for k in to_delete["requirements"]:
                self.requirements.pop(k, None)
            for k in to_delete["lots"]:
                self.lots.pop(k, None)
            for k in to_delete["evidence"]:
                self.evidence.pop(k, None)
            for k in to_delete["acceptance_specs"]:
                self.acceptance_specs.pop(k, None)
            for k in to_delete["matches"]:
                self.matches.pop(k, None)
            self.transactions = [t for t in self.transactions if not t.get("is_demo", True)]
            logger.info("DemoStore.purge_demo_data(): deleted %s", counts)

        # Save snapshot immediately (synchronous, not background, so caller can confirm)
        try:
            from app.core.persistence import save_snapshot
            data = {
                "companies": [c.model_dump() for c in self.companies.values() if not c.is_demo],
                "users": [u.model_dump() for u in self.users.values() if not u.is_demo],
                "listings": [l.model_dump() for l in self.listings.values() if not l.is_demo],
                "requirements": [r.model_dump() for r in self.requirements.values() if not r.is_demo],
                "lots": [lot.model_dump() for lot in self.lots.values()],
                "evidence": [e.model_dump() for e in self.evidence.values() if not e.is_demo],
                "acceptance_specs": [s.model_dump() for s in self.acceptance_specs.values() if not s.is_demo],
                "matches": [m.model_dump() for m in self.matches.values()],
            }
            save_snapshot(data)
        except Exception as exc:
            logger.warning("DemoStore.purge_demo_data(): snapshot save failed: %s", exc)

        return counts

    @staticmethod
    def new_id(prefix: str) -> str:
        return f"{prefix}-{uuid4().hex[:12]}"
