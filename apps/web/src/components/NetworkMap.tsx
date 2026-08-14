import { useEffect } from 'react'
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import { MapPinned, Route as RouteIcon } from 'lucide-react'
import type { MapPoint, MapRoute } from '../types'
import { formatKg } from '../lib/format'
import { DemoBadge } from './ui'

const colorForType: Record<string, string> = {
  generator: '#12645b',
  buyer: '#c08a37',
  recycler: '#c08a37',
  processor: '#6e8ea2',
}

function FitRoute({ route }: { route?: MapRoute | null }) {
  const map = useMap()
  useEffect(() => {
    if (!route) return
    map.fitBounds(
      [
        [route.from.latitude, route.from.longitude],
        [route.to.latitude, route.to.longitude],
      ],
      { padding: [42, 42], maxZoom: 10 },
    )
  }, [map, route])
  return null
}

export function NetworkMap({
  points,
  route,
  className = '',
  compact = false,
}: {
  points: MapPoint[]
  route?: MapRoute | null
  className?: string
  compact?: boolean
}) {
  return (
    <div className={`card overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-4 border-b border-[#dce9e0] bg-gradient-to-r from-[#fbfefb] via-white to-[#edf8f1] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e2f5e9] text-spruce shadow-sm"><MapPinned size={18} /></span>
          <div>
            <p className="text-sm font-semibold text-ink">Delhi NCR material network</p>
            <p className="mt-0.5 text-[11px] text-[#70857d]">Sample locations only — not live GPS or dispatch routing.</p>
          </div>
        </div>
        {!compact && <DemoBadge>sample map</DemoBadge>}
      </div>
      <div className="relative">
        <MapContainer center={[28.6139, 77.2090]} zoom={9} scrollWheelZoom={false} className="h-[360px] w-full sm:h-[430px]">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitRoute route={route} />
          {points.map((point) => {
            const color = colorForType[point.company_type] || '#12645b'
            const material = point.listings[0]?.material || point.requirements[0]?.material || 'Material profile'
            const quantity = point.listings[0]?.normalized_kg_per_week
            return (
              <CircleMarker
                key={point.id}
                center={[point.latitude, point.longitude]}
                radius={point.company_type === 'generator' ? 9 : 8}
                pathOptions={{ color: '#ffffff', weight: 2.5, fillColor: color, fillOpacity: 0.97 }}
              >
                <Popup>
                  <div className="min-w-[180px] p-1 font-sans text-[#12312d]">
                    <p className="font-semibold">{point.name}</p>
                    <p className="mt-0.5 text-xs text-[#6b8179]">{point.company_type === 'generator' ? 'Waste generator' : 'Buyer / processor'} · {point.city}</p>
                    <div className="mt-3 rounded-lg bg-[#f3f7f4] p-2 text-xs">
                      <p className="font-medium">{material}</p>
                      {quantity ? <p className="mt-1 text-[#5c726a]">{formatKg(quantity)}/week</p> : <p className="mt-1 text-[#5c726a]">Active requirement</p>}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
          {route && (
            <>
              <CircleMarker center={[route.from.latitude, route.from.longitude]} radius={10} pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#12645b', fillOpacity: 1 }}>
                <Popup>{route.from.name || route.from.company} · generator</Popup>
              </CircleMarker>
              <CircleMarker center={[route.to.latitude, route.to.longitude]} radius={10} pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#c08a37', fillOpacity: 1 }}>
                <Popup>{route.to.name || route.to.company} · buyer</Popup>
              </CircleMarker>
              <Polyline positions={[[route.from.latitude, route.from.longitude], [route.to.latitude, route.to.longitude]]} pathOptions={{ color: '#12645b', weight: 3.5, dashArray: '8, 10', opacity: 0.92 }} />
            </>
          )}
        </MapContainer>
        <div className="pointer-events-none absolute bottom-4 left-4 z-[500] hidden rounded-xl border border-white/70 bg-white/90 px-3 py-2 shadow-lg backdrop-blur sm:block">
          <div className="flex items-center gap-3 text-[10px] font-semibold text-[#58736a]"><span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-spruce shadow-sm" />Generators</span><span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#c08a37] shadow-sm" />Buyers</span></div>
        </div>
      </div>
      {route && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#dbe8df] bg-[#fbfefb] px-5 py-3.5 text-xs">
          <span className="inline-flex items-center gap-2 font-semibold text-ink"><RouteIcon size={15} className="text-spruce" />Selected potential route · {route.from.city} → {route.to.city}</span>
          <span className="rounded-full border border-[#cbe7d7] bg-[#ebf8f0] px-2.5 py-1 font-semibold text-spruce">{route.distance_km.toFixed(1)} km · demo distance</span>
        </div>
      )}
    </div>
  )
}
