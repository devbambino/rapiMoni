module.exports = {
    darkMode: 'class',
    content: [
        './app/**/*.{js,ts,jsx,tsx}',         // App directory
        './pages/**/*.{js,ts,jsx,tsx}',       // Pages directory (if used)
        './components/**/*.{js,ts,jsx,tsx}',  // Any components folder
    ],
    theme: {
        extend: {
            colors: {
                primary: '#003366',
                secondary: '#50e2c3',
                accent: '#4b91e2',
                neutral: '#cceff1',
            },
        },
    },
    plugins: [],
}