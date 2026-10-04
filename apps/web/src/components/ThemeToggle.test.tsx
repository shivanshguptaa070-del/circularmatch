import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { ThemeToggle } from './ThemeToggle'

describe('ThemeToggle component', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme')
  })

  it('renders theme toggle button with accessible label', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: /switch to/i })
    expect(button).toBeDefined()
    expect(button.id).toBe('theme-toggle-btn')
  })

  it('toggles theme on click and updates document attributes', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: /switch to/i })

    // Initial click: if starting light, toggles to dark
    fireEvent.click(button)

    const isNowDark = document.documentElement.classList.contains('dark')
    if (isNowDark) {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
      expect(localStorage.getItem('cm_theme')).toBe('dark')
    } else {
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
      expect(localStorage.getItem('cm_theme')).toBe('light')
    }

    // Second click: toggles back
    fireEvent.click(button)
    if (isNowDark) {
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
      expect(localStorage.getItem('cm_theme')).toBe('light')
    } else {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
      expect(localStorage.getItem('cm_theme')).toBe('dark')
    }
  })
})
