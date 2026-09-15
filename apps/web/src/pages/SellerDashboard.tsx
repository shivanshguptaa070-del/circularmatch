import { Link } from 'react-router-dom'
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
import { CircleDollarSign, Factory, Network, PackageCheck, Recycle, UsersRound } from 'lucide-react'
import { get } from '../lib/api'
import { formatCurrency, formatKg, formatNumber } from '../lib/format'
import { useQuery } from '@tanstack/react-query'
import type { SellerDashboardSummary } from '../types'
import { ErrorPanel, PageSkeleton, MetricCard, PageHeader, ChartCard } from '../components/ui'

const CHART_COLORS = ['#12645b', '#72a98f', '#c08a37', '#86a8b8', '#e98467']

export function SellerDashboard() {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['dashboard_summary', 'seller'],
    queryFn: () => get<SellerDashboardSummary>('/api/dashboard/summary').then((r) => r.data),
    refetchInterval: 60_000
  })

  if (isPending) return <PageSkeleton />
  if (error || !data) return <ErrorPanel error={error?.message || 'Unavailable'} onRetry={() => void refetch()} />

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Seller Workspace"
        title="Sales Dashboard"
        description="Track your listed waste streams, active buyer matches, and potential revenue."
        actions={
          <Link className="btn-primary" to="/list-waste">
            <Recycle size={17} />
            List a waste stream
          </Link>
        }
      />
      <section className="grid gap-5 lg:grid-cols-3 xl:grid-cols-4">
        <MetricCard label="Total Waste Listed" value={`${formatKg(data.kpis?.total_waste_listed_kg_week || 0)} / wk`} detail="Across all your facilities" icon={Factory} />
        <MetricCard label="Active Buyers" value={formatNumber(data.kpis?.active_buyer_matches || 0)} detail="Matching your materials" icon={UsersRound} />
        <MetricCard label="Successful Sales" value={formatNumber(data.kpis?.successful_sales || 0)} detail="Completed transactions" icon={PackageCheck} />
        <MetricCard label="Potential Revenue" value={formatCurrency(data.kpis?.potential_revenue_inr || 0)} detail="From active matches" icon={CircleDollarSign} />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Waste by Category" subtitle="Material composition">
          <div className="h-64 w-full">
            {data.charts?.waste_by_category?.length ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.charts?.waste_by_category || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2}>
                      {(data.charts?.waste_by_category || []).map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                    </Pie>
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#445' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#12645b' }} formatter={(value: number) => [`${formatKg(value)}/wk`, 'Volume']} />
                  </PieChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[#d2e5dd] bg-[#f9fbfb]">
                <p className="text-sm text-[#748982]">No waste listed</p>
              </div>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Revenue Pipeline" subtitle="Secured vs potential revenue" accent="gold">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts?.revenue_pipeline || []} margin={{ top: 6, right: 4, left: 10, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#748982', fontSize: 12 }} dy={10} />
                <YAxis width={65} axisLine={false} tickLine={false} tick={{ fill: '#748982', fontSize: 12 }} tickFormatter={(val) => val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`} />
                <Tooltip cursor={{ fill: '#f9fbfb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#a47a25' }} formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                <Bar dataKey="value" fill="#d4aa53" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>
    </div>
  )
}
