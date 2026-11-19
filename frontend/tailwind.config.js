/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        zimor: {
          black: '#000000',    // Black (Text, Dark Surfaces, CTAs)
          ashGrey: '#b4b4b4',  // Ash Grey (Borders, Dividers, Subdued Accents)
          white: '#ffffff',    // White (Page Canvas, Surfaces, Text on Dark)
          // Legacy mappings redirected strictly to client 3-color palette:
          orange: '#000000',
          brown: '#000000',
          cream: '#ffffff',
        },
        brand: {
          50: '#f8f8f8',
          100: '#f0f0f0',
          200: '#e5e5e5',
          300: '#b4b4b4',
          400: '#b4b4b4',
          500: '#000000',
          600: '#000000',
          700: '#000000',
          800: '#000000',
          900: '#000000',
          950: '#000000',
        },
        canvas: {
          DEFAULT: '#ffffff',     // White for page background
          card: '#ffffff',        // White
          soft: '#f8f8f8',        // Clean light surface
          alt: '#f8f8f8',         // Clean light surface
          dark: '#000000',        // Pure Black
          darkSurface: '#000000', // Pure Black
        },
        ink: {
          DEFAULT: '#000000',   // Black for primary text
          secondary: '#333333', // Deep high-contrast neutral
          muted: '#555555',     // Medium neutral
          faint: '#777777',     // Light neutral
        },
        line: {
          DEFAULT: '#b4b4b4',   // Ash Grey for borders & dividers
          subtle: '#e5e5e5',    // Subtle hairline
          dark: '#000000',      // Black divider
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
