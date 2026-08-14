-- CircularMatch production schema
-- All pricing/impact values in the MVP demo are Illustrative / Demo Data.
-- Supabase Auth owns auth.users; public.users is the application profile table.

create extension if not exists pgcrypto;

create type public.user_role as enum ('generator', 'buyer', 'admin');
create type public.company_type as enum ('generator', 'buyer', 'recycler', 'processor');
create type public.verification_status as enum ('demo', 'unverified', 'verified');
create type public.quality_grade as enum ('unknown', 'mixed', 'standard', 'industrial', 'premium');
create type public.listing_status as enum ('draft', 'active', 'paused', 'archived');
create type public.requirement_status as enum ('active', 'paused', 'archived');
create type public.match_status as enum ('suggested', 'contacted', 'accepted', 'rejected');
create type public.transaction_status as enum ('initiated', 'contacted', 'accepted', 'rejected', 'completed', 'cancelled');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'generator',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- New Supabase Auth accounts receive a safe generator profile by default.
-- Role elevation to buyer/admin must be performed through an approved server/admin flow.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, 'CircularMatch user'), '@', 1)),
    'generator'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users(id) on delete restrict,
  name text not null,
  company_type public.company_type not null,
  city text not null,
  address_label text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  verification_status public.verification_status not null default 'unverified',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_company_latitude check (latitude is null or latitude between -90 and 90),
  constraint valid_company_longitude check (longitude is null or longitude between -180 and 180)
);

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  canonical_name text not null unique,
  category text not null,
  aliases jsonb not null default '[]'::jsonb,
  quality_scale jsonb not null default '["unknown", "mixed", "standard", "industrial", "premium"]'::jsonb,
  supported boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.material_uses (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials(id) on delete cascade,
  title text not null,
  description text not null,
  pathway_type text not null,
  recovery_factor numeric(5,4) not null check (recovery_factor between 0 and 1),
  virgin_displacement_factor numeric(5,4) not null check (virgin_displacement_factor between 0 and 2),
  demo_assumptions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.waste_listings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  material_id uuid not null references public.materials(id) on delete restrict,
  raw_description text not null,
  source text not null default 'manual' check (source in ('manual', 'ai_assisted', 'imported')),
  quantity_kg numeric(14,2) not null check (quantity_kg > 0),
  frequency text not null default 'weekly' check (frequency in ('weekly', 'monthly', 'one_time')),
  normalized_kg_per_week numeric(14,2) not null check (normalized_kg_per_week > 0),
  quality_grade public.quality_grade not null default 'unknown',
  quality_verified boolean not null default false,
  quality_notes text,
  availability text,
  city text not null,
  latitude numeric(9,6),
  longitude numeric(9,6),
  asking_price_per_kg numeric(14,2) check (asking_price_per_kg is null or asking_price_per_kg >= 0),
  disposal_cost_per_kg numeric(14,2) check (disposal_cost_per_kg is null or disposal_cost_per_kg >= 0),
  selected_use_id uuid references public.material_uses(id) on delete set null,
  status public.listing_status not null default 'draft',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_listing_latitude check (latitude is null or latitude between -90 and 90),
  constraint valid_listing_longitude check (longitude is null or longitude between -180 and 180)
);

create table public.listing_ai_analyses (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.waste_listings(id) on delete set null,
  raw_input text not null,
  provider text not null,
  structured_output jsonb not null,
  validation_notes jsonb not null default '[]'::jsonb,
  status text not null check (status in ('needs_review', 'accepted', 'rejected', 'failed')),
  created_at timestamptz not null default now()
);

create table public.buyer_requirements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete restrict,
  material_id uuid not null references public.materials(id) on delete restrict,
  minimum_quantity_kg_week numeric(14,2) not null check (minimum_quantity_kg_week > 0),
  maximum_quantity_kg_week numeric(14,2) not null check (maximum_quantity_kg_week > 0),
  minimum_quality_grade public.quality_grade not null default 'standard',
  maximum_distance_km numeric(10,2) not null check (maximum_distance_km > 0),
  target_price_per_kg numeric(14,2) check (target_price_per_kg is null or target_price_per_kg >= 0),
  allow_partial_quantity boolean not null default true,
  city text not null,
  latitude numeric(9,6),
  longitude numeric(9,6),
  status public.requirement_status not null default 'active',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_requirement_range check (minimum_quantity_kg_week <= maximum_quantity_kg_week),
  constraint valid_requirement_latitude check (latitude is null or latitude between -90 and 90),
  constraint valid_requirement_longitude check (longitude is null or longitude between -180 and 180)
);

create table public.match_scoring_configs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  weights jsonb not null,
  active boolean not null default true,
  version integer not null default 1,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.waste_listings(id) on delete cascade,
  buyer_requirement_id uuid not null references public.buyer_requirements(id) on delete cascade,
  scoring_config_id uuid references public.match_scoring_configs(id) on delete set null,
  total_score numeric(5,2) not null check (total_score between 0 and 100),
  material_score numeric(5,2) not null check (material_score between 0 and 100),
  quality_score numeric(5,2) not null check (quality_score between 0 and 100),
  quantity_score numeric(5,2) not null check (quantity_score between 0 and 100),
  distance_score numeric(5,2) not null check (distance_score between 0 and 100),
  price_score numeric(5,2) not null check (price_score between 0 and 100),
  environment_score numeric(5,2) not null check (environment_score between 0 and 100),
  distance_km numeric(10,2) not null check (distance_km >= 0),
  estimated_logistics_per_kg numeric(14,2),
  delivered_cost_per_kg numeric(14,2),
  status public.match_status not null default 'suggested',
  flags jsonb not null default '[]'::jsonb,
  explanation_inputs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, buyer_requirement_id, scoring_config_id)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete restrict,
  initiated_by uuid references public.users(id) on delete set null,
  agreed_quantity_kg numeric(14,2) check (agreed_quantity_kg is null or agreed_quantity_kg >= 0),
  agreed_price_per_kg numeric(14,2) check (agreed_price_per_kg is null or agreed_price_per_kg >= 0),
  status public.transaction_status not null default 'initiated',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.impact_calculations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  material_use_id uuid references public.material_uses(id) on delete set null,
  waste_diverted_kg numeric(14,2) not null check (waste_diverted_kg >= 0),
  secondary_material_kg numeric(14,2) not null check (secondary_material_kg >= 0),
  virgin_material_displaced_kg numeric(14,2) not null check (virgin_material_displaced_kg >= 0),
  transport_co2e_kg numeric(14,2) not null,
  avoided_co2e_kg numeric(14,2) not null,
  net_co2e_benefit_kg numeric(14,2) not null,
  assumptions jsonb not null,
  calculation_version text not null,
  is_illustrative boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.listing_reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.waste_listings(id) on delete cascade,
  reported_by uuid references public.users(id) on delete set null,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index companies_owner_user_id_idx on public.companies(owner_user_id);
create index waste_listings_material_status_idx on public.waste_listings(material_id, status);
create index waste_listings_company_idx on public.waste_listings(company_id);
create index buyer_requirements_material_status_idx on public.buyer_requirements(material_id, status);
create index buyer_requirements_company_idx on public.buyer_requirements(company_id);
create index matches_listing_score_idx on public.matches(listing_id, total_score desc);
create index matches_requirement_score_idx on public.matches(buyer_requirement_id, total_score desc);

-- Helper avoids policy recursion while keeping admin access explicit.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin');
$$;

alter table public.users enable row level security;
alter table public.companies enable row level security;
alter table public.materials enable row level security;
alter table public.material_uses enable row level security;
alter table public.waste_listings enable row level security;
alter table public.listing_ai_analyses enable row level security;
alter table public.buyer_requirements enable row level security;
alter table public.match_scoring_configs enable row level security;
alter table public.matches enable row level security;
alter table public.transactions enable row level security;
alter table public.impact_calculations enable row level security;
alter table public.listing_reports enable row level security;

create policy "users read own profile" on public.users for select using (id = auth.uid() or public.is_admin());
create policy "users update own profile" on public.users for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

create policy "companies own or admin" on public.companies for all using (owner_user_id = auth.uid() or public.is_admin()) with check (owner_user_id = auth.uid() or public.is_admin());
create policy "catalog readable by authenticated users" on public.materials for select to authenticated using (true);
create policy "catalog admin write" on public.materials for all using (public.is_admin()) with check (public.is_admin());
create policy "material uses readable by authenticated users" on public.material_uses for select to authenticated using (true);
create policy "material uses admin write" on public.material_uses for all using (public.is_admin()) with check (public.is_admin());

create policy "listings visible to owners or admin" on public.waste_listings for select using (
  public.is_admin() or exists (select 1 from public.companies c where c.id = company_id and c.owner_user_id = auth.uid())
);
create policy "listing owner writes" on public.waste_listings for insert with check (
  exists (select 1 from public.companies c where c.id = company_id and c.owner_user_id = auth.uid()) or public.is_admin()
);
create policy "listing owner updates" on public.waste_listings for update using (
  public.is_admin() or exists (select 1 from public.companies c where c.id = company_id and c.owner_user_id = auth.uid())
) with check (
  public.is_admin() or exists (select 1 from public.companies c where c.id = company_id and c.owner_user_id = auth.uid())
);

create policy "analysis listing owner or admin" on public.listing_ai_analyses for all using (
  public.is_admin() or exists (
    select 1 from public.waste_listings l join public.companies c on c.id = l.company_id
    where l.id = listing_id and c.owner_user_id = auth.uid()
  )
) with check (public.is_admin() or listing_id is null or exists (
  select 1 from public.waste_listings l join public.companies c on c.id = l.company_id
  where l.id = listing_id and c.owner_user_id = auth.uid()
));

create policy "requirements visible to owners or admin" on public.buyer_requirements for select using (
  public.is_admin() or exists (select 1 from public.companies c where c.id = company_id and c.owner_user_id = auth.uid())
);
create policy "requirement owner writes" on public.buyer_requirements for all using (
  public.is_admin() or exists (select 1 from public.companies c where c.id = company_id and c.owner_user_id = auth.uid())
) with check (
  public.is_admin() or exists (select 1 from public.companies c where c.id = company_id and c.owner_user_id = auth.uid())
);

create policy "scoring config readable" on public.match_scoring_configs for select to authenticated using (true);
create policy "scoring config admin write" on public.match_scoring_configs for all using (public.is_admin()) with check (public.is_admin());

create policy "matches participant or admin" on public.matches for select using (
  public.is_admin() or exists (
    select 1 from public.waste_listings l join public.companies c on c.id = l.company_id
    where l.id = listing_id and c.owner_user_id = auth.uid()
  ) or exists (
    select 1 from public.buyer_requirements r join public.companies c on c.id = r.company_id
    where r.id = buyer_requirement_id and c.owner_user_id = auth.uid()
  )
);

create policy "transactions participant or admin" on public.transactions for select using (
  public.is_admin() or initiated_by = auth.uid() or exists (
    select 1 from public.matches m
    join public.waste_listings l on l.id = m.listing_id
    join public.companies c on c.id = l.company_id
    where m.id = match_id and c.owner_user_id = auth.uid()
  ) or exists (
    select 1 from public.matches m
    join public.buyer_requirements r on r.id = m.buyer_requirement_id
    join public.companies c on c.id = r.company_id
    where m.id = match_id and c.owner_user_id = auth.uid()
  )
);

create policy "impact participant or admin" on public.impact_calculations for select using (
  public.is_admin() or exists (
    select 1 from public.matches m
    join public.waste_listings l on l.id = m.listing_id
    join public.companies c on c.id = l.company_id
    where m.id = match_id and c.owner_user_id = auth.uid()
  ) or exists (
    select 1 from public.matches m
    join public.buyer_requirements r on r.id = m.buyer_requirement_id
    join public.companies c on c.id = r.company_id
    where m.id = match_id and c.owner_user_id = auth.uid()
  )
);

create policy "reporter or admin views reports" on public.listing_reports for select using (reported_by = auth.uid() or public.is_admin());
create policy "authenticated users create reports" on public.listing_reports for insert to authenticated with check (reported_by = auth.uid());
create policy "admin updates reports" on public.listing_reports for update using (public.is_admin()) with check (public.is_admin());

-- The FastAPI server uses the service role in production for deterministic matching
-- and may write matches, transactions, and impacts after validating the caller.
