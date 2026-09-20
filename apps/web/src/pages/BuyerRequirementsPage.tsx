import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  ShieldCheck,
  CircleCheckBig,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Loader2,
  Compass,
  PackageSearch,
  Edit2,
  Factory,
  Target,
} from 'lucide-react'
import { get, post, del, put } from '../lib/api'
import { DELHI_NCR_CITIES, QUALITY_OPTIONS } from '../lib/constants'
import { formatCurrency, formatKg, titleCase } from '../lib/format'
import { useAsync } from '../hooks/useAsync'
import type { BuyerRequirement, MatchCard, Material, Role } from '../types'
import {
  EmptyPanel,
  ErrorPanel,
  PageSkeleton,
  QualityPill,
  ScoreRing,
  ConfirmDialog,
} from '../components/ui'
import { toast } from 'sonner'

export function BuyerRequirementsPage({ role: _role }: { role?: Role }) {
  const materials = useAsync(
    () => get<Material[]>('/api/reference/materials').then((response) => response.data),
    [],
  )
  const requirements = useAsync(
    () => get<BuyerRequirement[]>('/api/buyer-requirements?mine=true').then((response) => response.data),
    [],
  )
  const [selectedRequirementId, setSelectedRequirementId] = useState<string | null>(null)
  const matches = useAsync(
    () =>
      selectedRequirementId
        ? get<{ requirement: BuyerRequirement; matches: MatchCard[] }>(
            `/api/buyer-requirements/${selectedRequirementId}/matches`,
          ).then((response) => response.data)
        : Promise.resolve(null),
    [selectedRequirementId],
  )

  const [form, setForm] = useState({
    material_id: '',
    minimum_quantity_kg_week: '',
    maximum_quantity_kg_week: '',
    minimum_quality_grade: 'standard',
    maximum_distance_km: '200',
    target_price_per_kg: '',
    allow_partial_quantity: true,
    city: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!confirmDeleteId) return
    setDeleting(true)
    try {
      await del(`/api/buyer-requirements/${confirmDeleteId}`)
      if (selectedRequirementId === confirmDeleteId) setSelectedRequirementId(null)
      await requirements.reload()
      toast.success('Requirement archived')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to archive requirement')
    } finally {
      setDeleting(false)
      setConfirmDeleteId(null)
    }
  }

  const update = (key: keyof typeof form, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }))

  const handleEdit = (req: BuyerRequirement) => {
    setEditingId(req.id)
    setForm({
      material_id: req.material_id || '',
      minimum_quantity_kg_week: String(req.minimum_quantity_kg_week),
      maximum_quantity_kg_week: String(req.maximum_quantity_kg_week),
      minimum_quality_grade: req.minimum_quality_grade,
      maximum_distance_km: String(req.maximum_distance_km),
      target_price_per_kg: req.target_price_per_kg ? String(req.target_price_per_kg) : '',
      allow_partial_quantity: req.allow_partial_quantity,
      city: req.city,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submitRequirement = async () => {
    setError(null)
    if (!form.material_id) {
      setError('Please select a required material.')
      return
    }
    if (!form.city) {
      setError('Please select your buyer location.')
      return
    }
    if (!form.minimum_quantity_kg_week || !form.maximum_quantity_kg_week) {
      setError('Please specify both minimum and maximum quantity.')
      return
    }
    if (Number(form.minimum_quantity_kg_week) > Number(form.maximum_quantity_kg_week)) {
      setError('Minimum quantity cannot exceed maximum quantity.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        minimum_quantity_kg_week: Number(form.minimum_quantity_kg_week),
        maximum_quantity_kg_week: Number(form.maximum_quantity_kg_week),
        minimum_quality_grade: form.minimum_quality_grade,
        maximum_distance_km: Number(form.maximum_distance_km),
        target_price_per_kg: form.target_price_per_kg ? Number(form.target_price_per_kg) : null,
        allow_partial_quantity: form.allow_partial_quantity,
        city: form.city,
      }

      let reqId = editingId
      if (editingId) {
        await put(`/api/buyer-requirements/${editingId}`, payload)
        toast.success('Requirement updated')
      } else {
        const response = await post<{ requirement: BuyerRequirement }>('/api/buyer-requirements', {
          ...payload,
          material_id: form.material_id,
        })
        reqId = response.data.requirement.id
        toast.success('Requirement created')
      }

      await requirements.reload()
      if (reqId) setSelectedRequirementId(reqId)
      setEditingId(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save the buyer requirement.')
    } finally {
      setSaving(false)
    }
  }

  const handleSelectRequirement = (id: string) => {
    setSelectedRequirementId(id)
    setTimeout(() => {
      document.getElementById('supply-analysis')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  if (materials.loading || requirements.loading) return <PageSkeleton />
  if (materials.error || requirements.error || !materials.data || !requirements.data)
    return (
      <ErrorPanel
        error={materials.error || requirements.error || 'Buyer data unavailable.'}
        onRetry={() => {
          void materials.reload()
          void requirements.reload()
        }}
      />
    )

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-slate-900 antialiased">
      <BackgroundDecor />

      <div className="relative z-10 space-y-6">
        <Breadcrumb />
        <PageHeader />

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm font-medium text-rose-800 backdrop-blur">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* MAIN FORM & PUBLISHED LIST COLUMN */}
          <div className="space-y-5 lg:col-span-2">
            <NewRequirementForm
              form={form}
              materials={materials.data}
              update={update}
              saving={saving}
              editingId={editingId}
              onCancelEdit={() => {
                setEditingId(null)
                setForm({
                  material_id: '',
                  minimum_quantity_kg_week: '',
                  maximum_quantity_kg_week: '',
                  minimum_quality_grade: 'standard',
                  maximum_distance_km: '200',
                  target_price_per_kg: '',
                  allow_partial_quantity: true,
                  city: '',
                })
              }}
              onSubmit={submitRequirement}
            />

            <PublishedRequirements
              items={requirements.data}
              selectedRequirementId={selectedRequirementId}
              onSelect={handleSelectRequirement}
              onEdit={handleEdit}
              onDelete={(id) => setConfirmDeleteId(id)}
            />
          </div>

          {/* DECISION RULES SIDEBAR */}
          <div className="lg:col-span-1">
            <DecisionRules
              allowPartial={form.allow_partial_quantity}
              onTogglePartial={(val) => update('allow_partial_quantity', val)}
              onPublish={submitRequirement}
              saving={saving}
            />
          </div>
        </div>

        {/* SUPPLY ANALYSIS SECTION */}
        {selectedRequirementId && (
          <section
            id="supply-analysis"
            className="scroll-mt-6 space-y-4 rounded-3xl border border-emerald-100/80 bg-white/90 p-5 shadow-sm backdrop-blur sm:p-7"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50/60 px-2 py-0.5 text-[10.5px] font-bold tracking-[0.16em] text-emerald-700">
                  SUPPLY ANALYSIS
                </div>
                <h2 className="mt-1.5 text-[20px] font-bold tracking-tight text-slate-900">
                  Compatible waste listings
                </h2>
                <p className="mt-1 text-[13px] text-slate-500">
                  Ranked using the same decision rules; source quality flags remain visible.
                </p>
              </div>
              {matches.loading ? (
                <span className="text-[13px] text-slate-500">Analyzing…</span>
              ) : matches.data ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800">
                  {matches.data.matches.length} passed compatibility gates
                </span>
              ) : null}
            </div>

            {matches.loading ? (
              <PageSkeleton />
            ) : matches.error ? (
              <ErrorPanel error={matches.error} onRetry={() => void matches.reload()} />
            ) : matches.data?.matches.length ? (
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {matches.data.matches.map((match) => {
                  const listing = match.waste_listing
                  return (
                    <article
                      key={match.id}
                      className="lift-hover shine-wrap rounded-2xl border border-emerald-100/80 bg-white p-5 shadow-sm transition hover:border-emerald-200"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[16px] font-bold tracking-tight text-slate-900">
                            {listing?.company || 'Waste generator'}
                          </p>
                          <p className="mt-0.5 text-[12.5px] text-slate-500">
                            {listing?.city} · {listing?.material}
                          </p>
                        </div>
                        <ScoreRing score={match.total_score} size={64} />
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <QualityPill
                          verified={listing?.quality_verified || false}
                          grade={titleCase(listing?.quality_grade)}
                        />
                      </div>

                      <div className="mt-4 space-y-1.5 text-[12.5px] leading-relaxed text-slate-600">
                        <p>
                          <strong className="text-slate-800">Available:</strong>{' '}
                          {formatKg(listing?.normalized_kg_per_week || 0)}/week
                        </p>
                        <p>
                          <strong className="text-slate-800">Distance:</strong>{' '}
                          {match.distance_km.toFixed(1)} km
                        </p>
                        <p>
                          <strong className="text-slate-800">Potential use:</strong>{' '}
                          {match.potential_use}
                        </p>
                      </div>

                      <Link
                        className="group mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-2.5 text-[13px] font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:shadow-lg"
                        to={`/matches/${match.id}`}
                      >
                        <PackageSearch className="h-4 w-4" />
                        View explanation
                      </Link>
                    </article>
                  )
                })}
              </div>
            ) : (
              <EmptyPanel
                title="No compatible supply found"
                detail="Try extending the maximum distance, widening the quantity range, or choose another supported material."
              />
            )}
          </section>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="Archive Requirement"
        description="Are you sure you want to archive this requirement? Active matches will be disconnected."
        confirmLabel="Yes, archive"
        cancelLabel="Cancel"
        isDestructive={true}
        isLoading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}

/* ============================================================ */
/*  Background Decor                                            */
/* ============================================================ */
function BackgroundDecor() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50" />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(16,185,129,0.25) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -top-32 left-1/4 z-0 h-[480px] w-[480px] rounded-full bg-emerald-200/40 blur-3xl animate-blob"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 left-1/3 z-0 h-[380px] w-[380px] rounded-full bg-teal-200/40 blur-3xl animate-blob"
        style={{ animationDelay: '5s' }}
      />
    </>
  )
}

/* ============================================================ */
/*  Breadcrumb                                                  */
/* ============================================================ */
function Breadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] text-slate-500 animate-fade-in-up">
      <Link to="/dashboard" className="transition hover:text-emerald-700">Workspace</Link>
      <span className="text-slate-300">/</span>
      <span className="text-slate-500">Buy</span>
      <span className="text-slate-300">/</span>
      <span className="font-semibold text-slate-700">My Buy Targets</span>
    </nav>
  )
}

/* ============================================================ */
/*  Page Header                                                 */
/* ============================================================ */
function PageHeader() {
  return (
    <div className="animate-fade-in-up">
      <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50/60 px-3 py-1 text-[10.5px] font-bold tracking-[0.18em] text-emerald-700 backdrop-blur">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inset-0 animate-soft-ping rounded-full bg-emerald-400" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
        BUYER WORKFLOW
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[32px] font-extrabold leading-[1.1] tracking-tight text-slate-900">
            Define what your process can use
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-slate-500">
            Create a controlled material requirement, then compare compatible supply with transparent eligibility rules.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 text-[10.5px] font-bold tracking-[0.16em] text-amber-700 shadow-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-soft-ping rounded-full bg-amber-400" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-amber-500" />
          </span>
          ACTIVE REQUIREMENTS
        </span>
      </div>
    </div>
  )
}

/* ============================================================ */
/*  NEW REQUIREMENT FORM                                        */
/* ============================================================ */
function NewRequirementForm({
  form,
  materials,
  update,
  saving,
  editingId,
  onCancelEdit,
  onSubmit,
}: {
  form: {
    material_id: string
    minimum_quantity_kg_week: string
    maximum_quantity_kg_week: string
    minimum_quality_grade: string
    maximum_distance_km: string
    target_price_per_kg: string
    allow_partial_quantity: boolean
    city: string
  }
  materials: Material[]
  update: (key: any, value: any) => void
  saving: boolean
  editingId: string | null
  onCancelEdit: () => void
  onSubmit: () => Promise<void>
}) {
  return (
    <div
      className="lift-hover shine-wrap relative overflow-hidden rounded-3xl border border-emerald-100/60 bg-white shadow-sm animate-fade-in-up"
      style={{ animationDelay: '0.05s' }}
    >
      <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-300/30 blur-2xl" />

      <div className="relative p-6">
        {/* Card header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-[18px] font-bold tracking-tight text-slate-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                {editingId ? <Edit2 className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
              </span>
              {editingId ? 'Edit buyer requirement' : 'New buyer requirement'}
            </h2>
            <p className="mt-1 text-[13px] text-slate-500">
              One material per requirement keeps matching clear and explainable.
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200/60 bg-emerald-50/60 text-emerald-700">
            {editingId ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </div>
        </div>

        <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />

        {/* Form grid 2 cols */}
        <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          <Field label="Required material">
            <div className="relative">
              <select
                value={form.material_id}
                onChange={(e) => update('material_id', e.target.value)}
                disabled={!!editingId}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-[13.5px] font-semibold text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-100"
              >
                <option value="">Select a material…</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.canonical_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </Field>

          <Field label="Buyer location">
            <div className="relative">
              <select
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-[13.5px] font-semibold text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              >
                <option value="">Select city…</option>
                {DELHI_NCR_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </Field>

          <Field label="Minimum quantity" unit="kg/week">
            <input
              type="number"
              min="1"
              value={form.minimum_quantity_kg_week}
              onChange={(e) => update('minimum_quantity_kg_week', e.target.value)}
              placeholder="e.g. 2000"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[14px] font-semibold text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 placeholder:font-normal placeholder:text-slate-400"
            />
          </Field>

          <Field label="Maximum quantity" unit="kg/week">
            <input
              type="number"
              min="1"
              value={form.maximum_quantity_kg_week}
              onChange={(e) => update('maximum_quantity_kg_week', e.target.value)}
              placeholder="e.g. 5000"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[14px] font-semibold text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 placeholder:font-normal placeholder:text-slate-400"
            />
          </Field>

          <Field label="Minimum stated quality">
            <div className="relative">
              <select
                value={form.minimum_quality_grade}
                onChange={(e) => update('minimum_quality_grade', e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-[13.5px] font-semibold text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              >
                {QUALITY_OPTIONS.map((q) => (
                  <option key={q} value={q}>
                    {titleCase(q)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </Field>

          <Field label="Maximum distance" unit="km">
            <input
              type="number"
              min="1"
              value={form.maximum_distance_km}
              onChange={(e) => update('maximum_distance_km', e.target.value)}
              placeholder="e.g. 150"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[14px] font-semibold text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 placeholder:font-normal placeholder:text-slate-400"
            />
          </Field>

          <Field label="Target price" unit="₹/kg">
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.target_price_per_kg}
              onChange={(e) => update('target_price_per_kg', e.target.value)}
              placeholder="e.g. 17.5"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[14px] font-semibold text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 placeholder:font-normal placeholder:text-slate-400"
            />
          </Field>
        </div>

        {/* Allowance row */}
        <div className="mt-5 rounded-xl border border-emerald-100/60 bg-emerald-50/40 p-3">
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={form.allow_partial_quantity}
              onChange={(e) => update('allow_partial_quantity', e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 accent-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <div className="text-[13px] font-bold text-slate-900">Allow partial quantity</div>
              <div className="text-[11.5px] text-slate-600">Permit a supply volume outside range for review</div>
            </div>
          </label>
        </div>

        {/* Helper text & Submit row */}
        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>Distance uses Haversine calculations between regional coordinates.</span>
          </div>

          <div className="flex items-center gap-2">
            {editingId && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={() => void onSubmit()}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-700 to-teal-700 px-5 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-emerald-700/30 ring-1 ring-emerald-800/30 transition hover:-translate-y-0.5 hover:shadow-emerald-500/40 hover:shadow-xl disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
              )}
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Publish & find supply'}
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================ */
/*  PUBLISHED REQUIREMENTS LIST                                 */
/* ============================================================ */
function PublishedRequirements({
  items,
  selectedRequirementId,
  onSelect,
  onEdit,
  onDelete,
}: {
  items: BuyerRequirement[]
  selectedRequirementId: string | null
  onSelect: (id: string) => void
  onEdit: (item: BuyerRequirement) => void
  onDelete: (id: string) => void
}) {
  return (
    <div
      className="lift-hover shine-wrap relative overflow-hidden rounded-3xl border border-emerald-100/60 bg-white shadow-sm animate-fade-in-up"
      style={{ animationDelay: '0.15s' }}
    >
      <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-300/30 blur-2xl" />

      <div className="relative p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50/60 px-2 py-0.5 text-[10.5px] font-bold tracking-[0.16em] text-emerald-700">
              PUBLISHED REQUIREMENTS
            </div>
            <h2 className="mt-1.5 text-[18px] font-bold tracking-tight text-slate-900">
              Your active demand signals
            </h2>
          </div>
          <span className="text-[11px] text-slate-500">
            {items.length} requirement{items.length === 1 ? '' : 's'} in Platform Dataset
          </span>
        </div>

        {items.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/20 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-800">No active requirements yet</h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              Publish a controlled material requirement using the form above to analyze compatible supply and find matching sellers.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map((item, i) => (
              <PublishedRow
                key={item.id}
                item={item}
                delay={0.2 + i * 0.06}
                isSelected={selectedRequirementId === item.id}
                onSelect={() => onSelect(item.id)}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PublishedRow({
  item,
  delay,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: {
  item: BuyerRequirement
  delay: number
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const isActive = item.status !== 'archived' && item.status !== 'paused'
  return (
    <div
      className={`group rounded-2xl border bg-white p-4 transition hover:border-emerald-200 hover:shadow-sm animate-fade-in-up ${
        isSelected ? 'border-emerald-500 ring-2 ring-emerald-200/50' : 'border-slate-100'
      }`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[15px] font-bold text-slate-900 transition-colors group-hover:text-emerald-700">
            {item.material}
          </div>
          <div className="mt-0.5 text-[12px] text-slate-500">
            {item.company || 'Your Organisation'} · {item.city}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold ring-1 ring-inset ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 ring-emerald-200/60'
                : 'bg-amber-50 text-amber-700 ring-amber-200/60'
            }`}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span
                className={`absolute inset-0 animate-soft-ping rounded-full ${
                  isActive ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative h-1.5 w-1.5 rounded-full ${
                  isActive ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            {isActive ? 'Active' : 'Paused'}
          </span>
          <button
            type="button"
            onClick={onEdit}
            title="Edit requirement"
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Archive requirement"
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        <Spec2
          label="Quantity"
          value={`${formatKg(item.minimum_quantity_kg_week)}–${formatKg(item.maximum_quantity_kg_week)}`}
        />
        <Spec2 label="Radius" value={`${item.maximum_distance_km} km`} />
        <Spec2
          label="Target"
          value={item.target_price_per_kg ? `${formatCurrency(item.target_price_per_kg)}/kg` : 'Negotiable'}
        />
        <Spec2 label="Min. quality" value={titleCase(item.minimum_quality_grade)} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={onSelect}
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-[12.5px] font-semibold transition hover:-translate-y-0.5 ${
            isSelected
              ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
              : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-700'
          }`}
        >
          <Compass className="h-3.5 w-3.5" />
          {isSelected ? 'Viewing Suppliers' : 'Find Suppliers'}
        </button>
        <Link
          to={`/buyer-requirements/${item.id}/acceptance-spec`}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-3 py-2 text-[12.5px] font-semibold text-white shadow-md shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/35"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Acceptance rules
        </Link>
      </div>
    </div>
  )
}

function Spec2({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-0.5 text-[13px] font-semibold text-slate-800">{value}</div>
    </div>
  )
}

/* ============================================================ */
/*  DECISION RULES (right sidebar)                              */
/* ============================================================ */
function DecisionRules({
  allowPartial,
  onTogglePartial,
  onPublish,
  saving,
}: {
  allowPartial: boolean
  onTogglePartial: (val: boolean) => void
  onPublish: () => void
  saving: boolean
}) {
  const rules = [
    { n: 1, label: 'Material.', body: 'Exact controlled catalog compatibility is required in v1.' },
    { n: 2, label: 'Quality.', body: 'Supplier-declared grades remain visibly Not verified.' },
    { n: 3, label: 'Quantity.', body: 'A preferred weekly range creates a transparent fit score.' },
    { n: 4, label: 'Distance.', body: 'Requirements outside your maximum radius are excluded.' },
    { n: 5, label: 'Economics & Impact.', body: 'Illustrative inputs are separated from real procurement decisions.' },
  ]

  return (
    <div
      className="lift-hover shine-wrap relative overflow-hidden rounded-3xl border border-emerald-100/60 bg-white p-6 shadow-sm animate-fade-in-up"
      style={{ animationDelay: '0.1s' }}
    >
      <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-300/30 blur-2xl" />
      <div className="relative">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50/60 px-2 py-0.5 text-[10.5px] font-bold tracking-[0.16em] text-emerald-700">
          DECISION RULES
        </div>
        <h2 className="mt-2 text-[18px] font-bold tracking-tight text-slate-900">
          What the engine checks
        </h2>

        <ol className="mt-5 space-y-3.5">
          {rules.map((r) => (
            <li key={r.n} className="group flex items-start gap-3">
              <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-[11px] font-extrabold text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                {r.n}
              </div>
              <div className="leading-snug">
                <span className="text-[13px] font-bold text-slate-900">{r.label}</span>{' '}
                <span className="text-[12.5px] text-slate-600">{r.body}</span>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="rounded-xl border border-emerald-100/60 bg-emerald-50/40 p-3">
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={allowPartial}
                onChange={(e) => onTogglePartial(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 accent-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <div className="text-[13px] font-bold text-slate-900">Allow partial quantity</div>
                <div className="text-[11.5px] text-slate-600">Permit a supply volume outside range for review</div>
              </div>
            </label>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onPublish}
            className="group mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-700 to-teal-700 px-5 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-emerald-700/30 ring-1 ring-emerald-800/30 transition hover:-translate-y-0.5 hover:shadow-emerald-500/40 hover:shadow-xl disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
            )}
            {saving ? 'Publishing…' : 'Publish & find supply'}
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ============================================================ */
/*  Form Field                                                  */
/* ============================================================ */
function Field({
  label,
  children,
  unit,
}: {
  label: string
  children: React.ReactNode
  unit?: string
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline gap-1.5">
        <span className="text-[12.5px] font-semibold text-slate-700">{label}</span>
        {unit && <span className="text-[10.5px] font-medium text-slate-400">{unit}</span>}
      </div>
      {children}
    </div>
  )
}
