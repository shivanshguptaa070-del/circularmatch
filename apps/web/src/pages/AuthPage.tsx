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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-emerald-200/40 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-teal-200/40 blur-[100px]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-200/40 blur-[80px]" />
      </div>

      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(16,185,129,0.25) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

      <div className="relative z-10 w-full max-w-md px-4 py-8 sm:px-0">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col items-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-emerald-100">
            <Leaf className="text-emerald-600" size={28} strokeWidth={2.2} />
          </div>
          <p className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 font-display">
            CIRCULAR<span className="text-emerald-500">MATCH</span>
          </p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Material Intelligence Platform
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl border border-slate-200/60 bg-white p-7 shadow-2xl shadow-emerald-900/5 ring-1 ring-slate-100 sm:p-10"
        >
          {step !== 'reset' && (
            <>
              {/* Tab switcher */}
              <div className="mb-8 flex rounded-xl bg-slate-100/80 p-1 ring-1 ring-slate-200/50">
                {(['signin', 'signup'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStep(s); setError(null); setSuccessMsg(null) }}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${step === s ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {s === 'signin' ? 'Sign in' : 'Create account'}
                  </button>
                ))}
              </div>

              {/* Google login button */}
              <button
                onClick={() => void handleOAuth('google')}
                disabled={oauthLoading !== null}
                className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow disabled:opacity-60"
              >
                {oauthLoading === 'google' ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5 transition-transform group-hover:scale-110" aria-hidden>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </button>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">or with email</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
            </>
          )}

          {step === 'reset' && (
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-slate-900">Reset Password</h2>
              <p className="mt-1 text-sm text-slate-500">Enter your email to receive a reset link</p>
            </div>
          )}

          <form onSubmit={step === 'reset' ? handleResetPassword : handleEmailAuth} className="space-y-4">
            {step === 'signup' && (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700" htmlFor="reg-name">Full name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      id="reg-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700" htmlFor="reg-company">Company name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      id="reg-company"
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      placeholder="Organisation name"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 block text-xs font-bold text-slate-700">I want to:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {MODE_OPTIONS.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setActiveMode(id)}
                        className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                          activeMode === id
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
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

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700" htmlFor="auth-email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {step !== 'reset' && (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700" htmlFor="auth-password">Password</label>
                  {step === 'signin' && (
                    <button type="button" onClick={() => { setStep('reset'); setError(null); setSuccessMsg(null); }} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    id="auth-password"
                    type={showPw ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    placeholder={step === 'signup' ? 'Min. 6 characters' : '••••••••'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
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

            <button
              type="submit"
              disabled={loading}
              className="group shine-wrap relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-700 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/25 ring-1 ring-emerald-800/30 transition-all duration-300 hover:scale-[1.02] hover:bg-emerald-800 hover:shadow-emerald-800/40 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : null}
              <span className="relative z-10">
                {loading ? (step === 'signin' ? 'Signing in…' : step === 'reset' ? 'Sending...' : 'Creating account…') : (
                  <>{step === 'signin' ? 'Sign in' : step === 'reset' ? 'Send reset link' : 'Create account'} <ArrowRight size={16} className="inline-block transition-transform group-hover:translate-x-1" /></>
                )}
              </span>
              <span className="absolute inset-0 -z-0 animate-gradient-pan rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </button>
            
            {step === 'reset' && (
              <div className="text-center">
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

          <p className="mt-6 text-center text-[11px] font-medium text-slate-500">
            By continuing, you agree to our{' '}
            <a href="#" className="font-bold text-slate-700 underline hover:text-emerald-700">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="font-bold text-slate-700 underline hover:text-emerald-700">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
