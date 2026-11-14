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
        zimor: {
          orange: '#b44220',   // Orange Blossom (Accents, CTAs, Active States)
          black: '#000000',    // Black (Text, Dark Surfaces)
          brown: '#3f2211',    // Brown (Secondary Text, Dark Surfaces)
          cream: '#caab8e',    // Cream (Soft Backgrounds, Cards)
          ashGrey: '#b4b4b4',  // Ash Grey (Borders, Dividers, Disabled States only)
          white: '#ffffff',    // White (Page Background, Text on Dark/Orange)
        },
        brand: {
          50: '#caab8e',
          100: '#caab8e',
          200: '#caab8e',
          300: '#caab8e',
          400: '#caab8e',
          500: '#b44220',
          600: '#b44220',
          700: '#b44220',
          800: '#b44220',
          900: '#000000',
          950: '#000000',
        },
        canvas: {
          DEFAULT: '#ffffff',  // White for page background
          card: '#ffffff',     // White
          soft: '#caab8e',     // Cream for soft backgrounds
          alt: '#caab8e',      // Cream
          dark: '#000000',     // Black for dark surfaces
          darkSurface: '#3f2211', // Brown for secondary dark surfaces
        },
        ink: {
          DEFAULT: '#000000',   // Black for primary text
          secondary: '#3f2211', // Brown for secondary text
          muted: '#3f2211',     // Brown (Rule 4: never use Ash Grey for body text)
          faint: '#3f2211',     // Brown
        },
        line: {
          DEFAULT: '#b4b4b4',   // Ash Grey for borders & dividers only
          subtle: '#b4b4b4',    // Ash Grey
          dark: '#3f2211',      // Brown
        },
      },
      fontFamily: {
        primary: ['var(--font-primary)', '"Akzidenz Grotesk"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        secondary: ['var(--font-secondary)', '"DM Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        heading: ['var(--font-primary)', '"Akzidenz Grotesk"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        sans: ['var(--font-secondary)', '"DM Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.2em',
        luxury: '0.15em',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03)',
        'lift': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'drawer': '-4px 0 24px rgba(0, 0, 0, 0.12)',
      },
      aspectRatio: {
        '3/4': '3 / 4',
        '4/5': '4 / 5',
      },
    },
  },
  plugins: [],
};
