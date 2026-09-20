import { Link } from 'react-router-dom'
import { ArrowRight, Factory, MapPin, PackageSearch, PlusCircle, Recycle, SlidersHorizontal } from 'lucide-react'
import { get } from '../lib/api'
import { formatCurrency, formatKg, titleCase } from '../lib/format'
import { useAsync } from '../hooks/useAsync'
import type { Listing, Role } from '../types'
import { StatusBadge, EmptyPanel, ErrorPanel, PageSkeleton, PageHeader, QualityPill, Breadcrumb } from '../components/ui'
import { MaterialThumbnail } from '../lib/materialImages'

export function ListingsPage({ role }: { role: Role }) {
  const mine = role === 'generator'
  const listings = useAsync(
    () => get<Listing[]>(`/api/listings?${mine ? 'mine=true&' : ''}active_only=true`).then((response) => response.data),
    [mine],
  )
  const generator = role === 'generator'
  const title = generator ? 'My Waste Listings' : 'Supply Opportunities'
  const description = generator
    ? 'Review the waste streams your company has published, then run deterministic buyer matching.'
    : 'Explore active secondary material supply streams and review compatibility.'

  if (listings.loading) return <PageSkeleton />
  if (listings.error || !listings.data) return <ErrorPanel error={listings.error || 'Listings unavailable.'} onRetry={() => void listings.reload()} />

  return (
    <div className="space-y-7 animate-fade-in-up">
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/' },
        { label: 'Lots' }
      ]} />
      <PageHeader
        eyebrow={generator ? 'Seller workspace' : 'Buyer discovery'}
        title={title}
        description={description}
        actions={generator ? <Link className="btn-primary rounded-xl" to="/list-waste"><PlusCircle size={17} />List my waste</Link> : <Link className="btn-primary rounded-xl" to="/buyer-requirements"><Factory size={17} />Set Requirement</Link>}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-[#61776f]">
          <SlidersHorizontal size={16} className="text-spruce" />
          <span className="font-medium text-[13.5px]">{generator ? 'My active listings' : 'Available material streams'}</span>
        </div>
        <StatusBadge>{listings.data.length} active listing{listings.data.length === 1 ? '' : 's'}</StatusBadge>
      </div>
      {listings.data.length === 0 ? (
        <EmptyPanel
          title="No active listing yet"
          detail="Publish a waste stream to see it as a structured secondary-material opportunity."
          action={<Link className="btn-primary rounded-xl" to="/list-waste"><Recycle size={16} />Create listing</Link>}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {listings.data.map((listing) => (
            <article
              key={listing.id}
              className="card card-interactive lift-hover shine-wrap flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm transition-all duration-300"
            >
              <div className="flex items-start justify-between bg-[#edf7f0] p-5 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <MaterialThumbnail
                    material={listing.material}
                    category={listing.category}
                    sizeClassName="h-12 w-12 shrink-0"
                    className="shadow-sm"
                  />
                  <div className="min-w-0">
                    <span className="eyebrow truncate block text-[10.5px] font-bold tracking-[0.14em] text-emerald-800">{listing.category}</span>
                    <h2 className="mt-1 text-[18px] font-bold tracking-tight text-ink truncate">{listing.material}</h2>
                  </div>
                </div>
                <div className="shrink-0 rounded-xl bg-white px-3.5 py-2 text-right shadow-sm border border-emerald-100/60">
                  <p className="text-[18px] font-extrabold tracking-tight text-spruce">{formatKg(listing.normalized_kg_per_week)}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#759087]">per week</p>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="line-clamp-2 text-[13.5px] leading-relaxed text-[#637970]">{listing.raw_description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <QualityPill verified={listing.quality_verified} grade={titleCase(listing.quality_grade)} />
                  <span className="badge-safe text-[11px] font-semibold py-1 px-3 rounded-full flex items-center">
                    <MapPin className="mr-1" size={13} />{listing.city}
                  </span>
                  <span className={`text-[11px] font-semibold py-1 px-3 rounded-full ${listing.passport.status === 'sample_ready' || listing.passport.status === 'buyer_ready' ? 'badge-safe' : 'badge-warn'}`}>
                    {titleCase(listing.passport.status)} · {Math.round(listing.passport.score)}%
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 border-y border-[#e7eee9] py-3.5 text-[13px]">
                  <div>
                    <span className="block text-[11.5px] font-medium text-[#7d9189]">Availability</span>
                    <strong className="mt-0.5 block font-semibold text-ink text-[13.5px] leading-snug">{listing.availability}</strong>
                  </div>
                  <div>
                    <span className="block text-[11.5px] font-medium text-[#7d9189]">Listed at</span>
                    <strong className="mt-0.5 block font-semibold text-ink text-[13.5px] leading-snug">{formatCurrency(listing.asking_price_per_kg)}/kg</strong>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[12px] text-[#728780]">
                  <span className="font-medium">{listing.company}</span>
                  <span>{listing.source === 'ai_assisted' ? 'AI-assisted draft' : 'Manual record'}</span>
                </div>
                <div className={`mt-5 grid gap-2.5 ${generator ? 'sm:grid-cols-2' : ''}`}>
                  <Link className="btn-secondary rounded-xl w-full !py-2.5 text-[13px] font-medium text-center" to={`/listings/${listing.id}/passport`}>
                    Material Passport
                  </Link>
                  {generator && (
                    <Link className="btn-primary rounded-xl w-full text-[13px] font-semibold justify-center" to={`/listings/${listing.id}/matches`}>
                      <PackageSearch size={16} />Find buyers<ArrowRight size={15} />
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
