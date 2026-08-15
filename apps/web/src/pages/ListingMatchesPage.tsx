import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowRight, Bot, CheckCircle2, CircleDollarSign, Factory, Leaf, Loader2, MapPin, PackageSearch, Recycle, Route, Sparkles } from 'lucide-react'
import { get, post } from '../lib/api'
import { formatCurrency, formatKg, titleCase } from '../lib/format'
import { useAsync } from '../hooks/useAsync'
import type { Listing, MatchCard, Material, Role } from '../types'
import { StatusBadge, Disclosure, EmptyPanel, ErrorPanel, LoadingPanel, PageHeader, QualityPill, ScoreBar, ScoreRing } from '../components/ui'
import { motion } from 'framer-motion'

export function ListingMatchesPage({ role }: { role: Role }) {
  const { listingId } = useParams<{ listingId: string }>()
  const location = useLocation()
  const listingData = useAsync(() => get<Listing>(`/api/listings/${listingId}`).then((response) => response.data), [listingId])
  const materials = useAsync(() => get<Material[]>('/api/materials').then((response) => response.data), [])
  const [results, setResults] = useState<MatchCard[] | null>(null)
  const [message, setMessage] = useState<string | null>(location.state?.created ? 'Listing published to the Platform Dataset. Now analyze compatible industrial buyers.' : null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runMatch = async () => {
    if (!listingId) return
    setAnalyzing(true)
    setError(null)
    try {
      const response = role === 'generator'
        ? await post<{ listing: Listing; matches: MatchCard[]; message: string }>(`/api/listings/${listingId}/matches/recompute`)
        : await get<{ listing: Listing; matches: MatchCard[] }>(`/api/listings/${listingId}/matches`)
      setResults(response.data.matches)
      setMessage('Eligibility gates and transparent ranking are complete. Each route now shows the next operational action—not only a percentage score.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not analyze buyer compatibility.')
    } finally {
      setAnalyzing(false)
    }
  }

  if (listingData.loading || materials.loading) return <LoadingPanel label="Preparing the material intelligence workspace…" />
  if (listingData.error || materials.error || !listingData.data || !materials.data) return <ErrorPanel error={listingData.error || materials.error || 'Listing unavailable.'} onRetry={() => { void listingData.reload(); void materials.reload() }} />
  const listing = listingData.data
  const material = materials.data.find((item) => item.id === listing.material_id)

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Match recommendation"
        title="From material record to circular pathway"
        description="Review what the listing says, the plausible potential uses, and the compatible buyer ranking. Calculations are deterministic and every result stays explainable."
        actions={<><Link className="btn-secondary" to={`/listings/${listingId}/passport`}>Material Passport</Link><Link className="btn-secondary" to="/listings"><ArrowRight className="rotate-180" size={16} />All listings</Link></>}
      />
      {message && <div className="flex gap-3 rounded-2xl border border-[#b9ddc7] bg-[#eff9f2] p-4 text-sm text-[#28624e]"><CheckCircle2 className="mt-0.5 shrink-0" size={18} /><span>{message}</span></div>}
      {error && <div className="rounded-2xl border border-[#f1c6b9] bg-[#fff7f4] p-4 text-sm text-[#994f3a]">{error}</div>}
      <Disclosure>MVP decision rules use configurable weights for material, quality, quantity, distance/logistics, price and environmental benefit. They are not scientifically optimal and do not guarantee a transaction.</Disclosure>

      <section className="relative grid gap-5 xl:grid-cols-[1fr_52px_1fr_52px_1.25fr] xl:items-stretch">
        <article className="card overflow-hidden"><div className="bg-forest p-5 text-white"><div className="flex items-center gap-2 text-mint"><Recycle size={17} /><span className="text-xs font-bold uppercase tracking-[0.14em]">Your waste</span></div><h2 className="mt-4 text-2xl font-semibold tracking-[-0.045em]">{listing.material}</h2><p className="mt-1 text-sm text-[#c5dfd0]">{listing.company} · {listing.city}</p></div><div className="p-5"><div className="grid grid-cols-2 gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#7a9087]">Available</p><p className="mt-1 text-lg font-semibold tracking-[-0.03em] text-ink">{formatKg(listing.normalized_kg_per_week)}</p><p className="text-xs text-[#6f847c]">per week</p></div><div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#7a9087]">Availability</p><p className="mt-1 text-sm font-semibold text-ink">{listing.availability}</p></div></div><div className="mt-5 border-t border-[#e6ede8] pt-4"><QualityPill verified={listing.quality_verified} grade={titleCase(listing.quality_grade)} /><p className="mt-2 text-xs leading-5 text-[#71867e]">{listing.quality_notes}</p></div></div></article>
        <div className="hidden items-center justify-center xl:flex"><div className="relative grid h-10 w-10 place-items-center rounded-full border border-[#cfe0d5] bg-white text-spruce shadow-sm"><ArrowRight size={20} /><span className="absolute -bottom-7 whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.1em] text-[#82968d]">structure</span></div></div>
        <article className="card overflow-hidden"><div className="bg-[#eaf6ef] p-5"><div className="flex items-center gap-2 text-spruce"><Bot size={17} /><span className="text-xs font-bold uppercase tracking-[0.14em]">AI analysis</span></div><h2 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-ink">Controlled material profile</h2><p className="mt-1 text-sm text-[#60776e]">Catalog-backed, user-reviewed fields.</p></div><div className="p-5"><div className="rounded-xl bg-[#f5f8f5] p-3"><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#7d9289]">Identified category</p><p className="mt-1 text-sm font-semibold text-ink">{material?.category || listing.category}</p></div><p className="mt-4 text-xs leading-5 text-[#637970]">{listing.raw_description}</p><div className="mt-4 flex items-center gap-2 rounded-xl border border-[#dce9e0] bg-white p-3"><MapPin size={16} className="shrink-0 text-spruce" /><div><p className="text-xs font-semibold text-ink">{listing.city} registered location</p><p className="text-[11px] text-[#70857e]">Sample city coordinate used for matching distance</p></div></div></div></article>
        <div className="hidden items-center justify-center xl:flex"><div className="relative grid h-10 w-10 place-items-center rounded-full border border-[#cfe0d5] bg-white text-spruce shadow-sm"><ArrowRight size={20} /><span className="absolute -bottom-7 whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.1em] text-[#82968d]">match</span></div></div>
        <article className="card overflow-hidden"><div className="bg-[#fff7e7] p-5"><div className="flex items-center gap-2 text-[#9a7423]"><Sparkles size={17} /><span className="text-xs font-bold uppercase tracking-[0.14em]">Potential industrial uses</span></div><h2 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-ink">Plausible downstream pathways</h2><p className="mt-1 text-sm text-[#6c7761]">Potential uses only; buyer suitability must be confirmed.</p></div><div className="space-y-3 p-5">{material?.uses.slice(0, 3).map((use, index) => <div key={use.id} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#fff5d9] text-xs font-bold text-[#9a7423]">0{index + 1}</span><div><p className="text-sm font-semibold text-ink">{use.title}</p><p className="mt-0.5 text-[11px] leading-4 text-[#718078]">{use.description}</p></div></div>)}</div></article>
      </section>

      <section className="overflow-hidden rounded-3xl bg-[#0c3931] p-6 text-white shadow-lift sm:flex sm:items-center sm:justify-between sm:p-7"><div><div className="flex items-center gap-2 text-mint"><Factory size={18} /><span className="text-xs font-bold uppercase tracking-[0.15em]">Deterministic matching engine</span></div><h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Ready to identify the most compatible buyers?</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#bdd9c9]">We will compare active buyer requirements against material compatibility, stated quality, quantity fit, distance, illustrative delivered cost and illustrative pathway benefit.</p></div><button className="btn-primary mt-5 !bg-mint !text-forest hover:!bg-white sm:mt-0" disabled={analyzing} onClick={() => void runMatch()}>{analyzing ? <Loader2 className="animate-spin" size={18} /> : <PackageSearch size={18} />}{analyzing ? 'Analyzing…' : 'Find best buyers'}<ArrowRight size={16} /></button></section>

      {analyzing ? <LoadingPanel label="Applying transparent compatibility gates and scoring active buyer requirements…" /> : results && (
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Top compatible buyers</p><h2 className="mt-1 section-title">Ranked circular pathways</h2><p className="mt-1 text-sm text-[#6c8179]">Material-compatible buyers are ranked transparently; every route now shows whether it is eligible, needs a sample, needs evidence, or is blocked.</p></div><StatusBadge>{results.length} compatible buyer{results.length === 1 ? '' : 's'}</StatusBadge></div>
          {results.length === 0 ? <EmptyPanel title="No compatible buyer passed the current gates" detail="Try adding a buyer requirement, adjusting a controlled catalog material, or reviewing location/quality details." action={<Link className="btn-primary" to="/buyer-requirements">Add buyer requirement</Link>} /> : <div className="space-y-4">{results.map((match, index) => <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }} key={match.id} className={`card card-interactive overflow-hidden ${index === 0 ? 'border-spruce ring-4 ring-mint/25' : ''}`}><div className="grid gap-5 p-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:p-6"><div className="flex items-center gap-3">{index === 0 && <span className="hidden rounded-full bg-[#e4f6ec] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-spruce sm:inline">Top match</span>}<ScoreRing score={match.total_score} size={88} /></div><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-xl font-semibold tracking-[-0.035em] text-ink">{match.buyer}</h3><span className={match.eligibility_status === 'eligible' ? 'badge-safe' : match.eligibility_status === 'blocked' ? 'badge-warn' : 'badge-neutral'}>{match.eligibility_label}</span>{index === 0 && <span className="badge-safe sm:hidden">Top match</span>}</div><p className="mt-1 text-sm text-[#6c8179]">{match.buyer_company?.city} · requires {formatKg(match.buyer_requirement?.minimum_quantity_kg_week || 0)}–{formatKg(match.buyer_requirement?.maximum_quantity_kg_week || 0)}/week</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-[#f5f8f5] p-3"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#7a9087]">Distance</p><p className="mt-1 text-sm font-semibold text-ink">{match.distance_km.toFixed(1)} km</p></div><div className="rounded-xl bg-[#f5f8f5] p-3"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#7a9087]">Potential use</p><p className="mt-1 text-sm font-semibold text-ink">{match.potential_use}</p></div><div className="rounded-xl bg-[#f5f8f5] p-3"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#7a9087]">Net value</p><p className="mt-1 text-sm font-semibold text-ink">{formatCurrency(match.estimated_net_value)}</p></div></div><div className="mt-3 rounded-xl border border-[#dce9e0] bg-white px-3 py-2 text-xs text-[#5f766d]"><strong className="text-ink">Next action:</strong> {match.next_action} · data completeness {Math.round(match.data_completeness_score)}%</div></div><div className="flex flex-col items-stretch gap-2 sm:w-[170px]"><Link className="btn-primary" to={`/matches/${match.id}`}>View match<ArrowRight size={15} /></Link><Link className="btn-secondary !py-2.5" to={`/map?match=${match.id}`}><Route size={15} />View route</Link></div></div><div className="border-t border-[#e6eee8] bg-[#fbfdfb] px-5 py-4 sm:px-6"><div className="grid gap-3 md:grid-cols-3">{[['Material', match.material_score], ['Quality', match.quality_score], ['Quantity', match.quantity_score], ['Distance', match.distance_score], ['Price', match.price_score], ['Environment', match.environment_score]].map(([label, score]) => <ScoreBar key={String(label)} label={String(label)} score={Number(score)} />)}</div>{match.flags.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{match.flags.map((flag) => <span key={flag} className="badge-warn">{flag}</span>)}</div>}</div></motion.article>)}</div>}
        </section>
      )}
    </div>
  )
}
