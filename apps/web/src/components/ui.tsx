import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { AlertCircle, CheckCircle2, Info, Leaf, Sparkles } from 'lucide-react'
import { formatNumber } from '../lib/format'
import { motion } from 'framer-motion'

export function CircularMark({ size = 36 }: { size?: number }) {
  return (
    <div
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-2xl text-forest shadow-[0_10px_22px_rgba(135,210,169,.22)]"
      style={{ width: size, height: size, background: 'linear-gradient(145deg, #efffdc 0%, #bce7cf 54%, #8bd2ae 100%)' }}
      aria-hidden="true"
    >
      <span className="absolute -right-[18%] -top-[20%] h-[72%] w-[72%] rounded-full border border-white/70" />
      <span className="absolute -bottom-[23%] -left-[18%] h-[62%] w-[62%] rounded-full bg-[#0f715f]/10" />
      <Leaf className="relative" size={size * 0.50} strokeWidth={2.4} />
      <span className="absolute h-[42%] w-[42%] rounded-full border border-forest/25" />
    </div>
  )
}

export function StatusBadge({ children }: { children?: ReactNode }) {
  if (!children) return null
  return <span className="badge-neutral">{children}</span>
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <div className="relative flex flex-col gap-5 border-b border-[#dce8df] pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className="eyebrow mb-3 inline-flex items-center gap-2 rounded-full border border-[#d5e6da] bg-white/70 px-2.5 py-1"><span className="h-1.5 w-1.5 rounded-full bg-spruce" />{eyebrow}</p>}
        <h1 className="text-3xl font-semibold leading-[1.06] tracking-[-0.055em] text-ink sm:text-[2.25rem]">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#607770] sm:text-[15px]">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  accent = 'spruce',
}: {
  icon: LucideIcon
  label: string
  value: string
  detail: string
  accent?: 'spruce' | 'coral' | 'forest' | 'gold'
}) {
  const tones = {
    spruce: { icon: 'bg-[#dff5e9] text-spruce', tint: 'text-[#12645b]', line: 'from-transparent via-[#57a887] to-transparent' },
    coral: { icon: 'bg-[#fff0eb] text-coral', tint: 'text-[#d97356]', line: 'from-transparent via-[#e98467] to-transparent' },
    forest: { icon: 'bg-[#e2eee7] text-forest', tint: 'text-[#0c4d43]', line: 'from-transparent via-[#2a7c6b] to-transparent' },
    gold: { icon: 'bg-[#fff5d9] text-[#9a7423]', tint: 'text-[#a57a22]', line: 'from-transparent via-[#c08a37] to-transparent' },
  }
  const tone = tones[accent]
  return (
    <article className={`card metric-card card-interactive p-5 ${tone.tint}`}>
      <div className={`absolute inset-x-5 top-0 h-px bg-gradient-to-r ${tone.line}`} />
      <div className="relative flex items-start justify-between gap-3">
        <p className="max-w-[166px] text-[11px] font-bold uppercase tracking-[0.13em] text-[#647a72]">{label}</p>
        <span className={`metric-icon grid h-10 w-10 place-items-center rounded-2xl shadow-[0_6px_14px_rgba(14,73,60,.08)] ${tone.icon}`}><Icon size={18} /></span>
      </div>
      <div className="relative mt-6">
        <p className="text-[1.7rem] font-semibold leading-none tracking-[-0.055em] text-ink">{value}</p>
        <p className="mt-2 max-w-[190px] text-xs leading-5 text-[#748982]">{detail}</p>
      </div>
    </article>
  )
}

export function ScoreRing({ score, label = 'match score', size = 86 }: { score: number; label?: string; size?: number }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference
  const stroke = score >= 88 ? '#12645b' : score >= 70 ? '#c08a37' : '#e98467'
  return (
    <div className="relative grid shrink-0 place-items-center rounded-full bg-white/55 p-1 shadow-[0_8px_18px_rgba(14,67,55,.07)]" style={{ width: size, height: size }} aria-label={`${score}% ${label}`}>
      <svg width={size - 8} height={size - 8} viewBox="0 0 88 88" className="-rotate-90 drop-shadow-[0_4px_5px_rgba(18,100,91,.14)]">
        <circle cx="44" cy="44" r={radius} fill="none" stroke="#e6eee9" strokeWidth="7" />
        <motion.circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-[1.35rem] font-bold tracking-[-0.04em] text-ink">{score}%</span>
      </div>
    </div>
  )
}

export function ScoreBar({ label, score, weight }: { label: string; score: number; weight?: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-[#516b63]">{label}{weight !== undefined ? <span className="ml-1 text-[#8ba098]">({Math.round(weight * 100)}%)</span> : null}</span>
        <span className="rounded-md bg-[#edf5f0] px-1.5 py-0.5 text-[11px] font-bold text-ink">{formatNumber(score, 1)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#e6eee8] shadow-inner">
        <motion.div 
          className="h-full rounded-full bg-gradient-to-r from-[#0c5146] via-spruce to-[#45a482] shadow-[0_1px_4px_rgba(18,100,91,.35)]" 
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, score))}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </div>
    </div>
  )
}

export function QualityPill({ verified, grade }: { verified: boolean; grade?: string }) {
  return verified ? (
    <span className="badge-safe"><CheckCircle2 className="mr-1" size={13} />{grade ? `${grade} · ` : ''}Verified</span>
  ) : (
    <span className="badge-warn"><AlertCircle className="mr-1" size={13} />{grade ? `${grade} · ` : ''}Not verified</span>
  )
}

export function Disclosure({ title = 'Notice', children }: { title?: string; children: ReactNode }) {
  return (
    <div className="relative flex gap-3 overflow-hidden rounded-2xl border border-[#cfe2d6] bg-[#f7fbf8] p-4 text-sm leading-5 text-[#2f5547] shadow-[0_5px_15px_rgba(18,100,91,.04)]">
      <span className="absolute inset-y-0 left-0 w-1 bg-spruce" />
      <Info className="mt-0.5 shrink-0 text-spruce" size={18} />
      <div><strong className="font-semibold text-ink">{title}.</strong> {children}</div>
    </div>
  )
}

export function LoadingPanel({ label = 'Loading CircularMatch data…' }: { label?: string }) {
  return (
    <div className="card flex min-h-[220px] items-center justify-center p-8">
      <div className="text-center">
        <div className="relative mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#e8f5ed] text-spruce"><div className="h-7 w-7 animate-spin rounded-full border-[3px] border-mint border-t-spruce" /><Leaf className="absolute" size={13} /></div>
        <p className="mt-4 text-sm font-medium text-[#607770]">{label}</p>
      </div>
    </div>
  )
}

export function ErrorPanel({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="card border-[#f2c7ba] bg-[#fff9f7] p-6">
      <div className="flex gap-3">
        <AlertCircle className="shrink-0 text-coral" />
        <div>
          <h2 className="font-semibold text-ink">We could not load this section</h2>
          <p className="mt-1 text-sm text-[#7b5d55]">{error}</p>
          {onRetry && <button className="btn-secondary mt-4 !py-2" onClick={onRetry}>Try again</button>}
        </div>
      </div>
    </div>
  )
}

export function EmptyPanel({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  return (
    <div className="card flex min-h-[230px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e3f4ee] text-spruce"><Leaf size={22} /></div>
      <h2 className="mt-4 font-semibold text-ink">{title}</h2>
      <p className="mt-1 max-w-md text-sm leading-6 text-[#6d837b]">{detail}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
