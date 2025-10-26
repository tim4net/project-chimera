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
          // Primary backgrounds (deep midnight blue) - Legacy
          bg: '#0a0e1a',
          surface: '#1a1f2e',
          elevated: '#252b3d',
          border: '#3d4563',

          // Accent colors (rich jewel tones) - Legacy
          ember: '#ff6b35',
          arcane: '#8b5cf6',
          poison: '#10b981',
          ice: '#06b6d4',

          // Semantic colors - Legacy
          health: '#dc2626',
          mana: '#3b82f6',
          stamina: '#f59e0b',
          danger: '#991b1b',

          // NEW DESIGN SYSTEM COLORS (Character Creation)
          // Primary Purple (Dark Fantasy)
          purple: {
            0: '#2D1B69', // Darkest - Deep backgrounds, base layer
            1: '#3D2B7D', // Darker - Card backgrounds, elevated surfaces
            2: '#4D3B8D', // Mid - Interactive surfaces, hovers
            3: '#5D4B9D', // Lighter - Hover states, highlights
          },

          // Gold Accent (Primary)
          gold: '#D4AF37',         // Standard gold
          'gold-light': '#F0E68C', // Light highlights, glows
          'gold-dark': '#B8860B',  // Dark shadows, pressed states

          // Secondary Teal/Blue
          teal: {
            0: '#1B4D5C', // Dark teal
            1: '#2B6D7C', // Mid teal
            2: '#3B8D9C', // Light teal
          },

          // Status Colors (Semantic)
          success: '#10B981', // Green
          error: '#EF4444',   // Red
          warning: '#F59E0B', // Amber/Yellow
          info: '#3B82F6',    // Blue

          // Text Colors
          text: {
            primary: '#F3F4F6',   // Near white
            secondary: '#D1D5DB', // Light gray
            muted: '#9CA3AF',     // Medium gray
            accent: '#fbbf24',    // Legacy accent
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
        'fade-in-300': 'fadeIn 300ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'slide-in-right': 'slideInRight 300ms ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        // Text-specific glow animation without opacity/filter changes to avoid flicker
        'text-glow': 'textGlow 2500ms ease-in-out infinite',
        'golden-glow': 'goldenGlow 3000ms ease-in-out infinite',
        // New design system animations
        'spin': 'spin 1s linear infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'shake': 'shake 300ms ease',
        'checkmark': 'checkmark 400ms ease',
        'error-pulse': 'errorPulse 1s ease infinite',
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
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
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
        // New design system keyframes
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '50%': { transform: 'translateX(5px)' },
          '75%': { transform: 'translateX(-5px)' },
        },
        checkmark: {
          '0%': { transform: 'scale(0) rotate(0deg)' },
          '50%': { transform: 'scale(1.2) rotate(180deg)' },
          '100%': { transform: 'scale(1) rotate(360deg)' },
        },
        errorPulse: {
          '0%, 100%': {
            borderColor: '#EF4444',
            boxShadow: '0 0 8px rgba(239,68,68,0.3)',
          },
          '50%': {
            borderColor: '#DC2626',
            boxShadow: '0 0 12px rgba(239,68,68,0.5)',
          },
        },
      },
    },
  },
  plugins: [],
}
