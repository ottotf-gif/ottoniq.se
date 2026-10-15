/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Instrument Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        'bg': '#0A0B0F',
        'bg-elev': '#111218',
        'bg-card': '#15161E',
        'surface': '#1C1D27',
        'border-subtle': '#1C1D27',
        'border': '#24252F',
        'text': '#E8E9EC',
        'text-muted': '#9B9CA8',
        'text-dim': '#5C5D6A',
        'accent': '#C6F432',
        'accent-dim': '#A8D028',
        // Kept for PrivacyPolicy/DemoRequest/ScanPage (dark theme)
        cream: '#F5F2EC',
        navy: '#1B2E4B',
        gold: '#C9A84C',
        ink: '#14192A',
      },
    },
  },
  plugins: [],
};
