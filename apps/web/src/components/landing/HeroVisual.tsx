import React from 'react';
import { ArrowRight, Leaf, Sparkles, X, Building2 } from 'lucide-react';
import DashboardVisual from './DashboardVisual';

/* =========================================================== */
/*  SHARED ATOMS                                               */
/* =========================================================== */
function Avatar({ bg, icon }: { bg: string; icon?: React.ReactNode }) {
  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-white transition-all duration-300 hover:scale-110 hover:ring-4 hover:shadow-md ${bg}`}
    >
      {icon ? icon : <div className="h-5 w-5 rounded-full bg-slate-400/40" />}
    </div>
  );
}

function Sparkle({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden>
      <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
    </svg>
  );
}

function BrowserWindow({ children }: { children: React.ReactNode }) {
  return (
    <div className="lift-hover shine-wrap relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-2xl shadow-emerald-900/10 ring-1 ring-white/60">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-rose-400 transition hover:scale-125" />
        <span className="h-3 w-3 rounded-full bg-amber-400 transition hover:scale-125" />
        <span className="h-3 w-3 rounded-full bg-emerald-400 transition hover:scale-125" />
        <div className="mx-auto flex h-7 w-2/3 max-w-md items-center justify-center gap-2 rounded-md bg-white px-3 text-[11px] text-slate-500 ring-1 ring-slate-200 transition hover:ring-emerald-200">
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-emerald-600 text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-2 w-2">
              <rect x="5" y="11" width="14" height="10" rx="1.5" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </span>
          <span>app.circularmatch.com</span>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function HeroVisual() {
  return (
    <div className="relative animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
      <div className="relative">
        {/* Confetti */}
        <div className="pointer-events-none absolute -top-6 left-1/2 z-10 h-20 w-20 -translate-x-1/2">
          {[
            { left: '10%', color: '#34d399', delay: '0s' },
            { left: '30%', color: '#fbbf24', delay: '0.4s' },
            { left: '50%', color: '#60a5fa', delay: '0.8s' },
            { left: '70%', color: '#f87171', delay: '0.2s' },
            { left: '90%', color: '#a78bfa', delay: '0.6s' },
          ].map((p, i) => (
            <span
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full animate-confetti"
              style={{ left: p.left, bottom: 0, backgroundColor: p.color, animationDelay: p.delay }}
            />
          ))}
        </div>

        {/* Notification */}
        <div className="absolute -right-3 top-2 z-20 hidden w-[300px] rotate-[2deg] animate-fade-in-up md:block" style={{ animationDelay: '0.4s' }}>
          <div className="lift-hover rounded-2xl bg-white p-3.5 shadow-xl shadow-slate-900/15 ring-1 ring-slate-100">
            <svg aria-hidden className="absolute -right-3 -top-3 h-10 w-10 text-amber-400" viewBox="0 0 100 100" fill="none">
              <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="50" y1="10" x2="50" y2="0" />
                <line x1="80" y1="20" x2="88" y2="12" />
                <line x1="90" y1="50" x2="100" y2="50" />
                <line x1="80" y1="80" x2="88" y2="88" />
                <line x1="20" y1="20" x2="12" y2="12" />
                <line x1="10" y1="50" x2="0" y2="50" />
              </g>
            </svg>
            <div className="flex items-start gap-3">
              <div className="relative">
                <div className="absolute inset-0 animate-soft-ping rounded-xl bg-emerald-400/60" />
                <div className="relative flex h-10 w-10 animate-pop items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
                  <Sparkles className="h-4 w-4 text-emerald-700" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between">
                  <div className="text-sm font-bold text-slate-900">New Match Found</div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-400">now</div>
                </div>
                <p className="mt-0.5 text-[12px] leading-snug text-slate-600">
                  A manufacturer is interested in your{' '}
                  <span className="font-semibold text-slate-900">PET Plastic Flakes</span>.
                </p>
                <div className="mt-2.5 flex items-center gap-3 text-[11px] font-semibold">
                  <a href="#" className="inline-flex items-center gap-1 text-emerald-700 hover:underline">
                    View match <ArrowRight className="h-3 w-3" />
                  </a>
                  <a href="#" className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600">
                    <X className="h-3 w-3" /> Dismiss
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Impact */}
        <div className="absolute -left-6 bottom-32 z-20 hidden w-[270px] -rotate-[3deg] animate-fade-in-up sm:block" style={{ animationDelay: '0.6s' }}>
          <div className="lift-hover rounded-2xl bg-emerald-900 p-4 text-white shadow-2xl shadow-emerald-900/30 ring-1 ring-emerald-800">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-emerald-200/80">
              <div className="flex items-center gap-2">
                <Leaf className="h-3.5 w-3.5" />
                <span>Impact</span>
                <span className="text-emerald-300/60">·</span>
                <span>This month</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-700/50 px-2 py-0.5 text-[10px] font-bold ring-1 ring-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                18%
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="animate-count-pulse text-4xl font-extrabold tracking-tight">2.4</span>
              <span className="text-base font-semibold text-emerald-100">tonnes</span>
            </div>
            <div className="mt-0.5 text-xs text-emerald-200/80">Material diverted from disposal</div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-emerald-800/60">
              <div className="relative h-full w-2/3 overflow-hidden rounded-full">
                <div className="absolute inset-0 animate-shimmer rounded-full bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Trusted by */}
        <div className="absolute -bottom-4 right-2 z-20 hidden w-[230px] rotate-[2deg] animate-fade-in-up md:block" style={{ animationDelay: '0.8s' }}>
          <div className="lift-hover rounded-2xl bg-white p-3.5 shadow-xl shadow-slate-900/15 ring-1 ring-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5 transition-transform duration-300 hover:scale-105">
                <Avatar bg="bg-amber-200" />
                <Avatar bg="bg-rose-200" />
                <Avatar bg="bg-yellow-200" icon={<Building2 className="h-3.5 w-3.5 text-slate-500" />} />
              </div>
              <div className="leading-tight">
                <div className="text-[12px] font-bold text-slate-900">Trusted by 500+ businesses</div>
                <div className="text-[11px] text-slate-500">across Delhi NCR</div>
              </div>
            </div>
          </div>
        </div>

        {/* Annotations */}
        <div className="pointer-events-none absolute -right-2 top-44 hidden -rotate-6 font-serif text-base italic text-slate-700 lg:block">
          Real connections.
          <br />
          Real impact.
          <svg aria-hidden className="absolute -bottom-12 left-4 h-12 w-20 text-slate-700" viewBox="0 0 80 50" fill="none">
            <path d="M5 5 C 25 30, 40 35, 65 45" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M58 38 L 65 45 L 60 50" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="pointer-events-none absolute -bottom-2 right-4 hidden -rotate-6 font-serif text-base italic text-slate-700 lg:block">
          <span className="block">Waste today.</span>
          <span className="block text-emerald-700 underline decoration-emerald-400 decoration-2 underline-offset-4">
            Value tomorrow.
          </span>
        </div>

        {/* Sparkles */}
        <Sparkle className="absolute right-2 top-2 h-4 w-4 text-emerald-500 animate-twinkle" />
        <Sparkle className="absolute bottom-32 -left-3 h-3 w-3 text-emerald-400 animate-twinkle" style={{ animationDelay: '0.5s' }} />
        <Sparkle className="absolute right-1/2 top-3 h-2.5 w-2.5 text-amber-400 animate-twinkle" style={{ animationDelay: '1s' }} />
        <Sparkle className="absolute right-12 top-1/3 h-2 w-2 text-emerald-400 animate-twinkle" style={{ animationDelay: '1.5s' }} />
        <Sparkle className="absolute bottom-1/2 left-4 h-2.5 w-2.5 text-amber-300 animate-twinkle" style={{ animationDelay: '2s' }} />

        <BrowserWindow>
          <DashboardVisual />
        </BrowserWindow>
      </div>
    </div>
  );
}
