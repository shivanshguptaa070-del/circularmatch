import { Link } from 'react-router-dom'
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
import { CircleDollarSign, Factory, Network, PackageCheck, Target, UsersRound } from 'lucide-react'
import { get } from '../lib/api'
import { formatCurrency, formatKg, formatNumber } from '../lib/format'
import { useAsync } from '../hooks/useAsync'
import type { BuyerDashboardSummary } from '../types'
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

export function BuyerDashboard() {
  const summary = useAsync(() => get<BuyerDashboardSummary>('/api/dashboard/summary').then((r) => r.data), [])

  if (summary.loading) return <LoadingPanel label="Loading buyer workspace..." />
  if (summary.error || !summary.data) return <ErrorPanel error={summary.error || 'Unavailable'} onRetry={() => void summary.reload()} />
  const data = summary.data

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Buyer Workspace"
        title="Procurement Dashboard"
        description="Track your secondary material requirements, active supplier matches, and cost savings pipeline."
        actions={
          <Link className="btn-primary" to="/buyer-requirements">
            <Factory size={17} />
            Set a sourcing requirement
          </Link>
        }
      />
      <section className="grid gap-5 lg:grid-cols-3 xl:grid-cols-4">
        <MetricCard label="Procurement Target" value={`${formatKg(data.kpis?.total_procurement_target_kg_week || 0)} / wk`} detail="Total requested volume" icon={Target} />
        <MetricCard label="Active Suppliers" value={formatNumber(data.kpis?.active_seller_matches || 0)} detail="Matching your requirements" icon={UsersRound} />
        <MetricCard label="Successful Procurements" value={formatNumber(data.kpis?.successful_purchases || 0)} detail="Completed transactions" icon={PackageCheck} />
        <MetricCard label="Est. Cost Savings" value={formatCurrency(data.kpis?.estimated_cost_savings_inr || 0)} detail="Vs virgin material cost" icon={CircleDollarSign} />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Procurement by Category" subtitle="Target material mix">
          <div className="h-64 w-full">
            {data.charts?.procurement_by_category?.length ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.charts?.procurement_by_category || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2}>
                      {(data.charts?.procurement_by_category || []).map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#12645b' }} formatter={(value: number) => [`${formatKg(value)}/wk`, 'Target']} />
                  </PieChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[#d2e5dd] bg-[#f9fbfb]">
                <p className="text-sm text-[#748982]">No requirements set</p>
              </div>
            )}
          </div>
        </ChartCard>
        <ChartCard title="Cost Savings Pipeline" subtitle="Realized vs potential savings" accent="gold">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts?.cost_savings_pipeline || []} margin={{ top: 6, right: 4, left: 10, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#748982', fontSize: 12 }} dy={10} />
                <YAxis width={40} axisLine={false} tickLine={false} tick={{ fill: '#748982', fontSize: 12 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip cursor={{ fill: '#f9fbfb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#a47a25' }} formatter={(value: number) => [formatCurrency(value), 'Value']} />
                <Bar dataKey="value" fill="#d4aa53" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>
    </div>
  )
}
