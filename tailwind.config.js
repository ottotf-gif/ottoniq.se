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
        cream: '#F5F2EC',
        'cream-deep': '#ECE6D8',
        navy: '#1B2E4B',
        'navy-soft': '#2A3F5F',
        gold: '#C9A84C',
        ink: '#14192A',
      },
    },
  },
  plugins: [],
};