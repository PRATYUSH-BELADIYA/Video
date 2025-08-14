/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: '#3a86ff',
      },
      boxShadow: {
        glow: '0 0 0 2px rgba(58,134,255,0.35), 0 8px 30px rgba(0,0,0,0.35)'
      }
    },
  },
  plugins: [],
}