# ZIMOR Luxury Carry — Backend Architecture & API Reference

Welcome to the backend service for **ZIMOR Luxury Carry**, an enterprise-grade RESTful API server engineered with **Node.js, Express, and TypeScript**. The backend powers product cataloging, order fulfilment, payment settlements, media asset storage, customer management, and the administrative content management system (CMS).

---

## 1. Architectural Principles

The backend architecture follows a **Decoupled Provider Pattern**:
1. **Zero Hardcoded External Dependencies**: Storage, media, and payments are abstracted behind unified TypeScript interfaces (`DatabaseProvider`, `MediaProvider`, `PaymentProvider`).
2. **Local Development Out of the Box**: Works completely offline without requiring active MongoDB Atlas, Cloudinary, or Razorpay credentials. It uses structured JSON file storage, local filesystem media uploads, and a simulated mock payment gateway.
3. **Zero-Code Production Migration**: When production credentials become available, switching to MongoDB Atlas, Cloudinary CDN, and live Razorpay requires **only updating environment variables** in `.env.local`—no API routes, controllers, or frontend code need to be rewritten.
4. **Strict Server-Side Validation**: Product pricing, discounts, and warehouse inventory are verified on the server before an order or payment is recorded.

---

## 2. Technology Stack

- **Runtime**: Node.js (v20+ recommended)
- **Framework**: Express.js (v4.21+)
- **Language**: TypeScript (ES2022 / ESNext modules)
- **Database (Dev)**: Local JSON seed repository with thread-safe file operations
- **Database (Prod)**: MongoDB Atlas with Mongoose (v8+) schemas and serverless connection pooling
- **Media (Dev)**: Local `.local-uploads` directory served statically
- **Media (Prod)**: Cloudinary SDK with organized folder hierarchies
- **Payments (Dev)**: Simulated Mock Payment Provider (auto-generates signatures & IDs)
- **Payments (Prod)**: Razorpay Node SDK with HMAC-SHA256 signature verification & webhooks
- **Authentication**: HMAC-SHA256 encrypted session tokens stored in secure `httpOnly` cookies

---

## 3. Directory Structure

```
backend/
├── src/
│   ├── config/                        # Global environment configuration
│   │   └── index.ts                   # Loads and types PORT, DB, Cloudinary, Razorpay, Auth keys
│   │
│   ├── db/                            # Database Layer
│   │   ├── providers/                 # Provider Abstractions
│   │   │   ├── interface.ts           # DatabaseProvider contract (CRUD methods)
│   │   │   ├── json-provider.ts       # Local JSON repository provider (development)
│   │   │   └── mongodb-provider.ts    # MongoDB Atlas Mongoose provider (production)
│   │   ├── models/                    # Mongoose Production Schemas
│   │   │   ├── Product.ts             # Silhouette model (pricing, colors, specs)
│   │   │   ├── Category.ts            # Category collection model
│   │   │   ├── Order.ts               # Order model (items, shipping, payment status)
│   │   │   ├── Customer.ts            # Patron profile model
│   │   │   ├── MediaItem.ts           # Media asset metadata model
│   │   │   ├── SiteContent.ts         # Dynamic CMS content model
│   │   │   └── AdminUser.ts           # Admin authentication credential model
│   │   ├── seed/                      # Structured JSON Seed Data (Development)
│   │   │   ├── products.json          # 6 Permanent Core Collection silhouettes
│   │   │   ├── categories.json        # Tote Bags, Laptop Bags, Shoulder Bags
│   │   │   ├── orders.json            # Initial development orders
│   │   │   ├── customers.json         # Patron records
│   │   │   ├── content.json           # Homepage, About Us & Policy CMS content
│   │   │   ├── admins.json            # Admin credentials
│   │   │   └── media.json             # Media references
│   │   ├── mongodb.ts                 # Cached serverless Mongoose connection helper
│   │   └── index.ts                   # Database Provider factory (switches JSON ↔ Mongo)
│   │
│   ├── media/                          # Media & Asset Storage Layer
│   │   ├── providers/
│   │   │   ├── interface.ts           # MediaProvider contract (upload, delete, listFiles)
│   │   │   ├── local-provider.ts      # Local disk storage (.local-uploads)
│   │   │   └── cloudinary-provider.ts # Cloudinary CDN with zimor/ folder hierarchy
│   │   └── index.ts                   # Media Provider factory (switches Local ↔ Cloudinary)
│   │
│   ├── payments/                       # Payment Processing Layer
│   │   ├── providers/
│   │   │   ├── interface.ts           # PaymentProvider contract (createOrder, verify, refund)
│   │   │   ├── mock-provider.ts       # Simulated mock payment provider for development
│   │   │   └── razorpay-provider.ts   # Official Razorpay SDK integration
│   │   └── index.ts                   # Payment Provider factory (switches Mock ↔ Razorpay)
│   │
│   ├── auth/                          # Security & Authentication
│   │   └── index.ts                   # HMAC-SHA256 session token generation & verification
│   │
│   ├── middleware/                    # Express Middleware
│   │   ├── auth.ts                    # requireAdminAuth guard (checks cookie / Bearer token)
│   │   └── upload.ts                  # Multer memory storage for 50MB file uploads
│   │
│   ├── controllers/                   # Route Controllers
│   │   ├── productController.ts       # Silhouette CRUD and category filters
│   │   ├── categoryController.ts      # Category architecture CRUD
│   │   ├── orderController.ts         # Order placement, price validation, courier dispatch
│   │   ├── customerController.ts      # Patron directory and spend statistics
│   │   ├── paymentController.ts       # Payment order creation, verification, webhooks
│   │   ├── mediaController.ts         # Media upload, listing, and asset deletion
│   │   ├── contentController.ts       # Dynamic CMS retrieval and updates
│   │   ├── authController.ts          # Admin login, logout, and session check
│   │   └── adminController.ts         # Overview analytics and provider diagnostics
│   │
│   ├── routes/                        # Express API Routes
│   │   ├── productRoutes.ts           # /api/products
│   │   ├── categoryRoutes.ts          # /api/categories
│   │   ├── orderRoutes.ts             # /api/orders
│   │   ├── customerRoutes.ts          # /api/customers
│   │   ├── paymentRoutes.ts           # /api/checkout and /api/payments
│   │   ├── mediaRoutes.ts             # /api/media
│   │   ├── contentRoutes.ts           # /api/content
│   │   ├── authRoutes.ts              # /api/auth
│   │   ├── adminRoutes.ts             # /api/admin
│   │   └── index.ts                   # Root API Router mounting all modules
│   │
│   ├── types/                         # Backend TypeScript Types
│   │   └── index.ts                   # Core data models, cart items, order status
│   │
│   └── server.ts                      # Express application entrypoint (port 5001)
│
├── .env.example                       # Documented environment variable template
├── tsconfig.json                      # TypeScript configuration
└── package.json                       # Dependencies & scripts
```

---

## 4. Provider Abstraction Architecture

### 4.1 Database Provider (`DatabaseProvider`)
Implemented in `src/db/providers/`:
- **`JsonDatabaseProvider` (Development)**: Reads and writes to structured JSON files located in `src/db/seed/`. Supports atomic writes, in-memory filtering, and ID generation using `crypto.randomUUID()`.
- **`MongoDatabaseProvider` (Production)**: Uses Mongoose models connected to MongoDB Atlas. Includes serverless connection caching to prevent connection exhaustion.
- **Factory Selection**: Controlled via `USE_MOCK_DB=true|false` and the presence of `MONGODB_URI`.

### 4.2 Media Storage Provider (`MediaProvider`)
Implemented in `src/media/providers/`:
- **`LocalMediaProvider` (Development)**: Saves binary uploads directly into `.local-uploads/` on the server filesystem and serves them via `/api/media/local/[...path]`.
- **`CloudinaryMediaProvider` (Production)**: Streams uploads directly to Cloudinary using the required folder hierarchy:
  ```
  zimor/
    products/            # Silhouette primary images
    products/gallery/    # PDP gallery thumbnails and detail shots
    products/variants/   # Colorway specific imagery
    homepage/hero/       # Homepage carousel billboards
    homepage/lifestyle/  # Everyday, Work, Travel cards
    about/               # Atelier, Story, and Craftsmanship visuals
    banners/             # Promotional banners
    videos/              # Shop by Video MP4 reels
  ```
- **Factory Selection**: Controlled via `USE_MOCK_MEDIA=true|false` and Cloudinary API credentials.

### 4.3 Payment Provider (`PaymentProvider`)
Implemented in `src/payments/providers/`:
- **`MockPaymentProvider` (Development)**: Generates valid mock order IDs (`order_mock_...`), mock payment IDs (`pay_mock_...`), and authentic HMAC-SHA256 signatures for seamless local end-to-end checkout testing.
  > [!IMPORTANT]
  > Guarded against accidental production usage: Throws an exception if `NODE_ENV === 'production'`.
- **`RazorpayPaymentProvider` (Production)**: Utilizes the official Razorpay SDK to create orders in paise, verifies payment signatures, processes webhooks, and supports refunds.
- **Factory Selection**: Controlled via `USE_MOCK_PAYMENT=true|false` and Razorpay keys.

---

## 5. REST API Documentation

### 5.1 System & Health Check
- **`GET /health`**: Returns service status, active providers, and server timestamp.
- **`GET /`**: Returns basic service information.

### 5.2 Products (`/api/products`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | List silhouettes. Supports `?category=`, `?featured=true`, and `?search=` |
| `GET` | `/api/products/slug/:slug` | Public | Get silhouette details by URL slug |
| `GET` | `/api/products/:id` | Public | Get silhouette details by ID |
| `POST` | `/api/products` | Admin | Create a new silhouette |
| `PUT` | `/api/products/:id` | Admin | Update silhouette details, prices, or inventory |
| `DELETE` | `/api/products/:id` | Admin | Delete a silhouette |

### 5.3 Categories (`/api/categories`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/categories` | Public | List all categories |
| `POST` | `/api/categories` | Admin | Create a new category |
| `PUT` | `/api/categories/:id` | Admin | Update category name, slug, or description |
| `DELETE` | `/api/categories/:id` | Admin | Delete a category |

### 5.4 Orders & Tracking (`/api/orders`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/orders` | Admin | List all patron orders. Supports `?status=` and `?customerId=` |
| `GET` | `/api/orders/:id` | Admin | Get full order details |
| `GET` | `/api/orders/track` | Public | Track order status by `?orderNumber=` and `?email=` |
| `POST` | `/api/orders` | Public | Place order with server-side price & stock verification |
| `PATCH` | `/api/orders/:id` | Admin | Update order status and set tracking courier / AWB |

### 5.5 Customers (`/api/customers`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/customers` | Admin | List all registered patrons and order statistics |

### 5.6 Payments (`/api/checkout` & `/api/payments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/checkout/create` | Public | Create payment order (Razorpay or Mock) |
| `POST` | `/api/checkout/verify` | Public | Verify payment signature after checkout modal |
| `POST` | `/api/checkout/webhook`| Public | Razorpay webhook listener for captured payments |
| `GET` | `/api/payments` | Admin | Get payment ledger and transaction records |

### 5.7 Media Management (`/api/media`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/media` | Public | List media assets in a folder (`?folder=zimor/products`) |
| `POST` | `/api/media` | Admin | Upload file asset (`multipart/form-data`) |
| `DELETE` | `/api/media` | Admin | Delete asset by `?publicId=` or `?id=` |

### 5.8 Content Management (`/api/content`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/content/:page` | Public | Get dynamic CMS content for `homepage`, `about`, `policy` |
| `PUT` | `/api/content/:page` | Admin | Update dynamic CMS content sections |

### 5.9 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Admin login. Sets `zimor_admin_session` cookie |
| `POST` | `/api/auth/logout` | Public | Admin logout. Clears session cookie |
| `GET` | `/api/auth/me` | Public | Verify current admin session |

### 5.10 Admin Diagnostics (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Admin | Get metrics (revenue, orders, low stock, providers) |

---

## 6. Zero-Code Migration Guide

To transition from local development mocks to live production services, simply supply the following credentials in `backend/.env.local`:

```bash
# 1. MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/zimor?retryWrites=true&w=majority
USE_MOCK_DB=false

# 2. Cloudinary CDN
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
USE_MOCK_MEDIA=false

# 3. Razorpay Gateway
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
USE_MOCK_PAYMENT=false

# 4. Production Security
NODE_ENV=production
ADMIN_EMAIL=your_secure_admin_email@zimor.in
ADMIN_PASSWORD=your_strong_admin_password
ADMIN_JWT_SECRET=generate_a_random_32_character_secret_string
```

When restarted, the application will automatically connect to MongoDB Atlas, store uploads in Cloudinary, and process real payments via Razorpay without modifying any code.

---

## 7. Getting Started

### Installation
```bash
cd backend
npm install
```

### Run in Development Mode
```bash
npm run dev
# Starts API server on http://localhost:5001 with hot reloading (tsx)
```

### Production Build & Run
```bash
npm run build
npm run start
# Compiles TypeScript into dist/ and starts server via node dist/server.js
```
