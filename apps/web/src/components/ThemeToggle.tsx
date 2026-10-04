import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

interface ThemeToggleProps {
  className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme()

  return (
    <button
      id="theme-toggle-btn"
      type="button"
      onClick={toggleTheme}
      className={`group relative grid h-9 w-9 place-items-center rounded-xl border transition-all duration-300 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
        isDark
          ? 'border-[#1e332a] bg-[#121f1a] text-[#34d399] hover:border-[#2a493c] hover:bg-[#162721] hover:text-[#34d399]'
          : 'border-slate-200 bg-white text-amber-500 hover:border-amber-300 hover:bg-amber-50/70 hover:text-amber-600'
      } ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="sr-only">Toggle theme (currently {theme})</span>
      <div className="relative h-4 w-4">
        <Sun
          size={16}
          className={`absolute inset-0 transform transition-all duration-300 ease-in-out ${
            isDark ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
          }`}
        />
        <Moon
          size={16}
          className={`absolute inset-0 transform transition-all duration-300 ease-in-out ${
            isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-90 opacity-0'
          }`}
        />
      </div>
    </button>
  )
}

export default ThemeToggle

