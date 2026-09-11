/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Tight', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Fraunces', 'Times New Roman', 'serif'],
      },
      colors: {
        // Dark system
        'bg': '#0A0B0F',
        'bg-elev': '#121319',
        'bg-card': '#16171F',
        'surface': '#1C1D27',
        'border-subtle': '#1E1F2A',
        'border': '#262733',
        'text': '#EDEDEF',
        'text-muted': '#8A8B95',
        'text-dim': '#5A5B66',
        'accent': '#C6FF3D',
        'accent-dim': '#9FCC2F',
        // Keep old colors for backward compat (scan, etc.)
        cream: '#F5F2EC',
        'cream-deep': '#ECE6D8',
        navy: '#1B2E4B',
        'navy-soft': '#2A3F5F',
        gold: '#C9A84C',
        ink: '#14192A',
      },
      animation: {
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fadeIn 0.6s ease forwards',
        'slide-in': 'slideIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
