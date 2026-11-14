/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FAF7F2',
          100: '#F5EFE6',
          200: '#E9DEC9',
          300: '#D5C2A5',
          400: '#B89C78',
          500: '#96724E',
          600: '#7A5636',
          700: '#5E4025',
          800: '#422C19',
          900: '#261A10',
          950: '#170F0A',
        },
        canvas: {
          DEFAULT: '#FAF8F5',
          alt: '#F3EFEA',
          card: '#FFFFFF',
          dark: '#161413',
          darkSurface: '#211D1B',
        },
        ink: {
          DEFAULT: '#161413',
          secondary: '#4A4643',
          muted: '#736E69',
          faint: '#A6A099',
        },
        line: {
          DEFAULT: '#E8E3DA',
          subtle: '#F0ECE4',
          dark: '#2E2A27',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        sans: ['Montserrat', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.2em',
        luxury: '0.15em',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(22, 20, 19, 0.04), 0 4px 12px rgba(22, 20, 19, 0.03)',
        'lift': '0 8px 24px rgba(22, 20, 19, 0.08)',
        'drawer': '-4px 0 24px rgba(22, 20, 19, 0.12)',
      },
    },
  },
  plugins: [],
};
