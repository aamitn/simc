/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'circuit-blue': '#00D9FF',
        'circuit-purple': '#8B5FBF',
        'circuit-green': '#00FF94',
        'dark-bg': '#0A0A0F',
        'dark-secondary': '#1A1A24',
        'light-bg': '#FFFFFF',
        'light-secondary': '#F8F9FA',
        'text-primary': '#FFFFFF',
        'text-secondary': '#7c7c8a',
        'text-primary-light': '#1A1A24',
        'text-secondary-light': '#6B7280'
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace']
      },
      backgroundImage: {
        'circuit-pattern': "url('/circuit-bg.svg')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 217, 255, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(0, 217, 255, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
