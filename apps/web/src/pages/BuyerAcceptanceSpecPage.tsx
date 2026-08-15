import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, CheckCircle2, ClipboardList, FileCheck2, Loader2, ShieldCheck, SlidersHorizontal, TestTube2 } from 'lucide-react'
import { get, patch } from '../lib/api'
import { formatKg, titleCase } from '../lib/format'
import { useAsync } from '../hooks/useAsync'
import type { BuyerAcceptanceSpec, BuyerRequirement, Role } from '../types'
import { StatusBadge, Disclosure, ErrorPanel, LoadingPanel, PageHeader } from '../components/ui'

interface SpecResponse {
  requirement: BuyerRequirement
  acceptance_spec: BuyerAcceptanceSpec
}

const evidenceOptions = ['self_declared', 'uploaded', 'reviewed', 'test_reviewed'] as const

export function BuyerAcceptanceSpecPage({ role }: { role: Role }) {
  const { requirementId } = useParams<{ requirementId: string }>()
  const data = useAsync(() => get<SpecResponse>(`/api/buyer-requirements/${requirementId}/acceptance-spec`).then((response) => response.data), [requirementId])
  const [form, setForm] = useState({ accepted_forms: '', accepted_colours: '', prohibited_materials: '', required_evidence_status: 'self_declared', requires_sample: false, available_capacity_kg_week: '', route_note: '', review_note: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!data.data) return
    const spec = data.data.acceptance_spec
    setForm({
      accepted_forms: spec.accepted_forms.join(', '),
      accepted_colours: spec.accepted_colours.join(', '),
      prohibited_materials: spec.prohibited_materials.join(', '),
      required_evidence_status: spec.required_evidence_status,
      requires_sample: spec.requires_sample,
      available_capacity_kg_week: spec.available_capacity_kg_week ? String(spec.available_capacity_kg_week) : '',
      route_note: spec.route_note,
      review_note: spec.review_note,
    })
  }, [data.data])

  const splitList = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean)
  const save = async () => {
    if (!requirementId) return
    setSaving(true)
    setError(null)
    try {
      const response = await patch<{ acceptance_spec: BuyerAcceptanceSpec; message: string }>(`/api/buyer-requirements/${requirementId}/acceptance-spec`, {
        accepted_forms: splitList(form.accepted_forms),
        accepted_colours: splitList(form.accepted_colours),
        prohibited_materials: splitList(form.prohibited_materials),
        required_evidence_status: form.required_evidence_status,
        requires_sample: form.requires_sample,
        available_capacity_kg_week: form.available_capacity_kg_week ? Number(form.available_capacity_kg_week) : null,
        route_note: form.route_note,
        review_note: form.review_note,
      })
      setMessage(response.data.message)
      await data.reload()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update this acceptance template.')
    } finally {
      setSaving(false)
    }
  }

  if (data.loading) return <LoadingPanel label="Loading buyer acceptance template…" />
  if (data.error || !data.data) return <ErrorPanel error={data.error || 'Buyer acceptance template unavailable.'} onRetry={() => void data.reload()} />
  const { requirement, acceptance_spec: spec } = data.data

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Trusted pilot core · Buyer template"
        title={`Acceptance criteria for ${requirement.material}`}
        description="Turn a vague quality preference into explicit material, evidence, sample, and capacity rules. These are buyer-configurable screening criteria—not a universal standard or legal approval."
        actions={<Link className="btn-primary" to="/buyer-requirements"><ClipboardList size={16} />Buyer requirements<ArrowRight size={16} /></Link>}
      />
      <Disclosure>{spec.notice}</Disclosure>
      {message && <div className="flex gap-3 rounded-2xl border border-[#b9ddc7] bg-[#eff9f2] p-4 text-sm text-[#28624e]"><CheckCircle2 className="mt-0.5 shrink-0" size={18} /><span>{message}</span></div>}
      {error && <div className="rounded-2xl border border-[#f1c6b9] bg-[#fff7f4] p-4 text-sm text-[#994f3a]">{error}</div>}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="card p-5 sm:p-7"><div className="flex items-start justify-between gap-4 border-b border-[#e4ece6] pb-5"><div><div className="flex items-center gap-2"><SlidersHorizontal className="text-spruce" size={19} /><h2 className="text-xl font-semibold tracking-[-.04em] text-ink">Acceptance profile</h2></div><p className="mt-2 text-sm leading-6 text-[#687e75]">Matching evaluates these explicit rules before it recommends a commercial action.</p></div><StatusBadge>buyer controlled</StatusBadge></div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label><span className="field-label">Accepted forms <span className="font-normal text-[#82968e]">comma separated</span></span><input className="field-input" value={form.accepted_forms} onChange={(event) => setForm({ ...form, accepted_forms: event.target.value })} placeholder="Manufacturing trim, Regrind" /></label>
            <label><span className="field-label">Accepted colours <span className="font-normal text-[#82968e]">optional</span></span><input className="field-input" value={form.accepted_colours} onChange={(event) => setForm({ ...form, accepted_colours: event.target.value })} placeholder="Clear, Transparent light blue" /></label>
            <label className="sm:col-span-2"><span className="field-label">Prohibited material / condition <span className="font-normal text-[#82968e]">comma separated</span></span><input className="field-input" value={form.prohibited_materials} onChange={(event) => setForm({ ...form, prohibited_materials: event.target.value })} placeholder="PVC, PETG, Free-flowing liquids" /></label>
            <label><span className="field-label">Minimum evidence level</span><select className="field-input" value={form.required_evidence_status} onChange={(event) => setForm({ ...form, required_evidence_status: event.target.value })}>{evidenceOptions.map((option) => <option key={option} value={option}>{titleCase(option)}</option>)}</select></label>
            <label><span className="field-label">Published intake capacity <span className="font-normal text-[#82968e]">kg/week</span></span><input type="number" className="field-input" value={form.available_capacity_kg_week} onChange={(event) => setForm({ ...form, available_capacity_kg_week: event.target.value })} placeholder={String(requirement.maximum_quantity_kg_week)} /></label>
            <label className="sm:col-span-2 flex cursor-pointer items-center gap-3 rounded-xl border border-[#d5e4da] bg-[#f8fbf9] px-4 py-3.5"><input type="checkbox" checked={form.requires_sample} onChange={(event) => setForm({ ...form, requires_sample: event.target.checked })} className="h-4 w-4 accent-[#12645b]" /><span><span className="block text-sm font-semibold text-ink">Require sample or inspection</span><span className="block text-[11px] text-[#71867e]">A match will show “Needs sample” instead of implying commercial acceptance.</span></span></label>
            <label className="sm:col-span-2"><span className="field-label">Permitted downstream-route note</span><textarea rows={3} className="field-input resize-y" value={form.route_note} onChange={(event) => setForm({ ...form, route_note: event.target.value })} /></label>
            <label className="sm:col-span-2"><span className="field-label">Internal review note</span><textarea rows={2} className="field-input resize-y" value={form.review_note} onChange={(event) => setForm({ ...form, review_note: event.target.value })} /></label>
          </div>
          <div className="mt-6 flex flex-col gap-3 border-t border-[#e4ece6] pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-[#6e837a]">Template updated: {new Date(spec.updated_at).toLocaleDateString('en-IN')} · Platform template version</p><button className="btn-primary" disabled={saving} onClick={() => void save()}>{saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}{saving ? 'Saving…' : 'Save acceptance template'}</button></div>
        </article>
        <aside className="space-y-5"><article className="card p-5"><div className="flex items-center gap-2"><ShieldCheck className="text-spruce" size={18} /><h2 className="font-semibold text-ink">How gates work</h2></div><div className="mt-4 space-y-3 text-xs leading-5 text-[#647a71]"><p><strong className="text-ink">Blocked:</strong> material form, stated quality, colour, or distance conflicts with a rule.</p><p><strong className="text-ink">Missing evidence:</strong> the lot does not meet your selected evidence threshold.</p><p><strong className="text-ink">Needs sample:</strong> screening fit is present, but inspection/sample is required before commercial acceptance.</p><p><strong className="text-ink">Eligible:</strong> no current screening gate blocks an RFQ; it still is not a contract.</p></div></article><article className="card p-5"><div className="flex items-center gap-2"><TestTube2 className="text-[#a47a25]" size={18} /><h2 className="font-semibold text-ink">Current demand signal</h2></div><div className="mt-4 rounded-2xl bg-[#f6f9f6] p-4 text-sm"><p className="font-semibold text-ink">{formatKg(requirement.minimum_quantity_kg_week)}–{formatKg(requirement.maximum_quantity_kg_week)}/week</p><p className="mt-2 text-xs text-[#6d837a]">{requirement.city} · {requirement.maximum_distance_km} km screening radius · minimum stated quality: {titleCase(requirement.minimum_quality_grade)}</p></div></article><Link className="btn-secondary w-full" to={`/buyer-requirements/${requirement.id}/matches`}><FileCheck2 size={16} />View compatible supply<ArrowRight size={15} /></Link></aside>
      </section>
    </div>
  )
}
