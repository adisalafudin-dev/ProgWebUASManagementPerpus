
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['"Poppins"', 'Inter', 'system-ui', 'sans-serif'],
        crimson:  ['"Inter"',   'system-ui', 'sans-serif'],
        display:  ['"Poppins"', 'Inter', 'system-ui', 'sans-serif'],
        sans:     ['"Inter"',   'system-ui', 'sans-serif'],
      },
      colors: {
        cream: '#F6F1E8',
        primary: '#18332F',
        secondary: '#5F6F64',
        accent: '#B8892D',
        accentHover: '#7A2E2E',
        textMain: '#1C1B19',
        textSecondary: '#6F6A61',
        borderSoft: '#D8CFC0',
        ink: {
          DEFAULT: '#18332F',
          900: '#1C1B19',
          800: '#18332F',
          700: '#274A43',
          600: '#5F6F64',
        },
        parchment: {
          50:  '#F6F1E8',
          100: '#FFFDF8',
          200: '#D8CFC0',
        },
      },
      boxShadow: {
        book:         '0 2px 10px -2px rgba(28,27,25,0.14), 0 1px 4px -1px rgba(28,27,25,0.08)',
        'book-hover': '0 18px 34px -8px rgba(28,27,25,0.24), 0 8px 14px -5px rgba(28,27,25,0.14)',
      },
    },
  },
  plugins: [],
}
