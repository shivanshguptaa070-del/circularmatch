import { useState, useEffect } from 'react';
import HeroVisual from '../components/landing/HeroVisual';
import {
  Leaf,
  MapPin,
  ArrowRight,
  Play,
  CheckCircle2,
  Search,
  Command,
  SlidersHorizontal,
  Bell,
  Home,
  Package,
  BarChart3,
  FileText,
  Settings,
  Sparkles,
  Zap,
  ShieldCheck,
  Building2,
  X,
  Recycle,
  Factory,
  TrendingUp,
  Award,
  Users,
  Globe,
  ChevronDown,
  Star,
  Quote,
  Truck,
  Wallet,
  BarChart,
  Bot,
  Coins,
  Heart,
} from 'lucide-react';

/* =========================================================== */
/*  ROOT                                                      */
/* =========================================================== */
export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 text-slate-900">
      <BackgroundDecor />

      <NavBar />
      <Hero />
      <FeaturesSection />
      <HowItWorksSection />
      <CategoriesSection />
      <CTASection />
      <FAQSection />
      <Footer />
    </div>
  );
}

/* =========================================================== */
/*  SHARED DECOR                                              */
/* =========================================================== */
function BackgroundDecor() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(16,185,129,0.25) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -top-32 -left-24 z-0 h-[480px] w-[480px] rounded-full bg-emerald-200/40 blur-3xl animate-blob"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed top-40 -right-20 z-0 h-[420px] w-[420px] rounded-full bg-teal-200/40 blur-3xl animate-blob"
        style={{ animationDelay: '3s' }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 left-1/3 z-0 h-[380px] w-[380px] rounded-full bg-green-200/40 blur-3xl animate-blob"
        style={{ animationDelay: '6s' }}
      />
    </>
  );
}

function SectionWrapper({
  id,
  children,
  className = '',
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`relative z-10 mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-emerald-200/60 bg-white/80 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.15em] text-emerald-800 shadow-sm backdrop-blur">
      <Sparkles className="h-4 w-4 text-emerald-500" />
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
      {children}
    </h2>
  );
}

function SectionLead({ children }: { children: React.ReactNode }) {
  return (
    <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
      {children}
    </p>
  );
}

/* =========================================================== */
/*  NAV BAR                                                   */
/* =========================================================== */
function NavBar() {
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 mx-auto flex max-w-7xl animate-fade-in-up items-center justify-between bg-emerald-50/70 px-6 py-4 backdrop-blur-md lg:px-10">
      <a href="#" className="flex items-center gap-2 transition hover:opacity-90">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-emerald-100">
          <Leaf className="h-5 w-5 text-emerald-600" strokeWidth={2.2} />
        </div>
        <div className="text-xl font-extrabold tracking-tight">
          CIRCULAR<span className="text-emerald-500">MATCH</span>
        </div>
      </a>

      <nav className="hidden items-center gap-9 text-sm font-medium text-slate-700 md:flex">
        <a href="#features" onClick={scrollTo('features')} className="hover:text-emerald-700 transition">Features</a>
        <a href="#how" onClick={scrollTo('how')} className="hover:text-emerald-700 transition">How it works</a>
        <a href="#marketplace" onClick={scrollTo('marketplace')} className="hover:text-emerald-700 transition">Marketplace</a>
        <a href="#faq" onClick={scrollTo('faq')} className="hover:text-emerald-700 transition">FAQ</a>
      </nav>

      <div className="flex items-center gap-2">
        <a href="/auth" className="hidden text-sm font-semibold text-slate-700 transition hover:text-emerald-700 sm:block px-3 py-2">
          Log in
        </a>
        <a href="/list-waste" className="group shine-wrap relative inline-flex animate-glow items-center gap-2 overflow-hidden rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-700/25 ring-1 ring-emerald-800/20 transition hover:bg-emerald-800">
          Get Started
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:animate-magnetic" />
        </a>
      </div>
    </header>
  );
}

/* =========================================================== */
/*  HERO                                                      */
/* =========================================================== */
function Hero() {
  return (
    <SectionWrapper className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
      <div className="flex flex-col justify-center animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        {/* Location pill */}
        <div
          className="mb-7 inline-flex w-fit animate-fade-in-right items-center gap-2 rounded-full border border-emerald-200/60 bg-white/80 px-3 py-1.5 text-[11px] font-bold tracking-[0.18em] text-emerald-800 shadow-sm backdrop-blur transition hover:scale-[1.03] hover:border-emerald-300 hover:shadow-md"
          style={{ animationDelay: '0.35s' }}
        >
          <MapPin className="h-3.5 w-3.5 text-emerald-600 animate-pop" />
          <span>DELHI NCR</span>
          <span className="h-1 w-1 rounded-full bg-emerald-400 animate-heartbeat" />
          <span>INDUSTRIAL CIRCULAR ECONOMY</span>
        </div>

        <h1
          className="text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl lg:text-[64px] animate-fade-in-up"
          style={{ animationDelay: '0.25s' }}
        >
          Turn your <br />
          industrial waste into{' '}
          <span className="relative inline-block text-emerald-500">
            verified revenue.
            <svg
              className="absolute -bottom-2 left-0 w-full animate-draw-line"
              viewBox="0 0 300 12"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path
                d="M2 8 Q 75 2, 150 6 T 298 4"
                stroke="url(#underlineGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                style={{ animationDuration: '3s' }}
              />
              <defs>
                <linearGradient id="underlineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>
          </span>
        </h1>

        <p
          className="mt-7 max-w-lg text-[17px] leading-relaxed text-slate-600 animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          CircularMatch uses AI to match waste generators with certified recyclers
          across Delhi NCR.{' '}
          <span className="font-bold text-slate-900">Free to list, instant matching.</span>
        </p>

        <div
          className="mt-8 flex flex-wrap items-center gap-4 animate-fade-in-up"
          style={{ animationDelay: '0.55s' }}
        >
          <a
            href="/list-waste"
            className="group shine-wrap relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-emerald-700 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-700/30 ring-1 ring-emerald-800/30 transition-all duration-300 ease-out hover:bg-emerald-800 hover:shadow-emerald-800/40 hover:scale-[1.03]"
          >
            <span className="relative z-10">Get Started Free</span>
            <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            <span className="absolute inset-0 -z-0 animate-gradient-pan rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </a>
          <a
            href="#how"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-md ring-1 ring-slate-200 transition-all duration-300 ease-out hover:bg-slate-50 hover:scale-[1.03] hover:shadow-lg hover:ring-emerald-200"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white transition-transform group-hover:rotate-12">
              <Play className="h-3 w-3 fill-white" />
            </span>
            See How It Works
          </a>
        </div>

        <div
          className="mt-10 flex flex-wrap items-start gap-x-10 gap-y-5 animate-fade-in-up"
          style={{ animationDelay: '0.7s' }}
        >
          {[
            { icon: <CheckCircle2 className="h-3.5 w-3.5" />, title: 'Free to list', sub: 'No hidden fees' },
            { icon: <Zap className="h-3.5 w-3.5" />, title: 'Instant AI matching', sub: 'Find verified partners' },
            { icon: <ShieldCheck className="h-3.5 w-3.5" />, title: 'Verified network', sub: 'Trusted & compliant' },
          ].map((f, i) => (
            <div
              key={i}
              className="group lift-hover flex animate-fade-in-up cursor-pointer items-start gap-2.5 rounded-lg p-1.5 transition-all duration-300 hover:bg-emerald-50/60"
              style={{ animationDelay: `${0.6 + i * 0.08}s` }}
            >
              <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 transition-all duration-300 group-hover:rotate-[360deg] group-hover:bg-emerald-700 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-700/30">
                {f.icon}
              </div>
              <div className="leading-tight">
                <div className="text-sm font-bold text-slate-900 transition-colors duration-200 group-hover:text-emerald-700">{f.title}</div>
                <div className="text-xs text-slate-500">{f.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex animate-fade-in-up items-center gap-3" style={{ animationDelay: '1.1s' }}>
          <Leaf className="h-4 w-4 text-emerald-600 animate-pop" />
          <span className="animate-tagline-pop text-sm font-semibold text-slate-700">
            Cleaner Industries. <span className="text-emerald-700">A Greener Tomorrow.</span>
          </span>
          <span className="animated-underline hidden h-0.5 flex-1 sm:block" />
        </div>
      </div>

      <HeroVisual />
    </SectionWrapper>
  );
}


/* =========================================================== */
/*  FEATURES                                                  */
/* =========================================================== */
function FeaturesSection() {
  const features = [
    {
      icon: <Bot className="h-6 w-6" />,
      title: 'AI-Powered Matching',
      desc: 'Our algorithm reads material specs, geography, certifications and price ranges to find your perfect partner in seconds.',
      tint: 'from-emerald-500 to-teal-500',
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: '100% Verified Network',
      desc: 'Every recycler passes KYC, facility audits and pollution-board checks. We do the verification so you don\'t have to.',
      tint: 'from-sky-500 to-blue-500',
    },
    
    {
      icon: <Wallet className="h-6 w-6" />,
      title: 'Transparent Pricing',
      desc: 'See live market rates per kg before you list. We take zero commission — every rupee goes to you.',
      tint: 'from-violet-500 to-purple-500',
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: 'Material Passports',
      desc: 'Supplier declarations, quality evidence, and compliance triage collected directly into traceable material passports.',
      tint: 'from-rose-500 to-pink-500',
    },
    
  ];

  return (
    <SectionWrapper id="features">
      <div className="text-center">
        <SectionEyebrow>Why CircularMatch</SectionEyebrow>
        <SectionTitle>Everything you need to monetise waste.</SectionTitle>
        <SectionLead>
          From the first listing to the final payout, we make industrial
          circularity simple, compliant and genuinely profitable.
        </SectionLead>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <div
            key={i}
            className="group lift-hover shine-wrap relative flex flex-col items-center text-center rounded-2xl border border-emerald-100/60 bg-white p-6 shadow-sm transition-all duration-500 animate-fade-in-up"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.tint} text-white shadow-lg transition-transform duration-500 group-hover:rotate-[360deg] group-hover:scale-110`}>
              {f.icon}
            </div>
            <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-emerald-700">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Learn more <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

/* =========================================================== */
/*  HOW IT WORKS                                              */
/* =========================================================== */
function HowItWorksSection() {
  const steps = [
    {
      icon: <Package className="h-6 w-6" />,
      title: 'List your material',
      desc: 'Snap a photo, add specs (grade, weight, location). Takes 90 seconds.',
    },
    {
      icon: <Bot className="h-6 w-6" />,
      title: 'Get AI-matched',
      desc: 'Our engine ranks verified recyclers by distance, capacity and material fit.',
    },
    {
      icon: <Truck className="h-6 w-6" />,
      title: 'Review Matches',
      desc: 'Evaluate matched buyers or sellers, review target prices, and negotiate directly.',
    },
    {
      icon: <Wallet className="h-6 w-6" />,
      title: 'Build Material Passport',
      desc: 'Upload quality evidence and lot specifications to create a verified, traceable record.',
    },
  ];

  return (
    <SectionWrapper id="how">
      <div className="text-center">
        <SectionEyebrow>How it works</SectionEyebrow>
        <SectionTitle>Four steps to circularity.</SectionTitle>
        <SectionLead>
          We've compressed what used to be a 3-month tender cycle into a single
          afternoon. Here's how.
        </SectionLead>
      </div>

      <div className="relative mt-14">
        {/* Connecting line */}
        <div className="absolute left-0 right-0 top-12 hidden h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 lg:block" />

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div
              key={i}
              className="group relative animate-fade-in-up text-center"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-100 opacity-50 transition-all duration-500 group-hover:scale-125 group-hover:opacity-100" />
                <div className="absolute inset-2 rounded-full bg-emerald-50 transition-all duration-500 group-hover:bg-emerald-700 group-hover:text-white" />
                <span className="absolute -top-1 -right-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white shadow-md ring-2 ring-white transition-transform duration-500 group-hover:rotate-[360deg]">
                  {i + 1}
                </span>
                <div className="relative z-10 flex h-12 w-12 items-center justify-center text-emerald-700 transition-colors duration-500 group-hover:text-white">
                  {s.icon}
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-emerald-700">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}


/* =========================================================== */
/*  CATEGORIES                                                */
/* =========================================================== */
function CategoriesSection() {
  const [categories, setCategories] = useState<{name: string, count: number, emoji: string, tint: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [materialsRes, listingsRes] = await Promise.all([
          fetch('/api/reference/materials').then(res => res.json()),
          fetch('/api/listings?active_only=true').then(res => res.json())
        ]);
        
        const materials = materialsRes.data || [];
        const listings = listingsRes.data || [];

        const catCounts: Record<string, number> = {};
        listings.forEach((l: any) => {
          const catName = l.material || l.material_category;
          if (catName) {
            catCounts[catName] = (catCounts[catName] || 0) + 1;
          }
        });

        // Tints and emojis map
        const styleMap: Record<string, {emoji: string, tint: string}> = {
          'Plastic': { emoji: '♳', tint: 'from-sky-400 to-blue-500' },
          'Metal': { emoji: '⚙️', tint: 'from-slate-400 to-slate-600' },
          'Paper / Cardboard': { emoji: '📦', tint: 'from-amber-400 to-orange-500' },
          'Textile': { emoji: '🧵', tint: 'from-rose-400 to-pink-500' },
          'Other': { emoji: '♻️', tint: 'from-lime-400 to-emerald-500' },
        };

        const liveCats = materials.map((m: any) => ({
          name: m.canonical_name,
          count: catCounts[m.canonical_name] || 0,
          emoji: styleMap[m.canonical_name]?.emoji || '📦',
          tint: styleMap[m.canonical_name]?.tint || 'from-emerald-400 to-teal-500'
        }));

        setCategories(liveCats);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <SectionWrapper id="marketplace">
      <div className="text-center">
        <SectionEyebrow>Marketplace</SectionEyebrow>
        <SectionTitle>Real materials. Real buyers.</SectionTitle>
        <SectionLead>
          Browse live listings or post yours — every category has certified
          downstream recyclers ready to absorb volume.
        </SectionLead>
      </div>

      <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {loading ? (
           <div className="col-span-full text-center text-slate-500 py-10 animate-pulse">Loading live marketplace data...</div>
        ) : categories.map((c, i) => (
          <a
            key={i}
            href="/listings"
            className="group lift-hover shine-wrap relative flex flex-col items-center gap-3 rounded-2xl border border-emerald-100/60 bg-white p-6 text-center transition-all duration-500 animate-fade-in-up"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div className={`mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${c.tint} text-2xl text-white shadow-md transition-transform duration-500 group-hover:rotate-[10deg] group-hover:scale-110`}>
              {c.emoji}
            </div>
            <div className="text-sm font-bold text-slate-900 transition-colors group-hover:text-emerald-700">{c.name}</div>
            <div className="text-xs text-slate-500">{c.count} active listing{c.count !== 1 ? 's' : ''}</div>
            <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Browse <ArrowRight className="h-3 w-3" />
            </div>
          </a>
        ))}
      </div>
    </SectionWrapper>
  );
}



/* =========================================================== */
/*  CTA                                                       */
/* =========================================================== */
function CTASection() {
  return (
    <SectionWrapper>
      <div className="relative overflow-hidden rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-emerald-100 sm:p-14 animate-fade-in-up">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/50 blur-3xl animate-blob"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-teal-200/50 blur-3xl animate-blob"
          style={{ animationDelay: '3s' }}
        />

        <div className="relative">
          <SectionEyebrow>Ready when you are</SectionEyebrow>
          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Turn industrial by-products into <br className="hidden sm:block" />
            <span className="text-emerald-500">verified circular resources</span>.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-slate-600">
            List your first material in under 3 minutes. Free to list. No
            contract. Just a smarter way to deal with the by-products of doing
            business.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/list-waste"
              className="group shine-wrap relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-emerald-700 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-700/30 transition-all duration-300 hover:scale-[1.03] hover:bg-emerald-800"
            >
              <span className="relative z-10">Get Started Free</span>
              <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
              <span className="absolute inset-0 -z-0 animate-gradient-pan rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </a>
            <a
              href="mailto:shivanshguptaa070@gmail.com?subject=Demo%20Request%20-%20CircularMatch"
              className="group inline-flex items-center gap-3 rounded-full bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 shadow-md ring-1 ring-slate-200 transition-all duration-300 hover:scale-[1.03] hover:bg-slate-50 hover:shadow-lg hover:ring-emerald-200"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white transition-transform group-hover:rotate-12">
                <Play className="h-3 w-3 fill-white" />
              </span>
              Book a demo
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Free to list</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Zero commission</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> 100% verified recyclers</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Traceable Material Passports</span>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

/* =========================================================== */
/*  FAQ                                                       */
/* =========================================================== */
function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/reference/stats')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setStats(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const qs = [
    {
      q: 'How does the AI matching work?',
      a: 'Our matching engine compares your material specifications (category, quality, quantity) against the active requirements of verified buyers in our network to find the most profitable and compliant matches.',
    },
    {
      q: 'What is a Material Passport?',
      a: 'A Material Passport is a digital record that collects your supplier declarations, quality evidence, and compliance documents into a single, traceable profile for your listed materials.',
    },
    {
      q: 'Is CircularMatch really free for waste generators?',
      a: 'Yes. We charge zero commission on your listings. The platform is completely free for waste generators to find matches, explore market rates, and build Material Passports.',
    },
    {
      q: 'How are the buyers verified?',
      a: 'Every buyer in our network passes verification checks including KYC and pollution-control board certifications to ensure compliant, legal, and responsible recycling.',
    },
    {
      q: 'What happens after I find a match?',
      a: 'Once you accept a match, you connect directly with the buyer to finalize logistics and payment terms. CircularMatch provides the intelligence and matchmaking, while you retain full control over your actual transactions.',
    },
  ];

  return (
    <SectionWrapper id="faq">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionEyebrow>FAQ</SectionEyebrow>
          <SectionTitle>Everything you wanted to ask.</SectionTitle>
          <SectionLead>
            Have a different question? Reach our team at{' '}
            <a href="mailto:shivanshguptaa070@gmail.com" className="font-semibold text-emerald-700 underline-offset-2 hover:underline">
              shivanshguptaa070@gmail.com
            </a>{' '}
            — usually a 2-hour reply window.
          </SectionLead>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="group lift-hover rounded-xl border border-emerald-100/60 bg-white p-4 transition-all duration-300 hover:border-emerald-300">
              <Users className="h-5 w-5 text-emerald-600 transition-transform group-hover:rotate-[360deg]" />
              <div className="mt-2 text-2xl font-extrabold text-slate-900">{stats?.businesses || '500+'}</div>
              <div className="text-xs text-slate-500">Businesses active</div>
            </div>
            <div className="group lift-hover rounded-xl border border-emerald-100/60 bg-white p-4 transition-all duration-300 hover:border-emerald-300">
              <Package className="h-5 w-5 text-emerald-600 transition-transform group-hover:rotate-[360deg]" />
              <div className="mt-2 text-2xl font-extrabold text-slate-900">{stats?.listings || '50+'}</div>
              <div className="text-xs text-slate-500">Active listings</div>
            </div>
            <div className="group lift-hover rounded-xl border border-emerald-100/60 bg-white p-4 transition-all duration-300 hover:border-emerald-300">
              <Award className="h-5 w-5 text-emerald-600 transition-transform group-hover:rotate-[360deg]" />
              <div className="mt-2 text-2xl font-extrabold text-slate-900">{stats?.materials || '15+'}</div>
              <div className="text-xs text-slate-500">Materials supported</div>
            </div>
            <div className="group lift-hover rounded-xl border border-emerald-100/60 bg-white p-4 transition-all duration-300 hover:border-emerald-300">
              <Building2 className="h-5 w-5 text-emerald-600 transition-transform group-hover:rotate-[360deg]" />
              <div className="mt-2 text-2xl font-extrabold text-slate-900">{stats?.requirements || '20+'}</div>
              <div className="text-xs text-slate-500">Active buyers</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="space-y-3">
            {qs.map((item, i) => (
              <div
                key={i}
                className="group overflow-hidden rounded-2xl border border-emerald-100/60 bg-white shadow-sm transition-all duration-500 hover:border-emerald-300 hover:shadow-md"
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-bold text-slate-900 transition-colors group-hover:text-emerald-700 sm:text-base">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-500 ${open === i ? 'rotate-180 text-emerald-600' : ''}`}
                  />
                </button>
                <div
                  className="grid transition-all duration-500 ease-in-out"
                  style={{ gridTemplateRows: open === i ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

/* =========================================================== */
/*  FOOTER                                                    */
/* =========================================================== */
function Footer() {
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const linkCols = [
    {
      title: 'Product',
      links: [
        { label: 'Marketplace', href: '#marketplace' },
        { label: 'How it works', href: '#how' },
        { label: 'List Waste', href: '/list-waste' },
        { label: 'Material Passports', href: '/dashboard' },
      ],
    },
    {
      title: 'Platform',
      links: [
        { label: 'AI Matching', href: '#features' },
        { label: 'Verified Network', href: '#features' },
        { label: 'Zero Commission', href: '#features' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'FAQ', href: '#faq' },
        { label: 'Support & Help', href: 'mailto:shivanshguptaa070@gmail.com' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
      ],
    },
  ];
  return (
    <footer className="relative z-10 mt-12 border-t border-emerald-100/60 bg-white/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md">
                <Leaf className="h-5 w-5" />
              </div>
              <div className="text-xl font-extrabold tracking-tight">
                CIRCULAR<span className="text-emerald-500">MATCH</span>
              </div>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">
              The AI-powered marketplace turning industrial waste into verified
              revenue across India's biggest manufacturing hubs.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[
                { label: 'Twitter', path: 'M22 5.92a8.38 8.38 0 0 1-2.36.64 4.13 4.13 0 0 0 1.8-2.27 8.19 8.19 0 0 1-2.6 1 4.1 4.1 0 0 0-7 3.74A11.65 11.65 0 0 1 3 4.79a4.1 4.1 0 0 0 1.27 5.47 4.07 4.07 0 0 1-1.86-.51v.05a4.1 4.1 0 0 0 3.29 4.02 4.13 4.13 0 0 1-1.85.07 4.1 4.1 0 0 0 3.83 2.85A8.23 8.23 0 0 1 2 18.41a11.61 11.61 0 0 0 6.29 1.84c7.55 0 11.68-6.25 11.68-11.68l-.01-.53A8.36 8.36 0 0 0 22 5.92z' },
                { label: 'LinkedIn', path: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.34 18.34H5.67V9.99h2.67v8.35zM7 8.82a1.55 1.55 0 1 1 0-3.1 1.55 1.55 0 0 1 0 3.1zm11.34 9.52h-2.67v-4.06c0-.97-.02-2.22-1.35-2.22-1.36 0-1.57 1.06-1.57 2.15v4.13H10.1V9.99h2.56v1.14h.04a2.81 2.81 0 0 1 2.53-1.39c2.7 0 3.2 1.78 3.2 4.1v4.5z' },
                { label: 'GitHub', path: 'M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.18c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11.04 11.04 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.77.11 3.06.73.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56C20.21 21.38 23.5 17.08 23.5 12c0-6.35-5.15-11.5-11.5-11.5z' },
              ].map((s, i) => (
                <a
                  key={i}
                  aria-label={s.label}
                  href="#"
                  className="group flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-emerald-100 transition-all duration-300 hover:scale-110 hover:bg-emerald-700 hover:text-white hover:shadow-md"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 transition-transform group-hover:rotate-[360deg]">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {linkCols.map((col, i) => (
            <div key={i}>
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      onClick={l.href.startsWith('#') ? scrollTo(l.href.slice(1)) : undefined}
                      className="text-sm text-slate-600 transition hover:text-emerald-700"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-emerald-100/60 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Leaf className="h-3.5 w-3.5 text-emerald-600" />
            <span>© 2026 CircularMatch Technologies Pvt. Ltd. · Made with intent in Delhi NCR.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-soft-ping rounded-full bg-emerald-500/70" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

