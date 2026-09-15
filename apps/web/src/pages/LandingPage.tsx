import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, Bot, CheckCircle2, Leaf, MapPin, ShieldCheck, Sparkles, TrendingUp, Zap } from 'lucide-react'
import { CircularMark } from '../components/ui'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

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
function useCountUp(target: number, duration = 1600, enabled = true) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!enabled || target === 0) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, enabled])
  return value
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  prefix = '',
  suffix = '',
  animate,
}: {
  label: string
  value: number
  prefix?: string
  suffix?: string
  animate: boolean
}) {
  const displayed = useCountUp(value, 1600, animate)
  const formatted = displayed >= 1000
    ? displayed >= 100000
      ? (displayed / 100000).toFixed(1) + 'L'
      : displayed.toLocaleString('en-IN')
    : displayed.toString()

  return (
    <div className="flex flex-col items-center gap-2 px-8 py-6 text-center">
      <p className="text-4xl font-bold tracking-[-0.06em] text-white sm:text-5xl">
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
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#07343a]/90 shadow-[0_1px_0_rgba(255,255,255,.06)] backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 rounded-xl p-1 transition hover:opacity-90" aria-label="CircularMatch home">
          <CircularMark size={38} />
          <span className="text-[16px] font-bold tracking-[-0.05em] text-white">
            CIRCULAR<span style={{ color: 'var(--cm-mint)' }}>MATCH</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-3">
          <a
            href="#how-it-works"
            className="hidden text-sm font-medium text-[#bce7cf] transition hover:text-white sm:block"
          >
            How it works
          </a>
          <Link
            to="/auth"
            className="btn-primary px-5 py-2.5 text-sm"
            id="landing-nav-signin"
          >
            Sign In
          </Link>
        </div>
      </nav>
    </header>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="hero-mesh relative min-h-screen pt-24 pb-20 sm:pt-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10">

          {/* Left: copy + CTAs */}
          <div className="relative z-10 flex flex-col gap-7">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
              <MapPin size={12} className="text-mint" />
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#bce7cf]">
                Delhi NCR · Industrial Circular Economy
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-bold leading-[1.04] tracking-[-0.055em] text-white sm:text-5xl lg:text-[3.4rem]">
              Turn your industrial
              <br />
              waste into{' '}
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
            </h1>

            {/* Subtext */}
            <p className="max-w-[520px] text-lg leading-relaxed text-[#a8d5be]">
              CircularMatch uses AI to match waste generators with certified recyclers
              across Delhi NCR.{' '}
              <span className="font-semibold text-white">Free to list, instant matching.</span>
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5">
              <Link
                to="/auth"
                id="landing-cta-get-started"
                className="btn-primary inline-flex items-center gap-2 px-6 py-3.5 text-base"
              >
                Get Started Free
                <ArrowRight size={17} />
              </Link>
              <a
                href="#how-it-works"
                id="landing-cta-how-it-works"
                className="btn-secondary inline-flex items-center gap-2 border-white/20 bg-white/10 px-6 py-3.5 text-base text-white backdrop-blur-sm hover:bg-white/15 hover:border-white/30"
              >
                See How It Works
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-5 pt-2">
              {[
                { icon: CheckCircle2, text: 'Free to list' },
                { icon: Zap, text: 'Instant AI matching' },
                { icon: ShieldCheck, text: 'Verified network' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-[#9ecbb5]">
                  <Icon size={14} className="text-mint" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Right: glassmorphism match preview card */}
          <div className="hero-orbit relative hidden lg:flex lg:justify-center">
            <div
              className="hero-flow-card relative w-[340px] rounded-3xl p-6"
              role="presentation"
              aria-hidden="true"
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
                      <span className="w-8 text-right text-[11px] font-semibold text-white">{score}%</span>
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

            {/* Floating badge */}
            <div className="glass-panel absolute -bottom-6 -left-4 flex items-center gap-2.5 rounded-2xl px-4 py-3">
              <Bot size={16} className="text-mint" />
              <div>
                <p className="text-[10px] font-bold text-white">6-parameter AI engine</p>
                <p className="text-[9px] text-[#9ecbb5]">Material · Quality · Distance · Price</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Impact Stats Strip ───────────────────────────────────────────────────────
function ImpactStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fetch from API
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
        if (kpis) {
          setStats({
            wasteKgWeek: kpis.total_waste_listed_kg_week ?? FALLBACK_STATS.wasteKgWeek,
            activeBuyers: kpis.active_buyers ?? FALLBACK_STATS.activeBuyers,
            platformValueInr: kpis.potential_economic_value_inr ?? FALLBACK_STATS.platformValueInr,
          })
        } else {
          setStats(FALLBACK_STATS)
        }
      })
      .catch(() => setStats(FALLBACK_STATS))
      .finally(() => clearTimeout(timeout))

    return () => { clearTimeout(timeout); controller.abort() }
  }, [])

  // Trigger count-up when section scrolls into view
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
    <section
      ref={ref}
      className="sidebar-surface relative border-y border-white/8"
      aria-label="Platform impact statistics"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid divide-y divide-white/8 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <StatCard
            label="Total Waste Listed (kg / week)"
            value={s.wasteKgWeek}
            suffix=" kg"
            animate={visible}
          />
          <StatCard
            label="Active Buyers on Platform"
            value={s.activeBuyers}
            animate={visible}
          />
          <StatCard
            label="Platform Economic Value"
            value={s.platformValueInr}
            prefix="₹"
            animate={visible}
          />
        </div>
      </div>
    </section>
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
    description:
      'Our 6-parameter scoring engine evaluates material type, quality grade, quantity fit, distance, price, and environmental impact in real time — surfacing only the most relevant buyers for your waste stream.',
    badge: 'Instant',
    badgeColor: 'badge-safe',
  },
  {
    id: 'verified-network',
    icon: ShieldCheck,
    iconBg: 'bg-[#eaf4ff]',
    iconColor: 'text-[#2a6fad]',
    title: 'Verified Network',
    description:
      'Every recycler is pre-screened and onboarded. Every material lot gets a digital passport with chain-of-custody evidence — so you always know exactly where your material is going.',
    badge: 'Trusted',
    badgeColor: 'badge-safe',
  },
  {
    id: 'analytics',
    icon: BarChart3,
    iconBg: 'bg-[#fef4ec]',
    iconColor: 'text-[#c26c2a]',
    title: 'Real-Time Analytics',
    description:
      'Live dashboards, CO₂ diversion tracking, and economic value calculation — all in one workspace. See your waste as an asset, not a liability.',
    badge: 'Live data',
    badgeColor: 'badge-neutral',
  },
]

function FeaturesSection() {
  return (
    <section
      id="how-it-works"
      className="relative bg-[var(--cm-canvas)] py-24 sm:py-32"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="eyebrow mb-4 inline-flex items-center gap-2 rounded-full border border-[#d5e6da] bg-white/70 px-3 py-1.5">
            <TrendingUp size={11} />
            How It Works
          </p>
          <h2 id="features-heading" className="section-title text-3xl sm:text-[2.1rem]">
            Built for industrial-scale circular economy
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#527a6a]">
            Three capabilities working together to turn industrial waste streams into a verified, revenue-generating resource.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.id} className="card card-interactive flex flex-col gap-5 p-7">
                <div className={`grid h-12 w-12 place-items-center rounded-2xl ${f.iconBg}`}>
                  <Icon size={22} className={f.iconColor} strokeWidth={2} />
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold tracking-[-0.03em] text-[var(--cm-ink)]">
                      {f.title}
                    </h3>
                    <span className={`${f.badgeColor} text-[10px]`}>{f.badge}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-[#527a6a]">{f.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CtaBanner() {
  return (
    <section className="hero-mesh py-20" aria-label="Call to action">
      <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
        <p className="eyebrow mb-4 inline-flex items-center gap-2 text-[#9ecbb5]">
          <Leaf size={11} />
          Join the platform
        </p>
        <h2 className="mb-5 text-3xl font-bold tracking-[-0.055em] text-white sm:text-4xl">
          Ready to monetise your waste?
        </h2>
        <p className="mx-auto mb-8 max-w-md text-base text-[#a8d5be]">
          List your first material in under 5 minutes. Our AI finds matching buyers instantly.
        </p>
        <Link
          to="/auth"
          id="landing-banner-cta"
          className="btn-primary inline-flex items-center gap-2 px-7 py-4 text-base"
        >
          Get Started Free
          <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  )
}

// ─── Landing Footer ───────────────────────────────────────────────────────────
function LandingFooter() {
  return (
    <footer className="sidebar-surface border-t border-white/8 py-10" role="contentinfo">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-5 sm:flex-row sm:justify-between sm:px-8">
        {/* Logo + tagline */}
        <div className="flex items-center gap-3">
          <CircularMark size={32} />
          <div>
            <p className="text-sm font-bold text-white tracking-[-0.04em]">
              CIRCULAR<span style={{ color: 'var(--cm-mint)' }}>MATCH</span>
            </p>
            <p className="text-[10px] text-[#7ab09a]">Material Intelligence · Delhi NCR</p>
          </div>
        </div>

        {/* Links */}
        <nav aria-label="Footer navigation" className="flex items-center gap-6 text-sm text-[#9ecbb5]">
          <Link to="/terms" className="transition hover:text-white">Terms</Link>
          <Link to="/privacy" className="transition hover:text-white">Privacy</Link>
          <Link to="/auth" className="transition hover:text-white">Sign In</Link>
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
          <HeroSection />
          <ImpactStats />
          <FeaturesSection />
          <CtaBanner />
        </main>
        <LandingFooter />
      </div>
    </>
  )
}
