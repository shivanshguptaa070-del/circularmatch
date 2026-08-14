# CircularMatch — Research-Backed Upgrade & Pilot Plan

**Research date:** 12 August 2026 (India / Delhi NCR focus)  
**Purpose:** Identify what CircularMatch must become after the hackathon MVP in order to be credible for a real industrial pilot.

> **Bottom line:** CircularMatch should not evolve into a larger generic waste marketplace. It should evolve into a **trusted secondary-material exchange workflow**: a structured material passport, eligibility-aware matching, evidence-based buyer acceptance, and traceable transaction completion.

> **Important:** This is desk research and product planning, **not legal advice, a waste-classification opinion, a laboratory standard, or an LCA study**. Regulatory eligibility must be confirmed for the exact material, location, and counterparty by the relevant organisation and qualified advisers.

---

## 1. Executive recommendation

### Product positioning to keep

**“CircularMatch helps industrial teams convert a by-product into a buyer-ready, evidence-backed secondary material opportunity.”**

The existing MVP is already strong in four important ways:

- it turns natural language into a user-reviewed draft;
- it uses deterministic and explainable matching rather than an opaque AI score;
- it distinguishes supplier-described quality from verified quality;
- it labels demo prices and impact values as illustrative.

### Product positioning to change

A real customer will not transact because a listing has a 94% score. They will transact when the platform helps answer:

1. **What exactly is this material lot?**
2. **Can this buyer legally and technically accept it?**
3. **What proof supports the quality claim?**
4. **Can the parties agree on sample, price, quantity, pickup, and acceptance?**
5. **Can the handover and outcome be evidenced?**
6. **Can environmental/circularity reporting be reproduced from stated boundaries and data?**

Therefore, the next product milestone is not “more AI.” It is a **Material Passport + Verification + Transaction Evidence** layer.

---

## 2. What the research says

### Finding A — Industrial symbiosis is a coordination and trust problem, not just a discovery problem

UNIDO describes eco-industrial parks as managed industrial areas that combine resource efficiency, industrial symbiosis, shared infrastructure, risk management, and collaboration across companies. In this model, exchanges of materials, energy, water, and by-products are operational relationships—not just marketplace listings.

**Implication for CircularMatch:** buyer discovery is necessary but insufficient. The product must support the steps between a recommendation and a completed, trusted transfer: evidence, sampling, acceptance, logistics, and handover records.

**Sources:** [UNIDO — Eco-industrial parks](https://www.unido.org/stories/eco-industrial-parks-resource-efficiency-and-industrial-symbiosis), [UNIDO — Industrial parks overview](https://ipp.unido.org/industrial-parks-overview).

### Finding B — Circular data needs to be structured but commercially selective

ISO 59040:2025 establishes a methodology for exchanging circular-economy information through a product circularity data sheet, including mechanisms to share relevant information without disclosing confidential business information. ISO 59020:2024 similarly emphasizes defined system boundaries, indicators, consistent calculation, and verifiable results.

**Implication for CircularMatch:** build a **Material Passport**, not a long unstructured listing. It needs role-based visibility: a buyer can see enough to evaluate suitability while sensitive production details, precise location, and commercial terms remain protected until mutual interest or an NDA.

**Sources:** [ISO 59040:2025](https://www.iso.org/standard/82339.html), [ISO 59020:2024](https://www.iso.org/standard/80650.html).

### Finding C — “PET scrap” is not a sufficient technical specification

A PET market specification illustrates why buyers need more than a material name: PET fraction, colour, free-flowing liquids, contamination, prohibited materials, bale integrity, storage, and shipping requirements can affect grade, value, or rejection. This is a reference example from a US industry association, **not an Indian legal or buyer specification**.

**Implication for CircularMatch:** create buyer-configurable material spec templates. The platform must never infer a material’s chemical quality from a description or photo. It should collect self-declared fields, supporting documents, test evidence, and sample-acceptance outcomes.

**Source:** [Association of Plastic Recyclers — PET Bale Specification](https://plasticsrecycling.org/wp-content/uploads/2024/09/APR-BaleSpec-PETBottle-WithThermoforms.pdf).

### Finding D — India’s compliance landscape makes counterparty and document verification material

CPCB’s plastic-waste guidance describes a centralized EPR portal and registration requirements for relevant Producers, Importers and Brand Owners and Plastic Waste Processors; it also describes reporting, processing capacity, and validation expectations. CPCB’s hazardous-waste materials describe authorized facilities and a prescribed movement/manifest system for hazardous waste.

**Implication for CircularMatch:** the platform needs a **regulatory eligibility matrix**. It must keep ordinary non-hazardous secondary material flows separate from regulated/hazardous flows. For any category where approvals apply, buyers/recyclers must upload and maintain evidence; the product should show `Not checked`, `Document uploaded`, `Reviewed`, or `Expired`—not simply “verified.”

**Sources:** [CPCB plastic EPR registration](https://cpcb.nic.in/registration-for-brand-owner/), [CPCB plastic EPR SOP / assessment guidance](https://cpcb.nic.in/uploads/plasticwaste/SOP_PWM_24062024.pdf), [CPCB hazardous waste tracking material](https://cpcb.nic.in/openpdffile.php?id=VGVuZGVyRmlsZXMvNTQxXzE1NDcwOTk0MzdfbWVkaWFwaG90bzM5NjkucGRm).

### Finding E — Impact reporting needs a method, boundary, and evidence level

GHG Protocol Category 5 covers third-party disposal/treatment of waste generated in operations. It distinguishes supplier-specific, waste-type-specific, and average-data methods; it also requires waste type and treatment route to be defined. Its Scope 3 standard says avoided-emissions claims associated with recycling should be reported separately from the Scope 1/2/3 inventory and should disclose methodology, data sources, boundaries, time period, and assumptions.

**Implication for CircularMatch:** replace one generic “net CO2e benefit” number with a governed impact module containing an impact method version, source, boundary, functional unit, data-quality tier, and uncertainty/disclaimer. Avoided-emissions scenarios must not be presented as a company’s verified GHG inventory.

**Source:** [GHG Protocol — Scope 3 Category 5 technical guidance](https://ghgprotocol.org/sites/default/files/standards_supporting/Ch5_GHGP_Tech.pdf).

### Finding F — Traceability and data access are an emerging market expectation

The EU’s Ecodesign for Sustainable Products Regulation (ESPR) is not an Indian rule, but it is a useful export-market design signal: it introduces product information requirements and Digital Product Passports progressively by product category. This is relevant if CircularMatch later serves exporters or supply chains connected to EU buyers.

**Implication for CircularMatch:** design a modular, interoperable material passport now, but do not falsely label it a “Digital Product Passport” or compliance tool until the relevant product-specific requirements and data obligations are met.

**Source:** [European Commission — ESPR](https://environment.ec.europa.eu/news/sustainable-products-be-norm-consumers-new-regulation-2024-07-19_en).

### Finding G — Data privacy and commercial confidentiality are product requirements

India’s DPDP Rules, 2025 require purpose-specific, clear consent notices; the official PIB backgrounder also describes data-principal rights, security obligations, breach communication, and an 18-month phased compliance period.

**Implication for CircularMatch:** implement role-based access control, a data-sharing consent model, document visibility controls, retention rules, an audit trail, and a process for correction/erasure requests. Do not expose exact production volume, precise location, contact details, or documents to every marketplace user.

**Source:** [PIB — DPDP Rules, 2025](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190655).

---

## 3. Current MVP gap assessment

| Area | What the MVP does well | Gap before a real pilot | Upgrade priority |
|---|---|---|---|
| Material intake | Converts text into a reviewable draft | Only a coarse material/quality record; no lot-level spec, evidence, or sampling | P0 |
| Quality | Correctly labels unknown quality as not verified | No verification workflow, test result, contaminant fields, or buyer acceptance event | P0 |
| Matching | Deterministic, transparent weights and reasons | No strict compliance/specification gates, capacity slots, reliability, or sample status | P0 |
| Buyer requirements | Captures basic quantity, quality, distance, price | No detailed allowable/prohibited-material profile or route-specific spec | P0 |
| Compliance | Recognizes the need for caution | No regulatory triage, document collection, expiry monitoring, or approval workflow | P0 |
| Transaction | Contact intent is recorded | No RFQ, offer, sample, acceptance, pickup, weight reconciliation, or completion proof | P1 |
| Logistics | Haversine demo distance and fixed cost assumption | No road route, vehicle constraints, quote, pickup window, or shipment proof | P1 |
| Economics | Transparent illustrative calculator | No live/verified price data, bid/offer separation, or commercial audit trail | P1 |
| Impact | Transparent demo assumptions | No method registry, source version, boundary choice, factor governance, or uncertainty | P1 |
| AI | Optional structured extraction and constrained catalog | No evaluation set, confidence calibration, source retrieval, or reviewer feedback loop | P1 |
| Platform foundation | Solid React/FastAPI demo and Supabase schema | Demo repository rather than real auth/database/document storage/audit logs | P0 |
| Data protection | Demo users only | No production consent, access policy, retention, redaction, or privacy operations | P1 |

**P0 = needed before calling it a pilot. P1 = needed before claiming operational value. P2 = scale/optimization work.**

---

## 4. The target product: a trusted material-exchange workflow

```text
Material source
   ↓
Material Passport (structured data + evidence + privacy settings)
   ↓
Eligibility gates (technical + regulatory + buyer capacity)
   ↓
Explainable ranking (fit + landed economics + reliability)
   ↓
Sample / inspection / conditional acceptance
   ↓
RFQ → offer → agreement → pickup plan
   ↓
Weighbridge / receipt / quality outcome / chain-of-custody record
   ↓
Method-governed material diversion and impact record
```

### The key design principle

**Separate facts, claims, evidence, and calculations.**

| Type | Example | Product rule |
|---|---|---|
| Fact | `3,000 kg`, `Noida`, `weekly` | Source and timestamp required. |
| Supplier claim | `clean industrial-grade PET` | Show as self-declared until supported. |
| Evidence | test certificate, invoice, photo, SPCB document, weighbridge slip | Store securely with issuer/date/expiry/review status. |
| Deterministic calculation | quantity fit, road distance, score | Version formula and inputs. |
| Scenario estimate | potential net value or potential CO2e benefit | Label the method/boundary/assumptions and confidence tier. |

---

## 5. P0 upgrades — build these before a real pilot

### P0.1 Material Passport and batch/lot data model

Replace a single generic listing with a **listing + batch** model. A company may have a recurring material stream, but each available dispatch should be represented as a batch/lot.

#### Required material-passport fields

**Identity and origin**

- canonical material and category;
- source process (e.g., injection moulding trim, bottle preform scrap, textile cutting); 
- source status: pre-consumer / post-consumer / unknown;
- physical form: flake, bale, granule, sheet, offcut, turnings, loose scrap;
- colour, packaging, storage condition, batch date, expected availability window;
- recurring pattern versus one-time lot.

**Technical and quality fields**

- composition as supplier-declared, with a separate `verified composition` field;
- grade/spec template version;
- contamination fields that are material-specific;
- moisture, visible contamination, prohibited content, prior-use/previous-contents declaration where relevant;
- representative sample available: yes/no;
- test results: method, laboratory/issuer, date, unit, result, attachment;
- photo/document evidence—not a photo-based chemical conclusion.

**Commercial and logistics fields**

- requested commercial model: sell, buyer pickup, generator delivery, RFQ;
- available quantity, minimum dispatch quantity, packaging/bale/pallet details;
- pickup windows, loading capability, vehicle constraints, location-precision setting;
- price state: `not disclosed`, `indicative ask`, `received offer`, `agreed price`.

**Compliance and safety fields**

- regulatory triage state: `not assessed`, `likely ordinary secondary material`, `needs compliance review`, `regulated/hazardous route`;
- hazardous/safety flag; SDS/document request if relevant;
- permitted downstream use constraints;
- explicit note: **the platform does not make a legal classification decision.**

#### New tables

```text
material_spec_templates
material_spec_fields
material_lots
lot_measurements
quality_evidence
laboratory_reports
buyer_acceptance_specs
restricted_material_rules
compliance_documents
organisation_verifications
access_policies
```

#### Definition of done

A buyer can decide whether to request a sample without asking the generator ten follow-up questions, and the system can explain which fields are self-declared versus evidence-backed.

---

### P0.2 Buyer acceptance templates, not only “minimum quality”

A buyer should define a structured acceptance profile per material route.

#### Example: PET manufacturing scrap template

- accepted form: preform/trim/sheet/regrind;
- acceptable polymer / additive declaration;
- colour accepted;
- maximum moisture or contamination threshold, if the buyer specifies one;
- prohibited materials;
- minimum/maximum lot and monthly intake capacity;
- intended route: non-food mechanical recycling / fibre / other approved route;
- documentation needed before quote;
- whether a sample is mandatory;
- buyer-specific test method or inspection checklist.

The APR PET bale specification is a good illustration of why material fraction and contamination must be captured, but buyer templates must be created with **local recycler input** and must never be represented as universal Indian acceptance rules.

#### Definition of done

The matching engine can state: **“Not eligible because PVC is prohibited”** or **“Eligible pending a sample”**, rather than producing a vague lower score.

---

### P0.3 Change the matching engine from one score into gates + ranking

Keep explainability, but split matching into two stages.

#### Stage 1: hard eligibility gates

A match is `ineligible`, `eligible pending verification`, or `eligible`.

```text
1. Controlled material / permitted downstream route
2. Buyer spec and prohibited-material rules
3. Required quality evidence / sample requirement
4. Regulatory/compliance status where applicable
5. Buyer active capacity / weekly slot
6. Quantity and collection feasibility
7. Distance / serviceable logistics radius
```

#### Stage 2: transparent ranking among eligible candidates

Suggested configurable dimensions:

| Dimension | Use | Do not use it for |
|---|---|---|
| Material/spec fit | Exact or approved compatible spec | Guessing chemical composition |
| Evidence quality | Self-declared vs document/test reviewed | Treating a photo as lab proof |
| Quantity/capacity fit | Lot vs buyer intake capacity | Hiding a partial-acceptance condition |
| Logistics | Road route, pickup window, vehicle capability | Haversine as a freight quote |
| Commercial fit | Quote/offer/landed-cost scenario | Pretending a target is an agreed price |
| Reliability | Completed deliveries, on-time receipt, dispute rate | Early-stage exclusion before enough data |
| Circular route fit | Approved route and material recovery assumptions | A universal “green score” |

#### New match outputs

- **Eligibility:** `Eligible`, `Eligible after sample`, `Blocked`, or `Information missing`.
- **Reasons:** concise factual explanation.
- **Action:** `Request missing information`, `Request sample`, `Invite to RFQ`, `Do not pursue`.
- **Confidence / data completeness:** based on evidence coverage, not model confidence alone.
- **Score version and data timestamp.**

#### Definition of done

A buyer sees the same rules a reviewer sees, and a rejected match has an actionable reason rather than a mysterious low percentage.

---

### P0.4 Trust, verification, and compliance workspace

Create a review queue for an admin/compliance operator.

#### Organisation verification

- company legal name and business address;
- GST/business identity verification if the pilot requires it;
- authorised representative and role;
- facility type and stated processing capability;
- document upload/review status;
- expiry reminders;
- review notes and audit history.

#### Document classes

| Document type | Example state | Platform behavior |
|---|---|---|
| Company identity | uploaded/reviewed | Restrict contact release until complete, if pilot policy requires. |
| Facility / pollution-control evidence | not checked / uploaded / reviewed / expired | Required only where the material route requires it. |
| Quality evidence | supplier claim / document reviewed / test reviewed | Never collapse these labels into one “verified” badge. |
| Transport / receipt proof | pending / uploaded / reconciled | Used for final transaction records. |

#### Critical policy

Do not automate a legal conclusion such as “this waste is compliant” or “this facility is licensed.” Use **document-status language**, a review date, and a human reviewer identity.

---

### P0.5 Real platform foundation

Move from in-memory Demo Mode to the intended production foundation while retaining demo mode for hackathons.

1. Supabase Auth with real email/OTP or enterprise invite flow.
2. `company_memberships` instead of one owner per company.
3. PostgreSQL as the source of truth.
4. Supabase Storage or compatible private object storage for documents.
5. Row-level security plus server-side authorization checks.
6. Immutable audit events for listing edits, evidence changes, scores, decisions, and document review.
7. Role split: generator, buyer, quality reviewer, compliance reviewer, logistics coordinator, admin.
8. Backups, soft delete, export/delete request workflow, data retention policy.

---

## 6. P1 upgrades — make the workflow operational

### P1.1 Sample, RFQ, offer, and acceptance workflow

Do not jump from “Contact buyer” to “successful transaction.” Build the workflow real B2B material exchanges need:

```text
Match
→ request information
→ request sample / inspection
→ conditional approval or rejection
→ RFQ / buyer offer / counteroffer
→ agreed commercial terms
→ pickup appointment
→ dispatch and receipt
→ weight and quality reconciliation
→ close / dispute / repeat contract
```

#### New tables

```text
sample_requests
sample_inspections
rfqs
offers
offer_revisions
purchase_agreements
pickup_appointments
shipments
weighbridge_receipts
proof_of_delivery
quality_acceptance_events
disputes
```

#### Definition of done

The product can answer: **what was agreed, what quantity actually arrived, what was accepted, and why any variance occurred?**

---

### P1.2 Logistics: road routing and quote workflow

Replace straight-line Haversine distance as soon as a real pilot starts.

- Use road distance/time via a map/routing provider.
- Capture pickup window, vehicle type, payload, packaging, loading/unloading constraints, and lane.
- Support `buyer pickup`, `generator delivery`, and `platform-arranged quote` separately.
- Store quote source, date, validity, tax inclusions, and quote status.
- Show **estimated landed cost** only when the quote/assumption can be inspected.
- Add delivery risk flags: distant lane, partial load, inaccessible site, missing loading equipment.

Do not build a fleet-management system initially. Start with manual quote upload or a logistics-partner quote API.

---

### P1.3 Commercial data without fake market prices

Replace a generic target-price score with explicit price states:

```text
No price shared
Indicative seller ask
Buyer target (not an offer)
RFQ received
Formal offer
Agreed commercial term
Invoice / settlement evidence
```

Over time, build a **private material intelligence layer** from completed transactions:

- anonymized price range by material/spec/form/region/date;
- volume band;
- logistics contribution;
- actual acceptance/rejection rate.

Never expose counterparties’ confidential price data. Never call an inferred range a live market price until methodology, source, and coverage support that claim.

---

### P1.4 Rebuild environmental and circularity impact governance

Create an `Impact Methodology Registry`.

#### Every number should carry

- impact method ID and version;
- calculation date;
- functional unit (e.g., 1 tonne of specified PET scrap);
- system boundary;
- baseline route and circular route;
- factor source and factor date;
- transport-distance method;
- recovery yield basis;
- data-quality tier;
- uncertainty/range, where available;
- reviewer/approval status.

#### Three display levels

| Level | When allowed | UI label |
|---|---|---|
| Demo scenario | Seeded assumptions only | `Illustrative / Demo Data` |
| Estimate | Documented method + route + generic factors | `Estimated — methodology shown` |
| Evidence-backed | Supplier/process-specific evidence and reviewed method | `Evidence-backed estimate` |

For corporate reporting, keep **waste-treatment Scope 3 accounting** separate from any additional avoided-emissions scenario. GHG Protocol guidance is clear that avoided-emissions claims from recycling should be reported separately with the method, sources, boundary, time period, and assumptions disclosed.

---

### P1.5 AI quality, safety, and evaluation

#### Keep AI in the assistive lane

Use an LLM for:

- description-to-draft extraction;
- synonym/canonical-material mapping;
- missing-field questions;
- catalog-constrained potential use explanation;
- summary drafting;
- document OCR/extraction into an editable record.

Do **not** use an LLM for:

- chemical composition, contamination, dangerousness, food-contact suitability, or regulatory classification;
- score calculation, financial calculation, route distance, or impact calculation;
- autonomous publishing, approval, rejection, or legal/compliance sign-off.

#### AI upgrades

1. Strict JSON schema + controlled material ontology.
2. Retrieval from a versioned material-spec catalog and buyer requirements.
3. Human confirmation before any publish/recommendation action.
4. Store raw input, model/provider, prompt version, response, validation errors, and reviewer correction.
5. Build a gold evaluation set of anonymized, human-labeled listing descriptions.
6. Measure field-level extraction accuracy, missing-field detection, unsupported-material rate, and unsafe-claim rate.
7. Test adversarial inputs and document prompt injection.
8. Add a `Why was this extracted?` trace linked to source text snippets.

---

## 7. P2 upgrades — scale only after pilot evidence exists

### Category expansion sequence

Do not add categories because they are popular. Add them only after one successful material route has a maintained spec, buyer template, evidence workflow, compliance review, and completed transactions.

| Category | Pilot suitability | What must be added first |
|---|---|---|
| Pre-consumer PET manufacturing scrap | Strong candidate because current demo already models it | Form/colour/additive/spec evidence; non-food route restrictions; buyer sample acceptance. |
| Mild-steel fabrication scrap | Strong candidate for a simple industrial pilot | Grade/alloy and coating restrictions; weight/lot evidence; buyer acceptance terms. |
| Cotton cutting waste | Candidate after buyer interviews | Fibre composition, colour, finish, blend, contamination, and intended-route specs. |
| Corrugated paper/cardboard trim | Candidate, but may have lower differentiation in established commodity channels | Moisture, OCC/trim grade, bale format, contamination, pickup economics. |
| Food-processing by-products | **Defer** | Safety, shelf life, contamination, destination restrictions, applicable approvals, traceability and perishability operations. |
| Hazardous / regulated waste | **Do not launch as self-serve marketplace** | Specialist compliance workflow, authorised counterparties, manifests and legal review. |

### Advanced capabilities to add later

- inventory/ERP connector for recurring streams;
- IoT or weighbridge integration for quantity reconciliation;
- document/OCR quality extraction with human approval;
- notification and SLA engine;
- transport-partner integration;
- buyer reliability profile based on evidenced outcomes;
- regional material-flow analytics;
- multilingual field capture (Hindi/English first, based on user interviews);
- export-ready material information pack for customers with overseas supply-chain requirements.

**Do not add blockchain in the next phases.** A signed event/audit log plus verified documents and clear governance solves the immediate traceability problem more directly. Evaluate distributed-ledger technology only if multiple parties demonstrably need a shared trust infrastructure that ordinary controlled access and auditable records cannot provide.

---

## 8. UX plan: make the workflow feel industrial, not like a marketplace

### Generator experience

1. **Material readiness meter**
   - `Draft`, `Buyer-ready`, `Sample-ready`, `Compliance review needed`.
   - Shows exactly what is missing.
2. **Batch-first listing**
   - Recurring stream profile + individual available lot.
3. **Evidence drawer**
   - Photos, test reports, invoices, safety notes, document status.
4. **Match action queue**
   - Not just ranked cards: `Upload evidence`, `Answer buyer question`, `Send sample`, `Review offer`.
5. **Outcome screen**
   - Actual dispatched/accepted amount; variance explanation; repeat pickup option.

### Buyer experience

1. **Specification builder**
   - Accept/prohibit fields, not only a free-text quality grade.
2. **Supply board**
   - `Eligible now`, `Needs sample`, `Missing evidence`, `Rejected by rule`.
3. **Side-by-side comparison**
   - spec match, evidence level, volume, road route, price state, acceptance risk.
4. **Sample/inspection decision screen**
   - a controlled, documented step before a commercial commitment.
5. **Capacity calendar**
   - weekly intake slots prevent false “great matches” when the facility is full.

### Reviewer/admin experience

- document-review queue;
- material/spec template editor with versioning;
- policy exceptions;
- expired-document alerts;
- match-score audit view;
- impact methodology and factor registry;
- dispute/quality-rejection analytics.

---

## 9. Data architecture additions

### High-level relationships

```text
Company
 ├─ company_memberships
 ├─ verification_profile
 ├─ compliance_documents
 ├─ material_streams
 │   └─ material_lots
 │       ├─ lot_measurements
 │       ├─ quality_evidence
 │       ├─ sample_requests
 │       └─ matches
 └─ buyer_acceptance_specs

Match
 ├─ eligibility_checks
 ├─ score_breakdown
 ├─ RFQ / offers
 ├─ shipment
 ├─ receipt / quality acceptance event
 ├─ impact_calculation
 └─ audit_events
```

### Data governance additions

```text
company_memberships
roles_permissions
access_policies
consent_events
audit_events
document_reviews
data_retention_policies
security_incidents
```

### Why this matters

ISO 59040 specifically recognizes the need to exchange circular information while avoiding disclosure of confidential business information. That maps directly to a product requirement: **not every buyer should see every field before a verified/approved stage.**

---

## 10. Pilot strategy — narrow the operating problem first

### Recommended pilot hypothesis

> “For one controlled, non-hazardous industrial material route in Delhi NCR, CircularMatch can reduce the time needed to move from an unstructured by-product description to a buyer-reviewed, evidence-backed, sample/quote-ready opportunity.”

Do not make the first pilot goal “build a national marketplace.”

### Choose one initial material route through a discovery scorecard

Before choosing PET permanently, run 10–15 structured interviews with generators, recyclers/processors, logistics contacts, and one compliance adviser.

| Selection criterion | Weight | Question |
|---|---:|---|
| Supply consistency | 25% | Is the material generated predictably in usable lots? |
| Buyer depth | 20% | Are at least several credible local buyers willing to evaluate it? |
| Specification clarity | 20% | Can both sides agree on a practical acceptance template? |
| Compliance simplicity | 20% | Can the first route be launched with clear, manageable obligations? |
| Logistics/economic viability | 15% | Can lot sizes and pickup lanes plausibly work? |

This is a **discovery scorecard**, not an algorithmic product score.

### Pilot cohort target

- 3–5 generators;
- 5–10 buyers/processors;
- 1 material category and 1–2 approved downstream routes;
- 10–20 curated listing lots;
- one named human reviewer for quality/compliance evidence;
- manual logistics/quote handling before automation.

### Pilot success measures to collect, not invent

| Metric | Why it matters |
|---|---|
| Listing completeness rate | Measures whether the material passport is usable. |
| Eligible-match rate | Indicates taxonomy/spec usefulness. |
| Match → sample-request rate | Better signal than page views. |
| Sample acceptance rate | Tests spec quality. |
| Quote-to-agreement rate | Tests commercial fit. |
| Accepted kg / listed kg | Measures real material movement. |
| Quality rejection / dispute reason | Feeds the next spec-template revision. |
| Time from listing to accepted pickup | Measures operational value. |
| Evidence coverage at completion | Measures trust/traceability maturity. |
| Factor/method coverage for impact estimates | Prevents overclaiming. |

---

## 11. Sequenced roadmap

### Phase 0 — Discovery and operating design (2–3 weeks)

**Goal:** validate one material route before building more screens.

- Interview pilot companies and document their exact acceptance/rejection reasons.
- Collect existing purchase specs, quality checklists, sample flows, dispatch documents, and delivery proof formats.
- Map each step from generation to processor receipt.
- Create a category regulatory triage with an environmental/compliance adviser.
- Build Material Passport v0 and Buyer Acceptance Template v0.
- Select pilot material route with the discovery scorecard.

**Exit criterion:** at least two buyers agree that the proposed template is sufficient to decide whether to request a sample.

### Phase 1 — Trusted pilot core (3–5 weeks)

**Goal:** replace demo listings with evidence-aware pilot records.

- Production Supabase Auth, companies, memberships, RLS, and audit events.
- Material stream + lot + evidence tables.
- Buyer acceptance templates.
- Eligibility gates plus ranking.
- Company/document review statuses.
- Role-based location and document visibility.
- Manual sample-request workflow.

**Exit criterion:** one curator can run a listing from intake to “eligible pending sample” without using a spreadsheet.

### Phase 2 — Commercial and logistics workflow (3–5 weeks)

**Goal:** turn a match into a verifiable material handover.

- RFQ/offers and counteroffers.
- Pickup appointments and manual/partner logistics quote records.
- Road routing, not only straight-line distance.
- Weighbridge/proof-of-delivery/acceptance records.
- Variance and dispute reason capture.

**Exit criterion:** one pilot transaction can be represented end-to-end, including actual accepted quantity and evidence.

### Phase 3 — Measurement and learning loop (2–4 weeks)

**Goal:** ensure score/impact claims improve from data rather than opinion.

- Match outcome feedback loop.
- Rule versioning, reviewer overrides, and reason analytics.
- Impact methodology registry with baseline/circular-route boundaries.
- AI gold dataset and field-level evaluation harness.
- Private pilot analytics dashboard.

**Exit criterion:** the team can explain which score components correlated with actual buyer sample acceptance, without claiming causation prematurely.

### Phase 4 — Category and network expansion (after evidence)

**Goal:** add a second material only when the operating model is stable.

- Add next category with its own spec template, buyer templates, evidence fields, and impact methodology.
- Add notifications, basic ERP import, and logistics integrations only where pilot pain justifies them.
- Create regional onboarding playbooks for industrial clusters.

**Exit criterion:** the first category has repeat transactions, manageable quality-rejection reasons, and a clear unit economics hypothesis.

---

## 12. What not to build yet

| Avoid for now | Why |
|---|---|
| Blockchain | Does not solve missing specifications, documents, or human verification. |
| Live market-price prediction | Needs verified historical transaction data first. |
| Automatic chemical/quality assessment from photo/text | Technically and ethically unsafe without laboratory/process evidence. |
| Hazardous-waste self-serve marketplace | Requires specialist legal/compliance workflows and authorized chain-of-custody handling. |
| Food/by-product matching | Requires safety, freshness, destination, and regulatory controls beyond the MVP. |
| National multi-category launch | Destroys liquidity and makes quality/compliance templates shallow. |
| “CO2 saved” marketing claims | Need a governed method, source factors, boundaries, and evidence levels. |
| Fully automated deal closing | Industrial buyers need samples, inspection, commercial negotiation, and acceptance control. |

---

## 13. Immediate backlog for the existing codebase

### First 10 engineering tickets

1. Add `company_memberships`, `material_lots`, `quality_evidence`, `buyer_acceptance_specs`, and audit tables to the Supabase schema.
2. Replace the quality boolean with an evidence model: `self_declared`, `document_uploaded`, `reviewed`, `test_reviewed`, `expired`, `rejected`.
3. Add an Evidence & Spec section to the listing wizard.
4. Add a buyer acceptance-template builder for PET manufacturing scrap.
5. Convert match logic to hard eligibility gates + a score among eligible candidates.
6. Make exact road distance/logistics a future adapter; retain Haversine only with the explicit Demo label.
7. Add `sample_request` and `sample_acceptance` status flow.
8. Add a private document store and role-based access policy.
9. Introduce `impact_methodologies`, `emission_factor_sets`, and source/boundary/version fields.
10. Build a match-outcome feedback screen so the scoring rules can be calibrated from real outcomes later.

### First 5 product/design tickets

1. Add a Material Readiness score based on missing evidence, not a generic “quality score.”
2. Add an `Eligible / Needs sample / Missing evidence / Ineligible` status before showing a percentage match.
3. Add a buyer comparison table for lots with spec/evidence/route/commercial states.
4. Add a transaction timeline with named evidence at every handoff.
5. Add a Method & Assumptions drawer for every impact result.

---

## 14. Source list

- [UNIDO — Eco-industrial parks, resource efficiency and industrial symbiosis](https://www.unido.org/stories/eco-industrial-parks-resource-efficiency-and-industrial-symbiosis)
- [ISO 59020:2024 — Measuring and assessing circularity performance](https://www.iso.org/standard/80650.html)
- [ISO 59040:2025 — Product circularity data sheet](https://www.iso.org/standard/82339.html)
- [Association of Plastic Recyclers — PET Bale Specification](https://plasticsrecycling.org/wp-content/uploads/2024/09/APR-BaleSpec-PETBottle-WithThermoforms.pdf)
- [CPCB — Plastic EPR guidance / SOP](https://cpcb.nic.in/uploads/plasticwaste/SOP_PWM_24062024.pdf)
- [CPCB — Plastic EPR registration](https://cpcb.nic.in/registration-for-brand-owner/)
- [GHG Protocol — Scope 3 Category 5 technical guidance](https://ghgprotocol.org/sites/default/files/standards_supporting/Ch5_GHGP_Tech.pdf)
- [ISO 14040:2006 — LCA principles and framework](https://www.iso.org/standard/37456.html)
- [European Commission — Ecodesign for Sustainable Products Regulation](https://environment.ec.europa.eu/news/sustainable-products-be-norm-consumers-new-regulation-2024-07-19_en)
- [PIB — DPDP Rules, 2025](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190655)

---

## 15. Final recommendation

For the next build cycle, do **not** add more dashboards or more AI features first.

Build this sequence instead:

> **Material Passport → Evidence → Buyer Acceptance Template → Eligibility Gates → Sample/RFQ → Receipt Evidence → Governed Impact.**

That sequence protects the core differentiator of CircularMatch: it does not merely help a buyer find waste. It helps both sides determine whether a waste stream can credibly become a usable, traceable secondary raw material.
