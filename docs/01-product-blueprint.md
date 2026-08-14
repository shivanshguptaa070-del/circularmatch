# CircularMatch — Hackathon MVP Product Blueprint

> **Purpose:** Build a polished, end-to-end **industrial waste-to-secondary-raw-material matching** demo, not a generic listing marketplace.
>
> **MVP data policy:** Every company, location, price, impact factor, and transaction in demo mode is **Illustrative / Demo Data**. Calculated money and CO2e values are estimates based on visible assumptions—not market quotes, measurements, certifications, or lifecycle assessments.

---

## 1. Product boundary and MVP decisions

### The intelligence-layer promise
CircularMatch turns a generator's unstructured waste description into a reviewable material record, evaluates its likely circular pathways, deterministically ranks compatible industrial buyers, and explains the practical/economic/environmental rationale for each recommendation.

It does **not** claim to test chemical composition, certify quality, guarantee buyer acceptance, quote real freight, or calculate verified environmental outcomes.

### Supported material scope (v1)
To keep the prototype reliable, launch with four controlled material families:

1. **Plastic:** PET industrial scrap
2. **Textile:** cotton textile cutting waste
3. **Paper/cardboard:** corrugated cardboard / paper trim
4. **Metal:** mild-steel fabrication scrap

Food-processing by-products are intentionally out of the first working flow because safety, contamination, and regulatory requirements materially change suitability. The catalog/data model will allow it to be added later after domain validation.

### Deliberate implementation choices

| Area | MVP decision | Why |
|---|---|---|
| Frontend | React + TypeScript + Vite, Tailwind CSS, shadcn-style components, Recharts, Leaflet | Modern, approachable, fast to demo |
| Backend | Python + FastAPI + Pydantic | Clear API contracts and testable deterministic logic |
| Production data/auth | Supabase PostgreSQL + Supabase Auth | Meets the requested production stack with managed auth/database |
| Demo reliability | `DEMO_MODE` repository and seeded fictional Delhi NCR data | Lets the complete demo work before credentials or deployment exist |
| AI | Gemini adapter when configured; deterministic extraction fallback in demo mode | Reliable hackathon flow without pretending an API response occurred |
| Maps | Demo coordinates and Leaflet | No production GPS/geocoding required |
| Matching | Normal backend code, not an LLM | Transparent, repeatable, testable decisions |

### Roles

- **Waste generator:** creates/reviews/publishes listings, views ranked buyer matches, contacts/records a match.
- **Buyer:** creates material requirements, sees compatible listings and receives match opportunities.
- **Admin:** views demo dashboard, manages material catalog/demo records, and reviews reports. Full CRUD administration beyond core demo is deferred.

---

## 2. System architecture

```text
┌──────────────────────────────────────────────────────────────────────┐
│ React + TypeScript web app                                            │
│ Dashboard · Listing wizard · Buyer requirement · Match detail · Map  │
│ Leaflet · Recharts · responsive, desktop-first UI                    │
└───────────────────────────┬──────────────────────────────────────────┘
                            │ HTTPS / JSON + bearer token
┌───────────────────────────▼──────────────────────────────────────────┐
│ FastAPI application                                                   │
│ routers → Pydantic schemas → services → repository                   │
│                                                                      │
│  • listing normalization       • deterministic matching engine       │
│  • AI extraction adapter       • explanation builder                 │
│  • economic calculator        • illustrative impact calculator       │
│  • static demo geocoder       • role checks                          │
└───────────┬───────────────────────────────────────┬──────────────────┘
            │                                       │
            │ production                            │ optional
┌───────────▼─────────────────┐       ┌─────────────▼─────────────────┐
│ Supabase                     │       │ Gemini API                    │
│ Auth + PostgreSQL            │       │ structured JSON extraction    │
│ SQL migrations + RLS         │       │ only when API key is present  │
└─────────────────────────────┘       └───────────────────────────────┘
            │
            │ local demo mode (same API contracts)
┌───────────▼─────────────────┐
│ Seeded demo repository       │
│ Fictional Delhi NCR records  │
└─────────────────────────────┘
```

### Data flow for the core demo

1. Generator writes a natural-language description.
2. `POST /ai/extract-waste` returns **draft** structured data and a disclosure identifying Gemini or the deterministic demo fallback.
3. Generator edits/reviews every field, including quality status, then publishes a listing.
4. Backend normalizes quantity to `kg/week`, maps the material to the controlled catalog, and stores it.
5. `POST /listings/{id}/matches/recompute` compares the listing against active buyer requirements.
6. The deterministic engine persists score components, calculation assumptions, and explanation inputs.
7. The UI renders ranked buyers, `Why this match?`, economic value, impact assumptions, and a map route.
8. Contact/accept is a **demo transaction status change**, not a real order, payment, or contract.

### Security boundary

- Browser uses the Supabase anon key only for Supabase Auth.
- Browser sends its access token to FastAPI as `Authorization: Bearer …`.
- FastAPI validates tokens and performs business logic.
- The Supabase service-role key, Gemini key, and any database secret remain server-side only.
- In demo mode, a clearly labeled demo session is used; it is not represented as secure production auth.

---

## 3. Database schema

Supabase Auth owns the canonical identity row in `auth.users`. The required application-facing `public.users` table is a profile table keyed to that identity.

### Entity relationship overview

```text
auth.users ──1:1── public.users ──1:n── companies
                                      │
                         ┌────────────┼───────────────────────┐
                         │            │                       │
                    waste_listings  buyer_requirements   listing_reports
                         │            │
                         └─────── matches ───────┐
                                  │               │
                             transactions  impact_calculations

materials ──1:n── material_uses
materials ──1:n── waste_listings
materials ──1:n── buyer_requirements
match_scoring_configs ──1:n── matches
```

### Core tables

| Table | Important fields | Notes |
|---|---|---|
| `users` | `id UUID PK → auth.users`, `full_name`, `role`, `phone`, `created_at` | Roles: `generator`, `buyer`, `admin`. |
| `companies` | `id`, `owner_user_id`, `name`, `company_type`, `city`, `address_label`, `latitude`, `longitude`, `verification_status`, `is_demo` | One owned company per demo user; later extensible to memberships. Coordinates are demo/sample locations in MVP. |
| `materials` | `id`, `canonical_name`, `category`, `aliases JSONB`, `quality_scale JSONB`, `supported`, `notes` | Controlled catalog prevents invented/unapproved material mappings. |
| `material_uses` | `id`, `material_id`, `title`, `description`, `pathway_type`, `recovery_factor`, `virgin_displacement_factor`, `demo_assumptions JSONB` | Every UI use is labeled **Potential use**. Factors are illustrative configuration, not measured data. |
| `waste_listings` | `id`, `company_id`, `material_id`, `raw_description`, `source`, `category`, `quantity_kg`, `frequency`, `normalized_kg_per_week`, `quality_grade`, `quality_verified`, `quality_notes`, `availability`, `city`, `latitude`, `longitude`, `asking_price_per_kg`, `disposal_cost_per_kg`, `status`, `is_demo`, timestamps | `quality_verified=false` must visibly render as **Not verified** / supplier-declared. |
| `listing_ai_analyses` | `id`, `listing_id nullable`, `raw_input`, `provider`, `structured_output JSONB`, `validation_notes JSONB`, `status`, `created_at` | Saves the draft/provenance. No LLM result becomes a claim without human review. |
| `buyer_requirements` | `id`, `company_id`, `material_id`, `minimum_quantity_kg_week`, `maximum_quantity_kg_week`, `minimum_quality_grade`, `maximum_distance_km`, `target_price_per_kg`, `city`, `latitude`, `longitude`, `status`, `is_demo` | One required material per requirement simplifies matching. |
| `match_scoring_configs` | `id`, `name`, `weights JSONB`, `active`, `version`, `is_demo` | Default weights are versioned/configurable, not claimed optimal. |
| `matches` | `id`, `listing_id`, `buyer_requirement_id`, `scoring_config_id`, `total_score`, six component scores, `distance_km`, `estimated_logistics_per_kg`, `delivered_cost_per_kg`, `status`, `explanation_inputs JSONB`, `created_at` | Stores reproducible decision inputs and states: `suggested`, `contacted`, `accepted`, `rejected`. |
| `transactions` | `id`, `match_id`, `initiated_by`, `agreed_quantity_kg`, `agreed_price_per_kg`, `status`, `note`, timestamps | Demo interaction tracker; explicitly not a payment/order system. |
| `impact_calculations` | `id`, `match_id`, `material_use_id`, `waste_diverted_kg`, `secondary_material_kg`, `virgin_material_displaced_kg`, `transport_co2e_kg`, `avoided_co2e_kg`, `net_co2e_benefit_kg`, `assumptions JSONB`, `calculation_version`, `is_illustrative` | Always `is_illustrative=true` in MVP. |
| `listing_reports` | `id`, `listing_id`, `reported_by`, `reason`, `status`, timestamps | Minimal admin/reporting support. |

### Validation and indexes

- `normalized_kg_per_week > 0`, quantities and distances are non-negative.
- `minimum_quantity_kg_week <= maximum_quantity_kg_week`.
- `quality_verified` is independent from a supplier-selected grade.
- Unique index on `(listing_id, buyer_requirement_id, scoring_config_id)` for current suggestions.
- Index active listings/requirements by `material_id`, `status`, and `is_demo`.
- RLS: users can access their own company/listings/requirements; admins can access all. The backend still enforces role checks.

---

## 4. User flows

### A. Generator: natural-language listing to match

1. Sign in using a labeled **Demo Generator** account (or Supabase account in production).
2. Select **List My Waste**.
3. Enter: “We generate around 3 tonnes of PET manufacturing scrap every week in Noida. The material is clean industrial-grade scrap and is available every Monday.”
4. Click **Analyze description**.
5. See a review card containing material, category, quantity, frequency, normalized quantity, location, availability, quality claim, and **Not verified** status unless proof was supplied/recorded.
6. Edit any extracted value; select a controlled material when extraction is uncertain.
7. Enter optional illustrative asking price and current disposal cost; publish.
8. Select **Find Best Buyers**.
9. View ranked buyer cards with total score, score drivers, flags, economic estimate, impact estimate, and a top-match highlight.
10. Open match detail → view explanation, transparent formulas/assumptions, map route, then **Contact buyer** (demo status update).

### B. Buyer: requirement to compatible supply

1. Sign in as **Demo Buyer**.
2. Create a requirement for a controlled material.
3. Set weekly quantity range, minimum stated quality, maximum distance, and optional target price.
4. Publish requirement.
5. View compatible listings ranked by the same engine, with any quality-verification flags prominent.
6. Contact a generator / mark interest (demo transaction flow).

### C. Admin

1. Sign in as **Demo Admin**.
2. View dashboard health metrics marked **Demo Dataset**.
3. View material catalog, scoring configuration, listings, matches, and reports.
4. No sensitive real-company or production-data claim is made.

### D. 2–3 minute hackathon story

- Start at the KPI dashboard → **List My Waste**.
- Analyze the PET sample description → review and publish.
- Open **Find Best Buyers** → show top ranked buyer and the transparent score.
- Open top match → show `Why this match?`, money comparison, impact assumptions, and mapped Noida-to-buyer route.
- Finish with: “Instead of treating industrial waste as a disposal problem, CircularMatch treats it as a discoverable raw-material resource.”

---

## 5. Deterministic matching algorithm

### Eligibility gates

A buyer requirement is not ranked as a standard compatible match if any condition fails:

1. Requirement is inactive.
2. Material is neither an exact match nor an explicitly catalog-approved compatible material.
3. Distance exceeds the buyer’s configured maximum distance.
4. Quantity is zero/invalid.
5. Listing’s stated grade is below the buyer’s minimum grade.

If a grade is supplier-declared but not verified, it can be ranked **with a `Verification required` flag** only when its stated grade meets the buyer minimum. It is never shown as certified.

### Default configurable score weights

| Component | Default weight | Deterministic input |
|---|---:|---|
| Material compatibility | 35% | Exact canonical material / approved catalog mapping |
| Quality compatibility | 20% | Stated grade, minimum requirement, verification flag |
| Quantity compatibility | 15% | Normalized weekly quantity versus buyer range |
| Distance & logistics | 15% | Haversine distance and buyer radius |
| Price & economic value | 10% | Illustrative delivered cost versus buyer target, where provided |
| Environmental benefit | 5% | Illustrative recovery pathway/transport calculation |
| **Total** | **100%** | Weighted sum, rounded for display |

These weights are **MVP decision rules**. They are configurable by admin and must not be described as scientifically optimal.

### Component formulas (human-readable)

- **Material:** 100 for exact material; a lower catalog-defined value for explicitly compatible grade/pathway; 0 for incompatible.
- **Quality:** 100 for verified grade meeting/exceeding the requirement; 75 for supplier-declared/unverified grade meeting it; 0 below the minimum. The UI exposes the verification state.
- **Quantity:** 100 inside the requested weekly range. It declines predictably when too low/high; excessive volume can be partially accepted only if the buyer setting allows it.
- **Distance:** demo Haversine distance. 100 within the nearby threshold; linearly declines to the buyer’s allowed-radius floor. Beyond the radius is gated out.
- **Price:** compares illustrative delivered cost (`asking price + illustrative logistics cost`) with the buyer’s target. If either price is absent, display `Price not provided` and use a neutral score with an explanation—never imply a quote.
- **Environmental:** normalizes the illustrative net-benefit calculation for the feasible material pathway and includes freight burden. It is a ranking signal, not a validated LCA.

```text
match_score =
  material_score × 0.35 + quality_score × 0.20 + quantity_score × 0.15
  + distance_score × 0.15 + price_score × 0.10 + environment_score × 0.05
```

Every persisted match stores the component scores, config version, distance, cost inputs, and assumptions so its explanation can be reproduced.

### Explainability template

The backend builds explanations from score facts, rather than letting an LLM invent reasons:

- It accepts **PET industrial scrap** (exact catalog match).
- **3,000 kg/week** fits its **2,000–5,000 kg/week** requirement.
- Stated industrial grade meets the requested minimum; **verification is still required**.
- The demo distance is **48 km**, within its **150 km** limit.
- Illustrative delivered cost is compared with the buyer’s target only when both inputs exist.
- The potential pathway is **recycled PET**; all material displacement and CO2e outputs are illustrative assumptions.

---

## 6. AI components and guardrails

### What the AI may do

1. Extract fields from natural-language listing text.
2. Suggest a material/category from the controlled catalog.
3. Return catalog-backed **Potential use** suggestions.
4. Produce a short natural-language listing summary.

### What the AI may not do

- Claim chemical composition, contamination level, certification, or safety suitability.
- Compute match scores, distances, currency values, or impact results.
- Invent materials, prices, factories, qualifications, or environmental factors.
- Publish a listing without user review.

### AI response contract

Gemini is requested to return strict JSON with:

```text
canonical_material_candidate, category_candidate, quantity_value, quantity_unit,
frequency, quality_claim, quality_verification_status, location_text,
availability_text, missing_fields, confidence_notes
```

FastAPI validates this against the material catalog and normalizes units/frequency itself. Unknown quality becomes `Not verified`. Uses are selected from the approved `material_uses` catalog after material confirmation.

### Demo fallback

Without `GEMINI_API_KEY`, a compact deterministic parser recognizes the four demo materials, common quantity phrases (e.g., tonnes/week), Delhi NCR cities, and availability words. The UI says **“Demo extraction — rule-based fallback”**, not “AI verified.”

---

## 7. API surface (v1)

All API responses include a `data_mode: "demo" | "production"` label where relevant.

### Session and catalog

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | API health and mode |
| `GET` | `/me` | current role/company |
| `POST` | `/demo/login` | select clearly labeled demo persona |
| `GET` | `/materials` | controlled material catalog |
| `GET` | `/materials/{id}/uses` | catalog-backed potential uses |

### Generator and buyer core flow

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/ai/extract-waste` | draft structured extraction, no publish |
| `POST` | `/listings` | create reviewed waste listing |
| `GET` | `/listings` | filter/list current listings |
| `GET` | `/listings/{id}` | listing detail |
| `PATCH` | `/listings/{id}` | edit listing |
| `POST` | `/buyer-requirements` | create buyer material requirement |
| `GET` | `/buyer-requirements` | view/filter requirements |
| `POST` | `/listings/{id}/matches/recompute` | deterministic buyer ranking |
| `GET` | `/listings/{id}/matches` | stored ranked matches |
| `GET` | `/matches/{id}` | score/explanation/economics/impact/map detail |
| `POST` | `/matches/{id}/contact` | mark a demo contact/transaction intent |

### Dashboard, map, admin

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/dashboard/summary` | KPI cards and chart series |
| `GET` | `/map/points` | demo companies/listings/requirements/routes |
| `GET` | `/admin/scoring-config` | current configurable weights |
| `PATCH` | `/admin/scoring-config` | admin-only demo weight update |
| `GET` | `/admin/reports` | report queue |

---

## 8. Folder structure

```text
circularmatch/
├── README.md
├── docs/
│   ├── 01-product-blueprint.md
│   ├── api-contract.md
│   └── demo-script.md
├── apps/
│   ├── api/
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   ├── api/                 # FastAPI routers
│   │   │   ├── core/                # config, auth, constants
│   │   │   ├── schemas/             # Pydantic contracts
│   │   │   ├── services/            # extraction, matching, calculations
│   │   │   ├── repositories/        # demo and Supabase adapters
│   │   │   └── seed/                # fictional Delhi NCR data
│   │   ├── tests/
│   │   ├── requirements.txt
│   │   └── .env.example
│   └── web/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── lib/                 # API client, formatting, constants
│       │   ├── hooks/
│       │   ├── types/
│       │   └── styles/
│       ├── public/
│       ├── package.json
│       └── .env.example
├── supabase/
│   ├── migrations/0001_initial_schema.sql
│   └── seed.sql
└── scripts/
    └── validate_demo.sh
```

No microservices, queues, blockchain, custom ML training, or Kubernetes are needed.

---

## 9. Implementation plan and validation gates

### Phase 1 — Foundation: database, auth, and seed data

- Scaffold FastAPI + React apps.
- Add Supabase migration/schema and a credentials-free seeded demo repository.
- Implement clearly labeled demo personas (generator, buyer, admin), API health, catalog endpoints.
- **Test gate:** health endpoint, persona selection, catalog retrieval, schema syntax/review.

### Phase 2 — Waste listing workflow

- Build listing wizard with natural-language input, review/edit screen, validation, and publish action.
- Persist normalized weekly quantity and quality verification state.
- **Test gate:** PET sample turns into a reviewable listing; `Not verified` remains visible.

### Phase 3 — Buyer requirements

- Build buyer requirement form and validation.
- Seed one strong PET recycler plus lower-ranked compatible demo buyers.
- **Test gate:** buyer can create/edit a requirement and it appears in API data.

### Phase 4 — Deterministic matching engine

- Implement Haversine, eligibility gates, component scoring, persisted breakdown, configurable weights.
- Add unit tests for exact material, quality flag, quantity boundary, radius rejection, and score ordering.
- **Test gate:** a Noida PET listing yields a predictable ranked result and explanations trace directly to inputs.

### Phase 5 — AI extraction adapter

- Add Gemini structured-output adapter behind environment configuration.
- Add validated deterministic demo fallback and provider disclosure.
- **Test gate:** sample PET sentence parses correctly without an API key; malformed output fails safely into manual editing.

### Phase 6 — Match detail and explainability

- Build top-match cards, visual score breakdown, `Why this match?`, data-quality warnings, and contact-intent action.
- **Test gate:** no reason text exists without a concrete input/fact.

### Phase 7 — Economic and impact calculator

- Implement visible, versioned illustrative assumptions and formulas.
- **Test gate:** `net recovered = sale revenue − transport`; `improvement vs disposal = net recovered + avoided disposal`; impact totals reconcile from disclosed inputs.

### Phase 8 — Dashboard

- Add KPI cards and chart views: category mix, diversion over time, match success, illustrative value, illustrative impact.
- **Test gate:** chart totals reconcile with seeded records and show `Demo Dataset` label.

### Phase 9 — Map

- Add Delhi NCR map with demo pins and selected potential route.
- **Test gate:** top match route displays generator → buyer, distance matches the backend’s Haversine value within rounding.

### Phase 10 — Polish and demo reliability

- Responsive layout, empty/error states, loading states, keyboard/form polish, demo reset button, README, 2–3 minute script.
- **Test gate:** fresh local startup works in demo mode, complete primary demo flow works without real credentials, and production setup steps are documented.

---

## 10. Required configuration before real deployment

The functional local demo will not require secrets. To turn on production integrations later, configure:

```text
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
FRONTEND_ORIGIN=
```

Production onboarding must also apply the SQL migration, set RLS policies, create real Supabase users, and replace the demo-only pricing/impact assumptions with reviewed domain data.
