import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'var(--cm-surface)',
        'surface-elevated': 'var(--cm-surface-elevated)',
        'surface-muted': 'var(--cm-surface-muted)',
        card: 'var(--cm-card)',
        'card-foreground': 'var(--cm-card-foreground)',
        'text-primary': 'var(--cm-text-primary)',
        'text-secondary': 'var(--cm-text-secondary)',
        'text-muted': 'var(--cm-text-muted)',
        border: 'var(--cm-border)',
        'border-subtle': 'var(--cm-border-subtle)',
        'border-strong': 'var(--cm-border-strong)',
        ink: 'var(--cm-ink)',
        forest: 'var(--cm-forest)',
        ocean: 'var(--cm-ocean)',
        spruce: 'var(--cm-spruce)',
        sage: 'var(--cm-sage)',
        mint: 'var(--cm-mint)',
        mintSoft: 'var(--cm-mint-soft)',
        canvas: 'var(--cm-canvas)',
        sand: 'var(--cm-sand)',
        cream: 'var(--cm-cream)',
        mist: 'var(--cm-mist)',
        hairline: 'var(--cm-hairline)',
        coral: 'var(--cm-coral)',
        eucalyptus: 'var(--cm-eucalyptus)',
      },
      boxShadow: {
        soft: '0 14px 40px rgba(12, 45, 39, 0.075)',
        lift: '0 18px 50px rgba(7, 55, 47, 0.13)',
        glow: '0 10px 26px rgba(20, 107, 97, 0.22)',
        deep: '0 26px 60px rgba(4, 32, 28, 0.18)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      letterSpacing: {
        tag: '0.18em',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.5' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        pop: {
          '0%': { transform: 'scale(0.95)' },
          '40%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
        magnetic: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(4px)' },
        },
        'gradient-pan': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        blob: 'blob 7s infinite',
        twinkle: 'twinkle 3s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        pop: 'pop 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        magnetic: 'magnetic 1.5s ease-in-out infinite',
        'gradient-pan': 'gradient-pan 3s ease infinite',
      },
    },
  },
  plugins: [],
} satisfies Config