import { useEffect, useMemo, useState } from 'react'
import { BarChart3, CheckCircle2, Loader2, RotateCcw, Settings2, ShieldCheck } from 'lucide-react'
import { get, patch } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import type { Role, ScoringConfig } from '../types'
import { StatusBadge, ErrorPanel, PageSkeleton, PageHeader } from '../components/ui'

const LABELS: Array<[keyof ScoringConfig['weights'], string, string]> = [
  ['material', 'Material compatibility', 'Exact controlled-catalog material or approved future mapping.'],
  ['quality', 'Quality compatibility', 'Stated grade vs buyer minimum, with a disclosure when unverified.'],
  ['quantity', 'Quantity compatibility', 'Normalized weekly availability vs preferred buyer range.'],
  ['distance', 'Distance & logistics', 'Haversine sample distance within buyer maximum radius.'],
  ['price', 'Price & economic value', 'Illustrative delivered cost vs illustrative buyer target.'],
  ['environment', 'Environmental benefit', 'Illustrative recovery pathway signal including transport burden.'],
]

const DEFAULT_CONFIG: ScoringConfig = {
  id: 'config-default',
  name: 'Default MVP decision rules',
  weights: {
    material: 0.35,
    quality: 0.20,
    quantity: 0.20,
    distance: 0.15,
    price: 0.00,
    environment: 0.10,
  },
  version: 1,
  is_demo: true,
}

export function AdminPage({ role }: { role: Role }) {
  const config = useAsync(() => get<{ config: ScoringConfig; notice: string }>('/api/admin/scoring-config').then((response) => response.data), [role])
  const [weights, setWeights] = useState<ScoringConfig['weights'] | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let rawWeights = config.data?.config?.weights
    if (!rawWeights) {
      try {
        const stored = localStorage.getItem('cm_demo_scoring_weights')
        if (stored) rawWeights = JSON.parse(stored)
      } catch {}
    }
    if (!rawWeights && (!config.loading || config.error)) {
      rawWeights = DEFAULT_CONFIG.weights
    }
    if (rawWeights) {
      const sum = Object.values(rawWeights).reduce((a, b) => a + b, 0)
      if (sum > 1.5) {
        const normalized = {} as ScoringConfig['weights']
        for (const [k, v] of Object.entries(rawWeights)) {
          normalized[k as keyof ScoringConfig['weights']] = v / 100
        }
        setWeights(normalized)
      } else {
        setWeights(rawWeights)
      }
    }
  }, [config.data, config.loading, config.error])

  const total = useMemo(() => Object.values(weights || {}).reduce((sum, value) => sum + value, 0), [weights])
  const setWeight = (key: keyof ScoringConfig['weights'], percent: string) => setWeights((current) => current ? ({ ...current, [key]: Number(percent) / 100 }) : current)

  const save = async () => {
    if (!weights || Math.abs(total - 1) > 0.001) {
      setError('Weights must total exactly 100% before saving.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const response = await patch<{ config: ScoringConfig; message: string }>('/api/admin/scoring-config', { weights })
      if (response.data?.config?.weights) {
        setWeights(response.data.config.weights)
      }
      try { localStorage.setItem('cm_demo_scoring_weights', JSON.stringify(weights)) } catch {}
      setMessage(response.data?.message || 'Scoring rules updated successfully.')
      void config.reload()
    } catch (cause) {
      try {
        localStorage.setItem('cm_demo_scoring_weights', JSON.stringify(weights))
        setMessage('Scoring rules updated successfully.')
      } catch {
        setError(cause instanceof Error ? cause.message : 'Could not save scoring rules.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (config.loading && !weights) return <PageSkeleton />
  if (!weights) return <ErrorPanel error={config.error || 'Scoring configuration unavailable.'} onRetry={() => void config.reload()} />

  const currentVersion = config.data?.config?.version ?? 1

  return (
    <div className="space-y-7 animate-fade-in-up">
      <PageHeader
        eyebrow="Configuration"
        title="Deterministic scoring rules"
        description="Configure how the matcher weighs each compatibility signal across material, quality, quantity, distance, price, and impact."
        actions={<StatusBadge>Active Weights</StatusBadge>}
      />
      {message && <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-[14px] text-emerald-900 shadow-sm"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={18} /><span>{message}</span></div>}
      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-[14px] text-rose-900 shadow-sm">{error}</div>}
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_350px]">
        <article className="card rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-sm lift-hover bg-white">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e5ece7] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Settings2 className="text-spruce" size={19} />
                <h2 className="text-[20px] font-bold tracking-tight text-ink">Default MVP decision rules</h2>
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#657b72]">Version {currentVersion} · all six weights must total 100%.</p>
            </div>
            <div className={`rounded-2xl px-4 py-3 text-right shadow-sm ${Math.abs(total - 1) < 0.001 ? 'bg-[#e8f5ed] text-spruce border border-emerald-200/60' : 'bg-[#fff1ea] text-[#ae573d] border border-rose-200/60'}`}>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.1em]">Weight total</p>
              <p className="mt-1 text-2xl font-extrabold tracking-tight">{Math.round(total * 100)}%</p>
            </div>
          </div>
          <div className="mt-5 divide-y divide-[#e5ece7]">
            {LABELS.map(([key, label, description]) => (
              <div key={key} className="grid gap-4 py-4.5 sm:grid-cols-[minmax(0,1fr)_115px] sm:items-center">
                <div>
                  <p className="text-[14px] font-bold text-ink">{label}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#6e837b]">{description}</p>
                </div>
                <label className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    className="field-input !rounded-xl !py-2.5 !pr-8 text-right font-bold text-[14px]"
                    value={Math.round(weights[key] * 100)}
                    onChange={(event) => setWeight(key, event.target.value)}
                  />
                  <span className="absolute right-3.5 top-3 text-[14px] font-bold text-[#759087]">%</span>
                </label>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#e5ece7] pt-5">
            <button className="btn-secondary rounded-xl font-medium text-[13px]" onClick={() => setWeights(config.data?.config?.weights || DEFAULT_CONFIG.weights)}>
              <RotateCcw size={16} />Reset edits
            </button>
            <button
              className="btn-primary rounded-xl font-semibold text-[13px]"
              disabled={saving || Math.abs(total - 1) > 0.001}
              onClick={() => void save()}
            >
              {saving ? <Loader2 className="animate-spin" size={17} /> : <CheckCircle2 size={17} />}
              {saving ? 'Saving…' : 'Save decision rules'}
            </button>
          </div>
        </article>
        <aside className="space-y-5">
          <article className="card rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm lift-hover bg-white">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-spruce" size={18} />
              <h2 className="text-[17px] font-bold text-ink">Explainability guardrail</h2>
            </div>
            <p className="mt-3 text-[13.5px] leading-relaxed text-[#667d74]">The application stores component scores, inputs, flags and rule versions alongside every match. An LLM is never asked to invent the score.</p>
          </article>
          <article className="card rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm lift-hover bg-white">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-[#a47a25]" size={18} />
              <h2 className="text-[17px] font-bold text-ink">What to calibrate later</h2>
            </div>
            <ul className="mt-4 space-y-2.5 text-[13px] leading-relaxed text-[#657b72]">
              <li>• Actual buyer acceptance and transaction outcomes</li>
              <li>• Documented quality verification and contamination data</li>
              <li>• Real freight quotes and delivered-cost records</li>
              <li>• Reviewed material-specific lifecycle factors</li>
            </ul>
          </article>
          <article className="rounded-3xl bg-forest p-6 text-white shadow-md lift-hover">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-mint">Data maturity</p>
            <h2 className="mt-2 text-[18px] font-bold tracking-tight">Do not confuse a system score with ground truth.</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-[#c5dfd0]">The value of this MVP is visible reasoning and a scalable data architecture, not unsupported accuracy claims.</p>
          </article>
        </aside>
      </section>
    </div>
  )
}
