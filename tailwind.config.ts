/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette values live in CSS variables (globals.css) so the whole
        // theme can flip between dark and light via the `light` class.
        void: {
          DEFAULT: 'rgb(var(--c-void) / <alpha-value>)',
          50: 'rgb(var(--c-void) / <alpha-value>)',
          100: 'rgb(var(--c-void-100) / <alpha-value>)',
          200: 'rgb(var(--c-void-200) / <alpha-value>)',
          300: 'rgb(var(--c-void-300) / <alpha-value>)',
        },
        neon: {
          cyan: 'rgb(var(--c-cyan) / <alpha-value>)',
          magenta: 'rgb(var(--c-magenta) / <alpha-value>)',
          lime: 'rgb(var(--c-lime) / <alpha-value>)',
          purple: 'rgb(var(--c-purple) / <alpha-value>)',
          amber: 'rgb(var(--c-amber) / <alpha-value>)',
          red: 'rgb(var(--c-red) / <alpha-value>)',
        },
        border: {
          dim: 'rgb(var(--c-border-dim) / <alpha-value>)',
          glow: 'rgb(var(--c-border-glow) / <alpha-value>)',
        },
        ink: {
          primary: 'rgb(var(--c-ink) / <alpha-value>)',
          secondary: 'rgb(var(--c-ink-secondary) / <alpha-value>)',
          muted: 'rgb(var(--c-ink-muted) / <alpha-value>)',
        },
        primary: {
          50: '#E8F4FF',
          100: '#D1E9FF',
          200: '#A6D4FF',
          300: '#76B9FF',
          400: '#4A9EFF',
          500: '#1E84FF',
          600: '#0069E0',
          700: '#0052B3',
          800: '#003D87',
          900: '#002A5C',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#030712',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 229, 255, 0.35)',
        'neon-magenta': '0 0 20px rgba(255, 45, 149, 0.35)',
        'neon-lime': '0 0 20px rgba(184, 255, 60, 0.3)',
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.35)',
        'panel': 'var(--shadow-panel)',
      },
      keyframes: {
        'grid-pan': {
          '0%': { backgroundPosition: '0 0, 0 0' },
          '100%': { backgroundPosition: '0 36px, 40px 0' },
        },
        'neon-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.45', transform: 'scale(0.88)' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-breathe': {
          '0%, 100%': { boxShadow: '0 0 16px rgba(0, 229, 255, 0.25)' },
          '50%': { boxShadow: '0 0 28px rgba(0, 229, 255, 0.55)' },
        },
      },
      animation: {
        'grid-pan': 'grid-pan 18s linear infinite',
        'neon-pulse': 'neon-pulse 1.8s ease-in-out infinite',
        blink: 'blink 1s step-end infinite',
        'fade-up': 'fade-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
        'glow-breathe': 'glow-breathe 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
