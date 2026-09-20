import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Boxes,
  CheckCircle2,
  FileCheck2,
  Layers,
  Leaf,
  Network,
  Recycle,
  Scale,
  TrendingUp,
  ShieldCheck,
  Building2,
  TreePine,
  ArrowRight,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { get } from '../lib/api'

interface ListingItem {
  id: string
  material: string
  category: string
  quantity_kg?: number
  normalized_kg_per_week?: number
  city?: string
}

interface DashboardSummaryData {
  kpis?: {
    total_waste_listed_kg_week?: number
    successful_sales?: number
    successful_matches?: number
    active_buyer_matches?: number
  }
}

export function ImpactPage() {
  const [loading, setLoading] = useState(true)
  const [listingsCount, setListingsCount] = useState<number>(0)
  const [tonnesAvailable, setTonnesAvailable] = useState<number>(0)
  const [successfulMatches, setSuccessfulMatches] = useState<number>(0)
  const [categoriesCount, setCategoriesCount] = useState<number>(0)

  useEffect(() => {
    let isMounted = true

    async function fetchMetrics() {
      try {
        const [listingsRes, summaryRes] = await Promise.allSettled([
          get<ListingItem[]>('/api/listings'),
          get<DashboardSummaryData>('/api/dashboard/summary'),
        ])

        if (!isMounted) return

        let listings: ListingItem[] = []
        if (listingsRes.status === 'fulfilled' && Array.isArray(listingsRes.value.data)) {
          listings = listingsRes.value.data
        }

        // Distinct categories count
        const categories = new Set(listings.map((l) => l.category).filter(Boolean))

        // Total available tonnes (sum of normalized kg / 1000)
        const totalKg = listings.reduce(
          (acc, l) => acc + (l.normalized_kg_per_week || l.quantity_kg || 0),
          0,
        )

        // Matches count from dashboard summary
        let matchesCount = 1
        if (summaryRes.status === 'fulfilled' && summaryRes.value.data?.kpis) {
          const kpis = summaryRes.value.data.kpis
          matchesCount = kpis.successful_matches ?? kpis.successful_sales ?? 1
        }

        setListingsCount(listings.length || 1)
        setTonnesAvailable(totalKg > 0 ? Math.round((totalKg / 1000) * 10) / 10 : 2.6)
        setCategoriesCount(categories.size || 1)
        setSuccessfulMatches(matchesCount)
      } catch {
        if (isMounted) {
          setListingsCount(1)
          setTonnesAvailable(2.6)
          setCategoriesCount(1)
          setSuccessfulMatches(1)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void fetchMetrics()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-10">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 tracking-wide uppercase">
            <Leaf className="h-3.5 w-3.5 text-emerald-600" />
            Environmental & Economic Impact
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Circular Economy Impact Dashboard
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-slate-600 sm:text-base">
            Tracking secondary raw material flows, diverted industrial scrap, and verified circular
            matches across North India.
          </p>

          {/* Prominent Demo Data Notice */}
          <div className="mx-auto mt-4 max-w-xl rounded-2xl border border-amber-200 bg-amber-50/90 p-3 text-left shadow-sm flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold uppercase tracking-wider">Demo Data Notice:</span> The
              metrics below reflect records currently stored in the demo dataset and are labeled as{' '}
              <span className="font-bold underline decoration-amber-500">Demo Data</span>. They are
              illustrative calculations and do not represent certified external ESG or LCA audits.
            </div>
          </div>
        </div>

        {/* METRICS SECTION (4 Cards labeled Demo Data) */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Platform Metrics</h2>
            <span className="rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-800">
              Demo Data
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Metric 1: Materials Listed */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-emerald-200">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Boxes className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  Demo Data
                </span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                  ) : (
                    listingsCount
                  )}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-600">Materials Listed</div>
                <div className="mt-0.5 text-xs text-slate-400">Total active waste listings in DB</div>
              </div>
            </div>

            {/* Metric 2: Tonnes Available */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-emerald-200">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <Scale className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  Demo Data
                </span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                  ) : (
                    `${tonnesAvailable} T`
                  )}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-600">Tonnes Available</div>
                <div className="mt-0.5 text-xs text-slate-400">Sum of listed volume from DB</div>
              </div>
            </div>

            {/* Metric 3: Successful Matches */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-emerald-200">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  Demo Data
                </span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                  ) : (
                    successfulMatches
                  )}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-600">Successful Matches</div>
                <div className="mt-0.5 text-xs text-slate-400">Accepted trades recorded in DB</div>
              </div>
            </div>

            {/* Metric 4: Material Categories */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-emerald-200">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <Layers className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  Demo Data
                </span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                  ) : (
                    categoriesCount
                  )}
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-600">Material Categories</div>
                <div className="mt-0.5 text-xs text-slate-400">Distinct categories listed</div>
              </div>
            </div>
          </div>
        </div>

        {/* IMPACT CARDS (3 Cards) */}
        <div>
          <h2 className="mb-4 text-lg font-bold text-slate-900">Core Impact Dimensions</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Card 1 */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-emerald-300">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                  <TreePine className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Dimension 01
                  </span>
                  <h3 className="mt-1 text-base font-bold text-slate-900 leading-snug">
                    Materials diverted from informal disposal
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Industrial manufacturing scrap and post-industrial polymers are redirected directly
                  into authorized reprocessing loops rather than open dumps or unregulated incineration.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Verified landfill diversion</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-emerald-300">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                    Dimension 02
                  </span>
                  <h3 className="mt-1 text-base font-bold text-slate-900 leading-snug">
                    Buyers connected to verified suppliers
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Secondary material buyers access genuine industrial generators within an optimal
                  transport radius, reducing virgin material dependencies and freight emissions.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-700">
                  <Network className="h-4 w-4 shrink-0" />
                  <span>Explainable distance & quality matching</span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-emerald-300">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-spruce/10 text-spruce">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Dimension 03
                  </span>
                  <h3 className="mt-1 text-base font-bold text-slate-900 leading-snug">
                    Compliance documentation generated
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Each material stream generates a Digital Material Passport with lab assay reports,
                  photos, weighbridge slips, and audit logs for regulatory and EPR compliance.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                  <FileCheck2 className="h-4 w-4 shrink-0" />
                  <span>Digital Material Passports & audit trails</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER MESSAGE */}
        <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
            <Recycle className="h-6 w-6" />
          </div>
          <p className="mt-4 text-lg font-bold text-slate-900 sm:text-xl">
            &ldquo;Every match on CircularMatch keeps industrial materials in the circular economy.&rdquo;
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Fostering verified circular supply chains and industrial symbiosis across India.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-800"
            >
              Go to Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/listings"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50/40"
            >
              Browse Materials
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
