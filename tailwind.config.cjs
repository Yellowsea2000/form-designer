/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './store.ts',
    './components/**/*.{ts,tsx}',
    './dsl/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        canvas: '#f8fafc',
      },
    },
  },
  plugins: [],
};
