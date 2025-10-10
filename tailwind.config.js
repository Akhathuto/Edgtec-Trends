/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
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
        'breathing': 'breathing 4s ease-in-out infinite',
        'fade-in-down': 'fade-in-down 0.5s ease-out forwards',
        'text-fade-cycle': 'text-fade-cycle 2.5s ease-in-out infinite',
        'pulse-bg': 'pulse-bg 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'avatar-breathing': 'avatar-breathing 5s ease-in-out infinite',
        'avatar-speaking': 'avatar-speaking 1.5s ease-in-out infinite',
        'avatar-listening': 'avatar-listening 3s ease-in-out infinite',
        'lip-sync': 'lip-sync 0.2s ease-out infinite alternate',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'scale-in': { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        'slide-in-up': { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'ticker': { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        'logo-pulse': { '50%': { filter: 'drop-shadow(0 0 8px rgba(167, 139, 250, 0.5))' } },
        'breathing': {
          '0%, 100%': { opacity: 0.2, transform: 'scale(0.98)' },
          '50%': { opacity: 0.4, transform: 'scale(1)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'text-fade-cycle': {
          '0%, 100%': { opacity: 0.7 },
          '50%': { opacity: 1 },
        },
        'pulse-bg': {
          '0%, 100%': { backgroundColor: 'rgba(30, 41, 59, 0.5)' },
          '50%': { backgroundColor: 'rgba(51, 65, 85, 0.5)' },
        },
        'avatar-breathing': {
          '0%, 100%': { filter: 'brightness(1) drop-shadow(0 0 5px rgba(167, 139, 250, 0.1))', transform: 'scale(1)' },
          '50%': { filter: 'brightness(1.05) drop-shadow(0 0 15px rgba(167, 139, 250, 0.3))', transform: 'scale(1.01)' },
        },
        'avatar-speaking': {
            '0%, 100%': { filter: 'brightness(1.05) drop-shadow(0 0 15px rgba(167, 139, 250, 0.4))' },
            '50%': { filter: 'brightness(1.2) drop-shadow(0 0 25px rgba(167, 139, 250, 0.7))' },
        },
        'avatar-listening': {
            '0%, 100%': { transform: 'rotate(0deg) scale(1.01)', filter: 'brightness(1.05) drop-shadow(0 0 15px rgba(167, 139, 250, 0.2))' },
            '50%': { transform: 'rotate(-2deg) scale(1.015)', filter: 'brightness(1.05) drop-shadow(0 0 15px rgba(167, 139, 250, 0.2))' },
        },
        'lip-sync': {
          'from': { transform: 'scaleY(0.1)' },
          'to': { transform: 'scaleY(0.7)' },
        },
        'chat-bubble-in': {
          'from': { opacity: '0', transform: 'translateY(10px) scale(0.95)' },
          'to': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'blink': {
          '50%': { opacity: '0' },
        },
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
