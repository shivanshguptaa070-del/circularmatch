import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Factory, MapPin, Recycle, Route, Truck } from 'lucide-react'
import { get } from '../lib/api'
import { formatKg } from '../lib/format'
import { useAsync } from '../hooks/useAsync'
import type { MapPoint, MapRoute } from '../types'
import { NetworkMap } from '../components/NetworkMap'
import { StatusBadge, ErrorPanel, PageSkeleton, PageHeader } from '../components/ui'

export function MapPage() {
  const [params] = useSearchParams()
  const matchId = params.get('match')
  const map = useAsync(
    () => get<{ center: { latitude: number; longitude: number; label: string }; points: MapPoint[]; selected_route: MapRoute | null; label: string }>(`/api/map/points${matchId ? `?match_id=${matchId}` : ''}`).then((response) => response.data),
    [matchId],
  )

  if (map.loading) return <PageSkeleton />
  if (map.error || !map.data) return <ErrorPanel error={map.error || 'Map data unavailable.'} onRetry={() => void map.reload()} />
  const data = map.data
  const generators = data.points.filter((point) => point.company_type === 'generator')
  const buyers = data.points.filter((point) => point.company_type !== 'generator')

  return (
    <div className="space-y-7 animate-fade-in-up">
      <PageHeader
        eyebrow="Network map"
        title="Regional material network"
        description="Explore verified generator and buyer locations. Track distance and logistics pathways across active circular routes."
        actions={<StatusBadge>Active Network</StatusBadge>}
      />
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm">
          <NetworkMap points={data.points} route={data.selected_route} />
        </div>
        <aside className="card rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm lift-hover">
          <p className="eyebrow text-[10.5px] font-bold tracking-[0.14em] text-emerald-800">Network legend</p>
          <h2 className="mt-1.5 text-[20px] font-bold tracking-tight text-ink">Material discovery points</h2>
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white bg-spruce shadow" />
              <div>
                <p className="text-[14px] font-semibold text-ink">Waste generators</p>
                <p className="text-[12.5px] text-[#6f857d]">{generators.length} company location{generators.length === 1 ? '' : 's'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white bg-[#c08a37] shadow" />
              <div>
                <p className="text-[14px] font-semibold text-ink">Buyers & processors</p>
                <p className="text-[12.5px] text-[#6f857d]">{buyers.length} sample demand point{buyers.length === 1 ? '' : 's'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-0 w-8 border-t-2 border-dashed border-spruce" />
              <div>
                <p className="text-[14px] font-semibold text-ink">Potential route</p>
                <p className="text-[12.5px] text-[#6f857d]">Shown only after a match is selected</p>
              </div>
            </div>
          </div>
          {data.selected_route ? (
            <div className="mt-7 rounded-2xl border border-emerald-200/80 bg-[#edf7f0] p-4.5 animate-scale-in">
              <div className="flex items-center gap-2 text-spruce">
                <Route size={16} />
                <span className="text-[11px] font-bold uppercase tracking-[0.1em]">Selected match route</span>
              </div>
              <p className="mt-2.5 text-[14.5px] font-bold text-ink">{data.selected_route.from.city} → {data.selected_route.to.city}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-[#607770]">
                {data.selected_route.distance_km.toFixed(1)} km calculated distance{data.selected_route.match_score ? ` · ${Math.round(data.selected_route.match_score)}% match score` : ''}
              </p>
            </div>
          ) : (
            <div className="mt-7 rounded-2xl bg-[#f5f8f5] p-4 text-[13px] leading-relaxed text-[#657b72] border border-slate-100">
              Open a buyer match and select <strong>View route</strong> to place a potential circular pathway on this map.
            </div>
          )}
        </aside>
      </section>
      <section className="grid gap-5 lg:grid-cols-2">
        <article className="card rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm lift-hover">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-spruce">
              <Recycle size={18} />
            </div>
            <div>
              <p className="eyebrow text-[10.5px] font-bold tracking-[0.14em] text-emerald-800">Generator locations</p>
              <h2 className="text-[18px] font-bold tracking-tight text-ink">Published material streams</h2>
            </div>
          </div>
          <div className="mt-5 divide-y divide-[#e5ede7]">
            {generators.length ? (
              generators.map((point) => (
                <div key={point.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0">
                  <div>
                    <p className="font-semibold text-ink text-[14px]">{point.name}</p>
                    <p className="mt-1 text-[12.5px] text-[#70857e]">
                      <MapPin className="mr-1 inline text-spruce" size={13} />{point.city} · {point.listings[0]?.material || 'No active material'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-bold text-ink">{formatKg(point.listings[0]?.normalized_kg_per_week || 0)}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#81968d]">per week</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-[#6d847b]">No active material streams published yet.</div>
            )}
          </div>
        </article>
        <article className="card rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm lift-hover">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-[#a47a25]">
              <Factory size={18} />
            </div>
            <div>
              <p className="eyebrow text-[10.5px] font-bold tracking-[0.14em] text-amber-800">Buyer locations</p>
              <h2 className="text-[18px] font-bold tracking-tight text-ink">Active demand signals</h2>
            </div>
          </div>
          <div className="mt-5 divide-y divide-[#e5ede7]">
            {buyers.length ? (
              buyers.map((point) => (
                <div key={point.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0">
                  <div>
                    <p className="font-semibold text-ink text-[14px]">{point.name}</p>
                    <p className="mt-1 text-[12.5px] text-[#70857e]">
                      <MapPin className="mr-1 inline text-[#a47a25]" size={13} />{point.city} · {point.requirements[0]?.material || 'No active requirement'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#fff7e7] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#98701f] border border-amber-200/60">
                    {point.company_type}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-[#6d847b]">No active buyer requirements posted yet.</div>
            )}
          </div>
        </article>
      </section>
      <section className="rounded-3xl border border-[#d9e7dd] bg-[#f6fbf7] p-6 sm:flex sm:items-center sm:justify-between sm:p-7 lift-hover shine-wrap">
        <div>
          <p className="eyebrow text-[10.5px] font-bold tracking-[0.14em] text-emerald-800">Next step</p>
          <h2 className="mt-1.5 text-[20px] font-bold tracking-tight text-ink">Pair a location with a transparent material match.</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[#647a71]">Map visibility is helpful only after the material, quality, quantity and logistics rules have been made explicit.</p>
        </div>
        <Link className="btn-primary rounded-xl mt-5 sm:mt-0 font-semibold" to="/listings">
          <Truck size={16} />Explore listings<ArrowRight size={16} />
        </Link>
      </section>
    </div>
  )
}
