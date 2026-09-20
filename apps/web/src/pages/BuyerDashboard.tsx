import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  CheckCircle2,
  IndianRupee,
  ArrowRight,
  ArrowUpRight,
  MapPin,
  SlidersHorizontal,
  Search,
  Plus,
  TrendingUp,
  Sparkles,
  Target,
  PackageSearch,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { get } from '../lib/api'
import { formatCurrency, formatKg, formatNumber } from '../lib/format'
import { getMaterialImage, MaterialThumbnail } from '../lib/materialImages'
import type { BuyerDashboardSummary, BuyerRequirement } from '../types'

interface SourcingTargetItem {
  id: string
  title: string
  spec: string
  qty: string
  loc: string
  maxPrice: string
  status: 'Matching' | 'Sourced' | 'Active'
  matchesCount: number
  img: string
}

const DEFAULT_TARGETS: SourcingTargetItem[] = [
  {
    id: '1',
    title: 'PET Plastic Flakes',
    spec: 'MFI 0.3 - 0.8 · Blow molding grade',
    qty: '3,000 kg / wk',
    loc: 'North India (Delhi / NCR)',
    maxPrice: 'Max ₹48/kg',
    status: 'Matching',
    matchesCount: 3,
    img: '/materials/pet-flakes.jpg',
  },
  {
    id: '2',
    title: 'Aluminium 6061 Extrusions',
    spec: 'Clean cutoffs · Unpainted',
    qty: '1,500 kg / wk',
    loc: 'Manesar, HR',
    maxPrice: 'Max ₹175/kg',
    status: 'Active',
    matchesCount: 1,
    img: '/materials/al-scrap.jpg',
  },
  {
    id: '3',
    title: 'Corrugated Box Offcuts',
    spec: 'Kraft paper grade · Dry baled',
    qty: '4,000 kg / wk',
    loc: 'Faridabad, HR',
    maxPrice: 'Max ₹12/kg',
    status: 'Sourced',
    matchesCount: 4,
    img: '/materials/cardboard-paper.jpg',
  },
  {
    id: '4',
    title: 'Mild-Steel Fabrication Scrap',
    spec: 'Clean offcuts · Low contaminant',
    qty: '3,000 kg / wk',
    loc: 'Noida, UP',
    maxPrice: 'Max ₹14/kg',
    status: 'Active',
    matchesCount: 2,
    img: '/materials/mild-steel.jpg',
  },
  {
    id: '5',
    title: 'Cotton Textile Cutting Waste',
    spec: 'Garment cuttings · 100% Cotton',
    qty: '600 kg / wk',
    loc: 'Noida, UP',
    maxPrice: 'Max ₹25/kg',
    status: 'Matching',
    matchesCount: 3,
    img: '/materials/cotton-textile.jpg',
  },
]

export function BuyerDashboard() {
  const [timeframe, setTimeframe] = useState<'Month' | 'Quarter' | 'Year'>('Month')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data } = useQuery({
    queryKey: ['dashboard_summary', 'buyer'],
    queryFn: () => get<BuyerDashboardSummary>('/api/dashboard/summary').then((r) => r.data),
    refetchInterval: 60_000,
  })

  const { data: realRequirementsData } = useQuery({
    queryKey: ['buyer_requirements', 'mine'],
    queryFn: () => get<BuyerRequirement[]>('/api/buyer-requirements').then((r) => r.data).catch(() => null),
    refetchInterval: 60_000,
  })

  // Dynamic values backed by live API with polished fallbacks
  const buyTarget = data?.kpis?.total_procurement_target_kg_week
    ? `${formatKg(data.kpis.total_procurement_target_kg_week)}`
    : '4,500 kg'
  const activeSuppliers = data?.kpis?.active_seller_matches !== undefined
    ? formatNumber(data.kpis.active_seller_matches)
    : '12'
  const successfulBuys = data?.kpis?.successful_purchases !== undefined
    ? formatNumber(data.kpis.successful_purchases)
    : '8'
  const costSavings = data?.kpis?.estimated_cost_savings_inr
    ? formatCurrency(data.kpis.estimated_cost_savings_inr)
    : '₹142,000'

  const baseTargets: SourcingTargetItem[] = (realRequirementsData && realRequirementsData.length > 0)
    ? realRequirementsData.map((r, idx) => ({
        id: r.id || String(idx),
        title: r.material || 'Procurement Target',
        spec: `${r.category || 'Secondary Material'} · Min grade ${r.minimum_quality_grade || 'Standard'}`,
        qty: `${formatKg(r.maximum_quantity_kg_week || r.minimum_quantity_kg_week || 0)} / wk`,
        loc: r.city || 'Regional (NCR)',
        maxPrice: r.target_price_per_kg ? `Max ₹${r.target_price_per_kg}/kg` : 'Negotiable',
        status: (r.status === 'fulfilled' ? 'Sourced' : r.status === 'matched' ? 'Matching' : 'Active') as 'Matching' | 'Sourced' | 'Active',
        matchesCount: 2,
        img: getMaterialImage(r.material, r.category),
      }))
    : DEFAULT_TARGETS

  const filteredTargets = baseTargets.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.spec.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.loc.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Breadcrumb />
      <DashboardHeader />
      <StatsGrid
        buyTarget={buyTarget}
        activeSuppliers={activeSuppliers}
        successfulBuys={successfulBuys}
        costSavings={costSavings}
      />
      <ChartsRow
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        categoryData={data?.charts?.procurement_by_category}
      />
      <ActivityRow
        targets={filteredTargets}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
    </div>
  )
}

/* ============================================================ */
/*  Breadcrumb                                                  */
/* ============================================================ */
function Breadcrumb() {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-[12px] text-slate-500"
    >
      <Link to="/dashboard" className="transition hover:text-emerald-700">Workspace</Link>
      <span className="text-slate-300">/</span>
      <span className="text-slate-600">Buy</span>
      <span className="text-slate-300">/</span>
      <span className="font-semibold text-slate-800">Dashboard</span>
    </nav>
  );
}

/* ============================================================ */
/*  Dashboard Header                                            */
/* ============================================================ */
function DashboardHeader() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-2">
      <div>
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50/70 px-3 py-1 text-[11px] font-bold tracking-[0.16em] text-emerald-700 backdrop-blur">
          <Sparkles className="h-3 w-3 text-emerald-500" />
          BUYER WORKSPACE
        </div>
        <h1 className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-[32px] font-extrabold leading-tight tracking-tight text-transparent">
          Buy Dashboard
        </h1>
        <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-slate-500">
          Track your secondary material requirements, active supplier matches, and cost savings pipeline across{' '}
          <span className="font-semibold text-slate-700">all your procurement targets</span>.
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <button className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700 shadow-sm lift-hover">
          Last 30 days
        </button>
        <Link
          to="/buyer-requirements"
          className="group inline-flex h-10 items-center gap-1.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-4 text-[13px] font-semibold text-white shadow-lg shadow-slate-900/25 transition hover:-translate-y-0.5 hover:shadow-emerald-500/20 hover:shadow-xl"
        >
          <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
          Set a sourcing target
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

/* ============================================================ */
/*  Stats Grid                                                  */
/* ============================================================ */
interface StatsGridProps {
  buyTarget: string
  activeSuppliers: string
  successfulBuys: string
  costSavings: string
}

function StatsGrid({ buyTarget, activeSuppliers, successfulBuys, costSavings }: StatsGridProps) {
  const stats = [
    {
      icon: Target,
      label: 'Buy Target',
      value: buyTarget,
      unit: '/ wk',
      delta: '+15.8%',
      sub: 'Total requested volume',
      accent: 'emerald',
      chart: (
        <svg viewBox="0 0 120 36" className="h-10 w-full" aria-hidden="true">
          <defs>
            <linearGradient id="c1" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="1" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 28 L20 22 L40 24 L60 12 L80 16 L100 6 L120 8 L120 36 L0 36 Z" fill="url(#c1)" />
          <path d="M0 28 L20 22 L40 24 L60 12 L80 16 L100 6 L120 8" stroke="#10b981" strokeWidth="1.75" fill="none" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx="100" cy="6" r="3" fill="#10b981" stroke="white" strokeWidth="2" />
        </svg>
      ),
    },
    {
      icon: Users,
      label: 'Active Suppliers',
      value: activeSuppliers,
      unit: '',
      delta: '+2',
      sub: 'Matching your specifications',
      accent: 'sky',
      chart: (
        <svg viewBox="0 0 120 36" className="h-10 w-full" aria-hidden="true">
          <defs>
            <linearGradient id="c2" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#0ea5e9" stopOpacity="0.35" />
              <stop offset="1" stopColor="#0ea5e9" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 26 Q 30 28 60 22 T 120 16" stroke="#0ea5e9" strokeWidth="1.5" fill="none" strokeDasharray="3,3" opacity="0.4" />
          <circle cx="58" cy="18" r="5" fill="url(#c2)" />
          <circle cx="78" cy="18" r="6" fill="url(#c2)" />
          <circle cx="98" cy="18" r="7" fill="url(#c2)" />
          <circle cx="98" cy="18" r="3" fill="#0ea5e9" />
        </svg>
      ),
    },
    {
      icon: CheckCircle2,
      label: 'Successful Buys',
      value: successfulBuys,
      unit: '',
      delta: '+100%',
      sub: 'Completed transactions',
      accent: 'violet',
      chart: (
        <svg viewBox="0 0 120 36" className="h-10 w-full" aria-hidden="true">
          <defs>
            <linearGradient id="c3" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#8b5cf6" stopOpacity="0.4" />
              <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[20, 44, 68, 92].map((x, i) => {
            const h = [12, 18, 24, 30][i]
            return (
              <rect
                key={i}
                x={x}
                y={36 - h}
                width="12"
                height={h}
                rx="1.5"
                fill="url(#c3)"
                stroke="#8b5cf6"
                strokeOpacity={0.4 + i * 0.18}
              />
            )
          })}
        </svg>
      ),
    },
    {
      icon: IndianRupee,
      label: 'Est. Cost Savings',
      value: costSavings,
      unit: '',
      delta: '+22.4%',
      sub: 'Vs virgin raw material cost',
      accent: 'amber',
      chart: (
        <svg viewBox="0 0 120 36" className="h-10 w-full" aria-hidden="true">
          <defs>
            <linearGradient id="c4" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 30 L20 24 L40 26 L60 14 L80 12 L100 4 L120 2 L120 36 L0 36 Z" fill="url(#c4)" />
          <path d="M0 30 L20 24 L40 26 L60 14 L80 12 L100 4 L120 2" stroke="#f59e0b" strokeWidth="1.75" fill="none" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx="120" cy="2" r="3" fill="#f59e0b" stroke="white" strokeWidth="2" />
        </svg>
      ),
    },
  ];

  const accentBg: Record<string, string> = {
    emerald: 'bg-emerald-300/40',
    sky: 'bg-sky-300/40',
    violet: 'bg-violet-300/40',
    amber: 'bg-amber-300/40',
  };
  const accentRing: Record<string, string> = {
    emerald: 'from-emerald-500 to-teal-500',
    sky: 'from-sky-500 to-blue-500',
    violet: 'from-violet-500 to-purple-500',
    amber: 'from-amber-500 to-orange-500',
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={i}
          className="group shine-wrap relative overflow-hidden rounded-2xl border border-emerald-100/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_20px_40px_-20px_rgba(16,185,129,0.25)]"
        >
          <div
            className={`pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full ${accentBg[s.accent]} blur-2xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-100`}
          />
          <div
            className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accentRing[s.accent]} origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100`}
          />

          <div className="relative flex items-start justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {s.label}
            </span>
            <s.icon className="h-4 w-4 text-slate-400 transition-all duration-300 group-hover:scale-110 group-hover:text-emerald-600" />
          </div>

          <div className="relative mt-3 flex items-baseline gap-1.5">
            <span className="bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-[28px] font-extrabold tracking-tight text-transparent">
              {s.value}
            </span>
            {s.unit && (
              <span className="text-sm font-medium text-slate-500">{s.unit}</span>
            )}
          </div>

          <div className="mt-1.5 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-0.5 rounded-md bg-gradient-to-r from-emerald-50 to-teal-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200/60 transition-all duration-300 group-hover:scale-105"
            >
              <ArrowUpRight className="h-3 w-3" />
              {s.delta}
            </span>
            <span className="text-[11px] text-slate-500">{s.sub}</span>
          </div>

          <div className="mt-3 -mb-1">{s.chart}</div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================ */
/*  Charts Row                                                  */
/* ============================================================ */
interface ChartsRowProps {
  timeframe: 'Month' | 'Quarter' | 'Year'
  setTimeframe: (t: 'Month' | 'Quarter' | 'Year') => void
  categoryData?: { name: string; value: number }[]
}

function ChartsRow({ timeframe, setTimeframe, categoryData }: ChartsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Donut */}
      <div className="lift-hover shine-wrap group rounded-2xl border border-emerald-100/60 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">
                Procurement Mix
              </h3>
              <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200/60">
                Target
              </span>
            </div>
            <p className="mt-0.5 text-[12px] text-slate-500">Target material categories by volume</p>
          </div>
          <button
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title="Configure view"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          <DonutChart categoryData={categoryData} />
          <ul className="w-full flex-1 space-y-2.5">
            {[
              { name: 'HDPE Plastic', value: '2,475 kg', pct: 55, color: '#10b981' },
              { name: 'Aluminium 6061', value: '1,125 kg', pct: 25, color: '#0ea5e9' },
              { name: 'Corrugated Paper', value: '540 kg', pct: 12, color: '#f59e0b' },
              { name: 'Other Secondary', value: '360 kg', pct: 8, color: '#8b5cf6' },
            ].map((l, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-[12px] transition hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full shadow-sm"
                    style={{ backgroundColor: l.color, boxShadow: `0 0 8px ${l.color}50` }}
                  />
                  <span className="font-medium text-slate-700">{l.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">{l.value}</span>
                  <span className="w-10 text-right font-semibold tabular-nums text-slate-900">
                    {l.pct}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bar */}
      <div className="lift-hover shine-wrap group rounded-2xl border border-emerald-100/60 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">
                Cost Savings Pipeline
              </h3>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200/60">
                <TrendingUp className="h-2.5 w-2.5" />
                +31%
              </span>
            </div>
            <p className="mt-0.5 text-[12px] text-slate-500">Realized savings vs secondary target</p>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50/60 p-0.5">
            {(['Month', 'Quarter', 'Year'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`rounded px-2.5 py-1 text-[11px] font-medium transition ${
                  timeframe === t
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <BarChart />
      </div>
    </div>
  );
}

function DonutChart({ categoryData }: { categoryData?: { name: string; value: number }[] }) {
  const segments = categoryData && categoryData.length > 0
    ? categoryData.map((d, idx) => ({
        pct: d.value,
        color: ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6'][idx % 4],
      }))
    : [
        { pct: 55, color: '#10b981' },
        { pct: 25, color: '#0ea5e9' },
        { pct: 12, color: '#f59e0b' },
        { pct: 8, color: '#8b5cf6' },
      ];

  const r = 50;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative">
      <svg viewBox="0 0 140 140" className="h-44 w-44 -rotate-90">
        <defs>
          <filter id="donutGlowBuyer">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="70" cy="70" r={r} stroke="#f1f5f9" strokeWidth="14" fill="none" />
        {segments.map((s, i) => {
          const priorLen = segments.slice(0, i).reduce((sum, seg) => sum + (seg.pct / 100) * c, 0);
          const len = (s.pct / 100) * c;
          const dasharray = `${len} ${c - len}`;
          const dashoffset = -priorLen;
          if (s.pct === 0) return null;
          return (
            <circle
              key={i}
              cx="70"
              cy="70"
              r={r}
              stroke={s.color}
              strokeWidth="14"
              fill="none"
              strokeDasharray={dasharray}
              strokeDashoffset={dashoffset}
              filter="url(#donutGlowBuyer)"
              style={{ transition: 'stroke-dasharray 1s ease-out' }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Target
        </div>
        <div className="bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-[20px] font-bold tracking-tight text-transparent">
          4,500 kg
        </div>
        <div className="text-[10px] text-slate-400">4 categories</div>
      </div>
    </div>
  );
}

function BarChart() {
  const data = [
    { label: 'Jul', secured: 12, potential: 18 },
    { label: 'Aug', secured: 24, potential: 32 },
    { label: 'Sep', secured: 48, potential: 65 },
    { label: 'Oct', secured: 60, potential: 88 },
    { label: 'Nov', secured: 95, potential: 142 },
  ];
  const maxHeight = 140;
  const maxVal = 150;

  return (
    <div className="mt-5">
      <div className="relative flex h-44 items-end justify-between gap-3">
        {[0, 1, 2, 3].map((g) => (
          <div
            key={g}
            className="absolute left-0 right-0 h-px bg-slate-100"
            style={{ bottom: `${(g * maxHeight) / 4 + 8}px` }}
          />
        ))}
        {data.map((d, i) => {
          const h1 = (d.secured / maxVal) * maxHeight;
          const h2 = (d.potential / maxVal) * maxHeight;
          return (
            <div key={i} className="group relative flex flex-1 flex-col items-center gap-1">
              <div className="absolute -top-7 z-10 hidden rounded-md bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white shadow-lg group-hover:block pointer-events-none">
                ₹{d.potential}k
              </div>
              <div className="flex h-full items-end gap-1">
                <div
                  className="relative w-3 overflow-hidden rounded-t-sm bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-md transition-all duration-500 group-hover:from-emerald-500 group-hover:to-emerald-300"
                  style={{ height: `${h1}px` }}
                >
                  <span className="absolute inset-x-0 top-0 h-1 bg-white/40" />
                </div>
                <div
                  className="relative w-3 overflow-hidden rounded-t-sm bg-gradient-to-t from-emerald-200 to-emerald-100 shadow-sm transition-all duration-500 group-hover:from-emerald-300 group-hover:to-emerald-200"
                  style={{ height: `${h2}px` }}
                >
                  <span className="absolute inset-x-0 top-0 h-1 bg-white/40" />
                </div>
              </div>
              <span className="mt-1 text-[11px] font-medium text-slate-500 transition-colors group-hover:text-emerald-700">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-end gap-4 border-t border-slate-100 pt-3 text-[12px]">
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-emerald-400 to-emerald-600" />
          Realized Savings
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-emerald-100 to-emerald-200" />
          Potential Savings
        </div>
      </div>
    </div>
  );
}

/* ============================================================ */
/*  Activity / Sourcing Targets                                 */
/* ============================================================ */
interface ActivityRowProps {
  targets: SourcingTargetItem[]
  searchQuery: string
  setSearchQuery: (q: string) => void
  statusFilter: string
  setStatusFilter: (s: string) => void
}

function ActivityRow({
  targets,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}: ActivityRowProps) {
  const statusTone: Record<string, { dot: string; pill: string }> = {
    Active: {
      dot: 'bg-emerald-500',
      pill: 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 ring-emerald-200/60',
    },
    Matching: {
      dot: 'bg-amber-500',
      pill: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 ring-amber-200/60',
    },
    Sourced: {
      dot: 'bg-sky-500',
      pill: 'bg-gradient-to-r from-sky-50 to-blue-50 text-sky-700 ring-sky-200/60',
    },
  };

  return (
    <div className="lift-hover shine-wrap overflow-hidden rounded-2xl border border-emerald-100/60 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100/60 p-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-emerald-400/40 blur-sm" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
              <PackageSearch className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">
              Active Sourcing Targets
            </h3>
            <p className="text-[12px] text-slate-500">
              Secondary materials you are actively looking to procure
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="group flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-3 transition-all duration-300 hover:border-emerald-300 hover:bg-white focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100">
            <Search className="h-3.5 w-3.5 text-slate-400 transition-colors group-focus-within:text-emerald-600" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search targets…"
              className="w-36 sm:w-44 bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-[12.5px] font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="matching">Matching</option>
              <option value="active">Active</option>
              <option value="sourced">Sourced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table head */}
      <div className="hidden grid-cols-12 gap-2 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-50/40 px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 sm:grid">
        <div className="col-span-5">Target Material</div>
        <div className="col-span-2">Requirement</div>
        <div className="col-span-3">Location / Region</div>
        <div className="col-span-2 text-right">Status</div>
      </div>

      {/* Rows */}
      {targets.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-400">
          No sourcing targets match your search criteria.
        </div>
      ) : (
        targets.map((l, i) => {
          const tone = statusTone[l.status] || statusTone.Active;
          return (
            <div
              key={l.id || i}
              className="group relative grid grid-cols-1 items-center gap-2 border-b border-slate-100 px-5 py-3.5 transition hover:bg-gradient-to-r hover:from-emerald-50/40 hover:to-transparent sm:grid-cols-12 sm:gap-3"
            >
              {/* Emerald sweep on hover */}
              <div className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-emerald-500 transition-transform duration-300 group-hover:scale-y-100" />
              <div className="col-span-5 flex items-center gap-3 min-w-0">
                <div className="relative shrink-0 overflow-hidden rounded-lg">
                  <MaterialThumbnail
                    material={l.title}
                    src={l.img}
                    alt={l.title}
                    sizeClassName="h-10 w-10"
                    className="transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="min-w-0">
                  <Link
                    to={`/buyer-requirements`}
                    className="truncate block text-[13.5px] font-semibold text-slate-900 transition-colors group-hover:text-emerald-700"
                  >
                    {l.title}
                  </Link>
                  <div className="truncate text-[12px] text-slate-500">{l.spec}</div>
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-[13.5px] font-semibold tabular-nums text-slate-900">
                  {l.qty}
                </div>
                <div className="text-[12px] text-slate-500">{l.maxPrice}</div>
              </div>
              <div className="col-span-3 flex items-center gap-1 text-[13px] font-medium text-slate-700">
                <MapPin className="h-3 w-3 text-slate-400 transition-colors group-hover:text-emerald-600 shrink-0" />
                <span className="truncate">{l.loc}</span>
              </div>
              <div className="col-span-2 flex justify-end">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ring-1 ring-inset transition-all duration-300 group-hover:scale-105 ${tone.pill}`}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={`absolute inset-0 animate-soft-ping rounded-full ${tone.dot} opacity-60`} />
                    <span className={`relative h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                  </span>
                  {l.status}
                </span>
              </div>
            </div>
          );
        })
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-gradient-to-r from-slate-50/50 to-transparent px-5 py-3 text-[12px]">
        <span className="text-slate-500">
          Showing <span className="font-semibold text-slate-700">{targets.length}</span> of{' '}
          <span className="font-semibold text-slate-700">3</span> targets
        </span>
        <Link
          to="/buyer-requirements"
          className="group inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
        >
          Manage all targets
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
