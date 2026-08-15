import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import type { ReactNode } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowRight, ArrowUpRight, CircleDollarSign, Factory, Leaf, MapPinned, Network, PackageCheck, Recycle, Route, ShieldCheck, Sparkles, Target, TrendingUp, UsersRound } from 'lucide-react'
import { get } from '../lib/api'
import { formatCurrency, formatKg, formatNumber } from '../lib/format'
import { useAsync } from '../hooks/useAsync'
import type { DashboardSummary, MapPoint, Role } from '../types'
import { NetworkMap } from '../components/NetworkMap'
import { StatusBadge, Disclosure, ErrorPanel, LoadingPanel, MetricCard, PageHeader } from '../components/ui'

const CHART_COLORS = ['#12645b', '#72a98f', '#c08a37', '#86a8b8', '#e98467']

function ChartCard({ title, subtitle, children, accent = 'spruce' }: { title: string; subtitle: string; children: ReactNode; accent?: 'spruce' | 'gold' | 'coral' }) {
  const accentClass = accent === 'gold' ? 'text-[#a47a25] bg-[#fff6df]' : accent === 'coral' ? 'text-coral bg-[#fff0eb]' : 'text-spruce bg-[#e7f5ed]'
  return (
    <section className="card chart-card p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold tracking-[-0.03em] text-ink">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-[#748982]">{subtitle}</p>
        </div>
        <span className={`grid h-9 w-9 place-items-center rounded-2xl ${accentClass}`}><Network size={17} /></span>
      </div>
      {children}
    </section>
  )
}

function FlowVisual({ buyers, waste }: { buyers: number; waste: number }) {
  return (
    <div className="hero-orbit relative mx-auto hidden h-[330px] w-[430px] max-w-full lg:block" aria-label="Material intelligence flow">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 430 330" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="flowLine" x1="32" y1="165" x2="395" y2="165" gradientUnits="userSpaceOnUse"><stop stopColor="#BCE7CF" stopOpacity=".20" /><stop offset=".5" stopColor="#BCE7CF" stopOpacity=".95" /><stop offset="1" stopColor="#FFE29B" stopOpacity=".72" /></linearGradient>
          <filter id="flowGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <path d="M72 92 C145 92 153 145 205 160" stroke="url(#flowLine)" strokeWidth="1.5" strokeDasharray="4 6" />
        <path d="M225 160 C278 160 287 101 362 92" stroke="url(#flowLine)" strokeWidth="1.5" strokeDasharray="4 6" />
        <path d="M225 174 C276 184 289 244 369 246" stroke="url(#flowLine)" strokeWidth="1.5" strokeDasharray="4 6" />
        <circle cx="214" cy="165" r="54" stroke="#BCE7CF" strokeOpacity=".15" />
        <circle cx="214" cy="165" r="40" stroke="#BCE7CF" strokeOpacity=".15" />
        <circle cx="214" cy="165" r="28" fill="#C4F0D5" fillOpacity=".12" filter="url(#flowGlow)" />
      </svg>
      <div className="hero-flow-card absolute left-0 top-[51px] w-[150px] rounded-2xl p-3.5 text-white">
        <div className="flex items-center gap-2 text-[#bce7cf]"><span className="grid h-6 w-6 place-items-center rounded-lg bg-[#bce7cf]/15"><Recycle size={13} /></span><span className="text-[9px] font-bold uppercase tracking-[.12em]">Generator</span></div>
        <p className="mt-3 text-sm font-semibold">Material Supply</p>
        <p className="mt-1 text-[11px] text-[#c5dfd0]">Industrial by-products</p>
        <p className="mt-3 text-[11px] font-semibold text-mint">{formatNumber(waste / 1000, 1)} t / week</p>
      </div>
      <div className="absolute left-[164px] top-[114px] grid h-[100px] w-[100px] place-items-center rounded-full border border-[#d7f9e4]/25 bg-[#d5f7df]/10 text-center shadow-[0_0_32px_rgba(141,225,177,.18)] backdrop-blur-sm">
        <div><span className="mx-auto grid h-9 w-9 place-items-center rounded-xl bg-mint text-forest shadow-lg"><Sparkles size={17} /></span><p className="mt-2 text-[9px] font-bold uppercase tracking-[.13em] text-mint">Match Engine</p></div>
      </div>
      <div className="hero-flow-card absolute right-0 top-[48px] w-[152px] rounded-2xl p-3.5 text-white">
        <div className="flex items-center gap-2 text-[#ffe29b]"><span className="grid h-6 w-6 place-items-center rounded-lg bg-[#ffe29b]/15"><Factory size={13} /></span><span className="text-[9px] font-bold uppercase tracking-[.12em]">Verified Buyer</span></div>
        <p className="mt-3 text-sm font-semibold">Secondary Feedstock</p>
        <p className="mt-1 text-[11px] text-[#c5dfd0]">Regional Processors</p>
        <p className="mt-3 text-[11px] font-semibold text-[#ffe29b]">Quality fit</p>
      </div>
      <div className="hero-flow-card absolute bottom-[24px] right-[8px] w-[184px] rounded-2xl p-3.5 text-white">
        <div className="flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-[.12em] text-[#bce7cf]">Decision Signals</span><span className="rounded-full bg-[#bce7cf]/15 px-1.5 py-0.5 text-[9px] font-bold text-mint">{buyers} active buyers</span></div>
        <div className="mt-3 flex gap-1.5"><span className="h-1.5 flex-[3] rounded-full bg-mint" /><span className="h-1.5 flex-[2] rounded-full bg-[#bce7cf]/50" /><span className="h-1.5 flex-[2] rounded-full bg-[#ffe29b]/60" /><span className="h-1.5 flex-1 rounded-full bg-white/25" /></div>
        <p className="mt-2 text-[10px] text-[#c5dfd0]">Material · quality · quantity · logistics</p>
      </div>
    </div>
  )
}

export function DashboardPage({ role }: { role: Role }) {
  const dashboard = useAsync(
    () => get<DashboardSummary>('/api/dashboard/summary').then((response) => response.data),
    [],
  )
  const map = useAsync(
    () => get<{ points: MapPoint[] }>('/api/map/points').then((response) => response.data),
    [],
  )

  const primaryAction = useMemo(() => {
    if (role === 'buyer') return { to: '/buyer-requirements', label: 'Add buyer requirement', icon: Factory }
    if (role === 'admin') return { to: '/admin', label: 'Review scoring rules', icon: Target }
    return { to: '/list-waste', label: 'List my waste', icon: Recycle }
  }, [role])
  const ActionIcon = primaryAction.icon

  if (dashboard.loading) return <LoadingPanel label="Loading the CircularMatch dashboard…" />
  if (dashboard.error || !dashboard.data) return <ErrorPanel error={dashboard.error || 'Dashboard data was unavailable.'} onRetry={() => void dashboard.reload()} />
  const data = dashboard.data

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Intelligence layer"
        title="Material flow, made actionable."
        description="A decision workspace for turning industrial by-products into verified secondary-material opportunities."
        actions={
          <Link to={primaryAction.to} className="btn-primary"><ActionIcon size={17} />{primaryAction.label}<ArrowRight size={16} /></Link>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Recycle} label="Total waste listed" value={`${formatNumber(data.kpis.total_waste_listed_kg_week / 1000, 1)} t`} detail="Total weekly availability listed" accent="spruce" />
        <MetricCard icon={PackageCheck} label="Waste matched" value={formatKg(data.kpis.total_waste_matched_kg)} detail="Total matched transaction volume" accent="forest" />
        <MetricCard icon={CircleDollarSign} label="Potential net value" value={formatCurrency(data.kpis.potential_economic_value_inr)} detail="Estimated top-match recovered value" accent="gold" />
        <MetricCard icon={Leaf} label="Potential net CO₂e" value={`${formatNumber(data.kpis.potential_co2e_benefit_kg)} kg`} detail="Estimated carbon offset benefit" accent="coral" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_380px]">
        <div className="hero-mesh min-h-[390px] rounded-3xl p-6 text-white shadow-lift sm:p-8">
          <div className="relative z-10 grid h-full gap-6 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-center">
            <div className="max-w-xl">
              <div className="flex flex-wrap items-center gap-2"><StatusBadge>Intelligence Active</StatusBadge><span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.13em] text-[#bce7cf]"><span className="h-1.5 w-1.5 rounded-full bg-mint" />Decision engine v1</span></div>
              <h2 className="mt-5 text-3xl font-semibold leading-[1.04] tracking-[-0.06em] sm:text-[2.35rem]">Waste intelligence, <span className="text-mint">made visible.</span></h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-[#cae3d5]">CircularMatch connects industrial by-products directly with verified downstream buyers using transparent compatibility scoring and material passports.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/list-waste" className="inline-flex items-center gap-2 rounded-xl bg-mint px-4 py-3 text-sm font-semibold text-forest shadow-[0_12px_22px_rgba(0,0,0,.13)] transition hover:-translate-y-0.5 hover:bg-white"><Recycle size={17} />List material <ArrowRight size={16} /></Link>
                <Link to="/map" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[.04] px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"><MapPinned size={17} />Explore network</Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-2.5 text-[11px] text-[#d3e9dc]"><span className="glass-panel rounded-full px-3 py-1.5"><ShieldCheck className="mr-1.5 inline text-mint" size={13} />Explainable scores</span><span className="glass-panel rounded-full px-3 py-1.5"><Route className="mr-1.5 inline text-mint" size={13} />Optimized logistics</span></div>
            </div>
            <FlowVisual buyers={data.kpis.active_buyers} waste={data.kpis.total_waste_listed_kg_week} />
          </div>
        </div>
        <aside className="card overflow-hidden">
          <div className="border-b border-[#e5eee8] bg-[#f8fbf9] p-6">
            <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[0.15em] text-[#6d847b]">Platform Signal</span><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#e3f4ec] text-spruce"><TrendingUp size={16} /></span></div>
            <h2 className="mt-3 text-xl font-semibold tracking-[-0.035em] text-ink">Material Pipeline</h2>
            <p className="mt-2 text-xs leading-5 text-[#617a70]">A regional view of active industrial material streams.</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#f5f9f6] p-4"><UsersRound size={17} className="text-spruce" /><p className="mt-4 text-3xl font-semibold leading-none tracking-[-.06em] text-ink">{data.kpis.active_buyers}</p><p className="mt-2 text-[11px] leading-4 text-[#71867e]">active buyers</p></div><div className="rounded-2xl bg-[#fff9ea] p-4"><PackageCheck size={17} className="text-[#a47a25]" /><p className="mt-4 text-3xl font-semibold leading-none tracking-[-.06em] text-ink">{data.kpis.successful_matches}</p><p className="mt-2 text-[11px] leading-4 text-[#71867e]">matched pathways</p></div></div>
            <div className="mt-6 rounded-2xl border border-[#deebe2] bg-white p-4"><div className="mb-3 flex items-center justify-between text-xs"><span className="font-medium text-[#627870]">Match success rate</span><span className="font-bold text-ink">{formatNumber(data.match_success_rate_percent, 1)}%</span></div><div className="h-2.5 overflow-hidden rounded-full bg-[#e7eee9] shadow-inner"><div className="h-full rounded-full bg-gradient-to-r from-[#0d564a] to-[#54ae8a]" style={{ width: `${data.match_success_rate_percent}%` }} /></div><p className="mt-3 text-[11px] leading-5 text-[#758a82]">Based on verified commercial matches.</p></div>
            <Link to="/listings" className="mt-5 flex items-center justify-between rounded-xl border border-[#dce8df] bg-[#f8fbf8] px-4 py-3 text-sm font-semibold text-ink transition hover:border-[#add0ba] hover:bg-[#f0f8f2]"><span>Inspect material listings</span><ArrowUpRight size={17} className="text-spruce" /></Link>
          </div>
        </aside>
      </section>

      <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <ChartCard title="Waste by category" subtitle="Weekly availability by material category." accent="spruce">
          <div className="h-[255px]">
            {data.charts.waste_by_category.length ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.charts.waste_by_category} dataKey="value" nameKey="name" cx="50%" cy="47%" innerRadius={56} outerRadius={84} paddingAngle={4} stroke="none">
                      {data.charts.waste_by_category.map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${formatNumber(value)} kg/week`, 'Availability']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="-mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-[#607770]">
                  {data.charts.waste_by_category.map((entry, index) => <div key={entry.name} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />{entry.name}</div>)}
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-xs text-[#7d928a]">
                <Recycle size={28} className="mb-2 text-[#9ecbb5]" />
                <p className="font-semibold text-ink">No material listed yet</p>
                <p className="mt-1">List your waste stream to see live category breakdowns.</p>
              </div>
            )}
          </div>
        </ChartCard>
        <ChartCard title="Material diversion" subtitle="Secondary material volume diverted per period." accent="coral">
          <div className="h-[255px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.waste_diverted_over_time} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                <defs><linearGradient id="wasteFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#12645b" stopOpacity={0.36} /><stop offset="95%" stopColor="#12645b" stopOpacity={0.01} /></linearGradient></defs>
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#7a8e86', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7a8e86', fontSize: 11 }} />
                <Tooltip formatter={(value: number) => [`${formatNumber(value)} kg`, 'Diverted volume']} />
                <Area type="monotone" dataKey="kg" stroke="#12645b" strokeWidth={3} fill="url(#wasteFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        <ChartCard title="Recovered value" subtitle="Estimated net value by material pathway." accent="gold">
          <div className="h-[255px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.economic_value} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#7a8e86', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7a8e86', fontSize: 11 }} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Potential net value']} />
                <Bar dataKey="value" radius={[7, 7, 2, 2]} fill="#c08a37" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        {map.loading ? <LoadingPanel label="Loading network map…" /> : map.error || !map.data ? <ErrorPanel error={map.error || 'Map data unavailable.'} onRetry={() => void map.reload()} /> : <NetworkMap points={map.data.points} compact />}
        <aside className="card grid-noise p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">How it works</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-ink">Transparent material intelligence.</h2></div><span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#eaf6ef] text-spruce"><ShieldCheck size={18} /></span></div>
          <div className="mt-7 space-y-5">
            {[
              ['01', 'Understand', 'AI-assisted drafts turn a plain description into reviewable material fields.'],
              ['02', 'Evaluate', 'Deterministic rules compare compatible buyers against transparent criteria.'],
              ['03', 'Explain', 'Economic, logistics and impact outputs expose their assumptions.'],
            ].map(([step, title, detail]) => <div key={step} className="flex gap-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-forest text-[11px] font-bold text-mint shadow-sm">{step}</span><div><h3 className="text-sm font-semibold text-ink">{title}</h3><p className="mt-1 text-xs leading-5 text-[#617770]">{detail}</p></div></div>)}
          </div>
          <Link to="/list-waste" className="btn-secondary mt-7 w-full"><Recycle size={16} />List a waste stream</Link>
        </aside>
      </section>
    </div>
  )
}
