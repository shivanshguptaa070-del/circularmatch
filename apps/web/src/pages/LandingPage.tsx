import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight, BarChart3, Bot, CheckCircle2, Factory,
  Leaf, MapPin, Recycle, ShieldCheck, Sparkles, TrendingUp, Zap,
} from 'lucide-react'
import { CircularMark } from '../components/ui'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

// ─── Motion tokens (motion-ui skill) ─────────────────────────────────────────
const ease = [0.22, 1, 0.36, 1] as const
const fadeUp = (delay = 0) => ({
  initial:   { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport:  { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease, delay },
})
const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
}
const staggerItem = {
  hidden:  { opacity: 0, y: 16, scale: 0.94 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.4, ease } },
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface PlatformStats {
  wasteKgWeek: number
  activeBuyers: number
  platformValueInr: number
}

const FALLBACK_STATS: PlatformStats = {
  wasteKgWeek: 2600,
  activeBuyers: 8,
  platformValueInr: 120000,
}

// ─── Count-up hook ─────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1600, enabled = true, reducedMotion = false) {
  const [value, setValue] = useState(reducedMotion ? target : 0)
  useEffect(() => {
    if (!enabled) return
    // Skip animation entirely for reduced-motion users
    if (reducedMotion) { setValue(target); return }
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, enabled, reducedMotion])
  return value
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
// make-interfaces-feel-better: tabular-nums to prevent layout shift during count-up
function StatCard({
  label,
  value,
  prefix = '',
  suffix = '',
  animate,
  reducedMotion,
}: {
  label: string
  value: number
  prefix?: string
  suffix?: string
  animate: boolean
  reducedMotion: boolean
}) {
  const displayed = useCountUp(value, 1600, animate, reducedMotion)
  const formatted = displayed >= 1000
    ? displayed >= 100000
      ? (displayed / 100000).toFixed(1) + 'L'
      : displayed.toLocaleString('en-IN')
    : displayed.toString()

  return (
    <div className="flex flex-col items-center gap-2 px-8 py-8 text-center">
      {/* tabular-nums prevents width jitter during count-up (make-interfaces-feel-better) */}
      <p
        className="text-4xl font-bold tracking-[-0.06em] text-white sm:text-5xl"
        style={{ fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum"' }}
      >
        {prefix}{formatted}{suffix}
      </p>
      <p className="text-sm font-medium text-[#9ecbb5]">{label}</p>
    </div>
  )
}

// ─── Landing Nav ──────────────────────────────────────────────────────────────
function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className="fixed inset-x-0 top-0 z-50"
      // make-interfaces-feel-better: explicit transition-property, not 'all'
      style={{
        backgroundColor: scrolled ? 'rgba(7,52,58,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        boxShadow: scrolled ? '0 1px 0 rgba(255,255,255,0.06)' : 'none',
        transitionProperty: 'background-color, backdrop-filter, box-shadow',
        transitionDuration: '300ms',
        transitionTimingFunction: 'ease',
      }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 rounded-xl p-1 transition-opacity hover:opacity-90" aria-label="CircularMatch home">
          <CircularMark size={38} />
          <span className="text-[16px] font-bold tracking-[-0.05em] text-white">
            CIRCULAR<span style={{ color: 'var(--cm-mint)' }}>MATCH</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-3">
          <a
            href="#how-it-works"
            className="hidden text-sm font-medium text-[#bce7cf] transition-colors duration-150 hover:text-white sm:block"
          >
            How it works
          </a>
          {/* motion-ui: whileTap for tactile press feedback */}
          <motion.div whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }} transition={{ duration: 0.15 }}>
            <Link
              to="/auth"
              className="btn-primary cursor-pointer px-5 py-2.5 text-sm"
              id="landing-nav-signin"
            >
              Sign In
            </Link>
          </motion.div>
        </div>
      </nav>
    </header>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <section className="hero-mesh relative min-h-screen pt-24 pb-20 sm:pt-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10">

          {/* Left: copy + CTAs */}
          <div className="relative z-10 flex flex-col gap-7">
            {/* Eyebrow — instant, no delay */}
            <motion.div
              className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.4, ease }}
            >
              <MapPin size={12} className="text-mint" />
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#bce7cf]">
                Delhi NCR · Industrial Circular Economy
              </span>
            </motion.div>

            {/* Headline — text-wrap: balance (make-interfaces-feel-better) */}
            <motion.h1
              className="text-4xl font-bold leading-[1.04] tracking-[-0.055em] text-white sm:text-5xl lg:text-[3.4rem]"
              style={{ textWrap: 'balance' } as React.CSSProperties}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.55, ease, delay: 0.08 }}
            >
              Turn your industrial waste into{' '}
              <span
                className="relative inline-block"
                style={{
                  background: 'linear-gradient(90deg, #bfe9d0 0%, #7dd8b0 60%, #45b590 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                verified revenue
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              className="max-w-[520px] text-lg leading-relaxed text-[#a8d5be]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.5, ease, delay: 0.16 }}
            >
              CircularMatch uses AI to match waste generators with certified recyclers
              across Delhi NCR.{' '}
              <span className="font-semibold text-white">Free to list, instant matching.</span>
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-wrap items-center gap-3.5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.45, ease, delay: 0.24 }}
            >
              <motion.div whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }} transition={{ duration: 0.15 }}>
                <Link
                  to="/auth"
                  id="landing-cta-get-started"
                  className="btn-primary inline-flex cursor-pointer items-center gap-2 px-6 py-3.5 text-base"
                >
                  Get Started Free
                  <ArrowRight size={17} />
                </Link>
              </motion.div>
              <motion.a
                href="#how-it-works"
                id="landing-cta-how-it-works"
                className="btn-secondary inline-flex cursor-pointer items-center gap-2 border-white/20 bg-white/10 px-6 py-3.5 text-base text-white backdrop-blur-sm hover:border-white/30 hover:bg-white/15"
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                See How It Works
              </motion.a>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              className="flex flex-wrap items-center gap-5 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.5, delay: 0.36 }}
            >
              {[
                { icon: CheckCircle2, text: 'Free to list' },
                { icon: Zap, text: 'Instant AI matching' },
                { icon: ShieldCheck, text: 'Verified network' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-[#9ecbb5]">
                  {/* 40px hit area on icon (make-interfaces-feel-better) */}
                  <span className="inline-flex h-5 w-5 items-center justify-center">
                    <Icon size={14} className="text-mint" aria-hidden="true" />
                  </span>
                  {text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: glassmorphism match preview card */}
          {/* Deepened glassmorphism: blur(20px) saturate(180%) + stronger border glow */}
          <motion.div
            className="relative hidden lg:flex lg:justify-center"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.65, ease, delay: 0.12 }}
          >
            <div
              className="hero-flow-card relative w-[340px] rounded-3xl p-6"
              role="presentation"
              aria-hidden="true"
              style={{
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.18)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset, 0 32px 64px rgba(0,0,0,0.35)',
              }}
            >
              {/* Card header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-mint/20">
                    <Sparkles size={16} className="text-mint" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">AI Match Found</p>
                    <p className="text-[10px] text-[#9ecbb5]">real-time scoring</p>
                  </div>
                </div>
                <div className="rounded-full border border-mint/30 bg-mint/15 px-3 py-1 text-xs font-bold text-mint">
                  94% match
                </div>
              </div>

              {/* Match details */}
              <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#7ab09a]">Material</p>
                <p className="text-sm font-semibold text-white">PET Manufacturing Trim Scrap</p>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-[#9ecbb5]">
                  <span>3,000 kg/week</span>
                  <span>·</span>
                  <span>Noida, UP</span>
                </div>
              </div>

              {/* Score breakdown */}
              <div className="space-y-2">
                {[
                  { label: 'Material Match', score: 100 },
                  { label: 'Quality Grade', score: 85 },
                  { label: 'Distance', score: 78 },
                ].map(({ label, score }) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <span className="text-[11px] text-[#9ecbb5]">{label}</span>
                    <div className="flex flex-1 items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-mint/60 to-mint"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      {/* tabular-nums on score percentages too */}
                      <span
                        className="w-8 text-right text-[11px] font-semibold text-white"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom */}
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <div>
                  <p className="text-[10px] text-[#9ecbb5]">Est. Revenue</p>
                  <p className="text-base font-bold text-mint">₹49,500 / mo</p>
                </div>
                <div className="rounded-xl bg-mint/20 px-3 py-1.5 text-xs font-bold text-mint">
                  View Match →
                </div>
              </div>
            </div>

            {/* Floating badge — glass-panel */}
            <div
              className="glass-panel absolute -bottom-6 -left-4 flex items-center gap-2.5 rounded-2xl px-4 py-3"
              style={{ backdropFilter: 'blur(16px) saturate(160%)', WebkitBackdropFilter: 'blur(16px) saturate(160%)' }}
            >
              <Bot size={16} className="text-mint" />
              <div>
                <p className="text-[10px] font-bold text-white">6-parameter AI engine</p>
                <p className="text-[9px] text-[#9ecbb5]">Material · Quality · Distance · Price</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Social Proof Strip (NEW — UI UX Pro: social proof before CTA) ────────────
const SOCIAL_PROOF = [
  { icon: Factory,  label: 'Noida Plastics Co.',    type: 'Waste Generator', quote: 'Matched our PET scrap in 48 hours.' },
  { icon: Recycle,  label: 'GreenCycle Delhi',      type: 'Certified Recycler', quote: 'Volume doubled in 3 months.' },
  { icon: Leaf,     label: 'UP Industrial Park',    type: 'Waste Generator', quote: 'Zero-waste compliance achieved.' },
]

function SocialProofStrip({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <section
      className="relative border-y border-white/6 py-10"
      aria-label="Customer stories"
      style={{ background: 'linear-gradient(to right, #092d32, #0c3d3a, #092d32)' }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.p
          className="mb-6 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[#6aab90]"
          {...fadeUp(0)}
          transition={{ duration: reducedMotion ? 0 : 0.4, ease }}
        >
          Trusted by Delhi NCR's industrial community
        </motion.p>
        <motion.div
          className="grid gap-4 sm:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {SOCIAL_PROOF.map((item) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.label}
                variants={reducedMotion ? {} : staggerItem}
                className="flex items-start gap-3.5 rounded-2xl border border-white/8 bg-white/5 px-5 py-4"
                style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
              >
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mint/15">
                  <Icon size={16} className="text-mint" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-white">{item.label}</p>
                  <p className="mb-1 text-[10px] text-[#7ab09a]">{item.type}</p>
                  <p className="text-[12px] italic text-[#a8d5be]">"{item.quote}"</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Impact Stats Strip ───────────────────────────────────────────────────────
function ImpactStats({ reducedMotion }: { reducedMotion: boolean }) {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    fetch(`${API_BASE}/api/dashboard/summary`, {
      headers: { 'X-Demo-User-Id': 'user-admin' },
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((json) => {
        const kpis = json?.data?.kpis
        setStats(kpis ? {
          wasteKgWeek: kpis.total_waste_listed_kg_week ?? FALLBACK_STATS.wasteKgWeek,
          activeBuyers: kpis.active_buyers ?? FALLBACK_STATS.activeBuyers,
          platformValueInr: kpis.potential_economic_value_inr ?? FALLBACK_STATS.platformValueInr,
        } : FALLBACK_STATS)
      })
      .catch(() => setStats(FALLBACK_STATS))
      .finally(() => clearTimeout(timeout))
    return () => { clearTimeout(timeout); controller.abort() }
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const s = stats ?? FALLBACK_STATS

  return (
    <motion.section
      ref={ref}
      className="sidebar-surface relative border-y border-white/8"
      aria-label="Platform impact statistics"
      {...fadeUp()}
      transition={{ duration: reducedMotion ? 0 : 0.5, ease }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid divide-y divide-white/8 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <StatCard label="Total Waste Listed (kg / week)" value={s.wasteKgWeek} suffix=" kg" animate={visible} reducedMotion={reducedMotion} />
          <StatCard label="Active Buyers on Platform" value={s.activeBuyers} animate={visible} reducedMotion={reducedMotion} />
          <StatCard label="Platform Economic Value" value={s.platformValueInr} prefix="₹" animate={visible} reducedMotion={reducedMotion} />
        </div>
      </div>
    </motion.section>
  )
}

// ─── Features Section ─────────────────────────────────────────────────────────
const FEATURES = [
  {
    id: 'ai-matching',
    icon: Bot,
    iconBg: 'bg-[#eaf8f0]',
    iconColor: 'text-spruce',
    title: 'AI-Powered Matching',
    description: 'Our 6-parameter scoring engine evaluates material type, quality grade, quantity fit, distance, price, and environmental impact in real time — surfacing only the most relevant buyers for your waste stream.',
    badge: 'Instant',
    badgeColor: 'badge-safe',
  },
  {
    id: 'verified-network',
    icon: ShieldCheck,
    iconBg: 'bg-[#eaf4ff]',
    iconColor: 'text-[#2a6fad]',
    title: 'Verified Network',
    description: 'Every recycler is pre-screened and onboarded. Every material lot gets a digital passport with chain-of-custody evidence — so you always know exactly where your material is going.',
    badge: 'Trusted',
    badgeColor: 'badge-safe',
  },
  {
    id: 'analytics',
    icon: BarChart3,
    iconBg: 'bg-[#fef4ec]',
    iconColor: 'text-[#c26c2a]',
    title: 'Real-Time Analytics',
    description: 'Live dashboards, CO₂ diversion tracking, and economic value calculation — all in one workspace. See your waste as an asset, not a liability.',
    badge: 'Live data',
    badgeColor: 'badge-neutral',
  },
]

function FeaturesSection({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <section
      id="how-it-works"
      className="relative bg-[var(--cm-canvas)] py-24 sm:py-32"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <motion.div
          className="mb-14 text-center"
          {...fadeUp()}
          transition={{ duration: reducedMotion ? 0 : 0.5, ease }}
        >
          <p className="eyebrow mb-4 inline-flex items-center gap-2 rounded-full border border-[#d5e6da] bg-white/70 px-3 py-1.5">
            <TrendingUp size={11} />
            How It Works
          </p>
          {/* text-wrap: balance on section title (make-interfaces-feel-better) */}
          <h2
            id="features-heading"
            className="section-title text-3xl sm:text-[2.1rem]"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            Built for industrial-scale circular economy
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#527a6a]">
            Three capabilities working together to turn industrial waste streams into a verified, revenue-generating resource.
          </p>
        </motion.div>

        {/* Feature cards — staggered entrance (motion-ui stagger pattern) */}
        <motion.div
          className="grid gap-6 sm:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.id}
                variants={reducedMotion ? {} : staggerItem}
                className="card card-interactive flex cursor-default flex-col gap-5 p-7"
                whileHover={reducedMotion ? {} : { y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.10)' }}
                transition={{ duration: 0.2 }}
              >
                {/* Concentric radius: icon container outer (rounded-2xl = 16px) matches inner with padding */}
                <div className={`grid h-12 w-12 place-items-center rounded-2xl ${f.iconBg}`}>
                  <Icon size={22} className={f.iconColor} strokeWidth={2} />
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    {/* text-wrap: balance on card titles */}
                    <h3
                      className="text-base font-bold tracking-[-0.03em] text-[var(--cm-ink)]"
                      style={{ textWrap: 'balance' } as React.CSSProperties}
                    >
                      {f.title}
                    </h3>
                    <span className={`${f.badgeColor} text-[10px]`}>{f.badge}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-[#527a6a]">{f.description}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CtaBanner({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <section className="hero-mesh py-20" aria-label="Call to action">
      <motion.div
        className="mx-auto max-w-7xl px-5 text-center sm:px-8"
        {...fadeUp()}
        transition={{ duration: reducedMotion ? 0 : 0.5, ease }}
      >
        <p className="eyebrow mb-4 inline-flex items-center gap-2 text-[#9ecbb5]">
          <Leaf size={11} />
          Join the platform
        </p>
        <h2
          className="mb-5 text-3xl font-bold tracking-[-0.055em] text-white sm:text-4xl"
          style={{ textWrap: 'balance' } as React.CSSProperties}
        >
          Ready to monetise your waste?
        </h2>
        <p className="mx-auto mb-8 max-w-md text-base text-[#a8d5be]">
          List your first material in under 5 minutes. Our AI finds matching buyers instantly.
        </p>
        <motion.div
          whileTap={reducedMotion ? {} : { scale: 0.97 }}
          whileHover={reducedMotion ? {} : { scale: 1.02 }}
          transition={{ duration: 0.15 }}
          className="inline-block"
        >
          <Link
            to="/auth"
            id="landing-banner-cta"
            className="btn-primary inline-flex cursor-pointer items-center gap-2 px-7 py-4 text-base"
          >
            Get Started Free
            <ArrowRight size={17} />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}

// ─── Landing Footer ───────────────────────────────────────────────────────────
function LandingFooter() {
  return (
    <footer className="sidebar-surface border-t border-white/8 py-10" role="contentinfo">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-5 sm:flex-row sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <CircularMark size={32} />
          <div>
            <p className="text-sm font-bold tracking-[-0.04em] text-white">
              CIRCULAR<span style={{ color: 'var(--cm-mint)' }}>MATCH</span>
            </p>
            <p className="text-[10px] text-[#7ab09a]">Material Intelligence · Delhi NCR</p>
          </div>
        </div>
        <nav aria-label="Footer navigation" className="flex items-center gap-6 text-sm text-[#9ecbb5]">
          <Link to="/terms" className="transition-colors duration-150 hover:text-white">Terms</Link>
          <Link to="/privacy" className="transition-colors duration-150 hover:text-white">Privacy</Link>
          <Link to="/auth" className="transition-colors duration-150 hover:text-white">Sign In</Link>
        </nav>
        <p className="text-xs text-[#5a8a78]">
          © {new Date().getFullYear()} CircularMatch. Illustrative demo data.
        </p>
      </div>
    </footer>
  )
}

// ─── Page export ──────────────────────────────────────────────────────────────
export function LandingPage() {
  // motion-ui: respect prefers-reduced-motion across all animations
  const reducedMotion = useReducedMotion() ?? false

  return (
    <>
      <title>CircularMatch — Turn Industrial Waste into Verified Revenue</title>
      <meta
        name="description"
        content="CircularMatch uses AI to match waste generators with certified recyclers across Delhi NCR. Free to list, instant matching."
      />
      <div className="flex min-h-screen flex-col">
        <LandingNav />
        <main id="main-content">
          <HeroSection reducedMotion={reducedMotion} />
          <SocialProofStrip reducedMotion={reducedMotion} />
          <ImpactStats reducedMotion={reducedMotion} />
          <FeaturesSection reducedMotion={reducedMotion} />
          <CtaBanner reducedMotion={reducedMotion} />
        </main>
        <LandingFooter />
      </div>
    </>
  )
}
