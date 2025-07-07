/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ema Color Palette
        primary: {
          50: '#f0f4ff',
          100: '#e5edff',
          200: '#d0dcff',
          300: '#afc2ff',
          400: '#8b9cff',
          500: '#667eea',  // Main primary color
          600: '#5a67d8',
          700: '#4c51bf',
          800: '#434190',
          900: '#3c366b',
        },
        secondary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#f5576c',  // Main secondary color (pink)
          600: '#ef4444',
          700: '#dc2626',
          800: '#b91c1c',
          900: '#991b1b',
        },
        tertiary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#4facfe',  // Main tertiary color (blue)
          600: '#0ea5e9',
          700: '#0284c7',
          800: '#0369a1',
          900: '#0c4a6e',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #4facfe 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #f5576c 0%, #667eea 100%)',
        'gradient-hero': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      boxShadow: {
        'primary': '0 10px 25px -3px rgba(102, 126, 234, 0.1), 0 4px 6px -2px rgba(102, 126, 234, 0.05)',
        'secondary': '0 10px 25px -3px rgba(245, 87, 108, 0.1), 0 4px 6px -2px rgba(245, 87, 108, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}