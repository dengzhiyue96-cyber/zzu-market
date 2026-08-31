/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6A3A91',      // 郑大紫（主色）
          soft: '#F3ECF9',          // 淡紫背景
          dark: '#522B75',          // 深紫按钮按压态
          50: '#F9F3FC',
          100: '#F0E4F9',
          600: '#6A3A91',
          700: '#522B75',
        },
        gold: {
          DEFAULT: '#C9A658',       // 校徽金（辅色）
          soft: '#FBF5E6',
          dark: '#B39044',
        },
        surface: '#FAFAFA',
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        display: ['"PingFang SC"', '"SimHei"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 10px 30px -10px rgba(106,58,145,0.45)',
      },
      backgroundImage: {
        'zzu-gradient': 'linear-gradient(135deg, #6A3A91 0%, #8B4FBD 50%, #C9A658 160%)',
      },
    },
  },
  plugins: [],
  corePlugins: { preflight: true },
};
