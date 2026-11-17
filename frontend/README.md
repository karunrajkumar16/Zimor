# ZIMOR Luxury Carry — Frontend Architecture & Developer Guide

Welcome to the frontend application for **ZIMOR Luxury Carry**, an ultra-premium direct-to-consumer (D2C) luxury handbag and carry atelier based in India. This repository contains the complete Next.js storefront, customer portal, and luxury dark administrative dashboard.

---

## 1. Design Philosophy & Visual Identity

The frontend adheres strictly to the official **ZIMOR Visual Identity & Guidelines**:
- **Aesthetic**: Minimalist high-fashion editorial (inspired by Polène Paris, The Row, and Rimowa).
- **Core Color Palette**:
  - Pure Black: `#000000` (text, luxury accents, dark admin surfaces)
  - Pure White: `#ffffff` (canvas, primary card backgrounds)
  - Luxury Platinum / Silver Grey: `#b4b4b4` / `#e5e5e5` (subtle borders and dividers)
  - Light Canvas Background: `#FAF8F5` / `#f5f5f5`
  - Charcoal / Dark Neutral: `#141414` / `#1c1c1c` (admin surfaces)
- **Typography**:
  - Primary / Headings: `Cormorant Garamond` & `Syne`
  - Body / UI: `Plus Jakarta Sans` & `Inter`
  - Uppercase tracked subheadings (`tracking-[0.25em]`) for boutique elegance.

---

## 2. Technology Stack

- **Framework**: Next.js 15.5+ (App Router architecture with React 19)
- **Language**: TypeScript (strict type-checking)
- **Styling**: Tailwind CSS with custom typography and shadow tokens
- **Icons**: Lucide React
- **Animations**: CSS transitions, hardware-accelerated transforms, and smooth scroll behaviors
- **Client State**: Native React hooks, Context API, and LocalStorage persistence for Cart & Wishlist

---

## 3. Directory Structure

```
frontend/
├── public/                            # Static media and assets
│   ├── about/                         # Editorial campaign images for About Us
│   ├── banners/                       # Hero carousel billboard graphics
│   ├── products/                      # Silhouette product photographs & blur assets
│   ├── reels/                         # Video clips for "Shop by Video" reels
│   └── favicon.ico / icon.svg         # Brand emblems & favicon
│
├── src/
│   ├── app/                           # Next.js App Router pages
│   │   ├── (storefront)/
│   │   │   ├── page.tsx               # Homepage (Hero, Featured, Lifestyle, Reels)
│   │   │   ├── shop/page.tsx          # Permanent Collection catalog & filters
│   │   │   ├── product/[slug]/        # Dynamic Product Detail Page (PDP)
│   │   │   ├── about/page.tsx         # Brand Story, Vision, Mission & 7 Values
│   │   │   ├── cart/page.tsx          # Cart review page
│   │   │   ├── checkout/page.tsx      # Multi-step checkout & payment
│   │   │   ├── checkout/success/      # Order confirmation & receipt summary
│   │   │   ├── account/page.tsx       # Patron profile & dashboard
│   │   │   ├── account/orders/        # Patron order history & tracking
│   │   │   ├── contact/page.tsx       # Contact concierge & social links
│   │   │   ├── faq/page.tsx           # Accordion FAQ & support guidelines
│   │   │   ├── policy/page.tsx        # Warranty, shipping & return policies
│   │   │   └── wishlist/page.tsx      # Patron wishlist collection
│   │   │
│   │   ├── admin/                     # Administrative Control Center
│   │   │   ├── layout.tsx             # Luxury dark admin sidebar & auth guard
│   │   │   ├── page.tsx               # Executive dashboard, revenue growth & orders pipeline
│   │   │   ├── banners/page.tsx       # Dedicated Homepage Hero Banners Manager
│   │   │   ├── login/page.tsx         # Secure admin login portal
│   │   │   ├── products/page.tsx      # Catalog CRUD (pricing, variants, images)
│   │   │   ├── categories/page.tsx    # Category architecture management
│   │   │   ├── inventory/page.tsx     # Warehouse stock tracking & unit adjustments
│   │   │   ├── orders/page.tsx        # Order status transitions & courier tracking
│   │   │   ├── customers/page.tsx     # Patron directory & lifetime value
│   │   │   ├── payments/page.tsx      # Payment ledger & reconciliation
│   │   │   ├── media/page.tsx         # Media vault (Cloudinary / Local storage)
│   │   │   ├── content/home/page.tsx  # Homepage Hero & Lifestyle CMS
│   │   │   ├── content/about/page.tsx # Brand Story, Vision & Values CMS
│   │   │   ├── content/policy/page.tsx# Policy CMS (Shipping, Returns, Warranty)
│   │   │   └── settings/page.tsx      # Architecture diagnostics & migration guide
│   │   │
│   │   ├── globals.css                # Global stylesheet and custom utilities
│   │   └── layout.tsx                 # Root layout with Header, Footer & AnnouncementBar
│   │
│   ├── components/                    # Reusable React components
│   │   ├── home/                      # Homepage sections
│   │   │   ├── HeroBanner.tsx         # 3-slide rotating editorial carousel
│   │   │   ├── FeaturedProducts.tsx   # 6 permanent silhouettes showcase
│   │   │   ├── LifestyleDiscovery.tsx # Everyday, Work, and Travel portals
│   │   │   ├── ShopByVideo.tsx        # Instagram-style vertical video reels
│   │   │   └── AboutZimor.tsx         # Atelier introduction section
│   │   │
│   │   ├── product/                   # Product components
│   │   │   ├── ProductCard.tsx        # Catalog card with hover swap & quick view
│   │   │   ├── ProductDetailView.tsx  # Master PDP view with colorway selection
│   │   │   ├── ProductGallery.tsx     # Multi-image thumbnail carousel & zoom modal
│   │   │   ├── QuickViewModal.tsx     # Fast silhouette drawer modal
│   │   │   └── ReviewModal.tsx        # Verified review submission modal
│   │   │
│   │   ├── layout/                    # Global shell components
│   │   │   ├── Header.tsx             # Navigation with dropdowns & search modal
│   │   │   ├── Footer.tsx             # 4-column luxury footer with newsletter
│   │   │   ├── AnnouncementBar.tsx    # Ticker with dispatch guarantee & promo codes
│   │   │   ├── MobileNav.tsx          # Full-screen sliding drawer for mobile devices
│   │   │   └── SmoothScroll.tsx       # Anchor scroll listener for deep linking
│   │   │
│   │   ├── cart/                      # Cart components
│   │   │   └── CartDrawer.tsx         # Slide-out cart with subtotal & free shipping bar
│   │   │
│   │   └── faq/                       # FAQ components
│   │       └── FAQAccordion.tsx       # Expandable category accordion
│   │
│   ├── data/                          # Frontend static data
│   │   ├── products.ts                # Initial 6 silhouettes fallback data
│   │   └── social.ts                  # Official Instagram, Pinterest, YouTube links
│   │
│   └── types/                         # Frontend TypeScript interfaces
│       └── index.ts                   # Product, Order, Customer, Category, MediaItem
│
├── next.config.mjs                    # Next.js config with API proxy rewrites & image domains
├── tailwind.config.js                 # Custom typography, colors, animations & layout tokens
├── tsconfig.json                      # Strict TypeScript compiler options
└── package.json                       # Dependencies & frontend scripts
```

---

## 4. Key Frontend Features

### 4.1 Master Product Detail Page (PDP)
- **High-Resolution Gallery**: Multi-image gallery with thumbnail navigation and full-screen lightbox zoom.
- **Dynamic Colorway Switcher**: Interactive swatch picker that instantly updates the displayed bag color and hero photography.
- **Laptop Compatibility Guide**: Clear visual badge and dimensions guide displaying exact fit (e.g. 15.6" or 14" MacBook).
- **Tabbed Craftsmanship Accordion**: Details regarding Vegan Microfiber Leather, lining, hardware, care instructions, and 1-year warranty coverage.

### 4.2 Seamless Cart & Checkout
- **Slide-out Cart Drawer**: Allows users to adjust quantities, remove items, view free shipping eligibility (orders over ₹2,000), and enter promotional discount codes.
- **Checkout Experience**: Single-page luxury checkout collecting customer contact, shipping address, and delivery preferences.
- **Server Validation**: Prices, stock availability, discounts, and final payable amounts are validated on the backend.
- **Payment Modal**: Seamlessly connects to the Backend Payment Provider (Mock Sandbox during local development, Razorpay Modal in production).

### 4.3 Shop by Lifestyle Navigation
- The homepage features three dedicated lifestyle categories:
  1. **EVERYDAY**: *"For the everyday."*
  2. **WORK**: *"For what lies ahead."*
  3. **TRAVEL**: *"For places beyond."*
- Clicking any card on the homepage navigates directly to the `/shop` page and scrolls smoothly to the corresponding section using unique anchor targets (`#everyday`, `#work`, `#travel`).

### 4.4 Luxury Dark Admin Dashboard (`/admin`)
- Built specifically for non-technical administrators to manage the store without modifying source code.
- **Access URL**: `/admin` (Default development login: `admin@zimor.in` / `zimor_admin_2024`).
- **Features**:
  - Live revenue, order count, and low-stock alerts.
  - Full product creation and editing (prices, compare prices, stock, color variations, images).
  - Order status management (`Processing`, `Confirmed`, `Dispatched`, `Out for Delivery`, `Delivered`, `Cancelled`) and courier AWB assignment.
  - Media asset upload and deletion with Cloudinary folder hierarchy support.
  - Homepage Hero, Lifestyle, About Us, and Policy CMS editors.

---

## 5. Backend Connection & API Proxying

The frontend does **not** hardcode backend URLs in client components. Instead, `frontend/next.config.mjs` configures transparent rewrites:

```javascript
// frontend/next.config.mjs
async rewrites() {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
  return [
    {
      source: '/api/:path*',
      destination: `${backendUrl}/api/:path*`,
    },
  ];
}
```

This guarantees:
1. Every frontend API call (e.g., `fetch('/api/products')`) automatically proxies to the Express backend running on port 5001.
2. Browsers do not encounter Cross-Origin Resource Sharing (CORS) or cookie-dropping issues.
3. Deploying frontend on Vercel simply requires setting the `BACKEND_URL` environment variable.

---

## 6. Environment Configuration

Create `.env.local` inside the `frontend/` folder:

```bash
# URL of the running backend server
BACKEND_URL=http://localhost:5001

# Public site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Razorpay Public Key (for Checkout modal)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
```

---

## 7. Getting Started

### Installation
```bash
cd frontend
npm install
```

### Run Development Server
```bash
npm run dev
# Storefront opens at http://localhost:3000
# Admin dashboard opens at http://localhost:3000/admin
```

### Production Build
```bash
npm run build
npm run start
```
The build runs static generation (SSG) across all routes and produces an optimized production bundle.
