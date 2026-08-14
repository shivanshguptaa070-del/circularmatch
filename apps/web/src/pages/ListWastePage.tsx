import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ChevronRight, ClipboardCheck, FileText, Info, Loader2, MapPin, Recycle, Sparkles, WandSparkles } from 'lucide-react'
import { get, post } from '../lib/api'
import { DELHI_NCR_CITIES, DEMO_GENERATOR_TEXT, QUALITY_OPTIONS } from '../lib/constants'
import { titleCase } from '../lib/format'
import { useAsync } from '../hooks/useAsync'
import type { ExtractionResult, Listing, Material, Role } from '../types'
import { DemoBadge, Disclosure, ErrorPanel, LoadingPanel, PageHeader, QualityPill } from '../components/ui'

interface ListingFormState {
  material_id: string
  quantity_kg: string
  frequency: 'weekly' | 'monthly' | 'one_time'
  quality_grade: string
  quality_notes: string
  availability: string
  city: string
  asking_price_per_kg: string
  disposal_cost_per_kg: string
  selected_use_id: string
  material_form: string
  source_status: 'pre_consumer' | 'post_consumer' | 'unknown'
  colour: string
  packaging: string
  storage_condition: string
  sample_available: boolean
  compliance_triage: 'not_assessed' | 'ordinary_secondary_material' | 'needs_compliance_review' | 'regulated_or_hazardous_route'
}

const initialForm: ListingFormState = {
  material_id: '',
  quantity_kg: '',
  frequency: 'weekly',
  quality_grade: 'unknown',
  quality_notes: '',
  availability: 'To be confirmed',
  city: 'Noida',
  asking_price_per_kg: '14',
  disposal_cost_per_kg: '8',
  selected_use_id: '',
  material_form: 'Manufacturing trim',
  source_status: 'pre_consumer',
  colour: 'Clear',
  packaging: 'Baled sacks',
  storage_condition: 'Covered indoor storage',
  sample_available: true,
  compliance_triage: 'not_assessed',
}

export function ListWastePage({ role }: { role: Role }) {
  const navigate = useNavigate()
  const materials = useAsync(() => get<Material[]>('/api/materials').then((response) => response.data), [])
  const [step, setStep] = useState<1 | 2>(1)
  const [description, setDescription] = useState(DEMO_GENERATOR_TEXT)
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null)
  const [form, setForm] = useState<ListingFormState>(initialForm)
  const [analyzing, setAnalyzing] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedMaterial = materials.data?.find((item) => item.id === form.material_id)
  const potentialUses = extraction?.potential_uses.length ? extraction.potential_uses : (selectedMaterial?.uses || []).map((item) => ({ ...item, label: 'Potential use — verify suitability with buyer' }))

  const update = (key: keyof ListingFormState, value: string | boolean) => setForm((current) => ({ ...current, [key]: value } as ListingFormState))

  const analyze = async () => {
    setError(null)
    setAnalyzing(true)
    try {
      const response = await post<ExtractionResult>('/api/ai/extract-waste', { description })
      const result = response.data
      setExtraction(result)
      setForm({
        material_id: result.structured.material_id || '',
        quantity_kg: result.structured.quantity_kg ? String(result.structured.quantity_kg) : '',
        frequency: result.structured.frequency || 'weekly',
        quality_grade: result.structured.quality_grade || 'unknown',
        quality_notes: result.structured.quality_notes || '',
        availability: result.structured.availability || 'To be confirmed',
        city: result.structured.city || 'Noida',
        asking_price_per_kg: '14',
        disposal_cost_per_kg: '8',
        selected_use_id: result.potential_uses[0]?.id || '',
        material_form: 'Manufacturing trim',
        source_status: 'pre_consumer',
        colour: 'Clear',
        packaging: 'Baled sacks',
        storage_condition: 'Covered indoor storage',
        sample_available: true,
        compliance_triage: 'not_assessed',
      })
      setStep(2)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not analyze the description.')
    } finally {
      setAnalyzing(false)
    }
  }

  const publish = async () => {
    setError(null)
    if (!form.material_id || !Number(form.quantity_kg) || !form.city) {
      setError('Please choose a material, enter quantity, and select a demo city before publishing.')
      return
    }
    setPublishing(true)
    try {
      const response = await post<{ listing: Listing }>('/api/listings', {
        material_id: form.material_id,
        raw_description: description,
        quantity_kg: Number(form.quantity_kg),
        frequency: form.frequency,
        quality_grade: form.quality_grade,
        quality_verified: false,
        quality_notes: form.quality_notes,
        availability: form.availability,
        city: form.city,
        asking_price_per_kg: form.asking_price_per_kg ? Number(form.asking_price_per_kg) : null,
        disposal_cost_per_kg: form.disposal_cost_per_kg ? Number(form.disposal_cost_per_kg) : null,
        selected_use_id: form.selected_use_id || null,
        material_form: form.material_form,
        source_status: form.source_status,
        colour: form.colour,
        packaging: form.packaging,
        storage_condition: form.storage_condition,
        sample_available: form.sample_available,
        compliance_triage: form.compliance_triage,
      })
      navigate(`/listings/${response.data.listing.id}/matches`, { state: { created: true } })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not publish this listing.')
    } finally {
      setPublishing(false)
    }
  }

  if (materials.loading) return <LoadingPanel label="Loading the supported material catalog…" />
  if (materials.error || !materials.data) return <ErrorPanel error={materials.error || 'Material catalog unavailable.'} onRetry={() => void materials.reload()} />
  const catalog = materials.data

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Generator workflow"
        title="List a secondary-material opportunity"
        description="Describe the waste in your own words. CircularMatch returns a structured profile and runs deterministic matching once published."
        actions={<DemoBadge>Active Stream</DemoBadge>}
      />

      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className={`flex items-center gap-2 rounded-full px-3 py-2 ${step === 1 ? 'bg-forest text-white' : 'bg-[#e2f1e8] text-spruce'}`}><span className="grid h-5 w-5 place-items-center rounded-full bg-white/20 text-[10px]">1</span>Describe waste</span>
        <ChevronRight size={15} className="text-[#a0b1a9]" />
        <span className={`flex items-center gap-2 rounded-full px-3 py-2 ${step === 2 ? 'bg-forest text-white' : 'bg-[#edf2ee] text-[#789087]'}`}><span className="grid h-5 w-5 place-items-center rounded-full bg-white/20 text-[10px]">2</span>Review & publish</span>
        <ChevronRight size={15} className="text-[#a0b1a9]" />
        <span className="flex items-center gap-2 rounded-full bg-[#edf2ee] px-3 py-2 text-[#789087]"><span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[10px]">3</span>Find best buyers</span>
      </div>

      {error && <div className="rounded-2xl border border-[#f1c6b9] bg-[#fff7f4] p-4 text-sm text-[#994f3a]">{error}</div>}

      {step === 1 ? (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="card p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2"><WandSparkles size={18} className="text-spruce" /><h2 className="text-lg font-semibold tracking-[-0.03em] text-ink">Describe the material stream</h2></div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#617770]">Include approximate quantity, frequency, location, quality descriptor and availability if known. You will edit every field before publishing.</p>
              </div>
              <button className="btn-secondary !px-3 !py-2 text-xs" onClick={() => setDescription(DEMO_GENERATOR_TEXT)}><Sparkles size={14} />Use PET demo input</button>
            </div>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={10}
              className="field-input mt-6 resize-y leading-6"
              aria-label="Natural language waste description"
              placeholder="Example: We generate around 3 tonnes of PET manufacturing scrap every week in Noida…"
            />
            <div className="mt-4 flex flex-col gap-3 border-t border-[#e5ece7] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-lg text-xs leading-5 text-[#738980]"><Info className="mr-1 inline text-spruce" size={14} />The extraction may identify a draft category, but it cannot verify composition, contamination or certification from text.</p>
              <button className="btn-primary" disabled={analyzing || description.trim().length < 8} onClick={() => void analyze()}>
                {analyzing ? <Loader2 className="animate-spin" size={17} /> : <WandSparkles size={17} />}{analyzing ? 'Structuring material…' : 'Analyze & structure'}<ArrowRight size={16} />
              </button>
            </div>
          </div>
          <aside className="card overflow-hidden">
            <div className="bg-[#eaf6ef] p-5"><p className="eyebrow">What happens next</p><h2 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-ink">Useful, not magical.</h2></div>
            <div className="space-y-5 p-5">
              {[
                ['Extract', 'Quantity, city, timing and a catalog-backed material candidate.'],
                ['Flag', 'Supplier-described quality stays Not verified unless evidence is recorded.'],
                ['Review', 'You control what becomes the published listing.'],
              ].map(([title, detail], index) => <div key={title} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#edf5f0] text-xs font-bold text-spruce">0{index + 1}</span><div><h3 className="text-sm font-semibold text-ink">{title}</h3><p className="mt-1 text-xs leading-5 text-[#71867e]">{detail}</p></div></div>)}
            </div>
          </aside>
        </section>
      ) : (
        <section className="space-y-5">
          {extraction && <Disclosure title={extraction.provider === 'gemini' ? 'AI-assisted draft' : 'Demo extraction — rule-based fallback'}>{extraction.provider_disclosure}</Disclosure>}
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="card p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e4ece6] pb-5"><div><div className="flex items-center gap-2"><ClipboardCheck size={19} className="text-spruce" /><h2 className="text-lg font-semibold tracking-[-0.03em] text-ink">Review structured listing</h2></div><p className="mt-1 text-sm text-[#6a8078]">Edit the draft before it becomes available for matching.</p></div><button className="btn-secondary !py-2" onClick={() => setStep(1)}><ArrowLeft size={15} />Edit description</button></div>
              {extraction?.structured.missing_fields?.length ? <div className="mt-5 rounded-xl border border-[#efd8a4] bg-[#fff8e8] p-3 text-xs text-[#806427]"><strong>Complete before publishing:</strong><ul className="mt-1 list-disc space-y-0.5 pl-4">{extraction.structured.missing_fields.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label><span className="field-label">Controlled material</span><select value={form.material_id} className="field-input" onChange={(event) => { update('material_id', event.target.value); const use = catalog.find((item) => item.id === event.target.value)?.uses[0]?.id || ''; update('selected_use_id', use) }}><option value="">Select material</option>{catalog.map((material) => <option key={material.id} value={material.id}>{material.canonical_name} · {material.category}</option>)}</select></label>
                <label><span className="field-label">Quantity available</span><div className="relative"><input type="number" min="1" value={form.quantity_kg} className="field-input pr-12" onChange={(event) => update('quantity_kg', event.target.value)} /><span className="absolute right-3 top-3.5 text-xs font-semibold text-[#758b82]">kg</span></div></label>
                <label><span className="field-label">Frequency</span><select value={form.frequency} className="field-input" onChange={(event) => update('frequency', event.target.value)}><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="one_time">One-time lot</option></select></label>
                <label><span className="field-label">Demo city</span><select value={form.city} className="field-input" onChange={(event) => update('city', event.target.value)}>{DELHI_NCR_CITIES.map((city) => <option key={city}>{city}</option>)}</select></label>
                <label><span className="field-label">Stated quality grade</span><select value={form.quality_grade} className="field-input" onChange={(event) => update('quality_grade', event.target.value)}>{QUALITY_OPTIONS.map((option) => <option key={option} value={option}>{titleCase(option)}</option>)}</select></label>
                <label><span className="field-label">Availability</span><input value={form.availability} className="field-input" onChange={(event) => update('availability', event.target.value)} /></label>
                <label><span className="field-label">Illustrative asking price <span className="font-normal text-[#82968e]">₹/kg</span></span><input type="number" min="0" value={form.asking_price_per_kg} className="field-input" onChange={(event) => update('asking_price_per_kg', event.target.value)} /></label>
                <label><span className="field-label">Current disposal cost <span className="font-normal text-[#82968e]">₹/kg</span></span><input type="number" min="0" value={form.disposal_cost_per_kg} className="field-input" onChange={(event) => update('disposal_cost_per_kg', event.target.value)} /></label>
                <label className="sm:col-span-2"><span className="field-label">Quality note</span><input value={form.quality_notes} className="field-input" onChange={(event) => update('quality_notes', event.target.value)} /></label>
                <div className="sm:col-span-2 mt-2 rounded-2xl border border-[#d8e7dc] bg-[#f7fbf8] p-4">
                  <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-ink">Material Passport starter</p><p className="mt-1 text-xs leading-5 text-[#6e837a]">These are supplier-declared lot details. They improve matching but do not verify composition or legal status.</p></div><span className="badge-demo">lot data</span></div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label><span className="field-label">Material form</span><input value={form.material_form} className="field-input" onChange={(event) => update('material_form', event.target.value)} /></label>
                    <label><span className="field-label">Source status</span><select value={form.source_status} className="field-input" onChange={(event) => update('source_status', event.target.value)}><option value="pre_consumer">Pre-consumer</option><option value="post_consumer">Post-consumer</option><option value="unknown">Unknown</option></select></label>
                    <label><span className="field-label">Colour / mix</span><input value={form.colour} className="field-input" onChange={(event) => update('colour', event.target.value)} /></label>
                    <label><span className="field-label">Packaging / bale format</span><input value={form.packaging} className="field-input" onChange={(event) => update('packaging', event.target.value)} /></label>
                    <label className="sm:col-span-2"><span className="field-label">Storage condition</span><input value={form.storage_condition} className="field-input" onChange={(event) => update('storage_condition', event.target.value)} /></label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#d5e4da] bg-white px-3.5 py-3"><input type="checkbox" checked={form.sample_available} onChange={(event) => update('sample_available', event.target.checked)} className="h-4 w-4 accent-[#12645b]" /><span><span className="block text-sm font-semibold text-ink">Representative sample available</span><span className="block text-[11px] text-[#71867e]">A buyer may request inspection before commercial acceptance.</span></span></label>
                    <label><span className="field-label">Compliance triage</span><select value={form.compliance_triage} className="field-input" onChange={(event) => update('compliance_triage', event.target.value)}><option value="not_assessed">Not assessed</option><option value="needs_compliance_review">Needs compliance review</option><option value="regulated_or_hazardous_route">Regulated / hazardous route</option></select></label>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 border-t border-[#e4ece6] pt-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><QualityPill verified={false} grade={titleCase(form.quality_grade)} /><span className="text-xs text-[#748981]">No supporting certificate is attached in this demo.</span></div><button className="btn-primary" disabled={publishing} onClick={() => void publish()}>{publishing ? <Loader2 className="animate-spin" size={17} /> : <Check size={17} />}{publishing ? 'Publishing…' : 'Publish listing'}<ArrowRight size={16} /></button></div>
            </div>
            <aside className="space-y-5">
              <div className="card p-5"><div className="flex items-center gap-2"><Recycle className="text-spruce" size={18} /><h2 className="font-semibold text-ink">Potential industrial uses</h2></div><p className="mt-2 text-xs leading-5 text-[#70857e]">Catalog-backed pathways—not guaranteed suitability.</p><div className="mt-4 space-y-2">{potentialUses.length ? potentialUses.map((use) => <label key={use.id} className={`block cursor-pointer rounded-xl border p-3 transition ${form.selected_use_id === use.id ? 'border-spruce bg-[#f2fbf5]' : 'border-[#deebe3] hover:border-[#b5d3c2]'}`}><input type="radio" className="sr-only" checked={form.selected_use_id === use.id} onChange={() => update('selected_use_id', use.id)} /><div className="flex items-start gap-2"><span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${form.selected_use_id === use.id ? 'border-spruce bg-spruce text-white' : 'border-[#abc0b4]'}`}>{form.selected_use_id === use.id && <Check size={10} />}</span><div><p className="text-sm font-semibold text-ink">{use.title}</p><p className="mt-1 text-[11px] leading-4 text-[#71867e]">{use.description}</p><p className="mt-2 text-[10px] font-bold uppercase tracking-[0.09em] text-spruce">Potential use</p></div></div></label>) : <p className="rounded-xl bg-[#f4f6f4] p-3 text-xs text-[#73877f]">Select a controlled material to reveal plausible potential uses.</p>}</div></div>
              <div className="rounded-3xl border border-[#d8e7dc] bg-[#edf7f0] p-5"><div className="flex items-center gap-2 text-spruce"><MapPin size={17} /><p className="text-sm font-semibold">Demo location handling</p></div><p className="mt-2 text-xs leading-5 text-[#587268]">Cities use clearly labeled sample coordinates. CircularMatch does not require production GPS data for this MVP.</p></div>
            </aside>
          </div>
        </section>
      )}
    </div>
  )
}
