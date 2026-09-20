import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import type { ActiveMode } from '../lib/supabase'
import {
  Leaf,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Building2,
  User,
  PackageSearch,
  Recycle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

const MODE_OPTIONS: { id: ActiveMode; label: string; subtitle: string; icon: typeof Recycle }[] = [
  { id: 'selling', label: 'Sell', subtitle: 'List industrial by-products', icon: Recycle },
  { id: 'sourcing', label: 'Buy', subtitle: 'Source secondary materials', icon: PackageSearch },
]

function validateAuthenticEmail(rawEmail: string): string | null {
  const email = rawEmail.trim().toLowerCase()
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address (e.g., name@company.com).'
  }
  return null
}

function Sparkle({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden>
      <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
    </svg>
  );
}

export function AuthPage({ onAuth, defaultStep = 'signin' }: { onAuth: () => void; defaultStep?: 'signin' | 'signup' | 'reset' }) {
  const [step, setStep] = useState<'signin' | 'signup' | 'reset'>(defaultStep)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [activeMode, setActiveMode] = useState<ActiveMode>('selling')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [emailFocus, setEmailFocus] = useState(false)
  const [pwFocus, setPwFocus] = useState(false)
  const [nameFocus, setNameFocus] = useState(false)
  const [companyFocus, setCompanyFocus] = useState(false)

  const isSignin = step === 'signin';
  const isReset = step === 'reset';

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    // Strict authentic email validation
    const emailValidationError = validateAuthenticEmail(email)
    if (emailValidationError) {
      setError(emailValidationError)
      return
    }

    setLoading(true)
    try {
      if (step === 'signin') {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (err) throw err
        onAuth()
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName.trim(),
              company_name: companyName.trim(),
              active_mode: activeMode,
            },
          },
        })
        if (err) throw err
        if (data.session) {
          onAuth()
        } else {
          setSuccessMsg('Account created! Please check your email inbox to verify your account.')
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed.'
      if (msg.toLowerCase().includes('rate limit')) {
        setError('Supabase email rate limit reached. Please use "Continue with Google" for instant login, or disable email confirmation in your Supabase dashboard.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    setError(null)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      })
      if (error) throw error
      setSuccessMsg('Confirmation email resent! Please check your inbox.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend confirmation email.')
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    const emailValidationError = validateAuthenticEmail(email)
    if (emailValidationError) {
      setError(emailValidationError)
      return
    }

    setLoading(true)
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (err) throw err
      setSuccessMsg('Password reset link sent! Please check your email.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link.')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: string) => {
    setOauthLoading(provider)
    setError(null)
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: provider as 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (err) throw err
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'OAuth sign-in failed.')
      setOauthLoading(null)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 text-slate-900">
      {/* Landing-style dot pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(16,185,129,0.25) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />

      {/* Landing-style drifting blobs (3 like the landing) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 h-[480px] w-[480px] rounded-full bg-emerald-200/40 blur-3xl animate-blob"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 -right-20 h-[420px] w-[420px] rounded-full bg-teal-200/40 blur-3xl animate-blob"
        style={{ animationDelay: '3s' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-1/3 h-[380px] w-[380px] rounded-full bg-green-200/40 blur-3xl animate-blob"
        style={{ animationDelay: '6s' }}
      />

      {/* Twinkling sparkles scattered like the hero */}
      <Sparkle className="absolute left-[8%] top-[14%] h-4 w-4 text-emerald-500 animate-twinkle" />
      <Sparkle className="absolute right-[10%] top-[20%] h-3 w-3 text-emerald-400 animate-twinkle" style={{ animationDelay: '0.5s' }} />
      <Sparkle className="absolute left-[12%] bottom-[18%] h-3 w-3 text-amber-400 animate-twinkle" style={{ animationDelay: '1s' }} />
      <Sparkle className="absolute right-[14%] bottom-[24%] h-2 w-2 text-emerald-400 animate-twinkle" style={{ animationDelay: '1.5s' }} />
      <Sparkle className="absolute left-[20%] top-[55%] h-2.5 w-2.5 text-amber-300 animate-twinkle" style={{ animationDelay: '2s' }} />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-10">
        {/* ===== Logo + branding (landing style) ===== */}
        <div className="mb-7 flex animate-fade-in-up flex-col items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 -m-2 animate-pulse-ring rounded-full bg-emerald-400/40" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl shadow-emerald-700/20 ring-1 ring-emerald-100 animate-pop">
              <Leaf className="h-7 w-7 text-emerald-600" strokeWidth={2.2} />
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-extrabold tracking-tight text-slate-900 font-display">
              CIRCULAR<span className="text-emerald-500">MATCH</span>
            </div>
            {/* Material intelligence plate — slight emerald tint, mirroring the brand */}
            <div className="mt-1.5 inline-block rounded-full bg-emerald-100/70 px-2.5 py-0.5 text-[10px] font-bold tracking-[0.28em] text-emerald-700">
              MATERIAL INTELLIGENCE PLATFORM
            </div>
          </div>
        </div>

        {/* ===== Hackathon Judge Access Card ===== */}
        <div
          className="relative w-full max-w-[420px] animate-fade-in-up mb-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 shadow-lg shadow-amber-900/10"
          style={{ animationDelay: '0.05s' }}
        >
          {/* Amber accent line */}
          <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-[11px] font-bold text-white">🏆</span>
            <div>
              <p className="text-[13px] font-bold text-amber-900">Hackathon Demo Access</p>
              <p className="text-[10.5px] text-amber-700">1-click judge login — isolated demo data</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {([
              { role: 'seller', name: 'Aarav Sharma', company: 'Noida PackForm Industries — Seller', color: 'emerald' },
              { role: 'buyer', name: 'Kiran Mehta', company: 'ReLoop Polymers — Buyer', color: 'teal' },
              { role: 'admin', name: 'Rhea Kapoor', company: 'CircularMatch — Admin', color: 'violet' },
            ] as const).map(({ role, name, company, color }) => (
              <button
                key={role}
                id={`demo-login-${role}`}
                onClick={async () => {
                  await supabase.auth.signOut()
                  localStorage.setItem('cm_demo', role)
                  localStorage.setItem('cm_active_mode', role === 'seller' ? 'selling' : role === 'buyer' ? 'sourcing' : 'admin')
                  window.location.href = `/dashboard?demo=${role}`
                }}
                className={`group flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-all duration-200 hover:scale-[1.015] hover:shadow-md ${
                  color === 'emerald'
                    ? 'border-emerald-200 bg-white hover:border-emerald-400 hover:bg-emerald-50'
                    : color === 'teal'
                    ? 'border-teal-200 bg-white hover:border-teal-400 hover:bg-teal-50'
                    : 'border-violet-200 bg-white hover:border-violet-400 hover:bg-violet-50'
                }`}
              >
                <div>
                  <p className="text-[12.5px] font-bold text-slate-900">{name}</p>
                  <p className="text-[10.5px] text-slate-500">{company}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  color === 'emerald'
                    ? 'bg-emerald-100 text-emerald-700'
                    : color === 'teal'
                    ? 'bg-teal-100 text-teal-700'
                    : 'bg-violet-100 text-violet-700'
                }`}>
                  {role}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ===== Auth card (light theme matching landing) ===== */}
        <div
          className="relative w-full max-w-[420px] animate-fade-in-up rounded-3xl border border-emerald-100/60 bg-white/80 p-7 shadow-2xl shadow-emerald-900/10 backdrop-blur-xl sm:p-8"
          style={{ animationDelay: '0.15s' }}
        >
          {/* Top emerald accent line */}
          <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

          {step !== 'reset' && (
            <>
              {/* Mode toggle */}
              <div className="relative mb-6 rounded-full border border-emerald-100 bg-emerald-50/60 p-1 shadow-inner">
                <div
                  className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-700/30 transition-all duration-500 ease-out"
                  style={{ left: isSignin ? '4px' : 'calc(50% + 0px)' }}
                />
                <div className="relative flex">
                  <button
                    onClick={() => { setStep('signin'); setError(null); setSuccessMsg(null); }}
                    className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                      isSignin ? 'text-white' : 'text-slate-600 hover:text-emerald-700'
                    }`}
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => { setStep('signup'); setError(null); setSuccessMsg(null); }}
                    className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                      !isSignin ? 'text-white' : 'text-slate-600 hover:text-emerald-700'
                    }`}
                  >
                    Create account
                  </button>
                </div>
              </div>

              {/* Google button */}
              <button 
                onClick={() => void handleOAuth('google')}
                disabled={oauthLoading !== null}
                className="group shine-wrap relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-md ring-1 ring-slate-200 transition-all duration-300 hover:scale-[1.02] hover:bg-slate-50 hover:shadow-lg hover:ring-emerald-200 disabled:opacity-60"
              >
                {oauthLoading === 'google' ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.12-1.43.34-2.1V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.83z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.16 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z" />
                  </svg>
                )}
                Continue with Google
              </button>

              {/* Divider */}
              <div className="my-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                or with email
                <span className="h-px flex-1 bg-slate-200" />
              </div>
            </>
          )}

          {isReset && (
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-slate-900">Reset Password</h2>
              <p className="mt-1 text-sm text-slate-500">Enter your email to receive a reset link</p>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={isReset ? handleResetPassword : handleEmailAuth}
            className="space-y-4"
          >
            {step === 'signup' && (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="reg-name" className="text-[12px] font-bold text-slate-700">
                    Full name
                  </label>
                  <div
                    className={`group flex items-center gap-2.5 rounded-xl border bg-white px-3 py-2.5 ring-1 transition-all duration-300 ${
                      nameFocus
                        ? 'border-emerald-400 ring-2 ring-emerald-200 shadow-lg shadow-emerald-100/60'
                        : 'border-slate-200 ring-slate-100 hover:border-emerald-300'
                    }`}
                  >
                    <User className={`h-4 w-4 transition-colors ${nameFocus ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <input
                      id="reg-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onFocus={() => setNameFocus(true)}
                      onBlur={() => setNameFocus(false)}
                      placeholder="Your full name"
                      className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="reg-company" className="text-[12px] font-bold text-slate-700">
                    Company name
                  </label>
                  <div
                    className={`group flex items-center gap-2.5 rounded-xl border bg-white px-3 py-2.5 ring-1 transition-all duration-300 ${
                      companyFocus
                        ? 'border-emerald-400 ring-2 ring-emerald-200 shadow-lg shadow-emerald-100/60'
                        : 'border-slate-200 ring-slate-100 hover:border-emerald-300'
                    }`}
                  >
                    <Building2 className={`h-4 w-4 transition-colors ${companyFocus ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <input
                      id="reg-company"
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      onFocus={() => setCompanyFocus(true)}
                      onBlur={() => setCompanyFocus(false)}
                      placeholder="Organisation name"
                      className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[12px] font-bold text-slate-700">I want to:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {MODE_OPTIONS.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setActiveMode(id)}
                        className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all duration-300 ${
                          activeMode === id
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-md ring-1 ring-emerald-200'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:bg-slate-50'
                        }`}
                      >
                        <Icon size={16} className={activeMode === id ? 'text-emerald-600' : 'text-slate-400'} />
                        <span className="mt-1.5 text-xs font-bold">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[12px] font-bold text-slate-700">
                Email
              </label>
              <div
                className={`group flex items-center gap-2.5 rounded-xl border bg-white px-3 py-2.5 ring-1 transition-all duration-300 ${
                  emailFocus
                    ? 'border-emerald-400 ring-2 ring-emerald-200 shadow-lg shadow-emerald-100/60'
                    : 'border-slate-200 ring-slate-100 hover:border-emerald-300'
                }`}
              >
                <Mail
                  className={`h-4 w-4 transition-colors ${
                    emailFocus ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  placeholder="you@company.com"
                  className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            {step !== 'reset' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-[12px] font-bold text-slate-700">
                    Password
                  </label>
                  {isSignin && (
                    <button
                      type="button"
                      onClick={() => { setStep('reset'); setError(null); setSuccessMsg(null); }}
                      className="text-xs font-semibold text-emerald-700 transition hover:text-emerald-800 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div
                  className={`group flex items-center gap-2.5 rounded-xl border bg-white px-3 py-2.5 ring-1 transition-all duration-300 ${
                    pwFocus
                      ? 'border-emerald-400 ring-2 ring-emerald-200 shadow-lg shadow-emerald-100/60'
                      : 'border-slate-200 ring-slate-100 hover:border-emerald-300'
                  }`}
                >
                  <Lock
                    className={`h-4 w-4 transition-colors ${
                      pwFocus ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  />
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPwFocus(true)}
                    onBlur={() => setPwFocus(false)}
                    placeholder={step === 'signup' ? 'Min. 6 characters' : '••••••••'}
                    className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="rounded p-1 text-slate-400 transition hover:text-emerald-700 active:scale-90"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                  <span className="leading-relaxed">{successMsg}</span>
                </div>
                {step === 'signup' && successMsg.includes('verify your account') && (
                  <button 
                    type="button" 
                    onClick={() => void handleResendConfirmation()}
                    className="self-start text-xs font-bold text-emerald-700 underline hover:text-emerald-800"
                  >
                    Didn't receive it? Resend email
                  </button>
                )}
              </div>
            )}

            {/* Submit — emerald primary button (landing style) */}
            <button
              type="submit"
              disabled={loading}
              className="group shine-wrap relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-700/30 ring-1 ring-emerald-800/30 transition-all duration-300 hover:scale-[1.02] hover:bg-emerald-800 hover:shadow-emerald-800/40 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : null}
              <span className="relative z-10">
                {loading ? (step === 'signin' ? 'Signing in…' : step === 'reset' ? 'Sending...' : 'Creating account…') : (
                  <>{step === 'signin' ? 'Sign in' : step === 'reset' ? 'Send reset link' : 'Create account'}</>
                )}
              </span>
              {!loading && <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:animate-magnetic" />}
              <span className="absolute inset-0 -z-0 animate-gradient-pan rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </button>

            {isReset && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setStep('signin'); setError(null); setSuccessMsg(null); }}
                  className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </form>

          {/* Legal */}
          <p className="mt-5 text-center text-[11px] text-slate-500">
            By continuing, you agree to our{' '}
            <a href="#" className="font-semibold text-emerald-700 underline-offset-2 hover:text-emerald-800 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-semibold text-emerald-700 underline-offset-2 hover:text-emerald-800 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>

        {/* Footer line (mirrors landing tagline) */}
        <div
          className="mt-8 flex animate-fade-in-up items-center gap-2 text-[11px] font-semibold text-slate-600"
          style={{ animationDelay: '0.3s' }}
        >
          <Leaf className="h-3 w-3 animate-pop text-emerald-600" />
          <span>
            Cleaner Industries. <span className="text-emerald-700">A Greener Tomorrow.</span>
          </span>
        </div>
      </main>
    </div>
  );
}
