/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f2f5f9',
          100: '#e1e9f1',
          200: '#c8d7e6',
          300: '#a3bdd4',
          400: '#7799bd',
          500: '#567aa4',
          600: '#43618a',
          700: '#384f70',
          800: '#31435d',
          900: '#1e293b', // Deep Navy
          950: '#0f172a',
        },
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
}
