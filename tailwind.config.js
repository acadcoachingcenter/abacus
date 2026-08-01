/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        rosewood: { DEFAULT: '#3B2417', light: '#5A3A26', dark: '#2A1810' },
        sandalwood: { DEFAULT: '#C99765', light: '#E0BA92', dark: '#A97841' },
        saffron: { DEFAULT: '#F4A93B', light: '#FBC873', dark: '#D6871A' },
        teal: { DEFAULT: '#0F5E56', light: '#1B8A7D', dark: '#0A423C' },
        ivory: { DEFAULT: '#FBF6EE', dim: '#F2E9D8' },
        ink: { DEFAULT: '#1C1410', soft: '#3A2E26' },
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      boxShadow: {
        bead: '0 2px 3px rgba(28,20,16,0.35), inset 0 1px 1px rgba(255,255,255,0.35), inset 0 -2px 3px rgba(0,0,0,0.25)',
        rod: 'inset 0 1px 2px rgba(0,0,0,0.5)',
        frame: '0 20px 50px -15px rgba(28,20,16,0.5), 0 2px 8px rgba(28,20,16,0.15)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(244,169,59,0.55)' },
          '50%': { boxShadow: '0 0 0 8px rgba(244,169,59,0)' },
        },
      },
      animation: { pulseGlow: 'pulseGlow 1.4s ease-in-out infinite' },
    },
  },
  plugins: [],
};
