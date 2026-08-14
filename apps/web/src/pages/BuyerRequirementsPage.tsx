import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Factory, Loader2, MapPin, PackageSearch, Plus, Ruler, Target } from 'lucide-react'
import { get, post } from '../lib/api'
import { DELHI_NCR_CITIES, QUALITY_OPTIONS } from '../lib/constants'
import { formatCurrency, formatKg, titleCase } from '../lib/format'
import { useAsync } from '../hooks/useAsync'
import type { BuyerRequirement, MatchCard, Material, Role } from '../types'
import { DemoBadge, Disclosure, EmptyPanel, ErrorPanel, LoadingPanel, PageHeader, QualityPill, ScoreRing } from '../components/ui'

export function BuyerRequirementsPage({ role }: { role: Role }) {
  const materials = useAsync(() => get<Material[]>('/api/materials').then((response) => response.data), [])
  const requirements = useAsync(() => get<BuyerRequirement[]>('/api/buyer-requirements?mine=true').then((response) => response.data), [])
  const [selectedRequirementId, setSelectedRequirementId] = useState<string | null>(null)
  const matches = useAsync(
    () => selectedRequirementId
      ? get<{ requirement: BuyerRequirement; matches: MatchCard[] }>(`/api/buyer-requirements/${selectedRequirementId}/matches`).then((response) => response.data)
      : Promise.resolve(null),
    [selectedRequirementId],
  )
  const [form, setForm] = useState({
    material_id: 'mat-pet',
    minimum_quantity_kg_week: '2000',
    maximum_quantity_kg_week: '5000',
    minimum_quality_grade: 'industrial',
    maximum_distance_km: '150',
    target_price_per_kg: '17.5',
    allow_partial_quantity: true,
    city: 'Delhi',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }))
  const createRequirement = async () => {
    setError(null)
    if (Number(form.minimum_quantity_kg_week) > Number(form.maximum_quantity_kg_week)) {
      setError('Minimum quantity cannot exceed maximum quantity.')
      return
    }
    setSaving(true)
    try {
      const response = await post<{ requirement: BuyerRequirement }>('/api/buyer-requirements', {
        material_id: form.material_id,
        minimum_quantity_kg_week: Number(form.minimum_quantity_kg_week),
        maximum_quantity_kg_week: Number(form.maximum_quantity_kg_week),
        minimum_quality_grade: form.minimum_quality_grade,
        maximum_distance_km: Number(form.maximum_distance_km),
        target_price_per_kg: form.target_price_per_kg ? Number(form.target_price_per_kg) : null,
        allow_partial_quantity: form.allow_partial_quantity,
        city: form.city,
      })
      await requirements.reload()
      setSelectedRequirementId(response.data.requirement.id)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create the buyer requirement.')
    } finally {
      setSaving(false)
    }
  }

  if (materials.loading || requirements.loading) return <LoadingPanel label="Loading buyer requirement tools…" />
  if (materials.error || requirements.error || !materials.data || !requirements.data) return <ErrorPanel error={materials.error || requirements.error || 'Buyer data unavailable.'} onRetry={() => { void materials.reload(); void requirements.reload() }} />

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Buyer workflow" title="Define what your process can use" description="Create a controlled material requirement, then compare compatible supply with transparent eligibility rules." actions={<DemoBadge>Active Requirements</DemoBadge>} />
      {error && <div className="rounded-2xl border border-[#f1c6b9] bg-[#fff7f4] p-4 text-sm text-[#994f3a]">{error}</div>}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="card p-5 sm:p-7">
          <div className="flex items-start justify-between gap-3 border-b border-[#e4ece6] pb-5"><div><div className="flex items-center gap-2"><Factory size={19} className="text-spruce" /><h2 className="text-lg font-semibold tracking-[-0.03em] text-ink">New buyer requirement</h2></div><p className="mt-1 text-sm text-[#6a8078]">One material per requirement keeps matching clear and explainable.</p></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e7f4ec] text-spruce"><Plus size={18} /></span></div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label><span className="field-label">Required material</span><select className="field-input" value={form.material_id} onChange={(event) => update('material_id', event.target.value)}>{materials.data.map((material) => <option key={material.id} value={material.id}>{material.canonical_name}</option>)}</select></label>
            <label><span className="field-label">Buyer location</span><select className="field-input" value={form.city} onChange={(event) => update('city', event.target.value)}>{DELHI_NCR_CITIES.map((city) => <option key={city}>{city}</option>)}</select></label>
            <label><span className="field-label">Minimum quantity <span className="font-normal text-[#82968e]">kg/week</span></span><input type="number" min="1" className="field-input" value={form.minimum_quantity_kg_week} onChange={(event) => update('minimum_quantity_kg_week', event.target.value)} /></label>
            <label><span className="field-label">Maximum quantity <span className="font-normal text-[#82968e]">kg/week</span></span><input type="number" min="1" className="field-input" value={form.maximum_quantity_kg_week} onChange={(event) => update('maximum_quantity_kg_week', event.target.value)} /></label>
            <label><span className="field-label">Minimum stated quality</span><select className="field-input" value={form.minimum_quality_grade} onChange={(event) => update('minimum_quality_grade', event.target.value)}>{QUALITY_OPTIONS.map((quality) => <option key={quality} value={quality}>{titleCase(quality)}</option>)}</select></label>
            <label><span className="field-label">Maximum distance <span className="font-normal text-[#82968e]">km</span></span><input type="number" min="1" className="field-input" value={form.maximum_distance_km} onChange={(event) => update('maximum_distance_km', event.target.value)} /></label>
            <label><span className="field-label">Target price <span className="font-normal text-[#82968e]">₹/kg</span></span><input type="number" min="0" className="field-input" value={form.target_price_per_kg} onChange={(event) => update('target_price_per_kg', event.target.value)} /></label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#dce7df] bg-[#f8fbf9] px-4 py-3.5"><input type="checkbox" checked={form.allow_partial_quantity} onChange={(event) => update('allow_partial_quantity', event.target.checked)} className="h-4 w-4 accent-[#12645b]" /><span><span className="block text-sm font-semibold text-ink">Allow partial quantity</span><span className="block text-[11px] text-[#70857e]">Permit a supply volume outside range for review</span></span></label>
          </div>
          <div className="mt-6 flex flex-col gap-3 border-t border-[#e4ece6] pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-[#71867e]"><Ruler className="mr-1 inline text-spruce" size={14} />Distance uses demo Haversine calculations between sample city coordinates.</p><button className="btn-primary" disabled={saving} onClick={() => void createRequirement()}>{saving ? <Loader2 className="animate-spin" size={17} /> : <Target size={17} />}{saving ? 'Publishing…' : 'Publish & find supply'}<ArrowRight size={16} /></button></div>
        </div>
        <aside className="card p-5"><p className="eyebrow">Decision rules</p><h2 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-ink">What the engine checks</h2><div className="mt-6 space-y-4">{[
          ['Material', 'Exact controlled catalog compatibility is required in v1.'],
          ['Quality', 'Supplier-declared grades remain visibly Not verified.'],
          ['Quantity', 'A preferred weekly range creates a transparent fit score.'],
          ['Distance', 'Requirements outside your maximum radius are excluded.'],
          ['Economics & impact', 'Illustrative inputs are separated from real procurement decisions.'],
        ].map(([title, detail], index) => <div key={title} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[#e7f4ec] text-[10px] font-bold text-spruce">{index + 1}</span><p className="text-xs leading-5 text-[#607770]"><strong className="font-semibold text-ink">{title}.</strong> {detail}</p></div>)}</div></aside>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Published requirements</p><h2 className="mt-1 section-title">Your active demand signals</h2></div><span className="text-sm text-[#70857d]">{requirements.data.length} requirement{requirements.data.length === 1 ? '' : 's'} in Demo Dataset</span></div>
        {requirements.data.length === 0 ? <EmptyPanel title="No buyer requirement yet" detail="Publish a controlled material requirement above to analyze compatible demo supply." /> : <div className="grid gap-4 lg:grid-cols-2">{requirements.data.map((requirement) => <article key={requirement.id} className={`card card-interactive p-5 ${selectedRequirementId === requirement.id ? 'border-spruce ring-4 ring-mint/30' : ''}`}><div className="flex justify-between gap-4"><div><p className="text-lg font-semibold tracking-[-0.03em] text-ink">{requirement.material}</p><p className="mt-1 text-xs text-[#6f857c]">{requirement.company} · {requirement.city}</p></div><span className="rounded-xl bg-[#e7f4ec] px-3 py-2 text-xs font-bold text-spruce">Active</span></div><div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-[#f5f8f5] p-3 text-xs"><div><span className="block text-[#789087]">Quantity</span><strong className="mt-1 block text-ink">{formatKg(requirement.minimum_quantity_kg_week)}–{formatKg(requirement.maximum_quantity_kg_week)}</strong></div><div><span className="block text-[#789087]">Radius</span><strong className="mt-1 block text-ink">{requirement.maximum_distance_km} km</strong></div><div><span className="block text-[#789087]">Target</span><strong className="mt-1 block text-ink">{formatCurrency(requirement.target_price_per_kg)}/kg</strong></div><div><span className="block text-[#789087]">Minimum quality</span><strong className="mt-1 block text-ink">{titleCase(requirement.minimum_quality_grade)}</strong></div></div><div className="mt-4 grid gap-2 sm:grid-cols-2"><button className="btn-secondary w-full" onClick={() => setSelectedRequirementId(requirement.id)}><PackageSearch size={16} />Find compatible supply</button><Link className="btn-primary w-full" to={`/buyer-requirements/${requirement.id}/acceptance-spec`}><Ruler size={16} />Acceptance rules</Link></div></article>)}</div>}
      </section>

      {selectedRequirementId && <section className="space-y-4 rounded-3xl border border-[#d7e6dc] bg-[#f8fcf9] p-5 sm:p-7"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Supply analysis</p><h2 className="mt-1 section-title">Compatible waste listings</h2><p className="mt-1 text-sm text-[#6c8179]">Ranked using the same decision rules; source quality flags remain visible.</p></div>{matches.loading ? <span className="text-sm text-[#6b8179]">Analyzing…</span> : matches.data ? <span className="badge-safe">{matches.data.matches.length} passed compatibility gates</span> : null}</div>{matches.loading ? <LoadingPanel label="Comparing active demo listings…" /> : matches.error ? <ErrorPanel error={matches.error} onRetry={() => void matches.reload()} /> : matches.data?.matches.length ? <div className="grid gap-4 xl:grid-cols-3">{matches.data.matches.map((match) => { const listing = match.waste_listing; return <article key={match.id} className="card card-interactive p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-lg font-semibold tracking-[-0.03em] text-ink">{listing?.company || 'Waste generator'}</p><p className="mt-1 text-xs text-[#70857e]">{listing?.city} · {listing?.material}</p></div><ScoreRing score={match.total_score} size={72} /></div><div className="mt-4 flex items-center gap-2"><QualityPill verified={listing?.quality_verified || false} grade={titleCase(listing?.quality_grade)} /></div><div className="mt-4 space-y-2 text-xs text-[#5e756c]"><p><strong className="text-ink">Available:</strong> {formatKg(listing?.normalized_kg_per_week || 0)}/week</p><p><strong className="text-ink">Distance:</strong> {match.distance_km.toFixed(1)} km</p><p><strong className="text-ink">Potential use:</strong> {match.potential_use}</p></div><Link className="btn-primary mt-5 w-full" to={`/matches/${match.id}`}><PackageSearch size={16} />View explanation</Link></article> })}</div> : <EmptyPanel title="No compatible demo supply found" detail="Try extending the maximum distance, widening the quantity range, or choose another supported material." />}</section>}
    </div>
  )
}
