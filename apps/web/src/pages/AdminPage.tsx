import { useEffect, useMemo, useState } from 'react'
import { BarChart3, CheckCircle2, Loader2, RotateCcw, Settings2, ShieldCheck } from 'lucide-react'
import { get, patch } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import type { Role, ScoringConfig } from '../types'
import { DemoBadge, Disclosure, ErrorPanel, LoadingPanel, PageHeader } from '../components/ui'

const LABELS: Array<[keyof ScoringConfig['weights'], string, string]> = [
  ['material', 'Material compatibility', 'Exact controlled-catalog material or approved future mapping.'],
  ['quality', 'Quality compatibility', 'Stated grade vs buyer minimum, with a disclosure when unverified.'],
  ['quantity', 'Quantity compatibility', 'Normalized weekly availability vs preferred buyer range.'],
  ['distance', 'Distance & logistics', 'Haversine sample distance within buyer maximum radius.'],
  ['price', 'Price & economic value', 'Illustrative delivered cost vs illustrative buyer target.'],
  ['environment', 'Environmental benefit', 'Illustrative recovery pathway signal including transport burden.'],
]

export function AdminPage({ role }: { role: Role }) {
  const config = useAsync(() => get<{ config: ScoringConfig; notice: string }>('/api/admin/scoring-config').then((response) => response.data), [role])
  const [weights, setWeights] = useState<ScoringConfig['weights'] | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (config.data?.config) setWeights(config.data.config.weights)
  }, [config.data])
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
      setWeights(response.data.config.weights)
      setMessage(response.data.message)
      void config.reload()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save scoring rules.')
    } finally {
      setSaving(false)
    }
  }

  if (config.loading || !weights) return <LoadingPanel label="Loading scoring configuration…" />
  if (config.error || !config.data) return <ErrorPanel error={config.error || 'Scoring configuration unavailable.'} onRetry={() => void config.reload()} />

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Configuration" title="Deterministic scoring rules" description="Configure how the matcher weighs each compatibility signal across material, quality, quantity, distance, price, and impact." actions={<DemoBadge>Active Weights</DemoBadge>} />
      {message && <div className="flex gap-3 rounded-2xl border border-[#b9ddc7] bg-[#eff9f2] p-4 text-sm text-[#28624e]"><CheckCircle2 className="mt-0.5 shrink-0" size={18} /><span>{message}</span></div>}
      {error && <div className="rounded-2xl border border-[#f1c6b9] bg-[#fff7f4] p-4 text-sm text-[#994f3a]">{error}</div>}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
        <article className="card p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e5ece7] pb-5"><div><div className="flex items-center gap-2"><Settings2 className="text-spruce" size={19} /><h2 className="text-xl font-semibold tracking-[-0.035em] text-ink">Default MVP decision rules</h2></div><p className="mt-2 text-sm leading-6 text-[#657b72]">Version {config.data.config.version} · all six weights must total 100%.</p></div><div className={`rounded-2xl px-4 py-3 text-right ${Math.abs(total - 1) < 0.001 ? 'bg-[#e8f5ed] text-spruce' : 'bg-[#fff1ea] text-[#ae573d]'}`}><p className="text-[10px] font-bold uppercase tracking-[0.1em]">Weight total</p><p className="mt-1 text-2xl font-bold tracking-[-0.05em]">{Math.round(total * 100)}%</p></div></div><div className="mt-5 divide-y divide-[#e5ece7]">{LABELS.map(([key, label, description]) => <div key={key} className="grid gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_105px] sm:items-center"><div><p className="font-semibold text-ink">{label}</p><p className="mt-1 text-xs leading-5 text-[#6e837b]">{description}</p></div><label className="relative"><input type="number" min="0" max="100" step="1" className="field-input pr-8 text-right font-semibold" value={Math.round(weights[key] * 100)} onChange={(event) => setWeight(key, event.target.value)} /><span className="absolute right-3 top-3.5 text-sm font-semibold text-[#759087]">%</span></label></div>)}</div><div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#e5ece7] pt-5"><button className="btn-secondary" onClick={() => setWeights(config.data?.config.weights || null)}><RotateCcw size={16} />Reset edits</button><button className="btn-primary" disabled={saving || Math.abs(total - 1) > 0.001} onClick={() => void save()}>{saving ? <Loader2 className="animate-spin" size={17} /> : <CheckCircle2 size={17} />}{saving ? 'Saving…' : 'Save decision rules'}</button></div></article>
        <aside className="space-y-5"><article className="card p-5"><div className="flex items-center gap-2"><ShieldCheck className="text-spruce" size={18} /><h2 className="font-semibold text-ink">Explainability guardrail</h2></div><p className="mt-3 text-sm leading-6 text-[#667d74]">The application stores component scores, inputs, flags and rule versions alongside every match. An LLM is never asked to invent the score.</p></article><article className="card p-5"><div className="flex items-center gap-2"><BarChart3 className="text-[#a47a25]" size={18} /><h2 className="font-semibold text-ink">What to calibrate later</h2></div><ul className="mt-4 space-y-3 text-xs leading-5 text-[#657b72]"><li>• Actual buyer acceptance and transaction outcomes</li><li>• Documented quality verification and contamination data</li><li>• Real freight quotes and delivered-cost records</li><li>• Reviewed material-specific lifecycle factors</li></ul></article><article className="rounded-3xl bg-forest p-5 text-white"><p className="text-xs font-bold uppercase tracking-[0.13em] text-mint">Data maturity</p><h2 className="mt-2 text-lg font-semibold tracking-[-0.03em]">Do not confuse a demo score with ground truth.</h2><p className="mt-3 text-xs leading-5 text-[#c5dfd0]">The value of this MVP is visible reasoning and a scalable data architecture, not unsupported accuracy claims.</p></article></aside>
      </section>
    </div>
  )
}
