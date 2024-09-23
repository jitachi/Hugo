/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'content/**/*.md', 
    'layouts/**/*.html',
    "../../content/**/*.{html,md}",
    "../../layouts/**/*.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

