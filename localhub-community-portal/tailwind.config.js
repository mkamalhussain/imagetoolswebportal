/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        village: {
          primary: '#8B4513', // Warm brown
          secondary: '#D2691E', // Chocolate
          accent: '#F4A460', // Sandy brown
          light: '#FFF8DC', // Cornsilk
          dark: '#654321', // Dark brown
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

