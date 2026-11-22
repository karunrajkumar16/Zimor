import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StorefrontLayoutWrapper } from '@/components/layout/StorefrontLayoutWrapper';

export const viewport: Viewport = {
  themeColor: '#000000',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.zimorindia.com'),
  title: 'Zimor India — Premium Handbags & Workbags for Modern Professionals',
  description:
    'Zimor India — premium women\'s workbags, laptop totes, and crescent shoulder bags. Structured, elegant leather bags crafted for the modern working professional.',
  keywords: [
    'Zimor India',
    'women work bags',
    'laptop tote bag',
    'leather handbags India',
    'luxury handbags',
    'professional work bags',
    'delo tote',
    'rabota tote',
    'shoulder bag',
  ],
  authors: [{ name: 'Zimor India' }],
  creator: 'Zimor India',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.zimorindia.com/',
    siteName: 'Zimor India',
    title: 'Zimor India — Structured Luxury Handbags',
    description:
      'Structured, elegant leather workbags crafted for the modern professional with 15.6" laptop compartments.',
    images: [
      {
        url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp',
        width: 1200,
        height: 800,
        alt: 'Zimor India Premium Workbags',
      },
    ],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', sizes: '128x128', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '128x128', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="font-secondary antialiased bg-canvas text-ink flex flex-col min-h-screen font-normal">
        <StorefrontLayoutWrapper>{children}</StorefrontLayoutWrapper>
      </body>
    </html>
  );
}
