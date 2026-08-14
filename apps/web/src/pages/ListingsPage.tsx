import { Link } from 'react-router-dom'
import { ArrowRight, Factory, MapPin, PackageSearch, PlusCircle, Recycle, SlidersHorizontal } from 'lucide-react'
import { get } from '../lib/api'
import { formatCurrency, formatKg, titleCase } from '../lib/format'
import { useAsync } from '../hooks/useAsync'
import type { Listing, Role } from '../types'
import { DemoBadge, Disclosure, EmptyPanel, ErrorPanel, LoadingPanel, PageHeader, QualityPill } from '../components/ui'

export function ListingsPage({ role }: { role: Role }) {
  const mine = role === 'generator'
  const listings = useAsync(
    () => get<Listing[]>(`/api/listings?${mine ? 'mine=true&' : ''}active_only=true`).then((response) => response.data),
    [mine],
  )
  const generator = role === 'generator'
  const title = generator ? 'My material listings' : 'Supply opportunities'
  const description = generator
    ? 'Review the waste streams your company has published, then run deterministic buyer matching.'
    : 'Explore active secondary material supply streams and review compatibility.'

  if (listings.loading) return <LoadingPanel label="Loading material listings…" />
  if (listings.error || !listings.data) return <ErrorPanel error={listings.error || 'Listings unavailable.'} onRetry={() => void listings.reload()} />

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow={generator ? 'Generator workspace' : 'Buyer discovery'}
        title={title}
        description={description}
        actions={generator ? <Link className="btn-primary" to="/list-waste"><PlusCircle size={17} />List my waste</Link> : <Link className="btn-primary" to="/buyer-requirements"><Factory size={17} />Set a requirement</Link>}
      />
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm text-[#61776f]"><SlidersHorizontal size={16} className="text-spruce" /><span>{generator ? 'My active listings' : 'Available material streams'}</span></div><DemoBadge>{listings.data.length} active listing{listings.data.length === 1 ? '' : 's'}</DemoBadge></div>
      {listings.data.length === 0 ? <EmptyPanel title="No active listing yet" detail="Publish a waste stream to see it as a structured secondary-material opportunity." action={<Link className="btn-primary" to="/list-waste"><Recycle size={16} />Create listing</Link>} /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{listings.data.map((listing) => <article key={listing.id} className="card card-interactive flex flex-col overflow-hidden"><div className="flex items-start justify-between bg-[#edf7f0] p-5"><div><span className="eyebrow">{listing.category}</span><h2 className="mt-2 text-xl font-semibold tracking-[-0.035em] text-ink">{listing.material}</h2></div><div className="rounded-xl bg-white px-3 py-2 text-right shadow-sm"><p className="text-lg font-bold tracking-[-0.05em] text-spruce">{formatKg(listing.normalized_kg_per_week)}</p><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#759087]">per week</p></div></div><div className="flex flex-1 flex-col p-5"><p className="line-clamp-2 text-sm leading-6 text-[#637970]">{listing.raw_description}</p><div className="mt-5 flex flex-wrap gap-2"><QualityPill verified={listing.quality_verified} grade={titleCase(listing.quality_grade)} /><span className="badge-safe"><MapPin className="mr-1" size={13} />{listing.city}</span><span className={listing.passport.status === 'sample_ready' || listing.passport.status === 'buyer_ready' ? 'badge-safe' : 'badge-warn'}>{titleCase(listing.passport.status)} · {listing.passport.score}%</span></div><div className="mt-5 grid grid-cols-2 gap-3 border-y border-[#e7eee9] py-4 text-xs"><div><span className="block text-[#7d9189]">Availability</span><strong className="mt-1 block leading-5 text-ink">{listing.availability}</strong></div><div><span className="block text-[#7d9189]">Listed at</span><strong className="mt-1 block leading-5 text-ink">{formatCurrency(listing.asking_price_per_kg)}/kg</strong></div></div><div className="mt-5 flex items-center justify-between text-xs text-[#728780]"><span>{listing.company}</span><span>{listing.source === 'ai_assisted' ? 'AI-assisted draft' : 'Manual record'}</span></div><div className="mt-5 grid gap-2 sm:grid-cols-2"><Link className="btn-secondary w-full !py-2.5" to={`/listings/${listing.id}/passport`}>Material Passport</Link><Link className="btn-primary w-full" to={`/listings/${listing.id}/matches`}><PackageSearch size={16} />{generator ? 'Find buyers' : 'View buyers'}<ArrowRight size={15} /></Link></div></div></article>)}</div>}
    </div>
  )
}
