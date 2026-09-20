import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Boxes,
  ClipboardList,
  Command,
  LayoutDashboard,
  Leaf,
  LogOut,
  Map,
  Menu,
  PackagePlus,
  PackageSearch,
  PanelLeftClose,
  PanelLeftOpen,
  Recycle,
  Search,
  Settings2,
  X,
  Bell,
  ChevronDown,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { ActiveMode, UserProfile } from '../lib/supabase'
import type { Notification } from '../types'
import { getNotifications, markNotificationRead } from '../lib/api'

interface NavItem {
  label: string
  path: string
  icon: typeof LayoutDashboard
  badge?: string
}

const SELLER_NAV: NavItem[] = [
  { label: 'Sell Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'List Waste', path: '/list-waste', icon: PackagePlus },
  { label: 'My Inventory', path: '/listings', icon: Boxes, badge: '12' },
  { label: 'Demand Network', path: '/map', icon: Map, badge: '3' },
]

const BUYER_NAV: NavItem[] = [
  { label: 'Buy Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'My Buy Targets', path: '/buyer-requirements', icon: ClipboardList },
  { label: 'Find Suppliers', path: '/supply', icon: PackageSearch },
  { label: 'Supplier Network', path: '/map', icon: Map, badge: '5' },
]

const ADMIN_NAV: NavItem[] = [
  { label: 'Admin Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Scoring Rules', path: '/admin', icon: Settings2 },
]

const MODE_CONFIG: Record<ActiveMode, { label: string; actionLabel: string; icon: typeof Recycle; description: string }> = {
  selling: { label: 'Sell', actionLabel: 'Switch to Sell', icon: Recycle, description: 'You are managing waste inventory.' },
  sourcing: { label: 'Buy', actionLabel: 'Switch to Buy', icon: PackageSearch, description: 'You are sourcing secondary materials.' },
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('cm_sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })
  const [modeSwitching, setModeSwitching] = useState(false)
  const [showModeMenu, setShowModeMenu] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const modeMenuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      localStorage.setItem('cm_sidebar_collapsed', String(sidebarCollapsed))
    } catch {
      // ignore
    }
  }, [sidebarCollapsed])

  // Global Ctrl+B / Cmd+B keyboard shortcut to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        setSidebarCollapsed((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(event.target as Node)) {
        setShowModeMenu(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    getNotifications()
      .then((res) => setNotifications(res.data?.notifications ?? []))
      .catch(() => { /* ignore */ })
  }, [location.pathname])

  const navItems = isAdmin
    ? ADMIN_NAV
    : profile.active_mode === 'sourcing'
      ? BUYER_NAV
      : SELLER_NAV
  const modeInfo = MODE_CONFIG[profile.active_mode] || MODE_CONFIG.selling
  const ModeIcon = modeInfo.icon

  const initials = (profile.full_name || 'User')
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
    <div className="flex h-full flex-col border-r border-emerald-100/60 bg-white/75 px-4 py-5 backdrop-blur-md transition-all duration-300">
      <div className="relative z-10 flex flex-col h-full">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-1 pb-2">
          <Link to="/" className="flex items-center gap-2.5 transition hover:opacity-90">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-emerald-400/40 blur-md" />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-lg shadow-emerald-500/30">
                <Leaf className="h-4 w-4 text-white" strokeWidth={2.4} />
              </div>
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-bold tracking-tight text-slate-900">
                CIRCULAR<span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">MATCH</span>
              </div>
              <div className="text-[9px] font-semibold tracking-[0.22em] text-slate-400">
                MATERIAL INTELLIGENCE
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarCollapsed(true)}
            className="hidden h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:grid"
            title="Collapse sidebar (Ctrl+B)"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        {/* Workspace selector */}
        {!isAdmin && (
          <div className="relative mt-5" ref={modeMenuRef}>
            <button
              onClick={() => setShowModeMenu(!showModeMenu)}
              disabled={modeSwitching}
              className="group lift-hover flex w-full items-center gap-2.5 rounded-xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50/70 to-teal-50/50 p-2.5 text-left transition hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-500/10"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                <ModeIcon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0 leading-tight">
                <div className="text-[13.5px] font-semibold text-slate-900">{modeInfo.label}</div>
                <div className="truncate text-[11.5px] text-slate-500">{modeInfo.description}</div>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition group-hover:text-emerald-700 ${showModeMenu ? 'rotate-180' : ''}`} />
            </button>

            {showModeMenu && (
              <div className="animate-scale-in absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-emerald-100 bg-white p-1.5 shadow-xl">
                {(Object.entries(MODE_CONFIG) as [ActiveMode, typeof MODE_CONFIG[ActiveMode]][]).map(([mode, info]) => {
                  const Icon = info.icon
                  const isActive = mode === profile.active_mode
                  return (
                    <button
                      key={mode}
                      onClick={() => void switchMode(mode)}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition ${
                        isActive ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${isActive ? 'bg-emerald-200/60 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        <Icon size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold">{info.actionLabel}</p>
                        <p className="truncate text-[11px] text-slate-500">{info.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Workspace Label */}
        <div className="mt-6 px-2 text-[10.5px] font-bold uppercase tracking-[0.2em] text-emerald-700/80">
          Workspace
        </div>

        {/* Nav items */}
        <nav className="mt-2 flex-1 space-y-1.5">
          {navItems.map(({ label, path, icon: Icon, badge }) => {
            const selected = location.pathname === path || (path === '/listings' && location.pathname.startsWith('/listings'))
            return (
              <NavLink
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-all duration-300 ${
                  selected
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 transition-all duration-300 ${
                      selected
                        ? 'text-white'
                        : 'text-slate-400 group-hover:text-emerald-600 group-hover:scale-110'
                    }`}
                  />
                  <span>{label}</span>
                </span>
                {badge && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold transition ${
                      selected
                        ? 'bg-white/25 text-white backdrop-blur'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom user card */}
        <div className="mt-auto lift-hover flex items-center gap-2.5 rounded-xl border border-emerald-100/60 bg-gradient-to-br from-slate-50 to-white p-3 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name} className="h-9 w-9 rounded-full object-cover shadow-sm" />
          ) : (
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-amber-400/40 blur-sm" />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[12px] font-bold text-white shadow-md">
                {initials}
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0 leading-tight">
            <div className="truncate text-[13.5px] font-semibold text-slate-900">{profile.full_name}</div>
            <div className="truncate text-[11px] text-slate-500">{profile.company_name || profile.email}</div>
          </div>
          <button
            onClick={() => void onSignOut()}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700"
            title="Sign out"
            aria-label="Log out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-slate-900 antialiased">
      {/* Background Decor (Mint gradient + dot pattern + soft drifting blobs) */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50" />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(16,185,129,0.25) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-32 left-1/4 z-0 h-[460px] w-[460px] rounded-full bg-emerald-200/40 blur-3xl animate-blob"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-32 right-0 z-0 h-[400px] w-[400px] rounded-full bg-teal-200/40 blur-3xl animate-blob"
        style={{ animationDelay: '4s' }}
      />

      <div className="relative z-10 flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 hidden w-[248px] transition-transform duration-300 ease-in-out lg:block ${
            sidebarCollapsed ? '-translate-x-full pointer-events-none' : 'translate-x-0'
          }`}
          aria-hidden={sidebarCollapsed}
        >
          {sidebar}
        </aside>

        {sidebarCollapsed && (
          <button
            type="button"
            onClick={() => setSidebarCollapsed(false)}
            className="fixed left-0 top-1/2 z-20 hidden -translate-y-1/2 items-center rounded-r-xl border border-l-0 border-emerald-200 bg-white/95 p-2 text-emerald-800 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:pl-3 hover:text-emerald-600 hover:shadow-lg lg:flex group"
            title="Expand sidebar (Ctrl+B)"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen size={16} className="transition-transform group-hover:scale-110" />
          </button>
        )}

        {/* Mobile Sidebar */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              aria-label="Close navigation"
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative h-full w-[260px] shadow-2xl">{sidebar}</aside>
            <button
              aria-label="Close navigation"
              className="absolute left-[272px] top-4 grid h-9 w-9 place-items-center rounded-xl bg-white text-slate-700 shadow-xl"
              onClick={() => setMobileOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div
          className={`flex min-h-screen min-w-0 flex-1 flex-col transition-[padding] duration-300 ease-in-out ${
            sidebarCollapsed ? 'lg:pl-0' : 'lg:pl-[248px]'
          }`}
        >
          {/* TopBar */}
          <header className="sticky top-0 z-20 flex h-[64px] items-center justify-between border-b border-emerald-100/60 bg-white/75 px-6 backdrop-blur-md md:px-8 lg:px-10 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-emerald-300 lift-hover"
                onClick={() => {
                  if (window.innerWidth >= 1024) {
                    setSidebarCollapsed((prev) => !prev)
                  } else {
                    setMobileOpen(true)
                  }
                }}
                title={sidebarCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
                aria-label="Toggle navigation sidebar"
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen size={18} />
                ) : (
                  <>
                    <PanelLeftClose size={18} className="hidden lg:block" />
                    <Menu size={18} className="lg:hidden" />
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 text-[13.5px] font-medium text-slate-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 animate-soft-ping rounded-full bg-emerald-400" />
                  <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="hidden sm:inline font-semibold">{profile.company_name || 'CircularMatch'}</span>
                <span className="hidden text-slate-400 sm:inline">·</span>
                <span className="text-slate-600 capitalize">{profile.active_mode === 'sourcing' ? 'Buyer Mode' : 'Seller Mode'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Search Bar */}
              <div className="group hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 transition-all duration-300 hover:border-emerald-300 hover:bg-white focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100 sm:flex">
                <Search className="h-4 w-4 text-slate-400 transition-colors group-focus-within:text-emerald-600" />
                <input
                  placeholder="Search…"
                  className="w-32 lg:w-44 bg-transparent text-[13.5px] text-slate-700 outline-none placeholder:text-slate-400"
                />
                <span className="hidden items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[9.5px] font-semibold text-slate-500 lg:flex">
                  <Command className="h-2.5 w-2.5" /> K
                </span>
              </div>

              {/* Notification Button & Popover */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="group lift-hover relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md hover:shadow-emerald-500/20"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4 transition-transform group-hover:rotate-[12deg]" />
                  {notifications.some((n) => !n.is_read) && (
                    <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5">
                      <span className="absolute inset-0 animate-soft-ping rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="animate-scale-in absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-2xl z-50">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-3 text-sm font-bold text-white flex justify-between items-center">
                      <span>Notifications</span>
                      <span className="text-[11px] bg-white/20 px-2.5 py-0.5 rounded-full font-bold">{notifications.length}</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-slate-400">No new notifications</div>
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
                              if (n.reference_url && n.reference_url.startsWith('/')) {
                                navigate(n.reference_url)
                              }
                              setShowNotifications(false)
                            }}
                            className={`cursor-pointer p-3.5 transition hover:bg-emerald-50/50 ${
                              n.is_read ? 'opacity-60' : 'bg-emerald-50/20'
                            }`}
                          >
                            <p className="text-[12.5px] font-bold text-slate-900">{n.title}</p>
                            <p className="mt-0.5 text-[11.5px] text-slate-500 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Pill */}
              <div className="group lift-hover flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1 pl-1 pr-2.5 transition hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/20">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="h-7 w-7 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-[11px] font-bold text-white shadow-sm">
                    {initials}
                  </div>
                )}
                <div className="hidden leading-tight sm:block max-w-[120px]">
                  <div className="truncate text-[12.5px] font-semibold text-slate-900">{profile.full_name}</div>
                  <div className="truncate text-[10px] text-slate-500">{profile.company_name || profile.email}</div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Body */}
          <main className="flex-1 overflow-x-hidden px-6 py-7 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
