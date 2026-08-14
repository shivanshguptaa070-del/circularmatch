import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, CheckCircle2, ClipboardCheck, FileCheck2, FilePlus2, FlaskConical, Loader2, PackagePlus, ScanLine, ShieldAlert, Sparkles, UploadCloud } from 'lucide-react'
import { get, patch, post } from '../lib/api'
import { formatKg, titleCase } from '../lib/format'
import { useAsync } from '../hooks/useAsync'
import type { ListingPassport, Role } from '../types'
import { DemoBadge, Disclosure, EmptyPanel, ErrorPanel, LoadingPanel, PageHeader, QualityPill } from '../components/ui'

const readinessTone: Record<string, string> = {
  draft: 'border-[#d7e1db] bg-[#f5f8f6] text-[#5f756c]',
  missing_evidence: 'border-[#eed8a5] bg-[#fff8e8] text-[#866a25]',
  buyer_ready: 'border-[#c7e9d6] bg-[#eef9f2] text-[#1f7354]',
  sample_ready: 'border-[#c2e8d3] bg-[#eaf8ef] text-[#176449]',
  compliance_review_needed: 'border-[#f0c9bb] bg-[#fff4ef] text-[#aa543c]',
}

const evidenceTone: Record<string, string> = {
  self_declared: 'badge-warn',
  uploaded: 'badge-demo',
  reviewed: 'badge-safe',
  test_reviewed: 'badge-safe',
  rejected: 'badge-warn',
  expired: 'badge-warn',
}

export function MaterialPassportPage({ role }: { role: Role }) {
  const { listingId } = useParams<{ listingId: string }>()
  const passport = useAsync(() => get<ListingPassport>(`/api/listings/${listingId}/passport`).then((response) => response.data), [listingId])
  const [evidenceForm, setEvidenceForm] = useState({ evidence_type: 'certificate', title: '', issuer: '', summary: '', document_name: '' })
  const [lotForm, setLotForm] = useState({ lot_code: '', available_quantity_kg: '', material_form: 'Manufacturing trim', source_status: 'pre_consumer', colour: 'Clear', packaging: 'Baled sacks', storage_condition: 'Covered indoor storage', sample_available: true, compliance_triage: 'not_assessed' })
  const [savingEvidence, setSavingEvidence] = useState(false)
  const [reviewingEvidenceId, setReviewingEvidenceId] = useState<string | null>(null)
  const [savingLot, setSavingLot] = useState(false)
  const [showLotForm, setShowLotForm] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const addEvidence = async () => {
    const primaryLot = passport.data?.lots.find((lot) => lot.status === 'available') || passport.data?.lots[0]
    if (!primaryLot || !evidenceForm.title.trim()) {
      setError('Choose an available lot and add an evidence title first.')
      return
    }
    setSavingEvidence(true)
    setError(null)
    try {
      const response = await post<{ message: string }>(`/api/lots/${primaryLot.id}/evidence`, {
        evidence_type: evidenceForm.evidence_type,
        title: evidenceForm.title,
        issuer: evidenceForm.issuer || 'Supplier',
        status: 'uploaded',
        summary: evidenceForm.summary,
        document_name: evidenceForm.document_name || null,
      })
      setMessage(response.data.message)
      setEvidenceForm({ evidence_type: 'certificate', title: '', issuer: '', summary: '', document_name: '' })
      await passport.reload()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not add the evidence record.')
    } finally {
      setSavingEvidence(false)
    }
  }

  const reviewEvidence = async (evidenceId: string, status: 'reviewed' | 'test_reviewed') => {
    setReviewingEvidenceId(evidenceId)
    setError(null)
    try {
      const response = await patch<{ message: string }>(`/api/admin/evidence/${evidenceId}/review`, {
        status,
        review_note: `Demo admin marked this evidence as ${status.replace('_', ' ')}.`,
      })
      setMessage(response.data.message)
      await passport.reload()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update the evidence review state.')
    } finally {
      setReviewingEvidenceId(null)
    }
  }

  const addLot = async () => {
    if (!listingId || !lotForm.lot_code.trim() || !Number(lotForm.available_quantity_kg)) {
      setError('Add a lot code and available quantity before creating a lot.')
      return
    }
    setSavingLot(true)
    setError(null)
    try {
      const response = await post<{ message: string }>(`/api/listings/${listingId}/lots`, {
        ...lotForm,
        available_quantity_kg: Number(lotForm.available_quantity_kg),
      })
      setMessage(response.data.message)
      setShowLotForm(false)
      setLotForm({ ...lotForm, lot_code: '', available_quantity_kg: '' })
      await passport.reload()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not add the material lot.')
    } finally {
      setSavingLot(false)
    }
  }

  if (passport.loading) return <LoadingPanel label="Loading the Material Passport…" />
  if (passport.error || !passport.data) return <ErrorPanel error={passport.error || 'Material Passport unavailable.'} onRetry={() => void passport.reload()} />
  const data = passport.data
  const primaryLot = data.lots.find((lot) => lot.status === 'available') || data.lots[0]
  const canEdit = role === 'generator' || role === 'admin'

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Trusted pilot core · Material Passport"
        title={`${data.listing.material} — buyer-readiness record`}
        description="A structured lot and evidence record that separates supplier claims, uploaded documents, review status, and deterministic calculations. It is not a laboratory certificate or legal classification."
        actions={<Link className="btn-primary" to={`/listings/${data.listing.id}/matches`}><Sparkles size={16} />Run eligibility checks<ArrowRight size={16} /></Link>}
      />
      <Disclosure>{data.notice}</Disclosure>
      {message && <div className="flex gap-3 rounded-2xl border border-[#b9ddc7] bg-[#eff9f2] p-4 text-sm text-[#28624e]"><CheckCircle2 className="mt-0.5 shrink-0" size={18} /><span>{message}</span></div>}
      {error && <div className="rounded-2xl border border-[#f1c6b9] bg-[#fff7f4] p-4 text-sm text-[#994f3a]">{error}</div>}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
        <article className="card overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-4 bg-gradient-to-r from-[#eaf7ef] to-[#fbfdfb] p-5 sm:p-6">
            <div><p className="eyebrow">Material stream</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.045em] text-ink">{data.listing.company}</h2><p className="mt-1 text-sm text-[#667c73]">{formatKg(data.listing.normalized_kg_per_week)}/week · {data.listing.city} · {data.listing.availability}</p></div>
            <QualityPill verified={data.listing.quality_verified} grade={titleCase(data.listing.quality_grade)} />
          </div>
          <div className="grid gap-px border-t border-[#dfeae2] bg-[#dfeae2] sm:grid-cols-3">
            <div className="bg-white p-5"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#7c9289]">Primary lot</p><p className="mt-2 text-lg font-semibold text-ink">{primaryLot?.lot_code || 'Not created'}</p><p className="mt-1 text-xs text-[#6f857d]">{primaryLot?.material_form || 'Create a dispatchable lot'}</p></div>
            <div className="bg-white p-5"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#7c9289]">Source status</p><p className="mt-2 text-lg font-semibold text-ink">{primaryLot ? titleCase(primaryLot.source_status) : 'Unknown'}</p><p className="mt-1 text-xs text-[#6f857d]">Supplier-declared</p></div>
            <div className="bg-white p-5"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#7c9289]">Sample status</p><p className="mt-2 text-lg font-semibold text-ink">{primaryLot?.sample_available ? 'Available' : 'Not stated'}</p><p className="mt-1 text-xs text-[#6f857d]">Subject to buyer request</p></div>
          </div>
        </article>
        <aside className={`rounded-3xl border p-5 shadow-soft ${readinessTone[data.readiness.status]}`}>
          <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] opacity-75">Material readiness</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.05em]">{data.readiness.score}%</h2></div><ScanLine size={25} /></div>
          <p className="mt-2 text-sm font-semibold">{titleCase(data.readiness.status)}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/55"><div className="h-full rounded-full bg-current" style={{ width: `${data.readiness.score}%` }} /></div>
          {data.readiness.missing.length > 0 ? <ul className="mt-5 space-y-2 text-xs leading-5">{data.readiness.missing.map((item) => <li key={item} className="flex gap-2"><ShieldAlert className="mt-0.5 shrink-0" size={14} />{item}</li>)}</ul> : <p className="mt-5 text-xs leading-5">A structured lot and supporting evidence are present. Buyer-specific acceptance and a sample may still be required.</p>}
        </aside>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <article className="card p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><ClipboardCheck className="text-spruce" size={19} /><h2 className="text-xl font-semibold tracking-[-.04em] text-ink">Lots and declared specification</h2></div><p className="mt-2 text-sm leading-6 text-[#687e75]">A recurring listing can contain several dispatchable lots. Matching uses the currently available lot.</p></div>{canEdit && <button className="btn-secondary !py-2.5" onClick={() => setShowLotForm((value) => !value)}><PackagePlus size={16} />{showLotForm ? 'Close lot form' : 'Add material lot'}</button>}</div>
          {showLotForm && <div className="mt-6 rounded-2xl border border-[#d9e8df] bg-[#f7fbf8] p-4"><div className="grid gap-4 sm:grid-cols-2"><label><span className="field-label">Lot code</span><input className="field-input" value={lotForm.lot_code} onChange={(event) => setLotForm({ ...lotForm, lot_code: event.target.value })} placeholder="e.g. PET-NOI-W34" /></label><label><span className="field-label">Available quantity (kg)</span><input type="number" className="field-input" value={lotForm.available_quantity_kg} onChange={(event) => setLotForm({ ...lotForm, available_quantity_kg: event.target.value })} /></label><label><span className="field-label">Material form</span><input className="field-input" value={lotForm.material_form} onChange={(event) => setLotForm({ ...lotForm, material_form: event.target.value })} /></label><label><span className="field-label">Colour</span><input className="field-input" value={lotForm.colour} onChange={(event) => setLotForm({ ...lotForm, colour: event.target.value })} /></label><label><span className="field-label">Packaging</span><input className="field-input" value={lotForm.packaging} onChange={(event) => setLotForm({ ...lotForm, packaging: event.target.value })} /></label><label><span className="field-label">Source status</span><select className="field-input" value={lotForm.source_status} onChange={(event) => setLotForm({ ...lotForm, source_status: event.target.value as typeof lotForm.source_status })}><option value="pre_consumer">Pre-consumer</option><option value="post_consumer">Post-consumer</option><option value="unknown">Unknown</option></select></label><label className="sm:col-span-2"><span className="field-label">Storage condition</span><input className="field-input" value={lotForm.storage_condition} onChange={(event) => setLotForm({ ...lotForm, storage_condition: event.target.value })} /></label></div><div className="mt-4 flex justify-end"><button className="btn-primary" disabled={savingLot} onClick={() => void addLot()}>{savingLot ? <Loader2 className="animate-spin" size={16} /> : <PackagePlus size={16} />}{savingLot ? 'Creating…' : 'Create lot'}</button></div></div>}
          <div className="mt-6 space-y-4">{data.lots.length ? data.lots.map((lot) => <article key={lot.id} className="rounded-2xl border border-[#dfeae2] bg-[#fbfdfb] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-ink">{lot.lot_code}</p><p className="mt-1 text-xs text-[#6c8178]">{formatKg(lot.available_quantity_kg)} · {lot.material_form} · {titleCase(lot.source_status)}</p></div><span className="badge-safe">{titleCase(lot.status)}</span></div><div className="mt-4 grid gap-3 text-xs sm:grid-cols-3"><div><span className="block text-[#81958d]">Colour</span><strong className="mt-1 block text-ink">{lot.colour}</strong></div><div><span className="block text-[#81958d]">Packaging</span><strong className="mt-1 block text-ink">{lot.packaging}</strong></div><div><span className="block text-[#81958d]">Compliance triage</span><strong className="mt-1 block leading-5 text-ink">{lot.triage_label}</strong></div></div><p className="mt-4 rounded-xl bg-white p-3 text-xs leading-5 text-[#637970]">{String(lot.declared_spec.supplier_statement || 'No supplier statement added.')}</p></article>) : <EmptyPanel title="No dispatchable lots" detail="Create a lot to make this recurring material stream buyer-ready." />}</div>
        </article>
        <aside className="card p-5 sm:p-6"><div className="flex items-center gap-2"><UploadCloud className="text-spruce" size={19} /><div><p className="eyebrow">Evidence record</p><h2 className="mt-1 text-lg font-semibold tracking-[-.03em] text-ink">Add supporting context</h2></div></div><p className="mt-3 text-xs leading-5 text-[#6e837a]">Demo Mode stores a structured evidence record, not a private uploaded file. A production version will store documents in role-controlled private storage.</p>{canEdit && <div className="mt-5 space-y-3"><select className="field-input" value={evidenceForm.evidence_type} onChange={(event) => setEvidenceForm({ ...evidenceForm, evidence_type: event.target.value })}><option value="certificate">Certificate / declaration</option><option value="test_report">Test report</option><option value="photo">Photo record</option><option value="invoice">Invoice / source record</option><option value="other">Other evidence</option></select><input className="field-input" placeholder="Evidence title" value={evidenceForm.title} onChange={(event) => setEvidenceForm({ ...evidenceForm, title: event.target.value })} /><input className="field-input" placeholder="Issuer / source" value={evidenceForm.issuer} onChange={(event) => setEvidenceForm({ ...evidenceForm, issuer: event.target.value })} /><textarea className="field-input resize-y" rows={3} placeholder="What does this evidence support?" value={evidenceForm.summary} onChange={(event) => setEvidenceForm({ ...evidenceForm, summary: event.target.value })} /><input className="field-input" placeholder="Demo document name (optional)" value={evidenceForm.document_name} onChange={(event) => setEvidenceForm({ ...evidenceForm, document_name: event.target.value })} /><button className="btn-primary w-full" disabled={savingEvidence} onClick={() => void addEvidence()}>{savingEvidence ? <Loader2 className="animate-spin" size={16} /> : <FilePlus2 size={16} />}{savingEvidence ? 'Saving…' : 'Add evidence record'}</button></div>}</aside>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <article className="card p-5 sm:p-7"><div className="flex items-center gap-2"><FileCheck2 className="text-spruce" size={19} /><div><p className="eyebrow">Evidence chain</p><h2 className="mt-1 text-xl font-semibold tracking-[-.04em] text-ink">What supports this lot?</h2></div></div><div className="mt-6 space-y-3">{primaryLot?.evidence.length ? primaryLot.evidence.map((evidence) => <div key={evidence.id} className="flex gap-3 rounded-2xl border border-[#dfe9e2] bg-[#fbfdfb] p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e9f6ee] text-spruce"><FlaskConical size={16} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-ink">{evidence.title}</p><span className={evidenceTone[evidence.status]}>{evidence.status_label}</span></div><p className="mt-1 text-xs text-[#6c8178]">{evidence.issuer} · {titleCase(evidence.evidence_type)}</p><p className="mt-2 text-xs leading-5 text-[#5f766d]">{evidence.summary}</p>{evidence.document_name && <p className="mt-2 text-[11px] font-medium text-[#668177]">Demo file reference: {evidence.document_name}</p>}{role === 'admin' && !['reviewed', 'test_reviewed', 'rejected', 'expired'].includes(evidence.status) && <div className="mt-3 flex flex-wrap gap-2"><button className="btn-secondary !px-3 !py-2 text-xs" disabled={reviewingEvidenceId === evidence.id} onClick={() => void reviewEvidence(evidence.id, 'reviewed')}>{reviewingEvidenceId === evidence.id ? <Loader2 className="animate-spin" size={13} /> : <CheckCircle2 size={13} />}Mark reviewed</button><button className="btn-secondary !px-3 !py-2 text-xs" disabled={reviewingEvidenceId === evidence.id} onClick={() => void reviewEvidence(evidence.id, 'test_reviewed')}>Mark test-reviewed</button></div>}</div></div>) : <EmptyPanel title="No evidence record" detail="Add a supplier declaration, photo record, test report, or other supporting evidence." />}</div></article>
        <aside className="card p-5 sm:p-7"><p className="eyebrow">Audit activity</p><h2 className="mt-2 text-xl font-semibold tracking-[-.04em] text-ink">Traceable changes</h2><div className="mt-6 space-y-4">{data.audit_events.length ? data.audit_events.map((event) => <div key={event.id} className="border-l-2 border-[#b8ddc7] pl-4"><p className="text-sm font-semibold text-ink">{titleCase(event.action)}</p><p className="mt-1 text-xs leading-5 text-[#647b72]">{event.summary}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#8aa097]">Demo record</p></div>) : <p className="text-sm leading-6 text-[#6b8179]">New listing, evidence, review, and match events will appear here.</p>}</div></aside>
      </section>
    </div>
  )
}
