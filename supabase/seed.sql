-- CircularMatch catalog seed
-- Apply after 0001_initial_schema.sql.
-- This seeds only the controlled material catalog and illustrative configuration.
-- Full fictional Delhi NCR companies/listings/requirements are intentionally seeded
-- by apps/api/app/seed/demo_data.py in DEMO_MODE, because production companies must
-- be associated with real Supabase Auth users.

insert into public.materials (canonical_name, category, aliases, notes, supported)
values
  ('PET industrial scrap', 'Plastic', '["pet scrap", "pet manufacturing scrap", "pet waste", "polyethylene terephthalate"]'::jsonb, 'Controlled MVP material. Quality remains Not verified unless documentary verification is recorded.', true),
  ('Cotton textile cutting waste', 'Textile', '["cotton cutting waste", "textile cutting waste", "cotton scraps", "fabric offcuts"]'::jsonb, 'Controlled MVP material. Composition and cleanliness require buyer verification.', true),
  ('Corrugated cardboard and paper trim', 'Paper / Cardboard', '["cardboard waste", "occ", "paper trim", "corrugated scrap"]'::jsonb, 'Controlled MVP material. Moisture and contamination must be checked by buyer.', true),
  ('Mild-steel fabrication scrap', 'Metal', '["steel scrap", "mild steel scrap", "metal fabrication scrap", "ms scrap"]'::jsonb, 'Controlled MVP material. Grade separation and contaminant checks are required.', true)
on conflict (canonical_name) do update
set category = excluded.category,
    aliases = excluded.aliases,
    notes = excluded.notes,
    supported = excluded.supported,
    updated_at = now();

insert into public.material_uses (material_id, title, description, pathway_type, recovery_factor, virgin_displacement_factor, demo_assumptions)
select m.id, 'Recycled PET feedstock', 'Potential use after buyer-side sorting, processing, and quality checks.', 'mechanical_recycling', 0.85, 0.85, '{"label":"Illustrative / Demo Data","recovery_note":"Illustrative recovery factor; not a yield guarantee."}'::jsonb
from public.materials m
where m.canonical_name = 'PET industrial scrap'
  and not exists (select 1 from public.material_uses u where u.material_id = m.id and u.title = 'Recycled PET feedstock');

insert into public.material_uses (material_id, title, description, pathway_type, recovery_factor, virgin_displacement_factor, demo_assumptions)
select m.id, 'Polyester fibre feedstock', 'Potential downstream use where the recycler and buyer confirm suitability.', 'secondary_feedstock', 0.76, 0.70, '{"label":"Illustrative / Demo Data"}'::jsonb
from public.materials m
where m.canonical_name = 'PET industrial scrap'
  and not exists (select 1 from public.material_uses u where u.material_id = m.id and u.title = 'Polyester fibre feedstock');

insert into public.material_uses (material_id, title, description, pathway_type, recovery_factor, virgin_displacement_factor, demo_assumptions)
select m.id, 'Recycled yarn feedstock', 'Potential use after fibre sorting and buyer quality checks.', 'fibre_recycling', 0.72, 0.70, '{"label":"Illustrative / Demo Data"}'::jsonb
from public.materials m
where m.canonical_name = 'Cotton textile cutting waste'
  and not exists (select 1 from public.material_uses u where u.material_id = m.id and u.title = 'Recycled yarn feedstock');

insert into public.material_uses (material_id, title, description, pathway_type, recovery_factor, virgin_displacement_factor, demo_assumptions)
select m.id, 'Insulation material', 'Potential nonwoven or insulation pathway subject to processing requirements.', 'nonwoven_recovery', 0.68, 0.55, '{"label":"Illustrative / Demo Data"}'::jsonb
from public.materials m
where m.canonical_name = 'Cotton textile cutting waste'
  and not exists (select 1 from public.material_uses u where u.material_id = m.id and u.title = 'Insulation material');

insert into public.material_uses (material_id, title, description, pathway_type, recovery_factor, virgin_displacement_factor, demo_assumptions)
select m.id, 'Recycled paperboard feedstock', 'Potential pulping route subject to moisture and contamination checks.', 'paper_recycling', 0.82, 0.75, '{"label":"Illustrative / Demo Data"}'::jsonb
from public.materials m
where m.canonical_name = 'Corrugated cardboard and paper trim'
  and not exists (select 1 from public.material_uses u where u.material_id = m.id and u.title = 'Recycled paperboard feedstock');

insert into public.material_uses (material_id, title, description, pathway_type, recovery_factor, virgin_displacement_factor, demo_assumptions)
select m.id, 'Steel re-melt feedstock', 'Potential use after grade separation and processor acceptance checks.', 'metal_recycling', 0.92, 0.90, '{"label":"Illustrative / Demo Data"}'::jsonb
from public.materials m
where m.canonical_name = 'Mild-steel fabrication scrap'
  and not exists (select 1 from public.material_uses u where u.material_id = m.id and u.title = 'Steel re-melt feedstock');

insert into public.match_scoring_configs (name, weights, active, version, is_demo)
select
  'Default MVP decision rules',
  '{"material":0.35,"quality":0.20,"quantity":0.15,"distance":0.15,"price":0.10,"environment":0.05}'::jsonb,
  true,
  1,
  true
where not exists (
  select 1 from public.match_scoring_configs where name = 'Default MVP decision rules'
);
