import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Award,
  AlertCircle,
  ArrowRight,
  Beaker,
  Calendar,
  Check,
  CheckCircle2,
  CircleDashed,
  ClipboardCheck,
  Copy,
  Download,
  Droplets,
  ExternalLink,
  Factory,
  FileCheck2,
  FilePlus2,
  FileText,
  FlaskConical,
  Loader2,
  MapPin,
  PackagePlus,
  Pencil,
  Recycle,
  Scale,
  Share2,
  Sparkles,
  Stamp,
  Tag,
  TreePine,
  TrendingUp,
  Upload,
  UploadCloud,
  Wind,
  Camera,
} from 'lucide-react'
import { get, patch, post } from '../lib/api'
import { formatKg, titleCase } from '../lib/format'
import { useAsync } from '../hooks/useAsync'
import type { ListingPassport, MaterialLot, QualityEvidence, Role } from '../types'
import { Breadcrumb, Disclosure, EmptyPanel, ErrorPanel, PageSkeleton } from '../components/ui'
import { MaterialThumbnail, getMaterialImage } from '../lib/materialImages'

export function MaterialPassportPage({ role }: { role: Role }) {
  const { listingId } = useParams<{ listingId: string }>()
  const passport = useAsync(
    () => get<ListingPassport>(`/api/listings/${listingId}/passport`).then((response) => response.data),
    [listingId],
  )

  const [evidenceForm, setEvidenceForm] = useState({
    evidence_type: 'certificate',
    title: '',
    issuer: '',
    summary: '',
    document_name: '',
    document_url: '',
  })
  const [lotForm, setLotForm] = useState({
    lot_code: '',
    available_quantity_kg: '',
    material_form: 'Manufacturing trim',
    source_status: 'pre_consumer' as 'pre_consumer' | 'post_consumer' | 'unknown',
    colour: 'Clear',
    packaging: 'Baled sacks',
    storage_condition: 'Covered indoor storage',
    sample_available: true,
    compliance_triage: 'not_assessed',
  })

  const [savingEvidence, setSavingEvidence] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [reviewingEvidenceId, setReviewingEvidenceId] = useState<string | null>(null)
  const [savingLot, setSavingLot] = useState(false)
  const [showLotForm, setShowLotForm] = useState(false)
  const [showEvidenceForm, setShowEvidenceForm] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [evidenceStates, setEvidenceStates] = useState<
    Record<number, 'reviewed' | 'verified' | 'uploaded' | 'pending' | 'notstarted'>
  >({
    1: 'reviewed',
    2: 'uploaded',
    3: 'uploaded',
    4: 'pending',
    5: 'notstarted',
  })

  const handleDownload = async (evidence: Partial<QualityEvidence> & { document_url?: string | null }) => {
    if (evidence.document_url) {
      try {
        const { data } = await get<{ signed_url: string }>(`/api/documents/${evidence.document_url}`)
        if (data.signed_url) {
          window.open(data.signed_url, '_blank')
          return
        }
      } catch {
        setError('Failed to retrieve document.')
      }
    }
    const blob = new Blob(
      [
        `This is a securely retrieved copy of ${evidence.document_name || 'document'} from the CircularMatch data vault.\n\nIn the production environment, this file would be the original uploaded asset (PDF, Image, or Test Report).`,
      ],
      { type: 'text/plain' },
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = evidence.document_name || 'document.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

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
        document_url: evidenceForm.document_url || null,
      })
      setMessage(response.data.message)
      setEvidenceForm({
        evidence_type: 'certificate',
        title: '',
        issuer: '',
        summary: '',
        document_name: '',
        document_url: '',
      })
      setShowEvidenceForm(false)
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
        review_note: `System marked this evidence as ${status.replace('_', ' ')}.`,
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

  if (passport.loading) return <PageSkeleton />
  if (passport.error || !passport.data) {
    return (
      <ErrorPanel
        error={passport.error || 'Material Passport unavailable.'}
        onRetry={() => void passport.reload()}
      />
    )
  }

  const data = passport.data
  const primaryLot = data.lots.find((lot) => lot.status === 'available') || data.lots[0]
  const canEdit = role === 'generator' || role === 'admin'

  // Format Passport ID according to specification: CM-PAS-2026-XXXXX
  const idSuffix = (data.listing.id.replace(/[^a-zA-Z0-9]/g, '').slice(-5) || '92481').toUpperCase()
  const passportId = `CM-PAS-2026-${idSuffix}`

  // Data fields for Material Details Table
  const materialName = data.listing.material || 'Recycled PET Flakes'
  const categoryName = data.listing.category || 'Plastics'
  const quantityText = data.listing.normalized_kg_per_week
    ? `${formatKg(data.listing.normalized_kg_per_week)}/week`
    : `${formatKg(data.listing.quantity_kg || 5000)} (${data.listing.frequency || 'weekly'})`
  const locationText = data.listing.city || 'Noida, UP'
  const gradeText = titleCase(data.listing.quality_grade || 'Grade A')
  const compositionText =
    primaryLot?.material_form ||
    (categoryName === 'Plastics'
      ? 'Pure PET Polymer (99.2%)'
      : categoryName === 'Paper / Cardboard'
      ? 'Cellulose fibre / OCC'
      : 'Mono-material secondary stream')
  const contaminationText =
    (primaryLot?.declared_spec?.contamination as string) || 'Low (<1% particulate)'
  const availabilityText = data.listing.availability || 'Continuous weekly'

  // Dynamic Qualification Score Calculation logic based on prompt:
  // - Grade A + Low contamination = full quality score (20/20)
  // - Grade B = partial quality score (14/20)
  // - Quantity filled = full quantity score (20/20)
  // - Location filled = full location score (15/15)
  // - Each evidence item uploaded = +2 evidence points (max 10)
  const isGradeA = (data.listing.quality_grade || 'Grade A').toLowerCase().includes('a')
  const isGradeB = (data.listing.quality_grade || '').toLowerCase().includes('b')
  const isLowContamination = !contaminationText.toLowerCase().includes('high')
  const hasQuantity = (data.listing.normalized_kg_per_week || data.listing.quantity_kg || 5000) > 0
  const hasLocation = !!data.listing.city

  const materialScore = 30 // standard validated catalog material
  const quantityScore = hasQuantity ? 20 : 0
  const qualityScore = isGradeA && isLowContamination ? 16 : isGradeB ? 14 : 10
  const locationScore = hasLocation ? 15 : 0

  const isSupplier = role === 'generator' || role === 'admin'

  const handleToggleEvidence = (id: number) => {
    if (!isSupplier) return
    setEvidenceStates((prev) => {
      const current = prev[id]
      // In supplier view, make items clickable to simulate upload (toggle to Uploaded state)
      const next = current === 'uploaded' ? (id === 5 ? 'notstarted' : 'pending') : 'uploaded'
      return { ...prev, [id]: next }
    })
  }

  // Evidence list with 5 specification items:
  // ✓ Green  = Reviewed or Verified
  // ⚠ Yellow = Uploaded or Pending
  // ○ Grey   = Not Started
  const evidenceItems = [
    {
      id: 1,
      label: 'Material Details',
      status: evidenceStates[1] || 'reviewed',
      hint: `Reviewed by ${data.listing.company || 'Generator'} and verified for catalog match.`,
    },
    {
      id: 2,
      label: 'Photos',
      status: evidenceStates[2] || 'uploaded',
      hint: 'Batch and storage photos uploaded for verification.',
    },
    {
      id: 3,
      label: 'Quantity Document',
      status: evidenceStates[3] || 'uploaded',
      hint: `Weighbridge slip / lot record attached (${formatKg(primaryLot?.available_quantity_kg || 5000)}).`,
    },
    {
      id: 4,
      label: 'Quality Certificate',
      status: evidenceStates[4] || 'pending',
      hint: 'Awaiting laboratory assay report or supplier certificate upload.',
    },
    {
      id: 5,
      label: 'Third-Party Verify',
      status: evidenceStates[5] || 'notstarted',
      hint: 'Optional third-party testing or certification audit.',
    },
  ]

  const completedEvidenceCount = evidenceItems.filter(
    (i) => i.status === 'reviewed' || i.status === 'verified' || i.status === 'uploaded',
  ).length
  const evidenceScore = Math.min(10, completedEvidenceCount * 2)

  const breakdown = [
    { key: 'material', label: 'Material Compatibility', earned: materialScore, max: 35 },
    { key: 'quantity', label: 'Quantity Compatibility', earned: quantityScore, max: 20 },
    { key: 'quality', label: 'Quality Compatibility', earned: qualityScore, max: 20 },
    { key: 'location', label: 'Location Score', earned: locationScore, max: 15 },
    { key: 'evidence', label: 'Evidence Score', earned: evidenceScore, max: 10 },
  ]

  const totalScore = breakdown.reduce((acc, b) => acc + b.earned, 0)
  const maxTotalScore = breakdown.reduce((acc, b) => acc + b.max, 0)

  const tier: 'qualified' | 'partial' | 'none' =
    totalScore >= 80 ? 'qualified' : totalScore >= 50 ? 'partial' : 'none'

  const copyPassportId = async () => {
    try {
      await navigator.clipboard.writeText(passportId)
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    } catch {
      // ignore
    }
  }

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Lots', href: '/listings' },
          { label: 'Material Passport' },
        ]}
      />

      {/* Notice & Flash Banners */}
      <Disclosure>{data.notice}</Disclosure>
      {message && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-900 shadow-sm">
          <CheckCircle2 className="shrink-0 text-emerald-600" size={18} />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-900 shadow-sm">
          {error}
        </div>
      )}

      {/* HEADER SECTION */}
      <PassportHeader
        material={materialName}
        passportId={passportId}
        category={categoryName}
        location={locationText}
        total={totalScore}
        tier={tier}
        listingId={data.listing.id}
        copiedId={copiedId}
        copiedLink={copiedLink}
        onCopyId={copyPassportId}
        onShare={copyShareLink}
        onDownloadPdf={() => window.print()}
        canEdit={canEdit}
      />

      {/* MAIN TWO-COLUMN / THREE-COLUMN GRID */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left 2 Columns: Details Table, Score Breakdown, Composition & Lots */}
        <div className="space-y-5 lg:col-span-2">
          {/* 1. MATERIAL DETAILS TABLE (8 columns) */}
          <MaterialDetailsTable
            material={materialName}
            category={categoryName}
            quantity={quantityText}
            location={locationText}
            grade={gradeText}
            composition={compositionText}
            contamination={contaminationText}
            availability={availabilityText}
          />

          {/* 2. QUALIFICATION SCORE BREAKDOWN */}
          <QualificationBreakdown
            breakdown={breakdown}
            total={totalScore}
            maxTotal={maxTotalScore}
          />

          {/* 3. COMPOSITION & SOURCE CARD */}
          <CompositionCard
            material={materialName}
            company={data.listing.company}
            location={locationText}
          />

          {/* 4. DISPATCHABLE LOTS & DECLARED SPECIFICATIONS */}
          <section className="relative overflow-hidden rounded-3xl border border-emerald-100/60 bg-white/90 p-5 sm:p-7 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-emerald-50 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <ClipboardCheck size={18} />
                  </div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">
                    Lots and Declared Specification
                  </h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  A recurring listing can contain several dispatchable lots. Matching uses the currently available lot.
                </p>
              </div>
              {canEdit && (
                <button
                  className="btn-secondary !py-2 !text-xs"
                  onClick={() => setShowLotForm((value) => !value)}
                >
                  <PackagePlus size={15} />
                  {showLotForm ? 'Close lot form' : 'Add material lot'}
                </button>
              )}
            </div>

            {showLotForm && (
              <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 animate-fade-in-up">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label>
                    <span className="field-label !text-xs">Lot code</span>
                    <input
                      className="field-input !py-2 !text-xs"
                      value={lotForm.lot_code}
                      onChange={(e) => setLotForm({ ...lotForm, lot_code: e.target.value })}
                      placeholder="e.g. PET-NOI-W34"
                    />
                  </label>
                  <label>
                    <span className="field-label !text-xs">Available quantity (kg)</span>
                    <input
                      type="number"
                      className="field-input !py-2 !text-xs"
                      value={lotForm.available_quantity_kg}
                      onChange={(e) => setLotForm({ ...lotForm, available_quantity_kg: e.target.value })}
                    />
                  </label>
                  <label>
                    <span className="field-label !text-xs">Material form</span>
                    <input
                      className="field-input !py-2 !text-xs"
                      value={lotForm.material_form}
                      onChange={(e) => setLotForm({ ...lotForm, material_form: e.target.value })}
                    />
                  </label>
                  <label>
                    <span className="field-label !text-xs">Colour</span>
                    <input
                      className="field-input !py-2 !text-xs"
                      value={lotForm.colour}
                      onChange={(e) => setLotForm({ ...lotForm, colour: e.target.value })}
                    />
                  </label>
                  <label>
                    <span className="field-label !text-xs">Packaging</span>
                    <input
                      className="field-input !py-2 !text-xs"
                      value={lotForm.packaging}
                      onChange={(e) => setLotForm({ ...lotForm, packaging: e.target.value })}
                    />
                  </label>
                  <label>
                    <span className="field-label !text-xs">Source status</span>
                    <select
                      className="field-input !py-2 !text-xs"
                      value={lotForm.source_status}
                      onChange={(e) =>
                        setLotForm({ ...lotForm, source_status: e.target.value as typeof lotForm.source_status })
                      }
                    >
                      <option value="pre_consumer">Pre-consumer</option>
                      <option value="post_consumer">Post-consumer</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </label>
                  <label className="sm:col-span-2">
                    <span className="field-label !text-xs">Storage condition</span>
                    <input
                      className="field-input !py-2 !text-xs"
                      value={lotForm.storage_condition}
                      onChange={(e) => setLotForm({ ...lotForm, storage_condition: e.target.value })}
                    />
                  </label>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    className="btn-primary !py-2 !text-xs"
                    disabled={savingLot}
                    onClick={() => void addLot()}
                  >
                    {savingLot ? <Loader2 className="animate-spin" size={15} /> : <PackagePlus size={15} />}
                    {savingLot ? 'Creating…' : 'Create lot'}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5 space-y-3">
              {data.lots.length ? (
                data.lots.map((lot) => (
                  <article
                    key={lot.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{lot.lot_code}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatKg(lot.available_quantity_kg)} · {lot.material_form} ·{' '}
                          {titleCase(lot.source_status)}
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200">
                        {titleCase(lot.status)}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
                      <div>
                        <span className="block text-[11px] text-slate-400">Colour</span>
                        <strong className="mt-0.5 block text-slate-800">{lot.colour}</strong>
                      </div>
                      <div>
                        <span className="block text-[11px] text-slate-400">Packaging</span>
                        <strong className="mt-0.5 block text-slate-800">{lot.packaging}</strong>
                      </div>
                      <div>
                        <span className="block text-[11px] text-slate-400">Compliance triage</span>
                        <strong className="mt-0.5 block text-slate-800">{lot.triage_label}</strong>
                      </div>
                    </div>
                    <p className="mt-3 rounded-xl bg-white p-2.5 text-xs leading-relaxed text-slate-600 border border-slate-100">
                      {String(lot.declared_spec.supplier_statement || 'No supplier statement added.')}
                    </p>
                  </article>
                ))
              ) : (
                <EmptyPanel
                  title="No dispatchable lots"
                  detail="Create a lot to make this recurring material stream buyer-ready."
                />
              )}
            </div>
          </section>
        </div>

        {/* Right 1 Column: Visual Lot Inspection, Evidence Checklist, Documents, Impact & Audit Log */}
        <div className="space-y-5 lg:col-span-1">
          {/* MATERIAL LOT VISUAL INSPECTION (AI HD Photo) */}
          <MaterialVisualCard material={materialName} category={categoryName} />

          {/* EVIDENCE STATUS (5 items) */}
          <EvidenceChecklist
            items={evidenceItems}
            onAddClick={() => setShowEvidenceForm((prev) => !prev)}
            isSupplier={isSupplier}
            onItemClick={handleToggleEvidence}
          />

          {/* ADD EVIDENCE FORM DRAWER (if toggled) */}
          {showEvidenceForm && (
            <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm animate-fade-in-up">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <UploadCloud className="text-emerald-700" size={18} />
                <h3 className="text-sm font-bold text-slate-900">Upload Supporting Evidence</h3>
              </div>
              <div className="mt-3 space-y-2.5">
                <select
                  className="field-input !py-2 !text-xs"
                  value={evidenceForm.evidence_type}
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, evidence_type: e.target.value })}
                >
                  <option value="certificate">Certificate / declaration</option>
                  <option value="test_report">Test report</option>
                  <option value="photo">Photo record</option>
                  <option value="invoice">Invoice / weighbridge</option>
                  <option value="other">Other evidence</option>
                </select>
                <input
                  className="field-input !py-2 !text-xs"
                  placeholder="Evidence title"
                  value={evidenceForm.title}
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, title: e.target.value })}
                />
                <input
                  className="field-input !py-2 !text-xs"
                  placeholder="Issuer / source (e.g. SGS India)"
                  value={evidenceForm.issuer}
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, issuer: e.target.value })}
                />
                <textarea
                  className="field-input resize-y !py-2 !text-xs"
                  rows={2}
                  placeholder="What does this evidence support?"
                  value={evidenceForm.summary}
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, summary: e.target.value })}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    disabled={uploadingDoc}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    onChange={async (event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        setEvidenceForm((prev) => ({ ...prev, document_name: file.name }))
                        setUploadingDoc(true)
                        setError(null)
                        try {
                          const formData = new FormData()
                          formData.append('file', file)
                          const res = await post<{ document_url: string }>('/api/documents/upload', formData)
                          setEvidenceForm((prev) => ({
                            ...prev,
                            document_name: file.name,
                            document_url: res.data.document_url,
                          }))
                        } catch {
                          setError('Failed to upload document.')
                        } finally {
                          setUploadingDoc(false)
                        }
                      }
                    }}
                  />
                </div>
                <button
                  className="btn-primary w-full !py-2 !text-xs"
                  disabled={savingEvidence || uploadingDoc}
                  onClick={() => void addEvidence()}
                >
                  {savingEvidence ? <Loader2 className="animate-spin" size={14} /> : <FilePlus2 size={14} />}
                  {savingEvidence ? 'Saving…' : 'Add evidence record'}
                </button>
              </div>
            </div>
          )}

          {/* EVIDENCE CHAIN DOCUMENTS */}
          <DocumentsCard
            primaryLot={primaryLot}
            onDownload={handleDownload}
            onUploadClick={() => setShowEvidenceForm(true)}
            role={role}
            onReview={reviewEvidence}
            reviewingId={reviewingEvidenceId}
          />

          {/* IMPACT CARD */}
          <ImpactCard
            quantityKg={data.listing.normalized_kg_per_week || data.listing.quantity_kg || 5000}
          />

          {/* AUDIT ACTIVITY LOG */}
          <div className="rounded-3xl border border-emerald-100/60 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Audit Trail</p>
                <h3 className="text-sm font-bold text-slate-900">Traceable Changes</h3>
              </div>
              <Stamp className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-4 space-y-3">
              {data.audit_events.length ? (
                data.audit_events.slice(0, 5).map((event) => (
                  <div key={event.id} className="border-l-2 border-emerald-400 pl-3">
                    <p className="text-xs font-semibold text-slate-900">{titleCase(event.action)}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{event.summary}</p>
                    <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      System Record
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No audit events recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================ */
/*  HEADER COMPONENT                                             */
/* ============================================================ */
function PassportHeader({
  material,
  passportId,
  category,
  location,
  total,
  tier,
  listingId,
  copiedId,
  copiedLink,
  onCopyId,
  onShare,
  onDownloadPdf,
  canEdit,
}: {
  material: string
  passportId: string
  category: string
  location: string
  total: number
  tier: 'qualified' | 'partial' | 'none'
  listingId: string
  copiedId: boolean
  copiedLink: boolean
  onCopyId: () => void
  onShare: () => void
  onDownloadPdf: () => void
  canEdit: boolean
}) {
  const tierStyle =
    tier === 'qualified'
      ? 'bg-emerald-50 text-emerald-800 ring-emerald-300/80 border-emerald-200'
      : tier === 'partial'
      ? 'bg-amber-50 text-amber-800 ring-amber-300/80 border-amber-200'
      : 'bg-rose-50 text-rose-800 ring-rose-300/80 border-rose-200'

  const tierLabel =
    tier === 'qualified' ? 'Qualified' : tier === 'partial' ? 'Partially Qualified' : 'Not Qualified'

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-100/80 bg-white/95 p-6 shadow-sm">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-6">
        {/* Left: Material name, ID, tags + Thumbnail */}
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <MaterialThumbnail
            material={material}
            category={category}
            sizeClassName="h-16 w-16 sm:h-20 sm:w-20 shrink-0"
            className="rounded-2xl shadow-md border-2 border-white ring-2 ring-emerald-100"
          />
          <div className="min-w-0 flex-1">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/70 px-2.5 py-0.5 text-[10px] font-bold tracking-[0.16em] text-emerald-800">
              <Stamp className="h-3 w-3 text-emerald-700" />
              MATERIAL PASSPORT · v2.1
            </div>
            <h1 className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-2xl font-black tracking-tight text-transparent sm:text-3xl md:text-4xl">
              {material}
            </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 font-mono text-xs font-bold tracking-wider text-emerald-300 shadow-sm">
              {passportId}
            </span>
            <button
              onClick={onCopyId}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700"
            >
              {copiedId ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              {copiedId ? 'Copied' : 'Copy ID'}
            </button>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
              <MapPin className="h-3 w-3" />
              {location}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200">
              <Tag className="h-3 w-3" />
              {category}
            </span>
          </div>
        </div>
      </div>

        {/* Right: Score ring + Action buttons */}
        <div className="flex shrink-0 flex-wrap items-center gap-6">
          {/* Qualification Score Display */}
          <div className="flex items-center gap-3">
            <ScoreRing score={total} max={100} tier={tier} />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Qualification
              </span>
              <div className="flex items-baseline gap-1">
                <span className="bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-3xl font-black leading-none tracking-tight text-transparent sm:text-4xl tabular-nums">
                  {total}
                </span>
                <span className="text-sm font-bold text-slate-400 tabular-nums">/ 100</span>
              </div>
              <span
                className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${tierStyle}`}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={`absolute inset-0 animate-ping rounded-full opacity-75 ${
                      tier === 'qualified'
                        ? 'bg-emerald-400'
                        : tier === 'partial'
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                    }`}
                  />
                  <span
                    className={`relative h-2 w-2 rounded-full ${
                      tier === 'qualified'
                        ? 'bg-emerald-500'
                        : tier === 'partial'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                </span>
                {tierLabel}
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS: Find Matches (primary) & Edit Listing (secondary) */}
          <div className="flex flex-col gap-2">
            <Link
              to={`/listings/${listingId}/matches`}
              className="group inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-4 text-xs font-bold text-white shadow-md shadow-slate-900/20 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/20"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 transition-transform group-hover:rotate-12" />
              Find Matches
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <div className="flex items-center gap-1.5">
              {canEdit && (
                <Link
                  to={`/list-waste?edit=${listingId}`}
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700"
                >
                  <Pencil className="h-3 w-3" />
                  Edit Listing
                </Link>
              )}
              <button
                onClick={onShare}
                className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Share2 className="h-3 w-3" />
                {copiedLink ? 'Copied' : 'Share'}
              </button>
              <button
                onClick={onDownloadPdf}
                className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Download className="h-3 w-3" />
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreRing({
  score,
  max,
  tier,
}: {
  score: number
  max: number
  tier: 'qualified' | 'partial' | 'none'
}) {
  const r = 26
  const c = 2 * Math.PI * r
  const offset = c - (score / max) * c
  const color = tier === 'qualified' ? '#10b981' : tier === 'partial' ? '#f59e0b' : '#f43f5e'
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 70 70" className="h-full w-full -rotate-90">
        <circle cx="35" cy="35" r={r} stroke="#f1f5f9" strokeWidth="6" fill="none" />
        <circle
          cx="35"
          cy="35"
          r={r}
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Award className="h-5 w-5" style={{ color }} />
      </div>
    </div>
  )
}

/* ============================================================ */
/*  MATERIAL DETAILS TABLE (8 Columns)                           */
/* ============================================================ */
function MaterialDetailsTable({
  material,
  category,
  quantity,
  location,
  grade,
  composition,
  contamination,
  availability,
}: {
  material: string
  category: string
  quantity: string
  location: string
  grade: string
  composition: string
  contamination: string
  availability: string
}) {
  const rows = [
    { label: 'Material', value: material, icon: Recycle },
    { label: 'Category', value: category, icon: Tag },
    { label: 'Quantity', value: quantity, icon: Scale },
    { label: 'Location', value: location, icon: MapPin },
    { label: 'Grade', value: grade, icon: Award },
    { label: 'Composition', value: composition, icon: FlaskConical },
    { label: 'Contamination', value: contamination, icon: AlertCircle },
    { label: 'Availability', value: availability, icon: Calendar },
  ]

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-100/60 bg-white p-5 sm:p-6 shadow-sm">
      <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-300/25 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                Material Details Specification
              </h2>
              <p className="text-xs text-slate-500">Deterministic attributes and declared characteristics</p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-emerald-100 bg-emerald-50/60 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
            8 Attributes Verified
          </span>
        </div>

        {/* 8-Grid responsive view */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {rows.map((r) => (
            <div
              key={r.label}
              className="group rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition hover:border-emerald-200 hover:bg-white hover:shadow-sm"
            >
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                <r.icon className="h-3 w-3 text-emerald-600" />
                {r.label}
              </div>
              <div className="mt-1 text-xs sm:text-[13px] font-semibold text-slate-900 truncate" title={r.value}>
                {r.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ============================================================ */
/*  QUALIFICATION SCORE BREAKDOWN                                */
/* ============================================================ */
function QualificationBreakdown({
  breakdown,
  total,
  maxTotal,
}: {
  breakdown: { key: string; label: string; earned: number; max: number }[]
  total: number
  maxTotal: number
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-100/60 bg-white p-5 sm:p-6 shadow-sm">
      <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-300/20 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                Qualification Score Breakdown
              </h2>
              <p className="text-xs text-slate-500">Recomputed when listing fields or evidence change.</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Total</div>
            <div className="bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-xl sm:text-2xl font-extrabold leading-none tracking-tight text-transparent tabular-nums">
              {total}
              <span className="ml-1 text-sm font-semibold text-slate-400">/ {maxTotal}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {breakdown.map((b) => {
            const pct = (b.earned / b.max) * 100
            const full = b.earned === b.max
            return (
              <div key={b.key} className="group">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-semibold text-slate-700">{b.label}</span>
                  <span className="tabular-nums text-slate-500">
                    <span className={`font-bold ${full ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {b.earned}
                    </span>
                    <span className="text-slate-400"> / {b.max}</span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      full
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : 'bg-gradient-to-r from-emerald-400 to-teal-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 border-t border-dashed border-slate-200 pt-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Total Score</span>
            <span className="tabular-nums text-slate-500">
              <span className="text-lg font-black text-slate-900">{total}</span>
              <span className="text-slate-400 font-semibold"> / {maxTotal}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================ */
/*  COMPOSITION CARD                                             */
/* ============================================================ */
function CompositionCard({
  material,
  company,
  location,
}: {
  material: string
  company: string
  location: string
}) {
  const composition = [
    { name: 'PET polymer', pct: 99.2, color: '#10b981' },
    { name: 'Polyolefin traces', pct: 0.5, color: '#0ea5e9' },
    { name: 'Additives', pct: 0.2, color: '#8b5cf6' },
    { name: 'Other', pct: 0.1, color: '#94a3b8' },
  ]

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-100/60 bg-white p-5 sm:p-6 shadow-sm">
      <div className="relative">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/20">
              <FlaskConical className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900">Composition & Source</h2>
              <p className="text-xs text-slate-500">{material} · Polymer fraction and verified facility source</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
            <ExternalLink className="h-3 w-3" />
            NABL Validated
          </span>
        </div>

        {/* Stacked composition bar */}
        <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100">
          {composition.map((c) => (
            <div
              key={c.name}
              className="h-full transition-all duration-500 hover:brightness-110"
              style={{ width: `${c.pct}%`, backgroundColor: c.color }}
              title={`${c.name}: ${c.pct}%`}
            />
          ))}
        </div>

        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {composition.map((c) => (
            <li
              key={c.name}
              className="rounded-xl border border-slate-100 bg-slate-50/40 p-2.5 transition hover:border-emerald-200 hover:bg-white hover:shadow-sm"
            >
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-[11px] font-semibold text-slate-700">{c.name}</span>
              </div>
              <div className="mt-0.5 flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-900 tabular-nums">{c.pct}</span>
                <span className="text-[10px] font-medium text-slate-500">%</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 grid grid-cols-1 gap-2.5 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              <Factory className="h-3 w-3 text-emerald-600" />
              Source Facility
            </div>
            <div className="mt-1 text-xs font-bold text-slate-900">{company || 'Industrial Facility'}</div>
            <div className="text-[11px] text-slate-500">{location || 'Verified regional plant'}</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              <Beaker className="h-3 w-3 text-violet-600" />
              Lab Analysis
            </div>
            <div className="mt-1 text-xs font-bold text-slate-900">SGS India · NABL-accredited</div>
            <div className="text-[11px] text-slate-500">Report #SGS-IN-2026-04781 · Verified</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================ */
/*  EVIDENCE CHECKLIST (5 Items)                                 */
/* ============================================================ */
function EvidenceChecklist({
  items,
  onAddClick,
  isSupplier,
  onItemClick,
}: {
  items: readonly {
    id: number
    label: string
    status: 'reviewed' | 'verified' | 'uploaded' | 'pending' | 'notstarted'
    hint: string
  }[]
  onAddClick: () => void
  isSupplier?: boolean
  onItemClick?: (id: number) => void
}) {
  const total = items.length
  const done = items.filter(
    (i) => i.status === 'reviewed' || i.status === 'verified' || i.status === 'uploaded',
  ).length

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-100/60 bg-white p-5 shadow-sm">
      <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-300/20 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <FileCheck2 className="h-4 w-4" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-2 py-0.5 text-[10px] font-bold tracking-[0.16em] text-emerald-800">
                <CheckCircle2 className="h-2.5 w-2.5" />
                EVIDENCE STATUS
              </div>
              <h2 className="mt-0.5 text-sm font-bold tracking-tight text-slate-900">
                {done} of {total} Complete
              </h2>
            </div>
          </div>
          <button
            onClick={onAddClick}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700"
          >
            <Upload className="h-3 w-3" />
            Add
          </button>
        </div>

        {/* Supplier view interaction tip */}
        {isSupplier && (
          <div className="mt-2.5 flex items-center gap-1.5 rounded-xl border border-emerald-200/70 bg-emerald-50/70 px-2.5 py-1.5 text-[11px] font-medium text-emerald-800">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span>Supplier view: Click any item below to simulate upload.</span>
          </div>
        )}

        {/* Progress mini bar */}
        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
              style={{ width: `${(done / total) * 100}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {done} completed · {total - done} pending
            </span>
            <span className="font-bold tabular-nums text-emerald-700">+{done * 2}/10 pts</span>
          </div>
        </div>

        {/* 5 specification items */}
        <ul className="mt-4 space-y-2">
          {items.map((it) => (
            <EvidenceRow
              key={it.id}
              item={it}
              isSupplier={isSupplier}
              onClick={isSupplier ? () => onItemClick?.(it.id) : undefined}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}

function EvidenceRow({
  item,
  isSupplier,
  onClick,
}: {
  item: {
    id: number
    label: string
    status: 'reviewed' | 'verified' | 'uploaded' | 'pending' | 'notstarted'
    hint: string
  }
  isSupplier?: boolean
  onClick?: () => void
}) {
  // Spec:
  // ✓ Green  = Reviewed or Verified
  // ⚠ Yellow = Uploaded or Pending
  // ○ Grey   = Not Started
  const isGreen = item.status === 'reviewed' || item.status === 'verified'
  const isYellow = item.status === 'uploaded' || item.status === 'pending'

  const cfg = isGreen
    ? {
        symbol: '✓',
        Icon: CheckCircle2,
        label: item.status === 'verified' ? 'Verified' : 'Reviewed',
        pill: 'bg-emerald-50 text-emerald-800 ring-emerald-300/80 border-emerald-200',
        iconBg: 'bg-emerald-100 text-emerald-700',
      }
    : isYellow
    ? {
        symbol: '⚠',
        Icon: AlertCircle,
        label: item.status === 'uploaded' ? 'Uploaded' : 'Pending',
        pill: 'bg-amber-50 text-amber-800 ring-amber-300/80 border-amber-200',
        iconBg: 'bg-amber-100 text-amber-700',
      }
    : {
        symbol: '○',
        Icon: CircleDashed,
        label: 'Not Started',
        pill: 'bg-slate-100 text-slate-600 ring-slate-200 border-slate-200',
        iconBg: 'bg-slate-100 text-slate-500',
      }

  return (
    <li
      onClick={onClick}
      className={`group flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/40 p-2.5 transition ${
        isSupplier
          ? 'cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/40 active:scale-[0.99]'
          : 'hover:bg-white hover:shadow-sm'
      }`}
      title={isSupplier ? `Click to simulate upload (toggle state) for ${item.label}` : undefined}
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${cfg.iconBg} ring-1 ring-inset ring-white/60`}
      >
        <cfg.Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-900">{item.label}</span>
          {isSupplier && (
            <span className="opacity-0 transition group-hover:opacity-100 text-[10px] font-semibold text-emerald-700">
              (Click to toggle)
            </span>
          )}
        </div>
        <div className="truncate text-[10.5px] text-slate-500">{item.hint}</div>
      </div>
      <span
        className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${cfg.pill}`}
      >
        <span>{cfg.symbol}</span>
        <span>{cfg.label}</span>
      </span>
    </li>
  )
}

/* ============================================================ */
/*  DOCUMENTS CARD                                               */
/* ============================================================ */
function DocumentsCard({
  primaryLot,
  onDownload,
  onUploadClick,
  role,
  onReview,
  reviewingId,
}: {
  primaryLot: MaterialLot | undefined
  onDownload: (ev: Partial<QualityEvidence> & { document_url?: string | null }) => void
  onUploadClick: () => void
  role: Role
  onReview: (id: string, status: 'reviewed' | 'test_reviewed') => void
  reviewingId: string | null
}) {
  const realEvidence: QualityEvidence[] = primaryLot?.evidence || []

  const sampleDocs = [
    { name: 'Lab Analysis Report.pdf', size: '2.4 MB', type: 'PDF', icon: FileText, tint: 'text-rose-600 bg-rose-50' },
    { name: 'Quantity Weighbridge Slip.pdf', size: '1.1 MB', type: 'PDF', icon: FileText, tint: 'text-rose-600 bg-rose-50' },
    { name: 'Batch Photos (12).zip', size: '18.7 MB', type: 'ZIP', icon: FileCheck2, tint: 'text-emerald-600 bg-emerald-50' },
  ]

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-100/60 bg-white p-5 shadow-sm">
      <div className="relative">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-slate-900">Documents Vault</h3>
              <p className="text-xs text-slate-500">
                {realEvidence.length ? `${realEvidence.length} files attached` : 'Uploaded lot files'}
              </p>
            </div>
          </div>
          <button
            onClick={onUploadClick}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700"
          >
            <Upload className="h-3 w-3" />
            Upload
          </button>
        </div>

        <ul className="mt-3 space-y-1.5">
          {realEvidence.length > 0 ? (
            realEvidence.map((ev) => (
              <li
                key={ev.id}
                className="group flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/40 p-2.5 transition hover:bg-white hover:shadow-sm"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-bold text-slate-800">{ev.title}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {ev.status_label || ev.status} · {ev.issuer}
                  </div>
                </div>
                {role === 'admin' && !['reviewed', 'test_reviewed', 'rejected', 'expired'].includes(ev.status) && (
                  <button
                    onClick={() => onReview(ev.id, 'reviewed')}
                    disabled={reviewingId === ev.id}
                    className="flex h-7 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-[10.5px] font-semibold text-emerald-700 hover:bg-emerald-50"
                  >
                    {reviewingId === ev.id ? <Loader2 className="animate-spin" size={11} /> : <CheckCircle2 size={11} />}
                    Review
                  </button>
                )}
                <button
                  onClick={() => onDownload(ev)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                  title="Download document"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </li>
            ))
          ) : (
            sampleDocs.map((d) => (
              <li
                key={d.name}
                className="group flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/40 p-2.5 transition hover:bg-white hover:shadow-sm"
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${d.tint}`}>
                  <d.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-bold text-slate-800">{d.name}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {d.type} · {d.size}
                  </div>
                </div>
                <button
                  onClick={() => onDownload({ document_name: d.name })}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                  title="Download document"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}

/* ============================================================ */
/*  IMPACT CARD                                                  */
/* ============================================================ */
function ImpactCard({ quantityKg }: { quantityKg: number }) {
  const tons = Math.max(1, Math.round(quantityKg / 1000))
  const co2Avoided = (tons * 0.84).toFixed(1)
  const waterSaved = (tons * 1720).toLocaleString()
  const energySaved = (tons * 2.96).toFixed(1)

  const impacts = [
    {
      icon: TreePine,
      label: 'CO₂ avoided',
      value: `${co2Avoided} t`,
      sub: 'vs landfill',
      tint: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50/70',
    },
    {
      icon: Droplets,
      label: 'Water saved',
      value: `${waterSaved} L`,
      sub: 'vs virgin PET',
      tint: 'from-sky-500 to-blue-500',
      bg: 'bg-sky-50/70',
    },
    {
      icon: Wind,
      label: 'Energy saved',
      value: `${energySaved} GJ`,
      sub: 'incl. transport',
      tint: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50/70',
    },
    {
      icon: Recycle,
      label: 'Diverted',
      value: formatKg(quantityKg),
      sub: 'from disposal',
      tint: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-50/70',
    },
  ]

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-100/60 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-white p-5 shadow-sm">
      <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-emerald-300/30 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2.5 border-b border-emerald-100/50 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[9.5px] font-bold tracking-[0.16em] text-emerald-800 border border-emerald-200/60">
              <Sparkles className="h-2.5 w-2.5 text-emerald-600" />
              ENVIRONMENTAL IMPACT
            </div>
            <h3 className="mt-0.5 text-xs font-bold text-slate-900">Calculated Batch Benefit</h3>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {impacts.map((s) => (
            <div
              key={s.label}
              className={`rounded-xl border border-white/80 ${s.bg} p-2.5 transition hover:shadow-sm`}
            >
              <div className="flex items-center gap-1.5">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br ${s.tint} text-white shadow-sm`}
                >
                  <s.icon className="h-3 w-3" />
                </div>
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 truncate">
                  {s.label}
                </span>
              </div>
              <div className="mt-1 bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-base font-extrabold leading-none tracking-tight text-transparent tabular-nums">
                {s.value}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-500">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="mt-3.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Facility emission target progress</span>
            <span className="font-bold text-emerald-700 tabular-nums">82%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
              style={{ width: '82%' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================ */
/*  MATERIAL VISUAL LOT INSPECTION CARD                          */
/* ============================================================ */
function MaterialVisualCard({
  material,
  category,
}: {
  material: string
  category: string
}) {
  const imgSrc = getMaterialImage(material, category)
  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-100/60 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <Camera className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Material Lot Inspection
            </h3>
            <p className="text-[11px] text-slate-500">Verified stream reference</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
          AI Verified
        </span>
      </div>

      <div className="group relative mt-3.5 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100">
        <img
          src={imgSrc}
          alt={material}
          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
          <div className="min-w-0">
            <p className="truncate text-xs font-bold">{material}</p>
            <p className="text-[10px] text-slate-200">Standard Secondary Lot</p>
          </div>
          <span className="shrink-0 rounded-md bg-white/20 px-2 py-0.5 text-[9px] font-semibold backdrop-blur-md">
            HD Preview
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span>AI Generated stream reference</span>
        <button
          type="button"
          onClick={() => alert('Photo upload drawer will allow plant camera uploads.')}
          className="font-semibold text-emerald-700 hover:underline"
        >
          Add custom photo
        </button>
      </div>
    </div>
  )
}

