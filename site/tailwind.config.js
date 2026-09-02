/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#0a0806',
        char: '#12100d',
        cocoa: {
          950: '#0e0b09',
          900: '#171210',
          800: '#241a15',
          700: '#3a2a20',
          600: '#5a4132',
          500: '#7a5942',
        },
        caramel: {
          400: '#d99a5b',
          500: '#c07d3e',
          600: '#a3652c',
        },
        gold: {
          300: '#e9c887',
          400: '#dcae63',
          500: '#c9974a',
        },
        cream: {
          50: '#faf5ec',
          100: '#f3ead9',
          200: '#e7d7bd',
          300: '#d8c3a0',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        luxe: '0.28em',
        wide2: '0.16em',
      },
      transitionTimingFunction: {
        luxe: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.2s linear infinite',
      },
    },
  },
  plugins: [],
}
