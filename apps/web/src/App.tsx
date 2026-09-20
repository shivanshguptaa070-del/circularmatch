import { useCallback, useEffect, useState, lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Loader2, Leaf } from 'lucide-react'
import { supabase } from './lib/supabase'
import type { ActiveMode, UserProfile } from './lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { AppShell } from './components/AppShell'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastProvider } from './components/ToastProvider'
const AuthPage = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })))
const LandingPage = lazy(() => import('./pages/LandingPage'));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const ListWastePage = lazy(() => import('./pages/ListWastePage').then(m => ({ default: m.ListWastePage })))
const BuyerRequirementsPage = lazy(() => import('./pages/BuyerRequirementsPage').then(m => ({ default: m.BuyerRequirementsPage })))
const ListingsPage = lazy(() => import('./pages/ListingsPage').then(m => ({ default: m.ListingsPage })))
const ListingMatchesPage = lazy(() => import('./pages/ListingMatchesPage').then(m => ({ default: m.ListingMatchesPage })))
const MaterialPassportPage = lazy(() => import('./pages/MaterialPassportPage').then(m => ({ default: m.MaterialPassportPage })))
const BuyerAcceptanceSpecPage = lazy(() => import('./pages/BuyerAcceptanceSpecPage').then(m => ({ default: m.BuyerAcceptanceSpecPage })))
const MatchDetailPage = lazy(() => import('./pages/MatchDetailPage').then(m => ({ default: m.MatchDetailPage })))
const MapPage = lazy(() => import('./pages/MapPage').then(m => ({ default: m.MapPage })))
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })))
const ImpactPage = lazy(() => import('./pages/ImpactPage').then(m => ({ default: m.ImpactPage })))

const queryClient = new QueryClient()

function SplashScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#071f1b]">
      <div className="flex flex-col items-center gap-5">
        <div className="grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-mint to-spruce shadow-[0_12px_30px_rgba(18,100,91,.45)]">
          <Leaf className="animate-pulse text-white" size={26} strokeWidth={2.5} />
        </div>
        <Loader2 className="animate-spin text-spruce" size={24} />
        <p className="text-sm text-[#7ab09a]">Loading CircularMatch…</p>
      </div>
    </main>
  )
}

function AuthCallback() {
  const navigate = useNavigate()
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    })
  }, [navigate])
  return <SplashScreen />
}

function RoutedApp({ session, profile }: { session: Session; profile: UserProfile }) {
  const storedMode = localStorage.getItem('cm_active_mode') as ActiveMode | null
  const [activeMode, setActiveMode] = useState<ActiveMode>(storedMode || profile.active_mode || 'selling')
  const navigate = useNavigate()
  const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined) || 'admin@circularmatch.com'
  const isDemoAdmin = localStorage.getItem('cm_demo') === 'admin'
  const isEmailAdmin = Boolean(
    profile.email && (
      profile.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
      profile.email.toLowerCase() === 'admin@circularmatch.com' ||
      profile.email.toLowerCase().startsWith('admin@') ||
      profile.email.toLowerCase().includes('+admin@')
    )
  )
  const isRoleAdmin = Boolean(
    profile.role === 'admin' ||
    (profile as any).active_mode === 'admin' ||
    session.user.user_metadata?.role === 'admin' ||
    session.user.app_metadata?.role === 'admin' ||
    session.user.user_metadata?.is_admin === true ||
    session.user.app_metadata?.is_admin === true ||
    localStorage.getItem('cm_active_mode') === 'admin'
  )
  const isAdmin = isDemoAdmin || isEmailAdmin || isRoleAdmin
  const demoModeVal = localStorage.getItem('cm_demo') as 'seller' | 'buyer' | 'admin' | null
  const isDemo = demoModeVal === 'seller' || demoModeVal === 'buyer' || demoModeVal === 'admin'

  useEffect(() => {
    localStorage.setItem('cm_active_mode', activeMode)
  }, [activeMode])

  const switchMode = useCallback(async (mode: ActiveMode) => {
    setActiveMode(mode)
    localStorage.setItem('cm_active_mode', mode)
    try { await supabase.from('user_profiles').update({ active_mode: mode }).eq('id', session.user.id) } catch (e) { /* ignore */ }
    await supabase.auth.updateUser({ data: { active_mode: mode } }).catch(() => null)
    // Redirect to dashboard so the user starts fresh in the new mode
    navigate('/dashboard', { replace: true })
  }, [session.user.id, navigate])

  const handleSignOut = useCallback(async () => {
    localStorage.removeItem('cm_demo')
    await supabase.auth.signOut().catch(() => null)
    window.location.href = '/'
  }, [])

  const currentProfile = { ...profile, active_mode: activeMode }

  // Map activeMode to legacy role for compatibility
  const legacyRole: 'generator' | 'buyer' | 'admin' = isAdmin ? 'admin' : activeMode === 'sourcing' ? 'buyer' : 'generator'

  return (
    <AppShell profile={currentProfile} onSwitchMode={switchMode} onSignOut={handleSignOut} isAdmin={isAdmin} isDemo={isDemo} demoRole={demoModeVal ?? undefined}>
      <Suspense fallback={<div className="p-20 grid place-items-center"><Loader2 className="animate-spin text-spruce" size={24} /></div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage role={legacyRole} />} />
          <Route path="/list-waste" element={<ListWastePage role={legacyRole} />} />
          <Route path="/buyer-requirements" element={<BuyerRequirementsPage role={legacyRole} />} />
          <Route path="/listings" element={<ListingsPage role={legacyRole} />} />
          <Route path="/listings/:listingId/passport" element={<MaterialPassportPage role={legacyRole} />} />
          <Route path="/listings/:listingId/matches" element={<ListingMatchesPage role={legacyRole} />} />
          <Route path="/buyer-requirements/:requirementId/acceptance-spec" element={<BuyerAcceptanceSpecPage role={legacyRole} />} />
          <Route path="/matches/:matchId" element={<MatchDetailPage role={legacyRole} />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/supply" element={<ListingsPage role="buyer" />} />
          <Route path="/admin" element={isAdmin ? <AdminPage role={legacyRole} /> : <Navigate to="/dashboard" replace />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  )
}

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)

  const fetchProfile = useCallback(async (s: Session) => {
    setLoadingProfile(true)
    try {
      const meta = s.user.user_metadata
      const appMeta = s.user.app_metadata
      const detectedRole = (meta?.role || appMeta?.role || (s.user.email?.toLowerCase().startsWith('admin@') ? 'admin' : undefined)) as string | undefined

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', s.user.id)
        .single()

      if (error || !data) {
        // First login: build profile from user metadata
        const newProfile: UserProfile = {
          id: s.user.id,
          email: s.user.email ?? '',
          full_name: meta?.full_name ?? meta?.name ?? s.user.email?.split('@')[0] ?? 'User',
          company_name: meta?.company_name ?? '',
          active_mode: (meta?.active_mode as ActiveMode) ?? 'selling',
          avatar_url: meta?.avatar_url ?? null,
          role: detectedRole,
        }
        // Try to upsert the profile
        try { await supabase.from('user_profiles').upsert(newProfile) } catch {}
        setProfile(newProfile)
      } else {
        setProfile({
          ...data,
          role: (data as any).role || detectedRole,
        } as UserProfile)
      }
    } catch {
      // Fallback profile from JWT metadata
      const meta = s.user.user_metadata
      const appMeta = s.user.app_metadata
      const detectedRole = (meta?.role || appMeta?.role || (s.user.email?.toLowerCase().startsWith('admin@') ? 'admin' : undefined)) as string | undefined
      setProfile({
        id: s.user.id,
        email: s.user.email ?? '',
        full_name: meta?.full_name ?? meta?.name ?? 'User',
        company_name: meta?.company_name ?? '',
        active_mode: 'selling',
        avatar_url: meta?.avatar_url ?? null,
        role: detectedRole,
      })
    } finally {
      setLoadingProfile(false)
    }
  }, [])

  useEffect(() => {
    // Get initial session
    const urlParams = new URLSearchParams(window.location.search)
    const demoParam = urlParams.get('demo') || localStorage.getItem('cm_demo')

    if (demoParam && (demoParam === 'seller' || demoParam === 'buyer' || demoParam === 'admin')) {
      localStorage.setItem('cm_demo', demoParam)
      const fullName = demoParam === 'seller' ? 'Aarav Sharma' : demoParam === 'buyer' ? 'Kiran Mehta' : 'Rhea Kapoor'
      const companyName = demoParam === 'seller' ? 'Noida PackForm Industries' : demoParam === 'buyer' ? 'ReLoop Polymers' : 'CircularMatch Admin'
      const activeModeToSet = demoParam === 'buyer' ? 'sourcing' : 'selling'
      localStorage.setItem('cm_active_mode', activeModeToSet)
      const mockProfile: UserProfile = {
        id: `demo-${demoParam}-id`,
        email: `${demoParam}@circularmatch.demo`,
        full_name: fullName,
        company_name: companyName,
        active_mode: activeModeToSet,
        avatar_url: null,
      }
      setSession({
        user: { id: `demo-${demoParam}-id`, email: `${demoParam}@circularmatch.demo`, app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '' },
        access_token: 'demo-token',
        refresh_token: 'demo-refresh',
        expires_in: 3600,
        token_type: 'bearer',
      } as unknown as Session)
      setProfile(mockProfile)
      return
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s) void fetchProfile(s)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s) void fetchProfile(s)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])



  // Render logic inside a single BrowserRouter
  return (
    <ErrorBoundary>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            {session === undefined || (session && loadingProfile && !profile) ? (
              <SplashScreen />
            ) : (
              <Suspense fallback={<SplashScreen />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/impact" element={<ImpactPage />} />
                  
                  {!session ? (
                    <>
                      <Route path="/auth/callback" element={<AuthCallback />} />
                      <Route path="/reset-password" element={<AuthPage onAuth={() => void supabase.auth.getSession().then(({ data: { session: s } }) => { setSession(s); if (s) void fetchProfile(s) })} defaultStep="reset" />} />
                      <Route path="*" element={<AuthPage onAuth={() => void supabase.auth.getSession().then(({ data: { session: s } }) => { setSession(s); if (s) void fetchProfile(s) })} />} />
                    </>
                  ) : !profile ? (
                    <Route path="*" element={<SplashScreen />} />
                  ) : (
                    <Route path="/*" element={<RoutedApp session={session} profile={profile} />} />
                  )}
                </Routes>
              </Suspense>
            )}
      </BrowserRouter>
      </QueryClientProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}
