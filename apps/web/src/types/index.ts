export type Role = 'generator' | 'buyer' | 'admin'
export type EvidenceStatus = 'self_declared' | 'uploaded' | 'reviewed' | 'test_reviewed' | 'rejected' | 'expired'
export type EligibilityStatus = 'eligible' | 'needs_sample' | 'missing_evidence' | 'blocked'

export interface ApiEnvelope<T> {
  data_mode: 'demo' | 'production'
  dataset_label?: string | null
  data: T
}

export interface User {
  id: string
  full_name: string
  email: string
  role: Role
  company_id?: string | null
  is_demo: boolean
}

export interface Notification {
  id: string
  user_id: string
  type: 'new_match'
  title: string
  message: string
  reference_url?: string | null
  is_read: boolean
  created_at: string
}

export interface Company {
  id: string
  owner_user_id?: string | null
  name: string
  company_type: 'generator' | 'buyer' | 'recycler' | 'processor'
  city: string
  address_label: string
  latitude: number
  longitude: number
  verification_status: 'demo' | 'unverified' | 'verified'
  is_demo: boolean
}

export interface MaterialUse {
  id: string
  material_id: string
  title: string
  description: string
  pathway_type: string
  recovery_factor: number
  virgin_displacement_factor: number
  assumptions: Record<string, unknown>
  label?: string
}

export interface Material {
  id: string
  canonical_name: string
  category: string
  aliases: string[]
  quality_scale: string[]
  supported: boolean
  notes: string
  uses: MaterialUse[]
}

export interface PassportReadiness {
  status: 'draft' | 'missing_evidence' | 'buyer_ready' | 'sample_ready' | 'compliance_review_needed'
  score: number
  missing: string[]
  lot_count: number
  evidence_count: number
  primary_lot_id?: string | null
  summary: string
}

export interface QualityEvidence {
  id: string
  lot_id: string
  evidence_type: 'supplier_declaration' | 'photo' | 'test_report' | 'certificate' | 'invoice' | 'weighbridge' | 'compliance_document' | 'other'
  title: string
  issuer: string
  status: EvidenceStatus
  status_label: string
  summary: string
  document_name?: string | null
  valid_until?: string | null
  reviewed_by?: string | null
  reviewed_at?: string | null
  is_demo: boolean
  created_at: string
  is_claim: boolean
}

export interface MaterialLot {
  id: string
  listing_id: string
  lot_code: string
  available_quantity_kg: number
  material_form: string
  source_status: 'pre_consumer' | 'post_consumer' | 'unknown'
  colour: string
  packaging: string
  storage_condition: string
  sample_available: boolean
  compliance_triage: 'not_assessed' | 'ordinary_secondary_material' | 'needs_compliance_review' | 'regulated_or_hazardous_route'
  triage_label: string
  declared_spec: Record<string, unknown>
  evidence_ids: string[]
  evidence: QualityEvidence[]
  evidence_count: number
  status: 'available' | 'reserved' | 'dispatched' | 'closed'
  created_at: string
}

export interface Listing {
  id: string
  company_id: string
  material_id: string
  raw_description: string
  source: 'manual' | 'ai_assisted' | 'demo'
  quantity_kg: number
  frequency: 'weekly' | 'monthly' | 'one_time'
  normalized_kg_per_week: number
  quality_grade: string
  quality_verified: boolean
  quality_notes: string
  availability: string
  city: string
  latitude: number
  longitude: number
  asking_price_per_kg: number | null
  disposal_cost_per_kg: number | null
  status: string
  selected_use_id: string | null
  is_demo: boolean
  created_at: string
  material: string
  category: string
  company: string
  quality_display: string
  quality_status: 'Verified' | 'Not verified'
  passport: PassportReadiness
  demo_label: string
}

export interface BuyerAcceptanceSpec {
  id: string
  buyer_requirement_id: string
  accepted_forms: string[]
  accepted_colours: string[]
  prohibited_materials: string[]
  required_evidence_status: EvidenceStatus
  required_evidence_label: string
  requires_sample: boolean
  available_capacity_kg_week: number | null
  route_note: string
  review_note: string
  updated_at: string
  is_demo: boolean
  buyer?: Company | null
  material?: Material | null
  notice: string
}

export interface BuyerRequirement {
  id: string
  company_id: string
  material_id: string
  minimum_quantity_kg_week: number
  maximum_quantity_kg_week: number
  minimum_quality_grade: string
  maximum_distance_km: number
  target_price_per_kg: number | null
  allow_partial_quantity: boolean
  city: string
  latitude: number
  longitude: number
  status: string
  is_demo: boolean
  created_at: string
  material: string
  category: string
  company: string
  acceptance_spec_summary?: {
    id: string
    requires_sample: boolean
    required_evidence_status: EvidenceStatus
    available_capacity_kg_week: number | null
  } | null
}

export interface EligibilityCheck {
  key: string
  label: string
  status: 'pass' | 'warning' | 'fail'
  detail: string
}

export interface MatchCard {
  id: string
  listing_id: string
  buyer_requirement_id: string
  scoring_config_id: string
  total_score: number
  material_score: number
  quality_score: number
  quantity_score: number
  distance_score: number
  price_score: number
  environment_score: number
  distance_km: number
  estimated_logistics_per_kg: number | null
  delivered_cost_per_kg: number | null
  status: 'suggested' | 'contacted' | 'accepted' | 'rejected'
  eligibility_status: EligibilityStatus
  eligibility_label: string
  eligibility_checks: EligibilityCheck[]
  data_completeness_score: number
  next_action: string
  lot_id: string | null
  flags: string[]
  explanation_inputs: Record<string, any>
  created_at: string
  buyer: string
  buyer_company: Company | null
  buyer_requirement: BuyerRequirement | null
  buyer_acceptance_spec?: BuyerAcceptanceSpec | null
  waste_listing?: Listing | null
  material_lot?: MaterialLot | null
  material: string
  estimated_net_value: number | null
  estimated_waste_diverted_kg: number | null
  potential_use: string | null
  demo_label: string
}

export interface ExtractionResult {
  provider: string
  provider_disclosure: string
  status: string
  structured: {
    material_id: string | null
    material: string
    category: string
    quantity_value: number | null
    quantity_unit: string
    quantity_kg: number | null
    frequency: 'weekly' | 'monthly' | 'one_time'
    normalized_kg_per_week: number | null
    quality_grade: string
    quality_verified: boolean
    quality_display: string
    quality_notes: string
    city: string | null
    latitude: number | null
    longitude: number | null
    availability: string
    missing_fields: string[]
    review_required: boolean
  }
  potential_uses: Array<{ id: string; title: string; description: string; label: string }>
}

export interface EconomicScenario {
  label: string
  quantity_kg: number
  listing_asking_price_per_kg: number | null
  buyer_target_price_per_kg: number | null
  reference_price_per_kg: number | null
  reference_price_source: string
  estimated_logistics_per_kg: number
  estimated_transport_cost: number
  estimated_sale_revenue: number | null
  net_recovered_value: number | null
  avoided_disposal_cost: number | null
  potential_improvement_vs_disposal: number | null
  delivered_cost_per_kg: number | null
  formula: string
  assumptions: string[]
}

export interface ImpactMethodologyInfo {
  id: string
  name: string
  functional_unit: string
  system_boundary: string
  factor_source: string
  data_quality_tier: 'demo_scenario' | 'estimated' | 'evidence_backed'
  claim_boundary: string
}

export interface ImpactScenario {
  label: string
  potential_use: string
  waste_diverted_kg: number
  secondary_material_recovered_kg: number
  estimated_virgin_material_displaced_kg: number
  estimated_transport_emissions_kgco2e: number
  estimated_avoided_emissions_kgco2e: number
  estimated_net_co2e_benefit_kgco2e: number
  assumptions: string[]
  calculation_version: string
  methodology: ImpactMethodologyInfo
  is_illustrative: boolean
}

export interface TimelineEvent {
  id: string
  type: 'sample_request' | 'offer' | 'shipment' | 'contact' | 'audit'
  status: string
  title: string
  detail: string
  created_at: string
  record: Record<string, any>
}

export interface MatchDetail {
  match: MatchCard
  listing: Listing
  material_lot: MaterialLot | null
  passport_readiness: PassportReadiness
  buyer_requirement: BuyerRequirement
  buyer_acceptance_spec: BuyerAcceptanceSpec
  buyer: Company
  explanation: {
    headline: string
    reasons: string[]
    flags: string[]
    eligibility_status: EligibilityStatus
    eligibility_checks: EligibilityCheck[]
    next_action: string
    score_breakdown: Array<{ key: string; label: string; score: number; weight: number }>
    decision_rule_label: string
  }
  economic: EconomicScenario
  impact: ImpactScenario
  timeline: TimelineEvent[]
  map_route: {
    from: { name: string; latitude: number; longitude: number; city: string }
    to: { name: string; latitude: number; longitude: number; city: string }
    distance_km: number
    label: string
  }
}

export interface ListingPassport {
  listing: Listing
  readiness: PassportReadiness
  lots: MaterialLot[]
  audit_events: Array<{ id: string; entity_type: string; entity_id: string; action: string; actor_id?: string | null; summary: string; created_at: string; is_demo: boolean }>
  notice: string
}

export interface SellerDashboardSummary {
  role: 'generator'
  kpis: {
    total_waste_listed_kg_week: number
    active_buyer_matches: number
    successful_sales: number
    potential_revenue_inr: number
  }
  charts: {
    waste_by_category: Array<{ name: string; value: number }>
    revenue_pipeline: Array<{ name: string; value: number }>
  }
}

export interface BuyerDashboardSummary {
  role: 'buyer'
  kpis: {
    total_procurement_target_kg_week: number
    active_seller_matches: number
    successful_purchases: number
    estimated_cost_savings_inr: number
  }
  charts: {
    procurement_by_category: Array<{ name: string; value: number }>
    cost_savings_pipeline: Array<{ name: string; value: number }>
  }
}

export interface AdminDashboardSummary {
  role: 'admin'
  kpis: {
    total_waste_listed_kg_week: number
    total_waste_matched_kg: number
    waste_diverted_kg: number
    potential_economic_value_inr: number
    potential_co2e_benefit_kg: number
    active_buyers: number
    successful_matches: number
  }
  charts: {
    waste_by_category: Array<{ name: string; value: number }>
    waste_diverted_over_time: Array<{ period: string; kg: number }>
    match_success: Array<{ name: string; value: number }>
    economic_value: Array<{ period: string; value: number }>
    environmental_impact: Array<{ name: string; value: number }>
  }
  match_success_rate_percent: number
  labels: Record<string, string>
}

export type DashboardSummary = SellerDashboardSummary | BuyerDashboardSummary | AdminDashboardSummary

export interface ScoringConfig {
  id: string
  name: string
  weights: Record<'material' | 'quality' | 'quantity' | 'distance' | 'price' | 'environment', number>
  version: number
  is_demo: boolean
}

export interface MapPoint extends Company {
  listings: Listing[]
  requirements: BuyerRequirement[]
}

export interface MapRoute {
  from: { company?: string; name?: string; latitude: number; longitude: number; city: string }
  to: { company?: string; name?: string; latitude: number; longitude: number; city: string }
  distance_km: number
  match_score?: number
  label: string
}
