import type { Config } from 'tailwindcss'
import baseConfig from '@livrili/ui/tailwind.config'

const config: Config = {
  ...baseConfig,
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme?.extend,
      colors: {
        ...baseConfig.theme?.extend?.colors,
        // Livrili Brand Colors
        'livrili': {
          'prussian': '#003049',
          'fire-brick': '#C1121F',
          'air-blue': '#669BBC',
          'papaya': '#FDF0D5',
          'barn-red': '#780000'
        }
      },
      animation: {
        ...baseConfig.theme?.extend?.animation,
        'bounce-gentle': 'bounce-gentle 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'confetti': 'confetti 2s ease-out forwards'
      },
      keyframes: {
        ...baseConfig.theme?.extend?.keyframes,
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'confetti': {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(360deg)', opacity: '0' }
        }
      },
      backdropBlur: {
        xs: '2px'
      },
      boxShadow: {
        'glow': '0 0 20px rgba(102, 155, 188, 0.3)',
        'glow-sm': '0 0 10px rgba(102, 155, 188, 0.2)',
        'celebration': '0 10px 25px rgba(0, 48, 73, 0.15)'
      }
    }
  }
}

export default config