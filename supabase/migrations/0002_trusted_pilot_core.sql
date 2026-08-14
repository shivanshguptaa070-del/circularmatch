-- CircularMatch trusted-pilot core
-- Adds material lots, quality evidence, buyer acceptance templates, eligibility checks,
-- sample/RFQ/shipment records, impact-methodology governance, memberships and audit events.
-- This migration does NOT determine legal waste classification or certify material quality.

create type public.evidence_status as enum ('self_declared', 'uploaded', 'reviewed', 'test_reviewed', 'rejected', 'expired');
create type public.evidence_type as enum ('supplier_declaration', 'photo', 'test_report', 'certificate', 'invoice', 'weighbridge', 'compliance_document', 'other');
create type public.source_status as enum ('pre_consumer', 'post_consumer', 'unknown');
create type public.compliance_triage as enum ('not_assessed', 'ordinary_secondary_material', 'needs_compliance_review', 'regulated_or_hazardous_route');
create type public.lot_status as enum ('available', 'reserved', 'dispatched', 'closed');
create type public.eligibility_status as enum ('eligible', 'needs_sample', 'missing_evidence', 'blocked');
create type public.check_status as enum ('pass', 'warning', 'fail');
create type public.sample_status as enum ('requested', 'approved', 'received', 'accepted', 'rejected', 'cancelled');
create type public.offer_status as enum ('draft', 'sent', 'accepted', 'rejected', 'superseded');
create type public.shipment_status as enum ('planned', 'dispatched', 'received', 'disputed', 'cancelled');

create table public.company_memberships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null check (role in ('owner', 'listing_manager', 'buyer_manager', 'quality_reviewer', 'compliance_reviewer', 'logistics_coordinator', 'viewer')),
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);

-- Backfill each current company owner as an owner membership.
insert into public.company_memberships (company_id, user_id, role)
select id, owner_user_id, 'owner'
from public.companies
where owner_user_id is not null
on conflict (company_id, user_id) do nothing;

create table public.material_lots (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.waste_listings(id) on delete cascade,
  lot_code text not null,
  available_quantity_kg numeric(14,2) not null check (available_quantity_kg > 0),
  material_form text not null,
  source_status public.source_status not null default 'unknown',
  colour text,
  packaging text,
  storage_condition text,
  sample_available boolean not null default false,
  compliance_triage public.compliance_triage not null default 'not_assessed',
  declared_spec jsonb not null default '{}'::jsonb,
  status public.lot_status not null default 'available',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, lot_code)
);

create table public.quality_evidence (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references public.material_lots(id) on delete cascade,
  evidence_type public.evidence_type not null,
  title text not null,
  issuer text,
  status public.evidence_status not null default 'uploaded',
  summary text,
  storage_path text,
  document_name text,
  valid_until date,
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.buyer_acceptance_specs (
  id uuid primary key default gen_random_uuid(),
  buyer_requirement_id uuid not null unique references public.buyer_requirements(id) on delete cascade,
  accepted_forms jsonb not null default '[]'::jsonb,
  accepted_colours jsonb not null default '[]'::jsonb,
  prohibited_materials jsonb not null default '[]'::jsonb,
  required_evidence_status public.evidence_status not null default 'self_declared',
  requires_sample boolean not null default false,
  available_capacity_kg_week numeric(14,2) check (available_capacity_kg_week is null or available_capacity_kg_week > 0),
  route_note text,
  review_note text,
  is_demo boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.matches
  add column lot_id uuid references public.material_lots(id) on delete set null,
  add column eligibility_status public.eligibility_status not null default 'eligible',
  add column data_completeness_score numeric(5,2) not null default 0 check (data_completeness_score between 0 and 100),
  add column next_action text;

create table public.eligibility_checks (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  check_key text not null,
  label text not null,
  status public.check_status not null,
  detail text not null,
  created_at timestamptz not null default now()
);

create table public.sample_requests (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  requested_by uuid references public.users(id) on delete set null,
  requested_quantity_kg numeric(14,2) not null check (requested_quantity_kg > 0),
  status public.sample_status not null default 'requested',
  note text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  offered_by uuid references public.users(id) on delete set null,
  price_per_kg numeric(14,2) not null check (price_per_kg >= 0),
  quantity_kg numeric(14,2) not null check (quantity_kg > 0),
  pickup_model text not null check (pickup_model in ('buyer_pickup', 'generator_delivery', 'quote_required')),
  status public.offer_status not null default 'sent',
  note text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  planned_quantity_kg numeric(14,2) not null check (planned_quantity_kg > 0),
  pickup_date date not null,
  pickup_model text not null check (pickup_model in ('buyer_pickup', 'generator_delivery', 'platform_quote')),
  carrier_name text,
  status public.shipment_status not null default 'planned',
  dispatched_weight_kg numeric(14,2) check (dispatched_weight_kg is null or dispatched_weight_kg >= 0),
  received_weight_kg numeric(14,2) check (received_weight_kg is null or received_weight_kg >= 0),
  receipt_note text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.impact_methodologies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  version text not null,
  functional_unit text not null,
  system_boundary text not null,
  factor_source text not null,
  data_quality_tier text not null check (data_quality_tier in ('demo_scenario', 'estimated', 'evidence_backed')),
  notes text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  unique (name, version)
);

alter table public.impact_calculations
  add column methodology_id uuid references public.impact_methodologies(id) on delete set null,
  add column functional_unit text,
  add column system_boundary text,
  add column factor_source text,
  add column data_quality_tier text check (data_quality_tier in ('demo_scenario', 'estimated', 'evidence_backed'));

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  actor_id uuid references public.users(id) on delete set null,
  summary text not null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create index company_memberships_company_idx on public.company_memberships(company_id);
create index company_memberships_user_idx on public.company_memberships(user_id);
create index material_lots_listing_status_idx on public.material_lots(listing_id, status);
create index quality_evidence_lot_idx on public.quality_evidence(lot_id, status);
create index buyer_acceptance_specs_requirement_idx on public.buyer_acceptance_specs(buyer_requirement_id);
create index eligibility_checks_match_idx on public.eligibility_checks(match_id);
create index sample_requests_match_idx on public.sample_requests(match_id, created_at);
create index offers_match_idx on public.offers(match_id, created_at);
create index shipments_match_idx on public.shipments(match_id, pickup_date);
create index audit_events_entity_idx on public.audit_events(entity_type, entity_id, created_at desc);

-- Production FastAPI uses the Supabase service role for deterministic matching after
-- validating the requester. RLS below protects normal authenticated browser access.
alter table public.company_memberships enable row level security;
alter table public.material_lots enable row level security;
alter table public.quality_evidence enable row level security;
alter table public.buyer_acceptance_specs enable row level security;
alter table public.eligibility_checks enable row level security;
alter table public.sample_requests enable row level security;
alter table public.offers enable row level security;
alter table public.shipments enable row level security;
alter table public.impact_methodologies enable row level security;
alter table public.audit_events enable row level security;

create policy "members see own memberships" on public.company_memberships
  for select using (user_id = auth.uid() or public.is_admin());

create policy "members see lots for owned company" on public.material_lots
  for select using (
    public.is_admin() or exists (
      select 1 from public.waste_listings l join public.company_memberships cm on cm.company_id = l.company_id
      where l.id = listing_id and cm.user_id = auth.uid()
    )
  );

create policy "members see evidence for accessible lot" on public.quality_evidence
  for select using (
    public.is_admin() or exists (
      select 1 from public.material_lots lot
      join public.waste_listings l on l.id = lot.listing_id
      join public.company_memberships cm on cm.company_id = l.company_id
      where lot.id = lot_id and cm.user_id = auth.uid()
    )
  );

create policy "buyer members see their acceptance templates" on public.buyer_acceptance_specs
  for select using (
    public.is_admin() or exists (
      select 1 from public.buyer_requirements r join public.company_memberships cm on cm.company_id = r.company_id
      where r.id = buyer_requirement_id and cm.user_id = auth.uid()
    )
  );

create policy "impact methods readable by authenticated users" on public.impact_methodologies
  for select to authenticated using (true);

-- Insert/update policies for lots, evidence, workflow entities and audit events are
-- deliberately mediated by the FastAPI service role until detailed production roles
-- and document-review delegation are configured and tested.
