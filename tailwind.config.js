/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Existing names → now driven by CSS variables (auto theme-aware)
        'dark-bg': 'var(--color-bg)',
        'dark-panel': 'var(--color-panel)',
        'dark-border': 'var(--color-border)',
        'purple-primary': 'var(--color-accent-purple)',
        'cyan-primary': 'var(--color-accent-cyan)',
        // New semantic tokens
        'theme-bg':      'var(--color-bg)',
        'theme-bg-alt':  'var(--color-bg-alt)',
        'theme-panel':   'var(--color-panel)',
        'theme-surface': 'var(--color-surface)',
        'theme-border':  'var(--color-border)',
        'theme-border-alt': 'var(--color-border-alt)',
        'theme-surface-alt': 'var(--color-surface-alt)',
        'theme-text':         'var(--color-text)',
        'theme-text-secondary': 'var(--color-text-secondary)',
        'theme-text-muted':   'var(--color-text-muted)',
        'theme-text-faint':   'var(--color-text-faint)',
      },
      backgroundImage: {
        'gradient-purple-cyan': 'linear-gradient(135deg, var(--color-accent-purple), var(--color-accent-cyan))',
      }
    },
  },
  plugins: [],
}
