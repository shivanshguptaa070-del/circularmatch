import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  PackageSearch,
  PlusCircle,
  Recycle,
  RefreshCw,
  Settings2,
  ShieldCheck,
  X,
  Bell,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { ActiveMode, UserProfile } from '../lib/supabase'
import type { Notification } from '../types'
import { getNotifications, markNotificationRead } from '../lib/api'
import { CircularMark } from './ui'

interface NavItem {
  label: string
  path: string
  icon: typeof LayoutDashboard
  modes: ActiveMode[]
}

const ALL_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, modes: ['selling', 'sourcing', 'both'] },
  { label: 'List my waste', path: '/list-waste', icon: PlusCircle, modes: ['selling', 'both'] },
  { label: 'My listings', path: '/listings', icon: Recycle, modes: ['selling', 'both'] },
  { label: 'Buyer requirements', path: '/buyer-requirements', icon: ClipboardList, modes: ['sourcing', 'both'] },
  { label: 'Supply opportunities', path: '/supply', icon: PackageSearch, modes: ['sourcing', 'both'] },
  { label: 'Map', path: '/map', icon: Map, modes: ['selling', 'sourcing', 'both'] },
  { label: 'Scoring rules', path: '/admin', icon: Settings2, modes: ['__admin__'] },
]

const MODE_CONFIG: Record<ActiveMode, { label: string; icon: typeof Recycle; description: string }> = {
  selling: { label: 'Selling Waste', icon: Recycle, description: 'You are listing industrial by-products.' },
  sourcing: { label: 'Sourcing Materials', icon: PackageSearch, description: 'You are finding secondary materials.' },
  both: { label: 'Sell & Buy', icon: RefreshCw, description: 'Both selling and sourcing enabled.' },
}

export function AppShell({
  profile,
  children,
  onSwitchMode,
  onSignOut,
  isAdmin = false,
}: {
  profile: UserProfile
  children: ReactNode
  onSwitchMode: (mode: ActiveMode) => Promise<void>
  onSignOut: () => Promise<void>
  isAdmin?: boolean
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [modeSwitching, setModeSwitching] = useState(false)
  const [showModeMenu, setShowModeMenu] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const location = useLocation()

  useEffect(() => {
    // Fetch notifications — silently ignore errors so a backend issue never crashes the UI
    getNotifications()
      .then((res) => setNotifications(res.data?.notifications ?? []))
      .catch(() => { /* ignore — notifications are non-critical */ })
  }, [location.pathname])

  const navItems = ALL_NAV.filter((item) =>
    item.modes.includes('__admin__') ? isAdmin : item.modes.includes(profile.active_mode)
  )
  const modeInfo = MODE_CONFIG[profile.active_mode]
  const ModeIcon = modeInfo.icon

  const initials = profile.full_name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const switchMode = async (mode: ActiveMode) => {
    if (mode === profile.active_mode) return
    setModeSwitching(true)
    setShowModeMenu(false)
    try {
      await onSwitchMode(mode)
    } finally {
      setModeSwitching(false)
    }
  }

  const sidebar = (
    <div className="sidebar-surface flex h-full flex-col px-4 py-5 text-white">
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 rounded-2xl px-2 py-1 transition hover:bg-white/5">
          <CircularMark size={42} />
          <div>
            <p className="text-[17px] font-bold leading-none tracking-[-0.055em]">CIRCULAR<span className="text-mint">MATCH</span></p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#9ecbb5]">Material intelligence</p>
          </div>
        </Link>

        {/* Mode switcher */}
        <div className="relative mt-6 px-1">
          <button
            onClick={() => setShowModeMenu(!showModeMenu)}
            disabled={modeSwitching}
            className="flex w-full items-center gap-2.5 rounded-2xl border border-white/12 bg-white/[0.07] px-3.5 py-3 text-left transition hover:bg-white/10"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-mint/20 text-mint">
              <ModeIcon size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white">{modeInfo.label}</p>
              <p className="mt-0.5 truncate text-[10px] text-[#7ab09a]">{modeInfo.description}</p>
            </div>
            <svg className={`h-4 w-4 shrink-0 text-[#7ab09a] transition ${showModeMenu ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>

          {showModeMenu && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-white/12 bg-[#0a2e28] shadow-[0_16px_40px_rgba(0,20,16,.5)]">
              {(Object.entries(MODE_CONFIG) as [ActiveMode, typeof MODE_CONFIG[ActiveMode]][]).map(([mode, info]) => {
                const Icon = info.icon
                return (
                  <button
                    key={mode}
                    onClick={() => void switchMode(mode)}
                    className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition hover:bg-white/10 ${mode === profile.active_mode ? 'bg-mint/10' : ''}`}
                  >
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${mode === profile.active_mode ? 'bg-mint/25 text-mint' : 'bg-white/8 text-[#7ab09a]'}`}>
                      <Icon size={13} />
                    </span>
                    <div>
                      <p className={`text-xs font-semibold ${mode === profile.active_mode ? 'text-mint' : 'text-[#c5dfd1]'}`}>{info.label}</p>
                      <p className="text-[10px] text-[#5a8a78]">{info.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Navigation */}
        <p className="mt-7 px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-[#7fae98]">Workspace</p>
        <nav className="mt-3 space-y-1.5">
          {navItems.map(({ label, path, icon: Icon }) => {
            const selected = location.pathname === path || (path === '/listings' && location.pathname.startsWith('/listings'))
            return (
              <NavLink
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={() => `sidebar-nav-link flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition duration-200 ${selected ? 'is-active text-white shadow-sm' : 'text-[#c4dfd1] hover:bg-white/8 hover:text-white'}`}
              >
                <span className={`grid h-7 w-7 place-items-center rounded-lg transition ${selected ? 'bg-mint/15 text-mint' : 'bg-white/[.045] text-[#b5d5c4]'}`}>
                  <Icon size={16} strokeWidth={selected ? 2.5 : 2} />
                </span>
                {label}
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom user card */}
        <div className="relative z-10 mt-auto rounded-2xl border border-white/13 bg-white/[0.075] p-4 shadow-[0_16px_30px_rgba(0,20,16,.16)] backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="h-9 w-9 rounded-xl object-cover" />
            ) : (
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-mint/30 to-spruce/40 text-xs font-bold text-white">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">{profile.full_name}</p>
              <p className="mt-0.5 truncate text-[10px] text-[#7ab09a]">{profile.company_name || profile.email}</p>
            </div>
            <button
              onClick={() => void onSignOut()}
              title="Sign out"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#7ab09a] transition hover:bg-white/10 hover:text-red-400"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="app-surface min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[270px] lg:block">{sidebar}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close navigation" className="absolute inset-0 bg-[#062d27]/60 backdrop-blur-[2px]" onClick={() => setMobileOpen(false)} />
          <aside className="relative h-full w-[282px] shadow-2xl">{sidebar}</aside>
          <button aria-label="Close navigation" className="absolute left-[294px] top-5 grid h-10 w-10 place-items-center rounded-xl bg-white text-forest shadow-xl" onClick={() => setMobileOpen(false)}><X size={19} /></button>
        </div>
      )}

      <main className="min-h-screen lg:pl-[270px]">
        <header className="topbar-surface sticky top-0 z-20 flex h-[78px] items-center justify-between px-5 backdrop-blur-xl sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <button className="grid h-10 w-10 place-items-center rounded-xl border border-[#d8e4dc] bg-white text-forest shadow-sm lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
            <div className="workspace-chip hidden text-xs sm:flex">
              <span className="workspace-dot" />
              <BarChart3 size={14} className="text-spruce" />
              <span>{profile.company_name || 'My workspace'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="relative mr-2">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative grid h-10 w-10 place-items-center rounded-xl border border-[#d8e4dc] bg-white text-forest shadow-sm hover:bg-gray-50 transition"
              >
                <Bell size={18} />
                {notifications.some((n) => !n.is_read) && (
                  <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 shadow-sm" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-[#d8e4dc] bg-white shadow-2xl">
                  <div className="bg-forest px-4 py-3 text-sm font-bold text-white">Notifications</div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={async () => {
                            if (!n.is_read) {
                              await markNotificationRead(n.id).catch(console.error)
                              setNotifications((prev) =>
                                prev.map((p) => (p.id === n.id ? { ...p, is_read: true } : p))
                              )
                            }
                            if (n.reference_url) {
                              window.location.href = n.reference_url
                            }
                            setShowNotifications(false)
                          }}
                          className={`cursor-pointer border-b border-gray-100 p-4 transition hover:bg-gray-50 ${
                            n.is_read ? 'opacity-60' : 'bg-[#e9f8ee]/20'
                          }`}
                        >
                          <p className="text-sm font-bold text-forest">{n.title}</p>
                          <p className="mt-1 text-xs text-gray-600">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-ink">{profile.full_name}</p>
              <p className="mt-0.5 text-[10px] font-medium text-[#73877f]">{profile.company_name}</p>
            </div>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="h-10 w-10 rounded-xl object-cover shadow-sm" />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#e9f8ee] to-[#bce7cf] text-sm font-bold text-forest shadow-[0_7px_15px_rgba(18,100,91,.12)]">
                {initials}
              </div>
            )}
          </div>
        </header>
        <div className="app-page mx-auto max-w-[1640px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">{children}</div>
      </main>
    </div>
  )
}
