/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#06060f',
          surface: '#0d0d1e',
          card: '#12122a',
          elevated: '#191935',
          overlay: '#1f1f40',
        },
        silo: {
          50: '#f0eeff',
          100: '#e4e0ff',
          200: '#ccc5ff',
          300: '#b09dff',
          400: '#9370ff',
          500: '#7c4dff',
          600: '#6d3cf0',
          700: '#5c2cd4',
          800: '#4a22ae',
          900: '#3b1c8a',
        },
        border: {
          DEFAULT: '#1e1e38',
          subtle: '#161630',
          strong: '#2a2a50',
          focus: '#7c4dff',
        },
        ink: {
          primary: '#ededf8',
          secondary: '#9090b8',
          muted: '#55557a',
          accent: '#a78bfa',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-xs': '0 0 8px rgba(124, 77, 255, 0.12)',
        'glow-sm': '0 0 16px rgba(124, 77, 255, 0.18)',
        'glow': '0 0 30px rgba(124, 77, 255, 0.22)',
        'glow-lg': '0 0 50px rgba(124, 77, 255, 0.28)',
        'glow-rose': '0 0 20px rgba(249, 77, 106, 0.2)',
        'card': '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,77,255,0.15)',
        'modal': '0 25px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
        'input': '0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 2px rgba(0,0,0,0.4)',
        'input-focus': '0 0 0 2px rgba(124, 77, 255, 0.4), 0 0 0 1px rgba(124, 77, 255, 0.6)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-silo': 'linear-gradient(135deg, #7c4dff 0%, #f94d6a 100%)',
        'gradient-silo-soft': 'linear-gradient(135deg, rgba(124,77,255,0.12) 0%, rgba(249,77,106,0.08) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-up': 'fadeUp 0.3s ease-out',
        'slide-right': 'slideRight 0.25s ease-out',
        'slide-down': 'slideDown 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 1.8s linear infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp: { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideRight: { from: { opacity: '0', transform: 'translateX(-10px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        shimmer: {
          from: { backgroundPosition: '-600px 0' },
          to: { backgroundPosition: '600px 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(124, 77, 255, 0.15)' },
          '50%': { boxShadow: '0 0 35px rgba(124, 77, 255, 0.35)' },
        },
      },
      screens: {
        'xs': '480px',
        '3xl': '1600px',
      },
    },
  },
  plugins: [],
};
