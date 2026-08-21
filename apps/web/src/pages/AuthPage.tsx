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

const BLOCKED_DOMAINS = new Set([
  'example.com',
  'test.com',
  'testexample.com',
  'testemail.com',
  'testing.com',
  'sample.com',
  'dummy.com',
  'fake.com',
  'fakemail.com',
  'tempmail.com',
  'mailinator.com',
  '10minutemail.com',
  'guerrillamail.com',
  'throwawaymail.com',
  'trashmail.com',
  'yopmail.com',
  'dispostable.com',
  'sharklasers.com',
  'dfghj.com',
  'snjxsn.com',
  'asdf.com',
  'qwerty.com',
  'zxcv.com',
  'xyz.com',
  'abc.com',
])

function validateAuthenticEmail(rawEmail: string): string | null {
  const email = rawEmail.trim().toLowerCase()
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(email)) {
    return 'Please enter a valid, authentic email address (e.g., name@company.com).'
  }

  const [, domain] = email.split('@')
  if (!domain || !domain.includes('.')) {
    return 'Invalid domain in email address.'
  }

  if (BLOCKED_DOMAINS.has(domain)) {
    return `The domain "${domain}" is not allowed. Please use your real personal or work email.`
  }

  const domainParts = domain.split('.')
  const domainName = domainParts[0]
  const tld = domainParts[domainParts.length - 1]

  if (domainName.length < 2 || tld.length < 2) {
    return 'Please provide a legitimate company or personal email domain.'
  }

  // Check for gibberish domain names with no vowels (e.g. "snjxsn", "dfghj", "qwrtyp")
  const hasVowels = /[aeiouy]/.test(domainName)
  if (!hasVowels && domainName.length > 3) {
    return `"${domain}" does not appear to be an authentic domain. Please use a valid email.`
  }

  // Check for repeated keyboard mashing (e.g., "asdfgh", "zxcvbn")
  if (/^(asdf|qwer|zxcv|hjkl|1234|dfgh)/i.test(domainName)) {
    return 'Random test domains are not permitted. Please use a verified email.'
  }

  return null
}

export function AuthPage({ onAuth }: { onAuth: () => void }) {
  const [step, setStep] = useState<'signin' | 'signup'>('signin')
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#071f1b]">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#12645b]/20 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-[#0c3931]/30 blur-[100px]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-spruce/10 blur-[80px]" />
      </div>

      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#bce7cf 1px, transparent 1px), linear-gradient(to right, #bce7cf 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      <div className="relative z-10 w-full max-w-md px-4 py-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col items-center"
        >
          <div className="grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-mint to-spruce shadow-[0_12px_30px_rgba(18,100,91,.45)]">
            <Leaf className="text-white" size={26} strokeWidth={2.5} />
          </div>
          <p className="mt-4 text-2xl font-bold tracking-[-0.05em] text-white font-display">
            CIRCULAR<span className="text-mint">MATCH</span>
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7ab09a]">
            Material Intelligence Platform
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl border border-white/10 bg-white/[0.07] p-7 shadow-[0_24px_60px_rgba(0,15,12,.4)] backdrop-blur-xl"
        >
          {/* Tab switcher */}
          <div className="mb-6 flex rounded-2xl bg-white/[0.06] p-1">
            {(['signin', 'signup'] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setStep(s); setError(null); setSuccessMsg(null) }}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${step === s ? 'bg-white/15 text-white shadow-sm' : 'text-[#7ab09a] hover:text-white'}`}
              >
                {s === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {/* Google login button */}
          <button
            onClick={() => void handleOAuth('google')}
            disabled={oauthLoading !== null}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#dce8df] bg-white py-3 text-sm font-semibold text-[#3c4043] transition-all duration-200 hover:bg-gray-50 disabled:opacity-60"
          >
            {oauthLoading === 'google' ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs font-medium text-[#5a8a78]">or with email</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {step === 'signup' && (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#9ec9b5]" htmlFor="reg-name">Full name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a8a78]" size={16} />
                    <input
                      id="reg-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder:text-[#5a8a78] focus:border-mint/60 focus:outline-none focus:ring-2 focus:ring-mint/20"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#9ec9b5]" htmlFor="reg-company">Company name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a8a78]" size={16} />
                    <input
                      id="reg-company"
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder:text-[#5a8a78] focus:border-mint/60 focus:outline-none focus:ring-2 focus:ring-mint/20"
                      placeholder="Organisation name"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-[#9ec9b5]">I want to:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {MODE_OPTIONS.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setActiveMode(id)}
                        className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                          activeMode === id
                            ? 'border-mint bg-mint/20 text-white'
                            : 'border-white/10 bg-white/[0.04] text-[#8ab9a4] hover:bg-white/10'
                        }`}
                      >
                        <Icon size={16} className={activeMode === id ? 'text-mint' : ''} />
                        <span className="mt-1 text-[11px] font-semibold">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#9ec9b5]" htmlFor="auth-email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a8a78]" size={16} />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder:text-[#5a8a78] focus:border-mint/60 focus:outline-none focus:ring-2 focus:ring-mint/20"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#9ec9b5]" htmlFor="auth-password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a8a78]" size={16} />
                <input
                  id="auth-password"
                  type={showPw ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-10 pr-11 text-sm text-white placeholder:text-[#5a8a78] focus:border-mint/60 focus:outline-none focus:ring-2 focus:ring-mint/20"
                  placeholder={step === 'signup' ? 'Min. 6 characters' : '••••••••'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5a8a78] hover:text-mint"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-mint/30 bg-mint/10 p-3 text-sm text-mint">
                <CheckCircle2 size={16} className="shrink-0" />
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-spruce to-[#1a8a7a] py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(18,100,91,.4)] transition-all hover:shadow-[0_12px_30px_rgba(18,100,91,.5)] disabled:opacity-50"
            >
              {loading ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : null}
              {loading ? (step === 'signin' ? 'Signing in…' : 'Creating account…') : (
                <>{step === 'signin' ? 'Sign in' : 'Create account'} <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] text-[#5a8a78]">
            By continuing, you agree to our{' '}
            <a href="#" className="text-[#7ab09a] underline hover:text-mint">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="text-[#7ab09a] underline hover:text-mint">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
