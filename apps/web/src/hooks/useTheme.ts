import { useEffect, useState, useCallback } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type Theme = 'light' | 'dark'

export const THEME_MODE_STORAGE_KEY = 'cm_theme_mode'
export const THEME_STORAGE_KEY = 'cm_theme'

function getSystemPreference(): Theme {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }
  return 'light'
}

function getStoredMode(): ThemeMode {
  try {
    const savedMode = localStorage.getItem(THEME_MODE_STORAGE_KEY)
    if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
      return savedMode
    }
    const legacy = localStorage.getItem(THEME_STORAGE_KEY)
    if (legacy === 'light' || legacy === 'dark') {
      return legacy
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
  return 'light'
}

function resolveTheme(mode: ThemeMode): Theme {
  if (mode === 'system') {
    return getSystemPreference()
  }
  return mode
}

function applyThemeToDOM(theme: Theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.setAttribute('data-theme', 'dark')
  } else {
    root.classList.remove('dark')
    root.setAttribute('data-theme', 'light')
  }
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(getStoredMode)
  const [resolvedTheme, setResolvedTheme] = useState<Theme>(() => resolveTheme(getStoredMode()))

  const applyMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode)
    const resolved = resolveTheme(newMode)
    setResolvedTheme(resolved)
    try {
      localStorage.setItem(THEME_MODE_STORAGE_KEY, newMode)
      localStorage.setItem(THEME_STORAGE_KEY, resolved)
    } catch {
      // Ignore storage errors
    }
    applyThemeToDOM(resolved)
  }, [])

  const setMode = useCallback((newMode: ThemeMode) => {
    applyMode(newMode)
  }, [applyMode])

  const setTheme = useCallback((target: Theme | ThemeMode) => {
    applyMode(target)
  }, [applyMode])

  const toggleTheme = useCallback(() => {
    setModeState((currentMode) => {
      const currentResolved = resolveTheme(currentMode)
      const nextMode: ThemeMode = currentResolved === 'dark' ? 'light' : 'dark'
      const resolved = resolveTheme(nextMode)
      setResolvedTheme(resolved)
      try {
        localStorage.setItem(THEME_MODE_STORAGE_KEY, nextMode)
        localStorage.setItem(THEME_STORAGE_KEY, resolved)
      } catch {
        // Ignore
      }
      applyThemeToDOM(resolved)
      return nextMode
    })
  }, [])

  // Sync to DOM on initial mount and state changes
  useEffect(() => {
    applyThemeToDOM(resolvedTheme)
  }, [resolvedTheme])

  // Listen to OS preference changes if mode is 'system'
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleSystemChange = (e: MediaQueryListEvent) => {
      try {
        const currentMode = localStorage.getItem(THEME_MODE_STORAGE_KEY) || 'system'
        if (currentMode === 'system') {
          const sysTheme: Theme = e.matches ? 'dark' : 'light'
          setResolvedTheme(sysTheme)
          applyThemeToDOM(sysTheme)
          try {
            localStorage.setItem(THEME_STORAGE_KEY, sysTheme)
          } catch {
            // Ignore
          }
        }
      } catch {
        // Ignore
      }
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange)
      return () => mediaQuery.removeEventListener('change', handleSystemChange)
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleSystemChange)
      return () => (mediaQuery as any).removeListener(handleSystemChange)
    }
  }, [])

  return {
    theme: resolvedTheme,
    mode,
    isDark: resolvedTheme === 'dark',
    setTheme,
    setMode,
    toggleTheme,
  }
}

