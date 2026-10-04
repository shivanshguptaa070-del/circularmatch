import os
from PIL import Image
import qrcode
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def build_circularmatch_master_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # ══════════════════════════════════════════════════════════════
    # PALETTE SPECIFICATION (DARK OBSIDIAN THEME)
    # ══════════════════════════════════════════════════════════════
    BG_COLOR = RGBColor(8, 13, 24)          # #080D18 Canvas background
    CARD_BG = RGBColor(17, 26, 46)          # #111A2E Elevated card surface
    CARD_BG_ALT = RGBColor(14, 21, 38)      # #0E1526 Secondary card surface
    BORDER_COLOR = RGBColor(32, 46, 75)     # #202E4B Subtle border
    
    # Semantic Accents
    GREEN_ACC = RGBColor(52, 211, 153)      # #34D399 Brand Green / Circularity
    CYAN_ACC = RGBColor(56, 189, 248)       # #38BDF8 Secondary / Tech AI
    GOLD_ACC = RGBColor(251, 191, 36)       # #FBBF24 Amber / KPI & Value
    ROSE_ACC = RGBColor(251, 113, 133)      # #FB7185 Problem / Broken State
    
    # Typography Colors
    TEXT_WHITE = RGBColor(255, 255, 255)
    TEXT_SILVER = RGBColor(226, 232, 240)   # #E2E8F0 High-contrast body
    TEXT_MUTED = RGBColor(148, 163, 184)    # #94A3B8 Metadata & footnotes

    FONT_MAIN = "Outfit"
    FONT_BOLD = "Outfit"

    # Base paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    sc_dir = os.path.join(base_dir, 'screenshots')
    os.makedirs(sc_dir, exist_ok=True)

    # Generate QR Code image if not present
    qr_path = os.path.join(sc_dir, 'qr_code_live.png')
    qr = qrcode.QRCode(version=1, box_size=10, border=2)
    qr.add_data('https://circularmatch.vercel.app')
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color='#34D399', back_color='#080D18')
    qr_img.save(qr_path)

    # ══════════════════════════════════════════════════════════════
    # HELPER FUNCTIONS
    # ══════════════════════════════════════════════════════════════
    def add_run(para, text, size=11, color=TEXT_SILVER, bold=False, font_name=FONT_MAIN):
        r = para.add_run()
        r.text = text
        r.font.size = Pt(size)
        r.font.color.rgb = color
        r.font.bold = bold
        r.font.name = font_name
        return r

    def add_slide_header(slide, chip_text, title_text, subtitle_text=None, chip_color=GREEN_ACC):
        # 1. Slide Canvas Fill
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_COLOR
        bg.line.fill.background()

        # 2. Header Text Box
        header = slide.shapes.add_textbox(Inches(0.8), Inches(0.36), Inches(11.733), Inches(1.25))
        tf = header.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        # Chip paragraph
        p0 = tf.paragraphs[0]
        p0.space_after = Pt(3)
        add_run(p0, "●  " + chip_text.upper(), size=10, color=chip_color, bold=True, font_name=FONT_BOLD)

        # Title paragraph (Conclusion-driven headline)
        p1 = tf.add_paragraph()
        p1.space_after = Pt(2)
        add_run(p1, title_text, size=21, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)

        # Subtitle paragraph
        if subtitle_text:
            p2 = tf.add_paragraph()
            add_run(p2, subtitle_text, size=12, color=CYAN_ACC, bold=False, font_name=FONT_MAIN)

        # 3. Standardized Footer Bar
        footer = slide.shapes.add_textbox(Inches(0.8), Inches(6.92), Inches(11.733), Inches(0.35))
        ftf = footer.text_frame
        ftf.word_wrap = True
        ftf.margin_left = ftf.margin_top = ftf.margin_right = ftf.margin_bottom = 0
        fp = ftf.paragraphs[0]
        add_run(fp, "♻ CircularMatch  ", size=9, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)
        add_run(fp, "|  HACKDAY 1.0 (DECODEP)  |  Solo Architect: Shivansh Gupta  |  circularmatch.vercel.app", size=9, color=TEXT_MUTED, font_name=FONT_MAIN)

    def create_card(slide, x, y, w, h, bg_color=CARD_BG, border_color=BORDER_COLOR, border_width=1.0):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(border_width)
        return card

    # ══════════════════════════════════════════════════════════════
    # SLIDE 01: COVER & IDENTITY (SOLO BUILDER: SHIVANSH GUPTA)
    # ══════════════════════════════════════════════════════════════
    s1 = prs.slides.add_slide(blank_layout)
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = BG_COLOR
    bg1.line.fill.background()

    # Top Accent Strip
    top_bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(0.42), Inches(11.733), Pt(2.5))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = GREEN_ACC
    top_bar.line.fill.background()

    # Left Column: Brand & Solo Builder (Width 6.4")
    h_box = s1.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(6.4), Inches(2.2))
    htf = h_box.text_frame
    htf.word_wrap = True
    htf.margin_left = htf.margin_top = htf.margin_right = htf.margin_bottom = 0

    p = htf.paragraphs[0]
    p.space_after = Pt(4)
    add_run(p, "●  HACKDAY 1.0 (DECODEP)  ·  SUSTAINTECH 2026  ·  CLEANTECH AI", size=9.5, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)

    p = htf.add_paragraph()
    p.space_after = Pt(2)
    add_run(p, "CircularMatch", size=48, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)

    p = htf.add_paragraph()
    p.space_after = Pt(6)
    add_run(p, "Turn industrial waste into qualified, compliant value.", size=16, color=CYAN_ACC, bold=True, font_name=FONT_BOLD)

    p = htf.add_paragraph()
    add_run(p, "AI-Assisted Secondary Material Qualification & Deterministic Matching Platform. Standardizing plain-language industrial waste into verified Material Passports and matching with mathematical explainability.", size=11, color=TEXT_SILVER)

    # 4 Key Value Pillars (2x2 Grid)
    cover_pillars = [
        ("💬 Plain-Text AI Parser", "Gemini 2.0 structures messy scrap notes into validated JSON schema in <60s.", GREEN_ACC),
        ("📋 ISO 59040 Passports", "Digital Material Passports tracking grade, moisture, lot origin & custody.", CYAN_ACC),
        ("🎯 100-Pt Deterministic Engine", "5-dimension auditable scoring with hard pre-screening eligibility gates.", GOLD_ACC),
        ("⚖️ SEBI BRSR & EPR Trail", "Generates statutory compliance records that make off-platform trading risky.", GREEN_ACC)
    ]
    for i, (title, desc, col) in enumerate(cover_pillars):
        x = 0.8 + (i % 2) * 3.25
        y = 3.05 + (i // 2) * 1.25
        c = create_card(s1, x, y, 3.12, 1.15, CARD_BG, BORDER_COLOR)
        ctf = c.text_frame
        ctf.word_wrap = True
        ctf.margin_left = ctf.margin_top = ctf.margin_right = ctf.margin_bottom = Inches(0.12)
        cp1 = ctf.paragraphs[0]
        cp1.space_after = Pt(2)
        add_run(cp1, title, size=11, color=col, bold=True, font_name=FONT_BOLD)
        cp2 = ctf.add_paragraph()
        add_run(cp2, desc, size=9.5, color=TEXT_SILVER)

    # Solo Creator Card (Bottom Left)
    cred_box = create_card(s1, 0.8, 5.75, 6.37, 1.25, CARD_BG_ALT, GREEN_ACC, 1.5)
    crtf = cred_box.text_frame
    crtf.word_wrap = True
    crtf.margin_left = crtf.margin_top = crtf.margin_right = crtf.margin_bottom = Inches(0.14)
    
    p = crtf.paragraphs[0]
    p.space_after = Pt(2)
    add_run(p, "🏆  SOLO CREATOR & SYSTEM ARCHITECT", size=10, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)

    p = crtf.add_paragraph()
    p.space_after = Pt(2)
    add_run(p, "Architect & Lead Engineer: ", size=9.5, color=TEXT_MUTED, font_name=FONT_BOLD)
    add_run(p, "Shivansh Gupta  ", size=11, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)
    add_run(p, "|  Institution: ", size=9.5, color=TEXT_MUTED)
    add_run(p, "G.L. Bajaj ITM, Greater Noida", size=9.5, color=CYAN_ACC, bold=True)

    p = crtf.add_paragraph()
    add_run(p, "Live Deployment: ", size=9.5, color=TEXT_MUTED, font_name=FONT_BOLD)
    add_run(p, "circularmatch.vercel.app  ", size=9.5, color=GREEN_ACC, bold=True)
    add_run(p, "|  Repository: ", size=9.5, color=TEXT_MUTED)
    add_run(p, "github.com/shivanshguptaa070-del/circularmatch", size=9, color=TEXT_SILVER)

    # Right Column: Platform Hero Preview (Width 5.1")
    img_landing = os.path.join(sc_dir, 'slide1_landing.png')
    if os.path.exists(img_landing):
        s1.shapes.add_picture(img_landing, Inches(7.45), Inches(0.7), width=Inches(5.08))

    stat_box = create_card(s1, 7.45, 4.4, 5.08, 2.6, CARD_BG, CYAN_ACC, 1.2)
    stf = stat_box.text_frame
    stf.word_wrap = True
    stf.margin_left = stf.margin_top = stf.margin_right = stf.margin_bottom = Inches(0.16)

    p = stf.paragraphs[0]
    p.space_after = Pt(4)
    add_run(p, "⚡  AUDITED PERFORMANCE & SPECIFICATIONS", size=11, color=CYAN_ACC, bold=True, font_name=FONT_BOLD)

    p = stf.add_paragraph()
    p.space_after = Pt(2)
    add_run(p, "30–60% Gate Rejection Rate Eliminated", size=11, color=ROSE_ACC, bold=True, font_name=FONT_BOLD)
    p = stf.add_paragraph()
    p.space_after = Pt(4)
    add_run(p, "Pre-screening eligibility gates eliminate bad batches before trucks depart, saving 100% of freight loss.", size=9.5, color=TEXT_SILVER)

    p = stf.add_paragraph()
    p.space_after = Pt(2)
    add_run(p, "100% Verifiable SEBI BRSR & EPR Compliance", size=11, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)
    p = stf.add_paragraph()
    p.space_after = Pt(4)
    add_run(p, "Replaces informal broker chits with ISO 59040 Digital Material Passports for statutory audit.", size=9.5, color=TEXT_SILVER)

    p = stf.add_paragraph()
    p.space_after = Pt(2)
    add_run(p, "Deterministic Engine v2 + Gemini 2.0 Flash", size=11, color=GOLD_ACC, bold=True, font_name=FONT_BOLD)
    p = stf.add_paragraph()
    add_run(p, "Strict temp=0.0 schema extraction paired with auditable 5-dimension scoring across 7 automated test suites.", size=9.5, color=TEXT_SILVER)

    # ══════════════════════════════════════════════════════════════
    # SLIDE 02: THE PROBLEM (FINANCIAL BLEED & BROKEN REALITY)
    # ══════════════════════════════════════════════════════════════
    s2 = prs.slides.add_slide(blank_layout)
    add_slide_header(s2, "Slide 02 · The Problem",
                     "India's factories pay to discard materials that other factories pay to import.",
                     "The gap is not material availability. It is qualification, trust, and matching intelligence.")

    # Left: Giant Bleed Card
    c_bleed = create_card(s2, 0.8, 1.8, 5.6, 4.3, RGBColor(26, 16, 16), ROSE_ACC, 1.8)
    ctf2 = c_bleed.text_frame
    ctf2.word_wrap = True
    ctf2.margin_left = ctf2.margin_top = ctf2.margin_right = ctf2.margin_bottom = Inches(0.25)

    p = ctf2.paragraphs[0]
    p.space_after = Pt(2)
    add_run(p, "DISPOSAL COST LIABILITY (SINGLE NOIDA FACTORY)", size=11, color=ROSE_ACC, bold=True, font_name=FONT_BOLD)

    p = ctf2.add_paragraph()
    p.space_after = Pt(0)
    add_run(p, "₹20,800", size=72, color=GOLD_ACC, bold=True, font_name=FONT_BOLD)

    p = ctf2.add_paragraph()
    p.space_after = Pt(10)
    add_run(p, "per week  (Disposing 2,600 kg clean PET scrap @ ₹8.00/kg fee)", size=12, color=TEXT_SILVER, bold=True)

    p = ctf2.add_paragraph()
    p.space_after = Pt(4)
    add_run(p, "● Direct Cash Drain: ", size=11, color=TEXT_MUTED, font_name=FONT_BOLD)
    add_run(p, "₹10.8 Lakhs/year paid to scrap dealers to haul away usable plastic.", size=11, color=TEXT_WHITE)

    p = ctf2.add_paragraph()
    p.space_after = Pt(4)
    add_run(p, "● Downcycling Destruction: ", size=11, color=TEXT_MUTED, font_name=FONT_BOLD)
    add_run(p, "Brokers mix pristine injection moulding scrap with contaminated municipal waste.", size=11, color=TEXT_SILVER)

    p = ctf2.add_paragraph()
    add_run(p, "● The Irony: ", size=11, color=TEXT_MUTED, font_name=FONT_BOLD)
    add_run(p, "Recyclers in Manesar (48 km away) buy virgin PET at ₹28–32/kg due to lack of trusted supply.", size=11, color=CYAN_ACC, bold=True)

    # Right: The Broken Reality Flow Card
    c_flow = create_card(s2, 6.7, 1.8, 5.833, 4.3, CARD_BG, BORDER_COLOR, 1.0)
    ftf2 = c_flow.text_frame
    ftf2.word_wrap = True
    ftf2.margin_left = ftf2.margin_top = ftf2.margin_right = ftf2.margin_bottom = Inches(0.2)

    p = ftf2.paragraphs[0]
    p.space_after = Pt(8)
    add_run(p, "THE BROKEN INFORMAL INTERMEDIARY CHAIN", size=12, color=CYAN_ACC, bold=True, font_name=FONT_BOLD)

    steps = [
        ("1. Fragmented Communication (WhatsApp & Calls)", "Material details described in vague terms with zero technical data sheet, moisture, or contamination specs.", ROSE_ACC),
        ("2. Opaque Middlemen & Margin Bleed", "Informal scrap dealers take large cuts, obscure the source, and fail to provide statutory GST/EPR invoices.", ROSE_ACC),
        ("3. 30–60% Gate Rejections at Buyer Site", "Trucks arrive at recycler; batches fail manual inspection; loads turned back at 100% wasted haulage cost.", ROSE_ACC),
        ("4. Statutory Liability Under Mandatory BRSR", "SEBI legally mandates top 1,000 listed firms prove recycling trails — informal slips fail regulatory audits.", GOLD_ACC)
    ]
    for s_title, s_desc, s_col in steps:
        p = ftf2.add_paragraph()
        p.space_after = Pt(2)
        add_run(p, "❌  " + s_title, size=11, color=s_col, bold=True, font_name=FONT_BOLD)
        p = ftf2.add_paragraph()
        p.space_after = Pt(8)
        add_run(p, s_desc, size=9.5, color=TEXT_SILVER)

    # Bottom Source Bar
    s_bar = create_card(s2, 0.8, 6.25, 11.733, 0.55, CARD_BG_ALT, GREEN_ACC, 1.0)
    sbtf = s_bar.text_frame
    sbtf.word_wrap = True
    sbtf.margin_left = sbtf.margin_top = sbtf.margin_right = sbtf.margin_bottom = Inches(0.08)
    sp = sbtf.paragraphs[0]
    add_run(sp, "Source Documentation: ", size=10, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)
    add_run(sp, "CPCB Annual Report — India generates 62M tonnes solid waste annually. 40%+ of pre-consumer recyclable industrial waste is degraded or landfilled due to absence of regional qualification infrastructure.", size=9.5, color=TEXT_SILVER)

    # ══════════════════════════════════════════════════════════════
    # SLIDE 03: WHY EXISTING SOLUTIONS FAIL (BEFORE VS AFTER)
    # ══════════════════════════════════════════════════════════════
    s3 = prs.slides.add_slide(blank_layout)
    add_slide_header(s3, "Slide 03 · Market Failure & Transformation",
                     "Discovery is solved. Qualification is not.",
                     "Existing ad boards list waste. They cannot verify it, grade it, or route it with precision.")

    # Column A: Existing Approach (ROSE theme)
    c_before = create_card(s3, 0.8, 1.8, 5.7, 4.85, RGBColor(26, 16, 16), ROSE_ACC, 1.5)
    btf3 = c_before.text_frame
    btf3.word_wrap = True
    btf3.margin_left = btf3.margin_top = btf3.margin_right = btf3.margin_bottom = Inches(0.2)

    p = btf3.paragraphs[0]
    p.space_after = Pt(6)
    add_run(p, "LEGACY CHANNELS (CLASSIFIEDS & BROKERS)", size=12, color=ROSE_ACC, bold=True, font_name=FONT_BOLD)

    before_points = [
        ("Generic classified ad boards", "Free-text descriptions with zero technical parameters, polymer grade, or melt flow specs."),
        ("Unverified 'Grade A' claims", "Zero external verification causing 30–60% gate rejections upon physical truck arrival."),
        ("No logistics or schedule alignment", "Buyer and seller geographically misaligned; freight costs swallow all material margin."),
        ("Black-box subjective pricing", "Opaque dealers manipulate spot rates with zero formulaic or historical basis."),
        ("Zero ISO compliance documentation", "Informal cash chits provide zero digital trail for statutory SEBI BRSR audits."),
        ("High buyer search friction", "Procurement teams spend 2–3 weeks calling unvetted contacts for a single batch.")
    ]
    for b_title, b_desc in before_points:
        p = btf3.add_paragraph()
        p.space_after = Pt(1)
        add_run(p, "❌  " + b_title + ": ", size=10.5, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)
        add_run(p, b_desc, size=9.5, color=TEXT_MUTED)

    # Column B: CircularMatch (GREEN theme)
    c_after = create_card(s3, 6.833, 1.8, 5.7, 4.85, CARD_BG, GREEN_ACC, 1.5)
    atf3 = c_after.text_frame
    atf3.word_wrap = True
    atf3.margin_left = atf3.margin_top = atf3.margin_right = atf3.margin_bottom = Inches(0.2)

    p = atf3.paragraphs[0]
    p.space_after = Pt(6)
    add_run(p, "THE CIRCULARMATCH PARADIGM", size=12, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)

    after_points = [
        ("AI structured extraction (<60s)", "Gemini 2.0 Flash transforms plain language into strict schema-validated JSON records."),
        ("ISO 59040 Digital Material Passports", "4-tier verification hierarchy (Self-Declared → Commercial → Lab Certified)."),
        ("100-Point deterministic matching", "Auditable 5-dimension engine scoring compatibility, quality, quantity, logistics & evidence."),
        ("Pre-screened eligibility gates", "Hard gating eliminates contaminated batches before transport — zero gate turnbacks."),
        ("Built-in Scope 3 LCA carbon math", "Calculates net avoided CO₂e using ISO 59020:2024 and GHG Protocol Scope 3 Cat. 5."),
        ("Statutory audit compliance trail", "Enterprise audit export ready for mandatory SEBI BRSR and CPCB EPR submissions.")
    ]
    for a_title, a_desc in after_points:
        p = atf3.add_paragraph()
        p.space_after = Pt(1)
        add_run(p, "✅  " + a_title + ": ", size=10.5, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)
        add_run(p, a_desc, size=9.5, color=TEXT_SILVER)

    # ══════════════════════════════════════════════════════════════
    # SLIDE 04: THE SOLUTION PIPELINE (INPUT TO SETTLEMENT)
    # ══════════════════════════════════════════════════════════════
    s4 = prs.slides.add_slide(blank_layout)
    add_slide_header(s4, "Slide 04 · The Solution Pipeline",
                     "One sentence becomes a controlled material record.",
                     "AI structures plain language. Deterministic rules qualify the match.")

    # 6 Sequential Step Cards (Horizontal Flow)
    pipe_steps = [
        ("01", "Natural Language", "Factory manager types free-text description of scrap.", GREEN_ACC),
        ("02", "Gemini 2.0 Flash", "Extracts technical parameters into strict JSON schema at temp=0.", CYAN_ACC),
        ("03", "Human Review Gate", "Manager confirms/edits draft fields before lot publishing.", GREEN_ACC),
        ("04", "100-Pt Deterministic Engine", "Hard eligibility gates filter; 5 dimensions score.", GOLD_ACC),
        ("05", "Explainable Match", "Sub-score breakdown, Leaflet route, and net economic swing.", CYAN_ACC),
        ("06", "Passport & Settlement", "ISO 59040 lot passport issued; statutory EPR trail logged.", GREEN_ACC)
    ]
    for i, (num, title, desc, col) in enumerate(pipe_steps):
        x = 0.8 + i * 1.98
        c = create_card(s4, x, 1.8, 1.85, 2.7, CARD_BG, BORDER_COLOR, 1.0)
        ctf = c.text_frame
        ctf.word_wrap = True
        ctf.margin_left = ctf.margin_top = ctf.margin_right = ctf.margin_bottom = Inches(0.12)
        
        p = ctf.paragraphs[0]
        p.space_after = Pt(2)
        add_run(p, num, size=24, color=col, bold=True, font_name=FONT_BOLD)
        
        p = ctf.add_paragraph()
        p.space_after = Pt(4)
        add_run(p, title, size=11, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)
        
        p = ctf.add_paragraph()
        add_run(p, desc, size=9, color=TEXT_SILVER)

    # Bottom Split: 3 Guardrail Cards (Left) + UI Preview (Right)
    guardrails = [
        ("🔒 Strict Temp = 0.0", "Zero hallucination drift across critical material specs & grades.", CYAN_ACC),
        ("🛡️ Hard Eligibility Gates", "Automated pre-screening filters out bad batches prior to scoring.", GREEN_ACC),
        ("⚡ Rule-Based Fallback", "Deterministic offline engine operates seamlessly if external AI fails.", GOLD_ACC)
    ]
    for i, (g_title, g_desc, g_col) in enumerate(guardrails):
        x = 0.8 + i * 2.55
        gc = create_card(s4, x, 4.75, 2.42, 1.9, CARD_BG_ALT, g_col, 1.0)
        gtf = gc.text_frame
        gtf.word_wrap = True
        gtf.margin_left = gtf.margin_top = gtf.margin_right = gtf.margin_bottom = Inches(0.14)
        gp = gtf.paragraphs[0]
        gp.space_after = Pt(3)
        add_run(gp, g_title, size=11, color=g_col, bold=True, font_name=FONT_BOLD)
        gp2 = gtf.add_paragraph()
        add_run(gp2, g_desc, size=9.5, color=TEXT_SILVER)

    # Right side: Screenshot of the wizard UI
    img_wizard = os.path.join(sc_dir, 'slide2_list_waste.png')
    if os.path.exists(img_wizard):
        s4.shapes.add_picture(img_wizard, Inches(8.65), Inches(4.75), width=Inches(3.88))

    # ══════════════════════════════════════════════════════════════
    # SLIDE 05: LIVE PRODUCT DEMO (HERO SELLER DASHBOARD)
    # ══════════════════════════════════════════════════════════════
    s5 = prs.slides.add_slide(blank_layout)
    add_slide_header(s5, "Slide 05 · Live Product Demo",
                     "Every recommendation carries its evidence and route.",
                     "Built, deployed & live at circularmatch.vercel.app · Zero mockups, 100% working software.")

    # Primary Screenshot: Seller Dashboard (Width 7.8")
    img_seller = os.path.join(sc_dir, 'slide3_seller_dashboard.png')
    if os.path.exists(img_seller):
        s5.shapes.add_picture(img_seller, Inches(0.8), Inches(1.8), width=Inches(7.7))

    # Right Column: Live Verification Callouts (Width 3.8")
    c_demo_info = create_card(s5, 8.7, 1.8, 3.833, 4.85, CARD_BG, GREEN_ACC, 1.2)
    dtf5 = c_demo_info.text_frame
    dtf5.word_wrap = True
    dtf5.margin_left = dtf5.margin_top = dtf5.margin_right = dtf5.margin_bottom = Inches(0.18)

    p = dtf5.paragraphs[0]
    p.space_after = Pt(4)
    add_run(p, "LIVE NCR MATCHMAKING AUDIT", size=12, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)

    demo_callouts = [
        ("→ 94/100 Top Match: ReLoop Polymers", "Buyer: ReLoop Polymers (Manesar). Status: 'Needs Sample' badge. High confidence industrial PET match.", GREEN_ACC),
        ("→ Formula Breakdown Validated", "Exact PET match (+35) · Grade A 0.4% moisture (+20) · 2,600 kg batch in 2–5K kg range (+20) · Noida→Manesar 48km route (+10).", CYAN_ACC),
        ("→ Delivered Unit Economics", "Gross: ₹36,400 | Freight: ₹6,240 | Net Profit: ₹30,160/wk. Replaces a ₹20,800/wk disposal cost.", GOLD_ACC),
        ("→ Total Economic Swing", "₹50,960/week (+₹26.5 Lakhs annually) and 3,900 kg CO₂e avoided per week for a single factory pair.", GREEN_ACC)
    ]
    for d_title, d_desc, d_col in demo_callouts:
        p = dtf5.add_paragraph()
        p.space_after = Pt(2)
        add_run(p, d_title, size=10.5, color=d_col, bold=True, font_name=FONT_BOLD)
        p = dtf5.add_paragraph()
        p.space_after = Pt(6)
        add_run(p, d_desc, size=9.5, color=TEXT_SILVER)

    p = dtf5.add_paragraph()
    add_run(p, "Live Access: ", size=9.5, color=TEXT_MUTED, font_name=FONT_BOLD)
    add_run(p, "circularmatch.vercel.app/dashboard?demo=seller", size=9.5, color=CYAN_ACC, bold=True)

    # ══════════════════════════════════════════════════════════════
    # SLIDE 06: THE 100-POINT ENGINE (CORE INNOVATION & EXPLAINABILITY)
    # ══════════════════════════════════════════════════════════════
    s6 = prs.slides.add_slide(blank_layout)
    add_slide_header(s6, "Slide 06 · Core Innovation & Explainability",
                     "AI structures the material. Deterministic rules qualify the match.",
                     "Explainable decisions with mathematical audit trails — not black-box scoring.")

    # Left: The 100-Point Formula (Width 4.8")
    c_form = create_card(s6, 0.8, 1.8, 4.8, 4.85, CARD_BG, BORDER_COLOR, 1.0)
    ftf6 = c_form.text_frame
    ftf6.word_wrap = True
    ftf6.margin_left = ftf6.margin_top = ftf6.margin_right = ftf6.margin_bottom = Inches(0.2)

    p = ftf6.paragraphs[0]
    p.space_after = Pt(6)
    add_run(p, "PROPRIETARY 100-POINT FORMULA", size=12, color=GOLD_ACC, bold=True, font_name=FONT_BOLD)

    formula_items = [
        ("1. Material Compatibility", "35 pts", "Polymer grade, chemical composition, melt flow index matching buyer technical specs."),
        ("2. Quality & Contamination", "20 pts", "Moisture percentage (<0.5%), foreign matter, storage condition, and degradation."),
        ("3. Quantity Alignment", "20 pts", "Batch volume vs buyer batch processing capacity and delivery frequency."),
        ("4. Location & Logistics", "15 pts", "Road freight distance, transport corridor access, haulage feasibility & rate."),
        ("5. Evidence & Passport", "10 pts", "ISO 59040 passport completeness, lab test certificates, and chain-of-custody.")
    ]
    for f_name, f_pts, f_detail in formula_items:
        p = ftf6.add_paragraph()
        p.space_after = Pt(1)
        add_run(p, f_name + " — ", size=10.5, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)
        add_run(p, f_pts, size=11, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)
        p = ftf6.add_paragraph()
        p.space_after = Pt(4)
        add_run(p, f_detail, size=9, color=TEXT_MUTED)

    p = ftf6.add_paragraph()
    p.space_after = Pt(2)
    add_run(p, "────────────────────────────", size=9, color=TEXT_MUTED)
    p = ftf6.add_paragraph()
    add_run(p, "Deterministic Python Execution: ", size=9.5, color=CYAN_ACC, bold=True, font_name=FONT_BOLD)
    add_run(p, "Unit-tested across 7 test suites. Zero random drift.", size=9, color=TEXT_SILVER)

    # Right: ReLoop Match Detail & Embedded Screenshot (Width 6.7")
    c_reloop = create_card(s6, 5.8, 1.8, 6.733, 2.5, CARD_BG_ALT, GREEN_ACC, 1.2)
    rtf6 = c_reloop.text_frame
    rtf6.word_wrap = True
    rtf6.margin_left = rtf6.margin_top = rtf6.margin_right = rtf6.margin_bottom = Inches(0.18)

    p = rtf6.paragraphs[0]
    p.space_after = Pt(2)
    add_run(p, "AUDITED MATCH CARD: RELOOP POLYMERS (SCORE: 94 / 100)", size=11.5, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)

    audit_lines = [
        ("● Industrial PET Flake:", "Exact Material Match (+35 pts)"),
        ("● Industrial Grade, 0.4% Moisture:", "Within Buyer Limit (+20 pts)"),
        ("● 2,600 kg/wk (Buyer Range 2–5K):", "In Range (+20 pts)"),
        ("● Noida to Manesar, 48 km:", "Inter-State Corridor (+10 pts)"),
        ("● 4/5 Lot Attributes Filed:", "Tier 2 Commercial Evidence (+9 pts)")
    ]
    for a_lbl, a_val in audit_lines:
        p = rtf6.add_paragraph()
        p.space_after = Pt(1)
        add_run(p, a_lbl + " ", size=10, color=TEXT_SILVER)
        add_run(p, a_val, size=10, color=CYAN_ACC, bold=True)

    # Bottom Right: Secondary Screenshot (slide4_match_detail.png)
    img_match = os.path.join(sc_dir, 'slide4_match_detail.png')
    if os.path.exists(img_match):
        s6.shapes.add_picture(img_match, Inches(5.8), Inches(4.45), width=Inches(6.733))

    # ══════════════════════════════════════════════════════════════
    # SLIDE 07: MARKET OPPORTUNITY (BOTTOM-UP SIZING)
    # ══════════════════════════════════════════════════════════════
    s7 = prs.slides.add_slide(blank_layout)
    add_slide_header(s7, "Slide 07 · Market Opportunity",
                     "A Rs.3,000–10,000 Crore NCR material flow is ready for a trusted qualification layer.",
                     "Capturing value across high-density industrial manufacturing corridors.")

    # 3 Columns: TAM / SAM / SOM
    col_w = 3.75
    # TAM
    c_tam = create_card(s7, 0.8, 1.8, col_w, 4.3, CARD_BG, GOLD_ACC, 1.0)
    ttf = c_tam.text_frame
    ttf.word_wrap = True
    ttf.margin_left = ttf.margin_top = ttf.margin_right = ttf.margin_bottom = Inches(0.2)
    p = ttf.paragraphs[0]
    p.space_after = Pt(2)
    add_run(p, "TAM — NATIONAL MARKET", size=11, color=GOLD_ACC, bold=True, font_name=FONT_BOLD)
    p = ttf.add_paragraph()
    p.space_after = Pt(0)
    add_run(p, "₹1.8–2.2T", size=40, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)
    p = ttf.add_paragraph()
    p.space_after = Pt(8)
    add_run(p, "Secondary material recovery sector annually across India", size=10.5, color=TEXT_MUTED)
    p = ttf.add_paragraph()
    p.space_after = Pt(3)
    add_run(p, "● 62M tonnes solid waste/year (CPCB)", size=10, color=TEXT_SILVER)
    p = ttf.add_paragraph()
    p.space_after = Pt(3)
    add_run(p, "● 40%+ industrial pre-consumer scrap", size=10, color=TEXT_SILVER)
    p = ttf.add_paragraph()
    add_run(p, "● Mandatory 25% recycled content by 2026", size=10, color=CYAN_ACC, bold=True)

    # SAM
    c_sam = create_card(s7, 4.79, 1.8, col_w, 4.3, CARD_BG, CYAN_ACC, 1.0)
    stf7 = c_sam.text_frame
    stf7.word_wrap = True
    stf7.margin_left = stf7.margin_top = stf7.margin_right = stf7.margin_bottom = Inches(0.2)
    p = stf7.paragraphs[0]
    p.space_after = Pt(2)
    add_run(p, "SAM — DELHI NCR CORRIDOR", size=11, color=CYAN_ACC, bold=True, font_name=FONT_BOLD)
    p = stf7.add_paragraph()
    p.space_after = Pt(0)
    add_run(p, "₹3,000–10K Cr", size=36, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)
    p = stf7.add_paragraph()
    p.space_after = Pt(8)
    add_run(p, "Addressable secondary industrial material flow in NCR", size=10.5, color=TEXT_MUTED)
    p = stf7.add_paragraph()
    p.space_after = Pt(3)
    add_run(p, "● 9 Concentrated Industrial Hubs:", size=10, color=TEXT_WHITE, bold=True)
    p = stf7.add_paragraph()
    p.space_after = Pt(4)
    add_run(p, "Noida, Greater Noida, Ghaziabad, Faridabad, Gurugram, Manesar, Sonipat, Bhiwadi, Panipat", size=9, color=TEXT_SILVER)
    p = stf7.add_paragraph()
    add_run(p, "● 5 Focus Material Streams: PET, Cotton, Cardboard, Steel, HDPE", size=9.5, color=CYAN_ACC)

    # SOM
    c_som = create_card(s7, 8.78, 1.8, col_w, 4.3, CARD_BG, GREEN_ACC, 1.5)
    omtf = c_som.text_frame
    omtf.word_wrap = True
    omtf.margin_left = omtf.margin_top = omtf.margin_right = omtf.margin_bottom = Inches(0.2)
    p = omtf.paragraphs[0]
    p.space_after = Pt(2)
    add_run(p, "SOM — PHASE 1 PILOT TARGET", size=11, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)
    p = omtf.add_paragraph()
    p.space_after = Pt(0)
    add_run(p, "₹35–50 Cr", size=40, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)
    p = omtf.add_paragraph()
    p.space_after = Pt(8)
    add_run(p, "Recovered enterprise value across 100 matched facilities", size=10.5, color=TEXT_MUTED)
    p = omtf.add_paragraph()
    p.space_after = Pt(3)
    add_run(p, "● 100 Matched industrial facilities", size=10, color=TEXT_SILVER)
    p = omtf.add_paragraph()
    p.space_after = Pt(3)
    add_run(p, "● 25,000 tonnes diverted annually", size=10, color=TEXT_SILVER)
    p = omtf.add_paragraph()
    p.space_after = Pt(3)
    add_run(p, "● ~40,000 tonnes CO₂e avoided", size=10, color=TEXT_SILVER)
    p = omtf.add_paragraph()
    add_run(p, "● 1.0–1.5% platform facilitation fee", size=10, color=GREEN_ACC, bold=True)

    # Bottom Math
    b_math = create_card(s7, 0.8, 6.25, 11.733, 0.55, CARD_BG_ALT, GREEN_ACC, 1.0)
    mtf = b_math.text_frame
    mtf.word_wrap = True
    mtf.margin_left = mtf.margin_top = mtf.margin_right = mtf.margin_bottom = Inches(0.08)
    mp = mtf.paragraphs[0]
    add_run(mp, "Bottom-Up Pilot Math: ", size=10, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)
    add_run(mp, "100 generators × avg. ₹30,000/week economic swing × 50 weeks = ₹15 Crore pilot trade volume → at 1.5% platform fee = ₹22.5 Lakh revenue in Phase 1 alone. Illustrative scenario — not a certified forecast.", size=9.5, color=TEXT_SILVER)

    # ══════════════════════════════════════════════════════════════
    # SLIDE 08: BUSINESS MODEL (3 REVENUE PILLARS)
    # ══════════════════════════════════════════════════════════════
    s8 = prs.slides.add_slide(blank_layout)
    add_slide_header(s8, "Slide 08 · Business Model & Monetization",
                     "Compliance SaaS makes the marketplace hard to bypass.",
                     "Revenue follows trust and compliance — not fragile transaction commission.")

    pillars = [
        ("PILLAR 1: TRANSACTION LAYER", "1.0–1.5%", "Facilitation Fee on Settled Volume",
         "Charged per completed, verified material transaction between generator and buyer.",
         ["Invoiced only upon verified gate acceptance and weighbridge receipt.",
          "Automated escrow and billing integration.",
          "Zero upfront fees for scrap listing to maximize SME liquidity."],
         GOLD_ACC),
        ("PILLAR 2: COMPLIANCE LAYER", "₹15K–50K", "Monthly Enterprise Compliance SaaS",
         "Digital Material Passports and statutory audit documentation.",
         ["ISO 59040 Digital Material Passports per lot.",
          "Automated SEBI BRSR Core sustainability disclosure exports.",
          "CPCB EPR credit tracking and statutory audit trail generation."],
         GREEN_ACC),
        ("PILLAR 3: INTELLIGENCE LAYER", "Data API", "Regional Material & Logistics Analytics",
         "Premium market intelligence for enterprise procurement and recyclers.",
         ["Real-time secondary material spot price benchmarks across NCR.",
          "Corridor-level material flow volume and availability forecasts.",
          "Logistics & carbon abatement optimization APIs."],
         CYAN_ACC)
    ]
    for i, (tag, stat, stat_lbl, sub, points, col) in enumerate(pillars):
        x = 0.8 + i * 3.98
        c = create_card(s8, x, 1.8, 3.75, 4.3, CARD_BG, col, 1.2)
        ctf = c.text_frame
        ctf.word_wrap = True
        ctf.margin_left = ctf.margin_top = ctf.margin_right = ctf.margin_bottom = Inches(0.2)
        
        p = ctf.paragraphs[0]
        p.space_after = Pt(2)
        add_run(p, tag, size=10.5, color=col, bold=True, font_name=FONT_BOLD)
        
        p = ctf.add_paragraph()
        p.space_after = Pt(0)
        add_run(p, stat, size=32, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)
        
        p = ctf.add_paragraph()
        p.space_after = Pt(6)
        add_run(p, stat_lbl, size=10.5, color=TEXT_MUTED, bold=True)
        
        p = ctf.add_paragraph()
        p.space_after = Pt(6)
        add_run(p, sub, size=9.5, color=TEXT_SILVER)
        
        for pt in points:
            p = ctf.add_paragraph()
            p.space_after = Pt(3)
            add_run(p, "● " + pt, size=9, color=TEXT_SILVER)

    # Bottom Insight Box
    b_ins = create_card(s8, 0.8, 6.25, 11.733, 0.55, CARD_BG_ALT, CYAN_ACC, 1.0)
    itf = b_ins.text_frame
    itf.word_wrap = True
    itf.margin_left = itf.margin_top = itf.margin_right = itf.margin_bottom = Inches(0.08)
    ip = itf.paragraphs[0]
    add_run(ip, "The Defensibility Moat: ", size=10, color=CYAN_ACC, bold=True, font_name=FONT_BOLD)
    add_run(ip, "If parties trade off-platform to save the 1% fee, they lose the certified ISO 59040 passport and statutory chain-of-custody required by SEBI and CPCB. Compliance locks in the marketplace.", size=9.5, color=TEXT_WHITE)

    # ══════════════════════════════════════════════════════════════
    # SLIDE 09: QUANTIFIED IMPACT (ECONOMIC SWING & CARBON ABATEMENT)
    # ══════════════════════════════════════════════════════════════
    s9 = prs.slides.add_slide(blank_layout)
    add_slide_header(s9, "Slide 09 · Quantified Impact",
                     "One matched pair: Rs.26.5 Lakhs recovered. 202 tonnes CO₂e avoided annually.",
                     "At 100 facilities: Rs.35–50 Crore recovered and 40,000 tonnes CO₂e eliminated.")

    # Left: 3 KPI Hero Cards (Width 7.6")
    kpis = [
        ("₹50,960 / wk", "Net Economic Swing (Single Plant)",
         "Turns ₹20,800/wk disposal liability into ₹30,160/wk net secondary sales profit = ₹26.5 Lakhs/year cash turnaround.",
         GOLD_ACC),
        ("3,900 kg CO₂e / wk", "Net Carbon Abatement (ISO 59020:2024)",
         "Virgin PET displacement net of road freight emissions = 202 Tonnes CO₂e avoided annually per plant.",
         GREEN_ACC),
        ("25,000 Tonnes / yr", "Phase 1 Industrial Corridor Target (100 Facilities)",
         "₹35–50 Crore recovered value and ~40,000 tonnes CO₂e eliminated across Delhi NCR industrial manufacturing clusters.",
         CYAN_ACC)
    ]
    for i, (big, title, desc, col) in enumerate(kpis):
        y = 1.8 + i * 1.45
        c = create_card(s9, 0.8, y, 7.5, 1.32, CARD_BG, col, 1.2)
        ctf = c.text_frame
        ctf.word_wrap = True
        ctf.margin_left = ctf.margin_top = ctf.margin_right = ctf.margin_bottom = Inches(0.14)
        
        p = ctf.paragraphs[0]
        p.space_after = Pt(2)
        add_run(p, big, size=24, color=col, bold=True, font_name=FONT_BOLD)
        add_run(p, "   |   " + title, size=11, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)
        
        p = ctf.add_paragraph()
        add_run(p, desc, size=9.5, color=TEXT_SILVER)

    # Right: Secondary Screenshot (slide5_impact.png)
    img_impact = os.path.join(sc_dir, 'slide5_impact.png')
    if os.path.exists(img_impact):
        s9.shapes.add_picture(img_impact, Inches(8.5), Inches(1.8), width=Inches(4.033))

    # Bottom Footnote Bar
    f_bar = create_card(s9, 0.8, 6.25, 11.733, 0.55, CARD_BG_ALT, GREEN_ACC, 1.0)
    ftfb = f_bar.text_frame
    ftfb.word_wrap = True
    ftfb.margin_left = ftfb.margin_top = ftfb.margin_right = ftfb.margin_bottom = Inches(0.08)
    fbp = ftfb.paragraphs[0]
    add_run(fbp, "Methodology Governance: ", size=10, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)
    add_run(fbp, "Delhi NCR PET scenario. Carbon accounting: ISO 59020:2024 and GHG Protocol Scope 3 Category 5 (End-of-life treatment of sold products). Estimates are indicative demo models — not certified third-party LCA.", size=9.5, color=TEXT_SILVER)

    # ══════════════════════════════════════════════════════════════
    # SLIDE 10: COMPETITIVE MOAT (CAPABILITY MATRIX)
    # ══════════════════════════════════════════════════════════════
    s10 = prs.slides.add_slide(blank_layout)
    add_slide_header(s10, "Slide 10 · Competitive Analysis & Moat",
                     "We do not win on discovery. We win on qualification and compliance.",
                     "Classifieds list raw posts. ERPs track internal inventory. CircularMatch guarantees cross-enterprise trust.")

    # Table of Capabilities
    rows = 8
    cols = 4
    table_shape = s10.shapes.add_table(rows, cols, Inches(0.8), Inches(1.8), Inches(11.733), Inches(4.3))
    table = table_shape.table
    table.columns[0].width = Inches(3.2)
    table.columns[1].width = Inches(2.7)
    table.columns[2].width = Inches(2.7)
    table.columns[3].width = Inches(3.133)

    matrix_data = [
        ("Capability / Parameter", "Generic Classifieds\n(IndiaMART / TradeIndia)", "Enterprise ERPs\n(SAP / Tally Prime)", "CircularMatch\nPlatform"),
        ("AI Plain-Text Structuring", "❌ None (free-text ads)", "❌ Complex manual forms", "✅ Gemini 2.0 Flash + Fallback"),
        ("100-Pt Deterministic Score", "❌ Unsorted listings", "❌ No external market", "✅ 100% Auditable Formula"),
        ("ISO Material Passport", "❌ None", "⚠️ Internal lot tracking", "✅ ISO 59040:2025 Standard"),
        ("Hard Eligibility Gating", "❌ Buyer screens junk", "❌ N/A", "✅ Automated Pre-screening"),
        ("Scope 3 Carbon LCA", "❌ None", "⚠️ Costly custom add-on", "✅ Built-in ISO 59020 Math"),
        ("SME Accessibility & Cost", "✅ High reach, low trust", "❌ High implementation cost", "✅ Zero-friction instant web"),
        ("Statutory Audit Trail", "❌ Paper receipts fail audit", "⚠️ Manual internal slips", "✅ SEBI BRSR & EPR Ready")
    ]

    for r_idx, row in enumerate(matrix_data):
        for c_idx, val in enumerate(row):
            cell = table.cell(r_idx, c_idx)
            cell.fill.solid()
            if r_idx == 0:
                cell.fill.fore_color.rgb = CARD_BG_ALT
            else:
                cell.fill.fore_color.rgb = CARD_BG if c_idx < 3 else RGBColor(12, 28, 22)
            
            ctf = cell.text_frame
            ctf.word_wrap = True
            ctf.margin_left = ctf.margin_top = ctf.margin_right = ctf.margin_bottom = Inches(0.06)
            p = ctf.paragraphs[0]
            
            if r_idx == 0:
                col = GREEN_ACC if c_idx == 3 else TEXT_WHITE
                add_run(p, val, size=10, color=col, bold=True, font_name=FONT_BOLD)
            else:
                if c_idx == 0:
                    add_run(p, val, size=9.5, color=TEXT_WHITE, bold=True)
                elif c_idx == 3:
                    add_run(p, val, size=9.5, color=GREEN_ACC, bold=True)
                elif "❌" in val:
                    add_run(p, val, size=9.5, color=ROSE_ACC)
                elif "⚠️" in val:
                    add_run(p, val, size=9.5, color=GOLD_ACC)
                else:
                    add_run(p, val, size=9.5, color=TEXT_SILVER)

    # Bottom Note
    b_cmp = create_card(s10, 0.8, 6.25, 11.733, 0.55, CARD_BG_ALT, CYAN_ACC, 1.0)
    ctfb = b_cmp.text_frame
    ctfb.word_wrap = True
    ctfb.margin_left = ctfb.margin_top = ctfb.margin_right = ctfb.margin_bottom = Inches(0.08)
    cp = ctfb.paragraphs[0]
    add_run(cp, "Strategic Moat: ", size=10, color=CYAN_ACC, bold=True, font_name=FONT_BOLD)
    add_run(cp, "Classifieds have raw traffic scale. ERPs have enterprise inertia. CircularMatch wins on automated qualification, auditability, and instant zero-friction SME onboarding.", size=9.5, color=TEXT_WHITE)

    # ══════════════════════════════════════════════════════════════
    # SLIDE 11: SOLO BUILDER & ARCHITECTURE (SHIVANSH GUPTA SOLO)
    # ══════════════════════════════════════════════════════════════
    s11 = prs.slides.add_slide(blank_layout)
    add_slide_header(s11, "Slide 11 · Solo Builder & System Architecture",
                     "One engineer. One complete deployed system. Every line — shipped.",
                     "Architected, engineered, tested, and deployed end-to-end solo by Shivansh Gupta.")

    # Left: Solo Builder Hero Profile Card (Width 4.5")
    c_solo = create_card(s11, 0.8, 1.8, 4.5, 4.3, CARD_BG, GREEN_ACC, 1.5)
    stf11 = c_solo.text_frame
    stf11.word_wrap = True
    stf11.margin_left = stf11.margin_top = stf11.margin_right = stf11.margin_bottom = Inches(0.2)

    p = stf11.paragraphs[0]
    p.space_after = Pt(2)
    add_run(p, "SOLO CREATOR & SYSTEM ARCHITECT", size=10, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)

    p = stf11.add_paragraph()
    p.space_after = Pt(2)
    add_run(p, "Shivansh Gupta", size=24, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)

    p = stf11.add_paragraph()
    p.space_after = Pt(4)
    add_run(p, "B.Tech Computer Science & Engineering", size=11, color=CYAN_ACC, bold=True)
    p = stf11.add_paragraph()
    p.space_after = Pt(10)
    add_run(p, "G.L. Bajaj Institute of Technology & Management, Greater Noida", size=10, color=TEXT_MUTED)

    solo_creds = [
        ("100% of Codebase Authored Solo", "From FastAPI backend & PostgreSQL schemas to React 18 UI & Gemini AI pipelines."),
        ("7 Automated Pytest Test Suites", "20 unit tests covering API flows, extraction, and matching with 100% pass rate."),
        ("Full-Stack Production Deployment", "Live Vercel frontend + Render cloud API + Supabase PostgreSQL."),
        ("ISO Standards Integration", "Engineered ISO 59040 Material Passports & ISO 59020 Scope 3 LCA calculators.")
    ]
    for c_title, c_desc in solo_creds:
        p = stf11.add_paragraph()
        p.space_after = Pt(1)
        add_run(p, "● " + c_title + ": ", size=10, color=TEXT_WHITE, bold=True)
        add_run(p, c_desc, size=9, color=TEXT_SILVER)

    # Right: 4 Architecture Domains Mastered (Width 7.0")
    domains = [
        ("FastAPI Backend & 100-Pt Engine v2", "Deterministic 5-dimension scoring, hard eligibility pre-screening gates, DemoStore repository pattern, and SlowAPI rate limiting.", CYAN_ACC),
        ("React 18 & Minimax Design System", "Vite + TypeScript architecture, dual Seller/Buyer workspaces, Leaflet geospatial routing map, and Recharts analytics dashboards.", GREEN_ACC),
        ("Google Gemini 2.0 Flash Extraction", "Structured JSON extraction at strict temp=0.0 with offline rule-based fallback ensuring zero downtime hallucination-free parsing.", GOLD_ACC),
        ("Supabase Cloud & Enterprise Compliance", "12 relational tables, Row-Level Security (RLS) policies, multi-tenant RBAC, and statutory SEBI BRSR / CPCB EPR audit trails.", CYAN_ACC)
    ]
    for i, (d_title, d_desc, d_col) in enumerate(domains):
        y = 1.8 + i * 1.08
        c = create_card(s11, 5.5, y, 7.033, 0.98, CARD_BG_ALT, d_col, 1.0)
        dtf = c.text_frame
        dtf.word_wrap = True
        dtf.margin_left = dtf.margin_top = dtf.margin_right = dtf.margin_bottom = Inches(0.12)
        
        p = dtf.paragraphs[0]
        p.space_after = Pt(2)
        add_run(p, "⚡ " + d_title, size=11, color=d_col, bold=True, font_name=FONT_BOLD)
        
        p = dtf.add_paragraph()
        add_run(p, d_desc, size=9, color=TEXT_SILVER)

    # Bottom Verification Strip
    b_test = create_card(s11, 0.8, 6.25, 11.733, 0.55, CARD_BG_ALT, GREEN_ACC, 1.0)
    ttf = b_test.text_frame
    ttf.word_wrap = True
    ttf.margin_left = ttf.margin_top = ttf.margin_right = ttf.margin_bottom = Inches(0.08)
    tp = ttf.paragraphs[0]
    add_run(tp, "Audited Test Coverage: ", size=10, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)
    add_run(tp, "7 test files · test_api_flow · test_demo_accounts · test_extraction · test_full_suite · test_matching · test_matching_v2 · test_trusted_pilot_core · 100% pass rate", size=9.5, color=TEXT_SILVER)

    # ══════════════════════════════════════════════════════════════
    # SLIDE 12: CALL TO ACTION & CLOSE (QR CODE + LIVE LINKS)
    # ══════════════════════════════════════════════════════════════
    s12 = prs.slides.add_slide(blank_layout)
    add_slide_header(s12, "Slide 12 · Call to Action & Vision",
                     "The technical core is built. Help us turn the first 5 audited material flows into the network.",
                     "Commercial proof is the next milestone. Experience the live product today.")

    # Left: Action Links & Repository (Width 6.2")
    c_links = create_card(s12, 0.8, 1.8, 6.2, 4.3, CARD_BG, CYAN_ACC, 1.2)
    ltf = c_links.text_frame
    ltf.word_wrap = True
    ltf.margin_left = ltf.margin_top = ltf.margin_right = ltf.margin_bottom = Inches(0.2)

    p = ltf.paragraphs[0]
    p.space_after = Pt(6)
    add_run(p, "GET INVOLVED · LIVE ACCESS & REPOSITORY", size=12, color=CYAN_ACC, bold=True, font_name=FONT_BOLD)

    actions = [
        ("PRIMARY: Try the Live Deployed Platform", "https://circularmatch.vercel.app", "Experience Seller/Buyer/Admin dashboards, the AI Listing Wizard, and real Delhi NCR match cards.", GREEN_ACC),
        ("SECONDARY: Interactive Swagger API Documentation", "https://circularmatch-api.onrender.com/docs", "Explore and execute all 15+ live REST endpoints with full JSON schemas.", CYAN_ACC),
        ("TERTIARY: Complete Source Code Repository", "https://github.com/shivanshguptaa070-del/circularmatch", "Review the full-stack architecture, 100-pt engine, Supabase migrations, and tests.", GOLD_ACC)
    ]
    for a_title, a_url, a_desc, a_col in actions:
        p = ltf.add_paragraph()
        p.space_after = Pt(1)
        add_run(p, "● " + a_title, size=11, color=a_col, bold=True, font_name=FONT_BOLD)
        p = ltf.add_paragraph()
        p.space_after = Pt(2)
        add_run(p, "  → " + a_url, size=10, color=TEXT_WHITE, bold=True)
        p = ltf.add_paragraph()
        p.space_after = Pt(6)
        add_run(p, "  " + a_desc, size=9, color=TEXT_MUTED)

    # Right: Hero Scannable QR Code Card (Width 5.3")
    c_qr = create_card(s12, 7.2, 1.8, 5.333, 4.3, CARD_BG, GREEN_ACC, 1.5)
    qtf = c_qr.text_frame
    qtf.word_wrap = True
    qtf.margin_left = qtf.margin_top = qtf.margin_right = qtf.margin_bottom = Inches(0.18)

    p = qtf.paragraphs[0]
    p.space_after = Pt(4)
    add_run(p, "SCAN TO EXPERIENCE LIVE ON YOUR PHONE", size=11, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)

    # Add QR code image centered
    if os.path.exists(qr_path):
        s12.shapes.add_picture(qr_path, Inches(8.35), Inches(2.4), width=Inches(3.0))

    q_sub = s12.shapes.add_textbox(Inches(7.3), Inches(5.5), Inches(5.1), Inches(0.55))
    qstf = q_sub.text_frame
    qstf.word_wrap = True
    qp = qstf.paragraphs[0]
    qp.alignment = PP_ALIGN.CENTER
    add_run(qp, "Direct link to live production application on Vercel Edge", size=9.5, color=TEXT_SILVER)

    # Bottom Credits Strip (NO "Thank You")
    b_close = create_card(s12, 0.8, 6.25, 11.733, 0.55, RGBColor(10, 30, 22), GREEN_ACC, 1.2)
    cltf = b_close.text_frame
    cltf.word_wrap = True
    cltf.margin_left = cltf.margin_top = cltf.margin_right = cltf.margin_bottom = Inches(0.08)
    clp = cltf.paragraphs[0]
    add_run(clp, "CircularMatch  |  Solo Architect: Shivansh Gupta  |  G.L. Bajaj ITM  |  HACKDAY 1.0 (DECODEP) & SustainTech 2026", size=10, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)

    # ══════════════════════════════════════════════════════════════
    # SLIDE 13 (APPENDIX): TECHNICAL ARCHITECTURE (FULL-STACK)
    # ══════════════════════════════════════════════════════════════
    s13 = prs.slides.add_slide(blank_layout)
    add_slide_header(s13, "Appendix · System Architecture",
                     "Three-tier cloud architecture designed for zero downtime and instant enterprise migration.",
                     "Production-ready decoupling of UI, AI extraction layer, and deterministic matching engine.")

    # Left: 3 Tiers
    tiers = [
        ("Tier 1: Presentation & Routing (Vercel Edge)", "React 18 · TypeScript · Vite 8 · Framer Motion · Leaflet Geo Routing · TanStack Query v5",
         "Modular dual-workspace architecture allowing instant switching between Waste Generator, Recycler Buyer, and Admin Cluster views with zero page reloads.",
         CYAN_ACC),
        ("Tier 2: Application & AI Intelligence (Render Cloud)", "FastAPI · Pydantic v2 Schemas · Gemini 2.0 Flash Adapter · 100-Pt Deterministic Engine v2 · SlowAPI",
         "Strict temp=0.0 schema validation. Deterministic 5-dimension matching engine decoupled from generative AI. Built-in ISO 59020 Scope 3 LCA calculators.",
         GREEN_ACC),
        ("Tier 3: Persistence & Compliance (Supabase Cloud)", "PostgreSQL 15 · 12 Relational Tables · Row-Level Security (RLS) · In-Memory DemoStore Fallback",
         "Multi-tenant RBAC schemas, immutable lot audit trails, and automatic offline repository fallback guaranteeing 100% demo reliability without DB latency.",
         GOLD_ACC)
    ]
    for i, (t_title, t_stack, t_desc, t_col) in enumerate(tiers):
        y = 1.8 + i * 1.45
        c = create_card(s13, 0.8, y, 7.5, 1.32, CARD_BG, t_col, 1.0)
        ttf = c.text_frame
        ttf.word_wrap = True
        ttf.margin_left = ttf.margin_top = ttf.margin_right = ttf.margin_bottom = Inches(0.14)
        
        p = ttf.paragraphs[0]
        p.space_after = Pt(2)
        add_run(p, t_title, size=11, color=t_col, bold=True, font_name=FONT_BOLD)
        
        p = ttf.add_paragraph()
        p.space_after = Pt(3)
        add_run(p, t_stack, size=9.5, color=TEXT_WHITE, bold=True)
        
        p = ttf.add_paragraph()
        add_run(p, t_desc, size=9, color=TEXT_SILVER)

    # Right: Dual Workspaces Screenshot
    img_workspaces = os.path.join(sc_dir, 'slide3_dual_workspaces.png')
    if os.path.exists(img_workspaces):
        s13.shapes.add_picture(img_workspaces, Inches(8.5), Inches(1.8), width=Inches(4.033))

    f_arch = create_card(s13, 0.8, 6.25, 11.733, 0.55, CARD_BG_ALT, GREEN_ACC, 1.0)
    fatf = f_arch.text_frame
    fatf.word_wrap = True
    fatf.margin_left = fatf.margin_top = fatf.margin_right = fatf.margin_bottom = Inches(0.08)
    fap = fatf.paragraphs[0]
    add_run(fap, "Enterprise Migration: ", size=10, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)
    add_run(fap, "In-Memory DemoStore repository pattern swaps to live cloud PostgreSQL via a single DATABASE_URL environment variable. Zero business logic modification required.", size=9.5, color=TEXT_SILVER)

    # ══════════════════════════════════════════════════════════════
    # SLIDE 14 (APPENDIX): LCA CARBON METHODOLOGY & STANDARDS
    # ══════════════════════════════════════════════════════════════
    s14 = prs.slides.add_slide(blank_layout)
    add_slide_header(s14, "Appendix · LCA Carbon Accounting Methodology",
                     "Empirical carbon abatement methodology governed by international standards.",
                     "Transparent accounting under ISO 59020:2024 & GHG Protocol Scope 3 Category 5.")

    # Left: Formula Breakdown (Width 4.8")
    c_lca_f = create_card(s14, 0.8, 1.8, 4.8, 4.3, CARD_BG, GREEN_ACC, 1.2)
    ltf14 = c_lca_f.text_frame
    ltf14.word_wrap = True
    ltf14.margin_left = ltf14.margin_top = ltf14.margin_right = ltf14.margin_bottom = Inches(0.2)

    p = ltf14.paragraphs[0]
    p.space_after = Pt(4)
    add_run(p, "GOVERNING LCA FORMULA", size=12, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)

    p = ltf14.add_paragraph()
    p.space_after = Pt(8)
    add_run(p, "Avoided CO₂e = (Q × R × D × F_virgin) + (Q × F_disposal) - E_transport", size=10, color=CYAN_ACC, bold=True)

    terms = [
        ("Q", "Waste lot quantity in kilograms (e.g. 2,600 kg PET)"),
        ("R", "Material recovery efficiency rate (e.g. 85% for PET)"),
        ("D", "Virgin material displacement ratio (e.g. 85%)"),
        ("F_virgin", "Virgin material carbon factor (1.80 kg CO₂e/kg)"),
        ("F_disposal", "Avoided landfill/disposal factor (0.05 kg CO₂e/kg)"),
        ("E_transport", "Road freight transit emissions across 48 km corridor")
    ]
    for var, defn in terms:
        p = ltf14.add_paragraph()
        p.space_after = Pt(2)
        add_run(p, var + " = ", size=10, color=GOLD_ACC, bold=True)
        add_run(p, defn, size=9.5, color=TEXT_SILVER)

    # Right: Benchmark Material Factors Table (Width 6.7")
    t_shape14 = s14.shapes.add_table(6, 5, Inches(5.8), Inches(1.8), Inches(6.733), Inches(4.3))
    t14 = t_shape14.table
    t14.columns[0].width = Inches(1.733)
    t14.columns[1].width = Inches(1.25)
    t14.columns[2].width = Inches(1.25)
    t14.columns[3].width = Inches(1.25)
    t14.columns[4].width = Inches(1.25)

    lca_table_data = [
        ("Material", "Virgin Factor\n(kg CO₂e/kg)", "Recovery\nRate (%)", "Displacement\nRatio (%)", "Disposal Factor\n(kg CO₂e/kg)"),
        ("PET Plastic", "1.80", "85%", "85%", "0.05"),
        ("Cotton Textiles", "1.30", "72%", "70%", "0.12"),
        ("Corrugated Box", "0.95", "82%", "75%", "0.25"),
        ("Mild Steel Scrap", "1.65", "92%", "90%", "0.02"),
        ("HDPE Industrial", "1.70", "80%", "80%", "0.05")
    ]
    for r_idx, row in enumerate(lca_table_data):
        for c_idx, val in enumerate(row):
            cell = t14.cell(r_idx, c_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = CARD_BG_ALT if r_idx == 0 else CARD_BG
            ctf = cell.text_frame
            ctf.word_wrap = True
            ctf.margin_left = ctf.margin_top = ctf.margin_right = ctf.margin_bottom = Inches(0.06)
            p = ctf.paragraphs[0]
            if r_idx == 0:
                add_run(p, val, size=9, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)
            else:
                col = TEXT_WHITE if c_idx == 0 else TEXT_SILVER
                add_run(p, val, size=9.5, color=col, bold=(c_idx==0))

    # Bottom Disclaimer
    b_disc = create_card(s14, 0.8, 6.25, 11.733, 0.55, CARD_BG_ALT, GOLD_ACC, 1.0)
    dtf14 = b_disc.text_frame
    dtf14.word_wrap = True
    dtf14.margin_left = dtf14.margin_top = dtf14.margin_right = dtf14.margin_bottom = Inches(0.08)
    dp = dtf14.paragraphs[0]
    add_run(dp, "Standard Governance: ", size=10, color=GOLD_ACC, bold=True, font_name=FONT_BOLD)
    add_run(dp, "Calculations adhere to ISO 59020:2024 (Circular economy — Measuring circularity performance) and GHG Protocol Scope 3 Category 5. Illustrative demo scenarios — not certified third-party LCA.", size=9.5, color=TEXT_SILVER)

    # ══════════════════════════════════════════════════════════════
    # SLIDE 15 (APPENDIX): PRODUCT ROADMAP & EXECUTION HORIZONS
    # ══════════════════════════════════════════════════════════════
    s15 = prs.slides.add_slide(blank_layout)
    add_slide_header(s15, "Appendix · Product Roadmap & Horizons",
                     "From hackathon-winning MVP to India's certified secondary material registry.",
                     "Structured 3-phase execution horizon spanning product, pilot, and national scale.")

    phases = [
        ("PHASE 1: MVP COMPLETE", "LIVE NOW",
         [("✅ FastAPI + React 18 Architecture", "Full-stack decoupled architecture deployed on Vercel & Render."),
          ("✅ Gemini 2.0 Flash Extraction", "Schema-validated natural language parser with rule-based offline fallback."),
          ("✅ 100-Pt Deterministic Engine v2", "5-dimension scoring with pre-screening eligibility gates."),
          ("✅ ISO 59040 Material Passports", "Digital lot passports with 4-tier verification hierarchy."),
          ("✅ 7 Pytest Automated Suites", "20 unit tests with 100% pass rate covering all core workflows.")],
         GREEN_ACC),
        ("PHASE 2: REGIONAL PILOT", "MONTHS 1–6",
         [("⏳ Supabase Auth + SMS OTP", "Frictionless mobile login for factory floor supervisors."),
          ("⏳ 25 Onboarded NCR Generators", "Pilot corridor focused in Greater Noida, Ghaziabad & Manesar."),
          ("⏳ Google Maps Distance Matrix", "Dynamic real-time road haulage freight quote integration."),
          ("⏳ Lab Certificate PDF Storage", "S3/Supabase encrypted storage for Tier 4 certified lab reports."),
          ("⏳ E-Way Bill & GST Invoicing", "Automated compliance billing generation upon lot transaction.")],
         CYAN_ACC),
        ("PHASE 3: NATIONAL SCALE", "MONTHS 6–18",
         [("⏳ Statutory CPCB EPR Integration", "Direct integration with National CPCB EPR plastic credits portal."),
          ("⏳ Multi-Corridor Expansion", "Expanding to Ahmedabad–Vadodara, Pune–Pimpri & Chennai belts."),
          ("⏳ ERP Enterprise Plugins", "Automated scrap sync plugins for Tally Prime and SAP Business One."),
          ("⏳ Progressive Web App (PWA)", "Mobile app with offline QR lot scanning and electronic gate passes."),
          ("⏳ Secondary Material Futures", "Pricing hedging and forward contracts for high-volume recyclers.")],
         GOLD_ACC)
    ]

    for i, (p_title, p_time, items, col) in enumerate(phases):
        x = 0.8 + i * 3.98
        c = create_card(s15, x, 1.8, 3.75, 4.3, CARD_BG, col, 1.2)
        ctf = c.text_frame
        ctf.word_wrap = True
        ctf.margin_left = ctf.margin_top = ctf.margin_right = ctf.margin_bottom = Inches(0.2)
        
        p = ctf.paragraphs[0]
        p.space_after = Pt(2)
        add_run(p, p_title, size=11, color=col, bold=True, font_name=FONT_BOLD)
        
        p = ctf.add_paragraph()
        p.space_after = Pt(6)
        add_run(p, p_time, size=10, color=TEXT_MUTED, bold=True)
        
        for item_t, item_d in items:
            p = ctf.add_paragraph()
            p.space_after = Pt(1)
            add_run(p, item_t, size=9.5, color=TEXT_WHITE, bold=True)
            p = ctf.add_paragraph()
            p.space_after = Pt(3)
            add_run(p, item_d, size=8.5, color=TEXT_SILVER)

    b_road = create_card(s15, 0.8, 6.25, 11.733, 0.55, CARD_BG_ALT, GREEN_ACC, 1.0)
    rtfb = b_road.text_frame
    rtfb.word_wrap = True
    rtfb.margin_left = rtfb.margin_top = rtfb.margin_right = rtfb.margin_bottom = Inches(0.08)
    rp = rtfb.paragraphs[0]
    add_run(rp, "Commercial Vision: ", size=10, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)
    add_run(rp, "CircularMatch transitions from an AI hackathon MVP into the indispensable statutory trust and compliance rail for India's ₹2 Trillion secondary material market.", size=9.5, color=TEXT_WHITE)

    # ══════════════════════════════════════════════════════════════
    # SAVE OUTPUT FILES
    # ══════════════════════════════════════════════════════════════
    output_dirs = [
        os.path.join(base_dir, '..', 'pptx_slides'),
        base_dir,
        os.path.join(base_dir, '..')
    ]

    import sys
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

    for d in output_dirs:
        os.makedirs(d, exist_ok=True)
        out_path = os.path.join(d, "CircularMatch_Final_Deck.pptx")
        prs.save(out_path)
        print(f"[SUCCESS] Saved presentation to: {os.path.abspath(out_path)}")

    # Automated PDF Export via PowerPoint COM
    try:
        import win32com.client
        primary_pptx = os.path.abspath(os.path.join(base_dir, '..', 'CircularMatch_Final_Deck.pptx'))
        primary_pdf = os.path.abspath(os.path.join(base_dir, '..', 'CircularMatch_Final_Deck.pdf'))
        powerpoint = win32com.client.Dispatch("PowerPoint.Application")
        deck = powerpoint.Presentations.Open(primary_pptx, WithWindow=False)
        deck.SaveAs(primary_pdf, 32)  # 32 = ppSaveAsPDF
        deck.Close()
        powerpoint.Quit()
        print(f"[SUCCESS] Exported high-fidelity PDF to: {primary_pdf}")
        
        # Mirror PDF to output dirs
        for d in output_dirs:
            target_pdf = os.path.abspath(os.path.join(d, "CircularMatch_Final_Deck.pdf"))
            if not os.path.exists(target_pdf) or not os.path.samefile(primary_pdf, target_pdf):
                import shutil
                shutil.copyfile(primary_pdf, target_pdf)
                print(f"[SUCCESS] Mirrored PDF to: {target_pdf}")
    except Exception as e:
        print(f"[INFO] PDF auto-export notice ({e})")

if __name__ == '__main__':
    build_circularmatch_master_deck()
