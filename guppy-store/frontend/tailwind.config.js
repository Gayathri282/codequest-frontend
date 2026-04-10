/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0D0920',   // deep midnight purple
          light:   '#1A1435',   // card bg
          lighter: '#251D4A',   // elevated card
          border:  '#3B2E6E',   // dividers
        },
        blush: {
          DEFAULT: '#E91E8C',   // hot magenta
          light:   '#F472B6',   // light pink
          dark:    '#BE185D',   // deep rose
        },
        ocean: '#0f172a',
        primary: {
          50:  '#fdf4ff',
          100: '#fae8ff',
          500: '#a855f7',
          900: '#3b0764',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-468px 0' },
          '100%': { backgroundPosition: '468px 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(233,30,140,0.3)' },
          '50%':      { boxShadow: '0 0 30px rgba(233,30,140,0.6)' },
        },
      },
      animation: {
        'fade-in-up':  'fadeInUp 0.6s ease-out forwards',
        'slide-up':    'slideUp 0.4s ease-out forwards',
        'shimmer':     'shimmer 1.5s infinite',
        'pulse-glow':  'pulseGlow 2s infinite',
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'blush':      '0 0 20px rgba(233,30,140,0.4)',
        'blush-lg':   '0 0 40px rgba(233,30,140,0.5)',
        'card':       '0 20px 40px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};
