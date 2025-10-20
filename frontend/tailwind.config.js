/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nuaibria: {
          // Primary backgrounds (deep midnight blue)
          bg: '#0a0e1a',
          surface: '#1a1f2e',
          elevated: '#252b3d',
          border: '#3d4563',

          // Accent colors (rich jewel tones)
          gold: '#d4af37',
          ember: '#ff6b35',
          arcane: '#8b5cf6',
          poison: '#10b981',
          ice: '#06b6d4',

          // Semantic colors
          health: '#dc2626',
          mana: '#3b82f6',
          stamina: '#f59e0b',
          success: '#059669',
          danger: '#991b1b',
          warning: '#d97706',

          // Text colors
          text: {
            primary: '#f3f4f6',
            secondary: '#d1d5db',
            muted: '#9ca3af',
            accent: '#fbbf24',
          }
        }
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(212, 175, 55, 0.3)',
        'glow-lg': '0 0 40px rgba(212, 175, 55, 0.4)',
        'inner-dark': 'inset 0 2px 4px rgba(0, 0, 0, 0.4)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-in',
        'slide-up': 'slideUp 300ms ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        // Text-specific glow animation without opacity/filter changes to avoid flicker
        'text-glow': 'textGlow 2500ms ease-in-out infinite',
        'golden-glow': 'goldenGlow 3000ms ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': {
            opacity: '0.9',
            filter: 'brightness(1)'
          },
          '50%': {
            opacity: '1',
            filter: 'brightness(1.15)'
          },
        },
        // Avoid animating opacity on gradient-clipped text (causes flicker on some GPUs)
        textGlow: {
          '0%, 100%': {
            textShadow: '0 0 6px rgba(212, 175, 55, 0.25), 0 0 12px rgba(212, 175, 55, 0.15)'
          },
          '50%': {
            textShadow: '0 0 10px rgba(212, 175, 55, 0.45), 0 0 20px rgba(212, 175, 55, 0.25)'
          },
        },
        goldenGlow: {
          '0%, 100%': {
            filter: 'drop-shadow(0 0 2px rgba(212, 175, 55, 0.35)) drop-shadow(0 0 6px rgba(212, 175, 55, 0.2))'
          },
          '50%': {
            filter: 'drop-shadow(0 0 4px rgba(212, 175, 55, 0.45)) drop-shadow(0 0 10px rgba(212, 175, 55, 0.25))'
          },
        },
      },
    },
  },
  plugins: [],
}
