import {
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
import { Activity, CircleDollarSign, Leaf, Network, PackageCheck, Recycle, UsersRound } from 'lucide-react'
import { get } from '../lib/api'
import { formatCurrency, formatKg, formatNumber } from '../lib/format'
import { useAsync } from '../hooks/useAsync'
import type { AdminDashboardSummary } from '../types'
import { ErrorPanel, LoadingPanel, MetricCard, PageHeader } from '../components/ui'

const CHART_COLORS = ['#12645b', '#72a98f', '#c08a37', '#86a8b8', '#e98467']

function ChartCard({ title, subtitle, children, accent = 'spruce' }: { title: string; subtitle: string; children: React.ReactNode; accent?: 'spruce' | 'gold' | 'coral' }) {
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

export function AdminDashboard() {
  const summary = useAsync(() => get<AdminDashboardSummary>('/api/dashboard/summary').then((r) => r.data), [])

  if (summary.loading) return <LoadingPanel label="Loading admin workspace..." />
  if (summary.error || !summary.data) return <ErrorPanel error={summary.error || 'Unavailable'} onRetry={() => void summary.reload()} />
  const data = summary.data

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Admin Workspace"
        title="Platform Overview"
        description="Full platform visibility — all listings, requirements, matches, and environmental impact across all companies."
        actions={undefined}
      />
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
        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#e7f5ed] text-spruce"><Activity size={17} /></span>
            <div>
              <h2 className="font-semibold tracking-[-0.03em] text-ink">Platform Match Success Rate</h2>
              <p className="mt-0.5 text-xs text-[#748982]">Percentage of active matches leading to accepted transactions</p>
            </div>
            <span className="ml-auto text-2xl font-bold text-spruce">{data.match_success_rate_percent}%</span>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#e6eee8]">
            <div className="h-full rounded-full bg-gradient-to-r from-[#0c5146] via-spruce to-[#45a482]" style={{ width: `${data.match_success_rate_percent}%` }} />
          </div>
        </section>
      )}

      {data.labels && (
        <section className="rounded-2xl border border-[#d5e5da] bg-[#f6fbf7] p-5">
          <div className="flex items-start gap-2 mb-3">
            <Leaf className="mt-0.5 shrink-0 text-spruce" size={15} />
            <h3 className="text-xs font-semibold text-ink">Platform Notices</h3>
          </div>
          <ul className="space-y-1.5">
            {Object.values(data.labels).map((label, i) => (
              <li key={i} className="text-xs leading-5 text-[#5a7269]">• {label}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
