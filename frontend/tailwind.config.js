/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["index.html", "./src/**/*.{html,css,js,jsx,ts,tsx}"],
    theme: {
        extend: {},
    },
    daisyui: {
        themes: true,
        darkTheme: "fantasy"
    },
    plugins: [require("daisyui")],
}