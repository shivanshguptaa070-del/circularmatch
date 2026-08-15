import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Check, CheckCircle2, CircleDollarSign, ClipboardCheck, Contact, Factory, FileCheck2, FlaskConical, Leaf, Loader2, MapPinned, PackageCheck, Route, Send, ShieldAlert, Sparkles, TestTube2, Truck, WalletCards } from 'lucide-react'
import { get, patch, post } from '../lib/api'
import { formatCurrency, formatKg, formatNumber, titleCase } from '../lib/format'
import { useAsync } from '../hooks/useAsync'
import type { MapPoint, MapRoute, MatchDetail, Role } from '../types'
import { NetworkMap } from '../components/NetworkMap'
import { StatusBadge, Disclosure, ErrorPanel, LoadingPanel, PageHeader, QualityPill, ScoreBar, ScoreRing } from '../components/ui'

const eligibilityTone: Record<string, string> = {
  eligible: 'border-[#bee7ce] bg-[#eaf8ef] text-[#1e694d]',
  needs_sample: 'border-[#ead79e] bg-[#fff8e7] text-[#856624]',
  missing_evidence: 'border-[#ead79e] bg-[#fff8e7] text-[#856624]',
  blocked: 'border-[#f1cabc] bg-[#fff2ed] text-[#a24f38]',
}

const checkTone: Record<string, string> = {
  pass: 'border-[#c9ead7] bg-[#eff9f3] text-[#236a50]',
  warning: 'border-[#ecdca8] bg-[#fff9ea] text-[#806528]',
  fail: 'border-[#f2d1c6] bg-[#fff4ef] text-[#a5533b]',
}

export function MatchDetailPage({ role }: { role: Role }) {
  const { matchId } = useParams<{ matchId: string }>()
  const detail = useAsync(() => get<MatchDetail>(`/api/matches/${matchId}`).then((response) => response.data), [matchId])
  const map = useAsync(
    () => get<{ points: MapPoint[]; selected_route: MapRoute | null }>(`/api/map/points?match_id=${matchId}`).then((response) => response.data),
    [matchId],
  )
  const [contacting, setContacting] = useState(false)
  const [workflowBusy, setWorkflowBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const contact = async () => {
    if (!matchId) return
    setContacting(true)
    setActionError(null)
    try {
      const response = await post<{ message: string }>(`/api/matches/${matchId}/contact`, { note: 'Demo contact initiated from match detail.' })
      setMessage(response.data.message)
      void detail.reload()
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Could not record demo contact intent.')
    } finally {
      setContacting(false)
    }
  }

  if (detail.loading) return <LoadingPanel label="Opening explainable match detail…" />
  if (detail.error || !detail.data) return <ErrorPanel error={detail.error || 'Match detail unavailable.'} onRetry={() => void detail.reload()} />
  const data = detail.data
  const { match, listing, material_lot: lot, buyer_requirement: requirement, buyer_acceptance_spec: acceptanceSpec, buyer, explanation, economic, impact } = data
  const operationalBlocked = match.eligibility_status === 'blocked'
  const latestSample = [...data.timeline].reverse().find((event) => event.type === 'sample_request')
  const latestOffer = [...data.timeline].reverse().find((event) => event.type === 'offer')
  const latestShipment = [...data.timeline].reverse().find((event) => event.type === 'shipment')

  const runWorkflow = async (type: 'sample' | 'sample_accept' | 'offer' | 'offer_accept' | 'shipment' | 'receipt') => {
    if (!matchId) return
    setWorkflowBusy(type)
    setActionError(null)
    try {
      let response: { data: { message: string } }
      const latest = (eventType: string) => [...data.timeline].reverse().find((event) => event.type === eventType)
      if (type === 'sample') {
        response = await post<{ message: string }>(`/api/matches/${matchId}/sample-requests`, { requested_quantity_kg: 25, note: 'Sample request created from the match workspace.' })
      } else if (type === 'sample_accept') {
        const sample = latest('sample_request')
        if (!sample) throw new Error('Create a sample request before recording a sample decision.')
        response = await patch<{ message: string }>(`/api/sample-requests/${sample.record.id}`, { status: 'accepted', note: 'Illustrative demo sample acceptance; not a laboratory certification.' })
      } else if (type === 'offer') {
        response = await post<{ message: string }>(`/api/matches/${matchId}/offers`, {
          price_per_kg: requirement.target_price_per_kg || listing.asking_price_per_kg || 0,
          quantity_kg: Math.min(listing.normalized_kg_per_week, requirement.maximum_quantity_kg_week),
          pickup_model: 'buyer_pickup',
          note: 'Formal offer only — not a binding commercial agreement.',
        })
      } else if (type === 'offer_accept') {
        const offer = latest('offer')
        if (!offer) throw new Error('Create an illustrative offer before accepting it.')
        response = await patch<{ message: string }>(`/api/offers/${offer.record.id}`, { status: 'accepted', note: 'Formal offer acceptance; pending final confirmation.' })
      } else if (type === 'shipment') {
        response = await post<{ message: string }>(`/api/matches/${matchId}/shipments`, {
          planned_quantity_kg: Math.min(listing.normalized_kg_per_week, requirement.maximum_quantity_kg_week),
          pickup_date: '2026-08-17',
          pickup_model: 'buyer_pickup',
          carrier_name: 'Demo logistics partner',
        })
      } else {
        const shipment = latest('shipment')
        if (!shipment) throw new Error('Plan a demo pickup before recording receipt.')
        const receiptWeight = shipment.record.planned_quantity_kg || Math.min(listing.normalized_kg_per_week, requirement.maximum_quantity_kg_week)
        response = await patch<{ message: string }>(`/api/shipments/${shipment.record.id}`, { status: 'received', dispatched_weight_kg: receiptWeight, received_weight_kg: receiptWeight, receipt_note: 'Material receipt; replace with weighbridge/receipt evidence in production.' })
      }
      setMessage(response.data.message)
      await detail.reload()
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'Could not update the demo transaction workflow.')
    } finally {
      setWorkflowBusy(null)
    }
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Explainable recommendation · trusted pilot core"
        title="Why this match?"
        description="This workspace evaluates compatibility, evidence completeness, quality specs, distance, and circular economics."
        actions={<><Link className="btn-secondary" to={`/listings/${listing.id}/passport`}><ClipboardCheck size={16} />Material Passport</Link><Link className="btn-secondary" to={`/listings/${listing.id}/matches`}><ArrowRight className="rotate-180" size={16} />Back to buyers</Link></>}
      />
      {message && <div className="flex gap-3 rounded-2xl border border-[#b9ddc7] bg-[#eff9f2] p-4 text-sm text-[#28624e]"><CheckCircle2 className="mt-0.5 shrink-0" size={18} /><span>{message}</span></div>}
      {actionError && <div className="rounded-2xl border border-[#f1c6b9] bg-[#fff7f4] p-4 text-sm text-[#994f3a]">{actionError}</div>}

      <section className="relative overflow-hidden rounded-3xl bg-forest p-6 text-white shadow-lift sm:p-8"><div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border-[34px] border-mint/10" /><div className="relative grid gap-7 lg:grid-cols-[1fr_auto_1fr] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">Material Passport lot</p><h2 className="mt-3 text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">{listing.material}</h2><p className="mt-2 text-sm text-[#c4dfd0]">{lot ? `${lot.lot_code} · ${lot.material_form}` : 'Lot record pending'} · {formatKg(listing.normalized_kg_per_week)}/week</p><div className="mt-4 flex flex-wrap gap-2"><QualityPill verified={listing.quality_verified} grade={titleCase(listing.quality_grade)} /><span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-[#d1eada]">{Math.round(match.data_completeness_score)}% data completeness</span></div></div><div className="flex items-center justify-center gap-3"><div className="h-px w-10 bg-mint/35" /><Route className="text-mint" size={24} /><div className="h-px w-10 bg-mint/35" /></div><div className="lg:text-right"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f5d68a]">Buyer route</p><h2 className="mt-3 text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">{buyer.name}</h2><p className="mt-2 text-sm text-[#c4dfd0]">{buyer.city} · {match.distance_km.toFixed(1)} km calculated distance</p><p className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-mint">{requirement.minimum_quantity_kg_week.toLocaleString('en-IN')}–{requirement.maximum_quantity_kg_week.toLocaleString('en-IN')} kg/week required</p></div></div><div className="relative mt-7 flex flex-col gap-4 border-t border-white/15 pt-6 lg:flex-row lg:items-center lg:justify-between"><div><p className="max-w-3xl text-sm leading-6 text-[#c7e1d2]">{explanation.headline}</p><p className="mt-2 text-xs font-semibold text-mint">Next action: {match.next_action}</p></div><div className="flex items-center gap-4"><ScoreRing score={match.total_score} size={96} /><button className="btn-primary" style={{ background: '#bfe9d0', color: '#073c33' }} disabled={contacting || match.status === 'contacted'} onClick={() => void contact()}>{contacting ? <Loader2 className="animate-spin" size={16} /> : <Contact size={16} />}{match.status === 'contacted' ? 'Contact recorded' : role === 'buyer' ? 'Contact generator' : 'Contact buyer'}</button></div></div></section>

      <section className="grid gap-5 xl:grid-cols-[.86fr_1.14fr]">
        <article className={`rounded-3xl border p-5 sm:p-7 ${eligibilityTone[match.eligibility_status]}`}><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] opacity-80">Eligibility gates</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.05em]">{match.eligibility_label}</h2><p className="mt-2 text-sm leading-6 opacity-90">The score ranks comparable routes. These checks state whether this route can advance, needs evidence, needs a sample, or is blocked.</p></div><ShieldAlert size={25} /></div><div className="mt-6 space-y-3">{explanation.eligibility_checks.map((check) => <div key={check.key} className={`rounded-2xl border p-3.5 ${checkTone[check.status]}`}><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">{check.label}</p><span className="text-[10px] font-bold uppercase tracking-[.11em]">{check.status}</span></div><p className="mt-1.5 text-xs leading-5 opacity-90">{check.detail}</p></div>)}</div></article>
        <article className="card p-5 sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Transparent score</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-ink">Decision breakdown</h2><p className="mt-1 text-sm leading-6 text-[#6d827a]">Components remain deterministic and versioned. They do not override a blocked or missing-evidence gate.</p></div><StatusBadge>v{match.scoring_config_id.split('-').pop()}</StatusBadge></div><div className="mt-7 space-y-5">{explanation.score_breakdown.map((item) => <ScoreBar key={item.key} label={item.label} score={item.score} weight={item.weight} />)}</div><div className="mt-7 rounded-2xl border border-[#dce9e0] bg-[#f5faf6] p-4"><p className="text-xs font-semibold text-ink">{explanation.decision_rule_label}</p><p className="mt-1 text-xs leading-5 text-[#678078]">A score is a comparison aid. It does not mean material acceptance, quality certification, compliance clearance, or transaction success.</p></div></article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
        <article className="card p-5 sm:p-7"><div className="flex items-center gap-2"><FlaskConical className="text-spruce" size={19} /><div><p className="eyebrow">Material evidence</p><h2 className="mt-1 text-xl font-semibold tracking-[-.04em] text-ink">What is known about this lot?</h2></div></div>{lot ? <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-[#f6f9f6] p-4"><p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#7c9289]">Form / source</p><p className="mt-2 text-sm font-semibold text-ink">{lot.material_form} · {titleCase(lot.source_status)}</p></div><div className="rounded-2xl bg-[#f6f9f6] p-4"><p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#7c9289]">Colour / packaging</p><p className="mt-2 text-sm font-semibold text-ink">{lot.colour} · {lot.packaging}</p></div><div className="rounded-2xl bg-[#f6f9f6] p-4 sm:col-span-2"><p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#7c9289]">Storage & triage</p><p className="mt-2 text-sm leading-6 text-ink">{lot.storage_condition}</p><p className="mt-2 text-xs font-semibold text-[#a3543c]">{lot.triage_label} — this is not a legal classification.</p></div></div> : <p className="mt-5 text-sm text-[#6c8178]">No dispatchable lot record is attached to this match.</p>}<Link className="btn-secondary mt-6 w-full" to={`/listings/${listing.id}/passport`}><FileCheck2 size={16} />Open full Material Passport</Link></article>
        <article className="card p-5 sm:p-7"><div className="flex items-center gap-2"><TestTube2 className="text-[#a47a25]" size={19} /><div><p className="eyebrow">Buyer acceptance template</p><h2 className="mt-1 text-xl font-semibold tracking-[-.04em] text-ink">What this route accepts</h2></div></div><div className="mt-6 space-y-4 text-sm"><div><p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#7c9289]">Accepted forms</p><div className="mt-2 flex flex-wrap gap-2">{acceptanceSpec.accepted_forms.length ? acceptanceSpec.accepted_forms.map((item) => <span key={item} className="badge-safe">{item}</span>) : <span className="text-xs text-[#71867e]">Not specified</span>}</div></div><div><p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#7c9289]">Prohibited / review items</p><div className="mt-2 flex flex-wrap gap-2">{acceptanceSpec.prohibited_materials.length ? acceptanceSpec.prohibited_materials.map((item) => <span key={item} className="badge-warn">{item}</span>) : <span className="text-xs text-[#71867e]">No template items specified</span>}</div></div><div className="rounded-2xl bg-[#f6f9f6] p-4 text-xs leading-5 text-[#637970]"><p><strong className="text-ink">Minimum evidence:</strong> {titleCase(acceptanceSpec.required_evidence_status)}</p><p className="mt-1"><strong className="text-ink">Sample required:</strong> {acceptanceSpec.requires_sample ? 'Yes' : 'No'}</p><p className="mt-1"><strong className="text-ink">Route note:</strong> {acceptanceSpec.route_note || 'Not specified'}</p></div></div></article>
      </section>

      <section className="card overflow-hidden"><div className="flex flex-col gap-4 border-b border-[#dfe9e2] bg-gradient-to-r from-[#f2faf4] to-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7"><div><p className="eyebrow">Operational workflow</p><h2 className="mt-2 text-xl font-semibold tracking-[-.04em] text-ink">Sample → offer → pickup → receipt</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#647a71]">These controls create clearly labelled demo records. In production, they become evidence-backed operational handoffs rather than automatic deal closure.</p></div><span className="badge-neutral">active workflow</span></div><div className="grid gap-5 p-5 sm:p-7 xl:grid-cols-[.68fr_1.32fr]"><div className="space-y-3"><button className="btn-secondary w-full" disabled={operationalBlocked || workflowBusy !== null} onClick={() => void runWorkflow('sample')}>{workflowBusy === 'sample' ? <Loader2 className="animate-spin" size={16} /> : <FlaskConical size={16} />}Request sample / inspection</button>{latestSample && latestSample.status !== 'accepted' && <button className="btn-secondary w-full" disabled={operationalBlocked || workflowBusy !== null} onClick={() => void runWorkflow('sample_accept')}>{workflowBusy === 'sample_accept' ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}Record demo sample acceptance</button>}<button className="btn-secondary w-full" disabled={operationalBlocked || workflowBusy !== null} onClick={() => void runWorkflow('offer')}>{workflowBusy === 'offer' ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}Create illustrative offer</button>{latestOffer && latestOffer.status !== 'accepted' && <button className="btn-secondary w-full" disabled={operationalBlocked || workflowBusy !== null} onClick={() => void runWorkflow('offer_accept')}>{workflowBusy === 'offer_accept' ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}Record demo offer acceptance</button>}<button className="btn-secondary w-full" disabled={operationalBlocked || workflowBusy !== null} onClick={() => void runWorkflow('shipment')}>{workflowBusy === 'shipment' ? <Loader2 className="animate-spin" size={16} /> : <Truck size={16} />}Plan demo pickup</button>{latestShipment && latestShipment.status !== 'received' && <button className="btn-secondary w-full" disabled={operationalBlocked || workflowBusy !== null} onClick={() => void runWorkflow('receipt')}>{workflowBusy === 'receipt' ? <Loader2 className="animate-spin" size={16} /> : <PackageCheck size={16} />}Record demo receipt</button>}{operationalBlocked && <p className="rounded-xl border border-[#f1d1c5] bg-[#fff5f0] p-3 text-xs leading-5 text-[#99513c]">Resolve the explicit blocked gate before creating a sample, offer, or pickup record.</p>}</div><div className="space-y-3">{data.timeline.length ? data.timeline.map((event) => <div key={event.id} className="flex gap-3 rounded-2xl border border-[#deebe2] bg-[#fbfdfb] p-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#e9f6ee] text-spruce">{event.type === 'sample_request' ? <FlaskConical size={15} /> : event.type === 'offer' ? <Send size={15} /> : event.type === 'shipment' ? <Truck size={15} /> : <Contact size={15} />}</span><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-ink">{event.title}</p><span className="badge-neutral">{titleCase(event.status)}</span></div><p className="mt-1 text-xs leading-5 text-[#627970]">{event.detail}</p></div></div>) : <p className="rounded-2xl bg-[#f7faf8] p-5 text-sm text-[#6b8179]">No sample, offer, pickup, or receipt events have been recorded yet.</p>}</div></div></section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="card overflow-hidden"><div className="flex items-start justify-between gap-5 bg-[#eef8f1] p-5 sm:p-6"><div><div className="flex items-center gap-2 text-spruce"><WalletCards size={18} /><span className="text-xs font-bold uppercase tracking-[0.14em]">Economic value calculator</span></div><h2 className="mt-3 text-xl font-semibold tracking-[-0.035em] text-ink">Disposal vs circular reuse</h2><p className="mt-1 text-sm text-[#617a70]">Scenario volume: {formatKg(economic.quantity_kg)}</p></div><CircleDollarSign className="text-[#6ca385]" size={27} /></div><div className="grid grid-cols-2 gap-px bg-[#e1ebe4] p-px sm:grid-cols-4">{[['Listed price', formatCurrency(economic.reference_price_per_kg) + '/kg', economic.reference_price_source], ['Transport', formatCurrency(economic.estimated_logistics_per_kg, 2) + '/kg', 'Estimated logistics'], ['Net recovered', formatCurrency(economic.net_recovered_value), 'After transport'], ['Improvement', formatCurrency(economic.potential_improvement_vs_disposal), 'vs current disposal']].map(([label, value, detailText]) => <div key={label} className="bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#7c9289]">{label}</p><p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-ink">{value}</p><p className="mt-1 text-[10px] leading-4 text-[#7c9088]">{detailText}</p></div>)}</div><div className="p-5 sm:p-6"><p className="text-sm leading-6 text-[#526b62]">{economic.formula}</p><div className="mt-5 rounded-xl bg-[#fff8e7] p-4 text-xs leading-5 text-[#75612e]"><strong>Assumptions.</strong> {economic.assumptions.map((assumption) => <span key={assumption} className="block mt-1">• {assumption}</span>)}</div></div></article>
        <article className="card overflow-hidden"><div className="flex items-start justify-between gap-5 bg-[#f0f7f3] p-5 sm:p-6"><div><div className="flex items-center gap-2 text-spruce"><Leaf size={18} /><span className="text-xs font-bold uppercase tracking-[0.14em]">Environmental impact</span></div><h2 className="mt-3 text-xl font-semibold tracking-[-0.035em] text-ink">Potential circular benefit</h2><p className="mt-1 text-sm text-[#617a70]">Pathway: {impact.potential_use}</p></div><Leaf className="text-[#6ca385]" size={27} /></div><div className="grid grid-cols-2 gap-px bg-[#e1ebe4] p-px">{[['Waste diverted', `${formatNumber(impact.waste_diverted_kg)} kg`], ['Secondary material', `${formatNumber(impact.secondary_material_recovered_kg)} kg`], ['Virgin displaced', `${formatNumber(impact.estimated_virgin_material_displaced_kg)} kg`], ['Net CO₂e benefit', `${formatNumber(impact.estimated_net_co2e_benefit_kgco2e)} kgCO₂e`]].map(([label, value]) => <div key={label} className="bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#7c9289]">{label}</p><p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-ink">{value}</p></div>)}</div><div className="p-5 sm:p-6"><div className="flex items-center gap-2 text-xs font-semibold text-[#8e6d22]"><Sparkles size={15} />Illustrative / Calculated Impact</div><div className="mt-4 rounded-2xl border border-[#deebe2] bg-[#f8fbf9] p-4 text-xs leading-5 text-[#647a71]"><p><strong className="text-ink">Method:</strong> {impact.methodology.name}</p><p className="mt-1"><strong className="text-ink">Functional unit:</strong> {impact.methodology.functional_unit}</p><p className="mt-1"><strong className="text-ink">Boundary:</strong> {impact.methodology.system_boundary}</p><p className="mt-1"><strong className="text-ink">Data tier:</strong> {titleCase(impact.methodology.data_quality_tier)}</p><p className="mt-2 text-[#916e24]">{impact.methodology.claim_boundary}</p></div><div className="mt-4 space-y-1.5 text-xs leading-5 text-[#667d74]">{impact.assumptions.map((assumption) => <p key={assumption}>• {assumption}</p>)}</div></div></article>
      </section>

      <section className="space-y-4"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Visualize the proposed route</p><h2 className="mt-1 section-title">Generator → buyer</h2></div><span className="badge-warn"><Truck className="mr-1" size={13} />{data.map_route.label}</span></div>{map.loading ? <LoadingPanel label="Loading the sample route…" /> : map.error || !map.data ? <ErrorPanel error={map.error || 'Route data unavailable.'} onRetry={() => void map.reload()} /> : <NetworkMap points={map.data.points} route={map.data.selected_route} />}</section>

      <section className="rounded-3xl border border-[#d9e7dd] bg-[#f6fbf7] p-6 sm:flex sm:items-center sm:justify-between sm:p-7"><div><p className="eyebrow">Next pilot moment</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-ink">Turn a disposal problem into a traceable secondary-material opportunity.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[#647a71]">A real rollout should connect these records to reviewed documents, buyer acceptance, logistics proof, final received weight, and governed impact methodology.</p></div><Link className="btn-primary mt-5 sm:mt-0" to="/dashboard"><Factory size={16} />Back to dashboard<ArrowRight size={16} /></Link></section>
    </div>
  )
}
