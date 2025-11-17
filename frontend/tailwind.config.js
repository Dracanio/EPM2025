/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          600: '#0077b6',
          700: '#005f8d',
        },
      },
    },
  },
  plugins: [],
}


