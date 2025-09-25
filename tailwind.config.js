/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          foreground: '#eff6ff',
        },
        secondary: {
          DEFAULT: '#4b5563',
          foreground: '#f9fafb',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

