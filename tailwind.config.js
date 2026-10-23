/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        title: ['LeMajor', 'serif'],      // For Sneha & Josh, large headers
        subheading: ['Ablation', 'sans-serif'], // For small caps, labels, buttons
        text: ['Cardo', 'serif'],         // For names, search inputs, general text
      }
    },
  },
  plugins: [],
}