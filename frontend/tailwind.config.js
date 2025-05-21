/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#059669',
          dark: '#047857',
        },
        secondary: {
          DEFAULT: '#4338ca',
          dark: '#3730a3',
        },
      },
    },
  },
  plugins: [],
}; 