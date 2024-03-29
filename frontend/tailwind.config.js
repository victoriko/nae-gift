/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {},
    screens: {
      mobile: { min: "320px", max: "767px" },
      tablet: { min: "768px", max: "1439px" },
      note: { max: "1440px" },
    },
  },

  plugins: [],
};
