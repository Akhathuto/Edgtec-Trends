/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'violet': '#8B5CF6',
        'violet-dark': '#7C3AED',
        'violet-light': '#A78BFA',
        'violet-rich': '#6D28D9',
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out forwards',
        'scale-in': 'scale-in 0.4s ease-out forwards',
        'slide-in-up': 'slide-in-up 0.5s ease-out forwards',
        'ticker': 'ticker 120s linear infinite',
        'logo-pulse': 'logo-pulse 4s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ticker': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'logo-pulse': {
          '50%': { filter: 'drop-shadow(0 0 8px rgba(167, 139, 250, 0.5))' },
        }
      },
      boxShadow: {
        'glow-md': '0 0 15px rgba(167, 139, 250, 0.2)',
        'glow-lg': '0 0 25px rgba(167, 139, 250, 0.3)',
        'glow-violet': '0 0 40px rgba(139, 92, 246, 0.3)',
      }
    }
  },
  plugins: [],
}