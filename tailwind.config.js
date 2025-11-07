/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    "./services/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'violet': '#8B5CF6',
        'violet-dark': '#7C3AED',
        'violet-light': '#A78BFA',
        'violet-rich': '#6D28D9',
        'cyan': '#22d3ee',
        'teal': '#14b8a6',
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-in-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'slide-in-up': 'slide-in-up 0.5s ease-out forwards',
        'ticker': 'ticker 120s linear infinite',
        'aurora': 'aurora 15s linear infinite',
        'logo-pulse': 'logo-pulse 4s ease-in-out infinite',
        'fade-in-down': 'fade-in-down 0.5s ease-out forwards',
        'text-fade-cycle': 'text-fade-cycle 2s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'scale-in': { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        'slide-in-up': { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'ticker': { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        'aurora': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'logo-pulse': {
          '0%, 100%': { filter: 'drop-shadow(0 0 5px rgba(167, 139, 250, 0.3))' },
          '50%': { filter: 'drop-shadow(0 0 15px rgba(167, 139, 250, 0.5))' },
        },
        'fade-in-down': {
          'from': { opacity: '0', transform: 'translateY(-10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'text-fade-cycle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 15px rgba(20, 184, 166, 0.4), 0 0 5px rgba(20, 184, 166, 0.6) inset',
          },
          '50%': {
            boxShadow: '0 0 25px rgba(20, 184, 166, 0.7), 0 0 8px rgba(20, 184, 166, 1) inset',
          },
        },
      },
      boxShadow: {
        'glow-md': '0 0 15px rgba(167, 139, 250, 0.25)',
        'glow-lg': '0 0 30px rgba(167, 139, 250, 0.3)',
        'glow-violet': '0 0 50px rgba(139, 92, 246, 0.4)',
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}