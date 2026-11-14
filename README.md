# Zimor — Luxury Carry E-Commerce Prototype

A premium, responsive full-featured luxury e-commerce prototype for **Zimor India**, structured into clean `frontend` and `backend` modules. Built with **Next.js 15 (App Router)**, **TypeScript**, and **Tailwind CSS**.

Website Reference: [https://www.zimorindia.com/](https://www.zimorindia.com/)

---

## 🌟 Key Highlights & Architectural Features

### 1. Curated 6-Product Catalogue
Built entirely around Zimor’s signature registered silhouettes and authentic data extracted from the live Zimor India store:
- **ZIMOR Delo Tote — Rust Edition** (15.6" Laptop, Detachable Wristlet Pouch, ₹2,999)
- **ZIMOR Delo Tote — Noir Edition** (Matte Black Leather, Padded Sleeve, ₹2,999)
- **ZIMOR Rabota Tote — Cognac Brown** (15" Laptop, Grab Handles + Crossbody Sling, ₹2,999)
- **ZIMOR Rabota Tote — Espresso Edition** (Deep Coffee Grain, Dual-Carry System, ₹2,999)
- **ZIMOR Classic Shoulder Bag — Cream Canvas** (Crescent Flap, Gold Hardware, ₹1,699)
- **ZIMOR Classic Shoulder Bag — Saddle Tan** (All-Weather Faux Leather Crescent, ₹1,699)

### 2. Shop by Category & Shop by Profession
- **Shop by Category**: Tote Bags (15.6" Laptops), Laptop Bags (Dual-carry with sling), Crescent Shoulder Bags.
- **Shop by Profession**: Tailored carry requirements for:
  - Corporate Executives & Directors
  - Tech Founders & Software Engineers
  - Management Consultants & Strategists
  - Legal Counsel & Private Equity Analysts
  - Creative Directors & Architects
  - Healthcare Clinicians & Academicians
  Includes "What Fits Inside" checklists (MacBook, legal dossiers, tech hubs, water bottles, chargers).

### 3. Dedicated Gifting & Gifts by Occasion
- Curated gift guides for Career Milestones, Promotions, Anniversaries, Birthdays, Graduations, and Corporate Appreciation.
- Complimentary signature luxury embossed gift packaging with espresso grosgrain ribbon.
- Handwritten gift card message input per item in cart.
- Concealed invoice option for discreet doorstep surprises.

### 4. Authentic Customer Reviews & UGC Media
- Real reviews extracted from verified Zimor buyers: Snigdha Mishra, Kinjal Rajpoot, Onkar Raut, Aashna, Annu Sahani, Aishwarya Yadav, Rishika Singh.
- Support for customer review photos and video testimonials with interactive lightbox modal.
- "Write a Customer Review" modal with 5-star selector, headline, comments, and photo/video upload simulation.

### 5. Essential E-Commerce Workflows & Pages
- **Home (`/`)**: High-fashion editorial hero, category showcase, 6-bag collection grid, interactive profession selector, gifting concierge banner, verified reviews with media, craftsmanship pillars.
- **Shop (`/shop`)**: Multi-faceted filtering (Category, Profession, Color, Price), Sorting (Featured, Price, Rating), 2-col/3-col layout switch, and Quick View modal.
- **Product Detail (`/product/[slug]`)**: High-res Cloudinary gallery with hover zoom loupe, thumbnail strip, color switcher, stock urgency badge, accordions (Features, Materials, Dimensions, Care), review breakdown, and "Complete Your Look" recommendations.
- **Cart (`/cart`) & Cart Drawer**: Slide-out cart drawer on add-to-bag, quantity controls, coupon code validation (`WELCOME10`), free express shipping benefit bar, and gift box toggle.
- **Multi-Step Checkout (`/checkout`)**:
  - Step 1: Customer Contact & Shipping Address (India state dropdown, pincode).
  - Step 2: Delivery Method (Free Standard Express 5–7 days, Priority Air 2–3 days).
  - Step 3: Payment Selection (UPI / QR Code, Cards, Net Banking, Cash on Delivery).
- **Order Confirmation (`/checkout/success`)**: Order summary, live tracking stepper, courier AWB tracking info.
- **Customer Account (`/account`) & Orders (`/account/orders`)**: Profile editing, saved addresses, order history, tracking status stepper, mock invoice download, and re-order action.
- **Wishlist (`/wishlist`)**: Saved items grid with one-click "Move to Bag".
- **Supporting Information**:
  - About Us (`/about`)
  - Contact Us (`/contact`) with interactive message form
  - Help & FAQs (`/faq`) with category filter and search
  - Policies: Shipping (`/policies/shipping`), Returns (`/policies/returns`), Privacy (`/policies/privacy`), Terms (`/policies/terms`).

### 6. Design & Aesthetic Standards (Taste Skill)
- **Zero Gradients**: Solid, refined warm ivory/stone canvas (`#FAF8F5`), rich charcoal/espresso (`#161413`), and warm cognac/saddle tan accents (`#96724E`, `#7A5636`).
- **High-Fashion Typography**: Editorial serif (`Playfair Display`) paired with clean geometric grotesque (`Inter`).
- **Quiet Micro-Interactions**: Hover scale 1.02-1.03, smooth drawer slide, active swatch states.
- **Fully Responsive**: Flawless presentation across mobile (390px), tablet (768px), laptop (1024px), and desktop (1440px+).

---

## 📁 Repository Structure

```
Zimor/
├── frontend/   # Next.js 15 App Router e-commerce application
├── backend/    # API and server architecture
├── .gitignore  # Repository root gitignore
└── README.md   # Project documentation
```

---

## 🚀 Running the Prototype

### Frontend Development Server
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Frontend Production Build
```bash
cd frontend
npm run build
npm start
```
All 27 routes are statically optimized (SSG) with zero warnings or errors.

