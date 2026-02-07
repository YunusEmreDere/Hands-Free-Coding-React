/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0a0a12',
        'dark-panel': '#0f0f1a',
        'dark-border': '#1a1a2e',
        'purple-primary': '#7c3aed',
        'cyan-primary': '#06b6d4',
      },
      backgroundImage: {
        'gradient-purple-cyan': 'linear-gradient(135deg, #7c3aed, #06b6d4)',
      }
    },
  },
  plugins: [],
}
