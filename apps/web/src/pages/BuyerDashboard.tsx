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
        <MetricCard title="Procurement Target" value={formatKg(data.kpis.total_procurement_target_kg_week)} suffix="/ wk" subtitle="Total requested volume" icon={Target} />
        <MetricCard title="Active Suppliers" value={formatNumber(data.kpis.active_seller_matches)} subtitle="Matching your requirements" icon={UsersRound} />
        <MetricCard title="Successful Procurements" value={formatNumber(data.kpis.successful_purchases)} subtitle="Completed transactions" icon={PackageCheck} />
        <MetricCard title="Est. Cost Savings" value={formatCurrency(data.kpis.estimated_cost_savings_inr)} subtitle="Vs virgin material cost" icon={CircleDollarSign} />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Procurement by category" subtitle="Weekly requirements by material category." accent="spruce">
          <div className="h-[255px]">
            {data.charts.procurement_by_category.length ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.charts.procurement_by_category} dataKey="value" nameKey="name" cx="50%" cy="47%" innerRadius={56} outerRadius={84} paddingAngle={4} stroke="none">
                      {data.charts.procurement_by_category.map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${formatNumber(value)} kg/week`, 'Requirement']} />
                  </PieChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-xs text-[#7d928a]">
                <p>No requirements set</p>
              </div>
            )}
          </div>
        </ChartCard>
        <ChartCard title="Cost Savings Pipeline" subtitle="Realized and potential savings." accent="gold">
          <div className="h-[255px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.cost_savings_pipeline} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7a8e86', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7a8e86', fontSize: 11 }} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Cost Savings']} />
                <Bar dataKey="value" radius={[7, 7, 2, 2]} fill="#c08a37" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>
    </div>
  )
}
