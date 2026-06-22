/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0a0a0f',
        panel: '#13131c',
        panel2: '#1a1a26',
        line: '#2a2a3a',
        muted: '#6b6b85',
        fg: '#e8e8f5',
        p1: '#3fd0ff',
        p1glow: '#7ce3ff',
        p2: '#ff5a7a',
        p2glow: '#ff8fa5',
        gold: '#ffc857',
        danger: '#ff4757',
      },
      fontFamily: {
        display: ['"Rajdhani"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-5px)' },
          '80%': { transform: 'translateX(5px)' },
        },
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 6px currentColor)' },
          '50%': { filter: 'drop-shadow(0 0 18px currentColor)' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-40px)', opacity: '0' },
        },
      },
      animation: {
        shake: 'shake 0.4s ease-in-out',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
        floatUp: 'floatUp 1s ease-out forwards',
      },
    },
  },
  plugins: [],
};
