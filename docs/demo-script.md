# CircularMatch — 2–3 Minute Hackathon Demo Script

## 0:00–0:15 — Problem and differentiator

> “Industrial waste is often treated as a disposal problem even when it could be a secondary raw material. Existing marketplaces mostly help suppliers and buyers discover each other. CircularMatch adds an intelligence layer: it understands the material record, finds plausible circular pathways, ranks compatible industrial buyers, and explains why.”

Open the dashboard. Point to the **Demo Dataset** label.

> “Every company, price, location and impact value in this demo is fictional or illustrative. The point is the working decision workflow—not unsupported claims.”

## 0:15–0:50 — Generator creates a listing

1. Choose **List my waste**.
2. Keep the prefilled description:

   > “We generate around 3 tonnes of PET manufacturing scrap every week in Noida. The material is clean industrial-grade scrap and is available every Monday.”

3. Click **Analyze & structure**.

Say:

> “The AI-assisted layer creates a draft. It extracts PET scrap, 3,000 kg per week, Noida and Monday availability. But it does not claim chemical composition or certification from text. The quality remains visibly **Not verified** until evidence exists.”

4. On the review screen, show controlled material selection and **Potential use** cards.

> “Potential uses are catalog-backed and clearly labelled potential—not guaranteed suitability.”

5. Click **Publish listing**.

## 0:50–1:30 — Deterministic buyer matching

1. On the recommendation screen, show:
   - **Your waste**
   - **AI analysis**
   - **Potential industrial uses**
2. Click **Find best buyers**.

Say:

> “The matching engine is intentionally not an LLM. It uses normal backend logic, so the result is repeatable and inspectable.”

3. Point to the ranking and score bars.

> “The default MVP rules are material compatibility at 35%, quality at 20%, quantity at 15%, distance/logistics at 15%, price at 10%, and environmental benefit at 5%. These are configurable product rules, not scientifically optimal weights.”

4. Open **ReLoop Polymers**, the top demo match.

## 1:30–2:15 — Explainable value and impact

On **Why this match?**, say:

> “This buyer accepts the exact PET material in our controlled catalog. The weekly quantity fits its range. The stated industrial grade meets its requirement—but there is still a verification flag. The demo distance is inside its configured radius.”

Show the economic card:

> “The calculator separately shows listed price, illustrative transport, net recovered value, avoided disposal cost and the formula. This is not a market quote.”

Show the impact card:

> “The impact calculation shows waste diversion, potential secondary material, possible virgin-material displacement, transport burden, and net CO2e—along with every assumption. It is explicitly not a measured lifecycle assessment.”

Show the map route:

> “This maps a potential generator-to-buyer route using labelled sample coordinates, not live GPS or dispatch routing.”

## 2:15–2:30 — Close

> “Instead of treating industrial waste as a disposal problem, CircularMatch treats it as a discoverable raw-material resource—while keeping the decision process transparent enough for real industrial users to review.”
