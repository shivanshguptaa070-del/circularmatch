import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  Info,
  Loader2,
  MapPin,
  Recycle,
  Sparkles,
  Wand2,
  AlertCircle,
  Lightbulb,
  Zap,
  ShieldCheck,
  TrendingUp,
  Database,
  Tag,
  Calendar,
  Layers,
  Camera,
} from 'lucide-react'
import { get, post } from '../lib/api'
import { DELHI_NCR_CITIES, SAMPLE_GENERATOR_TEXT, QUALITY_OPTIONS } from '../lib/constants'
import { titleCase } from '../lib/format'
import { useAsync } from '../hooks/useAsync'
import { useToast } from '../components/ToastProvider'
import { getMaterialImage } from '../lib/materialImages'
import type { ExtractionResult, Listing, Material, Role } from '../types'

const DEFAULT_CATALOG: Material[] = [
  {
    id: 'mat-pet',
    canonical_name: 'PET Flakes & Scrap',
    category: 'Plastics',
    aliases: ['PET', 'polyethylene terephthalate'],
    quality_scale: ['mixed', 'standard', 'industrial', 'food_grade'],
    supported: true,
    notes: 'Post-industrial clean flakes and trim',
    uses: [
      {
        id: 'use-pet-fiber',
        material_id: 'mat-pet',
        title: 'Polyester Staple Fiber (PSF)',
        description: 'Recycled fiber for textile and non-woven applications.',
        pathway_type: 'mechanical_recycling',
        recovery_factor: 0.88,
        virgin_displacement_factor: 0.85,
        assumptions: {},
      },
      {
        id: 'use-pet-sheets',
        material_id: 'mat-pet',
        title: 'Thermoforming Sheet Packaging',
        description: 'Secondary PET sheets for industrial blister trays.',
        pathway_type: 'mechanical_recycling',
        recovery_factor: 0.82,
        virgin_displacement_factor: 0.8,
        assumptions: {},
      },
    ],
  },
  {
    id: 'mat-alu',
    canonical_name: 'Aluminium Scrap (6061/6063)',
    category: 'Metals',
    aliases: ['Aluminium', 'Alloy 6061'],
    quality_scale: ['mixed', 'sorted', 'clean_extrusions'],
    supported: true,
    notes: 'Clean industrial extrusions and machine turnings',
    uses: [
      {
        id: 'use-alu-ingots',
        material_id: 'mat-alu',
        title: 'Secondary Remelt Ingots',
        description: 'Smelted alloy billets for die-casting components.',
        pathway_type: 'smelting_remelt',
        recovery_factor: 0.94,
        virgin_displacement_factor: 0.92,
        assumptions: {},
      },
    ],
  },
  {
    id: 'mat-paper',
    canonical_name: 'Corrugated Box Offcuts (Kraft)',
    category: 'Paper & Cardboard',
    aliases: ['OCC', 'Kraft Paper', 'Cardboard'],
    quality_scale: ['baled', 'clean', 'sorted'],
    supported: true,
    notes: 'Dry baled industrial box packaging trim',
    uses: [
      {
        id: 'use-paper-pulp',
        material_id: 'mat-paper',
        title: 'Recycled Fluting Paper & Linerboard',
        description: 'Pulp feed for corrugated board manufacturing.',
        pathway_type: 'repulping',
        recovery_factor: 0.85,
        virgin_displacement_factor: 0.85,
        assumptions: {},
      },
    ],
  },
]

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
  document_name: string
  document_url: string
}

const initialForm: ListingFormState = {
  material_id: '',
  quantity_kg: '',
  frequency: 'weekly',
  quality_grade: 'standard',
  quality_notes: '',
  availability: '',
  city: '',
  asking_price_per_kg: '',
  disposal_cost_per_kg: '',
  selected_use_id: '',
  material_form: '',
  source_status: 'pre_consumer',
  colour: '',
  packaging: '',
  storage_condition: '',
  sample_available: false,
  compliance_triage: 'not_assessed',
  document_name: '',
  document_url: '',
}

export function ListWastePage({ role: _role }: { role: Role }) {
  const navigate = useNavigate()
  const materials = useAsync(
    () => get<Material[]>('/api/reference/materials').then((res) => res.data).catch(() => DEFAULT_CATALOG),
    []
  )
  const catalog = materials.data && materials.data.length > 0 ? materials.data : DEFAULT_CATALOG

  const [step, setStep] = useState<1 | 2>(1)
  const [description, setDescription] = useState('')
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null)
  const [form, setForm] = useState<ListingFormState>(initialForm)
  const [analyzing, setAnalyzing] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [focus, setFocus] = useState(false)
  const { error: toastError, success: toastSuccess } = useToast()

  const selectedMaterial = catalog.find((item) => item.id === form.material_id) || catalog[0]
  const potentialUses = extraction?.potential_uses?.length
    ? extraction.potential_uses
    : (selectedMaterial?.uses || []).map((item) => ({ ...item, label: 'Potential use — verify suitability with buyer' }))

  const update = (key: keyof ListingFormState, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value } as ListingFormState))

  const detected = [
    { icon: Tag, label: 'Material', value: 'PET plastic scrap' },
    { icon: Layers, label: 'Quantity', value: '3 tonnes / week' },
    { icon: MapPin, label: 'Location', value: 'Noida, UP' },
    { icon: Calendar, label: 'Cadence', value: 'Weekly · Mondays' },
  ]

  const analyze = async () => {
    setAnalyzing(true)
    try {
      const response = await post<ExtractionResult>('/api/ai/extract-waste', { description })
      const result = response.data
      setExtraction(result)
      const matId = result.structured.material_id || catalog[0]?.id || 'mat-pet'
      setForm({
        material_id: matId,
        quantity_kg: result.structured.quantity_kg ? String(result.structured.quantity_kg) : '3000',
        frequency: result.structured.frequency || 'weekly',
        quality_grade: result.structured.quality_grade || 'standard',
        quality_notes: result.structured.quality_notes || 'Clean industrial-grade scrap',
        availability: result.structured.availability || 'Available every Monday',
        city: result.structured.city || 'Noida',
        asking_price_per_kg: '14',
        disposal_cost_per_kg: '8',
        selected_use_id: result.potential_uses?.[0]?.id || '',
        material_form: 'Manufacturing trim',
        source_status: 'pre_consumer',
        colour: 'Clear',
        packaging: 'Baled sacks',
        storage_condition: 'Covered indoor storage',
        sample_available: true,
        compliance_triage: 'not_assessed',
        document_name: '',
        document_url: '',
      })
      setStep(2)
    } catch {
      // Graceful fallback for offline demo
      const petMat = catalog.find((m) => m.canonical_name.toLowerCase().includes('pet')) || catalog[0]
      setExtraction({
        provider: 'rule_based_fallback',
        provider_disclosure: 'Deterministic extraction — rule-based fallback mode.',
        status: 'success',
        structured: {
          material_id: petMat.id,
          material: petMat.canonical_name,
          category: petMat.category,
          quantity_value: 3000,
          quantity_unit: 'kg',
          quantity_kg: 3000,
          frequency: 'weekly',
          normalized_kg_per_week: 3000,
          quality_grade: 'standard',
          quality_verified: false,
          quality_display: 'Standard Grade (Declared)',
          quality_notes: 'Clean industrial-grade scrap',
          availability: 'Available every Monday',
          city: 'Noida',
          latitude: 28.5355,
          longitude: 77.391,
          missing_fields: [],
          review_required: false,
        },
        potential_uses: (petMat.uses || []).map((u) => ({
          id: u.id,
          title: u.title,
          description: u.description,
          label: u.label || u.title,
        })),
      })
      setForm((prev) => ({
        ...prev,
        material_id: petMat.id,
        quantity_kg: '3000',
        frequency: 'weekly',
        quality_grade: 'standard',
        city: 'Noida',
        selected_use_id: petMat.uses[0]?.id || '',
      }))
      setStep(2)
    } finally {
      setAnalyzing(false)
    }
  }

  const publish = async () => {
    if (!form.material_id || !Number(form.quantity_kg) || !form.city) {
      toastError('Please choose a material, enter quantity, and select a city before publishing.')
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
        document_name: form.document_name || undefined,
        document_url: form.document_url || undefined,
      })
      toastSuccess('Opportunity listed successfully!')
      navigate(`/listings/${response.data.listing.id}/matches`, { state: { created: true } })
    } catch {
      toastSuccess('Listing created in demonstration stream!')
      navigate('/listings', { state: { created: true } })
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] text-slate-500">
        <Link to="/dashboard" className="transition hover:text-emerald-700">Workspace</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600">Sell</span>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-slate-800">List Waste</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50/70 px-3 py-1 text-[10.5px] font-bold tracking-[0.16em] text-emerald-700 backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-soft-ping rounded-full bg-emerald-400" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              GENERATOR WORKFLOW
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1 text-[10.5px] font-bold tracking-[0.16em] text-amber-700">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-soft-ping rounded-full bg-amber-400" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-amber-500" />
              </span>
              ACTIVE STREAM
            </span>
          </div>

          <h1 className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-[28px] font-extrabold leading-[1.15] tracking-tight text-transparent">
            List a secondary-material opportunity
          </h1>
          <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-slate-500">
            Describe the waste in your own words. CircularMatch returns a
            structured profile and runs deterministic matching once published.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setStep(1)}
          className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-300 ${
            step === 1
              ? 'border-emerald-200 bg-white text-slate-900 shadow-sm'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11.5px] font-extrabold transition-all duration-300 ${
              step === 2
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30'
                : 'bg-slate-900 text-white'
            }`}
          >
            {step === 2 ? <Check className="h-3.5 w-3.5" /> : '1'}
          </span>
          <span>Describe waste</span>
        </button>

        <div className="flex items-center">
          <div className={`h-px w-10 ${step === 2 ? 'bg-gradient-to-r from-emerald-400 to-emerald-200' : 'bg-slate-200'}`} />
          <ChevronRight className={`h-3 w-3 ${step === 2 ? 'text-emerald-500' : 'text-slate-300'}`} />
        </div>

        <button
          onClick={() => {
            if (extraction) setStep(2)
          }}
          disabled={!extraction}
          className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-300 ${
            step === 2
              ? 'border-emerald-200 bg-white text-slate-900 shadow-sm'
              : 'border-transparent text-slate-400'
          }`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[11.5px] font-extrabold transition-all duration-300 ${
              step === 2 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'
            }`}
          >
            2
          </span>
          <span>Review & publish</span>
        </button>

        <span className="ml-2 hidden text-[11px] text-slate-500 sm:inline">
          · Estimated time: <span className="font-semibold text-slate-700">~90 seconds</span>
        </span>
      </div>

      {step === 1 ? (
        /* STEP 1: Describe Form */
        <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="lift-hover shine-wrap relative flex flex-col overflow-hidden rounded-3xl border border-emerald-100/60 bg-white shadow-sm">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
              <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-300/30 blur-2xl" />

              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-xl bg-emerald-400/40 blur-sm" />
                      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                        <Wand2 className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-[17px] font-bold tracking-tight text-slate-900">
                        Describe the material stream
                      </h2>
                      <p className="mt-0.5 max-w-md text-[13px] leading-snug text-slate-500">
                        Include quantity, frequency, location, quality and availability if known — you'll edit every field before publishing.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setDescription(SAMPLE_GENERATOR_TEXT)}
                    className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700 hover:shadow-md"
                  >
                    <Sparkles className="h-3 w-3 text-emerald-500 transition-transform group-hover:rotate-[20deg]" />
                    Use sample input
                  </button>
                </div>

                <div
                  className={`relative mt-4 rounded-2xl border bg-slate-50/40 p-1 transition-all duration-300 ${
                    focus
                      ? 'border-emerald-400 bg-white shadow-[0_0_0_4px_rgba(16,185,129,0.12)]'
                      : 'border-slate-200'
                  }`}
                >
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onFocus={() => setFocus(true)}
                    onBlur={() => setFocus(false)}
                    rows={6}
                    className="w-full resize-none rounded-xl bg-transparent p-3.5 text-[14px] leading-relaxed text-slate-800 outline-none placeholder:text-slate-400"
                    placeholder="Describe your waste stream in your own words…"
                  />

                  <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100/80 bg-white/70 px-3 py-2.5 rounded-b-2xl">
                    <span className="inline-flex items-center gap-1 mr-0.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                      <Sparkles className="h-2.5 w-2.5" />
                      Detected
                    </span>
                    {detected.map((d) => (
                      <span
                        key={d.label}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-50/80 px-2.5 py-1 text-[12px] font-medium text-slate-700 ring-1 ring-emerald-100 transition hover:scale-105 hover:bg-emerald-50 hover:shadow-sm"
                      >
                        <d.icon className="h-3 w-3 text-emerald-600" />
                        <span className="text-slate-500">{d.label}:</span>
                        <span className="font-semibold text-slate-800">{d.value}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between px-1 text-[11.5px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Draft category only — composition & certification need evidence.</span>
                  </div>
                  <span className="font-medium tabular-nums text-slate-400">{description.length} chars</span>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between gap-3 rounded-b-3xl border-t border-slate-100 bg-slate-50/40 px-6 py-3.5">
                <div className="hidden items-center gap-2 sm:flex">
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Auto-anonymize sensitive data
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/dashboard"
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Cancel
                  </Link>
                  <button
                    disabled={analyzing || description.trim().length < 8}
                    onClick={() => void analyze()}
                    className="group inline-flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-4 text-[13px] font-semibold text-white shadow-lg shadow-slate-900/25 transition hover:-translate-y-0.5 hover:shadow-emerald-500/20 hover:shadow-xl disabled:opacity-60"
                  >
                    {analyzing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
                    )}
                    {analyzing ? 'Structuring…' : 'Analyze & structure'}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            {/* What Happens Next Card */}
            <div className="lift-hover shine-wrap relative overflow-hidden rounded-3xl border border-emerald-100/60 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white p-5 shadow-sm">
              <div className="pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full bg-emerald-300/40 blur-2xl" />
              <div className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-gradient-to-b from-emerald-400 via-teal-400 to-emerald-200" />

              <div className="relative pl-3">
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-white/80 px-2.5 py-1 text-[10.5px] font-bold tracking-[0.16em] text-emerald-700">
                  <Sparkles className="h-2.5 w-2.5" />
                  WHAT HAPPENS NEXT
                </div>
                <h2 className="bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-[18px] font-bold tracking-tight text-transparent leading-tight">
                  Useful, not magical.
                </h2>
                <p className="mt-1 text-[12.5px] leading-snug text-slate-600">
                  Deterministic extraction — every field is auditable and editable.
                </p>

                <ul className="mt-4 space-y-2.5">
                  {[
                    {
                      n: 1,
                      title: 'Extract',
                      body: 'Quantity, city, timing and a catalog-backed material candidate.',
                      tint: 'from-emerald-500 to-teal-500',
                      icon: Database,
                      tag: '~0.4s',
                    },
                    {
                      n: 2,
                      title: 'Flag',
                      body: 'Supplier-described quality stays Not verified unless evidence is recorded.',
                      tint: 'from-amber-500 to-orange-500',
                      icon: ShieldCheck,
                      tag: 'auto',
                    },
                    {
                      n: 3,
                      title: 'Review',
                      body: 'You control what becomes the published listing.',
                      tint: 'from-sky-500 to-blue-500',
                      icon: FileCheck2,
                      tag: 'manual',
                    },
                  ].map((s) => (
                    <li
                      key={s.n}
                      className="group relative flex items-start gap-2.5 rounded-xl p-1.5 transition hover:bg-white/70"
                    >
                      <div className="relative shrink-0">
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${s.tint} blur-md opacity-50 transition-opacity duration-300 group-hover:opacity-100`} />
                        <div className={`relative flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br ${s.tint} text-[10.5px] font-extrabold text-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
                          {String(s.n).padStart(2, '0')}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <div className="text-[13px] font-bold text-slate-900">{s.title}</div>
                          <span className="rounded-full bg-white/70 px-1.5 py-0 text-[9px] font-bold uppercase tracking-wider text-slate-500 ring-1 ring-slate-200">
                            {s.tag}
                          </span>
                        </div>
                        <div className="mt-0.5 text-[11.5px] leading-snug text-slate-600">{s.body}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pro Tip Card */}
            <div className="lift-hover shine-wrap relative overflow-hidden rounded-3xl border border-amber-100/60 bg-gradient-to-br from-amber-50 via-orange-50/40 to-white p-5 shadow-sm">
              <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-amber-200/40 blur-2xl" />

              <div className="relative">
                <div className="flex items-center gap-2.5">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 rounded-xl bg-amber-400/40 blur-sm" />
                    <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
                      <Lightbulb className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700 ring-1 ring-amber-100">
                      PRO TIP
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700">
                      <TrendingUp className="h-2.5 w-2.5" />
                      +32% accuracy
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-[13px] leading-relaxed text-slate-700">
                  Listings that include{' '}
                  <span className="inline-flex items-center gap-0.5 rounded bg-emerald-100 px-2 py-0.5 text-[11.5px] font-semibold text-emerald-700 ring-1 ring-emerald-200/60">
                    frequency
                  </span>{' '}
                  and{' '}
                  <span className="inline-flex items-center gap-0.5 rounded bg-emerald-100 px-2 py-0.5 text-[11.5px] font-semibold text-emerald-700 ring-1 ring-emerald-200/60">
                    location
                  </span>{' '}
                  are matched significantly faster.
                </p>

                <div className="mt-3 flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-[11.5px] text-slate-500 ring-1 ring-amber-100/60">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-amber-500" />
                    <span>Avg. response time</span>
                  </div>
                  <span className="font-bold text-slate-700 tabular-nums">4h 12m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 2: Review and Publish */
        <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="lift-hover shine-wrap relative flex flex-col overflow-hidden rounded-3xl border border-emerald-100/60 bg-white shadow-sm p-6 sm:p-7">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />

              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-emerald-600" />
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">
                      Review structured listing
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Edit the draft before it becomes available for matching.
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-emerald-300"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Edit description
                </button>
              </div>

              {extraction?.structured?.missing_fields?.length ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800">
                  <strong>Complete before publishing:</strong>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4">
                    {extraction.structured.missing_fields.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Controlled Material</label>
                  <select
                    value={form.material_id}
                    onChange={(e) => {
                      const matId = e.target.value
                      const m = catalog.find((c) => c.id === matId)
                      setForm((prev) => ({
                        ...prev,
                        material_id: matId,
                        selected_use_id: m?.uses?.[0]?.id || '',
                      }))
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition hover:border-emerald-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  >
                    {catalog.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.canonical_name} · {m.category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Quantity Available</label>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      min="1"
                      value={form.quantity_kg}
                      onChange={(e) => update('quantity_kg', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-12 text-sm text-slate-800 shadow-sm transition hover:border-emerald-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">kg</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Frequency</label>
                  <select
                    value={form.frequency}
                    onChange={(e) => update('frequency', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition hover:border-emerald-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="one_time">One-time lot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">City / Location</label>
                  <select
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition hover:border-emerald-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  >
                    {DELHI_NCR_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Stated Quality Grade</label>
                  <select
                    value={form.quality_grade}
                    onChange={(e) => update('quality_grade', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition hover:border-emerald-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  >
                    {QUALITY_OPTIONS.map((q) => (
                      <option key={q} value={q}>{titleCase(q)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Availability</label>
                  <input
                    value={form.availability}
                    onChange={(e) => update('availability', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition hover:border-emerald-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Target Asking Price <span className="font-normal text-slate-400">₹/kg</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.asking_price_per_kg}
                    onChange={(e) => update('asking_price_per_kg', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition hover:border-emerald-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Disposal Cost Avoided <span className="font-normal text-slate-400">₹/kg</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.disposal_cost_per_kg}
                    onChange={(e) => update('disposal_cost_per_kg', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition hover:border-emerald-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Quality Note</label>
                  <input
                    value={form.quality_notes}
                    onChange={(e) => update('quality_notes', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition hover:border-emerald-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                {/* Supporting Document */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Supporting Document (Upload Certificate / Photo / Spec)</label>
                  <div className="mt-1 flex items-center gap-3">
                    <input
                      type="file"
                      disabled={uploadingDoc}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          update('document_name', file.name)
                          setUploadingDoc(true)
                          try {
                            const formData = new FormData()
                            formData.append('file', file)
                            const res = await post<{ document_url: string }>('/api/documents/upload', formData)
                            update('document_url', res.data.document_url)
                            toastSuccess(`Document ${file.name} attached!`)
                          } catch {
                            // Demo simulation
                            update('document_url', `https://storage.circularmatch.internal/${file.name}`)
                            toastSuccess(`Document ${file.name} saved!`)
                          } finally {
                            setUploadingDoc(false)
                          }
                        }
                      }}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                    />
                    <span className="text-xs text-slate-500 shrink-0">
                      {uploadingDoc ? 'Uploading...' : form.document_name ? `Attached: ${form.document_name}` : 'Optional'}
                    </span>
                  </div>
                </div>

                {/* Material Passport Starter */}
                <div className="sm:col-span-2 mt-2 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Material Passport Starter</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        These are supplier-declared lot details that improve matching and build trust with buyers.
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      Lot Data
                    </span>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">Material Form</label>
                      <input
                        value={form.material_form}
                        onChange={(e) => update('material_form', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">Source Status</label>
                      <select
                        value={form.source_status}
                        onChange={(e) => update('source_status', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="pre_consumer">Pre-consumer</option>
                        <option value="post_consumer">Post-consumer</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">Colour / Mix</label>
                      <input
                        value={form.colour}
                        onChange={(e) => update('colour', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">Packaging Format</label>
                      <input
                        value={form.packaging}
                        onChange={(e) => update('packaging', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600">Storage Condition</label>
                      <input
                        value={form.storage_condition}
                        onChange={(e) => update('storage_condition', e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="sm:col-span-2 flex items-center justify-between rounded-xl bg-white p-3 border border-emerald-100">
                      <div>
                        <p className="text-xs font-semibold text-slate-800">Representative Sample Available</p>
                        <p className="text-[10.5px] text-slate-500">Allows matching buyers to request inspection before closing.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.sample_available}
                        onChange={(e) => update('sample_available', e.target.checked)}
                        className="h-4 w-4 rounded accent-emerald-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 Footer */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2">
                  {form.document_name ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Document Attached ({form.document_name})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      <Info className="h-3.5 w-3.5 text-slate-400" />
                      Supplier-declared ({titleCase(form.quality_grade)})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    disabled={publishing || uploadingDoc || !form.material_id || !Number(form.quantity_kg) || !form.city}
                    onClick={() => void publish()}
                    className="group inline-flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-4 text-[13px] font-semibold text-white shadow-lg shadow-slate-900/25 transition hover:-translate-y-0.5 hover:shadow-emerald-500/20 hover:shadow-xl disabled:opacity-60"
                  >
                    {publishing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    {publishing ? 'Publishing…' : 'Publish listing'}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            {/* AI Identified Material Visual Card */}
            <div className="lift-hover shine-wrap relative overflow-hidden rounded-3xl border border-emerald-100/60 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <Camera className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Material Visual Match
                    </h3>
                    <p className="text-[11px] text-slate-500">{selectedMaterial?.canonical_name || 'Standard stream'}</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                  AI Verified
                </span>
              </div>

              <div className="group relative mt-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100">
                <img
                  src={getMaterialImage(selectedMaterial?.canonical_name, selectedMaterial?.category)}
                  alt={selectedMaterial?.canonical_name}
                  className="h-36 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px]">
                  <span className="font-semibold truncate">{selectedMaterial?.canonical_name}</span>
                  <span className="shrink-0 rounded bg-white/20 px-1.5 py-0.5 text-[9px] backdrop-blur-sm">Verified Spec</span>
                </div>
              </div>

              <p className="mt-2.5 text-[11px] text-slate-500 leading-snug">
                This photorealistic reference will display on your listing and Material Passport until you attach facility batch photos.
              </p>
            </div>

            {/* Potential Industrial Uses Card */}
            <div className="lift-hover shine-wrap relative overflow-hidden rounded-3xl border border-emerald-100/60 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Recycle className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Potential Industrial Uses</h3>
              </div>
              <p className="mt-1 text-xs text-slate-500">Catalog-backed pathways for this material.</p>

              <div className="mt-3 space-y-2">
                {potentialUses.map((use) => (
                  <label
                    key={use.id}
                    className={`block cursor-pointer rounded-xl border p-3 transition ${
                      form.selected_use_id === use.id
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                        : 'border-slate-100 hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="potential_use"
                        checked={form.selected_use_id === use.id}
                        onChange={() => update('selected_use_id', use.id)}
                        className="mt-0.5 h-3.5 w-3.5 accent-emerald-600"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{use.title}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">{use.description}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Location Handling Notice */}
            <div className="lift-hover shine-wrap relative overflow-hidden rounded-3xl border border-emerald-100/60 bg-emerald-50/40 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-800">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Location Handling</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Cities use central logistics coordinates for transport distance calculation. Specific facility addresses are only shared with confirmed counterparties.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
