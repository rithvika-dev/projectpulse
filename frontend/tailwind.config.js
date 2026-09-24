/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F0F6F4',
          100: '#DCEBE6',
          200: '#BAD7CD',
          300: '#90BEB0',
          400: '#64A191',
          500: '#2F6B5F', // Primary Brand Forest Green
          600: '#26574D',
          700: '#1E463E',
          800: '#183832',
          900: '#132C27',
          950: '#0A1815',
        },
        terracotta: {
          50: '#FAF2EE',
          100: '#F4E3DB',
          200: '#E9C6B6',
          300: '#DDA48E',
          400: '#D2856A',
          500: '#C86B4A', // Secondary Brand Terracotta
          600: '#B05636',
          700: '#8E4228',
          800: '#713520',
          900: '#5A2B1A',
        },
        amberGold: {
          50: '#FAF6ED',
          100: '#F4EBD7',
          200: '#E7D5AE',
          300: '#D9BC82',
          400: '#CFA559',
          500: '#C7A35A', // Accent Muted Gold
          600: '#AD8941',
          700: '#896B30',
          800: '#6E5526',
          900: '#57431E',
        },
        sand: {
          50: '#FAF9F6',
          100: '#F5F2EC',
          200: '#EBE5DA',
          300: '#DDD5C5',
          400: '#C6BCAB',
          500: '#ABA08E',
          600: '#8C8271',
          700: '#6D6556',
          800: '#514B3F',
          900: '#38332A',
        },
        charcoal: {
          50: '#F6F7F6',
          100: '#E8EAE8',
          200: '#D0D4CF',
          300: '#B3B9B2',
          400: '#8A9289',
          500: '#656D64',
          600: '#4D544C',
          700: '#3A4039',
          800: '#2A2F29',
          900: '#1B1E1B',
          950: '#121412',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 3px 1px rgba(0, 0, 0, 0.02)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        elevated: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        dropdown: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
