# CircularMatch

**AI-Powered Industrial Waste-to-Raw-Material Matching Platform**

> **Core differentiator:** Traditional waste marketplaces help people discover listings. CircularMatch adds an intelligence layer that structures waste descriptions, suggests plausible circular pathways, deterministically ranks compatible industrial buyers, and explains the result.

## What is implemented

- A polished React + TypeScript sustainability dashboard for a fictional Delhi NCR **Demo Dataset**.
- Generator workflow: natural-language waste description → reviewable structured draft → publish → rank compatible buyers → explainable match detail → demo contact intent.
- Buyer workflow: create a material requirement → rank compatible active supply.
- Supported v1 catalog: PET industrial scrap, cotton textile cutting waste, corrugated cardboard/paper trim, and mild-steel fabrication scrap.
- Deterministic backend scoring with configurable weights:
  - material (35%), quality (20%), quantity (15%), distance/logistics (15%), price (10%), environmental benefit (5%).
- **Trusted-pilot workflow:** a Material Passport with dispatchable lots, supplier claims, evidence records, buyer-readiness status, audit activity, and controlled evidence states.
- **Buyer acceptance templates:** allowed forms/colours, prohibited conditions, evidence threshold, sample requirement, capacity, and route notes.
- **Eligibility gates before ranking:** `Eligible`, `Needs sample`, `Missing evidence`, or `Blocked`, with visible reasons and next action.
- **Demo operational timeline:** sample request/acceptance, illustrative offer/acceptance, planned pickup, receipt record, and final accepted quantity for workflow testing.
- Transparent `Why this match?` reasons and score breakdowns.
- Illustrative economic calculator plus methodology/boundary metadata for environmental-impact scenarios.
- Sample Leaflet map with Delhi NCR demo points and match routes.
- Admin score-weight configuration screen plus evidence-review endpoint.
- Supabase PostgreSQL/Auth production schema migrations and RLS policy baseline.
- Optional Gemini structured-output adapter; a **clearly labelled rule-based demo fallback** keeps the prototype reliable with no API key.

## Important demo-data policy

Every company, location, price, route, economic output, and CO2e output in this MVP is clearly labelled **Illustrative / Demo Data**.

- No composition, contamination, quality, or certification is inferred from text.
- Supplier-described quality is visibly marked **Not verified** unless a verified record exists.
- Potential uses are labelled **Potential use**, not guaranteed suitability.
- Prices are not quotes or current market rates.
- Environmental outputs are not a measured lifecycle assessment.

Read the full product/architecture plan at [`docs/01-product-blueprint.md`](docs/01-product-blueprint.md).

## Run locally

### 1. Start the API

```bash
cd apps/api
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 2. Start the web app (second terminal)

```bash
cd apps/web
npm install
npm run dev
```

Open the URL printed by Vite. The frontend proxies `/api` to the FastAPI service in local development.

The application defaults to the **Demo Generator** persona and requires no credentials. Use the top-right persona selector to switch between Generator, Buyer, and Admin demo roles.

## Test and build

```bash
# API unit + end-to-end flow tests
cd apps/api
pytest -q

# Type check + production frontend build
cd ../web
npm run build
```

## Fast 2–3 minute demo route

1. Open **List my waste** as the Generator demo.
2. Keep the prefilled PET sample: `We generate around 3 tonnes of PET manufacturing scrap every week in Noida...`
3. Click **Analyze & structure**. Point out the review step and **Not verified** quality label.
4. Publish the listing, then click **Find best buyers**.
5. Open **ReLoop Polymers** (top match). Show the score components and `Why this match?`.
6. Show the illustrative disposal-vs-circular-reuse calculator, impact assumptions, and route map.
7. Conclude: _“Instead of treating industrial waste as a disposal problem, CircularMatch treats it as a discoverable raw-material resource.”_

A narrated version is available in [`docs/demo-script.md`](docs/demo-script.md). The trusted-pilot workflow guide is in [`docs/04-trusted-pilot-core.md`](docs/04-trusted-pilot-core.md).

## Production integration path

The demo repository is intentional: it gives a reliable no-secret hackathon experience. For a production-backed setup:

1. Create a Supabase project.
2. Apply [`supabase/migrations/0001_initial_schema.sql`](supabase/migrations/0001_initial_schema.sql) and [`supabase/migrations/0002_trusted_pilot_core.sql`](supabase/migrations/0002_trusted_pilot_core.sql), then [`supabase/seed.sql`](supabase/seed.sql) for the controlled material catalog and illustrative configuration.
3. Create Supabase users/profiles and connect frontend Supabase Auth.
4. Add these server-side values to `apps/api/.env`:

```text
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
FRONTEND_ORIGIN=
```

5. Replace the demo repository with a Supabase repository adapter, keeping the same FastAPI service contracts.
6. Replace illustrative pricing, logistics and impact assumptions with reviewed domain data before describing any result as real.

## Project layout

```text
apps/api/              FastAPI routers, deterministic services, seed repository, tests
apps/web/              React + TypeScript + Tailwind + Recharts + Leaflet UI
supabase/migrations/   Production PostgreSQL schema and RLS baseline
docs/                  Product blueprint and demo script
```

## Scope intentionally deferred

This is a hackathon-ready MVP, not a full industrial procurement system. Payments, legal contracts, live logistics, document verification, live GPS, complex material chemistry, and real LCA are intentionally out of scope until real operating data and partner validation are available.
