/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./inventory/index.html",
    "./blog.html",
    "./_layouts/**/*.html",
    "./_posts/**/*.md",
    "./js/**/*.js",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f4623a',
          dark: '#ff8c42',
        },
      },
      fontFamily: {
        sans: ['Merriweather Sans', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
}

