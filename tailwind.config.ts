import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:    '#0A1628',
          blue:    '#1B3F7E',
          skyblue: '#2563C4',
          wine:    '#6B1A2A',
          rose:    '#9B2335',
          gold:    '#C9A84C',
          gold2:   '#E8C97E',
          cream:   '#FAF7F2',
          stone:   '#E8E0D5',
        },
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'serif'],
        body:    ['var(--font-inter)', 'sans-serif'],
        arabic:  ['var(--font-amiri)', 'serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0A1628 0%, #1B3F7E 50%, #6B1A2A 100%)',
        'gold-shimmer':  'linear-gradient(90deg, #C9A84C, #E8C97E, #C9A84C)',
        'card-gradient': 'linear-gradient(180deg, transparent 50%, rgba(10,22,40,0.9) 100%)',
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite',
        'float':   'float 3s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease forwards',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
