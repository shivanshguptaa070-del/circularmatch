"""
CircularMatch — Master Strategy, Market & Product Intelligence Report 2026
Full Report PDF Generator updated with the latest Tool Architecture, Features, and Specs.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.graphics.shapes import Drawing, Rect, String
import os
import pypdf

OUTPUT_PATH = r"C:\Users\sysye\OneDrive\Desktop\circularmatch\circularmatch\docs\CircularMatch_Master_Report_2026.pdf"
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

# ─────────────────────────── COLOURS ────────────────────────────
FOREST   = colors.HexColor("#0a3d36")
MINT     = colors.HexColor("#3ecf8e")
SPRUCE   = colors.HexColor("#12645b")
SAGE     = colors.HexColor("#eaf6f0")
INK      = colors.HexColor("#1a2e2b")
MUTED    = colors.HexColor("#617770")
GOLD     = colors.HexColor("#d4a017")
RED      = colors.HexColor("#c0392b")
ORANGE   = colors.HexColor("#e67e22")
BLUE     = colors.HexColor("#2980b9")
LIGHT_BG = colors.HexColor("#f5faf8")
WHITE    = colors.white
DARK_ROW = colors.HexColor("#d9ede6")
ALT_ROW  = colors.HexColor("#f0f9f5")

# ─────────────────────────── STYLES ─────────────────────────────
styles = getSampleStyleSheet()

def S(name, **kw):
    return ParagraphStyle(name, **kw)

sTitle = S("sTitle", fontName="Helvetica-Bold", fontSize=32, textColor=WHITE,
           leading=38, spaceAfter=6, alignment=TA_CENTER)
sSubtitle = S("sSubtitle", fontName="Helvetica", fontSize=13, textColor=MINT,
              leading=18, spaceAfter=4, alignment=TA_CENTER)
sMeta = S("sMeta", fontName="Helvetica", fontSize=9.5, textColor=colors.HexColor("#aaccbb"),
          leading=14, alignment=TA_CENTER)
sVerdict = S("sVerdict", fontName="Helvetica-Bold", fontSize=12, textColor=WHITE,
             leading=16, spaceAfter=2)
sVerdictBody = S("sVerdictBody", fontName="Helvetica", fontSize=9.5, textColor=WHITE,
                 leading=14, spaceAfter=4)

sH1 = S("sH1", fontName="Helvetica-Bold", fontSize=16, textColor=FOREST,
         leading=22, spaceBefore=14, spaceAfter=6,
         borderPad=5, backColor=SAGE,
         leftIndent=0, rightIndent=0)
sH2 = S("sH2", fontName="Helvetica-Bold", fontSize=13, textColor=SPRUCE,
         leading=18, spaceBefore=12, spaceAfter=5)
sH3 = S("sH3", fontName="Helvetica-Bold", fontSize=10.5, textColor=INK,
         leading=15, spaceBefore=7, spaceAfter=3)
sBody = S("sBody", fontName="Helvetica", fontSize=9, textColor=INK,
          leading=14, spaceAfter=4, alignment=TA_JUSTIFY)
sBullet = S("sBullet", fontName="Helvetica", fontSize=9, textColor=INK,
            leading=13.5, spaceAfter=2.5, leftIndent=12, firstLineIndent=-8)
sCallout = S("sCallout", fontName="Helvetica-Oblique", fontSize=8.5, textColor=SPRUCE,
             leading=13, spaceAfter=4, leftIndent=10, rightIndent=10,
             backColor=SAGE, borderPad=6)
sWarning = S("sWarning", fontName="Helvetica-BoldOblique", fontSize=8.5, textColor=RED,
             leading=13, spaceAfter=4, leftIndent=10, rightIndent=10,
             backColor=colors.HexColor("#fdf0ef"), borderPad=6)
sNote = S("sNote", fontName="Helvetica-Oblique", fontSize=8, textColor=MUTED,
          leading=12, spaceAfter=3)
sLabel = S("sLabel", fontName="Helvetica-Bold", fontSize=8, textColor=WHITE,
           leading=11, alignment=TA_CENTER)
sSectionNum = S("sSectionNum", fontName="Helvetica-Bold", fontSize=8.5, textColor=MINT,
                leading=11, spaceBefore=2, spaceAfter=0)
sTH = S("sTH", fontName="Helvetica-Bold", fontSize=8, textColor=WHITE, leading=11)
sTD = S("sTD", fontName="Helvetica", fontSize=8, textColor=INK, leading=11)
sTD_green = S("sTD_green", fontName="Helvetica-Bold", fontSize=8, textColor=SPRUCE, leading=11)
sTD_red   = S("sTD_red",   fontName="Helvetica-Bold", fontSize=8, textColor=RED,    leading=11)
sTD_small = S("sTD_small", fontName="Helvetica", fontSize=7.5, textColor=INK, leading=10)

# ─────────────────────────── HELPERS ────────────────────────────

def hr(color=MINT, thickness=1.5, spB=3, spA=6):
    return [Spacer(1, spB*mm), HRFlowable(width="100%", thickness=thickness, color=color), Spacer(1, spA*mm)]

def h1(text, num=None):
    items = []
    if num:
        items.append(Paragraph(f"SECTION {num}", sSectionNum))
    items.append(Paragraph(text, sH1))
    return items

def h2(text):
    return Paragraph(text, sH2)

def h3(text):
    return Paragraph(text, sH3)

def body(text):
    return Paragraph(text, sBody)

def bullet(text):
    return Paragraph(f"• {text}", sBullet)

def callout(text):
    return Paragraph(f"▸ {text}", sCallout)

def warning(text):
    return Paragraph(f"⚠ {text}", sWarning)

def note(text):
    return Paragraph(f"Note: {text}", sNote)

def sp(h=3):
    return Spacer(1, h*mm)

def table(data, col_widths, style_extra=None):
    base_style = [
        ('BACKGROUND',  (0,0), (-1,0), FOREST),
        ('TEXTCOLOR',   (0,0), (-1,0), WHITE),
        ('FONTNAME',    (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE',    (0,0), (-1,-1), 8),
        ('GRID',        (0,0), (-1,-1), 0.35, colors.HexColor("#c8ddd6")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, ALT_ROW]),
        ('VALIGN',      (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING',(0,0), (-1,-1), 4),
        ('TOPPADDING',  (0,0), (-1,-1), 3),
        ('BOTTOMPADDING',(0,0),(-1,-1), 3),
        ('WORDWRAP',    (0,0), (-1,-1), True),
    ]
    if style_extra:
        base_style += style_extra
    tbl = Table(data, colWidths=col_widths, repeatRows=1)
    tbl.setStyle(TableStyle(base_style))
    return tbl

def verdict_box(rows):
    tbl_data = [[Paragraph(k, sVerdict), Paragraph(v, sVerdictBody)] for k, v in rows]
    t = Table(tbl_data, colWidths=[48*mm, 126*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), FOREST),
        ('GRID', (0,0), (-1,-1), 0.5, MINT),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    return t

# ─────────────────────── PAGE TEMPLATE ──────────────────────────

def _header_footer(canvas, doc):
    canvas.saveState()
    page_w, page_h = A4
    if doc.page > 1:
        # Header bar
        canvas.setFillColor(FOREST)
        canvas.rect(0, page_h - 20*mm, page_w, 20*mm, fill=1, stroke=0)
        canvas.setFillColor(MINT)
        canvas.setFont("Helvetica-Bold", 8)
        canvas.drawString(18*mm, page_h - 11*mm, "CIRCULARMATCH  ·  MASTER STRATEGY, MARKET & PRODUCT REPORT  ·  2026")
        canvas.setFillColor(colors.HexColor("#aaccbb"))
        canvas.setFont("Helvetica", 8)
        canvas.drawRightString(page_w - 18*mm, page_h - 11*mm, f"Page {doc.page}")
        # Footer
        canvas.setFillColor(SAGE)
        canvas.rect(0, 0, page_w, 11*mm, fill=1, stroke=0)
        canvas.setFillColor(MUTED)
        canvas.setFont("Helvetica-Oblique", 7)
        canvas.drawString(18*mm, 3.5*mm, "Confidential — For internal use only. Not investment advice. All financial projections are directional scenarios.")
        canvas.setFont("Helvetica", 7)
        canvas.drawRightString(page_w - 18*mm, 3.5*mm, "© 2026 CircularMatch · Team Code Craft")
    canvas.restoreState()

# ───────────────────────── DOCUMENT ─────────────────────────────

def build_story(toc_dict=None):
    page_w = A4[0] - 36*mm  # 174mm usable width
    story = []

    # ═══════════════════════ COVER PAGE ═════════════════════════
    story.append(Spacer(1, 15*mm))
    banner = Drawing(page_w, 58*mm)
    banner.add(Rect(0, 0, page_w, 58*mm, fillColor=FOREST, strokeColor=None))
    banner.add(Rect(0, 0, page_w, 3*mm, fillColor=MINT, strokeColor=None))
    banner.add(Rect(0, 55*mm, page_w, 3*mm, fillColor=MINT, strokeColor=None))
    story.append(banner)
    story.append(Spacer(1, -58*mm))
    story.append(Paragraph("CIRCULARMATCH", sTitle))
    story.append(Paragraph("Master Strategy, Market &amp; Product Intelligence Report", sSubtitle))
    story.append(Spacer(1, 38*mm))
    story.append(Paragraph("September 2026 &nbsp;&nbsp;|&nbsp;&nbsp; Confidential &nbsp;&nbsp;|&nbsp;&nbsp; Research-Based Strategic &amp; Technical Analysis", sMeta))
    story.append(Spacer(1, 8*mm))

    story.append(Paragraph(
        "Prepared by: Antigravity AI Research &amp; Team Code Craft",
        S("cred", fontName="Helvetica-Bold", fontSize=9, textColor=SPRUCE, alignment=TA_CENTER)
    ))
    story.append(Paragraph(
        "Institution: G.L. Bajaj Institute of Technology &amp; Management (ITM), Greater Noida<br/>"
        "Repository: github.com/shivanshguptaa070-del/circularmatch &nbsp;·&nbsp; Live Application: circularmatch.vercel.app",
        S("cred2", fontName="Helvetica", fontSize=8, textColor=MUTED, alignment=TA_CENTER, leading=12)
    ))
    story.append(Spacer(1, 5*mm))
    story.append(HRFlowable(width="60%", thickness=1, color=MINT, hAlign='CENTER'))
    story.append(Spacer(1, 5*mm))
    story.append(Paragraph(
        "This master document synthesises market research, competitive intelligence, verified regulatory data (EPR/BRSR/DPDP), "
        "financial modelling, complete tool architecture specifications, and a 20-point reverification audit into a single authoritative reference. "
        "It incorporates the full production software capabilities of CircularMatch — including the 100-point deterministic matching engine, "
        "Google Gemini 2.0 Flash AI extraction with safety guardrails, ISO 59040 Digital Material Passports, buyer acceptance spec templates, "
        "and 5-stage procurement lifecycle workflows.",
        S("intro", fontName="Helvetica-Oblique", fontSize=8.5, textColor=MUTED, alignment=TA_CENTER,
          leading=13.5, leftIndent=15, rightIndent=15)
    ))
    story.append(PageBreak())

    # ═══════════════ TABLE OF CONTENTS ══════════════════════════
    story += h1("Table of Contents")
    toc_titles = [
        ("Executive Verdict", "1"),
        ("What CircularMatch Actually Is (Latest Tool Specs & Architecture)", "2"),
        ("The Exact Problem Being Solved", "3"),
        ("Customer Analysis — Three Segments", "4"),
        ("Market Size: TAM / SAM / SOM", "5"),
        ("Regulatory Environment (EPR, BRSR Core, DPDP, ESPR)", "6"),
        ("Competitive Landscape & Intelligence Matrix", "7"),
        ("Best Initial Wedge & Business Model Analysis", "8"),
        ("Unit Economics — Three Scenarios", "9"),
        ("$1M / $10M / $100M ARR Scenarios & Billion-Dollar Test", "10"),
        ("GTM Strategy & Product Roadmap (V1 Live to V5)", "11"),
        ("Risk Registry — 20 Ways CircularMatch Fails & Mitigations", "12"),
        ("Red-Team Criticism — Why This Might Fail & Rebuttals", "13"),
        ("Funding Strategy & Investor Map", "14"),
        ("12-Month Tactical Roadmap", "15"),
        ("Product Architecture, Implemented Tool Capabilities & Future Gaps", "16"),
        ("Reverification Audit — 20 Claims Checked & Corrected", "17"),
        ("Final Recommended Strategy & Four Immediate Actions", "18"),
        ("Revenue Model Deep-Dive — Why Transaction Fees Alone Fail", "19"),
        ("Investor Pitch Narrative & Pre-Answered Hard Questions", "20"),
        ("Source Classification & Areas for Independent Verification", "21"),
    ]
    
    toc_data = [["Section", "Page"]]
    for title, sec_num in toc_titles:
        p_num = str(toc_dict.get(sec_num, "")) if toc_dict else "..."
        toc_data.append([Paragraph(f"<b>Section {sec_num}:</b> {title}", sTD), Paragraph(p_num, sTD_green)])
    
    story.append(table(toc_data, [page_w - 22*mm, 22*mm]))
    story.append(sp(4))
    story.append(callout("Document Revision: v2.4 (September 2026). Reflects latest tool codebase, 100-pt matching v2 algorithm, and live Vercel/Render deployments."))
    story.append(PageBreak())

    # ═══════════════ SECTION 1: EXECUTIVE VERDICT ═══════════════
    story += h1("Executive Verdict", "1")
    story.append(body(
        "This report is an objective, evidence-based assessment of whether CircularMatch can become a meaningful, scalable business — "
        "and what must be true for it to reach ₹50 Cr, ₹500 Cr, and potentially ₹8,000 Cr+ in enterprise value. "
        "Every factual claim is sourced. Every inference is labelled. Every risk is named."
    ))
    story.append(sp(3))
    story.append(verdict_box([
        ("Opportunity", "Real, growing, under-served in India. Over 62M tonnes of industrial waste produced annually; regulatory mandates (EPR & BRSR) make verifiable secondary material sourcing mandatory."),
        ("Current Product Status", "<b>Trusted Pilot Core Live & Verified:</b> Complete full-stack system built with FastAPI, React 18, Supabase PostgreSQL, Gemini 2.0 Flash, 100-pt deterministic matching, and 7 passing test suites."),
        ("Commercial Reality", "Zero live paid transactions to date. A feature-complete software platform is ready, but enterprise commercial distribution and pilot execution remain the key milestones."),
        ("Strongest Wedge", "Compliance-grade material documentation & chain-of-custody for industrial buyers and listed manufacturers (BRSR Core / CPCB EPR)."),
        ("Business Model", "Compliance SaaS Subscription (₹5K–25K/month) + Transaction Facilitation Fee (1.5–2% GMV) + Grade Assurance Verification fees. NOT just a classified listing directory."),
        ("Long-Term Potential", "Credible path to ₹50–100 Cr ARR if execution is disciplined. Scale beyond requires multi-cluster network effects, computer-vision data moats, and export-grade DPP compliance."),
        ("Brutal Verdict", "The software platform is technically robust and architecturally sound. The market tailwinds are unprecedented. The risk is not the software — it is the chicken-and-egg liquidity hurdle, broker inertia, and the team's ability to convert EHS pilot conversations into binding agreements."),
    ]))
    story.append(sp(4))
    story.append(PageBreak())

    # ═══════════════ SECTION 2: WHAT IT IS ══════════════════════
    story += h1("What CircularMatch Actually Is — Latest Tool Architecture", "2")
    story.append(body(
        "CircularMatch is an <b>industrial symbiosis intelligence and trust layer</b> connecting industrial waste generators with verified secondary raw-material buyers. "
        "It converts unstructured manufacturing by-products into structured, audit-ready, standardized material assets. The critical distinctions:"
    ))
    story.append(bullet("<b>What it is NOT:</b> A generic classified listing site like IndiaMART. IndiaMART is a phone directory with zero technical screening, no quality assurance, and a 30–60% buyer gate rejection rate."))
    story.append(bullet("<b>What it IS:</b> An end-to-end qualification and transaction platform: natural language ingestion via Google Gemini 2.0 Flash, 100-point deterministic multi-factor matching, ISO 59040 Digital Material Passports, hard eligibility gating, and governed Scope 3 LCA impact calculation."))
    story.append(sp(3))

    story.append(h2("Implemented Tool Architecture & Modules (Current Live Platform)"))
    story.append(body("The CircularMatch platform comprises 10 production-ready modules verified across backend API and frontend interfaces:"))
    
    modules = [
        ("1. AI Waste Extraction Engine", "Accepts free-form natural language (e.g. <i>'We produce 3 tonnes of clean PET offcuts weekly in Noida'</i>). Uses Google Gemini 2.0 Flash in strict JSON schema mode (temperature=0) to extract material category, quantity, frequency, grade, city, and collection schedule, automatically normalizing volume to kg/week. Includes a zero-downtime deterministic regex rule-based fallback."),
        ("2. 100-Point Deterministic Matching v2", "Evaluates compatibility across 5 mathematically bounded dimensions: Material Category Alignment (35 pts), Quality Grade & Contamination (20 pts), Quantity Compatibility (20 pts), Location & Logistics Proximity (15 pts), and Evidence Completeness (10 pts). Delivers 100% reproducible, explainable score decomposition."),
        ("3. Hard Eligibility Screening Gates", "Pre-screens candidate matches before scoring. Enforces hard operational gates: Material Mismatch (rejected), Logistics Distance Exceeded (blocked), Below Minimum Grade (blocked), and Prohibited Contaminants (blocked). Labels actionable matches as Eligible, Needs Sample, or Missing Evidence."),
        ("4. Digital Material Passport (ISO 59040:2025)", "Tracks batch-specific material lots with unique Lot Codes (e.g. LOT-PET-NOI-001), source type (pre-consumer vs post-consumer), physical form, colour, packaging, storage condition, contamination disclosure (<0.5%), and physical sample availability."),
        ("5. 4-Tier Quality Evidence Hierarchy", "Decouples visual claims from verified proof across 4 strict states: Self-Declared (unverified) → Document Uploaded → Platform Reviewed → Test-Reviewed (NABL lab certified). Prohibits arbitrary badge inflation."),
        ("6. Buyer Acceptance Spec Templates", "Empowers recyclers to define strict technical intake criteria: allowed forms, allowed colours, maximum moisture %, prohibited contaminants (e.g. PVC in PET streams), and minimum evidence thresholds."),
        ("7. Operational 5-Stage Procurement Workflow", "Full interactive deal lifecycle tracking: Sample Request (5 kg trial lot) → Lab Testing & Sample Acceptance → Illustrative Commercial Offer → Logistics Pickup Manifest → Dock Receipt & Quantity Settlement."),
        ("8. Governed Economic & Environmental Calculators", "Calculates delivered logistics haulage (₹1.20 base + ₹0.025/km freight), net recovered revenue, and total economic swing vs disposal fee. Computes avoided Scope 3 Category 5 carbon emissions based on ISO 59020 lifecycle displacement factors."),
        ("9. Interactive Delhi NCR Cartography (Leaflet)", "Visualizes industrial clusters across Noida, Greater Noida, Ghaziabad, Faridabad, Gurugram, Manesar, Sonipat, and Bhiwadi with real-time Haversine distance computations and route lines."),
        ("10. Admin Scoring Rules & Platform Telemetry", "Enables administrators to tune matching dimension weights live via REST API, purge demo data cleanly, inspect audit logs, and monitor cluster-wide diversion metrics."),
    ]
    for m_title, m_desc in modules:
        story.append(Paragraph(f"<b>{m_title}:</b> {m_desc}", sBullet))
    
    story.append(sp(3))
    story.append(h2("Production Technology Stack"))
    stack_data = [
        [Paragraph("Layer", sTH), Paragraph("Technology", sTH), Paragraph("Specification / Version", sTH), Paragraph("Role in System", sTH)],
        [Paragraph("Frontend", sTD), Paragraph("React 18 + TypeScript", sTD), Paragraph("Vite 8.0, React 18.2, TS 5.3", sTD), Paragraph("Responsive client with Mint & Slate Minimax Design System", sTD_small)],
        [Paragraph("Styling & UI", sTD), Paragraph("Tailwind CSS + Framer Motion", sTD), Paragraph("Tailwind 3.4, Framer Motion 11.0", sTD), Paragraph("Utility-first design, micro-animations, glassmorphism cards", sTD_small)],
        [Paragraph("Data & Visuals", sTD), Paragraph("Recharts + Leaflet", sTD), Paragraph("Recharts 2.12, Leaflet 1.9.4", sTD), Paragraph("100-pt score decomposition rings and Delhi NCR map routing", sTD_small)],
        [Paragraph("Backend Framework", sTD), Paragraph("FastAPI (Python)", sTD), Paragraph("FastAPI 0.110, Python 3.12 / 3.14", sTD), Paragraph("Asynchronous REST API, OpenAPI docs, sub-millisecond JSON", sTD_small)],
        [Paragraph("Data Validation", sTD), Paragraph("Pydantic v2", sTD), Paragraph("Pydantic 2.6.0", sTD), Paragraph("Strict contract validation, DTO serialization, type safety", sTD_small)],
        [Paragraph("AI Parsing", sTD_green), Paragraph("Google Gemini 2.0 Flash", sTD_green), Paragraph("generativelanguage.googleapis.com", sTD_green), Paragraph("Structured JSON extraction from natural text at temperature=0", sTD_small)],
        [Paragraph("Database (Prod)", sTD), Paragraph("Supabase PostgreSQL", sTD), Paragraph("PostgreSQL 15.1 + Row Level Security", sTD), Paragraph("12 relational tables, foreign keys, secure RBAC policies", sTD_small)],
        [Paragraph("Persistence (Demo)", sTD), Paragraph("In-Memory DemoStore", sTD), Paragraph("Thread-safe Python repository", sTD), Paragraph("Pre-seeded Delhi NCR data for zero-credential instant testing", sTD_small)],
        [Paragraph("Automated Testing", sTD_green), Paragraph("pytest + Vitest", sTD_green), Paragraph("pytest 8.4.2 (7 suites / 20 tests)", sTD_green), Paragraph("100% passing test suites for matching, API, and extraction", sTD_small)],
    ]
    story.append(table(stack_data, [28*mm, 42*mm, 42*mm, page_w - 112*mm]))
    story.append(PageBreak())

    # ═══════════════ SECTION 3: THE PROBLEM ════════════════════
    story += h1("The Exact Problem Being Solved", "3")
    story.append(h3("The Real Problem: Qualification, Not Just Discovery"))
    story.append(body("<b>The pitch version:</b> 'Factories have waste and can't find buyers.'"))
    story.append(body(
        "<b>The real problem:</b> Industrial secondary material markets fail because information quality is catastrophically low on both sides. "
        "The gap is not discovery — it is <b>technical qualification, specification matching, and compliance documentation.</b>"
    ))
    story.append(sp(3))
    prob_data = [
        [Paragraph("Supply Side Problems", sTH), Paragraph("Demand Side Problems", sTH)],
        [Paragraph("Generic listing: 'PET scrap, ~2T/month, Noida' — missing polymer grade, colour, contamination, form factor, lab results", sTD),
         Paragraph("Need PET ≥95% purity, max 3% contamination — but buyers have no pre-qualification system", sTD)],
        [Paragraph("Broker pays below-market rate (10–25% discount) with no transparent benchmark", sTD),
         Paragraph("Reject 30–60% of new supplier material at gate — sunk logistics cost on every rejection", sTD)],
        [Paragraph("BRSR auditors rejecting informal disposal certificates — penalty exposure rising", sTD),
         Paragraph("EPR credit chains need documented proof of recycling — poorly supplied today", sTD)],
        [Paragraph("No digital chain-of-custody; payment delays 7–30 days", sTD),
         Paragraph("Supply uncertainty forces overcapacity buffer; repeat supplier relationships are locked", sTD)],
    ]
    story.append(table(prob_data, [page_w/2 - 2*mm, page_w/2 - 2*mm]))
    story.append(sp(3))
    story.append(callout(
        "[Verified fact] CPCB's zero-tolerance stance on data fraud in EPR chains and BRSR auditors' scrutiny of "
        "'chain of custody' documentation means companies are increasingly exposed if they cannot prove material provenance. "
        "(Source: nationalrecycling.in, cerclex.com, SEBI March 2025 circular)"
    ))
    story.append(sp(3))
    story.append(h3("The 5 Core Industrial Material Streams Supported"))
    story.append(body("CircularMatch targets high-volume, non-hazardous industrial secondary flows across Northern India:"))
    mat_streams = [
        ("1. Industrial PET Plastic (Flakes, Sprues, Regrind)", "Generated by injection moulders in Noida/Greater Noida. Absorbed by bottle-to-bottle recyclers and polyester fibre mills in Ghaziabad/Manesar. Benchmark: ₹14–18/kg scrap value vs ₹20,800/wk disposal liability."),
        ("2. Cotton Textile Cutting Offcuts (Knit & Woven)", "Generated by export garment factories in Noida/Gurugram. Absorbed by open-end yarn spinning mills in Panipat. Diverts virgin cotton demand."),
        ("3. Corrugated Kraft Cardboard Offcuts", "Generated by packaging converters and FMCG plants in Faridabad/Ghaziabad. Absorbed by duplex board and paper re-pulping mills."),
        ("4. Mild Steel Fabrication Scrap (Offcuts & Punching)", "Generated by auto-ancillary CNC stamping in Manesar/Faridabad. Absorbed by induction furnaces and secondary re-rolling mills."),
        ("5. Industrial HDPE Polymers (Blow Moulding Scrap)", "Generated by chemical packaging units. Absorbed by pipe extrusion and drainage conduit manufacturers."),
    ]
    for ms_title, ms_desc in mat_streams:
        story.append(Paragraph(f"• <b>{ms_title}:</b> {ms_desc}", sBullet))
    story.append(PageBreak())

    # ═══════════════ SECTION 4: CUSTOMERS ══════════════════════
    story += h1("Customer Analysis — Three Segments", "4")

    story.append(h2("4A — Supply-Side Customer: The EHS/Operations Manager"))
    story.append(body(
        "A mid-to-large manufacturing facility EHS or Operations Manager in Noida/Greater Noida — garment exporter, food-grade PET manufacturer, "
        "or cardboard packaging manufacturer — generating 500 kg to 20 tonnes/month of recurring industrial scrap, "
        "required to file BRSR waste intensity disclosures or EPR documentation."
    ))
    story.append(h3("Current Workflow (Mapped)"))
    workflow = [
        "Scrap accumulates in a designated area (space cost, fire risk, compliance risk)",
        "EHS manager contacts known broker/kabadiwala by phone or WhatsApp",
        "Broker arrives, offers a price ('depends on market today')",
        "Material is weighed on the broker's scale (supplier has no independent check)",
        "Payment may be delayed, partial, or in cash (documentation difficulty)",
        "CPCB/SPCB documentation often missing or informal",
        "BRSR disclosure requires proof of recycling — difficult to produce without a digital trail",
    ]
    for i, w in enumerate(workflow):
        story.append(Paragraph(f"<b>Step {i+1}:</b> {w}", sBullet))
    story.append(h3("Pain Points Quantified"))
    story.append(bullet("Average settlement delay: 7–30 days (cash flow impact on working capital)"))
    story.append(bullet("Price opacity: Suppliers receive 10–25% below fair market value from brokers"))
    story.append(bullet("Documentation gap: BRSR auditors now rejecting informal disposal certificates"))
    story.append(bullet("[Verified] SEBI BRSR Core mandates third-party verification for top 1,000 listed entities — waste chain-of-custody is a named KPI"))
    story.append(bullet("Willingness to pay: MODERATE for marketplace, HIGH for compliance documentation"))
    story.append(sp(4))

    story.append(h2("4B — Demand-Side Customer: The Recycler/Procurement Manager"))
    story.append(body(
        "Procurement head at a PET recycler, operations manager at a paper/cardboard mill using secondary fiber, "
        "or sustainability/procurement hybrid at a brand owner (Unilever, Marico, Reliance) building EPR credit supply chains."
    ))
    story.append(bullet("Material rejection rate at gate: 30–60% for new suppliers (industry estimates from recycling publications)"))
    story.append(bullet("Cost of one rejected shipment: logistics + time + lost production slot"))
    story.append(bullet("Supply uncertainty forces overcapacity buffer planning"))
    story.append(bullet("Willingness to pay: HIGH for verified, pre-qualified supply; LOW for another listing directory"))
    story.append(sp(4))

    story.append(h2("4C — The Hidden Customer: Corporate EHS/Sustainability Teams (THE WEDGE)"))
    story.append(body(
        "EHS/Sustainability Manager at a top-1,000 listed company, responsible for BRSR Core disclosures (mandatory as of FY 2024-25) "
        "and EPR plastic waste compliance. <b>This is the customer CircularMatch should acquire first.</b>"
    ))
    story.append(callout(
        "[Verified fact] SEBI mandates BRSR Core KPI verification including 'embracing circularity' metrics for top 1,000 listed entities. "
        "Third-party assurance now required. Auditors specifically look at waste intensity and chain-of-custody. "
        "(Source: SEBI BRSR circular, March 2025)"
    ))
    story.append(body(
        "These customers have a regulatory mandate, a financial penalty exposure, and a board-level visibility problem. "
        "They will pay for compliance infrastructure. This is the entry point."
    ))
    story.append(PageBreak())

    # ═══════════════ SECTION 5: MARKET SIZE ════════════════════
    story += h1("Market Size: TAM / SAM / SOM", "5")
    story.append(body(
        "The Indian waste management market total (~$14.5B) is mostly municipal solid waste, collection logistics, and landfill operations. "
        "CircularMatch's real addressable market is the <b>formal industrial secondary-material trading and documentation layer</b> — a sub-segment."
    ))
    story.append(sp(3))
    market_data = [
        [Paragraph("Market Level", sTH), Paragraph("Size (GMV)", sTH), Paragraph("Platform Revenue Potential", sTH), Paragraph("Notes", sTH)],
        [Paragraph("TAM — India Total", sTD_green), Paragraph("₹80,000–1,20,000 Cr GMV", sTD), Paragraph("₹800–2,400 Cr at 1–2% take", sTD),
         Paragraph("Plastic, paper, metal, textile industrial secondary flows combined", sTD_small)],
        [Paragraph("SAM — NCR Clusters, Non-Hazardous", sTD_green), Paragraph("₹3,000–10,000 Cr GMV", sTD), Paragraph("₹45–150 Cr at 1.5%", sTD),
         Paragraph("~2,500 facilities in Noida-Greater Noida corridor; PET, cotton, cardboard, mild steel", sTD_small)],
        [Paragraph("SOM — Year 1–2 Initial", sTD_green), Paragraph("₹1–7.5 Cr/month GMV", sTD), Paragraph("₹18–135 lakh ARR", sTD),
         Paragraph("50–100 active suppliers, 30–50 buyers, 50–150 transactions/month", sTD_small)],
    ]
    story.append(table(market_data, [35*mm, 40*mm, 45*mm, page_w - 120*mm]))
    story.append(sp(4))

    story.append(h2("Growth Drivers (Evidence-Based)"))
    drivers = [
        ("<b>EPR Recycled Content Mandates Expanding:</b> 30% rigid plastic recycled content by FY25-26, rising to 60% by FY28-29. "
         "83,000+ producers registered. [Verified — CPCB EPR portal, PWM Rules 2022/2025]"),
        ("<b>BRSR Core Mandatory Phased Rollout:</b> Top 150 (FY23-24) → 250 (FY24-25) → 500 (FY25-26) → 1,000 (FY26-27). "
         "Waste intensity and chain-of-custody require third-party verification. [Verified — SEBI circular March 2025]"),
        ("<b>Recykal Precedent:</b> Reached ₹1,498 Cr gross revenue FY26, 53% YoY growth — proving a large-scale digital waste marketplace works in India. [Company-reported, June 2026]"),
        ("<b>EU Digital Product Passport (DPP):</b> EU Battery Regulation mandates DPPs from February 18, 2027 — Indian exporters need supply chain documentation to comply. [Verified — europa.eu]"),
        ("<b>WCEF 2026 Timing Window:</b> World Circular Economy Forum (10th edition) happening September 15–18, 2026 in Gandhinagar — first time in South Asia. 3,600+ stakeholders from 60+ countries. India's circular economy at peak global attention. [Verified — wcef2026.com]"),
    ]
    for d in drivers:
        story.append(bullet(d))
    story.append(PageBreak())

    # ═══════════════ SECTION 6: REGULATORY ════════════════════
    story += h1("Regulatory Environment", "6")
    story.append(h2("Regulations That HELP CircularMatch"))
    reg_help = [
        [Paragraph("Regulation", sTH), Paragraph("What It Mandates", sTH), Paragraph("CircularMatch Opportunity", sTH), Paragraph("Status", sTH)],
        [Paragraph("EPR — Plastic Waste Mgmt Rules 2022+", sTD), Paragraph("PIBOs must meet recycled content targets: 30% rigid FY25-26, 60% by FY28-29. CPCB EPR portal requires traceable certificates.", sTD),
         Paragraph("Become documentation & matching layer between EPR-obligated brands and registered recyclers", sTD), Paragraph("ACTIVE — phased targets in force", sTD_green)],
        [Paragraph("BRSR Core — SEBI", sTD), Paragraph("Phased rollout to top 1,000 listed companies. Third-party assurance for waste intensity KPIs. Audit-ready chain-of-custody documentation required.", sTD),
         Paragraph("Provide audit-ready material flow documentation and compliance SaaS for corporate clients", sTD), Paragraph("ACTIVE — top 500 from FY25-26", sTD_green)],
        [Paragraph("EU ESPR / Digital Product Passports", sTD), Paragraph("EU Battery DPP from Feb 18, 2027. Indian exporters need material traceability in JSON-LD / GS1 Digital Link QR formats.", sTD),
         Paragraph("Export market documentation for Indian manufacturers selling to EU buyers — future premium tier", sTD), Paragraph("UPCOMING — Feb 2027", sTD)],
        [Paragraph("National Circular Economy Framework (2025 draft)", sTD), Paragraph("Government push for industrial symbiosis and waste exchange infrastructure.", sTD),
         Paragraph("Align with government initiatives; potential for grant funding or public-private partnership", sTD), Paragraph("DRAFT — 2025", sTD)],
    ]
    story.append(table(reg_help, [40*mm, 55*mm, 50*mm, 25*mm]))
    story.append(sp(4))
    story.append(h2("Regulations That CREATE RISK"))
    reg_risk = [
        [Paragraph("Risk Area", sTH), Paragraph("Detail", sTH), Paragraph("Mitigation", sTH)],
        [Paragraph("Hazardous Waste Classification", sTD_red), Paragraph("Certain industrial wastes are 'hazardous' under HWM Rules 2016. If a listed material is mislabeled, platform faces liability.", sTD),
         Paragraph("Strict initial material scope (non-hazardous only); clear disclaimers; legal review", sTD)],
        [Paragraph("Marketplace Intermediary Liability — IT Rules 2021", sTD_red), Paragraph("False quality claims on platform may expose CircularMatch to liability for buyer losses.", sTD),
         Paragraph("Evidence state system; dispute resolution framework; clear ToS", sTD)],
        [Paragraph("Payment Handling — RBI", sTD_red), Paragraph("Any escrow or payment holding may require RBI payment aggregator licensing.", sTD),
         Paragraph("Partner with Razorpay/PayU; never hold funds directly", sTD)],
        [Paragraph("DPDP Act 2023", sTD_red), Paragraph("Full enforcement by May 13, 2027. Data collection, consent, breach reporting obligations.", sTD),
         Paragraph("Begin consent architecture mapping now; implement 'Privacy by Overlay' framework", sTD)],
    ]
    story.append(table(reg_risk, [45*mm, 65*mm, page_w - 110*mm]))
    story.append(PageBreak())

    # ═══════════════ SECTION 7: COMPETITIVE ════════════════════
    story += h1("Competitive Landscape", "7")
    story.append(warning(
        "CRITICAL (Post-Reverification): Recykal is MORE dangerous than originally assessed. "
        "They are actively building AI-powered quality grading, demand-supply mapping, Grade Assurance Guarantees, "
        "Smart Listing Builder, and Compliance AI features. The qualification gap CircularMatch intended to exploit is NARROWING. "
        "The window is 6–9 months, not 12–18."
    ))
    story.append(sp(3))
    comp_data = [
        [Paragraph("Company", sTH), Paragraph("Scale / Strength", sTH), Paragraph("Core Gap", sTH), Paragraph("Threat Level", sTH)],
        [Paragraph("Recykal", sTD_red), Paragraph("₹1,498 Cr GMV FY26 (+53% YoY), $23M raised June 2026, CPCB-integrated, enterprise clients, now building AI quality grading & Grade Assurance Guarantees", sTD),
         Paragraph("Origin is EPR/post-consumer plastic — industrial B2B manufacturing scrap (cotton, cardboard, multi-material) BRSR documentation is secondary to core", sTD),
         Paragraph("🔴 CRITICAL — window closing", sTD_red)],
        [Paragraph("IndiaMART", sTD), Paragraph("200,000+ scrap listings. Massive liquidity, brand recognition. Every supplier lists here.", sTD),
         Paragraph("Zero quality control. Listings are self-declared. No matching logic. 30–60% buyer rejection rate.", sTD),
         Paragraph("🟡 Incumbent everyone uses but nobody trusts", sTD)],
        [Paragraph("MetalMandi (Attero)", sTD), Paragraph("2L+ downloads, 1.1L registered users, 50K MAU, 15,000 MT/month, AI quality inspection, $24M+ funding", sTD),
         Paragraph("Focused on metals/e-waste. Primarily serves as Attero's procurement channel, not open marketplace.", sTD),
         Paragraph("🟡 Analogy, not direct threat", sTD)],
        [Paragraph("Metalbook", sTD), Paragraph("₹1,327 Cr revenue FY25, $24M+ funding, Tata Steel/JSW clients, full-stack metals procurement", sTD),
         Paragraph("Not a waste/secondary material platform. Metals only.", sTD),
         Paragraph("🟢 Not a direct threat", sTD_green)],
        [Paragraph("Brokers/Kabadiwalas", sTD_red), Paragraph("Speed, trust, relationships, cash payment, logistics handling, zero friction", sTD),
         Paragraph("Zero documentation. Cannot produce audit-ready BRSR certificates. Liability for listed companies.", sTD),
         Paragraph("🔴 Real daily competition", sTD_red)],
        [Paragraph("WhatsApp + Scrapo + CII Waste Exchange", sTD), Paragraph("CII has govt backing but manual process. Scrapo is global listing only. WhatsApp is used for everything.", sTD),
         Paragraph("All lack: structured data, evidence verification, matching logic, compliance exports", sTD),
         Paragraph("🟡 Fragmented", sTD)],
    ]
    story.append(table(comp_data, [28*mm, 58*mm, 55*mm, 29*mm]))
    story.append(sp(4))
    story.append(h2("Where CircularMatch Wins (Product Differentiators in Current Build)"))
    wins = [
        "Structured material records via Gemini 2.0 Flash vs. unstructured IndiaMART listings",
        "Deterministic 100-Point Matching Engine with mathematical score decomposition vs. black-box opaque percentages",
        "Hard Eligibility Screening (prohibited contaminants, distance buffers) before ranking vs. unqualified listings",
        "Evidence State Tracking (Self-Declared → Document Uploaded → Reviewed → Test-Reviewed) vs. unverified claims",
        "Digital Material Passport (ISO 59040:2025) with lot codes & chain-of-custody vs. no provenance tracking",
        "Delivered Freight Economics & ISO 59020 Scope 3 LCA Carbon Disclosures vs. zero environmental accounting",
    ]
    for w in wins:
        story.append(bullet(f"✅ {w}"))
    story.append(PageBreak())

    # ═══════════════ SECTION 8: WEDGE & BUSINESS MODEL ════════
    story += h1("Best Initial Wedge & Business Model", "8")
    story.append(h2("Recommended Wedge: Managed Marketplace + Compliance Documentation"))
    story.append(body(
        "The single most important strategic insight: do not launch a marketplace. Launch as a <b>managed service</b> "
        "with compliance documentation as the hook. The EHS manager at a listed company will engage CircularMatch "
        "not because they want 'better scrap prices' but because they need audit documentation."
    ))
    story.append(h3("The Wedge in Practice (5 Steps)"))
    steps = [
        "Sign up 5 EHS managers at listed manufacturing companies in Noida — offer a free 3-month pilot",
        "Offer: 'We document all your industrial scrap disposals with full BRSR-ready chain-of-custody — ₹X/month'",
        "Actively find verified recycler partners for their specific material streams",
        "First transactions happen; CircularMatch earns commission",
        "Recyclers join as buyers; supplier network multiplies; marketplace grows organically",
    ]
    for i, s in enumerate(steps):
        story.append(Paragraph(f"<b>Step {i+1}:</b> {s}", sBullet))
    story.append(sp(4))

    story.append(h2("Business Model Analysis"))
    bm_data = [
        [Paragraph("Model", sTH), Paragraph("Pricing", sTH), Paragraph("WTP", sTH), Paragraph("Gross Margin", sTH), Paragraph("Priority", sTH)],
        [Paragraph("Compliance Documentation SaaS", sTD_green), Paragraph("₹5K–25K/month per company", sTD),
         Paragraph("HIGH — regulatory mandate", sTD_green), Paragraph("85%+", sTD_green), Paragraph("🥇 Year 1 Priority", sTD_green)],
        [Paragraph("Transaction Commission", sTD), Paragraph("1.5–2% of GMV", sTD),
         Paragraph("MEDIUM", sTD), Paragraph("60–70%", sTD), Paragraph("🥈 Year 1 Additive", sTD)],
        [Paragraph("Enterprise EPR/BRSR SaaS", sTD), Paragraph("₹1–5 lakh/year per company", sTD),
         Paragraph("HIGH — non-optional", sTD_green), Paragraph("80–85%", sTD_green), Paragraph("🥉 Year 2+", sTD)],
        [Paragraph("Verification Fee", sTD), Paragraph("₹500–5K per listing", sTD),
         Paragraph("MEDIUM", sTD), Paragraph("50–65%", sTD), Paragraph("Upsell", sTD)],
        [Paragraph("Buyer Subscription (Enterprise)", sTD), Paragraph("₹2K–10K/month", sTD),
         Paragraph("MEDIUM-LOW (SME), HIGH (Enterprise)", sTD), Paragraph("75%+", sTD), Paragraph("Enterprise Tier Only", sTD)],
        [Paragraph("Supplier Listing Fee", sTD_red), Paragraph("₹500–2K/month", sTD),
         Paragraph("LOW — suppliers don't pay to sell", sTD_red), Paragraph("N/A", sTD), Paragraph("❌ Do Not Lead With", sTD_red)],
    ]
    story.append(table(bm_data, [45*mm, 30*mm, 38*mm, 25*mm, 32*mm]))
    story.append(PageBreak())

    # ═══════════════ SECTION 9: UNIT ECONOMICS ══════════════════
    story += h1("Unit Economics — Three Scenarios", "9")
    story.append(note("These are directional planning scenarios, not forecasts. Assumes active founder-led sales with no major competitive displacement."))
    story.append(sp(3))

    scen_data = [
        [Paragraph("Metric", sTH), Paragraph("Conservative Y1", sTH), Paragraph("Base Y1", sTH), Paragraph("Aggressive Y1", sTH),
         Paragraph("Base Y2", sTH), Paragraph("Base Y3", sTH)],
        [Paragraph("Active Suppliers", sTD), Paragraph("15", sTD), Paragraph("25", sTD), Paragraph("60", sTD), Paragraph("100", sTD), Paragraph("300", sTD)],
        [Paragraph("Active Buyers", sTD), Paragraph("10", sTD), Paragraph("15", sTD), Paragraph("35", sTD), Paragraph("60", sTD), Paragraph("150", sTD)],
        [Paragraph("Monthly Transactions", sTD), Paragraph("8", sTD), Paragraph("20", sTD), Paragraph("50", sTD), Paragraph("100", sTD), Paragraph("350", sTD)],
        [Paragraph("Avg Transaction GMV", sTD), Paragraph("₹2L", sTD), Paragraph("₹2.5L", sTD), Paragraph("₹3L", sTD), Paragraph("₹3L", sTD), Paragraph("₹3.5L", sTD)],
        [Paragraph("Transaction Revenue/mo", sTD), Paragraph("₹24K", sTD), Paragraph("₹75K", sTD), Paragraph("₹2.25L", sTD), Paragraph("₹6L", sTD), Paragraph("₹24.5L", sTD)],
        [Paragraph("Compliance SaaS Revenue/mo", sTD), Paragraph("₹2L", sTD), Paragraph("₹5L", sTD), Paragraph("₹10L", sTD), Paragraph("₹20L", sTD), Paragraph("₹60L", sTD)],
        [Paragraph("Total Monthly Revenue", sTD_green), Paragraph("₹2.24L", sTD_green), Paragraph("₹5.75L", sTD_green), Paragraph("₹12.25L", sTD_green), Paragraph("₹26L", sTD_green), Paragraph("₹84.5L", sTD_green)],
        [Paragraph("ARR", sTD_green), Paragraph("₹27L", sTD_green), Paragraph("₹69L", sTD_green), Paragraph("₹1.47Cr", sTD_green), Paragraph("₹3.12Cr", sTD_green), Paragraph("₹10.14Cr", sTD_green)],
    ]
    story.append(table(scen_data, [38*mm, 24*mm, 24*mm, 24*mm, 24*mm, 24*mm]))
    story.append(sp(4))
    story.append(h2("Key Unit Economics (Base Case)"))
    ue_data = [
        [Paragraph("Metric", sTH), Paragraph("Estimate", sTH)],
        [Paragraph("CAC (Founder-led sales)", sTD), Paragraph("₹5,000–15,000 per customer", sTD)],
        [Paragraph("ARPU — Supplier SaaS", sTD), Paragraph("₹6,000–15,000/month", sTD)],
        [Paragraph("ARPU — Enterprise Annual", sTD), Paragraph("₹1–5 lakh/year", sTD)],
        [Paragraph("Gross Margin — SaaS Revenue", sTD_green), Paragraph("80–85%", sTD_green)],
        [Paragraph("Gross Margin — Transaction", sTD), Paragraph("60–70% (after ops costs)", sTD)],
        [Paragraph("SaaS Payback Period", sTD_green), Paragraph("1–3 months", sTD_green)],
        [Paragraph("SME Sales Cycle", sTD), Paragraph("2–6 weeks", sTD)],
        [Paragraph("Enterprise Sales Cycle", sTD), Paragraph("3–9 months", sTD)],
        [Paragraph("LTV/CAC (Base)", sTD_green), Paragraph("9–11x", sTD_green)],
    ]
    story.append(table(ue_data, [80*mm, page_w - 80*mm]))
    story.append(PageBreak())

    # ═══════════════ SECTION 10: SCALE MILESTONES ══════════════
    story += h1("$1M / $10M / $100M ARR Scenarios", "10")

    story.append(h2("Path to $1M ARR (≈ ₹8.3 Crore)"))
    story.append(body("<b>Realistic timeline: Year 3–4</b> under base scenario."))
    story.append(body("Requires: 120+ paying SaaS customers (₹6–10K/month) + 400+ transactions/month at ₹3L avg GMV at 2% + first 2–3 large enterprise contracts."))
    story.append(bullet("What must be true: Real, recurring transactions from Month 6 onward"))
    story.append(bullet("3–5 enterprise clients by Month 18"))
    story.append(bullet("Geographic expansion to 2nd cluster by Month 24"))
    story.append(sp(3))

    story.append(h2("Path to $10M ARR (≈ ₹83 Crore)"))
    story.append(body("<b>Realistic timeline: Year 5–7</b> under base scenario."))
    story.append(bullet("National platform presence (5–8 industrial clusters)"))
    story.append(bullet("500–1,000+ active supplier accounts and 200+ buyer accounts including enterprise"))
    story.append(bullet("2,000–5,000 transactions/month at ₹3–5L avg GMV"))
    story.append(bullet("Enterprise contracts contributing ₹20–30 crore"))
    story.append(bullet("EPR chain management products live"))
    story.append(bullet("Requires: Recykal does NOT replicate the B2B qualification layer; national regulatory tightening continues; Series A closed"))
    story.append(sp(3))

    story.append(h2("Path to $100M ARR (≈ ₹830 Crore) — Category-Defining"))
    story.append(body("This requires CircularMatch to become infrastructure, not just a platform."))
    story.append(bullet("India: ₹300–400 crore ARR (dominant national position)"))
    story.append(bullet("International: Vietnam/Bangladesh (textile), Middle East (construction waste), Europe (ESPR-aligned DPP infrastructure)"))
    story.append(bullet("Financial products: Supply chain financing for SME suppliers (₹50–100 crore revenue potential)"))
    story.append(bullet("Data products: Pricing indices, material intelligence sold to commodity traders, banks, insurers"))
    story.append(bullet("API revenue: ERP integrations with SAP, Oracle, Tally for enterprise waste management"))
    story.append(bullet("Timeline: Year 8–12 under aggressive scenario. Not guaranteed."))
    story.append(sp(3))

    story.append(h2("Billion-Dollar Company Test"))
    billion_data = [
        [Paragraph("Factor Required", sTH), Paragraph("Probability", sTH), Paragraph("Risk Level", sTH)],
        [Paragraph("India dominance (30–40% market share in formal industrial secondary flows)", sTD), Paragraph("Medium — Recykal competition", sTD), Paragraph("HIGH", sTD_red)],
        [Paragraph("International scale (SE Asia + Middle East)", sTD), Paragraph("Low (before India PMF)", sTD), Paragraph("HIGH", sTD_red)],
        [Paragraph("Data moat (pricing intelligence, risk scoring)", sTD), Paragraph("Medium if transactions scale", sTD), Paragraph("MEDIUM", sTD)],
        [Paragraph("Financial products (supply chain lending, insurance)", sTD), Paragraph("Requires regulatory license", sTD), Paragraph("MEDIUM", sTD)],
        [Paragraph("Enterprise stickiness (ERP integrations)", sTD), Paragraph("Achievable if BRSR/EPR embedded", sTD), Paragraph("MEDIUM", sTD)],
        [Paragraph("Network effects (data flywheel matures)", sTD), Paragraph("Not automatic in B2B markets", sTD), Paragraph("HIGH", sTD_red)],
    ]
    story.append(table(billion_data, [95*mm, 45*mm, 30*mm]))
    story.append(PageBreak())

    # ═══════════════ SECTION 11: GTM & ROADMAP ══════════════════
    story += h1("GTM Strategy & Product Roadmap (V1 Live to V5)", "11")
    story.append(h2("Go-to-Market — 4 Phases"))
    gtm_data = [
        [Paragraph("Phase", sTH), Paragraph("Timeline", sTH), Paragraph("Action", sTH), Paragraph("Goal", sTH)],
        [Paragraph("Phase 1: Curated Supply", sTD_green), Paragraph("Month 1–3", sTD),
         Paragraph("Founders personally identify 8–12 manufacturing companies in Noida/Greater Noida with recurring non-hazardous scrap. Target EHS managers at BRSR-obligated listed companies. Offer free 3-month compliance documentation pilot.", sTD),
         Paragraph("8–12 real material listings with evidence attached", sTD)],
        [Paragraph("Phase 2: Targeted Buyer Recruitment", sTD), Paragraph("Month 2–4", sTD),
         Paragraph("Identify 5–8 registered recyclers/processors in NCR for the specific material categories. Offer access to pre-qualified supply with documentation — no fee initially.", sTD),
         Paragraph("3–5 real sample requests; 1–2 real transactions", sTD)],
        [Paragraph("Phase 3: First Transactions", sTD), Paragraph("Month 3–6", sTD),
         Paragraph("Act as active deal facilitators. Draft offers, coordinate logistics partners, ensure documentation is correct. Earn transaction commission on successful completions.", sTD),
         Paragraph("5–10 completed transactions with full documentation trail", sTD)],
        [Paragraph("Phase 4: Platform Transition", sTD), Paragraph("Month 6–12", sTD),
         Paragraph("Move repeat transactions to self-service platform flows. Charge compliance SaaS fee. Begin charging transaction commission. Recruit second cohort.", sTD),
         Paragraph("₹5L+ MRR, pre-seed funding closed", sTD)],
    ]
    story.append(table(gtm_data, [30*mm, 22*mm, 80*mm, 38*mm]))
    story.append(sp(4))

    story.append(h2("Updated Product Roadmap (V1 Live to V5)"))
    roadmap_data = [
        [Paragraph("Version", sTH), Paragraph("Stage", sTH), Paragraph("Key Features & Deliverables", sTH), Paragraph("Status", sTH)],
        [Paragraph("V1 — Trusted Pilot Core", sTD_green), Paragraph("Current Software Build", sTD_green),
         Paragraph("Full-stack FastAPI + React 18, Gemini 2.0 Flash AI extraction, 100-pt deterministic matching v2, ISO 59040 Material Passport with 4-tier evidence states, Buyer Acceptance Spec templates, 5-stage procurement demo transaction workflow, delivered freight calculator, Leaflet Delhi NCR routing, Admin scoring rules editor, 7 passing pytest test suites.", sTD),
         Paragraph("✅ LIVE & VERIFIED", sTD_green)],
        [Paragraph("V2 — Commercial Pilot", sTD_green), Paragraph("Month 1–4", sTD),
         Paragraph("Live enterprise pilot onboarding (25 generators in Greater Noida / Ghaziabad), Supabase Auth with SMS OTP for plant managers, S3 storage for lab PDF uploads, Google Maps Distance Matrix API, SEBI BRSR / CPCB EPR certificate export.", sTD),
         Paragraph("🎯 NEXT MILESTONE", sTD_green)],
        [Paragraph("V3 — AI Vision & Quality", sTD), Paragraph("Month 5–12", sTD),
         Paragraph("Roboflow / YOLOv8 computer vision photo contamination grading, Document AI OCR for weighbridge slips, reverse bidding RFQ engine, automated supplier reliability scoring, WhatsApp alerts.", sTD),
         Paragraph("PLANNED", sTD)],
        [Paragraph("V4 — Regional Expansion", sTD), Paragraph("Year 2", sTD),
         Paragraph("Western India industrial corridors (Ahmedabad, Vadodara, Pune), multi-cluster logistics partners, Tally Prime / SAP Business One ERP connectors, mobile manifest scanner.", sTD),
         Paragraph("ROADMAP", sTD)],
        [Paragraph("V5 — National & Global", sTD), Paragraph("Year 3+", sTD),
         Paragraph("EU Digital Product Passport (JSON-LD, GS1 Digital Link QR), commodity secondary pricing indices, supply chain invoice financing for SME generators.", sTD),
         Paragraph("VISION", sTD)],
    ]
    story.append(table(roadmap_data, [26*mm, 26*mm, 88*mm, 34*mm]))
    story.append(PageBreak())

    # ═══════════════ SECTION 12: RISK REGISTRY ══════════════════
    story += h1("Risk Registry — 20 Ways CircularMatch Fails", "12")
    risk_data = [
        [Paragraph("#", sTH), Paragraph("Risk", sTH), Paragraph("Probability", sTH), Paragraph("Impact", sTH), Paragraph("Mitigation", sTH)],
        [Paragraph("1", sTD), Paragraph("No liquidity — can't get both sides", sTD), Paragraph("HIGH", sTD_red), Paragraph("FATAL", sTD_red), Paragraph("Managed marketplace; manual curation first", sTD)],
        [Paragraph("2", sTD), Paragraph("Suppliers prefer brokers (speed/cash)", sTD), Paragraph("HIGH", sTD_red), Paragraph("HIGH", sTD_red), Paragraph("Offer faster payment + better documentation value", sTD)],
        [Paragraph("3", sTD), Paragraph("Buyers don't trust platform quality claims", sTD), Paragraph("HIGH", sTD_red), Paragraph("HIGH", sTD_red), Paragraph("Verification protocol + evidence state system", sTD)],
        [Paragraph("4", sTD), Paragraph("Low transaction frequency (monthly, not daily)", sTD), Paragraph("HIGH", sTD_red), Paragraph("HIGH", sTD_red), Paragraph("Expand material categories; add compliance SaaS as sticky MRR", sTD)],
        [Paragraph("5", sTD), Paragraph("Recykal builds qualification layer", sTD), Paragraph("MEDIUM", sTD), Paragraph("HIGH", sTD_red), Paragraph("Move faster; focus on enterprise BRSR documentation niche", sTD)],
        [Paragraph("6", sTD), Paragraph("Long enterprise sales cycle kills runway", sTD), Paragraph("MEDIUM", sTD), Paragraph("HIGH", sTD_red), Paragraph("Start with SME; enterprise is an upsell after GMV", sTD)],
        [Paragraph("7", sTD), Paragraph("Material misrepresentation liability", sTD), Paragraph("MEDIUM", sTD), Paragraph("HIGH", sTD_red), Paragraph("Evidence state system; clear terms; insurance review", sTD)],
        [Paragraph("8", sTD), Paragraph("Broker network blocks supplier access", sTD), Paragraph("MEDIUM", sTD), Paragraph("HIGH", sTD_red), Paragraph("Target listed companies with BRSR — brokers irrelevant to them", sTD)],
        [Paragraph("9", sTD), Paragraph("Team burnout (founder-led sales exhaustion)", sTD), Paragraph("HIGH", sTD_red), Paragraph("HIGH", sTD_red), Paragraph("Hire first sales/ops person early; structure founder time", sTD)],
        [Paragraph("10", sTD), Paragraph("Quality disputes after transaction", sTD), Paragraph("MEDIUM", sTD), Paragraph("MEDIUM", sTD), Paragraph("Dispute resolution policy; photography + documentation trail", sTD)],
        [Paragraph("11", sTD), Paragraph("Informal market undercuts on price", sTD), Paragraph("HIGH", sTD_red), Paragraph("MEDIUM", sTD), Paragraph("Win on documentation and compliance value, not price war", sTD)],
        [Paragraph("12", sTD), Paragraph("Fake recycling certificates from 'buyers'", sTD), Paragraph("MEDIUM", sTD), Paragraph("HIGH", sTD_red), Paragraph("Only work with CPCB-registered recyclers; verify registration", sTD)],
        [Paragraph("13", sTD), Paragraph("Logistics failures derail transactions", sTD), Paragraph("MEDIUM", sTD), Paragraph("HIGH", sTD_red), Paragraph("Partner with logistics providers; don't own logistics", sTD)],
        [Paragraph("14", sTD), Paragraph("Geographic concentration — Delhi NCR disruption", sTD), Paragraph("LOW", sTD), Paragraph("HIGH", sTD_red), Paragraph("Diversify to 2nd cluster by Month 18", sTD)],
        [Paragraph("15", sTD), Paragraph("Data privacy breach (enterprise data)", sTD), Paragraph("LOW", sTD), Paragraph("HIGH", sTD_red), Paragraph("Security-first architecture; DPDP Act compliance roadmap", sTD)],
        [Paragraph("16", sTD), Paragraph("EPR rules relaxed by government", sTD), Paragraph("LOW", sTD), Paragraph("HIGH", sTD_red), Paragraph("Diversify beyond compliance revenue; build transaction moat", sTD)],
        [Paragraph("17", sTD), Paragraph("No willingness-to-pay for documentation", sTD), Paragraph("MEDIUM", sTD), Paragraph("FATAL", sTD_red), Paragraph("Run 10 EHS manager interviews; validate WTP before building", sTD)],
        [Paragraph("18", sTD), Paragraph("Government builds free EPR digital infrastructure", sTD), Paragraph("LOW", sTD), Paragraph("HIGH", sTD_red), Paragraph("Move up-market to enterprise intelligence — government does basic", sTD)],
        [Paragraph("19", sTD), Paragraph("Payment fraud on transactions", sTD), Paragraph("MEDIUM", sTD), Paragraph("MEDIUM", sTD), Paragraph("Escrow via licensed aggregator (Razorpay/PayU)", sTD)],
        [Paragraph("20", sTD), Paragraph("Technical failure during key transaction", sTD), Paragraph("LOW", sTD), Paragraph("MEDIUM", sTD), Paragraph("Robust V1; manual coordination fallback always available", sTD)],
    ]
    story.append(table(risk_data, [8*mm, 50*mm, 22*mm, 18*mm, page_w - 98*mm]))
    story.append(PageBreak())

    # ═══════════════ SECTION 13: RED TEAM ════════════════════════
    story += h1("Red-Team Criticism — Why This Might Fail", "13")
    story.append(body(
        "Every claim in the investment thesis is challenged below. These are the strongest bearish arguments, "
        "followed by the honest counter-evidence and what experiments are needed to resolve each one."
    ))
    story.append(sp(3))

    critiques = [
        ("Argument 1: This market already has solutions",
         "IndiaMART, Recykal, broker networks — the market functions today. The pain isn't severe enough to justify switching.",
         "IndiaMART functions for discovery but fails at qualification. Recykal focuses on EPR credit and consumer plastic — not B2B industrial specification matching. Brokers work but create documentation gaps that BRSR mandates are now making costly.",
         "Offer 10 EHS managers the compliance documentation product. See if 3+ pay ₹5K/month within 60 days."),
        ("Argument 2: Transaction frequency is too low to build a marketplace",
         "Industrial scrap is monthly, not daily. You can't build liquid marketplace on monthly transactions like Zomato.",
         "B2B industrial marketplaces (Metalbook, Comet Metals) succeed on lower frequency because average transaction values are large. Monthly @ ₹3L GMV × 1.5% = ₹4,500/transaction. 500 transactions/month = ₹22.5L MRR. This is viable as SaaS, not Zomato.",
         "Survey 20 suppliers: how often do they dispose of each material stream?"),
        ("Argument 3: Brokers will undercut CircularMatch on trust and speed",
         "Brokers have 10-year relationships, arrive at the factory, pay cash, handle logistics. CircularMatch is a website asking suppliers to fill forms.",
         "Brokers fail BRSR-audited companies because they produce no compliant documentation. For a top-1,000 listed company with board-level sustainability reporting, the broker is becoming a liability, not an asset.",
         "Interview 5 EHS managers at BSE-listed Noida manufacturers about their BRSR audit experience specifically relating to scrap disposal documentation."),
        ("Argument 4: Recykal will replicate this in 12 months",
         "Recykal has $23M, ₹1,498 Cr GMV, regulatory credibility, and enterprise clients. If B2B qualification works, they build it in 12 months.",
         "Recykal's business is structured around EPR credit marketplace and deposit-return systems. Their incentive is GMV volume, not per-lot quality verification. The operational model is different — not trivially replicable. But the window is closing.",
         "Research Recykal's current B2B industrial product depth on cotton, cardboard, and multi-material specification matching specifically."),
        ("Argument 5: The team has no enterprise sales experience",
         "Technical founders with a hackathon win cannot close 9-month enterprise sales cycles with Fortune-500-equivalent Indian companies.",
         "The initial customers are NOT Fortune 500. They are EHS managers at mid-size listed companies — reachable through LinkedIn and industry associations. Early sales is founder-led relationship sales, not formal enterprise procurement.",
         "Can the founding team get 5 meetings with target customer personas in 30 days? That test answers the question."),
    ]

    for title, claim, counter, experiment in critiques:
        story.append(KeepTogether([
            h3(title),
            Paragraph(f"<b>The Claim:</b> {claim}", sBody),
            Paragraph(f"<b>Counter-Evidence:</b> {counter}", sBody),
            Paragraph(f"<b>Experiment Needed:</b> {experiment}", sCallout),
            sp(3),
        ]))
    story.append(PageBreak())

    # ═══════════════ SECTION 14: FUNDING ════════════════════════
    story += h1("Funding Strategy & Investor Map", "14")
    fund_data = [
        [Paragraph("Stage", sTH), Paragraph("Amount", sTH), Paragraph("Trigger", sTH), Paragraph("Target Investors", sTH), Paragraph("Use of Funds", sTH)],
        [Paragraph("Bootstrap", sTD), Paragraph("₹0–10L", sTD), Paragraph("Now — just start", sTD),
         Paragraph("Self-funded", sTD), Paragraph("V1 refinement; founder-led sales; first 5 customers", sTD)],
        [Paragraph("Pre-Seed", sTD_green), Paragraph("₹30–80L", sTD_green),
         Paragraph("5+ real transactions, 3+ paying SaaS customers", sTD_green),
         Paragraph("NSRCEL IIM Bangalore (Circular Innovation / Circular Bharat Accelerator); Greenovation Circularity Challenge 2026 (₹20L non-dilutive + ₹4Cr follow-on, deadline Oct 31 2026); CII/FICCI angel networks; SIDBI CGTMSE", sTD),
         Paragraph("First ops hire; legal setup; logistics partner relationships", sTD)],
        [Paragraph("Seed", sTD_green), Paragraph("₹1–3Cr", sTD_green),
         Paragraph("₹20–50L ARR, 30+ customers, repeatable GTM", sTD_green),
         Paragraph("Circulate Capital (exited Recykal at ~5x, Asia Fund II at $220M — ACTIVE); Rainmatter/Zerodha (led ₹56Cr Pre-Series A in Karo Sambhav, June 2026 — ACTIVE); Momentum Capital; Speciale Invest", sTD),
         Paragraph("Sales team (3–4 people); tech (2–3); geographic expansion", sTD)],
        [Paragraph("Series A", sTD), Paragraph("₹10–30Cr", sTD),
         Paragraph("₹1–3Cr ARR, 100+ customers, national expansion plan", sTD),
         Paragraph("Existing Seed + Accel India, Sequoia Surge, A91 Partners", sTD),
         Paragraph("National scale; enterprise sales; EPR chain management product", sTD)],
    ]
    story.append(table(fund_data, [22*mm, 18*mm, 38*mm, 55*mm, 37*mm]))
    story.append(PageBreak())

    # ═══════════════ SECTION 15: 12-MONTH ROADMAP ═══════════════
    story += h1("12-Month Tactical Roadmap", "15")
    tm_data = [
        [Paragraph("Month", sTH), Paragraph("Product Focus", sTH), Paragraph("Customer Acquisition", sTH), Paragraph("Revenue", sTH), Paragraph("Key Milestone", sTH)],
        [Paragraph("M1", sTD), Paragraph("Core Platform LIVE: Deploy V1 Trusted Pilot to live cloud with custom domain; configure Supabase Auth SMS OTP", sTD), Paragraph("Cold outreach to 50 Noida/Ghaziabad EHS managers; target 10 pilot discovery calls", sTD), Paragraph("₹0", sTD), Paragraph("5 enterprise discovery meetings", sTD)],
        [Paragraph("M2", sTD), Paragraph("Integrate S3 document vault for NABL lab PDF test reports; finalize SEBI BRSR export generator", sTD), Paragraph("15 supplier meetings; 10 recycler plant visits; sign 3 free pilot MoUs", sTD), Paragraph("₹0", sTD), Paragraph("8 suppliers onboarded; 5 buyers active", sTD)],
        [Paragraph("M3", sTD_green), Paragraph("Coordinate live physical transactions using the 5-stage workflow (sample → offer → pickup → receipt)", sTD), Paragraph("Facilitate first 3 physical transactions manually with transporter partners", sTD), Paragraph("₹0–1L", sTD_green), Paragraph("🏆 FIRST REAL COMMERCIAL SETTLEMENT", sTD_green)],
        [Paragraph("M4", sTD), Paragraph("Refine 100-pt matching weights using real deal feedback; automate weighbridge receipt logging", sTD), Paragraph("25 suppliers; 15 buyers; target first paying compliance subscriber", sTD), Paragraph("₹2–5L", sTD), Paragraph("5 completed transactions", sTD)],
        [Paragraph("M5", sTD_green), Paragraph("Deploy BRSR Compliance Dashboard (SEBI-aligned waste intensity and chain-of-custody export)", sTD), Paragraph("Convert 5 pilot accounts to paid SaaS (₹10K/mo); apply for NSRCEL cohort", sTD), Paragraph("₹5–10L", sTD_green), Paragraph("🏆 FIRST PAYING SaaS CUSTOMER", sTD_green)],
        [Paragraph("M6", sTD), Paragraph("Implement Google Maps Distance Matrix API for real-time freight pricing", sTD), Paragraph("35 suppliers; 20 buyers; CII UP chapter green partnership", sTD), Paragraph("₹8–15L", sTD), Paragraph("₹5L+ MRR achieved", sTD)],
        [Paragraph("M7", sTD), Paragraph("WhatsApp Business API integration for automated sample requests and dispatch alerts", sTD), Paragraph("Expand outreach to Faridabad & Sonipat industrial clusters", sTD), Paragraph("₹10–20L", sTD), Paragraph("20 monthly transactions", sTD)],
        [Paragraph("M8", sTD), Paragraph("Prototype Roboflow/YOLOv8 scrap photo contamination grading pipeline", sTD), Paragraph("50 suppliers; 30 buyers; submit Greenovation Challenge application (due Oct 31)", sTD), Paragraph("₹15–25L", sTD), Paragraph("Pre-seed investor discussions begin", sTD)],
        [Paragraph("M9", sTD_green), Paragraph("Launch Supplier Reliability Index & automated RFQ reverse bidding engine", sTD), Paragraph("Close pre-seed round (₹30–80L); hire first B2B operations lead", sTD), Paragraph("₹20–35L", sTD_green), Paragraph("🏆 PRE-SEED ROUND CLOSED", sTD_green)],
        [Paragraph("M10", sTD), Paragraph("Automate Document AI OCR for instant weighbridge slip parsing and GST reconciliation", sTD), Paragraph("70 suppliers; 40 buyers; first large FMCG brand pilot", sTD), Paragraph("₹25–45L", sTD), Paragraph("40 monthly transactions", sTD)],
        [Paragraph("M11", sTD), Paragraph("Multi-facility enterprise portal with centralized corporate sustainability rollups", sTD), Paragraph("Sign first multi-site corporate enterprise contract (₹15L+ annual value)", sTD), Paragraph("₹30–55L", sTD), Paragraph("First multi-site enterprise account", sTD)],
        [Paragraph("M12", sTD_green), Paragraph("CPCB centralized EPR portal API integration for direct statutory credit issuance", sTD), Paragraph("100 suppliers; 60 buyers; prepare Seed funding data room (₹1–3 Cr)", sTD), Paragraph("₹35–65L", sTD_green), Paragraph("🏆 SEED FUNDING READY", sTD_green)],
    ]
    story.append(table(tm_data, [12*mm, 42*mm, 46*mm, 20*mm, 50*mm]))
    story.append(sp(3))
    story.append(callout("12-Month ARR Target (Base): ₹50–75 lakh | 12-Month GMV Target: ₹3–5 crore | Transactions: 50–80 completed"))
    story.append(PageBreak())

    # ═══════════════ SECTION 16: PRODUCT GAP ANALYSIS ═══════════
    story += h1("Product Architecture, Implemented Tool Capabilities & Future Gaps", "16")
    story.append(body(
        "This section reviews the technical maturity of the platform, contrasting the extensive set of capabilities "
        "already engineered and verified in the current codebase with the high-impact engineering milestones scheduled for upcoming releases."
    ))
    story.append(sp(2))

    story.append(h2("✅ Implemented & Verified in Current Codebase (Trusted Pilot Core)"))
    delivered_features = [
        ("Google Gemini 2.0 Flash Extraction Engine", "Processes free-form natural language waste descriptions via direct API calls with strict JSON schemas and temperature=0. Includes normalization to kg/week, canonical catalog grounding, and deterministic regex fallback."),
        ("100-Point Deterministic Matching v2", "Scores candidate pairings across 5 auditable dimensions (Material: 35, Quality: 20, Quantity: 20, Logistics: 15, Evidence: 10) with complete score decomposition and human-readable 'Why this match?' rationale."),
        ("Hard Eligibility Gates", "Eliminates mismatched materials, prohibited contaminants, exceeded distance limits, and sub-standard quality before scoring, flagging matches as Eligible, Needs Sample, or Missing Evidence."),
        ("Digital Material Passport (ISO 59040:2025)", "Structured lot datasheets capturing Lot Code (LOT-PET-NOI-001), material form, colour, packaging, storage condition, contamination disclosure, sample availability, and a 4-tier evidence verification chain."),
        ("Buyer Acceptance Spec Profiles", "Granular buyer-side sourcing templates with allowable forms, allowable colours, minimum evidence status, and prohibited contaminant exclusion rules."),
        ("Operational 5-Stage Procurement Workflow", "Complete lifecycle tracking: Sample Request → Sample Acceptance → Commercial Offer → Pickup Plan → Receiving Weighbridge Manifest & Settlement."),
        ("Delivered Freight & ISO 59020 Carbon Calculators", "Distance-weighted logistics cost modeling (₹1.20 base + ₹0.025/km) and GHG Protocol Scope 3 Category 5 life-cycle displacement carbon abatement estimation."),
        ("Interactive Leaflet Cartography & Admin Scoring Config", "Geospatial mapping across Delhi NCR manufacturing corridors and an administrative interface for dynamic scoring weight adjustments."),
        ("Dual-Mode Persistence Architecture", "Clean repository pattern supporting managed Supabase PostgreSQL (12 relational tables with RLS) alongside a zero-credential In-Memory DemoStore."),
        ("Comprehensive Automated Test Suite", "7 automated backend pytest test suites (100% pass rate across matching v2, API flows, demo accounts, and extraction) and Vitest frontend scaffolding."),
    ]
    for df_title, df_desc in delivered_features:
        story.append(Paragraph(f"• <b>{df_title}:</b> {df_desc}", sBullet))

    story.append(sp(3))
    story.append(h2("Upcoming Production Engineering Gaps (Next Releases)"))
    gaps = [
        ("🔴 CRITICAL: Computer Vision Contamination Grader & Weighbridge Document OCR",
         [
             "<b>Automated CV Scrap Photo Grader:</b> Integrate Roboflow / YOLOv8 object detection pipelines on uploaded scrap photos to calculate an automated 'Purity Confidence Score' and flag foreign contaminants (e.g. PVC or metal in PET).",
             "<b>Document AI Weighbridge Slip OCR:</b> Deploy an OCR pipeline that automatically parses weighbridge slips, GST invoices, and lab test certificates, reconciling actual dispatch weights against purchase orders.",
         ]),
        ("🟠 HIGH: SEBI BRSR Core & CPCB EPR Compliance SaaS Export",
         [
             "<b>Chain-of-Custody (CoC) Cryptographic Certificates:</b> Auto-generate digitally signed PDF certificates verifying material movement from Supplier A to Authorized Recycler B with linked weighbridge records for auditor verification.",
             "<b>SEBI BRSR XML/PDF One-Click Export:</b> Structure chain-of-custody data in the exact reporting format required by third-party ESG assurance providers.",
         ]),
        ("🟡 MEDIUM: EU ESPR JSON-LD & DPDP Act Data Privacy Gateway",
         [
             "<b>Machine-Readable EU Battery/Textile Passports:</b> Add an API endpoint returning material passports in ESPR-compliant JSON-LD format with GS1 Digital Link QR codes for European export compliance.",
             "<b>DPDP Consent Architecture & Privacy by Overlay:</b> Implement purpose-specific consent timestamps in AuthPage.tsx and a 'Right to be Forgotten' data redaction API. Enforce coordinate and identity blurring until mutual agreement.",
         ]),
    ]
    for section_title, bullets_list in gaps:
        story.append(h3(section_title))
        for b in bullets_list:
            story.append(bullet(b))
        story.append(sp(2))

    story.append(PageBreak())

    # ═══════════════ SECTION 17: REVERIFICATION AUDIT ══════════
    story += h1("Reverification Audit — 20 Claims Checked", "17")
    story.append(body(
        "A full second-pass reverification was conducted on all major factual claims in this report. "
        "The table below shows the results across 20+ claims checked."
    ))
    story.append(sp(3))
    rv_data = [
        [Paragraph("Original Claim", sTH), Paragraph("Status", sTH), Paragraph("Corrected Finding", sTH), Paragraph("Impact", sTH)],
        [Paragraph("Recykal ₹1,498 Cr GMV FY26, 53% YoY growth", sTD), Paragraph("✅ CONFIRMED", sTD_green), Paragraph("Exact figure matches multiple sources (entrackr.com, thecsruniverse.com)", sTD), Paragraph("None", sTD)],
        [Paragraph("Recykal raised $23M, June 2026", sTD), Paragraph("✅ CONFIRMED", sTD_green), Paragraph("Bridge round confirmed (indiatimes.com, vccircle.com)", sTD), Paragraph("None", sTD)],
        [Paragraph("EPR recycled content 30% FY25-26, 60% FY28-29", sTD), Paragraph("✅ CONFIRMED", sTD_green), Paragraph("CPCB EPR portal, PWM Rules", sTD), Paragraph("None", sTD)],
        [Paragraph("EU DPP coming for batteries by 2027", sTD), Paragraph("✅ CONFIRMED", sTD_green), Paragraph("Precise date: February 18, 2027 (europa.eu)", sTD), Paragraph("None", sTD)],
        [Paragraph("PET scrap ₹20–60/kg Delhi NCR", sTD), Paragraph("⚠️ CORRECTED", sTD_red), Paragraph("Current spot is ~₹50/kg for PET bottle scrap (scrapc.com, Sept 2026)", sTD), Paragraph("LOW", sTD)],
        [Paragraph("Noida has 5,000+ manufacturing units", sTD), Paragraph("⚠️ CORRECTED", sTD_red), Paragraph("~2,500 facilities in Noida-Greater Noida; ~1,807 in Noida alone (rentechdigital.com)", sTD), Paragraph("HIGH — SAM reduced 2x", sTD_red)],
        [Paragraph("BRSR Core: Top 1,000 listed companies", sTD), Paragraph("⚠️ CORRECTED", sTD_red), Paragraph("Phased: 150→250→500→1,000. Companies choose 'assessment' or 'reasonable assurance' (SEBI Mar 2025)", sTD), Paragraph("MEDIUM — GTM timing", sTD)],
        [Paragraph("Recykal: 'Basic category match, not quality-focused'", sTD), Paragraph("🔴 WRONG", sTD_red), Paragraph("Recykal actively building AI quality grading, Grade Assurance Guarantees, Smart Listing Builder, Compliance AI", sTD), Paragraph("CRITICAL — window closing", sTD_red)],
        [Paragraph("MetalMandi: AI quality inspection (limited)", sTD), Paragraph("⚠️ CORRECTED", sTD_red), Paragraph("2L+ downloads, 1.1L users, 50K MAU, 15,000 MT/month. AI quality inspection is real and mature.", sTD), Paragraph("MEDIUM", sTD)],
        [Paragraph("Greenovation: ₹4 crore non-dilutive grant", sTD), Paragraph("🔴 WRONG", sTD_red), Paragraph("Direct grant is ₹20L non-dilutive. ₹4Cr is follow-on investment via blended finance, not a grant. Deadline: Oct 31 2026.", sTD), Paragraph("HIGH — misleading if uncorrected", sTD_red)],
        [Paragraph("Circulate Capital: generic mention", sTD), Paragraph("⚠️ UPDATED", sTD), Paragraph("Exited Recykal at ~5x. Asia Fund II at $220M toward $300M target. Invested $9.5M in JC Global Sept 2026.", sTD), Paragraph("HIGH — receptive to CircularMatch?", sTD)],
        [Paragraph("No mention of DPDP Act", sTD), Paragraph("⚠️ ADDED", sTD), Paragraph("DPDP Act full enforcement by May 13, 2027. Phase 1 in force since Nov 2025.", sTD), Paragraph("MEDIUM — compliance prep needed", sTD)],
        [Paragraph("WCEF 2026 — not mentioned", sTD), Paragraph("🆕 NEW INFO", sTD_green), Paragraph("World Circular Economy Forum, Sept 15–18 2026, Gandhinagar. 3,600+ stakeholders from 60+ countries. Peak India circular economy attention.", sTD), Paragraph("Immediate opportunity", sTD_green)],
    ]
    story.append(table(rv_data, [50*mm, 22*mm, 65*mm, 33*mm]))
    story.append(PageBreak())

    # ═══════════════ SECTION 18: FINAL STRATEGY & ACTION ═══════
    story += h1("Final Recommended Strategy & Four Immediate Actions", "18")
    story.append(h2("One Strategy. Not Ten Options."))
    story.append(body(
        "<b>What CircularMatch should become:</b> The qualification and documentation infrastructure for India's industrial secondary material economy. "
        "Not a listing platform. Not a broker. Not a recycling management software. "
        "The layer that converts unstructured material claims into verified, buyer-acceptable, compliance-ready material records — "
        "and then matches those records against real buyer requirements with explainable logic."
    ))
    story.append(sp(3))

    strategy_data = [
        [Paragraph("Decision", sTH), Paragraph("The Answer", sTH)],
        [Paragraph("What problem do we own?", sTD_green), Paragraph("The qualification and documentation gap in India's industrial secondary material flows", sTD)],
        [Paragraph("First customer to target?", sTD_green), Paragraph("EHS/Sustainability Manager at BSE/NSE-listed manufacturing company in Noida/Greater Noida with BRSR Core obligations", sTD)],
        [Paragraph("Why do they pay?", sTD_green), Paragraph("BRSR auditors require chain-of-custody documentation that informal brokers cannot provide — penalty exposure makes this non-optional", sTD)],
        [Paragraph("Initial geography?", sTD_green), Paragraph("Delhi NCR only — Noida, Greater Noida, Ghaziabad, Gurugram. No exceptions for 12–18 months.", sTD)],
        [Paragraph("Initial material category?", sTD_green), Paragraph("Cotton cutting waste from Noida garment factories. PET industrial scrap second. Cardboard third.", sTD)],
        [Paragraph("Business model?", sTD_green), Paragraph("Compliance Documentation SaaS (₹5K–15K/month) + Transaction Commission (1.5–2% of GMV). Enterprise EPR chain management in Year 2.", sTD)],
        [Paragraph("North Star Metric?", sTD_green), Paragraph("Completed transactions per month with documentation generated. Proves both sides get value AND compliance product works.", sTD)],
        [Paragraph("What proves PMF?", sTD_green), Paragraph("3+ suppliers renewing SaaS after completed transaction + 2+ buyers placing repeat order through platform (not reverting to broker)", sTD)],
        [Paragraph("What could kill the company?", sTD_red), Paragraph("Zero WTP for compliance documentation OR Recykal building qualification layer before CircularMatch reaches meaningful GMV", sTD_red)],
        [Paragraph("12-month target?", sTD_green), Paragraph("₹40–70L ARR; 50+ completed transactions; 3+ paying enterprise EHS accounts; pre-seed funding closed", sTD)],
        [Paragraph("3-year target?", sTD_green), Paragraph("₹5–15 Cr ARR; 4+ industrial clusters; Series A closed; 2,000+ documented transactions creating data moat", sTD)],
        [Paragraph("What to build next?", sTD_green), Paragraph("BRSR-ready compliance documentation export (PDF/XML) with evidence-state tracking — generates SaaS revenue before solving liquidity", sTD)],
        [Paragraph("What NOT to build?", sTD_red), Paragraph("AI chatbots, social profiles, consumer mobile app, general analytics, logistics operations, hazardous waste features, international features before India PMF", sTD_red)],
    ]
    story.append(table(strategy_data, [50*mm, page_w - 50*mm]))
    story.append(sp(4))

    story.append(h2("What To Do: First, Second, Third, Fourth"))
    actions = [
        ("FIRST — Get 5 Real Customer Conversations in 30 Days",
         "Not 5 interested people. 5 people who currently manage scrap disposal documentation and have BRSR filing obligations. "
         "Go to LinkedIn. Search: 'EHS Manager' + 'Noida' + listed company. Call. "
         "Ask about their current scrap documentation process, whether BRSR auditors have questioned chain-of-custody, "
         "and whether they would pay ₹5,000–10,000/month for automated documentation. This costs ₹0."),
        ("SECOND — Close 3 Customers on a Paid Pilot Before Building More Features",
         "After customer interviews, go back to the 3 most interested. "
         "Say: 'We'll document your next 3 scrap disposals completely — generate BRSR-ready certificates, find verified buyers, coordinate pickup. ₹X flat for the pilot.' "
         "Do this manually. Use the existing product for visible parts. Handle buyer discovery, logistics, documentation generation manually behind the scenes. "
         "This produces first revenue, real workflow learnings, and investor evidence."),
        ("THIRD — Build Only What Customers Paid For in Step 2",
         "After 3 paid pilots, you know exactly what was painful: "
         "Was documentation generation the hard part? Was buyer discovery hard? Was quality verification hard? Was logistics coordination hard? "
         "Build the automation for whichever was most painful and most time-consuming. Nothing else."),
        ("FOURTH — Raise Pre-Seed With Transaction Evidence",
         "With 5+ completed transactions, 3+ paying customers, and a clear repeatable workflow, you have: "
         "proof the problem is real (customer paid), proof the solution works (transaction completed), "
         "proof of unit economics (revenue per customer), proof of scalability hypothesis. "
         "This is a fundable pre-seed story. Without this, you have a hackathon project and a PowerPoint."),
    ]
    for i, (title, detail) in enumerate(actions):
        story.append(KeepTogether([
            Paragraph(f"<b>Step {i+1}: {title}</b>", sH3),
            body(detail),
            sp(2),
        ]))

    # ═══════════ SECTION 19: REVENUE MODEL DEEP-DIVE ════════════
    story.append(PageBreak())
    story += h1("Revenue Model Deep-Dive — Why Transaction Fees Alone Fail", "19")
    story.append(body(
        "The most common mistake for B2B marketplace founders is anchoring on transaction commission as the primary revenue model. "
        "For CircularMatch, this is a strategic trap. Here is the precise reasoning and the correct revenue architecture."
    ))
    story.append(sp(3))
    story.append(warning(
        "Transaction Commission Alone Will Fail: Industrial buyers and sellers will bypass the platform once they meet each other to save the 1-2% fee. "
        "Scrap is a low-margin commodity — even a small fee creates a bypass incentive. "
        "The platform must create a reason to stay that has nothing to do with the transaction itself."
    ))
    story.append(sp(3))
    story.append(h2("The Correct Revenue Architecture: 3-Layer Stack"))

    rev_stack = [
        [Paragraph("Layer", sTH), Paragraph("Product", sTH), Paragraph("Price Point", sTH), Paragraph("Why They Cannot Bypass It", sTH)],
        [Paragraph("Layer 1 — Hook (Free)", sTD_green),
         Paragraph("Listing & Discovery: Buyers and sellers can list and discover materials for free. No friction to join.", sTD),
         Paragraph("Free", sTD_green),
         Paragraph("Acquires both sides of the marketplace without payment barrier. Transaction happens on or off platform.", sTD)],
        [Paragraph("Layer 2 — The Revenue (SaaS Subscription)", sTD_green),
         Paragraph("EHS Compliance Dashboard: Chain-of-Custody certificates, BRSR Core Waste Intensity KPI dashboard, one-click audit-ready PDF export for SEBI-mandated disclosures.", sTD),
         Paragraph("~$500/month per company (approx. Rs 40,000/month)", sTD_green),
         Paragraph("If a supplier transacts off-platform, they LOSE the legal paper trail. Their BRSR auditor requires digital chain-of-custody proof. The platform IS the compliance record. Bypass = compliance failure.", sTD_green)],
        [Paragraph("Layer 3 — Upsell (Verification as a Service)", sTD),
         Paragraph("Grade Assurance Check: Buyer pays a flat fee for AI + third-party inspector verification of a specific scrap lot BEFORE paying freight to move it. Eliminates the 30-60% gate rejection problem.", sTD),
         Paragraph("~$50 per verification lot (approx. Rs 4,000)", sTD),
         Paragraph("Buyers only get the pre-shipment assurance guarantee through the platform. Offline, they bear 100% of the rejection risk themselves.", sTD)],
    ]
    story.append(table(rev_stack, [28*mm, 55*mm, 32*mm, page_w - 115*mm]))
    story.append(sp(4))

    story.append(h2("Why This Model is Structurally Superior to Pure Transaction Fees"))
    reasons = [
        "<b>Compliance lock-in creates genuine stickiness:</b> A supplier who has 12 months of BRSR audit records stored in CircularMatch cannot easily migrate — their entire audit trail lives on the platform. CAC is recovered in Month 1-3; LTV extends for years.",
        "<b>Regulatory mandate removes price sensitivity:</b> EHS managers are not buying a 'nice to have' tool. SEBI BRSR Core requires third-party verifiable waste documentation. The penalty for non-compliance is regulatory disclosure and potential stock market impact. WTP is driven by risk avoidance, not ROI calculation.",
        "<b>Verification fees scale with transaction volume without bypass risk:</b> A buyer who pays Rs 4,000 for pre-shipment assurance is paying to eliminate the risk of a Rs 2-5 lakh shipment being rejected at gate. The math is obvious — there is no incentive to bypass this.",
        "<b>SaaS revenue provides baseline MRR during low-transaction months:</b> Industrial scrap transactions are monthly, not daily. SaaS subscription revenue fills the gaps and makes the business financeable at early stage.",
        "<b>Combined model enables higher take rate on verified transactions:</b> A 'Grade Assured' lot commands a price premium. CircularMatch earns the verification fee AND can charge a higher commission (2-3%) on verified lots because the buyer values the quality guarantee.",
    ]
    for r in reasons:
        story.append(bullet(r))
    story.append(sp(4))

    story.append(h2("Revenue Model vs. Competitors"))
    comp_rev = [
        [Paragraph("Platform", sTH), Paragraph("Revenue Model", sTH), Paragraph("Bypass Risk", sTH), Paragraph("Stickiness", sTH)],
        [Paragraph("IndiaMART", sTD), Paragraph("Subscription for lead access (buyer pays, not seller)", sTD), Paragraph("HIGH — all transactions happen off platform", sTD_red), Paragraph("LOW", sTD_red)],
        [Paragraph("Recykal", sTD), Paragraph("EPR credit marketplace + GMV commission on post-consumer flows", sTD), Paragraph("MEDIUM — EPR credit registration ties them in", sTD), Paragraph("MEDIUM", sTD)],
        [Paragraph("Brokers/Kabadiwalas", sTD), Paragraph("10-15% margin on material (built into price)", sTD), Paragraph("ZERO — they ARE the transaction", sTD_red), Paragraph("HIGH (relationship)", sTD)],
        [Paragraph("CircularMatch (Target)", sTD_green), Paragraph("SaaS compliance subscription + verification fees + 1.5% GMV commission", sTD), Paragraph("LOW — compliance trail locks suppliers in", sTD_green), Paragraph("HIGH (audit dependency)", sTD_green)],
    ]
    story.append(table(comp_rev, [30*mm, 55*mm, 45*mm, 44*mm]))

    # ═══════════ SECTION 20: PITCH NARRATIVE & INVESTOR Q&A ═════
    story.append(PageBreak())
    story += h1("Investor Pitch Narrative & Pre-Answered Hard Questions", "20")
    story.append(body(
        "This section documents the precise narrative for pitching CircularMatch to investors, judges, or strategic partners — "
        "and provides pre-researched answers to the hardest questions you will face. "
        "Every answer is grounded in the verified data from this report."
    ))
    story.append(sp(2))

    story.append(h2("The 3-Minute Pitch Narrative"))
    narrative_steps = [
        ("The Hook — The Problem",
         "\"In India, over $14 billion of industrial scrap changes hands every year — factory offcuts, PET waste, cotton cutting scraps. "
         "Yet 30-60% of it is rejected at the buyer's gate because there is no technical qualification system. "
         "Simultaneously, SEBI and CPCB now mandate that top enterprises prove verifiable recycling chains of custody in their annual reports. "
         "Their current reality? Scrap sold to informal brokers with handwritten chits that fail statutory audits.\""),
        ("The Solution",
         "\"Meet CircularMatch. We are the intelligence and qualification infrastructure for India's secondary raw-material economy. "
         "Using Google Gemini 2.0 Flash, we convert messy factory scrap descriptions into structured technical records in seconds. "
         "Our 100-point deterministic engine matches generators with verified recyclers, while our ISO 59040 Material Passport "
         "guarantees quality transparency and generates audit-ready compliance certificates for EHS teams.\""),
        ("The Live Tool Walkthrough (Evaluator Route)",
         "\"Our live platform demonstrates the full transaction lifecycle in under 3 minutes: "
         "1. Input natural waste text in /list-waste → Gemini extracts structured specs normalized to kg/week. "
         "2. Click /matches → View ranked buyers with our 100-point score breakdown and hard eligibility gates (Needs Sample / Eligible). "
         "3. Open /passport → Review Lot LOT-PET-NOI-001 with 4-tier evidence verification (Self-Declared to Test-Reviewed). "
         "4. Review /matches/:id → Inspect delivered freight economics (₹1.20 + ₹0.025/km) and Leaflet Delhi NCR transit routing. "
         "5. Execute 5-stage procurement lifecycle → Request Sample → Sample Accepted → Commercial Offer → Pickup Plan → Receiving Receipt.\""),
        ("The Business Model",
         "\"We do not rely solely on easily bypassed transaction fees. "
         "Instead, we charge EHS managers a monthly SaaS subscription for the mandatory BRSR/EPR compliance reporting they legally require. "
         "We charge buyers verification fees for pre-shipment quality assurance, and capture a 1.5% facilitation fee on settled orders. "
         "The digital chain of custody makes our platform un-bypassable.\""),
        ("The Market & Timing",
         "\"BRSR Core reporting mandates expand to 1,000 listed companies by FY26-27. "
         "EPR recycled plastic content targets rise from 30% to 60% by 2028. "
         "The World Circular Economy Forum convened its first South Asia edition in India in September 2026. "
         "The timing is urgent, the technology is built, and the market need is acute.\""),
    ]
    for i, (step_title, step_body) in enumerate(narrative_steps):
        story.append(KeepTogether([
            Paragraph(f"<b>Beat {i+1}: {step_title}</b>", sH3),
            Paragraph(step_body, sCallout),
            sp(2),
        ]))

    story.append(h2("Pre-Answered Hard Questions — Investor & Judge Q&A"))
    story.append(body(
        "These are high-probability questions grounded in real competitive and technical facts from this report."
    ))
    story.append(sp(2))

    qas = [
        (
            "Q: 'Why won't buyers and sellers just transact off-platform once they meet each other, to save the fee?'",
            "They will — and we let them. We don't monetize the transaction alone. We monetize the compliance. "
            "The seller uses our platform because it generates the audit-ready chain-of-custody PDF they need for their mandatory BRSR reporting. "
            "If they transact offline, they lose the legal paper trail. "
            "Their SEBI-mandated annual report will flag missing waste disposal documentation. "
            "Our platform IS the compliance record. Bypass the platform, bypass the audit trail.",
            "This is the strongest answer in the deck. Practice it until it's reflexive."
        ),
        (
            "Q: 'How are you better than Recykal? They have Rs 1,498 crore GMV and $23 million in funding.'",
            "Recykal is an impressive company — and they proved that a digital waste marketplace works at scale in India. "
            "But they started in post-consumer plastic and EPR credit trading. "
            "We are laser-focused on B2B industrial manufacturing waste — factory offcuts, cotton cutting waste, PET thermoforming scrap — "
            "and we solve the specific BRSR Core audit documentation problem for EHS managers using 100-point deterministic matching and lot-level ISO 59040 passports. "
            "Recykal's origin is municipal collection and credit certificates. Ours is industrial specification matching and corporate compliance. "
            "Different buyers, different product, different distribution motion.",
            "Do NOT say Recykal does not do AI — they do. Compete on specificity of focus, not on features."
        ),
        (
            "Q: 'AI computer vision for industrial scrap sounds extremely hard. How does your AI actually work?'",
            "In our live platform today, we use Google Gemini 2.0 Flash in strict JSON schema mode at temperature=0 with catalog grounding to convert unstructured factory descriptions into structured technical records normalized to kg/week, with deterministic regex fallback. "
            "For matching, we deliberately avoid opaque LLMs and use a transparent 100-point deterministic mathematical engine. "
            "For future automated photo verification, we are architecting lightweight YOLOv8 computer vision models fine-tuned on scrap datasets to detect visible contamination flags (organic matter, moisture, mixed plastics). "
            "We do not claim to replace chemical spectroscopy; we claim to pre-screen lots effectively enough to reduce buyer gate rejections from 50% to under 20%.",
            "Honest, specific, and defensible. Never oversell the AI maturity. Undersell and over-deliver."
        ),
        (
            "Q: 'The market is already served by IndiaMART, Recykal, and brokers. Why do you exist?'",
            "IndiaMART has 200,000+ scrap listings. Buyers still reject 30-60% of material at gate — because IndiaMART is a phone directory, not a qualification engine. "
            "Recykal focuses on EPR credits and post-consumer plastic, not B2B industrial manufacturing scrap with BRSR-grade documentation. "
            "Brokers provide speed and relationships but produce zero compliant documentation — which is now a liability for SEBI-listed companies. "
            "The market is served for discovery. It is completely unserved for qualification and compliance documentation. That gap is ours.",
            "Separate the problems: discovery is solved. Qualification and compliance documentation are not."
        ),
        (
            "Q: 'What stops a larger player like Recykal or IndiaMART from copying this in 6 months?'",
            "Three things. First, Recykal's business model is GMV-based EPR credit trading — their incentive is volume, not per-lot quality verification. "
            "Building a qualification layer with different domain expertise requires a real organizational pivot. "
            "Second, the BRSR compliance documentation product requires deep familiarity with SEBI's exact disclosure requirements for waste KPIs — "
            "this is a narrow, regulation-specific domain that IndiaMART has zero incentive to enter. "
            "Third, the data moat: every transaction we process accumulates structured rejection data, acceptance criteria, quality outcomes. "
            "The first mover who builds this structured dataset owns the pricing intelligence layer that every other platform needs.",
            "Speed matters. The 6-9 month window is real. This answer acknowledges the risk without conceding the race."
        ),
        (
            "Q: 'What is your go-to-market? How do you acquire your first customers?'",
            "We are starting with EHS managers at BSE-listed manufacturing companies in Noida — specifically garment exporters and PET manufacturers "
            "who are already filing BRSR Core disclosures and struggling with waste chain-of-custody documentation. "
            "We reach them through LinkedIn cold outreach, the Apparel Export Promotion Council network, and BRSR compliance consultants who already serve these companies. "
            "Our sales motion is founder-led: one meeting, a free 3-month pilot, and a paid subscription if the pilot generates their first BRSR-ready certificate. "
            "We are not building a marketing funnel. We are doing 50 cold calls to close 10 pilots.",
            "Specific, credible, founder-appropriate for an early-stage company."
        ),
    ]

    for q_text, a_text, coach_text in qas:
        story.append(KeepTogether([
            Paragraph(q_text, sWarning),
            sp(1),
            Paragraph(f"<b>Answer:</b> {a_text}", sBody),
            Paragraph(f"Coaching note: {coach_text}", sNote),
            sp(3),
        ]))

    # ═══════════════ FINAL PAGE — SOURCING NOTES ════════════════
    story.append(PageBreak())
    story += h1("Source Classification & Areas for Independent Verification", "21")
    story.append(body("All factual claims in this report are classified under one of the following labels:"))
    labels = [
        ("[Verified fact]", "Confirmed from primary/credible secondary sources"),
        ("[Company-reported claim]", "From company press releases or investor announcements — not independently verified"),
        ("[Third-party estimate]", "From market research firms — methodologies vary"),
        ("[Your inference]", "Analyst inference from available data"),
        ("[Your assumption]", "Explicit assumption made for modeling purposes"),
        ("[Your financial scenario]", "Directional scenario, not a forecast"),
    ]
    src_data = [[Paragraph("Label", sTH), Paragraph("Meaning", sTH)]] + \
               [[Paragraph(l, sTD_green), Paragraph(m, sTD)] for l, m in labels]
    story.append(table(src_data, [55*mm, page_w - 55*mm]))
    story.append(sp(4))
    story.append(h2("Areas Requiring Independent Verification Before Investment/Legal Decisions"))
    verify_items = [
        "Exact EPR penalty quantum for specific material categories (PET, cotton, cardboard)",
        "CPCB registration requirements for marketplace intermediaries in each waste category",
        "Exact BRSR Core KPI definitions for waste chain-of-custody under SEBI March 2025 circular",
        "RBI requirements for payment handling and escrow on the platform",
        "Recykal's current B2B industrial product roadmap — especially cotton/cardboard/multi-material specification matching",
        "Current Noida manufacturing unit count — ranges from 1,807 to 2,500+ across sources",
        "Legal classification of specific material streams under HWM Rules 2016",
    ]
    for v in verify_items:
        story.append(bullet(v))
    story.append(sp(4))
    story.append(HRFlowable(width="100%", thickness=1.5, color=MINT))
    story.append(sp(3))
    story.append(Paragraph(
        "End of CircularMatch Master Strategy, Market &amp; Product Intelligence Report — September 2026",
        S("end", fontName="Helvetica-BoldOblique", fontSize=9.5, textColor=MUTED, alignment=TA_CENTER)
    ))
    story.append(Paragraph(
        "Compiled from: Master Analysis (32 sections), Reverification Ledger (20 claims), "
        "Trusted Pilot Core Technical Specifications, 100-Point Matching Engine v2, and Investor Q&amp;A. Team Code Craft, 2026.",
        S("end2", fontName="Helvetica-Oblique", fontSize=8, textColor=MUTED, alignment=TA_CENTER, leading=12)
    ))

    return story

def generate():
    # Pass 1: Build temporary PDF to determine exact section page numbers
    temp_pdf = OUTPUT_PATH.replace(".pdf", "_temp.pdf")
    doc = SimpleDocTemplate(
        temp_pdf, pagesize=A4,
        leftMargin=18*mm, rightMargin=18*mm,
        topMargin=26*mm, bottomMargin=18*mm,
        title="CircularMatch Master Strategy & Market Report 2026",
        author="Antigravity AI Research & Team Code Craft",
        subject="Startup Strategy, Market Intelligence, Product Architecture",
    )
    story1 = build_story()
    doc.build(story1, onFirstPage=_header_footer, onLaterPages=_header_footer)
    
    # Read section page numbers
    reader = pypdf.PdfReader(temp_pdf)
    sec_pages = {}
    for p_idx, page in enumerate(reader.pages, start=1):
        txt = page.extract_text()
        for line in txt.split('\n'):
            line = line.strip()
            if line.startswith("SECTION "):
                sec_num = line.replace("SECTION ", "").split()[0].strip()
                if sec_num not in sec_pages:
                    sec_pages[sec_num] = p_idx

    print(f"Pass 1 extracted section page numbers: {sec_pages}")
    
    # Pass 2: Build final PDF with accurate Table of Contents
    doc_final = SimpleDocTemplate(
        OUTPUT_PATH, pagesize=A4,
        leftMargin=18*mm, rightMargin=18*mm,
        topMargin=26*mm, bottomMargin=18*mm,
        title="CircularMatch Master Strategy & Market Report 2026",
        author="Antigravity AI Research & Team Code Craft",
        subject="Startup Strategy, Market Intelligence, Product Architecture",
    )
    story2 = build_story(toc_dict=sec_pages)
    doc_final.build(story2, onFirstPage=_header_footer, onLaterPages=_header_footer)
    
    if os.path.exists(temp_pdf):
        try:
            os.remove(temp_pdf)
        except Exception:
            pass

    final_reader = pypdf.PdfReader(OUTPUT_PATH)
    print(f"\nSuccessfully generated final PDF: {OUTPUT_PATH}")
    print(f"Total Page Count: {len(final_reader.pages)}")

if __name__ == "__main__":
    generate()
