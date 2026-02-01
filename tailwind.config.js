export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}" // Since components are at root level
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        stone: {
          850: '#1c1917',
          950: '#0c0a09',
        }
      }
    },
  },
  plugins: [],
}