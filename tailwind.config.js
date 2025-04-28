/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#003366',   // Deep Indigo
                secondary: '#50e2c3', // Mint Green
                accent: '#4b91e2',    // Sky Blue
                neutral: '#cceff1',   // Soft Teal
            },
        },
    },
    plugins: [],
}
