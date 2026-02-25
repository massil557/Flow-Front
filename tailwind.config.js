/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
    },
    extend: {
      borderRadius: {
        card: '0.75rem',
        panel: '1rem',
        'panel-lg': '2.5rem',
      },
      colors: {
        'dashboard-bg': '#F8F9FB',
        'brand-blue': '#2D5BFF',
        'text-main': '#1B2559',
        'text-sub': '#A3AED0',
        'stat-purple': '#A855F7',
        'stat-cyan': '#0EA5E9',
        'stat-green': '#22C55E',
      },
      boxShadow: {
        'soft-ui': '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        'fintech': '0px 18px 40px rgba(112, 144, 176, 0.12)',
        'fintech-lg': '0px 18px 40px rgba(112, 144, 176, 0.15)',
      },
      animation: {
        'slide-up': 'slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'scale-in': 'scaleIn 0.3s ease-in-out',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}