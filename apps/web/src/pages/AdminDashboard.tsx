import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity, ArrowRight, CircleDollarSign, Leaf, Network, PackageCheck, Recycle, Settings2, SlidersHorizontal, UsersRound } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { get } from '../lib/api'
import { formatCurrency, formatKg, formatNumber } from '../lib/format'
import { useAsync } from '../hooks/useAsync'
import type { AdminDashboardSummary } from '../types'
import { ErrorPanel, PageSkeleton, MetricCard, PageHeader } from '../components/ui'
import { AdminPage } from './AdminPage'

const CHART_COLORS = ['#12645b', '#72a98f', '#c08a37', '#86a8b8', '#e98467']

function ChartCard({ title, subtitle, children, accent = 'spruce' }: { title: string; subtitle: string; children: React.ReactNode; accent?: 'spruce' | 'gold' | 'coral' }) {
  const accentClass = accent === 'gold' ? 'text-[#a47a25] bg-[#fff6df]' : accent === 'coral' ? 'text-coral bg-[#fff0eb]' : 'text-spruce bg-[#e7f5ed]'
  return (
    <section className="card chart-card rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm lift-hover bg-white">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-bold tracking-tight text-ink">{title}</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-[#748982]">{subtitle}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-2xl ${accentClass}`}><Network size={18} /></span>
      </div>
      {children}
    </section>
  )
}

export function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'scoring' ? 'scoring' : 'overview'

  const summary = useAsync(() => get<AdminDashboardSummary>('/api/dashboard/summary').then((r) => r.data), [])

  if (activeTab === 'scoring') {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex items-center justify-between gap-4 border-b border-emerald-100/80 pb-4">
          <div className="flex items-center gap-2">
            <button
              id="admin-back-to-overview-tab"
              onClick={() => setSearchParams({})}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              ← Platform Overview
            </button>
            <span className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-3.5 py-1.5 text-[12.5px] font-semibold text-white shadow-sm flex items-center gap-1.5">
              <Settings2 size={14} />
              <span>Scoring Rules</span>
            </span>
          </div>
          <button
            onClick={() => setSearchParams({})}
            className="text-[12px] font-medium text-slate-500 hover:text-emerald-700 transition"
          >
            Exit to Overview
          </button>
        </div>
        <AdminPage role="admin" />
      </div>
    )
  }

  if (summary.loading) return <PageSkeleton />
  if (summary.error || !summary.data) return <ErrorPanel error={summary.error || 'Unavailable'} onRetry={() => void summary.reload()} />
  const data = summary.data

  return (
    <div className="space-y-7 animate-fade-in-up">
      <PageHeader
        eyebrow="Admin Workspace"
        title="Platform Overview"
        description="Full platform visibility — all listings, requirements, matches, and environmental impact across all companies."
        actions={
          <div className="flex items-center gap-2.5">
            <button
              id="admin-dashboard-scoring-rules-btn"
              onClick={() => setSearchParams({ tab: 'scoring' })}
              className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold shadow-sm transition hover:shadow-md"
            >
              <Settings2 size={16} />
              <span>Scoring Rules</span>
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-emerald-100/70 pb-3">
        <button
          id="tab-btn-overview"
          onClick={() => setSearchParams({})}
          className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-2 text-[13px] font-semibold text-white shadow-md shadow-emerald-600/20"
        >
          Platform Overview
        </button>
        <button
          id="tab-btn-scoring"
          onClick={() => setSearchParams({ tab: 'scoring' })}
          className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <Settings2 size={15} />
          <span>Scoring Rules</span>
        </button>
      </div>

      {/* Scoring Rules Quick Action Card */}
      <section className="card rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white p-5 sm:p-6 shadow-sm lift-hover">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25">
              <Settings2 size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[17px] font-bold text-slate-900">Deterministic Scoring Rules</h3>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">Active</span>
              </div>
              <p className="mt-1 text-[13px] text-slate-600 max-w-2xl">
                Calibrate how the matcher calculates compatibility: Material (35%), Quality (20%), Quantity (20%), Distance (15%), Price (0%), and Environment (10%).
              </p>
            </div>
          </div>
          <button
            id="btn-admin-configure-rules"
            onClick={() => setSearchParams({ tab: 'scoring' })}
            className="btn-primary flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold shrink-0 shadow-sm transition hover:shadow-md"
          >
            <SlidersHorizontal size={15} />
            <span>Configure Scoring Rules</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </section>
      <section className="grid gap-5 lg:grid-cols-3 xl:grid-cols-4">
        <MetricCard label="Total Waste Listed" value={`${formatKg(data.kpis?.total_waste_listed_kg_week || 0)} / wk`} detail="Across all active listings" icon={Recycle} />
        <MetricCard label="Waste Diverted" value={formatKg(data.kpis?.waste_diverted_kg || 0)} detail="Via confirmed transactions" icon={PackageCheck} />
        <MetricCard label="Active Buyers" value={formatNumber(data.kpis?.active_buyers || 0)} detail="With requirements on platform" icon={UsersRound} />
        <MetricCard label="Platform Value" value={formatCurrency(data.kpis?.potential_economic_value_inr || 0)} detail="Potential economic value" icon={CircleDollarSign} accent="gold" />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Waste by Category" subtitle="Material type breakdown">
          <div className="h-64 w-full">
            {data.charts?.waste_by_category?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.charts?.waste_by_category || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2}>
                    {(data.charts?.waste_by_category || []).map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                  </Pie>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#445' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#12645b' }} formatter={(value: number) => [`${formatKg(value)}/wk`, 'Volume']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[#d2e5dd] bg-[#f9fbfb]">
                <p className="text-sm text-[#748982]">No listings on platform</p>
              </div>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Economic Value by Category" subtitle="Potential revenue pipeline" accent="gold">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts?.economic_value || []} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#748982', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#748982', fontSize: 12 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip cursor={{ fill: '#f9fbfb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#a47a25' }} formatter={(value: number) => [formatCurrency(value), 'Value']} />
                <Bar dataKey="value" fill="#d4aa53" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Match Success" subtitle="Transaction outcomes" accent="coral">
          <div className="h-64 w-full">
            {data.charts?.match_success?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.charts?.match_success || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2}>
                    {(data.charts?.match_success || []).map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#e98467' }} formatter={(value: number) => [formatNumber(value), 'Transactions']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[#d2e5dd] bg-[#f9fbfb]">
                <p className="text-sm text-[#748982]">No transactions yet</p>
              </div>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Environmental Impact" subtitle="Estimated CO₂e benefit">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts?.environmental_impact || []} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#748982', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#748982', fontSize: 12 }} tickFormatter={(val) => `${val}kg`} />
                <Tooltip cursor={{ fill: '#f9fbfb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#12645b' }} formatter={(value: number) => [`${formatNumber(value)} kgCO₂e`, 'Impact']} />
                <Bar dataKey="value" fill="#72a98f" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>

      {data.match_success_rate_percent !== undefined && (
        <section className="card rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm lift-hover bg-white">
          <div className="flex items-center gap-3.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e7f5ed] text-spruce"><Activity size={18} /></span>
            <div>
              <h2 className="text-[18px] font-bold tracking-tight text-ink">Platform Match Success Rate</h2>
              <p className="mt-0.5 text-[13px] text-[#748982]">Percentage of active matches leading to accepted transactions</p>
            </div>
            <span className="ml-auto text-[28px] font-extrabold text-spruce">{data.match_success_rate_percent}%</span>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#e6eee8]">
            <div className="h-full rounded-full bg-gradient-to-r from-[#0c5146] via-spruce to-[#45a482]" style={{ width: `${data.match_success_rate_percent}%` }} />
          </div>
        </section>
      )}

      {data.labels && (
        <section className="rounded-2xl border border-[#d5e5da] bg-[#f6fbf7] p-5 sm:p-6 shadow-sm lift-hover">
          <div className="flex items-start gap-2 mb-3">
            <Leaf className="mt-0.5 shrink-0 text-spruce" size={16} />
            <h3 className="text-[14px] font-bold text-ink">Platform Notices</h3>
          </div>
          <ul className="space-y-2">
            {Object.values(data.labels).map((label, i) => (
              <li key={i} className="text-[13px] leading-relaxed text-[#5a7269]">• {label}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
