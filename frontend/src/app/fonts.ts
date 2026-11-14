/**
 * ZIMOR BRAND GUIDELINES (Page 12) - TYPOGRAPHY SPECIFICATION
 *
 * 1. Primary Typeface: Akzidenz Grotesk
 *    - Weights: Regular (400), Medium (500), Semibold (600)
 *    - Role: Headings, hero banners, navigation links, buttons, uppercase labels, product titles
 *    - Expected local WOFF2 files in frontend/public/fonts/:
 *        1. frontend/public/fonts/AkzidenzGrotesk-Regular.woff2   (weight: 400)
 *        2. frontend/public/fonts/AkzidenzGrotesk-Medium.woff2    (weight: 500)
 *        3. frontend/public/fonts/AkzidenzGrotesk-Semibold.woff2  (weight: 600)
 *
 * 2. Secondary Typeface: DM Sans
 *    - Weights: Regular (400), Bold (700)
 *    - Role: Body paragraphs, descriptions, specifications, forms, inputs, placeholders, helper notes
 *    - Loaded via Google Fonts in layout.tsx
 */

// TODO: Akzidenz Grotesk is a commercial font. Once the licensed .woff2 files
// are placed in frontend/public/fonts/, uncomment the localFont import and declaration below:
/*
import localFont from 'next/font/local';

export const akzidenzGrotesk = localFont({
  src: [
    {
      path: '../../public/fonts/AkzidenzGrotesk-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/AkzidenzGrotesk-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/AkzidenzGrotesk-Semibold.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-primary',
  display: 'swap',
});
*/

export const primaryFontFamily =
  '"Akzidenz Grotesk", "Helvetica Neue", Helvetica, Arial, sans-serif';

export const secondaryFontFamily =
  "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
