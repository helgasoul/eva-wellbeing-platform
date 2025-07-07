/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ========================================
           EVA COLORS - Ema Style
           ======================================== */
        
        // Primary colors (Ema purple-blue)
        primary: {
          50: '#f6f7fe',
          100: '#eaeefс',
          200: '#dde4f8',
          300: '#c6d2f1',
          400: '#a8b7e8',
          500: '#667eea', // Main primary
          600: '#5a6bd8',
          700: '#4a5bb8',
          800: '#3e4d96',
          900: '#334179',
        },
        
        // Secondary colors (Ema pink)
        secondary: {
          50: '#fef2f4',
          100: '#fce7ea',
          200: '#f9d1d8',
          300: '#f4aab8',
          400: '#ed7892',
          500: '#f5576c', // Main secondary
          600: '#e33849',
          700: '#c42a3b',
          800: '#a52536',
          900: '#8b2332',
        },
        
        // Tertiary colors (Ema blue)
        tertiary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#4facfe', // Main tertiary
          600: '#2b8cdc',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        
        // Soft colors (Ema peach)
        soft: {
          50: '#fffbf0',
          100: '#fff3e6',
          200: '#ffecd2', // Main soft start
          300: '#ffd89b',
          400: '#fcb69f', // Main soft end
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        
        // Neutral colors
        gray: {
          50: '#f8f9fb',  // Very light background
          100: '#f1f5f9', // Light background
          200: '#e1e5e9', // Borders
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569', // Medium text
          700: '#334155',
          800: '#1e293b',
          900: '#1a1a1a', // Dark text
        },
        
        // Semantic colors
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      
      /* ========================================
         GRADIENTS - Ema Style
         ======================================== */
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, rgb(102, 126, 234) 0%, rgb(79, 172, 254) 100%)',
        'gradient-secondary': 'linear-gradient(135deg, rgb(245, 87, 108) 0%, rgb(102, 126, 234) 100%)',
        'gradient-tertiary': 'linear-gradient(135deg, rgb(79, 172, 254) 0%, rgb(102, 126, 234) 100%)',
        'gradient-soft': 'linear-gradient(135deg, rgb(255, 236, 210) 0%, rgb(252, 182, 159) 100%)',
        'gradient-hero': 'linear-gradient(135deg, rgb(248, 249, 251) 0%, rgb(255, 255, 255) 100%)',
        'gradient-accent': 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%)',
      },
      
      /* ========================================
         TYPOGRAPHY
         ======================================== */
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      
      /* ========================================
         ANIMATIONS
         ======================================== */
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      
      /* ========================================
         SPACING & SIZING
         ======================================== */
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      /* ========================================
         BORDER RADIUS
         ======================================== */
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      
      /* ========================================
         BOX SHADOWS - Ema Style
         ======================================== */
      boxShadow: {
        'soft': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'medium': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'large': '0 16px 48px rgba(0, 0, 0, 0.16)',
        'primary': '0 8px 32px rgba(102, 126, 234, 0.15)',
        'secondary': '0 8px 32px rgba(245, 87, 108, 0.15)',
        'tertiary': '0 8px 32px rgba(79, 172, 254, 0.15)',
      },
    },
  },
  plugins: [],
}