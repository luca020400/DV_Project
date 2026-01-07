/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'unige-blue': '#002677',
        'unige-yellow': '#F4DA40',
        'unige-red': '#C8102E',
        'unige-lightblue': '#199BFC',
        'unige-dark': '#25282A',
        'unige-gray': '#D9D9D6',
      },
      fontFamily: {
        sans: ['Fira Sans', 'sans-serif'],
        serif: ['Roboto Slab', 'serif'],
      },
    },
  },
  plugins: [],
}
