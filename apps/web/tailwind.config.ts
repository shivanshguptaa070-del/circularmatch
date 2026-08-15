import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f2a25',
        forest: '#073c33',
        ocean: '#0e4a42',
        spruce: '#146b61',
        sage: '#7fae98',
        mint: '#bfe9d0',
        mintSoft: '#e3f3ea',
        canvas: '#f4f7f3',
        sand: '#f1ece1',
        cream: '#fbfcf9',
        mist: '#e6efe9',
        hairline: '#d8e5dc',
        coral: '#e68665',
        eucalyptus: '#45b590',
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
    },
  },
  plugins: [],
} satisfies Config