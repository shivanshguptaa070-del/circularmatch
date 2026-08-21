import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { Loader2, Leaf } from 'lucide-react'
import { supabase } from './lib/supabase'
import type { ActiveMode, UserProfile } from './lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { AppShell } from './components/AppShell'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { ListWastePage } from './pages/ListWastePage'
import { BuyerRequirementsPage } from './pages/BuyerRequirementsPage'
import { ListingsPage } from './pages/ListingsPage'
import { ListingMatchesPage } from './pages/ListingMatchesPage'
import { MaterialPassportPage } from './pages/MaterialPassportPage'
import { BuyerAcceptanceSpecPage } from './pages/BuyerAcceptanceSpecPage'
import { MatchDetailPage } from './pages/MatchDetailPage'
import { MapPage } from './pages/MapPage'
import { AdminPage } from './pages/AdminPage'

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

function RoutedApp({ session, profile }: { session: Session; profile: UserProfile }) {
  const storedMode = localStorage.getItem('cm_active_mode') as ActiveMode | null
  const [activeMode, setActiveMode] = useState<ActiveMode>(storedMode || profile.active_mode || 'selling')
  const navigate = useNavigate()
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string | undefined
  const isAdmin = !!(ADMIN_EMAIL && profile.email === ADMIN_EMAIL)

  useEffect(() => {
    localStorage.setItem('cm_active_mode', activeMode)
  }, [activeMode])

  const switchMode = useCallback(async (mode: ActiveMode) => {
    setActiveMode(mode)
    localStorage.setItem('cm_active_mode', mode)
    try { await supabase.from('user_profiles').update({ active_mode: mode }).eq('id', session.user.id) } catch (e) {}
    await supabase.auth.updateUser({ data: { active_mode: mode } }).catch(() => null)
    // Redirect to dashboard so the user starts fresh in the new mode
    navigate('/dashboard', { replace: true })
  }, [session.user.id, navigate])

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const currentProfile = { ...profile, active_mode: activeMode }

  // Map activeMode to legacy role for compatibility
  const legacyRole: 'generator' | 'buyer' | 'admin' = isAdmin ? 'admin' : activeMode === 'sourcing' ? 'buyer' : 'generator'

  return (
    <AppShell profile={currentProfile} onSwitchMode={switchMode} onSignOut={handleSignOut} isAdmin={isAdmin}>
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
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
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
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', s.user.id)
        .single()

      if (error || !data) {
        // First login: build profile from user metadata
        const meta = s.user.user_metadata
        const newProfile: UserProfile = {
          id: s.user.id,
          email: s.user.email ?? '',
          full_name: meta?.full_name ?? meta?.name ?? s.user.email?.split('@')[0] ?? 'User',
          company_name: meta?.company_name ?? '',
          active_mode: (meta?.active_mode as ActiveMode) ?? 'selling',
          avatar_url: meta?.avatar_url ?? null,
        }
        // Try to upsert the profile
        await supabase.from('user_profiles').upsert(newProfile)
        setProfile(newProfile)
      } else {
        setProfile(data as UserProfile)
      }
    } catch {
      // Fallback profile from JWT metadata
      const meta = s.user.user_metadata
      setProfile({
        id: s.user.id,
        email: s.user.email ?? '',
        full_name: meta?.full_name ?? meta?.name ?? 'User',
        company_name: meta?.company_name ?? '',
        active_mode: 'selling',
        avatar_url: meta?.avatar_url ?? null,
      })
    } finally {
      setLoadingProfile(false)
    }
  }, [])

  useEffect(() => {
    // Get initial session
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
    <BrowserRouter>
      {session === undefined || (session && loadingProfile && !profile) ? (
        <SplashScreen />
      ) : !session ? (
        <Routes>
          <Route path="*" element={<AuthPage onAuth={() => void supabase.auth.getSession().then(({ data: { session: s } }) => { setSession(s); if (s) void fetchProfile(s) })} />} />
        </Routes>
      ) : !profile ? (
        <SplashScreen />
      ) : (
        <RoutedApp session={session} profile={profile} />
      )}
    </BrowserRouter>
  )
}
