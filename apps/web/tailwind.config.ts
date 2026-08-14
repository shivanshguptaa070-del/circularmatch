import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12312d',
        forest: '#0c3931',
        spruce: '#12645b',
        mint: '#bce7cf',
        canvas: '#f5f7f2',
        sand: '#f2eee5',
        coral: '#e98467',
      },
      boxShadow: {
        soft: '0 14px 40px rgba(16, 49, 43, 0.08)',
        lift: '0 18px 50px rgba(7, 55, 47, 0.14)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
