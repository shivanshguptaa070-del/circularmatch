# CircularMatch — Complete Product Brief for PRD Generation

> **How to use this document:** Copy everything inside the **Master Prompt** section into Antigravity or another AI and ask it to create the final Product Requirements Document (PRD).
>
> **Important instruction:** The PRD must focus on product, users, workflows, features, policies, acceptance criteria, UX, priorities, and success metrics. **Do not include technical stack, programming languages, database choices, API design, or implementation code.**

---

# Master Prompt

You are a senior product manager, sustainability-product strategist, industrial marketplace expert, UX strategist, and PRD writer.

Create a detailed, professional Product Requirements Document for the following product. Do not recommend a technology stack, write code, or focus on implementation frameworks. Focus entirely on the product requirements, user needs, workflows, policies, data requirements, UX behavior, prioritization, business logic, and success criteria.

The PRD should be structured, practical, hackathon-ready, and credible enough to evolve into a pilot product. Do not invent market statistics, customers, partnerships, success rates, environmental savings, market prices, or legal compliance claims.

---

## 1. Product Identity

### Product Name
**CIRCULARMATCH**

### Product Tagline
**AI-Powered Industrial Waste-to-Raw-Material Matching Platform**

### One-Line Value Proposition
CircularMatch helps industrial businesses turn waste and by-products into discoverable, buyer-ready secondary raw-material opportunities.

### Core Product Statement
> “Instead of treating industrial waste as a disposal problem, CircularMatch treats it as a discoverable raw-material resource.”

### Recommended Hackathon Track
- Sustainability / Circular Economy / Waste Management
- Alternative track: AI for Sustainability
- Alternative track: Smart Manufacturing / Industry 4.0

---

## 2. Problem Statement

Industrial businesses generate recurring material streams such as plastic scrap, textile offcuts, paper trim, metal fabrication scrap, and other by-products. These streams are often disposed of or sold inefficiently because:

1. The generator may not know what the material could become.
2. Waste descriptions are often unstructured and incomplete.
3. Buyers need specific material forms, quantities, quality evidence, locations, and logistics conditions.
4. Existing waste marketplaces mainly help people list and discover materials, but do not determine whether a material is actually suitable for a specific buyer.
5. Quality claims are often unclear, unverified, or difficult to compare.
6. Buyers and generators need evidence, sample approval, commercial discussion, and receipt records before a real transaction can happen.
7. Sustainability or economic claims are often presented without clear assumptions or methods.

The problem is not only “finding a buyer.” The problem is determining whether a waste stream can credibly become a usable, traceable secondary raw material.

---

## 3. Product Vision

CircularMatch should become a trusted industrial-material exchange workflow, not a generic listing marketplace.

It should help businesses move through this journey:

```text
Unstructured waste description
→ Structured material record
→ Material Passport and evidence
→ Buyer acceptance rules
→ Eligibility checks
→ Explainable buyer ranking
→ Sample / inspection
→ Offer / commercial discussion
→ Pickup plan
→ Receipt / accepted quantity
→ Governed economic and environmental scenario
```

---

## 4. Main Differentiator

Existing platforms may connect waste sellers and buyers.

**CircularMatch adds an intelligence layer that:**

1. Understands what waste a business has.
2. Converts natural-language descriptions into structured material information.
3. Suggests plausible downstream circular uses.
4. Matches the material with industries that can actually use it.
5. Screens compatibility before recommending a buyer.
6. Ranks possible buyers using transparent rules.
7. Explains why a buyer is recommended.
8. Tracks the evidence, sample, offer, pickup, and receipt steps that happen after matching.
9. Shows economic and environmental scenarios with visible assumptions.

The product must never behave like a generic chatbot or an unstructured classifieds site.

---

## 5. Target Users

### A. Waste Generators

Examples:

- packaging manufacturers;
- plastic processors;
- textile factories;
- paper and board manufacturers;
- metal fabrication companies;
- construction-material manufacturers;
- food-processing companies in later phases.

#### Their goals

- reduce disposal dependence and cost;
- identify reliable buyers nearby;
- understand possible downstream uses;
- publish buyer-ready material information;
- compare commercial opportunities;
- maintain evidence and transaction records;
- show internal sustainability teams what happened to material streams.

#### Their pain points

- descriptions are not standardized;
- buyers ask repeated questions;
- quality and contamination requirements are unclear;
- they may not know whether their waste has value;
- they may not know which buyer should receive the material;
- they need confidence before sharing sensitive operational data.

### B. Buyers / Recyclers / Processors / Manufacturers

Examples:

- PET recyclers;
- recycled-fibre manufacturers;
- paperboard processors;
- steel and metal processors;
- factories using secondary raw materials.

#### Their goals

- find compatible and consistent material streams;
- reduce raw-material sourcing cost or risk;
- screen material before spending time on calls and samples;
- specify accepted forms, prohibited materials, quantity range, capacity, and evidence needs;
- request samples and track commercial discussion;
- avoid unsuitable or undocumented material lots.

#### Their pain points

- listings lack technical detail;
- quality claims may be unverified;
- supply quantities may be inconsistent;
- material form may not fit their process;
- contamination, moisture, colour, storage, and packaging can cause rejection;
- distance and transport can make a material commercially unviable.

### C. Admin / Quality Reviewer / Compliance Reviewer

#### Their goals

- manage users and companies;
- manage controlled material categories and potential-use catalog;
- review uploaded evidence;
- manage buyer acceptance templates;
- monitor reported listings and abnormal activity;
- configure decision-rule weights;
- audit decisions and transaction records;
- maintain data-quality and methodology governance.

---

## 6. Initial Supported Material Categories

The first version must intentionally support a limited, controlled catalog:

1. **PET industrial manufacturing scrap**
2. **Cotton textile cutting waste**
3. **Corrugated cardboard and paper trim**
4. **Mild-steel fabrication scrap**

### Why the scope is limited

The platform must be reliable, explainable, and safe. Each material category requires its own fields, buyer requirements, contamination rules, potential uses, evidence requirements, and acceptance conditions.

### Explicitly defer from early versions

- food-processing by-products;
- biomedical waste;
- e-waste;
- chemicals;
- hazardous or regulated waste self-service trading;
- mixed unknown industrial waste;
- materials requiring laboratory or safety certification before use.

For any potentially regulated or hazardous route, the product must route the listing to a manual compliance-review state. It must not make a legal classification decision.

---

## 7. Product Principles and Guardrails

### Principle 1 — Evidence over claims

The product must distinguish:

| Type | Example |
|---|---|
| Fact | 3,000 kg available weekly in Noida |
| Supplier claim | “Clean industrial-grade PET scrap” |
| Evidence | Supplier declaration, photo record, test report, certificate, weighbridge receipt |
| Reviewed evidence | An admin/reviewer has checked the evidence record |
| Calculation | Quantity fit, distance, score, economic scenario |
| Estimate | Potential recovered value or environmental scenario |

A supplier claim is not a verified fact.

### Principle 2 — No scientific inference from text or images

AI must not claim to determine:

- chemical composition;
- contamination level;
- hazardous status;
- food-contact suitability;
- certification validity;
- legal compliance;
- exact market value;
- measured carbon impact.

### Principle 3 — Deterministic decisions must remain deterministic

Do not use AI for:

- match scores;
- distance calculations;
- quantity-fit calculations;
- price calculations;
- logistics calculations;
- impact calculations;
- compliance approval;
- automatic transaction approval.

### Principle 4 — Explainability is mandatory

Every match must answer:

- Why is this buyer shown?
- Which requirements are met?
- Which information is missing?
- What could block the transaction?
- What is the next recommended action?

### Principle 5 — No unsupported sustainability marketing

- Every price must be labelled as illustrative, indicative, quoted, offered, or agreed.
- Every impact result must show method, assumptions, source status, and confidence/data-quality tier.
- Demo data must never be presented as real market, customer, or environmental data.

### Principle 6 — Confidentiality matters

The platform should avoid revealing exact production volumes, documents, precise location, contact information, or commercial terms to every visitor. Visibility should increase only after appropriate mutual interest, review, or workflow stage.

---

## 8. Core User Journey — Waste Generator

### Step 1: Start a listing

The generator selects **“List My Waste.”**

They can choose:

- Natural-language entry; or
- Structured manual form.

### Step 2: Describe material naturally

Example input:

> “We generate around 3 tonnes of PET manufacturing scrap every week in Noida. The material is clean industrial-grade scrap and is available every Monday.”

### Step 3: AI-assisted structured draft

The system creates a draft such as:

- Material: PET industrial scrap
- Category: Plastic
- Quantity: 3,000 kg/week
- Frequency: Weekly
- Location: Noida
- Availability: Monday
- Stated quality: Industrial grade
- Quality status: **Not verified**

The user must review and edit every field before publishing.

### Step 4: Create Material Passport lot

The generator adds or confirms:

- lot code;
- available quantity;
- material form;
- source status: pre-consumer / post-consumer / unknown;
- colour;
- packaging/bale format;
- storage condition;
- sample availability;
- supplier-declared specification;
- compliance-triage state;
- evidence records.

### Step 5: Add evidence

Evidence types may include:

- supplier declaration;
- photo record;
- test report;
- certificate;
- invoice/source record;
- compliance document;
- weighbridge document;
- other material evidence.

Evidence statuses:

- Self declared
- Uploaded
- Reviewed
- Test reviewed
- Rejected
- Expired

Only a reviewer/admin may mark an uploaded record as reviewed or test-reviewed.

### Step 6: View material readiness

The platform displays a readiness state:

- Draft
- Missing evidence
- Buyer ready
- Sample ready
- Compliance review needed

The generator sees exactly what information is missing.

### Step 7: Find best buyers

The generator selects **“Find Best Buyers.”**

The system runs eligibility gates, then produces a ranked list of material-compatible buyers.

### Step 8: Move to workflow

For a suitable buyer, the generator can:

- contact buyer;
- request missing information;
- respond to sample request;
- review buyer acceptance requirements;
- view illustrative commercial scenario;
- view potential route;
- participate in offer/pickup/receipt flow.

---

## 9. Core User Journey — Buyer

### Step 1: Create a buyer requirement

The buyer defines:

- required material;
- minimum and maximum quantity per week;
- minimum stated quality;
- maximum distance;
- optional target price;
- buyer location;
- partial-quantity preference.

### Step 2: Create buyer acceptance template

The buyer defines specific screening rules:

- accepted material forms;
- accepted colours;
- prohibited materials or conditions;
- required evidence status;
- whether sample/inspection is mandatory;
- published weekly intake capacity;
- allowed route/use notes.

Example PET template:

- Accepted forms: manufacturing trim, regrind, sheet scrap
- Accepted colours: clear, transparent light blue
- Prohibited conditions: PVC, PETG, free-flowing liquids
- Required evidence: supplier declaration or stronger
- Sample required: yes
- Intended route: potential non-food recycling route pending buyer inspection

### Step 3: View compatible supply

The buyer sees supply grouped by status:

- Eligible now
- Needs sample
- Missing evidence
- Blocked

The buyer can compare:

- material/lot form;
- supplier evidence;
- quality status;
- quantity;
- distance;
- buyer template fit;
- potential use;
- illustrative price information;
- next recommended action.

### Step 4: Request sample / inspection

Before a commercial decision, the buyer can create a sample request. This must not be shown as a final purchase commitment.

### Step 5: Commercial workflow

The buyer can send an illustrative offer, record offer acceptance, plan pickup, and record material receipt in the demo workflow.

---

## 10. Core User Journey — Admin / Reviewer

Admin can:

- switch to Admin mode;
- review evidence records;
- mark evidence as reviewed, test-reviewed, expired, or rejected;
- inspect Material Passport data;
- configure score weights;
- manage controlled material catalog;
- manage potential-use catalog;
- inspect match explanation and audit events;
- view report queue;
- monitor demo/pilot metrics;
- reset the demo dataset.

A later production version should add:

- company verification;
- expiry alerts;
- document review queues;
- compliance workflow;
- dispute management;
- access/permission management;
- audit export.

---

## 11. Material Passport Requirements

A Material Passport is the central trust record for a material lot. It should include:

### A. Material identity

- material category;
- canonical material name;
- source process;
- material form;
- source status;
- colour;
- packaging;
- storage conditions;
- lot/batch code;
- available quantity;
- location at an appropriate privacy level;
- availability schedule.

### B. Quality and evidence

- supplier-declared quality grade;
- quality notes;
- evidence records;
- reviewer status;
- test method and issuer where available;
- expiry date where relevant;
- representative sample availability.

### C. Commercial details

- price status;
- indicative asking price if shared;
- disposal cost if shared;
- minimum dispatch quantity;
- delivery/pickup preference;
- loading constraints;
- pickup windows.

### D. Compliance and safety

- compliance triage state;
- route restrictions;
- document status;
- manual-review requirement;
- clear disclaimer that the platform is not making a legal classification decision.

### E. Visibility controls

- public/anonymous preview;
- approved-buyer view;
- mutual-interest view;
- sample/RFQ view;
- transaction participant view;
- admin/reviewer view.

---

## 12. Buyer Acceptance Template Requirements

Every buyer requirement should be supplemented by a configurable acceptance template.

### Required template fields

- accepted forms;
- accepted colours;
- prohibited materials/conditions;
- minimum evidence state;
- sample requirement;
- available capacity;
- intended downstream route;
- buyer inspection/test notes;
- internal review notes.

### Product behavior

The template is not a universal industry standard. It is the buyer’s own screening profile for the material route.

If a lot does not meet the template, CircularMatch must explain exactly why.

---

## 13. Matching Logic

CircularMatch should use two stages: **Eligibility Gates** and **Transparent Ranking**.

### Stage A: Eligibility Gates

Every match must be evaluated against these gates:

1. Exact controlled material match or approved compatibility mapping
2. Buyer accepted material form
3. Buyer colour requirement, if configured
4. Buyer prohibited-material conditions
5. Stated quality grade vs buyer minimum quality
6. Required evidence threshold
7. Sample/inspection requirement
8. Quantity and published capacity fit
9. Distance/serviceable logistics radius
10. Compliance review state where applicable

### Eligibility outcomes

| Status | Meaning |
|---|---|
| Eligible | No current screening gate blocks an RFQ/offer stage. |
| Needs sample | Screening fit exists, but sample/inspection is mandatory before commercial acceptance. |
| Missing evidence | Buyer evidence threshold is not met. |
| Blocked | One or more explicit screening rules fail. |

### Stage B: Transparent Ranking

Among material-compatible routes, use configurable initial scoring weights:

| Factor | Default Weight |
|---|---:|
| Material compatibility | 35% |
| Quality compatibility | 20% |
| Quantity compatibility | 15% |
| Distance and logistics | 15% |
| Price/economic scenario | 10% |
| Environmental pathway signal | 5% |
| Total | 100% |

These weights are **MVP decision rules**, not scientifically optimal weights. They can be calibrated later from actual sample acceptance and completed transaction data.

### Important ranking behavior

- A high score must never hide a blocked condition.
- A buyer requirement can have a lower score but be more operationally ready if its evidence and sample requirements are fulfilled.
- Missing evidence and sample requirements must show the next action.
- Do not call a buyer “best” without displaying the reasons and limitations.

---

## 14. “Why This Match?” Requirements

Every match must include plain-language explanations such as:

- This buyer accepts PET industrial scrap through an exact controlled-catalog match.
- Your material form fits the buyer’s acceptance template.
- Your available quantity falls within or outside the requested range.
- Your stated quality meets the buyer minimum, but remains supplier-declared and not verified.
- The buyer is within the configured screening radius.
- A sample is required before commercial acceptance.
- More evidence is needed before this route can proceed.
- The price comparison uses illustrative inputs and is not a quote.
- The possible downstream route is a potential use, not guaranteed suitability.

The explanation must be created from stored facts and deterministic checks, not invented by an AI model.

---

## 15. Potential Industrial Uses

The generator may not know what their waste could become.

The product should show **Potential Use** suggestions from a controlled catalog only.

### Example: PET industrial scrap

Potential uses:

- recycled PET feedstock;
- polyester fibre feedstock;
- non-food plastic-processing feedstock.

### Example: Cotton textile cutting waste

Potential uses:

- recycled yarn feedstock;
- insulation/nonwoven material;
- industrial wiping material.

### Example: Corrugated cardboard/paper trim

Potential uses:

- recycled paperboard feedstock;
- moulded pulp products.

### Example: Mild-steel fabrication scrap

Potential uses:

- re-melt feedstock;
- secondary scrap blend.

### Rules for potential uses

- Always label as **Potential use**.
- Never call a use guaranteed, certified, or approved without evidence.
- Never suggest food-contact, medical, or safety-critical use without an appropriate specialist process.
- Allow buyer templates and route restrictions to determine whether a potential use should be shown.

---

## 16. Economic Value Calculator

The calculator should help compare disposal with circular reuse.

### Inputs

- quantity scenario;
- seller indicative asking price;
- buyer target price, if shared;
- illustrative or quoted transport cost;
- current disposal cost;
- buyer capacity limit;
- pickup model.

### Outputs

- reference price and its source;
- estimated transport cost;
- estimated sale revenue;
- net recovered value;
- avoided disposal cost;
- potential improvement versus disposal;
- estimated delivered cost.

### Formula

```text
Net recovered value = sale revenue − transport cost
Potential improvement versus disposal = net recovered value + avoided disposal cost
```

### Price states

The platform must distinguish:

- no price shared;
- indicative seller ask;
- buyer target, not an offer;
- RFQ received;
- formal offer;
- agreed commercial term;
- invoice/settlement evidence.

### Required disclaimer

All demo prices and logistics values must be labelled:

> “Illustrative / Demo Data — not a market quote.”

---

## 17. Environmental and Circularity Impact Requirements

The product may show an illustrative impact scenario for a successful potential route.

### Potential outputs

- waste diverted from disposal;
- potential secondary material recovered;
- estimated virgin material displaced;
- estimated transport emissions;
- estimated avoided emissions;
- estimated net CO2e benefit;
- potential circular pathway.

### Every impact result must include

- methodology name and version;
- functional unit;
- system boundary;
- factor source label;
- transport-distance method;
- data-quality tier;
- assumptions;
- explicit claim boundary.

### Data-quality tiers

| Tier | Label |
|---|---|
| Demo scenario | Illustrative / Demo Data |
| Estimate | Estimated — methodology shown |
| Evidence-backed estimate | Evidence-backed estimate |

### Mandatory safeguards

- Do not call demo output a measured LCA.
- Do not call an avoided-emissions scenario a verified company GHG inventory.
- Do not show a single CO2 number without assumptions.
- Do not use broad industry averages as a permanent production methodology without governance.

---

## 18. Commercial and Transaction Workflow

CircularMatch must not jump directly from “match” to “successful transaction.”

### Workflow states

```text
Match identified
→ Missing-information request OR sample request
→ Sample / inspection status
→ Buyer offer or RFQ
→ Offer accepted / rejected / revised
→ Pickup plan
→ Dispatch record
→ Receipt / accepted quantity
→ Dispute or completion
→ Repeat arrangement
```

### Required workflow records

- contact intent;
- sample request;
- sample approval/rejection;
- offer;
- offer acceptance/rejection;
- pickup appointment;
- carrier/transport details;
- planned quantity;
- dispatched quantity;
- received quantity;
- quality acceptance result;
- variance reason;
- proof/receipt document;
- dispute record;
- audit activity.

### Demo-mode rule

Every demo workflow record must state that it is not:

- a purchase order;
- a legal contract;
- a payment record;
- a live fleet dispatch;
- a legally sufficient chain-of-custody record.

---

## 19. Dashboard Requirements

The dashboard should present a professional sustainability/industrial operations view.

### Dashboard KPI cards

- total waste listed;
- total waste matched;
- waste diverted;
- potential economic value recovered;
- potential CO2e benefit;
- active buyers;
- successful matches;
- material readiness coverage;
- evidence coverage;
- sample/offer/pickup workflow activity.

### Dashboard charts

- waste by category;
- waste diverted over time;
- match success status;
- potential economic value;
- environmental scenario;
- Material Passport readiness distribution;
- matches by eligibility state;
- evidence review status.

All dashboard figures must indicate when they come from Demo Dataset data.

---

## 20. Map Requirements

The map should focus on Delhi NCR in the demo.

### Map should show

- waste generator locations;
- buyers/recyclers/processors;
- selected potential generator-to-buyer route;
- material type;
- quantity;
- quality/evidence status;
- potential match status;
- demo distance.

### Map safeguards

- Clearly state locations are sample/demo locations unless real consented location data exists.
- Clearly state route distance is not live logistics routing unless a real routing provider is connected.
- Do not use exact location for public users if company visibility settings require privacy.

---

## 21. Admin and Reviewer Requirements

### Admin responsibilities

- manage users and companies;
- manage materials and potential-use catalog;
- manage scoring configuration;
- review evidence records;
- inspect eligibility decisions;
- manage reports and flagged content;
- view audit logs;
- reset demo data;
- manage impact methodology registry.

### Quality/compliance review workspace

The reviewer should see:

- material lot;
- supplier claim;
- evidence type and status;
- document issuer/date/expiry where available;
- buyer evidence threshold;
- manual review status;
- notes;
- audit history.

The reviewer must never make unsupported automated legal or scientific approvals.

---

## 22. Status System

### Listing statuses

- Draft
- Active
- Paused
- Archived

### Material-lot statuses

- Available
- Reserved
- Dispatched
- Closed

### Material readiness statuses

- Draft
- Missing evidence
- Buyer ready
- Sample ready
- Compliance review needed

### Evidence statuses

- Self declared
- Uploaded
- Reviewed
- Test reviewed
- Rejected
- Expired

### Match statuses

- Suggested
- Contacted
- Accepted
- Rejected

### Eligibility statuses

- Eligible
- Needs sample
- Missing evidence
- Blocked

### Sample statuses

- Requested
- Approved
- Received
- Accepted
- Rejected
- Cancelled

### Offer statuses

- Draft
- Sent
- Accepted
- Rejected
- Superseded

### Shipment statuses

- Planned
- Dispatched
- Received
- Disputed
- Cancelled

---

## 23. Required Product Screens

1. Landing / Demo login
2. Generator dashboard
3. Buyer dashboard
4. Admin dashboard
5. List My Waste — natural-language entry
6. AI extraction review/edit page
7. Structured listing review page
8. Material Passport page
9. Add lot page/modal
10. Add evidence page/modal
11. Buyer requirements page
12. Buyer acceptance-template page
13. Listing catalog / My Listings page
14. Match recommendation page
15. Match detail / Why This Match page
16. Sample, offer, pickup, receipt timeline section
17. Economic-value calculator section
18. Environmental methodology and assumptions section
19. Delhi NCR map page
20. Admin evidence review queue
21. Admin scoring-rule page
22. Admin material catalog page
23. Reports / flagged-listings page
24. Settings / company profile / privacy controls page

---

## 24. UX and Visual Direction

CircularMatch should look like a serious industrial sustainability SaaS product.

### Desired visual qualities

- professional;
- modern;
- restrained;
- trustworthy;
- clean;
- high-information but not cluttered;
- desktop-first dashboard;
- mobile-friendly forms;
- visually rich but not playful or gamified;
- clear hierarchy;
- strong cards, score indicators, workflow timeline, map, charts, evidence panels.

### Avoid

- generic AI chatbot layout;
- excessive neon effects;
- fake “verified” badges;
- consumer resale-marketplace appearance;
- unrealistic green claims;
- too many animations;
- complex jargon without explanation.

### Important UX patterns

- use status chips and action-oriented next steps;
- explain why a route is blocked;
- show missing information clearly;
- display source and assumption for calculations;
- make evidence state visible everywhere;
- hide sensitive details until appropriate workflow stage;
- use progressive disclosure for advanced material details;
- show clear empty states and error states.

---

## 25. AI Requirements

### AI may be used for

- natural-language waste extraction;
- canonical-material suggestion from a controlled catalog;
- category suggestion;
- missing-field questions;
- catalog-backed potential-use suggestions;
- concise listing summaries;
- document-text extraction into an editable draft.

### AI may not be used for

- chemical analysis;
- quality certification;
- contamination detection from image alone;
- legal/compliance determination;
- safety approval;
- food-contact suitability;
- score calculation;
- distance calculation;
- price calculation;
- environmental calculation;
- automatic publishing;
- automatic buyer approval/rejection;
- autonomous commercial agreement.

### AI output behavior

- All AI output must be reviewable/editable.
- Unknown fields must remain unknown, not guessed.
- Any uncertainty must be explicit.
- Potential uses must come from an approved material catalog.
- AI must not invent buyers, prices, evidence, certifications, or test results.

---

## 26. Demo Dataset Requirements

All initial data must be fictional and labelled **Demo Dataset**.

### Demo generators

- Noida PackForm Industries — PET industrial scrap
- LoomLink Textiles — cotton cutting waste
- GreenFold Paperboard — cardboard/paper trim
- Atlas Fabrication Works — mild-steel fabrication scrap

### Demo buyers

- ReLoop Polymers — PET recycler
- NorthStar Reclaim — PET recycler
- MouldCycle Materials — plastic processor
- ThreadAgain Fibres — textile recycler
- RenewBoard Papers — paperboard processor
- ForgeBack Metals — metal processor

### Demonstration scenario

Generator input:

> “We generate around 3 tonnes of PET manufacturing scrap every week in Noida. The material is clean industrial-grade scrap and is available every Monday.”

The platform should demonstrate:

1. AI-assisted extraction into a draft;
2. quality shown as Not verified;
3. Material Passport creation;
4. buyer acceptance rules;
5. ReLoop Polymers as a strong compatible buyer;
6. `Needs sample` status before sample acceptance;
7. sample acceptance changes eligibility to `Eligible`;
8. illustrative offer;
9. demo pickup plan;
10. demo receipt;
11. explainable economics and impact assumptions.

---

## 27. Product Success Metrics

Do not invent actual values. Define these as pilot metrics to collect.

### Material quality and readiness

- listing completeness rate;
- Material Passport readiness rate;
- evidence coverage rate;
- evidence review turnaround time;
- percentage of listings requiring clarification.

### Matching quality

- material-compatible match rate;
- match-to-sample-request rate;
- sample acceptance rate;
- blocked-match reason distribution;
- missing-evidence reason distribution;
- buyer satisfaction with match relevance.

### Transaction outcomes

- offer rate;
- offer acceptance rate;
- pickup completion rate;
- accepted quantity versus listed quantity;
- rejection/dispute rate;
- time from listing to sample;
- time from listing to receipt;
- repeat material-flow rate.

### Sustainability and reporting quality

- material diverted with receipt evidence;
- proportion of impact scenarios with disclosed methodology;
- impact data-quality coverage;
- percentage of completed transactions with an evidence trail.

---

## 28. MVP Scope vs Future Scope

### MVP / Hackathon Scope

Must include:

- demo login roles;
- demo data;
- waste listing;
- AI-assisted structured extraction;
- Material Passport;
- evidence records;
- buyer requirements;
- buyer acceptance templates;
- eligibility gates;
- deterministic scores;
- Why This Match explanation;
- potential use suggestions;
- economic scenario;
- impact scenario with assumptions;
- map;
- sample/offer/pickup/receipt demo workflow;
- admin evidence review;
- scoring configuration;
- dashboards;
- clear Demo Data labels.

### Pilot-Ready Scope

Add:

- real company onboarding;
- document storage;
- private sharing controls;
- reviewer workflow;
- compliance-document expiry alerts;
- real road routing;
- logistics quote capture;
- real sample workflow;
- actual receipt/weighbridge evidence;
- outcome feedback loop;
- material-specific methodology registry.

### Future Scope

Add only after pilot evidence:

- ERP/inventory connectors;
- real logistics integrations;
- multilingual Hindi/English interfaces;
- buyer reliability indicators;
- anonymized transaction-based price intelligence;
- regional industrial-cluster analytics;
- sensor/weighbridge integration;
- export-ready material information pack.

---

## 29. Explicit Non-Goals

The PRD must state that CircularMatch is not initially:

- a consumer recycling app;
- a generic classified marketplace;
- a hazardous-waste exchange;
- a food-safety platform;
- a legal-compliance certification tool;
- a laboratory testing platform;
- a real-time commodity-price prediction platform;
- a carbon-credit system;
- a blockchain-first product;
- a fleet-management system;
- a payments/escrow platform;
- a system that guarantees buyer acceptance.

---

## 30. Product Risks and Required Safeguards

| Risk | Safeguard |
|---|---|
| Generator overstates quality | Separate claim from reviewed/test evidence. |
| Buyer receives unsuitable material | Buyer template, evidence thresholds, sample workflow, receipt/variance tracking. |
| AI invents a fact | Controlled catalog, editable draft, no autonomous publish, source trace. |
| Compliance risk | Compliance triage and manual-review state; no automated legal approval. |
| Greenwashing | Method, boundary, assumptions, and data-quality label on every impact result. |
| Confidentiality risk | Progressive visibility and role-based sharing. |
| Fake commercial claim | Separate indicative ask, target, offer, agreed term, and receipt. |
| Poor liquidity | Start with one material route and one region, not every waste type nationally. |
| Weak matching | Capture sample/offer/receipt outcomes and calibrate later. |

---

## 31. Prioritization Rule

When there is a conflict between features, prioritize this end-to-end workflow:

```text
Generator listing
→ structured material record
→ Material Passport and evidence
→ buyer acceptance template
→ eligibility checks
→ ranked buyers
→ explainability
→ sample/offer/pickup/receipt workflow
```

Do not prioritize secondary features over this workflow.

---

## 32. Final PRD Output Required from the AI

Create a PRD with these sections:

1. Executive Summary
2. Product Vision
3. Problem Statement
4. Target Users and Personas
5. User Pain Points
6. Value Proposition and Differentiation
7. Goals and Non-Goals
8. Scope and Material Categories
9. User Journeys
10. Feature Requirements
11. Material Passport Requirements
12. Buyer Acceptance Template Requirements
13. Matching and Eligibility Logic
14. AI Requirements and Guardrails
15. Economic and Impact Requirements
16. Transaction Workflow
17. Dashboard and Map Requirements
18. Admin/Reviewer Requirements
19. UX/UI Principles
20. Status Models and Business Rules
21. Demo Dataset Requirements
22. Edge Cases and Error States
23. Success Metrics
24. MVP vs Pilot-Ready vs Future Roadmap
25. Risks and Safeguards
26. Acceptance Criteria for Every Major Feature
27. Open Questions / Assumptions Requiring Validation
28. Hackathon Demo Script

The PRD must be detailed, structured, and practical. It must preserve all honesty policies: no unsupported AI, market-price, quality, compliance, customer, or CO2 claims.
