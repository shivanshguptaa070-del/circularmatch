import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, ChevronRight, Info, Leaf, Network, AlertTriangle } from 'lucide-react'
import { formatNumber } from '../lib/format'
import { Link } from 'react-router-dom'

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm font-medium mb-4">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2">
          {index > 0 && <ChevronRight size={14} className="text-[#a0b1a9]" />}
          {item.href ? (
            <Link to={item.href} className="text-[#526b62] hover:text-ink transition-colors">{item.label}</Link>
          ) : (
            <span className="text-ink">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

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
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e3c777] bg-[#fff8e5] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#7a5c15] shadow-sm">{children}</span>
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
    <div className="relative flex flex-col gap-5 border-b border-[#dce8df] pb-7 sm:flex-row sm:items-end sm:justify-between animate-fade-in-up">
      <div className="max-w-3xl">
        {eyebrow && (
          <p className="eyebrow mb-3 inline-flex items-center gap-2 rounded-full border border-[#d5e6da] bg-white/80 px-3 py-1 text-[10.5px] font-bold tracking-[0.16em] text-spruce shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-spruce animate-pulse" />
            {eyebrow}
          </p>
        )}
        <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-ink sm:text-[32px]">{title}</h1>
        <p className="mt-2.5 max-w-2xl text-[14px] leading-relaxed text-[#5a736a] sm:text-[15px]">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2.5">{actions}</div>}
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
    spruce: { icon: 'bg-[#dff5e9] text-spruce group-hover:bg-spruce group-hover:text-white', tint: 'text-[#12645b]', line: 'from-transparent via-[#57a887] to-transparent' },
    coral: { icon: 'bg-[#fff0eb] text-coral group-hover:bg-coral group-hover:text-white', tint: 'text-[#d97356]', line: 'from-transparent via-[#e98467] to-transparent' },
    forest: { icon: 'bg-[#e2eee7] text-forest group-hover:bg-forest group-hover:text-white', tint: 'text-[#0c4d43]', line: 'from-transparent via-[#2a7c6b] to-transparent' },
    gold: { icon: 'bg-[#fff5d9] text-[#9a7423] group-hover:bg-[#9a7423] group-hover:text-white', tint: 'text-[#a57a22]', line: 'from-transparent via-[#c08a37] to-transparent' },
  }
  const tone = tones[accent]
  return (
    <article className={`card metric-card card-interactive lift-hover shine-wrap group rounded-2xl p-6 ${tone.tint}`}>
      <div className={`absolute inset-x-5 top-0 h-0.5 bg-gradient-to-r ${tone.line} origin-left transition-transform duration-500 group-hover:scale-x-100`} />
      <div className="relative flex items-start justify-between gap-3">
        <p className="max-w-[170px] text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#647a72]">{label}</p>
        <span className={`metric-icon grid h-11 w-11 place-items-center rounded-2xl shadow-[0_6px_16px_rgba(14,73,60,.08)] transition-all duration-300 group-hover:scale-110 ${tone.icon}`}><Icon size={19} /></span>
      </div>
      <div className="relative mt-5">
        <p className="text-[28px] font-extrabold leading-none tracking-tight text-ink">{value}</p>
        <p className="mt-2 max-w-[200px] text-[13px] leading-relaxed text-[#748982]">{detail}</p>
      </div>
    </article>
  )
}

export function ScoreRing({ score, label = 'match score', size = 88 }: { score: number; label?: string; size?: number }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, score))
  const dashOffset = circumference - (clamped / 100) * circumference
  const stroke = clamped >= 88 ? '#12645b' : clamped >= 70 ? '#c08a37' : '#e98467'
  const displayScore = Math.round(clamped)
  const isTop = clamped >= 85
  
  // Optically center the circle by placing the gap perfectly at the top (12 o'clock)
  const gapPercent = 100 - clamped
  const startAngle = -90 + (gapPercent * 1.8)

  return (
    <div className={`relative flex shrink-0 items-center justify-center rounded-full bg-white/70 shadow-[0_8px_20px_rgba(14,67,55,.08)] transition-transform duration-300 hover:scale-105 ${isTop ? 'ring-2 ring-emerald-300/40' : ''}`} style={{ width: size, height: size }} aria-label={`${displayScore}% ${label}`}>
      {isTop && <span className="absolute -inset-1 rounded-full animate-soft-ping bg-emerald-400/20 pointer-events-none" />}
      <svg width={size - 8} height={size - 8} viewBox="0 0 88 88" className="absolute inset-0 m-auto block drop-shadow-[0_4px_6px_rgba(18,100,91,.15)]">
        <g transform={`rotate(${startAngle} 44 44)`}>
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
        </g>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[1.25rem] font-extrabold tracking-tight text-ink leading-none translate-x-[2px] flex items-baseline">
          {displayScore}
          <span className="text-[0.65em] font-bold text-[#5a736a] ml-[1px]">%</span>
        </span>
      </div>
    </div>
  )
}

export function ScoreBar({ label, score, weight }: { label: string; score: number; weight?: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-[13px]">
        <span className="font-semibold text-[#48635a]">{label}{weight !== undefined ? <span className="ml-1 text-[#8ba098] font-normal">({Math.round(weight * 100)}%)</span> : null}</span>
        <span className="rounded-lg bg-[#edf5f0] px-2 py-0.5 text-[12px] font-bold text-ink">{formatNumber(score, 1)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#e6eee8] shadow-inner">
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
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c8ead7] bg-[#ebf8f0] px-3 py-1 text-[11px] font-semibold text-[#196349] shadow-sm"><CheckCircle2 size={13} className="text-[#196349]" />{grade ? `${grade} · ` : ''}Verified</span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f2d4c7] bg-[#fff2ed] px-3 py-1 text-[11px] font-semibold text-[#a64d37] shadow-sm"><AlertCircle size={13} className="text-[#a64d37]" />{grade ? `${grade} · ` : ''}Not verified</span>
  )
}

export function Disclosure({ title = 'Notice', children }: { title?: string; children: ReactNode }) {
  return (
    <div className="animate-slide-up-fade relative flex gap-3.5 overflow-hidden rounded-2xl border border-[#cfe2d6] bg-[#f7fbf8] p-4 text-[13.5px] leading-relaxed text-[#2f5547] shadow-[0_5px_15px_rgba(18,100,91,.04)]">
      <span className="absolute inset-y-0 left-0 w-1.5 bg-spruce rounded-r" />
      <Info className="mt-0.5 shrink-0 text-spruce" size={19} />
      <div><strong className="font-semibold text-ink">{title}.</strong> {children}</div>
    </div>
  )
}

export function PageSkeleton({ label = 'Loading CircularMatch data…' }: { label?: string }) {
  return (
    <div className="card lift-hover rounded-2xl flex min-h-[220px] items-center justify-center p-8 border border-[#dce8df]">
      <div className="text-center">
        <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#e8f5ed] text-spruce shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-mint border-t-spruce" />
          <Leaf className="absolute" size={15} />
        </div>
        <p className="mt-4 text-[14px] font-medium text-[#607770]">{label}</p>
      </div>
    </div>
  )
}

export function ConfirmDialog({ 
  isOpen, 
  title, 
  description, 
  confirmLabel = 'Confirm', 
  cancelLabel = 'Cancel', 
  onConfirm, 
  onCancel,
  children
}: { 
  isOpen: boolean; 
  title: string; 
  description: string; 
  confirmLabel?: string; 
  cancelLabel?: string; 
  onConfirm: () => void; 
  onCancel: () => void;
  children?: React.ReactNode;
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-spruce/40 p-4 backdrop-blur-md animate-fade-in-up">
      <div className="animate-scale-in w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden border border-emerald-100/60">
        <div className="p-6 sm:p-7">
          <div className="flex items-center gap-3.5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#f8eadd] text-[#c97424]">
              <AlertTriangle size={22} />
            </div>
            <h3 className="text-[20px] font-bold tracking-tight text-ink">{title}</h3>
          </div>
          <p className="mt-3.5 text-[14px] leading-relaxed text-[#617a70]">{description}</p>
          {children && <div className="mt-5">{children}</div>}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-[#f1f5f2] bg-[#fbfdfb] p-5 sm:px-7">
          <button className="rounded-xl border border-[#c9d9cf] bg-white px-4 py-2 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50" onClick={onCancel}>{cancelLabel}</button>
          <button className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-2 text-[13px] font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

export function ErrorPanel({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="card rounded-2xl border-[#f2c7ba] bg-[#fff9f7] p-6 shadow-sm">
      <div className="flex gap-3.5">
        <AlertCircle className="shrink-0 text-coral mt-0.5" />
        <div>
          <h2 className="text-[17px] font-semibold text-ink">We could not load this section</h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#7b5d55]">{error}</p>
          {onRetry && <button className="rounded-xl border border-[#d6a596] bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[#8b4633] mt-4 hover:bg-[#fdede8]" onClick={onRetry}>Try again</button>}
        </div>
      </div>
    </div>
  )
}

export function EmptyPanel({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  return (
    <div className="card lift-hover rounded-2xl flex min-h-[230px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e3f4ee] text-spruce shadow-sm"><Leaf size={24} /></div>
      <h2 className="mt-4 text-[17px] font-semibold text-ink">{title}</h2>
      <p className="mt-1.5 max-w-md text-[13.5px] leading-relaxed text-[#6d837b]">{detail}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ChartCard({ title, subtitle, children, accent = 'spruce' }: { title: string; subtitle: string; children: React.ReactNode; accent?: 'spruce' | 'gold' | 'coral' }) {
  const accentClass = accent === 'gold' ? 'text-[#a47a25] bg-[#fff6df]' : accent === 'coral' ? 'text-coral bg-[#fff0eb]' : 'text-spruce bg-[#e7f5ed]'
  return (
    <section className="card chart-card lift-hover rounded-2xl p-6 sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-semibold tracking-tight text-ink">{title}</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-[#748982]">{subtitle}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-2xl shadow-sm ${accentClass}`}><Network size={18} /></span>
      </div>
      {children}
    </section>
  )
}
