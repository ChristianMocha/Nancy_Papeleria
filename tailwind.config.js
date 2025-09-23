/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}" // 👈 importantísimo
  ],
  theme: {
    extend: {
      fontSize: {
        base: '18px', // por ejemplo, cambiar text-base a 18px
      },
    },
  },
  plugins: [],
};
