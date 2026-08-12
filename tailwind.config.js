/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#12121A',      // Midnight Panel (Pramac/Navy)
          darker: '#09090B',    // Deep Matte Carbon (Aprilia Black)
          darkest: '#050505',   // Off-Black Canvas
          border: '#2D2B55',    // Deep Royal Indigo (Pramac)
          borderHover: '#46427D', 
          text: '#F8F8F2',      // Crisp Pure White
          textMuted: '#8B949E', // Matte Silver
          accent: '#00E5FF',    // Neon Cyan Blue
          accentHover: '#E6FF00', // Electric Neon Yellow (Trackhouse)
          nodeFeat: '#00E5FF',  // Neon Cyan
          nodeFix: '#E0115F',   // Deep Purple-Red / Ducati Crimson
          nodeRefactor: '#E6FF00', // Neon Yellow
          nodeDefault: '#FF6600', // KTM Orange
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['Fira Code', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
