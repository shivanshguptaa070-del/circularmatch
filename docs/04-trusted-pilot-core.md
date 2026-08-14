# CircularMatch — Trusted Pilot Core: What Is Now Implemented

> **Mode:** Functional `Demo Dataset` workflow. All companies, evidence, offers, lots, and receipts are fictional/demo records. None of the screens certify material quality, legal compliance, commercial agreement, or environmental performance.

## 1. Material Passport

Every listing can now have one or more **dispatchable material lots**.

A lot records:

- lot code and available quantity;
- material form and source status;
- colour, packaging, storage condition;
- representative-sample availability;
- compliance triage status;
- supplier-declared specification;
- typed evidence records.

### Evidence states

| Status | Meaning |
|---|---|
| `Self declared` | Supplier statement; not independently verified. |
| `Uploaded` | Record/document placeholder exists; not reviewed. |
| `Reviewed` | Demo reviewer status; not a laboratory result. |
| `Test reviewed` | Demo reviewer status for a test-report record; production requires a real method, issuer, and document review. |
| `Rejected` / `Expired` | Cannot satisfy a buyer evidence gate. |

The Material Passport page intentionally says it is **not a laboratory certificate or legal classification**.

## 2. Buyer Acceptance Templates

Each buyer requirement now has a configurable acceptance profile:

- allowed material forms;
- allowed colours;
- prohibited material/conditions;
- minimum evidence state;
- sample/inspection requirement;
- published intake capacity;
- permitted route note and internal review note.

This prevents a vague “industrial grade” field from being treated as a universal quality specification.

## 3. Eligibility Gates + Explainable Ranking

The engine still calculates a transparent score, but every material-compatible route is first labelled as:

- **Eligible** — can move to an RFQ/offer screening stage;
- **Needs sample** — sample/inspection is required;
- **Missing evidence** — buyer evidence requirement has not been met;
- **Blocked** — an explicit form, colour, quality, or distance rule fails.

The Match Detail screen shows every gate, the evidence/data-completeness level, and the concrete next action.

## 4. Operational Demo Timeline

The match workspace can now create clearly labelled demo records for:

```text
Sample request → Sample accepted
→ Illustrative offer → Demo offer accepted
→ Pickup plan → Receipt record
```

The receipt action can record demo dispatched/received quantities and updates the dashboard’s accepted demo quantity. It is not a live fleet dispatch, invoice, payment, or legally sufficient chain-of-custody record.

## 5. Impact Method Metadata

Impact output now includes:

- methodology ID and name;
- functional unit;
- system boundary;
- factor source label;
- data-quality tier;
- explicit claim boundary.

The current seed method remains **Illustrative / Demo Data**. It is not a measured LCA or verified Scope 3 inventory.

## 6. New Main Routes

| Route | Purpose |
|---|---|
| `/listings/:listingId/passport` | View/add lots, evidence records, readiness, and audit activity. |
| `/buyer-requirements/:requirementId/acceptance-spec` | Configure buyer screening criteria. |
| `/listings/:listingId/matches` | Run eligibility gates + transparent ranking. |
| `/matches/:matchId` | Review gates, evidence, sample/offer/pickup/receipt timeline, economics, and impact method. |

## 7. Demo Sequence

1. Log in as **Generator demo**.
2. Open **My listings** → choose the PET listing → **Material Passport**.
3. Review the PET lot and evidence state.
4. Open **Find buyers** and run matching.
5. Open ReLoop Polymers and see `Needs sample` plus its gate-by-gate reasons.
6. Use **Request sample / inspection** → **Record demo sample acceptance**.
7. Refresh/recompute matches to see the updated eligibility state.
8. Create an illustrative offer, plan a pickup, and record a demo receipt.
9. Switch to **Buyer demo** → Buyer requirements → **Acceptance rules** to change the buyer template and observe how match eligibility changes.

## 8. Production Work Still Required

The functional demo now has the domain model and workflow, but production deployment still requires:

- real Supabase Auth / PostgreSQL repository implementation;
- private object storage for actual documents;
- real company/compliance verification procedures;
- reviewed local material specifications;
- legal/regulatory confirmation for each material route;
- real mapping/logistics quotes;
- source-governed factor database and methodology approval;
- real transaction, document, and privacy operations.
