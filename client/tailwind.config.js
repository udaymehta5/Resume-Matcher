/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        linkedin: {
          50: '#f0f6ff',
          100: '#e0edff',
          200: '#bae0ff',
          500: '#0077b5',
          600: '#0a66c2', // Official LinkedIn Blue
          700: '#004182',
          800: '#002f5e',
          900: '#001d3d',
        },
        slate: {
          850: '#151e2e',
          950: '#0b0f19',
        },
      },
    },
  },
  plugins: [],
};
