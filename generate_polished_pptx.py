import os
from PIL import Image
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_polished_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Premium Color Palette
    BG_COLOR = RGBColor(8, 13, 24)           # #080d18 deep obsidian canvas
    CARD_BG = RGBColor(17, 26, 46)          # #111a2e elevated card surface
    CARD_BG_ALT = RGBColor(14, 21, 38)      # #0e1526 secondary card surface
    BORDER_COLOR = RGBColor(32, 46, 75)     # #202e4b subtle crisp border
    
    # Vibrant Accents
    GREEN_ACC = RGBColor(52, 211, 153)      # #34d399 emerald mint
    CYAN_ACC = RGBColor(56, 189, 248)       # #38bdf8 electric sky/cyan
    GOLD_ACC = RGBColor(251, 191, 36)       # #fbbf24 amber gold
    ROSE_ACC = RGBColor(251, 113, 133)      # #fb7185 clean coral/rose
    
    # Typography Colors
    TEXT_WHITE = RGBColor(255, 255, 255)
    TEXT_SILVER = RGBColor(226, 232, 240)   # #e2e8f0 high contrast body
    TEXT_MUTED = RGBColor(148, 163, 184)    # #94a3b8 metadata
    
    # Modern Rounder Font: Outfit (geometric rounded typography)
    FONT_MAIN = "Outfit"
    FONT_BOLD = "Outfit"

    sc_dir = os.path.join(os.getcwd(), 'screenshots')

    def set_run_font(run, font_name=FONT_MAIN):
        run.font.name = font_name

    def add_run(para, text, size=10, color=TEXT_SILVER, bold=False, font_name=FONT_MAIN):
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
        header = slide.shapes.add_textbox(Inches(0.8), Inches(0.38), Inches(11.733), Inches(1.2))
        tf = header.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        # Chip paragraph
        p0 = tf.paragraphs[0]
        p0.space_after = Pt(2)
        add_run(p0, "●  " + chip_text.upper(), size=9.5, color=chip_color, bold=True, font_name=FONT_BOLD)

        # Title paragraph
        p1 = tf.add_paragraph()
        p1.space_after = Pt(2)
        add_run(p1, title_text, size=21, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)

        # Subtitle paragraph
        if subtitle_text:
            p2 = tf.add_paragraph()
            add_run(p2, subtitle_text, size=12, color=CYAN_ACC, bold=False, font_name=FONT_MAIN)

        # 3. Footer Bar
        footer = slide.shapes.add_textbox(Inches(0.8), Inches(6.92), Inches(11.733), Inches(0.35))
        ftf = footer.text_frame
        ftf.word_wrap = True
        ftf.margin_left = ftf.margin_top = ftf.margin_right = ftf.margin_bottom = 0
        fp = ftf.paragraphs[0]
        add_run(fp, "♻ CircularMatch  ", size=9, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)
        add_run(fp, "|  HACKDAY 1.0  |  Solo Levelling — Shivansh Gupta  |  github.com/shivanshguptaa070-del/circularmatch", size=9, color=TEXT_MUTED, font_name=FONT_MAIN)

    # ═════════════════════════════════════════════════
    # SLIDE 0: FRONT PAGE / COVER PAGE
    # ═════════════════════════════════════════════════
    s0 = prs.slides.add_slide(blank_layout)
    
    # Background Canvas
    bg0 = s0.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
    bg0.fill.solid()
    bg0.fill.fore_color.rgb = BG_COLOR
    bg0.line.fill.background()

    # Top Glowing Accent Strip
    top_bar = s0.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(0.42), Inches(11.733), Pt(2))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = GREEN_ACC
    top_bar.line.fill.background()

    # Left Column: Brand & Value Proposition
    # 1. Header Box
    h0 = s0.shapes.add_textbox(Inches(0.8), Inches(0.65), Inches(6.3), Inches(2.05))
    h0_tf = h0.text_frame
    h0_tf.word_wrap = True
    h0_tf.margin_left = h0_tf.margin_top = h0_tf.margin_right = h0_tf.margin_bottom = 0

    p = h0_tf.paragraphs[0]
    p.space_after = Pt(4)
    add_run(p, "●  HACKDAY 1.0 SUBMISSION  ·  ORGANIZED BY TEAM DECODEP  ·  CLEANTECH & AI", size=9.5, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)

    p = h0_tf.add_paragraph()
    p.space_after = Pt(4)
    add_run(p, "CircularMatch", size=42, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)

    p = h0_tf.add_paragraph()
    p.space_after = Pt(6)
    add_run(p, "AI-Assisted Industrial Material Qualification & Matching Platform", size=14, color=CYAN_ACC, bold=True, font_name=FONT_BOLD)

    p = h0_tf.add_paragraph()
    add_run(p, "Standardizing plain-language industrial waste into verified Material Passports and matching them against buyer acceptance criteria with explainable AI & verifiable SEBI BRSR compliance.", size=10, color=TEXT_SILVER)

    # 2. Four Architecture Feature Cards (2x2 Grid)
    cover_features = [
        ("💬 Plain-Language AI Parser", "Gemini 2.0 structures plain text into schema-validated JSON records instantly.", GREEN_ACC),
        ("📋 Verifiable Material Passports", "Tracks grade, lot location, contamination, evidence states & gates.", CYAN_ACC),
        ("🎯 6-D Deterministic Engine", "Mathematically matches lots against buyer specs with 100% transparency.", GREEN_ACC),
        ("⚖️ SEBI BRSR & EPR Trail", "Generates un-bypassable statutory chain-of-custody audit records.", CYAN_ACC)
    ]

    for i, (f_title, f_desc, f_col) in enumerate(cover_features):
        x = Inches(0.8 + (i % 2) * 3.22)
        y = Inches(2.85 + (i // 2) * 1.25)
        card = s0.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(3.08), Inches(1.15))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = BORDER_COLOR
        card.line.width = Pt(1)
        ctf = card.text_frame
        ctf.word_wrap = True
        ctf.margin_left = ctf.margin_top = ctf.margin_right = ctf.margin_bottom = Inches(0.12)
        cp1 = ctf.paragraphs[0]
        cp1.space_after = Pt(2)
        add_run(cp1, f_title, size=10, color=f_col, bold=True, font_name=FONT_BOLD)
        cp2 = ctf.add_paragraph()
        add_run(cp2, f_desc, size=8.5, color=TEXT_SILVER)

    # 3. Submission Credentials Box
    cred_box = s0.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.5), Inches(6.3), Inches(1.5))
    cred_box.fill.solid()
    cred_box.fill.fore_color.rgb = CARD_BG_ALT
    cred_box.line.color.rgb = GREEN_ACC
    cred_box.line.width = Pt(1.2)
    crtf = cred_box.text_frame
    crtf.word_wrap = True
    crtf.margin_left = crtf.margin_top = crtf.margin_right = crtf.margin_bottom = Inches(0.15)
    
    p = crtf.paragraphs[0]
    p.space_after = Pt(3)
    add_run(p, "🏆  OFFICIAL HACKATHON CREDENTIALS", size=9.5, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)

    p = crtf.add_paragraph()
    p.space_after = Pt(2)
    add_run(p, "Team / Creator: ", size=9, color=TEXT_MUTED, font_name=FONT_BOLD)
    add_run(p, "Solo Levelling — Shivansh Gupta  ", size=9.5, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)
    add_run(p, "|  Track: ", size=9, color=TEXT_MUTED, font_name=FONT_BOLD)
    add_run(p, "Circularity & CleanTech AI", size=9, color=CYAN_ACC, font_name=FONT_BOLD)

    p = crtf.add_paragraph()
    p.space_after = Pt(2)
    add_run(p, "GitHub Repository: ", size=9, color=TEXT_MUTED, font_name=FONT_BOLD)
    add_run(p, "github.com/shivanshguptaa070-del/circularmatch", size=9, color=CYAN_ACC, bold=True, font_name=FONT_MAIN)

    p = crtf.add_paragraph()
    p.space_after = Pt(2)
    add_run(p, "Live Demonstration: ", size=9, color=TEXT_MUTED, font_name=FONT_BOLD)
    add_run(p, "localhost:5173/dashboard?demo=seller", size=9, color=GREEN_ACC, bold=True, font_name=FONT_MAIN)
    add_run(p, "  (Seller / Buyer / Admin)", size=8.5, color=TEXT_SILVER)

    p = crtf.add_paragraph()
    add_run(p, "Production Stack: ", size=8.5, color=TEXT_MUTED, font_name=FONT_BOLD)
    add_run(p, "React 18 + TypeScript + FastAPI + Supabase PostgreSQL + Google Gemini 2.0 Flash", size=8.5, color=TEXT_MUTED)

    # Right Column: Platform Hero Showcase Frame
    frame_title = s0.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.4), Inches(0.65), Inches(5.133), Inches(0.4))
    frame_title.fill.solid()
    frame_title.fill.fore_color.rgb = CARD_BG_ALT
    frame_title.line.color.rgb = BORDER_COLOR
    frame_title.line.width = Pt(1)
    ft_tf = frame_title.text_frame
    ft_tf.word_wrap = True
    ft_tf.margin_left = ft_tf.margin_top = ft_tf.margin_right = ft_tf.margin_bottom = Inches(0.08)
    p = ft_tf.paragraphs[0]
    add_run(p, "● app.circularmatch.in · Delhi NCR Secondary Material Intelligence", size=9, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)

    # Hero Image
    img0 = os.path.join(sc_dir, 'slide1_landing.png')
    if os.path.exists(img0):
        s0.shapes.add_picture(img0, Inches(7.4), Inches(1.12), width=Inches(5.133))

    # Bottom Impact Metrics Card
    stat_box = s0.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.4), Inches(4.45), Inches(5.133), Inches(2.55))
    stat_box.fill.solid()
    stat_box.fill.fore_color.rgb = CARD_BG
    stat_box.line.color.rgb = CYAN_ACC
    stat_box.line.width = Pt(1.2)
    stf = stat_box.text_frame
    stf.word_wrap = True
    stf.margin_left = stf.margin_top = stf.margin_right = stf.margin_bottom = Inches(0.15)

    p = stf.paragraphs[0]
    p.space_after = Pt(4)
    add_run(p, "⚡  CORE PLATFORM VALUE METRICS", size=10, color=CYAN_ACC, bold=True, font_name=FONT_BOLD)

    p = stf.add_paragraph()
    p.space_after = Pt(2)
    add_run(p, "30–60% Gate Rejection Rate Eliminated", size=9.5, color=ROSE_ACC, bold=True, font_name=FONT_BOLD)
    p = stf.add_paragraph()
    p.space_after = Pt(4)
    add_run(p, "Pre-qualified material specifications eliminate gate turn-backs and 100% freight losses.", size=8.5, color=TEXT_SILVER)

    p = stf.add_paragraph()
    p.space_after = Pt(2)
    add_run(p, "100% Verifiable BRSR Compliance Trail", size=9.5, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)
    p = stf.add_paragraph()
    p.space_after = Pt(4)
    add_run(p, "Replaces informal broker slips with digital chain-of-custody for statutory SEBI audits.", size=8.5, color=TEXT_SILVER)

    p = stf.add_paragraph()
    p.space_after = Pt(2)
    add_run(p, "< 50ms Deterministic Scoring with Explainable AI", size=9.5, color=GOLD_ACC, bold=True, font_name=FONT_BOLD)
    p = stf.add_paragraph()
    add_run(p, "Deterministic calculations paired with Gemini plain-language justifications (strengths, risks).", size=8.5, color=TEXT_SILVER)

    # ═════════════════════════════════════════════════
    # SLIDE 1: Problem Statement
    # ═════════════════════════════════════════════════
    s1 = prs.slides.add_slide(blank_layout)
    add_slide_header(s1, "Slide 1 of 7 — Problem Statement",
                     "India's ₹80,000 Cr industrial waste market runs on WhatsApp, phone calls & paper receipts.",
                     "The real problem is not discovery. It is qualification.")

    card1 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.8), Inches(4.3))
    card1.fill.solid()
    card1.fill.fore_color.rgb = CARD_BG
    card1.line.color.rgb = BORDER_COLOR
    card1.line.width = Pt(1.2)
    ctf1 = card1.text_frame
    ctf1.word_wrap = True
    ctf1.margin_left = ctf1.margin_top = ctf1.margin_right = ctf1.margin_bottom = Inches(0.25)

    p = ctf1.paragraphs[0]
    p.space_after = Pt(4)
    add_run(p, "🚫  30–60% Rejected at the Gate", size=13, color=ROSE_ACC, bold=True, font_name=FONT_BOLD)
    p = ctf1.add_paragraph()
    p.space_after = Pt(12)
    add_run(p, "Industrial buyers reject 30–60% of material upon physical arrival — wrong grade, mismatched technical specs, or undisclosed contamination causing entire truckloads to turn back at 100% freight loss.", size=10, color=TEXT_SILVER)

    p = ctf1.add_paragraph()
    p.space_after = Pt(4)
    add_run(p, "📜  Mandatory BRSR with Zero Documentation", size=13, color=ROSE_ACC, bold=True, font_name=FONT_BOLD)
    p = ctf1.add_paragraph()
    p.space_after = Pt(12)
    add_run(p, "India's SEBI now legally mandates top 1,000 listed companies prove waste recycling in annual BRSR audits — but factories currently have zero digital documentation.", size=10, color=TEXT_SILVER)

    p = ctf1.add_paragraph()
    p.space_after = Pt(4)
    add_run(p, "⚖️  Informal Brokers = Direct Legal Liability", size=13, color=ROSE_ACC, bold=True, font_name=FONT_BOLD)
    p = ctf1.add_paragraph()
    add_run(p, "Brokers move material fast but produce no compliant paper trail — creating direct regulatory liability for manufacturers filing statutory disclosures with SEBI.", size=10, color=TEXT_SILVER)

    bb1 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.25), Inches(11.733), Inches(0.55))
    bb1.fill.solid()
    bb1.fill.fore_color.rgb = RGBColor(10, 30, 22)
    bb1.line.color.rgb = GREEN_ACC
    bb1.line.width = Pt(1)
    btf1 = bb1.text_frame
    bp1 = btf1.paragraphs[0]
    bp1.alignment = PP_ALIGN.CENTER
    add_run(bp1, "Bottom line: Factories have material. Buyers have requirements. Nobody can prove the material actually meets them.", size=10.5, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)

    img1 = os.path.join(sc_dir, 'slide1_landing.png')
    if os.path.exists(img1):
        s1.shapes.add_picture(img1, Inches(6.9), Inches(1.8), width=Inches(5.6))

    # ═════════════════════════════════════════════════
    # SLIDE 2: Proposed Solution
    # ═════════════════════════════════════════════════
    s2 = prs.slides.add_slide(blank_layout)
    add_slide_header(s2, "Slide 2 of 7 — Proposed Solution",
                     "CircularMatch — AI-Assisted Industrial Material Qualification & Matching",
                     "Standardizing plain-language waste into verified Material Passports & explainable matches.")

    features = [
        ("💬 Plain Language Input", "Supplier describes waste naturally — Gemini AI structures it instantly into a standardized, schema-validated record.", GREEN_ACC),
        ("📋 Material Passport", "Every material gets a passport tracking grade, quantity, lot location, evidence state, and eligibility gates.", CYAN_ACC),
        ("🎯 6-Dimension Engine", "Proprietary matching algorithm scores lots against exact buyer acceptance criteria deterministically.", GREEN_ACC),
        ("💡 Explainable AI Reasoning", "Gemini generates readable 'Why this match?' justifications detailing strengths, risks, and recommendations.", CYAN_ACC)
    ]

    for i, (f_title, f_desc, f_col) in enumerate(features):
        x = Inches(0.8 + (i % 2) * 2.95)
        y = Inches(1.8 + (i // 2) * 1.45)
        card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(2.85), Inches(1.35))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = BORDER_COLOR
        card.line.width = Pt(1)
        ctf = card.text_frame
        ctf.word_wrap = True
        ctf.margin_left = ctf.margin_top = ctf.margin_right = ctf.margin_bottom = Inches(0.14)
        cp1 = ctf.paragraphs[0]
        cp1.space_after = Pt(3)
        add_run(cp1, f_title, size=11, color=f_col, bold=True, font_name=FONT_BOLD)
        cp2 = ctf.add_paragraph()
        add_run(cp2, f_desc, size=9.5, color=TEXT_SILVER)

    flow_box = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.85), Inches(5.8), Inches(1.95))
    flow_box.fill.solid()
    flow_box.fill.fore_color.rgb = CARD_BG_ALT
    flow_box.line.color.rgb = GREEN_ACC
    flow_box.line.width = Pt(1.2)
    ftf = flow_box.text_frame
    ftf.word_wrap = True
    ftf.margin_left = ftf.margin_top = ftf.margin_right = ftf.margin_bottom = Inches(0.16)
    fp = ftf.paragraphs[0]
    fp.space_after = Pt(4)
    add_run(fp, "THE CORE PLATFORM FLOW", size=10, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)

    flow_steps = [
        ("1. Plain Language Input", " — Generator speaks or types naturally"),
        ("2. AI Extraction", " — Structured JSON schema material record"),
        ("3. Material Passport", " — Real-time digital evidence states & lot verification"),
        ("4. 6-Factor Matching", " — Deterministic evaluation against buyer specs"),
        ("5. Ranked Results", " — Gemini explainable reasoning justifications"),
        ("6. Chain-of-Custody", " — Sample request → offer → verified shipment")
    ]
    for st_title, st_desc in flow_steps:
        sp = ftf.add_paragraph()
        sp.space_after = Pt(2)
        add_run(sp, st_title, size=9.5, color=CYAN_ACC, bold=True, font_name=FONT_BOLD)
        add_run(sp, st_desc, size=9.5, color=TEXT_SILVER)

    img2 = os.path.join(sc_dir, 'slide2_passport.png')
    if os.path.exists(img2):
        s2.shapes.add_picture(img2, Inches(6.9), Inches(1.8), width=Inches(5.6))

    # ═════════════════════════════════════════════════
    # SLIDE 3: Target Users
    # ═════════════════════════════════════════════════
    s3 = prs.slides.add_slide(blank_layout)
    add_slide_header(s3, "Slide 3 of 7 — Target Users",
                     "Two sides. One regulatory & financial imperative.",
                     "Solving compliance failure for sellers and gate rejection financial loss for buyers.")

    sup_card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.8), Inches(2.1))
    sup_card.fill.solid()
    sup_card.fill.fore_color.rgb = CARD_BG
    sup_card.line.color.rgb = GREEN_ACC
    sup_card.line.width = Pt(1.5)
    s_tf = sup_card.text_frame
    s_tf.word_wrap = True
    s_tf.margin_left = s_tf.margin_top = s_tf.margin_right = s_tf.margin_bottom = Inches(0.18)
    sp = s_tf.paragraphs[0]
    sp.space_after = Pt(4)
    add_run(sp, "🏭  SUPPLIER SIDE: EHS / Operations Manager", size=12.5, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)
    sp = s_tf.add_paragraph()
    sp.space_after = Pt(4)
    add_run(sp, "Profile: ", size=9.5, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)
    add_run(sp, "BSE/NSE-listed factory in Noida generating recurring industrial scraps (PET, cotton, corrugated) with mandatory SEBI BRSR Core filing obligations.", size=9.5, color=TEXT_SILVER)
    sp = s_tf.add_paragraph()
    add_run(sp, "Pain Point: ", size=9.5, color=ROSE_ACC, bold=True, font_name=FONT_BOLD)
    add_run(sp, "BRSR auditors reject informal broker receipts. They need verifiable digital chain-of-custody for statutory audits — currently zero digital records exist.", size=9.5, color=TEXT_SILVER)

    buy_card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.05), Inches(5.8), Inches(2.05))
    buy_card.fill.solid()
    buy_card.fill.fore_color.rgb = CARD_BG
    buy_card.line.color.rgb = CYAN_ACC
    buy_card.line.width = Pt(1.5)
    b_tf = buy_card.text_frame
    b_tf.word_wrap = True
    b_tf.margin_left = b_tf.margin_top = b_tf.margin_right = b_tf.margin_bottom = Inches(0.18)
    bp = b_tf.paragraphs[0]
    bp.space_after = Pt(4)
    add_run(bp, "🔄  BUYER SIDE: Procurement / Sourcing Manager", size=12.5, color=CYAN_ACC, bold=True, font_name=FONT_BOLD)
    bp = b_tf.add_paragraph()
    bp.space_after = Pt(4)
    add_run(bp, "Profile: ", size=9.5, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)
    add_run(bp, "Sourcing manager at registered recyclers or brand owners building EPR compliance supply chains needing pre-qualified, spec-matched material lots.", size=9.5, color=TEXT_SILVER)
    bp = b_tf.add_paragraph()
    add_run(bp, "Pain Point: ", size=9.5, color=ROSE_ACC, bold=True, font_name=FONT_BOLD)
    add_run(bp, "30–60% gate rejection rate on unverified lots. Every rejected truckload incurs 100% freight cost with zero usable material received.", size=9.5, color=TEXT_SILVER)

    bb3 = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.25), Inches(11.733), Inches(0.55))
    bb3.fill.solid()
    bb3.fill.fore_color.rgb = RGBColor(10, 30, 22)
    bb3.line.color.rgb = GREEN_ACC
    bb3.line.width = Pt(1)
    bbtf3 = bb3.text_frame
    bbp3 = bbtf3.paragraphs[0]
    bbp3.alignment = PP_ALIGN.CENTER
    add_run(bbp3, "Why these two: The supplier has a regulatory mandate making documentation non-optional. The buyer has a financial loss making pre-qualification worth paying for.", size=10, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)

    img_dual = os.path.join(sc_dir, 'slide3_dual_workspaces.png')
    if os.path.exists(img_dual):
        s3.shapes.add_picture(img_dual, Inches(6.9), Inches(1.8), width=Inches(5.6))

    # ═════════════════════════════════════════════════
    # SLIDE 4: Technical Approach
    # ═════════════════════════════════════════════════
    s4 = prs.slides.add_slide(blank_layout)
    add_slide_header(s4, "Slide 4 of 7 — Technical Approach",
                     "Production Stack with Explainable AI & Deterministic Matching Engine",
                     "FastAPI + React 18 + Supabase PostgreSQL + Google Gemini 2.0 Flash with Rule-based fallback.")

    rows = [
        ("Frontend", "React 18 + TypeScript + Vite + Tailwind CSS", "Component architecture"),
        ("Backend", "FastAPI (Python) + Uvicorn + Pydantic v2", "Typed REST APIs"),
        ("Database", "Supabase PostgreSQL", "Migrations & RBAC ready"),
        ("AI Core", "Google Gemini 2.0 Flash", "Structured JSON output"),
        ("AI Fallback", "Deterministic regex rule extractor", "Zero API failure guarantee"),
        ("Maps", "Leaflet Geospatial Engine", "Delhi NCR match routes"),
        ("Deploy", "Vercel (Frontend) + Render (API)", "Continuous deployment")
    ]

    t_shape = s4.shapes.add_table(len(rows) + 1, 3, Inches(0.8), Inches(1.8), Inches(5.8), Inches(2.3))
    table = t_shape.table
    table.columns[0].width = Inches(1.2)
    table.columns[1].width = Inches(3.0)
    table.columns[2].width = Inches(1.6)

    for c_i, h in enumerate(["LAYER", "TECHNOLOGY", "ROLE"]):
        cell = table.cell(0, c_i)
        cell.fill.solid()
        cell.fill.fore_color.rgb = CARD_BG_ALT
        p = cell.text_frame.paragraphs[0]
        add_run(p, h, size=9, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)

    for r_i, (l, t, role) in enumerate(rows, start=1):
        c0 = table.cell(r_i, 0)
        c0.fill.solid()
        c0.fill.fore_color.rgb = CARD_BG
        p = c0.text_frame.paragraphs[0]
        add_run(p, l, size=8.5, color=CYAN_ACC, bold=True, font_name=FONT_BOLD)

        c1 = table.cell(r_i, 1)
        c1.fill.solid()
        c1.fill.fore_color.rgb = CARD_BG
        p = c1.text_frame.paragraphs[0]
        add_run(p, t, size=8.5, color=TEXT_WHITE)

        c2 = table.cell(r_i, 2)
        c2.fill.solid()
        c2.fill.fore_color.rgb = CARD_BG
        p = c2.text_frame.paragraphs[0]
        add_run(p, role, size=8, color=TEXT_MUTED)

    feat_card = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.3), Inches(5.8), Inches(2.45))
    feat_card.fill.solid()
    feat_card.fill.fore_color.rgb = CARD_BG
    feat_card.line.color.rgb = BORDER_COLOR
    feat_card.line.width = Pt(1.2)
    ftf4 = feat_card.text_frame
    ftf4.word_wrap = True
    ftf4.margin_left = ftf4.margin_top = ftf4.margin_right = ftf4.margin_bottom = Inches(0.16)
    
    fp = ftf4.paragraphs[0]
    fp.space_after = Pt(4)
    add_run(fp, "TWO GENUINE AI FEATURES", size=10.5, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)

    fp = ftf4.add_paragraph()
    fp.space_after = Pt(2)
    add_run(fp, "Feature 1 — Natural Language Listing Extraction:", size=9.5, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)
    fp = ftf4.add_paragraph()
    fp.space_after = Pt(6)
    add_run(fp, "Supplier types: '2 tonnes cotton cutting waste from Noida, Grade A, monthly' → Gemini extracts material_type, qty, unit, grade, location, contamination level instantly.", size=9, color=TEXT_SILVER)

    fp = ftf4.add_paragraph()
    fp.space_after = Pt(2)
    add_run(fp, "Feature 2 — Explainable Match Reasoning ('Why this match?'):", size=9.5, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)
    fp = ftf4.add_paragraph()
    add_run(fp, "Deterministic 6-D engine calculates score → Gemini generates clear 2-3 sentence explanation of strengths and risks. (AI explains the score — does NOT determine it).", size=9, color=TEXT_SILVER)

    img4 = os.path.join(sc_dir, 'slide4_match_detail.png')
    if os.path.exists(img4):
        s4.shapes.add_picture(img4, Inches(6.9), Inches(1.8), width=Inches(5.6))

    # ═════════════════════════════════════════════════
    # SLIDE 5: Market & Business Potential
    # ═════════════════════════════════════════════════
    s5 = prs.slides.add_slide(blank_layout)
    add_slide_header(s5, "Slide 5 of 7 — Market & Business Potential",
                     "Monetizing the Compliance Trail, Not Just Transactions",
                     "SEBI BRSR Core + EPR Mandate create an un-bypassable SaaS compliance lock-in.")

    mkt_metrics = [
        ("TAM — INDIA INDUSTRIAL SECONDARY MATERIALS", "₹80,000–1,20,000 Cr", "Annual industrial recyclable flows across manufacturing sectors", GREEN_ACC),
        ("SAM — NCR INDUSTRIAL CLUSTERS", "₹3,000–10,000 Cr", "Delhi NCR manufacturing hubs (Noida, Gr. Noida, Faridabad, Gurugram)", CYAN_ACC),
        ("IMMEDIATE MARKET WEDGE", "500 Listed Companies", "Mandatory BRSR Core reporting companies this fiscal year → 1,000 by FY27", GOLD_ACC)
    ]

    for idx, (title, val, desc, col) in enumerate(mkt_metrics):
        box = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8 + idx * 0.95), Inches(5.8), Inches(0.85))
        box.fill.solid()
        box.fill.fore_color.rgb = CARD_BG
        box.line.color.rgb = BORDER_COLOR
        box.line.width = Pt(1)
        btf = box.text_frame
        btf.word_wrap = True
        btf.margin_left = btf.margin_top = btf.margin_right = btf.margin_bottom = Inches(0.12)
        bp = btf.paragraphs[0]
        bp.space_after = Pt(2)
        add_run(bp, title + ":  ", size=9, color=TEXT_MUTED, bold=True, font_name=FONT_BOLD)
        add_run(bp, val, size=11, color=col, bold=True, font_name=FONT_BOLD)
        bp2 = btf.add_paragraph()
        add_run(bp2, desc, size=9, color=TEXT_SILVER)

    biz_rows = [
        ("Hook", "Free listing + matching", "₹0", "Acquires both sides rapidly"),
        ("Revenue", "EHS Compliance SaaS", "₹5K–15K/mo", "BRSR audit trail lives here — bypass = failure"),
        ("Upsell", "Verification per lot", "₹500–5K/lot", "Eliminates buyer gate rejection risk")
    ]
    b_table_shape = s5.shapes.add_table(len(biz_rows) + 1, 4, Inches(0.8), Inches(4.75), Inches(5.8), Inches(1.3))
    b_table = b_table_shape.table
    b_table.columns[0].width = Inches(0.9)
    b_table.columns[1].width = Inches(1.8)
    b_table.columns[2].width = Inches(1.1)
    b_table.columns[3].width = Inches(2.0)

    for c_i, h in enumerate(["LAYER", "PRODUCT", "PRICE", "WHY STICKY"]):
        cell = b_table.cell(0, c_i)
        cell.fill.solid()
        cell.fill.fore_color.rgb = CARD_BG_ALT
        p = cell.text_frame.paragraphs[0]
        add_run(p, h, size=8.5, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)

    for r_i, r_data in enumerate(biz_rows, start=1):
        for c_i, val in enumerate(r_data):
            cell = b_table.cell(r_i, c_i)
            cell.fill.solid()
            cell.fill.fore_color.rgb = CARD_BG
            p = cell.text_frame.paragraphs[0]
            add_run(p, val, size=8.5, color=TEXT_WHITE if c_i < 2 else CYAN_ACC if c_i == 2 else TEXT_SILVER)

    bb5 = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.15), Inches(5.8), Inches(0.65))
    bb5.fill.solid()
    bb5.fill.fore_color.rgb = RGBColor(10, 30, 22)
    bb5.line.color.rgb = GREEN_ACC
    bb5.line.width = Pt(1)
    bbtf5 = bb5.text_frame
    bbtf5.word_wrap = True
    bbtf5.margin_left = bbtf5.margin_top = bbtf5.margin_right = bbtf5.margin_bottom = Inches(0.08)
    bbp5 = bbtf5.paragraphs[0]
    add_run(bbp5, "The Un-bypassable Insight: We don't charge transaction fees. We charge for the compliance audit trail. Leave platform = lose audit record.", size=8.5, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)

    img5 = os.path.join(sc_dir, 'slide5_impact.png')
    if os.path.exists(img5):
        s5.shapes.add_picture(img5, Inches(6.9), Inches(1.8), width=Inches(5.6))

    # ═════════════════════════════════════════════════
    # SLIDE 6: Scalability & Future
    # ═════════════════════════════════════════════════
    s6 = prs.slides.add_slide(blank_layout)
    add_slide_header(s6, "Slide 6 of 7 — Scalability & Future",
                     "Modular Architecture Built to Scale from NCR to National Coverage",
                     "Production-ready design with configurable weights, pluggable AI, and multi-tenant schema.")

    arch_items = [
        ("🗄️ In-Memory to Supabase Swap", "Zero code changes to go live; database migrations and Supabase Auth schemas already written.", GREEN_ACC),
        ("🤖 Pluggable AI Service Layer", "Swap Gemini model, temperature, or provider without touching business matching logic.", CYAN_ACC),
        ("⚖️ Configurable Weights Engine", "Admins adjust dimension weights and eligibility gate thresholds directly via built-in dashboard.", GREEN_ACC),
        ("🏢 Multi-Company RBAC Schema", "Multi-tenant organization hierarchy and role permissions already structured in Postgres.", CYAN_ACC)
    ]
    for i, (a_t, a_d, a_col) in enumerate(arch_items):
        x = Inches(0.8 + (i % 2) * 2.95)
        y = Inches(1.8 + (i // 2) * 1.35)
        box = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(2.85), Inches(1.25))
        box.fill.solid()
        box.fill.fore_color.rgb = CARD_BG
        box.line.color.rgb = BORDER_COLOR
        box.line.width = Pt(1)
        btf = box.text_frame
        btf.word_wrap = True
        btf.margin_left = btf.margin_top = btf.margin_right = btf.margin_bottom = Inches(0.12)
        bp = btf.paragraphs[0]
        bp.space_after = Pt(2)
        add_run(bp, a_t, size=10, color=a_col, bold=True, font_name=FONT_BOLD)
        bp2 = btf.add_paragraph()
        add_run(bp2, a_d, size=8.5, color=TEXT_SILVER)

    rm_box = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.6), Inches(5.8), Inches(1.4))
    rm_box.fill.solid()
    rm_box.fill.fore_color.rgb = CARD_BG_ALT
    rm_box.line.color.rgb = CYAN_ACC
    rm_box.line.width = Pt(1.2)
    rtf = rm_box.text_frame
    rtf.word_wrap = True
    rtf.margin_left = rtf.margin_top = rtf.margin_right = rtf.margin_bottom = Inches(0.14)
    rp = rtf.paragraphs[0]
    rp.space_after = Pt(3)
    add_run(rp, "12-MONTH COMMERCIAL ROADMAP", size=9.5, color=CYAN_ACC, bold=True, font_name=FONT_BOLD)

    roadmap_steps = [
        ("Month 1–3: ", "5 paying EHS pilot customers in Noida industrial zone"),
        ("Month 3–6: ", "First 100 live transactions with digital chain-of-custody"),
        ("Month 6–9: ", "Automated BRSR certificate PDF generation live (NCR expansion)"),
        ("Month 9–12: ", "Pre-seed funding closed (Greenovation target: Oct 31, 2026)")
    ]
    for m_time, m_text in roadmap_steps:
        sp = rtf.add_paragraph()
        sp.space_after = Pt(1)
        add_run(sp, m_time, size=8.5, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)
        add_run(sp, m_text, size=8.5, color=TEXT_SILVER)

    bb6 = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.1), Inches(5.8), Inches(0.7))
    bb6.fill.solid()
    bb6.fill.fore_color.rgb = RGBColor(10, 30, 22)
    bb6.line.color.rgb = GREEN_ACC
    bb6.line.width = Pt(1)
    bbtf6 = bb6.text_frame
    bbtf6.word_wrap = True
    bbtf6.margin_left = bbtf6.margin_top = bbtf6.margin_right = bbtf6.margin_bottom = Inches(0.08)
    bbp6 = bbtf6.paragraphs[0]
    add_run(bbp6, "Data Moat: First mover with labeled secondary material quality outcomes and rejection reasons owns the pricing intelligence layer across India.", size=8.5, color=TEXT_WHITE, bold=True, font_name=FONT_BOLD)

    img6 = os.path.join(sc_dir, 'slide6_admin.png')
    if os.path.exists(img6):
        s6.shapes.add_picture(img6, Inches(6.9), Inches(1.8), width=Inches(5.6))

    # ═════════════════════════════════════════════════
    # SLIDE 7: If We Had More Time
    # ═════════════════════════════════════════════════
    s7 = prs.slides.add_slide(blank_layout)
    add_slide_header(s7, "Slide 7 of 7 — If We Had More Time",
                     "Roadmap to Mission-Critical Industrial Compliance Infrastructure",
                     "Transforming an AI matching MVP into India's certified secondary material registry.")

    priorities = [
        ("1. BRSR Compliance Certificate Generator", "Auto-generate cryptographically signed chain-of-custody PDF directly usable in SEBI audit submissions. Converts CircularMatch into compliance infrastructure.", GREEN_ACC),
        ("2. AI Photo Quality Grading (Computer Vision)", "Supplier uploads scrap photo → computer vision returns contamination score and material grade before shipment. Eliminates the 30–60% gate rejection rate.", CYAN_ACC),
        ("3. Live Supabase Connection", "Database migrations are fully written; Supabase Auth schema exists. One environment variable away from persistent production cloud data.", GREEN_ACC),
        ("4. EPR Credit Chain Documentation", "Connect EPR-obligated corporate brands directly with CPCB-registered recyclers with traceable plastic credits and verified disposal trails.", CYAN_ACC),
        ("5. EU Digital Product Passport (DPP)", "JSON-LD material passports with GS1 QR codes. Indian exporters need ESPR compliance by Feb 2027. Passport architecture maps directly to this standard.", GOLD_ACC)
    ]

    for idx, (p_title, p_desc, p_col) in enumerate(priorities):
        box = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8 + idx * 0.85), Inches(5.8), Inches(0.78))
        box.fill.solid()
        box.fill.fore_color.rgb = CARD_BG
        box.line.color.rgb = BORDER_COLOR
        box.line.width = Pt(1)
        btf = box.text_frame
        btf.word_wrap = True
        btf.margin_left = btf.margin_top = btf.margin_right = btf.margin_bottom = Inches(0.1)
        bp = btf.paragraphs[0]
        bp.space_after = Pt(2)
        add_run(bp, p_title, size=10, color=p_col, bold=True, font_name=FONT_BOLD)
        bp2 = btf.add_paragraph()
        add_run(bp2, p_desc, size=8.5, color=TEXT_SILVER)

    sub_box = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.15), Inches(5.8), Inches(0.65))
    sub_box.fill.solid()
    sub_box.fill.fore_color.rgb = RGBColor(17, 26, 46)
    sub_box.line.color.rgb = GREEN_ACC
    sub_box.line.width = Pt(1.2)
    stf = sub_box.text_frame
    stf.word_wrap = True
    sp = stf.paragraphs[0]
    sp.alignment = PP_ALIGN.CENTER
    add_run(sp, "SUBMISSION: ", size=8.5, color=GREEN_ACC, bold=True, font_name=FONT_BOLD)
    add_run(sp, "CircularMatch  |  Team: Solo Levelling (Shivansh Gupta)  |  GitHub: github.com/shivanshguptaa070-del/circularmatch", size=8.5, color=TEXT_WHITE, font_name=FONT_MAIN)

    img7 = os.path.join(sc_dir, 'slide7_map.png')
    if os.path.exists(img7):
        s7.shapes.add_picture(img7, Inches(6.9), Inches(1.8), width=Inches(5.6))

    out_file = os.path.join(os.getcwd(), "CircularMatch_HACKDAY_Pitch.pptx")
    prs.save(out_file)
    print(f"Polished PowerPoint saved to: {out_file}")

if __name__ == '__main__':
    create_polished_presentation()
