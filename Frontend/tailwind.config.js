/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#fafaf9',
                surface: '#ffffff',
                surfaceHover: '#f5f5f4',
                textMain: '#1c1917',
                textMuted: '#78716c',
                primary: '#0ea5e9',
                primaryHover: '#0284c7',
                accent: '#8b5cf6',
                'accent-light': '#a78bfa',
                'accent-hover': '#7c3aed',
                border: '#e7e5e4',
            },
        },
    },
    plugins: [],
}
