import type {
  Material,
  Listing,
  BuyerRequirement,
  MatchCard,
  BuyerAcceptanceSpec,
  MaterialLot,
  QualityEvidence,
  ListingPassport,
  MatchDetail,
  SellerDashboardSummary,
  BuyerDashboardSummary,
  AdminDashboardSummary,
  ScoringConfig,
  MapPoint,
  MapRoute,
  Company,
  ApiEnvelope,
} from '../types'

export const DEMO_MATERIALS: Material[] = [
  {
    id: 'mat-pet',
    canonical_name: 'PET industrial scrap',
    category: 'Plastic',
    aliases: ['pet scrap', 'pet manufacturing scrap', 'pet waste', 'polyethylene terephthalate'],
    quality_scale: ['unknown', 'mixed', 'standard', 'industrial', 'premium'],
    supported: true,
    notes: 'Controlled MVP material. Clean industrial-grade scrap from bottle & thermoforming plants.',
    uses: [
      {
        id: 'use-pet-recycling',
        material_id: 'mat-pet',
        title: 'Bottle-to-fibre mechanical recycling',
        description: 'Reprocessed into rPET staple fibre for geo-textiles, strapping, and non-woven batting.',
        pathway_type: 'mechanical_recycling',
        recovery_factor: 0.88,
        virgin_displacement_factor: 0.92,
        assumptions: { method: 'Standard industrial mechanical recycling' },
      },
      {
        id: 'use-pet-strapping',
        material_id: 'mat-pet',
        title: 'Extruded industrial strapping',
        description: 'Compounded directly for packaging strapping and tensile bands.',
        pathway_type: 'extrusion',
        recovery_factor: 0.84,
        virgin_displacement_factor: 0.88,
        assumptions: { method: 'Direct extrusion reprocessing' },
      },
    ],
  },
  {
    id: 'mat-cotton-textile',
    canonical_name: 'Cotton textile cutting waste',
    category: 'Textile',
    aliases: ['cotton cutting waste', 'textile cutting waste', 'cotton scraps', 'fabric offcuts'],
    quality_scale: ['unknown', 'mixed', 'standard', 'industrial', 'premium'],
    supported: true,
    notes: 'Pure cotton post-cutting offcuts from export garment manufacturing.',
    uses: [
      {
        id: 'use-textile-yarn',
        material_id: 'mat-cotton-textile',
        title: 'Regenerated open-end spinning yarn',
        description: 'Fiberised into blended coarse yarn for denim, wiping fabrics, and canvas.',
        pathway_type: 'mechanical_shredding',
        recovery_factor: 0.82,
        virgin_displacement_factor: 0.85,
        assumptions: { method: 'Garnetted recycling' },
      },
    ],
  },
  {
    id: 'mat-paper-cardboard',
    canonical_name: 'Corrugated cardboard and paper trim',
    category: 'Paper / Cardboard',
    aliases: ['cardboard waste', 'occ', 'paper trim', 'corrugated scrap'],
    quality_scale: ['unknown', 'mixed', 'standard', 'industrial', 'premium'],
    supported: true,
    notes: 'Clean corrugated box cuttings and unprinted Kraft packaging trim.',
    uses: [
      {
        id: 'use-paper-board',
        material_id: 'mat-paper-cardboard',
        title: 'Recycled fluting & testliner board',
        description: 'Repulped into high-strength packaging paper and honeycomb panels.',
        pathway_type: 'repulping',
        recovery_factor: 0.9,
        virgin_displacement_factor: 0.94,
        assumptions: { method: 'Hydrapulper reprocessing' },
      },
    ],
  },
  {
    id: 'mat-steel-scrap',
    canonical_name: 'Mild-steel fabrication scrap',
    category: 'Metal',
    aliases: ['steel scrap', 'mild steel scrap', 'metal fabrication scrap', 'ms scrap'],
    quality_scale: ['unknown', 'mixed', 'standard', 'industrial', 'premium'],
    supported: true,
    notes: 'Segregated mild-steel offcuts, stampings, and end pieces.',
    uses: [
      {
        id: 'use-steel-remelt',
        material_id: 'mat-steel-scrap',
        title: 'Induction furnace remelting into TMT billets',
        description: 'Melted into secondary structural steel and construction reinforcement bar.',
        pathway_type: 'metallurgical_remelting',
        recovery_factor: 0.95,
        virgin_displacement_factor: 1.0,
        assumptions: { method: 'Electric induction melting' },
      },
    ],
  },
  {
    id: 'mat-other',
    canonical_name: 'Other / Custom waste stream',
    category: 'Other',
    aliases: ['other', 'custom', 'misc', 'miscellaneous'],
    quality_scale: ['unknown', 'mixed', 'standard', 'industrial', 'premium'],
    supported: true,
    notes: 'Custom secondary stream requiring custom specification.',
    uses: [
      {
        id: 'use-other-repurpose',
        material_id: 'mat-other',
        title: 'Secondary Repurposing / Processing',
        description: 'Repurposed or reprocessed into industrial feedstock or alternative products.',
        pathway_type: 'reprocessing',
        recovery_factor: 0.8,
        virgin_displacement_factor: 0.85,
        assumptions: { method: 'Standard secondary recovery' },
      },
    ],
  },
]

export const DEMO_COMPANIES: Record<string, Company> = {
  'comp-gen-pet': {
    id: 'comp-gen-pet',
    owner_user_id: 'user-generator',
    name: 'Noida PackForm Industries',
    company_type: 'generator',
    city: 'Noida',
    address_label: 'Sector 63, Noida, Uttar Pradesh',
    latitude: 28.5355,
    longitude: 77.391,
    verification_status: 'verified',
    is_demo: true,
  },
  'comp-buyer-pet-top': {
    id: 'comp-buyer-pet-top',
    owner_user_id: 'user-buyer',
    name: 'ReLoop Polymers',
    company_type: 'recycler',
    city: 'Manesar',
    address_label: 'Industrial Area, Sector 8, Manesar, Haryana',
    latitude: 28.3553,
    longitude: 76.9369,
    verification_status: 'verified',
    is_demo: true,
  },
}

export const DEMO_EVIDENCE: QualityEvidence[] = [
  {
    id: 'evidence-pet-declaration',
    lot_id: 'lot-pet-demo',
    evidence_type: 'supplier_declaration',
    title: 'Clean Pre-Consumer Scrap Declaration',
    issuer: 'Noida PackForm Quality Assurance Dept',
    status: 'reviewed',
    status_label: 'Verified by Reviewer',
    summary: 'Supplier declaration certifying post-industrial unprinted clear PET sheet punchings without PVC or adhesive contamination.',
    document_name: 'PackForm_QA_Scrap_Declaration_2026.pdf',
    valid_until: '2026-12-31',
    is_demo: true,
    created_at: '2026-03-01T10:00:00Z',
    is_claim: false,
  },
  {
    id: 'evidence-pet-photo',
    lot_id: 'lot-pet-demo',
    evidence_type: 'photo',
    title: 'Batch Inspection Photo',
    issuer: 'Factory QA Team',
    status: 'uploaded',
    status_label: 'Photo Documented',
    summary: 'High-resolution photo showing clean, clear transparent PET flakes bagged in jumbo woven PP totes.',
    document_name: 'PET_Batch_Lot_W33.jpg',
    is_demo: true,
    created_at: '2026-03-02T11:30:00Z',
    is_claim: false,
  },
  {
    id: 'evidence-cotton-declaration',
    lot_id: 'lot-cotton-demo',
    evidence_type: 'supplier_declaration',
    title: 'Supplier declaration — 100% Combed Cotton Cutting Waste',
    issuer: 'Noida PackForm Industries',
    status: 'self_declared',
    status_label: 'Self Declared',
    summary: 'Supplier certifies cutting scrap originates from 100% cotton knitwear line with no synthetic blends.',
    is_demo: true,
    created_at: '2026-03-02T10:00:00Z',
    is_claim: false,
  },
  {
    id: 'evidence-cotton-photo',
    lot_id: 'lot-cotton-demo',
    evidence_type: 'photo',
    title: 'Lot inspection photo — Baled white cotton clips',
    issuer: 'Quality QA Team',
    status: 'reviewed',
    status_label: 'Verified by Reviewer',
    summary: 'Visual inspection confirms clean baled white knit clips without elastane or zippers.',
    is_demo: true,
    created_at: '2026-03-02T11:00:00Z',
    is_claim: false,
  },
  {
    id: 'evidence-cardboard-declaration',
    lot_id: 'lot-cardboard-demo',
    evidence_type: 'supplier_declaration',
    title: 'Packaging trim declaration — Clean Corrugated',
    issuer: 'Noida PackForm Industries',
    status: 'self_declared',
    status_label: 'Self Declared',
    summary: 'Clean corrugated offcuts with non-toxic starch adhesive.',
    is_demo: true,
    created_at: '2026-03-03T10:00:00Z',
    is_claim: false,
  },
  {
    id: 'evidence-steel-declaration',
    lot_id: 'lot-steel-demo',
    evidence_type: 'supplier_declaration',
    title: 'Material test mill cert — Mild Steel Offcuts',
    issuer: 'Noida PackForm Industries',
    status: 'self_declared',
    status_label: 'Self Declared',
    summary: 'Mill test certificate confirms low carbon steel composition suitable for electric arc furnace remelting.',
    is_demo: true,
    created_at: '2026-03-04T10:00:00Z',
    is_claim: false,
  },
]

export const DEMO_LOTS: MaterialLot[] = [
  {
    id: 'lot-pet-demo',
    listing_id: 'listing-pet-demo',
    lot_code: 'PET-NOI-W33',
    available_quantity_kg: 2600,
    material_form: 'Manufacturing trim & skeletons',
    source_status: 'pre_consumer',
    colour: 'Clear / Transparent',
    packaging: 'Baled sacks / Jumbo bags',
    storage_condition: 'Covered indoor dry warehouse; zero moisture exposure.',
    sample_available: true,
    compliance_triage: 'ordinary_secondary_material',
    triage_label: 'Ordinary Secondary Material',
    declared_spec: {
      polymer: 'Polyethylene Terephthalate (>98%)',
      intrinsic_viscosity: '0.78 dl/g',
      moisture: '< 0.5%',
      impurities: '< 0.1% non-PET',
    },
    evidence_ids: ['evidence-pet-declaration', 'evidence-pet-photo'],
    evidence: DEMO_EVIDENCE.slice(0, 2),
    evidence_count: 2,
    status: 'available',
    created_at: '2026-03-01T09:00:00Z',
  },
  {
    id: 'lot-cotton-demo',
    listing_id: 'listing-cotton-demo',
    lot_code: 'COT-NOI-W33',
    available_quantity_kg: 2125,
    material_form: 'Fabric offcuts & cuttings',
    source_status: 'pre_consumer',
    colour: 'White & light pastels',
    packaging: 'Compressed wire-tied bales',
    storage_condition: 'Covered warehouse, moisture-controlled',
    sample_available: true,
    compliance_triage: 'ordinary_secondary_material',
    triage_label: 'Ordinary Secondary Material',
    declared_spec: { cotton_content: '>95%', moisture: '<8%' },
    evidence_ids: ['evidence-cotton-declaration', 'evidence-cotton-photo'],
    evidence: DEMO_EVIDENCE.slice(2, 4),
    evidence_count: 2,
    status: 'available',
    created_at: '2026-03-01T09:00:00Z',
  },
  {
    id: 'lot-cardboard-demo',
    listing_id: 'listing-cardboard-demo',
    lot_code: 'OCC-GZB-W33',
    available_quantity_kg: 4500,
    material_form: 'Baled cartons & Kraft trim',
    source_status: 'post_consumer',
    colour: 'Brown kraft',
    packaging: 'Wire-tied bales',
    storage_condition: 'Indoor dry shed',
    sample_available: true,
    compliance_triage: 'ordinary_secondary_material',
    triage_label: 'Ordinary Secondary Material',
    declared_spec: { grade: 'OCC 11', moisture: '<12%' },
    evidence_ids: ['evidence-cardboard-declaration'],
    evidence: [DEMO_EVIDENCE[4]],
    evidence_count: 1,
    status: 'available',
    created_at: '2026-03-01T09:00:00Z',
  },
  {
    id: 'lot-steel-demo',
    listing_id: 'listing-steel-demo',
    lot_code: 'MS-FBD-W33',
    available_quantity_kg: 3200,
    material_form: 'Punchings and offcuts',
    source_status: 'pre_consumer',
    colour: 'Metallic grey',
    packaging: 'Steel bins / skip',
    storage_condition: 'Paved yard storage',
    sample_available: true,
    compliance_triage: 'ordinary_secondary_material',
    triage_label: 'Ordinary Secondary Material',
    declared_spec: { grade: 'IS 2062 Grade A', thickness_mm: '2-6mm' },
    evidence_ids: ['evidence-steel-declaration'],
    evidence: [DEMO_EVIDENCE[5]],
    evidence_count: 1,
    status: 'available',
    created_at: '2026-03-01T09:00:00Z',
  },
]

export const DEMO_LISTINGS: Listing[] = [
  {
    id: 'listing-pet-demo',
    company_id: 'comp-gen-pet',
    material_id: 'mat-pet',
    raw_description: 'Approx 2.6 tonnes/week of clean industrial PET thermoforming scrap in Sector 63 Noida. Segregated, dry, transparent.',
    source: 'demo',
    quantity_kg: 2600,
    frequency: 'weekly',
    normalized_kg_per_week: 2600,
    quality_grade: 'industrial',
    quality_verified: true,
    quality_notes: 'Clean industrial sheet trim, verified pure PET without coating.',
    availability: 'Every Monday',
    city: 'Noida',
    latitude: 28.5355,
    longitude: 77.391,
    asking_price_per_kg: 14.0,
    disposal_cost_per_kg: 8.0,
    status: 'active',
    selected_use_id: 'use-pet-recycling',
    is_demo: true,
    created_at: '2026-03-01T08:00:00Z',
    material: 'PET industrial scrap',
    category: 'Plastic',
    company: 'Noida PackForm Industries',
    quality_display: 'Industrial Grade (Verified)',
    quality_status: 'Verified',
    passport: {
      status: 'buyer_ready',
      score: 92,
      missing: [],
      lot_count: 1,
      evidence_count: 2,
      primary_lot_id: 'lot-pet-demo',
      summary: 'Buyer ready: Complete specifications, declared purity, verified declaration, and representative sample available.',
    },
    demo_label: 'Demo Data',
  },
  {
    id: 'listing-cotton-demo',
    company_id: 'comp-gen-pet',
    material_id: 'mat-cotton-textile',
    raw_description: 'Pure cotton textile cutting waste and fabric offcuts from export garment manufacturing in Sector 63 Noida. Dry, clean, sorted by white/light shades.',
    source: 'demo',
    quantity_kg: 2125,
    frequency: 'weekly',
    normalized_kg_per_week: 2125,
    quality_grade: 'industrial',
    quality_verified: false,
    quality_notes: 'Sorted textile cutting scrap, minimal synthetic contamination.',
    availability: 'Every Wednesday',
    city: 'Noida',
    latitude: 28.5355,
    longitude: 77.391,
    asking_price_per_kg: 16.5,
    disposal_cost_per_kg: 4.5,
    status: 'active',
    selected_use_id: 'use-textile-yarn',
    is_demo: true,
    created_at: '2026-03-02T08:00:00Z',
    material: 'Cotton textile cutting waste',
    category: 'Textile',
    company: 'Noida PackForm Industries',
    quality_display: 'Industrial Grade (Self-declared)',
    quality_status: 'Not verified',
    passport: {
      status: 'sample_ready',
      score: 78,
      missing: ['Third-party test report'],
      lot_count: 1,
      evidence_count: 1,
      primary_lot_id: 'lot-cotton-demo',
      summary: 'Sample ready: Declared composition provided, lab test pending.',
    },
    demo_label: 'Demo Data',
  },
  {
    id: 'listing-cardboard-demo',
    company_id: 'comp-gen-pet',
    material_id: 'mat-paper-cardboard',
    raw_description: 'Clean corrugated cardboard box scrap and unprinted paper packaging trim from carton folding unit in Ghaziabad.',
    source: 'demo',
    quantity_kg: 4500,
    frequency: 'weekly',
    normalized_kg_per_week: 4500,
    quality_grade: 'standard',
    quality_verified: false,
    quality_notes: 'Baled corrugated cartons, dry indoor storage, moisture < 12%.',
    availability: 'Bi-weekly batches',
    city: 'Ghaziabad',
    latitude: 28.6692,
    longitude: 77.4538,
    asking_price_per_kg: 8.5,
    disposal_cost_per_kg: 3.0,
    status: 'active',
    selected_use_id: 'use-paper-board',
    is_demo: true,
    created_at: '2026-03-03T08:00:00Z',
    material: 'Corrugated cardboard and paper trim',
    category: 'Paper / Cardboard',
    company: 'Noida PackForm Industries',
    quality_display: 'Standard Grade',
    quality_status: 'Not verified',
    passport: {
      status: 'missing_evidence',
      score: 65,
      missing: ['Quality evidence upload'],
      lot_count: 1,
      evidence_count: 0,
      summary: 'Self-declared specifications; inspection recommended.',
    },
    demo_label: 'Demo Data',
  },
  {
    id: 'listing-steel-demo',
    company_id: 'comp-gen-pet',
    material_id: 'mat-steel-scrap',
    raw_description: 'Mild steel offcuts, punchings, and structural end pieces from sheet metal stamping plant in Faridabad.',
    source: 'demo',
    quantity_kg: 3200,
    frequency: 'weekly',
    normalized_kg_per_week: 3200,
    quality_grade: 'industrial',
    quality_verified: true,
    quality_notes: 'Segregated IS 2062 mild steel scrap, free from oil and attachments.',
    availability: 'Every Friday',
    city: 'Faridabad',
    latitude: 28.4089,
    longitude: 77.3178,
    asking_price_per_kg: 34.0,
    disposal_cost_per_kg: 0.0,
    status: 'active',
    selected_use_id: 'use-steel-remelt',
    is_demo: true,
    created_at: '2026-03-04T08:00:00Z',
    material: 'Mild-steel fabrication scrap',
    category: 'Metal',
    company: 'Noida PackForm Industries',
    quality_display: 'Industrial Grade (Segregated)',
    quality_status: 'Verified',
    passport: {
      status: 'buyer_ready',
      score: 88,
      missing: [],
      lot_count: 1,
      evidence_count: 1,
      summary: 'Buyer ready: Homogeneous mild steel chemistry certificate provided.',
    },
    demo_label: 'Demo Data',
  },
]

export const DEMO_REQUIREMENTS: BuyerRequirement[] = [
  {
    id: 'req-pet-top',
    company_id: 'comp-buyer-pet-top',
    material_id: 'mat-pet',
    material_category: 'Plastic',
    minimum_quantity_kg_week: 2000,
    maximum_quantity_kg_week: 5000,
    minimum_grade: 'B',
    maximum_contamination: 'low',
    preferred_location: 'NCR',
    minimum_quality_grade: 'industrial',
    maximum_distance_km: 150,
    target_price_per_kg: 17.5,
    allow_partial_quantity: true,
    city: 'Manesar',
    latitude: 28.3553,
    longitude: 76.9369,
    status: 'active',
    is_demo: true,
    created_at: '2026-03-01T08:00:00Z',
    material: 'PET industrial scrap',
    category: 'Plastic',
    company: 'ReLoop Polymers',
    acceptance_spec_summary: {
      id: 'spec-pet-top',
      requires_sample: false,
      required_evidence_status: 'reviewed',
      available_capacity_kg_week: 5000,
    },
  },
  {
    id: 'req-cotton-demo',
    company_id: 'comp-buyer-pet-top',
    material_id: 'mat-cotton-textile',
    material_category: 'Textile',
    minimum_quantity_kg_week: 1500,
    maximum_quantity_kg_week: 4000,
    minimum_grade: 'B',
    maximum_contamination: 'low',
    preferred_location: 'NCR',
    minimum_quality_grade: 'standard',
    maximum_distance_km: 120,
    target_price_per_kg: 18.0,
    allow_partial_quantity: true,
    city: 'Manesar',
    latitude: 28.3553,
    longitude: 76.9369,
    status: 'active',
    is_demo: true,
    created_at: '2026-03-02T08:00:00Z',
    material: 'Cotton textile cutting waste',
    category: 'Textile',
    company: 'ReLoop Polymers',
    acceptance_spec_summary: {
      id: 'spec-cotton-demo',
      requires_sample: true,
      required_evidence_status: 'self_declared',
      available_capacity_kg_week: 4000,
    },
  },
  {
    id: 'req-cardboard-demo',
    company_id: 'comp-buyer-pet-top',
    material_id: 'mat-paper-cardboard',
    material_category: 'Paper / Cardboard',
    minimum_quantity_kg_week: 3000,
    maximum_quantity_kg_week: 6000,
    minimum_grade: 'B',
    maximum_contamination: 'med',
    preferred_location: 'NCR',
    minimum_quality_grade: 'standard',
    maximum_distance_km: 100,
    target_price_per_kg: 9.5,
    allow_partial_quantity: true,
    city: 'Manesar',
    latitude: 28.3553,
    longitude: 76.9369,
    status: 'active',
    is_demo: true,
    created_at: '2026-03-03T08:00:00Z',
    material: 'Corrugated cardboard and paper trim',
    category: 'Paper / Cardboard',
    company: 'ReLoop Polymers',
    acceptance_spec_summary: {
      id: 'spec-cardboard-demo',
      requires_sample: false,
      required_evidence_status: 'self_declared',
      available_capacity_kg_week: 6000,
    },
  },
]

export const DEMO_ACCEPTANCE_SPECS: Record<string, BuyerAcceptanceSpec> = {
  'req-pet-top': {
    id: 'spec-pet-top',
    buyer_requirement_id: 'req-pet-top',
    accepted_forms: ['Clean punchings', 'Skeletons', 'Flakes', 'Regrind'],
    accepted_colours: ['Clear', 'Light Blue Tint'],
    prohibited_materials: ['PVC', 'Direct food contact adhesives', 'Opaque black flakes'],
    required_evidence_status: 'reviewed',
    required_evidence_label: 'Verified by reviewer',
    requires_sample: false,
    available_capacity_kg_week: 5000,
    route_note: 'Direct wash & pelletizing line; non-bottle grade applications.',
    review_note: 'Requires supplier declaration of origin; zero chemical wash contaminants.',
    updated_at: '2026-03-01T10:00:00Z',
    is_demo: true,
    buyer: DEMO_COMPANIES['comp-buyer-pet-top'],
    material: DEMO_MATERIALS[0],
    notice: 'Demo acceptance template — defines quality gate requirements.',
  },
  'req-cotton-demo': {
    id: 'spec-cotton-demo',
    buyer_requirement_id: 'req-cotton-demo',
    accepted_forms: ['Fabric offcuts', 'Yarn waste', 'Comber noil'],
    accepted_colours: ['White', 'Light grey', 'Natural'],
    prohibited_materials: ['Polyester blend >5%', 'Elastane / Spandex', 'Metal fasteners'],
    required_evidence_status: 'self_declared',
    required_evidence_label: 'Supplier Declared',
    requires_sample: true,
    available_capacity_kg_week: 4000,
    route_note: 'Mechanical fibre opening and recycled rotor spinning pathway.',
    review_note: 'Requires pre-shipment sample lot testing.',
    updated_at: '2026-03-02T10:00:00Z',
    is_demo: true,
    buyer: DEMO_COMPANIES['comp-buyer-pet-top'],
    material: DEMO_MATERIALS[1],
    notice: 'Demo acceptance template — Cotton cutting waste.',
  },
  'req-cardboard-demo': {
    id: 'spec-cardboard-demo',
    buyer_requirement_id: 'req-cardboard-demo',
    accepted_forms: ['Baled cartons', 'Packaging trim', 'Kraft offcuts'],
    accepted_colours: ['Brown kraft', 'Buff'],
    prohibited_materials: ['Wax coated board', 'Plastic laminates', 'Wet strength treated paper'],
    required_evidence_status: 'self_declared',
    required_evidence_label: 'Supplier Declared',
    requires_sample: false,
    available_capacity_kg_week: 6000,
    route_note: 'Hydrapulper recycling into duplex board fluting medium.',
    review_note: 'Standard acceptance spec for recycled fluting paper.',
    updated_at: '2026-03-03T10:00:00Z',
    is_demo: true,
    buyer: DEMO_COMPANIES['comp-buyer-pet-top'],
    material: DEMO_MATERIALS[2],
    notice: 'Demo acceptance template — Corrugated cardboard.',
  },
}

export const DEMO_MATCH_CARDS: MatchCard[] = [
  {
    id: 'match-listing-pet-demo-req-pet-top',
    listing_id: 'listing-pet-demo',
    buyer_requirement_id: 'req-pet-top',
    scoring_config_id: 'config-default',
    total_score: 93.0,
    material_score: 100,
    quality_score: 95,
    quantity_score: 90,
    distance_score: 88,
    price_score: 92,
    environment_score: 94,
    distance_km: 48.5,
    estimated_logistics_per_kg: 2.1,
    delivered_cost_per_kg: 16.1,
    status: 'contacted',
    eligibility_status: 'eligible',
    eligibility_label: 'Eligible for Deal Initiation',
    eligibility_checks: [
      { key: 'material_spec', label: 'Material compatibility', status: 'pass', detail: 'PET thermoforming scrap matches recycling facility extrusion grade.' },
      { key: 'quality_grade', label: 'Quality requirements', status: 'pass', detail: 'Industrial grade exceeds buyer minimum threshold.' },
      { key: 'distance', label: 'Transit distance', status: 'pass', detail: '48.5 km is well within 150 km requirement limit.' },
      { key: 'commercial', label: 'Target pricing', status: 'pass', detail: 'Delivered cost ₹16.10/kg is below target ₹17.50/kg.' },
    ],
    data_completeness_score: 90,
    next_action: 'Initiate sample dispatch or confirm collection schedule.',
    lot_id: 'lot-pet-demo',
    flags: ['Verified Supplier Declaration', 'Low Transit Footprint'],
    explanation_inputs: {
      material_match: true,
      quantity_sufficient: true,
      price_advantage_percent: 8.0,
      co2e_savings_kg: 4850,
    },
    created_at: '2026-03-01T12:00:00Z',
    buyer: 'ReLoop Polymers',
    buyer_company: DEMO_COMPANIES['comp-buyer-pet-top'],
    buyer_requirement: DEMO_REQUIREMENTS[0],
    buyer_acceptance_spec: DEMO_ACCEPTANCE_SPECS['req-pet-top'],
    waste_listing: DEMO_LISTINGS[0],
    material_lot: DEMO_LOTS[0],
    material: 'PET industrial scrap',
    estimated_net_value: 36400,
    estimated_waste_diverted_kg: 2600,
    potential_use: 'Bottle-to-fibre mechanical recycling',
    demo_label: 'Demo Match',
  },
  {
    id: 'match-listing-cotton-demo-req-cotton-demo',
    listing_id: 'listing-cotton-demo',
    buyer_requirement_id: 'req-cotton-demo',
    scoring_config_id: 'config-default',
    total_score: 78.0,
    material_score: 100,
    quality_score: 85,
    quantity_score: 88,
    distance_score: 88,
    price_score: 75,
    environment_score: 80,
    distance_km: 48.5,
    estimated_logistics_per_kg: 2.1,
    delivered_cost_per_kg: 18.6,
    status: 'suggested',
    eligibility_status: 'needs_sample',
    eligibility_label: 'Sample Inspection Required',
    eligibility_checks: [
      { key: 'material_spec', label: 'Material compatibility', status: 'pass', detail: 'Cotton cutting waste matches textile yarn spinning route.' },
      { key: 'sample', label: 'Sample / inspection', status: 'warning', detail: 'Buyer requires pre-production sample approval.' },
      { key: 'quality_grade', label: 'Quality requirements', status: 'pass', detail: 'Industrial grade exceeds standard minimum.' },
      { key: 'distance', label: 'Transit distance', status: 'pass', detail: '48.5 km is well within 120 km radius.' },
    ],
    data_completeness_score: 75,
    next_action: 'Request a sample or buyer inspection',
    lot_id: 'lot-cotton-demo',
    flags: ['Sample required by buyer acceptance spec'],
    explanation_inputs: {
      material_match: true,
      quantity_sufficient: true,
      price_advantage_percent: 5.0,
      co2e_savings_kg: 3400,
    },
    created_at: '2026-03-02T12:00:00Z',
    buyer: 'ReLoop Polymers',
    buyer_company: DEMO_COMPANIES['comp-buyer-pet-top'],
    buyer_requirement: DEMO_REQUIREMENTS[1],
    buyer_acceptance_spec: DEMO_ACCEPTANCE_SPECS['req-cotton-demo'],
    waste_listing: DEMO_LISTINGS[1],
    material_lot: DEMO_LOTS[1],
    material: 'Cotton textile cutting waste',
    estimated_net_value: 30600,
    estimated_waste_diverted_kg: 2125,
    potential_use: 'Recycled yarn feedstock',
    demo_label: 'Demo Match',
  },
  {
    id: 'match-listing-cardboard-demo-req-cardboard-demo',
    listing_id: 'listing-cardboard-demo',
    buyer_requirement_id: 'req-cardboard-demo',
    scoring_config_id: 'config-default',
    total_score: 71.0,
    material_score: 100,
    quality_score: 80,
    quantity_score: 90,
    distance_score: 85,
    price_score: 80,
    environment_score: 70,
    distance_km: 56.4,
    estimated_logistics_per_kg: 2.2,
    delivered_cost_per_kg: 10.7,
    status: 'suggested',
    eligibility_status: 'eligible',
    eligibility_label: 'Eligible for Deal Initiation',
    eligibility_checks: [
      { key: 'material_spec', label: 'Material compatibility', status: 'pass', detail: 'Corrugated trim compatible with board pulping route.' },
      { key: 'quality_grade', label: 'Quality requirements', status: 'pass', detail: 'Standard grade meets buyer requirement.' },
      { key: 'distance', label: 'Transit distance', status: 'pass', detail: '56.4 km is within 100 km radius.' },
    ],
    data_completeness_score: 65,
    next_action: 'Invite buyer to an RFQ or offer',
    lot_id: 'lot-cardboard-demo',
    flags: ['Standard paperboard recovery route'],
    explanation_inputs: {
      material_match: true,
      quantity_sufficient: true,
      price_advantage_percent: 10.0,
      co2e_savings_kg: 2700,
    },
    created_at: '2026-03-03T12:00:00Z',
    buyer: 'ReLoop Polymers',
    buyer_company: DEMO_COMPANIES['comp-buyer-pet-top'],
    buyer_requirement: DEMO_REQUIREMENTS[2],
    buyer_acceptance_spec: DEMO_ACCEPTANCE_SPECS['req-cardboard-demo'],
    waste_listing: DEMO_LISTINGS[2],
    material_lot: DEMO_LOTS[2],
    material: 'Corrugated cardboard and paper trim',
    estimated_net_value: 28350,
    estimated_waste_diverted_kg: 4500,
    potential_use: 'Recycled paperboard feedstock',
    demo_label: 'Demo Match',
  },
]

export const DEMO_MATCH_CARD: MatchCard = DEMO_MATCH_CARDS[0]

export const DEMO_MATCH_DETAIL: MatchDetail = {
  match: DEMO_MATCH_CARDS[0],
  listing: DEMO_LISTINGS[0],
  material_lot: DEMO_LOTS[0],
  passport_readiness: DEMO_LISTINGS[0].passport,
  buyer_requirement: DEMO_REQUIREMENTS[0],
  buyer_acceptance_spec: DEMO_ACCEPTANCE_SPECS['req-pet-top'],
  buyer: DEMO_COMPANIES['comp-buyer-pet-top'],
  explanation: {
    headline: 'High-compatibility regional recycling match (93.0% Match Score)',
    reasons: [
      'Chemical match: 100% pure PET unprinted flakes match ReLoop mechanical extrusion requirements.',
      'Logistics efficiency: 48.5 km route across Noida–Manesar corridor reduces transport emissions.',
      'Commercial viability: Delivered ₹16.10/kg beats buyer target ceiling of ₹17.50/kg.',
      'Data reliability: Verified supplier declaration uploaded with detailed lot passport.',
    ],
    flags: ['Documented Batch Passport', 'Sub-50km Transit'],
    eligibility_status: 'eligible',
    eligibility_checks: DEMO_MATCH_CARDS[0].eligibility_checks,
    next_action: 'Agree on weekly pickup schedule or order formal composite sample.',
    score_breakdown: [
      { key: 'material', label: 'Material Compatibility', score: 100, weight: 35 },
      { key: 'quantity', label: 'Batch Quantity Match', score: 90, weight: 20 },
      { key: 'quality', label: 'Grade & Purity Verification', score: 95, weight: 20 },
      { key: 'distance', label: 'Logistics Proximity', score: 88, weight: 15 },
      { key: 'price', label: 'Economic Feasibility', score: 92, weight: 10 },
    ],
    decision_rule_label: 'Deterministic Hackathon Decision Rule — Production Weighted Engine',
  },
  economic: {
    label: 'Weekly Transaction Forecast',
    quantity_kg: 2600,
    listing_asking_price_per_kg: 14.0,
    buyer_target_price_per_kg: 17.5,
    reference_price_per_kg: 22.0,
    reference_price_source: 'Regional Virgin PET Resin Index (North India)',
    estimated_logistics_per_kg: 2.1,
    estimated_transport_cost: 5460,
    estimated_sale_revenue: 36400,
    net_recovered_value: 30940,
    avoided_disposal_cost: 20800,
    potential_improvement_vs_disposal: 51740,
    delivered_cost_per_kg: 16.1,
    formula: 'Net Value = (Asking Price × Qty) - Transport Cost + Avoided Landfill Cost',
    assumptions: ['Dedicated 3-tonne flatbed truck logistics', 'Zero intermediate sorting required'],
  },
  impact: {
    label: 'Lifecycle Carbon & Landfill Avoidance',
    potential_use: 'Bottle-to-fibre mechanical recycling',
    waste_diverted_kg: 2600,
    secondary_material_recovered_kg: 2288,
    estimated_virgin_material_displaced_kg: 2392,
    estimated_transport_emissions_kgco2e: 48.5 * 0.18,
    estimated_avoided_emissions_kgco2e: 4920,
    estimated_net_co2e_benefit_kgco2e: 4911.3,
    assumptions: ['DEFRA 2025 Emission Factors for Recycled PET', 'Virgin PET production displacement: 2.15 kg CO2e/kg'],
    calculation_version: 'GHG-Protocol-Scope3-v1.4',
    methodology: {
      id: 'method-ghg-v1',
      name: 'CircularMatch Industrial Secondary Material Methodology',
      functional_unit: '1 metric tonne secondary polymer displaced',
      system_boundary: 'Cradle-to-gate industrial repurposing',
      factor_source: 'DEFRA GHG / Ecoinvent 3.9',
      data_quality_tier: 'demo_scenario',
      claim_boundary: 'Attributable circular economy scope 3 avoidance',
    },
    is_illustrative: true,
  },
  timeline: [
    {
      id: 'sample-pet-demo',
      type: 'sample_request',
      status: 'accepted',
      title: 'Demo Sample Dispatched & Accepted',
      detail: '25 kg trial sample accepted by ReLoop lab.',
      created_at: '2026-03-02T14:00:00Z',
      record: { id: 'sample-pet-demo', status: 'accepted', requested_quantity_kg: 25 },
    },
    {
      id: 'offer-pet-demo',
      type: 'offer',
      status: 'sent',
      title: 'Commercial Offer Proposed',
      detail: 'Offer created: ₹14.00/kg for 2,600 kg weekly batch with buyer pickup.',
      created_at: '2026-03-03T10:00:00Z',
      record: { id: 'offer-pet-demo', status: 'sent', price_per_kg: 14, quantity_kg: 2600 },
    },
    {
      id: 'shipment-pet-demo',
      type: 'shipment',
      status: 'planned',
      title: 'Pickup Scheduled',
      detail: '2,600 kg planned for 2026-08-20; buyer pickup.',
      created_at: '2026-03-03T12:00:00Z',
      record: { id: 'shipment-pet-demo', status: 'planned', planned_quantity_kg: 2600 },
    },
    {
      id: 'txn-pet-demo',
      type: 'contact',
      status: 'accepted',
      title: 'Contact Intent Recorded',
      detail: 'Contact made — match recorded as successful.',
      created_at: '2026-03-01T12:00:00Z',
      record: { id: 'txn-pet-demo', status: 'accepted' },
    },
  ],
  map_route: {
    from: { name: 'Noida PackForm Industries', latitude: 28.5355, longitude: 77.391, city: 'Noida' },
    to: { name: 'ReLoop Polymers', latitude: 28.3553, longitude: 76.9369, city: 'Manesar' },
    distance_km: 48.5,
    label: 'Noida → Manesar Corridor (48.5 km)',
  },
}

export const DEMO_SELLER_SUMMARY: SellerDashboardSummary = {
  role: 'generator',
  kpis: {
    total_waste_listed_kg_week: 12425,
    active_buyer_matches: 8,
    successful_sales: 3,
    potential_revenue_inr: 184500,
  },
  charts: {
    waste_by_category: [
      { name: 'Plastic', value: 2600 },
      { name: 'Textile', value: 2125 },
      { name: 'Paper / Cardboard', value: 4500 },
      { name: 'Metal', value: 3200 },
    ],
    revenue_pipeline: [
      { name: 'PET Scrap', value: 36400 },
      { name: 'Cotton Textile', value: 35062 },
      { name: 'Cardboard', value: 38250 },
      { name: 'Steel Scrap', value: 108800 },
    ],
  },
}

export const DEMO_BUYER_SUMMARY: BuyerDashboardSummary = {
  role: 'buyer',
  kpis: {
    total_procurement_target_kg_week: 15000,
    active_seller_matches: 6,
    successful_purchases: 2,
    estimated_cost_savings_inr: 96400,
  },
  charts: {
    procurement_by_category: [
      { name: 'Plastic (PET)', value: 5000 },
      { name: 'Cotton Waste', value: 4000 },
      { name: 'Cardboard Fluting', value: 6000 },
    ],
    cost_savings_pipeline: [
      { name: 'PET vs Virgin', value: 44200 },
      { name: 'Cotton Offcuts', value: 22800 },
      { name: 'Kraft Trim', value: 29400 },
    ],
  },
}

export const DEMO_ADMIN_SUMMARY: AdminDashboardSummary = {
  role: 'admin',
  kpis: {
    total_waste_listed_kg_week: 34500,
    total_waste_matched_kg: 28400,
    waste_diverted_kg: 19600,
    potential_economic_value_inr: 542000,
    potential_co2e_benefit_kg: 48200,
    active_buyers: 14,
    successful_matches: 9,
  },
  charts: {
    waste_by_category: [
      { name: 'Plastic', value: 9400 },
      { name: 'Textile', value: 6800 },
      { name: 'Paper / Cardboard', value: 11200 },
      { name: 'Metal', value: 7100 },
    ],
    waste_diverted_over_time: [
      { period: 'Week 1', kg: 4200 },
      { period: 'Week 2', kg: 7800 },
      { period: 'Week 3', kg: 13400 },
      { period: 'Week 4', kg: 19600 },
    ],
    match_success: [
      { name: 'Closed Deals', value: 9 },
      { name: 'Active Negotiation', value: 7 },
      { name: 'Sampling Stage', value: 5 },
      { name: 'Suggested', value: 12 },
    ],
    economic_value: [
      { period: 'Jan', value: 120000 },
      { period: 'Feb', value: 280000 },
      { period: 'Mar', value: 542000 },
    ],
    environmental_impact: [
      { name: 'Emissions Avoided (kg CO2e)', value: 48200 },
      { name: 'Landfill Diverted (kg)', value: 19600 },
    ],
  },
  match_success_rate_percent: 78.5,
  labels: {
    title: 'Platform Overview',
    status: 'Active Pilot Running',
  },
}

export const DEMO_SCORING_CONFIG: ScoringConfig = {
  id: 'config-default',
  name: 'Standard Industrial Matching Weights (v1.2)',
  weights: {
    material: 0.35,
    quality: 0.20,
    quantity: 0.20,
    distance: 0.15,
    price: 0.00,
    environment: 0.10,
  },
  version: 2,
  is_demo: true,
}

export const DEMO_MAP_DATA: { points: MapPoint[]; routes: MapRoute[]; selected_route?: MapRoute } = {
  points: [
    {
      ...DEMO_COMPANIES['comp-gen-pet'],
      listings: DEMO_LISTINGS,
      requirements: [],
    },
    {
      ...DEMO_COMPANIES['comp-buyer-pet-top'],
      listings: [],
      requirements: DEMO_REQUIREMENTS,
    },
    {
      id: 'comp-ext-1',
      name: 'Faridabad Sheet Metals',
      company_type: 'generator',
      city: 'Faridabad',
      address_label: 'Sector 24, Faridabad',
      latitude: 28.4089,
      longitude: 77.3178,
      verification_status: 'verified',
      is_demo: true,
      listings: [DEMO_LISTINGS[3]],
      requirements: [],
    },
  ],
  routes: [
    {
      from: { name: 'Noida PackForm Industries', latitude: 28.5355, longitude: 77.391, city: 'Noida' },
      to: { name: 'ReLoop Polymers', latitude: 28.3553, longitude: 76.9369, city: 'Manesar' },
      distance_km: 48.2,
      match_score: 92.4,
      label: 'Noida → Manesar (92% Match · 48.2 km)',
    },
  ],
  selected_route: {
    from: { name: 'Noida PackForm Industries', latitude: 28.5355, longitude: 77.391, city: 'Noida' },
    to: { name: 'ReLoop Polymers', latitude: 28.3553, longitude: 76.9369, city: 'Manesar' },
    distance_km: 48.2,
    match_score: 92.4,
    label: 'Noida → Manesar (92% Match · 48.2 km)',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT-SIDE MUTABLE STORAGE FOR DEMO SESSIONS
// Ensures judges can interactively create/edit requirements, listings, and specs!
// ─────────────────────────────────────────────────────────────────────────────

const REQ_STORAGE_KEY = 'cm_demo_requirements'
const LISTINGS_STORAGE_KEY = 'cm_demo_listings'

export function getStoredDemoRequirements(): BuyerRequirement[] {
  try {
    const raw = localStorage.getItem(REQ_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return DEMO_REQUIREMENTS
}

export function saveDemoRequirement(req: Partial<BuyerRequirement>): BuyerRequirement {
  const current = [...getStoredDemoRequirements()]
  let saved: BuyerRequirement
  const existingIdx = req.id ? current.findIndex((r) => r.id === req.id) : -1
  if (existingIdx >= 0) {
    current[existingIdx] = { ...current[existingIdx], ...req, is_demo: true } as BuyerRequirement
    saved = current[existingIdx]
  } else {
    saved = {
      id: req.id || `req-demo-${Date.now()}`,
      company_id: 'comp-buyer-pet-top',
      material_id: req.material_id || 'mat-pet',
      material_category: req.material_category || 'Plastic',
      minimum_quantity_kg_week: req.minimum_quantity_kg_week || 1000,
      maximum_quantity_kg_week: req.maximum_quantity_kg_week || 5000,
      minimum_grade: req.minimum_grade || 'B',
      maximum_contamination: req.maximum_contamination || 'low',
      preferred_location: req.preferred_location || 'Noida',
      minimum_quality_grade: req.minimum_quality_grade || 'standard',
      maximum_distance_km: req.maximum_distance_km || 150,
      target_price_per_kg: req.target_price_per_kg || 15,
      allow_partial_quantity: req.allow_partial_quantity ?? true,
      city: req.city || 'Noida',
      latitude: 28.5355,
      longitude: 77.391,
      status: 'active',
      is_demo: true,
      created_at: new Date().toISOString(),
      material: req.material || 'PET industrial scrap',
      category: req.material_category || 'Plastic',
      company: 'ReLoop Polymers',
      acceptance_spec_summary: {
        id: `spec-${Date.now()}`,
        requires_sample: false,
        required_evidence_status: 'self_declared',
        available_capacity_kg_week: req.maximum_quantity_kg_week || 5000,
      },
    }
    current.unshift(saved)
  }
  localStorage.setItem(REQ_STORAGE_KEY, JSON.stringify(current))
  return saved
}

export function deleteDemoRequirement(id: string): void {
  const current = getStoredDemoRequirements().filter((r) => r.id !== id)
  localStorage.setItem(REQ_STORAGE_KEY, JSON.stringify(current))
}

export function getStoredDemoListings(): Listing[] {
  try {
    const raw = localStorage.getItem(LISTINGS_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return DEMO_LISTINGS
}

export function saveDemoListing(listing: Partial<Listing>): Listing {
  const current = [...getStoredDemoListings()]
  const saved: Listing = {
    id: listing.id || `listing-demo-${Date.now()}`,
    company_id: 'comp-gen-pet',
    material_id: listing.material_id || 'mat-pet',
    raw_description: listing.raw_description || 'Secondary Material Listing',
    source: 'demo',
    quantity_kg: listing.quantity_kg || 2500,
    frequency: listing.frequency || 'weekly',
    normalized_kg_per_week: listing.normalized_kg_per_week || 2500,
    quality_grade: listing.quality_grade || 'industrial',
    quality_verified: true,
    quality_notes: listing.quality_notes || 'Clean industrial material',
    availability: listing.availability || 'Immediate',
    city: listing.city || 'Noida',
    latitude: listing.latitude || 28.5355,
    longitude: listing.longitude || 77.391,
    asking_price_per_kg: listing.asking_price_per_kg || 15,
    disposal_cost_per_kg: listing.disposal_cost_per_kg || 5,
    status: 'active',
    selected_use_id: listing.selected_use_id || 'use-pet-recycling',
    is_demo: true,
    created_at: new Date().toISOString(),
    material: listing.material || 'PET industrial scrap',
    category: listing.category || 'Plastic',
    company: 'Noida PackForm Industries',
    quality_display: 'Industrial Grade (Verified)',
    quality_status: 'Verified',
    passport: {
      status: 'buyer_ready',
      score: 90,
      missing: [],
      lot_count: 1,
      evidence_count: 1,
      summary: 'Buyer ready: Complete specifications provided in demo session.',
    },
    demo_label: 'Demo Data',
  }
  current.unshift(saved)
  localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(current))
  return saved
}

/**
 * Handle routing for demo fallback requests when the backend is sleeping,
 * down, or times out.
 */
export function handleDemoFallback<T>(path: string, options: RequestInit = {}): ApiEnvelope<T> | null {
  const method = (options.method || 'GET').toUpperCase()
  const cleanPath = path.split('?')[0]

  // 1. Materials Reference Catalog
  if (cleanPath === '/api/reference/materials') {
    return { data_mode: 'demo', dataset_label: 'Demo Data', data: DEMO_MATERIALS as unknown as T }
  }

  // 2. Buyer Requirements List
  if (cleanPath === '/api/buyer-requirements' && method === 'GET') {
    const data = getStoredDemoRequirements()
    return { data_mode: 'demo', dataset_label: 'Demo Data', data: data as unknown as T }
  }

  // 3. Create / Update / Delete Buyer Requirement
  if (cleanPath === '/api/buyer-requirements' && method === 'POST') {
    let body = {}
    try { body = typeof options.body === 'string' ? JSON.parse(options.body) : {} } catch {}
    const created = saveDemoRequirement(body)
    return { data_mode: 'demo', dataset_label: 'Demo Data', data: { requirement: created } as unknown as T }
  }

  if (cleanPath.startsWith('/api/buyer-requirements/') && method === 'PUT') {
    const id = cleanPath.split('/')[3]
    let body = {}
    try { body = typeof options.body === 'string' ? JSON.parse(options.body) : {} } catch {}
    const updated = saveDemoRequirement({ ...body, id })
    return { data_mode: 'demo', dataset_label: 'Demo Data', data: { requirement: updated } as unknown as T }
  }

  if (cleanPath.startsWith('/api/buyer-requirements/') && method === 'DELETE') {
    const id = cleanPath.split('/')[3]
    deleteDemoRequirement(id)
    return { data_mode: 'demo', dataset_label: 'Demo Data', data: { message: 'Archived' } as unknown as T }
  }

  // 4. Requirement Matches (e.g. /api/buyer-requirements/req-pet-top/matches)
  if (cleanPath.startsWith('/api/buyer-requirements/') && cleanPath.endsWith('/matches')) {
    const reqId = cleanPath.split('/')[3]
    const req = getStoredDemoRequirements().find((r) => r.id === reqId) || DEMO_REQUIREMENTS[0]
    const reqCategory = req.material_category || req.category
    const matches = DEMO_MATCH_CARDS.filter(
      (m) => m.buyer_requirement_id === req.id || reqCategory === m.waste_listing?.category
    )
    const finalMatches = matches.length > 0 ? matches : [{ ...DEMO_MATCH_CARD, buyer_requirement_id: req.id, buyer_requirement: req }]
    return {
      data_mode: 'demo',
      dataset_label: 'Demo Data',
      data: {
        requirement: req,
        matches: finalMatches,
        decision_rule_label: 'Demo decision rules — configurable, not scientifically optimal.',
      } as unknown as T,
    }
  }

  // 5. Requirement Acceptance Spec
  if (cleanPath.startsWith('/api/buyer-requirements/') && cleanPath.endsWith('/acceptance-spec')) {
    const reqId = cleanPath.split('/')[3]
    const spec = DEMO_ACCEPTANCE_SPECS[reqId] || DEMO_ACCEPTANCE_SPECS['req-pet-top']
    const req = getStoredDemoRequirements().find((r) => r.id === reqId) || DEMO_REQUIREMENTS[0]
    return {
      data_mode: 'demo',
      dataset_label: 'Demo Data',
      data: {
        requirement: req,
        acceptance_spec: spec,
      } as unknown as T,
    }
  }

  // 6. Listings
  if (cleanPath === '/api/listings' && method === 'GET') {
    const data = getStoredDemoListings()
    return { data_mode: 'demo', dataset_label: 'Demo Data', data: data as unknown as T }
  }

  if (cleanPath === '/api/listings' && method === 'POST') {
    let body = {}
    try { body = typeof options.body === 'string' ? JSON.parse(options.body) : {} } catch {}
    const created = saveDemoListing(body)
    return { data_mode: 'demo', dataset_label: 'Demo Data', data: { listing: created } as unknown as T }
  }

  // 7. Single Listing Matches
  if (cleanPath.startsWith('/api/listings/') && cleanPath.endsWith('/matches')) {
    const listingId = cleanPath.split('/')[3]
    const listing = getStoredDemoListings().find((l) => l.id === listingId) || DEMO_LISTINGS[0]
    const matches = DEMO_MATCH_CARDS.filter(
      (m) => m.listing_id === listing.id || listing.category === m.buyer_requirement?.category
    )
    const finalMatches = matches.length > 0 ? matches : [DEMO_MATCH_CARD]
    return {
      data_mode: 'demo',
      dataset_label: 'Demo Data',
      data: {
        listing,
        matches: finalMatches,
        decision_rule_label: 'Demo decision rules — configurable, not scientifically optimal.',
      } as unknown as T,
    }
  }

  // 8. Single Listing Passport
  if (cleanPath.startsWith('/api/listings/') && cleanPath.endsWith('/passport')) {
    const listingId = cleanPath.split('/')[3]
    const listing = getStoredDemoListings().find((l) => l.id === listingId) || DEMO_LISTINGS[0]
    const passportData: ListingPassport = {
      listing,
      readiness: listing.passport,
      lots: DEMO_LOTS.filter((lot) => lot.listing_id === listing.id || listing.id.includes(lot.listing_id.split('-')[1] || 'pet')),
      audit_events: [
        {
          id: 'aud-1',
          entity_type: 'waste_listing',
          entity_id: listing.id,
          action: 'created',
          summary: 'Listing published in demo demonstration stream.',
          created_at: '2026-03-01T08:00:00Z',
          is_demo: true,
        },
      ],
      notice: 'Demo material passport — structured traceability record.',
    }
    return { data_mode: 'demo', dataset_label: 'Demo Data', data: passportData as unknown as T }
  }

  // 9. Single Listing by ID
  if (cleanPath.startsWith('/api/listings/') && method === 'GET') {
    const listingId = cleanPath.split('/')[3]
    const listing = getStoredDemoListings().find((l) => l.id === listingId) || DEMO_LISTINGS[0]
    return { data_mode: 'demo', dataset_label: 'Demo Data', data: listing as unknown as T }
  }

  // 10. Contact generator/buyer (/api/matches/{id}/contact)
  if (cleanPath.startsWith('/api/matches/') && cleanPath.endsWith('/contact') && method === 'POST') {
    let note = 'Interested in this match — please get in touch.'
    try {
      const parsed = typeof options.body === 'string' ? JSON.parse(options.body) : {}
      if (parsed.note) note = parsed.note
    } catch {}
    // Add contact event to timeline
    DEMO_MATCH_DETAIL.timeline.unshift({
      id: `tl-contact-${Date.now()}`,
      type: 'contact',
      title: 'Contact Note Dispatched',
      detail: note,
      created_at: new Date().toISOString(),
      status: 'sent',
      is_demo: true,
      record: { id: `contact-${Date.now()}`, note, status: 'sent' },
    })
    return {
      data_mode: 'demo',
      dataset_label: 'Demo Data',
      data: { message: 'Contact notification sent via email (demo mode).', email_sent: true } as unknown as T,
    }
  }

  // 11. Match Sample Requests (/api/matches/{id}/sample-requests)
  if (cleanPath.startsWith('/api/matches/') && cleanPath.endsWith('/sample-requests') && method === 'POST') {
    let reqQty = 25
    let note = 'Sample requested from demo workspace'
    try {
      const parsed = typeof options.body === 'string' ? JSON.parse(options.body) : {}
      if (parsed.requested_quantity_kg) reqQty = parsed.requested_quantity_kg
      if (parsed.note) note = parsed.note
    } catch {}
    const sampleId = `sr-demo-${Date.now()}`
    const record = { id: sampleId, status: 'requested', requested_quantity_kg: reqQty, note }
    DEMO_MATCH_DETAIL.timeline.unshift({
      id: `tl-${sampleId}`,
      type: 'sample_request',
      title: 'Inspection sample requested',
      detail: `${reqQty} kg sample requested with lab inspection requirements.`,
      created_at: new Date().toISOString(),
      status: 'requested',
      is_demo: true,
      record,
    })
    return {
      data_mode: 'demo',
      dataset_label: 'Demo Data',
      data: { message: 'Demo sample request created.', sample_request: record } as unknown as T,
    }
  }

  // 12. Match Commercial Offers (/api/matches/{id}/offers)
  if (cleanPath.startsWith('/api/matches/') && cleanPath.endsWith('/offers') && method === 'POST') {
    let price = 24
    let qty = 2500
    try {
      const parsed = typeof options.body === 'string' ? JSON.parse(options.body) : {}
      if (parsed.price_per_kg) price = parsed.price_per_kg
      if (parsed.quantity_kg) qty = parsed.quantity_kg
    } catch {}
    const offerId = `off-demo-${Date.now()}`
    const record = { id: offerId, status: 'proposed', price_per_kg: price, quantity_kg: qty }
    DEMO_MATCH_DETAIL.timeline.unshift({
      id: `tl-${offerId}`,
      type: 'offer',
      title: 'Commercial terms proposed',
      detail: `Buyer offered ₹${price}/kg for ${qty.toLocaleString('en-IN')} kg/week batch.`,
      created_at: new Date().toISOString(),
      status: 'proposed',
      is_demo: true,
      record,
    })
    return {
      data_mode: 'demo',
      dataset_label: 'Demo Data',
      data: { message: 'Demo commercial offer submitted.', offer: record } as unknown as T,
    }
  }

  // 13. Match Shipments (/api/matches/{id}/shipments)
  if (cleanPath.startsWith('/api/matches/') && cleanPath.endsWith('/shipments') && method === 'POST') {
    let plannedQty = 2500
    let pickupDate = new Date().toISOString().split('T')[0]
    try {
      const parsed = typeof options.body === 'string' ? JSON.parse(options.body) : {}
      if (parsed.planned_quantity_kg) plannedQty = parsed.planned_quantity_kg
      if (parsed.pickup_date) pickupDate = parsed.pickup_date
    } catch {}
    const shipmentId = `shp-demo-${Date.now()}`
    const record = { id: shipmentId, status: 'planned', planned_quantity_kg: plannedQty, pickup_date: pickupDate }
    DEMO_MATCH_DETAIL.timeline.unshift({
      id: `tl-${shipmentId}`,
      type: 'shipment',
      title: 'Dispatch planned',
      detail: `Logistics scheduled for pickup on ${pickupDate} (${plannedQty.toLocaleString('en-IN')} kg).`,
      created_at: new Date().toISOString(),
      status: 'planned',
      is_demo: true,
      record,
    })
    return {
      data_mode: 'demo',
      dataset_label: 'Demo Data',
      data: { message: 'Demo shipment planned successfully.', shipment: record } as unknown as T,
    }
  }

  // 14. Operational Workflow Status Updates
  if (cleanPath.startsWith('/api/sample-requests/') && method === 'PATCH') {
    const id = cleanPath.split('/')[3]
    const ev = DEMO_MATCH_DETAIL.timeline.find((t) => t.type === 'sample_request')
    if (ev) {
      ev.status = 'accepted'
      ev.title = 'Sample evaluated & accepted'
      if (ev.record) ev.record.status = 'accepted'
    }
    return {
      data_mode: 'demo',
      dataset_label: 'Demo Data',
      data: { message: 'Sample request accepted in demo workflow.', sample_request: { id, status: 'accepted' } } as unknown as T,
    }
  }

  if (cleanPath.startsWith('/api/offers/') && method === 'PATCH') {
    const id = cleanPath.split('/')[3]
    const ev = DEMO_MATCH_DETAIL.timeline.find((t) => t.type === 'offer')
    if (ev) {
      ev.status = 'accepted'
      ev.title = 'Offer accepted by generator'
      if (ev.record) ev.record.status = 'accepted'
    }
    return {
      data_mode: 'demo',
      dataset_label: 'Demo Data',
      data: { message: 'Commercial offer accepted in demo workflow.', offer: { id, status: 'accepted' } } as unknown as T,
    }
  }

  if (cleanPath.startsWith('/api/shipments/') && method === 'PATCH') {
    const id = cleanPath.split('/')[3]
    const ev = DEMO_MATCH_DETAIL.timeline.find((t) => t.type === 'shipment')
    if (ev) {
      ev.status = 'received'
      ev.title = 'Material received at recycling facility'
      if (ev.record) ev.record.status = 'received'
    }
    return {
      data_mode: 'demo',
      dataset_label: 'Demo Data',
      data: { message: 'Shipment recorded as received in demo workflow.', shipment: { id, status: 'received' } } as unknown as T,
    }
  }

  // 15. Match Detail by ID (/api/matches/{id})
  if (cleanPath.startsWith('/api/matches/') && !cleanPath.includes('/timeline') && !cleanPath.includes('/route') && method === 'GET') {
    const matchId = cleanPath.split('/')[3]
    const card = DEMO_MATCH_CARDS.find((c) => c.id === matchId)
    const matchData = card ? { ...DEMO_MATCH_DETAIL, match: card } : DEMO_MATCH_DETAIL
    return { data_mode: 'demo', dataset_label: 'Demo Data', data: matchData as unknown as T }
  }

  // 16. Match Timeline (/api/matches/{id}/timeline)
  if (cleanPath.startsWith('/api/matches/') && cleanPath.endsWith('/timeline')) {
    return {
      data_mode: 'demo',
      dataset_label: 'Demo Data',
      data: {
        match_id: cleanPath.split('/')[3] || 'match-pet-top',
        events: DEMO_MATCH_DETAIL.timeline,
        notice: 'Demo operational timeline records.',
      } as unknown as T,
    }
  }

  // 17. Match Route (/api/matches/{id}/route)
  if (cleanPath.startsWith('/api/matches/') && cleanPath.endsWith('/route')) {
    return {
      data_mode: 'demo',
      dataset_label: 'Demo Data',
      data: {
        points: DEMO_MAP_DATA.points,
        selected_route: DEMO_MAP_DATA.selected_route,
      } as unknown as T,
    }
  }

  // 18. Map (/api/map)
  if (cleanPath === '/api/map' || cleanPath.startsWith('/api/map/')) {
    return { data_mode: 'demo', dataset_label: 'Demo Data', data: DEMO_MAP_DATA as unknown as T }
  }

  // 19. Dashboard Summaries (/api/dashboard/summary)
  if (cleanPath === '/api/dashboard/summary') {
    const demoMode = localStorage.getItem('cm_demo')
    const activeMode = localStorage.getItem('cm_active_mode')
    if (demoMode === 'admin' || activeMode === 'admin') {
      return { data_mode: 'demo', dataset_label: 'Demo Data', data: DEMO_ADMIN_SUMMARY as unknown as T }
    }
    if (demoMode === 'buyer' || activeMode === 'sourcing') {
      return { data_mode: 'demo', dataset_label: 'Demo Data', data: DEMO_BUYER_SUMMARY as unknown as T }
    }
    return { data_mode: 'demo', dataset_label: 'Demo Data', data: DEMO_SELLER_SUMMARY as unknown as T }
  }

  // 20. Admin Scoring Config
  if (cleanPath === '/api/admin/scoring-config' || cleanPath === '/api/admin/scoring') {
    let savedWeights: any = null
    try {
      const stored = localStorage.getItem('cm_demo_scoring_weights')
      if (stored) savedWeights = JSON.parse(stored)
    } catch {}

    if (method === 'PATCH') {
      let body: any = {}
      try { body = typeof options.body === 'string' ? JSON.parse(options.body) : {} } catch {}
      if (body.weights) {
        DEMO_SCORING_CONFIG.weights = body.weights
        try { localStorage.setItem('cm_demo_scoring_weights', JSON.stringify(body.weights)) } catch {}
      }
      return {
        data_mode: 'demo',
        dataset_label: 'Demo Data',
        data: {
          config: { ...DEMO_SCORING_CONFIG, weights: body.weights || savedWeights || DEMO_SCORING_CONFIG.weights },
          message: 'Scoring config updated',
        } as unknown as T,
      }
    }
    return {
      data_mode: 'demo',
      dataset_label: 'Demo Data',
      data: {
        config: { ...DEMO_SCORING_CONFIG, weights: savedWeights || DEMO_SCORING_CONFIG.weights },
        notice: 'MVP decision rules — configurable, not scientifically optimal.',
      } as unknown as T,
    }
  }

  // 21. Admin Overview Endpoints
  if (cleanPath === '/api/admin/listings') {
    return { data_mode: 'demo', dataset_label: 'Demo Data', data: getStoredDemoListings() as unknown as T }
  }

  if (cleanPath === '/api/admin/matches') {
    return { data_mode: 'demo', dataset_label: 'Demo Data', data: DEMO_MATCH_CARDS as unknown as T }
  }

  if (cleanPath === '/api/admin/audit-events') {
    return {
      data_mode: 'demo',
      dataset_label: 'Demo Data',
      data: [
        {
          id: 'aud-1',
          entity_type: 'waste_listing',
          entity_id: 'listing-pet-demo',
          action: 'created',
          summary: 'Listing published in demo demonstration stream.',
          created_at: '2026-03-01T08:00:00Z',
          is_demo: true,
        },
        {
          id: 'aud-2',
          entity_type: 'match',
          entity_id: 'match-pet-top',
          action: 'computed',
          summary: 'High compatibility match computed (92.8%).',
          created_at: '2026-03-01T08:05:00Z',
          is_demo: true,
        },
      ] as unknown as T,
    }
  }

  // 22. Notifications (/api/notifications)
  if (cleanPath === '/api/notifications') {
    return {
      data_mode: 'demo',
      dataset_label: 'Demo Data',
      data: {
        notifications: [
          {
            id: 'notif-demo-1',
            user_id: 'user-demo',
            type: 'new_match',
            title: 'High-score Match Found (93%)',
            message: 'A compatible buyer ReLoop Polymers is looking for PET industrial scrap.',
            reference_url: '/matches/match-pet-top',
            is_read: false,
            created_at: new Date().toISOString(),
          },
          {
            id: 'notif-demo-2',
            user_id: 'user-demo',
            type: 'match_update',
            title: 'Cotton Comber Match Available (78%)',
            message: 'EcoSpun Fibers has an active requirement for Pre-consumer Cotton Comber.',
            reference_url: '/matches/match-cotton-top',
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ],
      } as unknown as T,
    }
  }

  // 23. Lots and Evidence creation / review in Material Passport
  if (cleanPath.startsWith('/api/listings/') && cleanPath.endsWith('/lots') && method === 'POST') {
    return {
      data_mode: 'demo',
      dataset_label: 'Demo Data',
      data: { message: 'Demo lot created successfully.' } as unknown as T,
    }
  }

  if (cleanPath.startsWith('/api/lots/') && cleanPath.endsWith('/evidence') && method === 'POST') {
    return {
      data_mode: 'demo',
      dataset_label: 'Demo Data',
      data: { message: 'Demo evidence document attached successfully.' } as unknown as T,
    }
  }

  if (cleanPath.startsWith('/api/admin/evidence/') && cleanPath.endsWith('/review') && method === 'PATCH') {
    return {
      data_mode: 'demo',
      dataset_label: 'Demo Data',
      data: { message: 'Evidence review recorded in demonstration audit trail.' } as unknown as T,
    }
  }

  // 24. Recompute matches
  if (cleanPath.startsWith('/api/listings/') && cleanPath.endsWith('/matches/recompute')) {
    const listingId = cleanPath.split('/')[3]
    const listing = getStoredDemoListings().find((l) => l.id === listingId) || DEMO_LISTINGS[0]
    return {
      data_mode: 'demo',
      dataset_label: 'Demo Data',
      data: {
        listing,
        matches: DEMO_MATCH_CARDS,
        message: 'Recomputed compatibility ranking successfully.',
      } as unknown as T,
    }
  }

  // 25. Auth Demo Reset & Me
  if (cleanPath === '/api/auth/demo-reset' && method === 'POST') {
    try {
      localStorage.removeItem('cm_demo_requirements')
      localStorage.removeItem('cm_demo_listings')
    } catch {}
    return {
      data_mode: 'demo',
      dataset_label: 'Demo Data',
      data: { message: 'Demo data reset successfully to clean demonstration state.', is_demo: true } as unknown as T,
    }
  }

  if (cleanPath === '/api/auth/demo-login' && method === 'POST') {
    return {
      data_mode: 'demo',
      dataset_label: 'Demo Data',
      data: { message: 'Demo login successful', user: { id: 'user-demo', is_demo: true } } as unknown as T,
    }
  }

  if (cleanPath === '/api/auth/me' && method === 'GET') {
    const demoMode = localStorage.getItem('cm_demo') || 'seller'
    const role = demoMode === 'admin' ? 'admin' : demoMode === 'buyer' ? 'buyer' : 'generator'
    return {
      data_mode: 'demo',
      dataset_label: 'Demo Data',
      data: {
        user: {
          id: `user-${demoMode}`,
          email: `${demoMode}@circularmatch.in`,
          role,
          is_demo: true,
        },
      } as unknown as T,
    }
  }

  return null
}
