/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4B3FE3',
          soft: '#F2F7FF',
          dark: '#3C2ECA',
        },
        surface: '#F7F7F8',
      },
      fontFamily: {
        sans: ['"PingFang SC"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
  corePlugins: { preflight: true },
};
