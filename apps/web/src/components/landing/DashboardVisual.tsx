import React, { useState, useEffect } from 'react';
import { 
  Leaf, Home, Package, BarChart3, FileText, Bell, Settings, 
  Search, Command, SlidersHorizontal, CheckCircle2, MapPin, ArrowRight 
} from 'lucide-react';
import { cn } from '../../lib/utils';

// We map materials to some nice unsplash images
const MATERIAL_IMAGES: Record<string, string> = {
  "PET": "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=120&h=120&fit=crop",
  "AL": "https://images.unsplash.com/photo-1605557202138-cdcd99c4d6c2?w=120&h=120&fit=crop",
  "WD": "https://images.unsplash.com/photo-1601057282102-c0d20c5b8b37?w=120&h=120&fit=crop"
};

interface MaterialListing {
  id: string;
  name: string;
  code: string;
  spec: string;
  qty: string;
  price: string;
  priceUnit: string;
  loc: string;
  dist: string;
  match: number;
}

export default function DashboardVisual() {
  const [activeTab, setActiveTab] = useState<string>('All materials');
  const tabs = ['All materials', 'Plastics', 'Metals', 'Wood & Biomass', 'Textiles', 'Chemicals'];

  const [rows, setRows] = useState<MaterialListing[]>([]);
  const [liveCount, setLiveCount] = useState<number | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch('/api/listings?active_only=true', { signal: ctrl.signal })
      .then(r => r.json())
      .then((data: any[]) => {
        setLiveCount(data.length);
        const mapped = data.slice(0, 3).map((l: any) => {
          let code = "WD";
          const lower = (l.material_name || "").toLowerCase();
          if (lower.includes("pet") || lower.includes("plastic")) code = "PET";
          if (lower.includes("al") || lower.includes("metal") || lower.includes("aluminium")) code = "AL";

          return {
            id: l.id,
            name: l.material_name,
            code,
            spec: l.condition || "Sorted, clean",
            qty: `${l.quantity} ${l.unit}`,
            price: `₹${l.price_per_unit}`,
            priceUnit: `/ ${l.unit}`,
            loc: l.location,
            dist: "Verified Network",
            match: l.match_score || Math.floor(Math.random() * 10) + 85,
          };
        });
        setRows(mapped);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  // Fallback rows if API fails or is empty
  const displayRows = rows.length > 0 ? rows : [
    {
      id: '1',
      name: 'PET Plastic Flakes',
      code: 'PET',
      spec: 'Post-industrial · Food grade',
      qty: '5,000 kg',
      price: '₹48',
      priceUnit: '/ kg',
      loc: 'Noida, UP',
      dist: '12 km away',
      match: 96,
    },
    {
      id: '2',
      name: 'Aluminium Scrap',
      code: 'AL',
      spec: '6061 alloy · Sorted, clean',
      qty: '2,400 kg',
      price: '₹172',
      priceUnit: '/ kg',
      loc: 'Delhi NCR',
      dist: '8 km away',
      match: 91,
    },
    {
      id: '3',
      name: 'Wood Waste',
      code: 'WD',
      spec: 'Pallet offcuts · Untreated',
      qty: '8,000 kg',
      price: '₹9',
      priceUnit: '/ kg',
      loc: 'Gurugram, HR',
      dist: '18 km away',
      match: 88,
    },
  ];

  return (
    <div className="flex bg-white h-full">
      <aside className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r border-slate-100 bg-white py-4 sm:flex">
        <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white">
          <Leaf className="h-4 w-4" />
        </div>
        {[
          { icon: Home, active: false },
          { icon: Package, active: true },
          { icon: BarChart3, active: false },
          { icon: FileText, active: false },
          { icon: Bell, active: false },
          { icon: Settings, active: false },
        ].map((it, i) => (
          <button
            key={i}
            className={cn(
              "group mt-1 flex h-9 w-9 animate-fade-in-right items-center justify-center rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-md",
              it.active
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                : 'text-slate-400 hover:bg-slate-50 hover:text-emerald-600'
            )}
            style={{ animationDelay: `${0.4 + i * 0.05}s` }}
          >
            <it.icon className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12" />
          </button>
        ))}
      </aside>

      <div className="min-w-0 flex-1 px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold tracking-widest text-emerald-700 transition-colors hover:bg-emerald-700 hover:text-white">
            MARKETPLACE
          </span>
          <div className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-soft-ping rounded-full bg-emerald-500/70" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </div>
        </div>

        <h3 className="mt-2 text-xl font-bold text-slate-900 transition-colors hover:text-emerald-700">
          Available materials
        </h3>
        <p className="text-xs text-slate-500">Discover, connect and trade with verified recyclers</p>

        <div className="mt-4 flex items-center gap-2">
          <div className="group flex h-10 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 ring-1 ring-slate-100 transition-all duration-300 focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-200">
            <Search className="h-4 w-4 text-slate-400 transition-colors group-focus-within:text-emerald-600" />
            <input
              placeholder="Search materials, grades or locations…"
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
            <span className="hidden items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 sm:flex">
              <Command className="h-3 w-3" /> K
            </span>
          </div>
          <button className="group flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-all duration-300 hover:scale-105 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-md">
            <SlidersHorizontal className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
            Filters
            <span className="flex h-4 min-w-4 animate-heartbeat items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
              2
            </span>
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{ animationDelay: `${0.3 + i * 0.05}s` }}
              className={cn(
                "group relative whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 animate-fade-in-up hover:scale-105 active:scale-95",
                activeTab === t
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-emerald-300 hover:text-emerald-700'
              )}
            >
              {t}
              {activeTab === t && (
                <span className="absolute inset-0 -z-10 animate-shimmer rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
          <div className="grid grid-cols-12 gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <div className="col-span-5 transition-colors hover:text-emerald-600">Material</div>
            <div className="col-span-2 text-right transition-colors hover:text-emerald-600">Qty / Price</div>
            <div className="col-span-3 transition-colors hover:text-emerald-600">Location</div>
            <div className="col-span-2 text-right transition-colors hover:text-emerald-600">Match</div>
          </div>

          {displayRows.map((r, i) => (
            <div
              key={r.id || i}
              className="group grid grid-cols-12 animate-slide-up-fade cursor-pointer items-center gap-2 border-b border-slate-50 px-4 py-3 transition-all duration-300 hover:bg-emerald-50/40 hover:pl-6"
              style={{ animationDelay: `${0.4 + i * 0.06}s` }}
            >
              <div className="col-span-5 flex items-center gap-3 min-w-0">
                <img
                  src={MATERIAL_IMAGES[r.code] || MATERIAL_IMAGES.WD}
                  alt=""
                  className="h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-slate-100 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-semibold text-slate-900">{r.name}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100 transition-all duration-300 group-hover:bg-emerald-700 group-hover:text-white">
                      <CheckCircle2 className="h-2.5 w-2.5 transition-transform group-hover:rotate-180" />
                      Verified
                    </span>
                    <span className="truncate text-[11px] text-slate-500">{r.spec}</span>
                  </div>
                </div>
              </div>

              <div className="col-span-2 text-right">
                <div className="text-sm font-bold text-slate-900">{r.qty}</div>
                <div className="text-[11px] text-slate-500">
                  {r.price} <span className="text-slate-400">{r.priceUnit}</span>
                </div>
              </div>

              <div className="col-span-3">
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
                  <MapPin className="h-3 w-3 text-emerald-500" /> {r.loc}
                </div>
                <div className="text-[11px] text-slate-400">{r.dist}</div>
              </div>

              <div className="col-span-2 flex items-center justify-end gap-2">
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100 transition-all duration-300 group-hover:bg-emerald-700 group-hover:text-white group-hover:scale-110">
                  {r.match}%
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-emerald-600 group-hover:animate-magnetic" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
