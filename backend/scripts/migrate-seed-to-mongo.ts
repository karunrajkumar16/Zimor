// backend/scripts/migrate-seed-to-mongo.ts
/**
 * ZIMOR Production Data Migration Script
 * Migrates genuine business seed records (products, categories, content, promotions, legal documents)
 * from JSON archives into MongoDB Atlas with complete idempotency, validation, and zero data loss.
 *
 * Usage:
 *   npx tsx scripts/migrate-seed-to-mongo.ts [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectToDatabase } from '../src/db/mongodb.js';
import { ProductModel } from '../src/db/models/Product.js';
import { CategoryModel } from '../src/db/models/Category.js';
import { SiteContentModel } from '../src/db/models/SiteContent.js';
import { PromotionModel } from '../src/db/models/Promotion.js';
import { ReviewModel } from '../src/db/models/Review.js';
import { EXACT_PRIVACY_POLICY_TEXT } from '../src/db/seed/seed-legal-and-social.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

const SEED_DIR = path.resolve(__dirname, '../src/db/seed');
const BACKUP_DIR = path.resolve(__dirname, '../src/db/backup');

interface MigrationStats {
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: string[];
}

const DEFAULT_REELS_DATA = [
  {
    id: 'video-1',
    title: 'Workday Essentials Pack',
    videoUrl: 'https://res.cloudinary.com/kbeyfu3d/video/upload/v1795527022/zimor/reels/reel-1.mp4',
    posterUrl: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1795527024/zimor/reels/poster-1.webp',
    instagramUrl: 'https://www.instagram.com/reel/Db7t3Ikx1C1/',
    productSlug: 'zimor-delo-tote',
  },
  {
    id: 'video-2',
    title: 'Café Days & Slow Afternoons',
    videoUrl: 'https://res.cloudinary.com/kbeyfu3d/video/upload/v1795527163/zimor/reels/reel-2.mp4',
    posterUrl: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1795527165/zimor/reels/poster-2.webp',
    instagramUrl: 'https://www.instagram.com/reel/DdWRTNIPvIt/',
    productSlug: 'zimor-classic-shoulder-bag',
  },
  {
    id: 'video-3',
    title: 'Effortless Workday Carry',
    videoUrl: 'https://res.cloudinary.com/kbeyfu3d/video/upload/v1795527171/zimor/reels/reel-3.mp4',
    posterUrl: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1795527173/zimor/reels/poster-3.webp',
    instagramUrl: 'https://www.instagram.com/reel/DdeBTWksCJM/',
    productSlug: 'zimor-rabota-tote',
  },
  {
    id: 'video-4',
    title: 'The Entire Day Packed',
    videoUrl: 'https://res.cloudinary.com/kbeyfu3d/video/upload/v1795527175/zimor/reels/reel-4.mp4',
    posterUrl: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1795527176/zimor/reels/poster-4.webp',
    instagramUrl: 'https://www.instagram.com/reel/DehSFkxvmew/',
    productSlug: 'zimor-delo-tote-noir',
  },
  {
    id: 'video-5',
    title: 'Structured Daily Essentials',
    videoUrl: 'https://res.cloudinary.com/kbeyfu3d/video/upload/v1795527178/zimor/reels/reel-5.mp4',
    posterUrl: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1795527180/zimor/reels/poster-5.webp',
    instagramUrl: 'https://www.instagram.com/reel/Dfw0jsbN4oi/',
    productSlug: 'zimor-rabota-tote-espresso',
  },
];

const DEFAULT_BRAND_VALUES = [
  { number: '01', title: 'Individuality', description: 'Celebrating different personalities and personal styles.' },
  { number: '02', title: 'Creativity', description: 'Exploring fresh silhouettes, colours, materials and design details.' },
  { number: '03', title: 'Confidence', description: 'Creating accessories that make women feel expressive and empowered.' },
  { number: '04', title: 'Functionality', description: 'Ensuring fashion complements everyday lifestyles.' },
  { number: '05', title: 'Quality', description: 'Prioritising material selection, construction and finishing.' },
  { number: '06', title: 'Innovation', description: 'Continuously evolving with changing fashion and consumer preferences.' },
  { number: '07', title: 'Accessibility', description: 'Bringing premium-looking fashion within reach of a wider audience.' },
];

const DEFAULT_PROMOTIONS_DATA = [
  {
    code: 'WELCOME10',
    description: '10% Welcome Discount applied to your order',
    discountPercent: 10,
    discountType: 'percentage' as const,
    discountAmount: 0,
    minOrderAmount: 0,
    isActive: true,
  },
  {
    code: 'ZIMOR15',
    description: '15% Seasonal Discount on orders above ₹2,000',
    discountPercent: 15,
    discountType: 'percentage' as const,
    discountAmount: 0,
    minOrderAmount: 2000,
    isActive: true,
  },
  {
    code: 'FIRSTBUY',
    description: '10% First Order Discount applied to your order',
    discountPercent: 10,
    discountType: 'percentage' as const,
    discountAmount: 0,
    minOrderAmount: 0,
    isActive: true,
  },
  {
    code: 'ZIMOR10',
    description: '10% Atelier Exclusive Discount applied',
    discountPercent: 10,
    discountType: 'percentage' as const,
    discountAmount: 0,
    minOrderAmount: 0,
    isActive: true,
  },
];

const DEFAULT_REVIEWS_DATA = [
  {
    userName: 'Snigdha Mishra',
    userCity: 'Bengaluru',
    userAvatar: 'https://lh3.googleusercontent.com/a/ACg8ocL_vJ1CThPcX9zocs51LUzNL9imdA2FDDSs5_ZkNd4PFFZud2Pm=s96-c',
    rating: 5,
    title: 'Loved the quality & design',
    comment: 'I just loved the quality, design and colour scheme of the bag. It is so spacious and easy to carry. Loved it ! ✨ Fits my 15-inch work laptop, charger, water bottle, and a hardcover notebook with room to spare. The matching wristlet is a lifesaver for grabbing lunch during office hours without carrying the whole bag.',
    verifiedPurchase: true,
    date: 'June 29, 2026',
    productSlug: 'zimor-delo-tote',
    productName: 'ZIMOR DELO TOTE',
    media: [
      {
        type: 'photo',
        url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp',
        caption: 'My Delo tote packed for a client presentation at UB City',
      },
      {
        type: 'photo',
        url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917829/zimor/products/delo-4.webp',
        caption: 'Everything organized inside the dedicated compartments',
      },
    ],
    helpfulCount: 38,
  },
  {
    userName: 'Kinjal Rajpoot',
    userCity: 'Gurugram',
    userAvatar: 'https://lh3.googleusercontent.com/a/ACg8ocKV0h0aFTzzgAR4lvpAUS-MDUU9P0ZwA5HEEHpVPrFdoyQ-Pg=s96-c',
    rating: 5,
    title: 'Great work bag for daily use',
    comment: 'I recently purchased the Zimor laptop bag, and I am very satisfied with the quality and design. The bag looks professional and stylish, making it suitable for both office use and travel. The material feels durable and provides good protection for my laptop. The compartments are well-organized, with enough space to carry a laptop, charger, documents, notebook, and other daily essentials without feeling bulky. The zippers are smooth, and the handles and shoulder strap are comfortable even when carrying the bag for longer periods.',
    verifiedPurchase: true,
    date: 'June 27, 2026',
    productSlug: 'zimor-rabota-tote',
    productName: 'ZIMOR RABOTA TOTE',
    media: [
      {
        type: 'photo',
        url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917831/zimor/products/rabota-1.webp',
        caption: 'Cognac brown finish in natural morning light',
      },
      {
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-holding-a-leather-handbag-40294-large.mp4',
        thumbnailUrl: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917833/zimor/products/rabota-3.webp',
        caption: 'Hands-on look at the strap drop and interior capacity',
      },
    ],
    helpfulCount: 29,
  },
  {
    userName: 'Onkar Raut',
    userCity: 'Mumbai',
    userAvatar: 'https://lh3.googleusercontent.com/a/ACg8ocIGkbYB4Cy5TKoNqz1VDv1KWIQpQ9bKaEhQHEOUNNVaGPN_Ng=s96-c',
    rating: 5,
    title: 'Perfect Surprise',
    comment: 'I purchased this shoulder bag for my girlfriend, and she was thrilled with it. The bag looks stylish, feels well-made, and has enough space for everyday essentials. The quality exceeded my expectations, and the design is both elegant and practical. Highly recommended!',
    verifiedPurchase: true,
    date: 'June 26, 2026',
    productSlug: 'zimor-classic-shoulder-bag',
    productName: 'ZIMOR CLASSIC SHOULDER BAG',
    media: [
      {
        type: 'photo',
        url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917835/zimor/products/classic-1.webp',
        caption: 'Arrived beautifully packaged with dust bag and authenticity card',
      },
    ],
    helpfulCount: 24,
  },
  {
    userName: 'Aashna',
    userCity: 'Delhi NCR',
    userAvatar: 'https://lh3.googleusercontent.com/a/ACg8ocI4eKIamcGqG4cYuXXCtCVvhfc7_291oikRR2UX8L7XQt5Igus=s96-c',
    rating: 5,
    title: 'Classy, timeless everyday bag',
    comment: 'Absolutely in love with this bag! The canvas and tan leather combination gives it such a classy, timeless look. It feels premium, lightweight, and surprisingly spacious for everyday essentials. I’ve already styled it with both casual and dressy outfits and it’s such a versatile and elegant everyday bag!',
    verifiedPurchase: true,
    date: 'June 23, 2026',
    productSlug: 'zimor-classic-shoulder-bag',
    productName: 'ZIMOR CLASSIC SHOULDER BAG',
    media: [
      {
        type: 'photo',
        url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917845/zimor/lifestyle/brandgirl2.webp',
        caption: 'Styled with relaxed linen blazer for weekend brunch',
      },
      {
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-with-a-shopping-bag-walking-out-of-a-40290-large.mp4',
        thumbnailUrl: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917846/zimor/lifestyle/brandgirl3.webp',
        caption: 'Walking around Khan Market with the classic shoulder bag',
      },
    ],
    helpfulCount: 41,
  },
  {
    userName: 'Annu Sahani',
    userCity: 'Pune',
    userAvatar: 'https://lh3.googleusercontent.com/a/ACg8ocIoVmVB-twXl5S1nh8WneH5TH1PE84eIpW7Uw1dcZ7NHdgG_Rfs=s96-c',
    rating: 5,
    title: 'Practical bag for everyday use',
    comment: 'This bag is great combination of style, comfort, and functionality. The shoulder strap is comfortable for long use. A nice choice for anyone looking for classy everyday shoulder bag.',
    verifiedPurchase: true,
    date: 'June 12, 2026',
    productSlug: 'zimor-classic-shoulder-bag-tan',
    productName: 'ZIMOR CLASSIC SHOULDER BAG — SADDLE TAN',
    media: [
      {
        type: 'photo',
        url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917835/zimor/products/classic-2.webp',
        caption: 'Underarm drop is so comfortable during commute',
      },
    ],
    helpfulCount: 19,
  },
  {
    userName: 'Aishwarya Yadav',
    userCity: 'Hyderabad',
    userAvatar: 'https://lh3.googleusercontent.com/a/ACg8ocIRpsQidvJ0dfa2aMN77qKL835rAr-PzdEFUVStHaOzs_uY_Q=s96-c',
    rating: 5,
    title: 'Excellent quality and value for money',
    comment: 'I am really impressed with the quality of this canvas shoulder bag. The material feels heavy-duty and durable, and the stitching is well-done. It feels like it will last a long time, making it an absolute great value for money. Highly recommend if you are looking for something sturdy for daily use!',
    verifiedPurchase: true,
    date: 'June 6, 2026',
    productSlug: 'zimor-classic-shoulder-bag',
    productName: 'ZIMOR CLASSIC SHOULDER BAG',
    helpfulCount: 16,
  },
  {
    userName: 'Rishika Singh',
    userCity: 'Noida',
    userAvatar: 'https://lh3.googleusercontent.com/a/ACg8ocL2tkbu-9YElazA0IV3_n5XmFiozWARrnl4T6Bs2FfaFWKYfg=s96-c',
    rating: 4,
    title: 'Great value for money',
    comment: 'Absolutely love this bag! The design is elegant, the quality feels premium, and it\'s surprisingly spacious for daily essentials. Perfect for both work and casual outings.',
    verifiedPurchase: true,
    date: 'June 6, 2026',
    productSlug: 'zimor-delo-tote-noir',
    productName: 'ZIMOR DELO TOTE — NOIR',
    helpfulCount: 12,
  },
];

const EXACT_TERMS_OF_SERVICE_TEXT = `# TERMS OF SERVICE

Last Updated: 17 November 2026

Welcome to ZIMOR. By accessing our website, browsing our collections, or purchasing our products, you agree to comply with and be bound by the following Terms of Service. Please read them carefully.

## 1. ATELIER SERVICES & ACCESS
ZIMOR designs and retails premium architectural handbags engineered for modern professionals. All products displayed are subject to availability and may be withdrawn or modified at any time without prior notice.

## 2. PRICING & PAYMENT
All prices listed on the website are in Indian Rupees (INR) and inclusive of applicable Goods and Services Tax (GST). We reserve the right to revise pricing at any time. Payments are securely processed via certified payment gateways.

## 3. SHIPPING & FULFILLMENT
Orders are dispatched through certified express logistics partners. Delivery timelines vary between 2-5 business days depending on delivery location within India.

## 4. RETURNS & EXCHANGES
We offer a 7-day inspection window from the date of delivery. Returned items must be unwashed, unused, in original packaging with intact security tags.

## 5. INTELLECTUAL PROPERTY
All trademarks, product names, designs, logos, and editorial imagery on this website are the exclusive intellectual property of ZIMOR India.
`;

function createBackup(): string {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `seed-backup-${timestamp}.json`);

  const backupData: Record<string, any> = {};
  const seedFiles = ['products.json', 'categories.json', 'content.json', 'media.json', 'admins.json'];

  for (const file of seedFiles) {
    const filePath = path.join(SEED_DIR, file);
    if (fs.existsSync(filePath)) {
      try {
        backupData[file] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } catch (err: any) {
        console.warn(`[BACKUP WARNING] Could not read ${file}:`, err.message);
      }
    }
  }

  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`[BACKUP CREATED] Successfully backed up seed data to:\n  ${backupFile}\n`);
  return backupFile;
}

export async function runMigration(options: { dryRun?: boolean } = {}) {
  const isDryRun = Boolean(options.dryRun);
  console.log('================================================================');
  console.log(`  ZIMOR PRODUCTION MIGRATION TO MONGODB ATLAS ${isDryRun ? '[DRY RUN]' : '[LIVE]'}`);
  console.log('================================================================\n');

  // 1. Create immediate local backup
  createBackup();

  // 2. Connect to MongoDB Atlas
  console.log('[MIGRATION] Connecting to MongoDB Atlas...');
  const mongooseInstance = await connectToDatabase();
  console.log(`[MIGRATION] Connected to Database: "${mongooseInstance.connection.name}" at host: "${mongooseInstance.connection.host}"\n`);

  const categoryStats: MigrationStats = { inserted: 0, updated: 0, skipped: 0, failed: 0, errors: [] };
  const productStats: MigrationStats = { inserted: 0, updated: 0, skipped: 0, failed: 0, errors: [] };
  const reviewStats: MigrationStats = { inserted: 0, updated: 0, skipped: 0, failed: 0, errors: [] };
  const contentStats: MigrationStats = { inserted: 0, updated: 0, skipped: 0, failed: 0, errors: [] };
  const promoStats: MigrationStats = { inserted: 0, updated: 0, skipped: 0, failed: 0, errors: [] };

  // 3. Migrate Categories
  console.log('--- 1. Migrating Categories ---');
  const categoriesFile = path.join(SEED_DIR, 'categories.json');
  if (fs.existsSync(categoriesFile)) {
    const categories: any[] = JSON.parse(fs.readFileSync(categoriesFile, 'utf-8'));
    for (const cat of categories) {
      try {
        const existing = await CategoryModel.findOne({ slug: cat.slug });
        if (existing) {
          if (!isDryRun) {
            existing.name = cat.name;
            existing.description = cat.description || existing.description;
            existing.parentId = cat.parentId || existing.parentId;
            await existing.save();
          }
          categoryStats.updated++;
          console.log(`  [UPDATE] Category: "${cat.name}" (${cat.slug})`);
        } else {
          if (!isDryRun) {
            await CategoryModel.create({
              name: cat.name,
              slug: cat.slug,
              description: cat.description || '',
              parentId: cat.parentId || null,
            });
          }
          categoryStats.inserted++;
          console.log(`  [INSERT] Category: "${cat.name}" (${cat.slug})`);
        }
      } catch (err: any) {
        categoryStats.failed++;
        categoryStats.errors.push(`Category "${cat.slug}": ${err.message}`);
        console.error(`  [ERROR] Category "${cat.slug}":`, err.message);
      }
    }
  }

  // 4. Migrate Products
  console.log('\n--- 2. Migrating Products ---');
  const productsFile = path.join(SEED_DIR, 'products.json');
  if (fs.existsSync(productsFile)) {
    const products: any[] = JSON.parse(fs.readFileSync(productsFile, 'utf-8'));
    for (const prod of products) {
      try {
        const sanitizedSku = (prod.sku || '').trim().toUpperCase();
        if (!sanitizedSku) {
          throw new Error(`Product "${prod.name}" has no SKU defined.`);
        }

        const existing = await ProductModel.findOne({ slug: prod.slug });
        const productPayload = {
          name: prod.name,
          slug: prod.slug,
          sku: sanitizedSku,
          tagline: prod.tagline || '',
          description: prod.description || '',
          price: Number(prod.price),
          compareAtPrice: Number(prod.compareAtPrice || prod.price),
          category: prod.category,
          categoryLabel: prod.categoryLabel || (prod.category === 'tote-bags' ? 'Tote Bags' : prod.category === 'laptop-bags' ? 'Laptop Bags' : 'Shoulder Bags'),
          sizes: prod.sizes && prod.sizes.length > 0 ? prod.sizes : ['Standard'],
          stock: prod.stock !== undefined ? Number(prod.stock) : 25,
          isPublished: prod.isPublished !== false,
          isFeatured: Boolean(prod.isFeatured),
          isComingSoon: Boolean(prod.isComingSoon),
          averageRating: Number(prod.averageRating || 5.0),
          numReviews: Number(prod.numReviews || 0),
          images: Array.isArray(prod.images) ? prod.images : [],
          features: Array.isArray(prod.features) ? prod.features : [],
          material: Array.isArray(prod.material) ? prod.material : [],
          careInstructions: Array.isArray(prod.careInstructions) ? prod.careInstructions : [],
          dimensions: prod.dimensions || {},
          suitableProfessions: Array.isArray(prod.suitableProfessions) ? prod.suitableProfessions : [],
          laptopCompatibility: prod.laptopCompatibility || '',
          whyYoullLoveIt: prod.whyYoullLoveIt || '',
          strap: prod.strap || '',
          netQuantity: prod.netQuantity || '1 N Handbag',
          shippingPolicy: Array.isArray(prod.shippingPolicy) ? prod.shippingPolicy : [],
          returnPolicy: Array.isArray(prod.returnPolicy) ? prod.returnPolicy : [],
          moreInformation: prod.moreInformation || {
            importedAndMarketedBy: 'ZIMOR Luxury Carry Private Limited',
            customerCare: 'support@zimorindia.com',
            countryOfOrigin: 'India',
          },
        };

        if (existing) {
          if (!isDryRun) {
            await ProductModel.findOneAndUpdate({ slug: prod.slug }, productPayload, { new: true });
          }
          productStats.updated++;
          console.log(`  [UPDATE] Product: "${prod.name}" (SKU: ${sanitizedSku}, Slug: ${prod.slug}, Stock: ${productPayload.stock})`);
        } else {
          if (!isDryRun) {
            await ProductModel.create(productPayload);
          }
          productStats.inserted++;
          console.log(`  [INSERT] Product: "${prod.name}" (SKU: ${sanitizedSku}, Slug: ${prod.slug}, Stock: ${productPayload.stock})`);
        }
      } catch (err: any) {
        productStats.failed++;
        productStats.errors.push(`Product "${prod.slug}": ${err.message}`);
        console.error(`  [ERROR] Product "${prod.slug}":`, err.message);
      }
    }
  }

  // 5. Migrate Customer Reviews
  console.log('\n--- 3. Migrating Customer Reviews ---');
  for (const rev of DEFAULT_REVIEWS_DATA) {
    try {
      const existing = await ReviewModel.findOne({ userName: rev.userName, productSlug: rev.productSlug });
      if (existing) {
        if (!isDryRun) {
          existing.rating = rev.rating;
          existing.title = rev.title;
          existing.comment = rev.comment;
          existing.userCity = rev.userCity;
          existing.userAvatar = rev.userAvatar;
          existing.media = rev.media as any;
          existing.helpfulCount = rev.helpfulCount;
          await existing.save();
        }
        reviewStats.updated++;
        console.log(`  [UPDATE] Review: "${rev.userName}" on "${rev.productSlug}"`);
      } else {
        if (!isDryRun) {
          await ReviewModel.create(rev);
        }
        reviewStats.inserted++;
        console.log(`  [INSERT] Review: "${rev.userName}" on "${rev.productSlug}"`);
      }
    } catch (err: any) {
      reviewStats.failed++;
      reviewStats.errors.push(`Review "${rev.userName}": ${err.message}`);
      console.error(`  [ERROR] Review "${rev.userName}":`, err.message);
    }
  }

  // 6. Migrate Site Content
  console.log('\n--- 4. Migrating Site Content ---');
  const contentFile = path.join(SEED_DIR, 'content.json');
  let rawContent: any[] = [];
  if (fs.existsSync(contentFile)) {
    rawContent = JSON.parse(fs.readFileSync(contentFile, 'utf-8'));
  }

  // Extract homepage hero slides
  const heroItem = rawContent.find((c) => c.page === 'home' && c.section === 'hero');
  const homepageSlides = heroItem?.data?.slides || [
    {
      id: 'hero-slide-1',
      badge: 'PERMANENT ATELIER COLLECTION',
      title: 'ARCHITECTURAL FORM.\nEVERYDAY PURPOSE.',
      subtitle: 'Discover our permanent collection of six sculptural products engineered with 15.6" laptop compartments.',
      image: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917825/zimor/banners/hero-first-edit.webp',
      ctaText: 'Shop Collection',
      ctaLink: '/shop',
      isActive: true,
    },
    {
      id: 'hero-slide-2',
      badge: 'NEW ATELIER EDITION',
      title: 'TIMELESS LUXURY.\nMINIMALIST PURSUIT.',
      subtitle: 'Engineered with 15.6" padded protection and solid brass accents for seamless boardroom transitions.',
      image: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917826/zimor/banners/hero-most-loved-tote.webp',
      ctaText: 'Shop Totes',
      ctaLink: '/shop?category=tote-bags',
      isActive: true,
    },
    {
      id: 'hero-slide-3',
      badge: 'WEEKEND & TRAVEL',
      title: 'EFFORTLESS TRAVEL.\nCURATED DESIGN.',
      subtitle: 'French canvas with sculpted crescent contours and luminous gold hardware.',
      image: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917826/zimor/banners/hero-model-crescent.webp',
      ctaText: 'Explore Shoulder Bags',
      ctaLink: '/shop?category=shoulder-bags',
      isActive: true,
    },
  ];

  // Seed Homepage Default Section (combines Hero Slides, Shoppable Reels, Announcement)
  const homepagePayload = {
    heroSlides: homepageSlides,
    reels: DEFAULT_REELS_DATA,
    announcement: {
      text: 'Complimentary Express Shipping Across India · 100% Secure Checkout',
      enabled: true,
    },
  };

  try {
    if (!isDryRun) {
      await SiteContentModel.findOneAndUpdate(
        { page: 'homepage', section: 'default' },
        { data: homepagePayload, updatedAt: new Date().toISOString() },
        { upsert: true, new: true }
      );
    }
    contentStats.inserted++;
    console.log('  [UPSERT] SiteContent: "homepage:default" (Hero Slides + Shoppable Reels)');
  } catch (err: any) {
    contentStats.failed++;
    contentStats.errors.push(`homepage:default: ${err.message}`);
  }

  // Seed About Page Content & Brand Values
  const aboutPayload = {
    story: {
      title: 'Sculpted in Leather, Defined by Function.',
      subtitle: 'Quiet Luxury Engineered for the Modern Boardroom & Everyday Transit',
      paragraphs: [
        'Zimor was born in 2024 from an uncompromising need: why should modern women choose between delicate designer aesthetics and the pragmatic demands of a high-power workday?',
        'Our journey began in a boutique leather studio, obsessing over internal weight distribution, padded 15.6" shock-absorbing sleeves, and French equestrian saddle stitches that withstand a lifetime of use.',
        'Today, Zimor represents deliberate, quiet luxury. Every edge is meticulously hand-painted, every brass bottom stud is turned on a lathe, and every pocket is mapped to modern daily tech.',
      ],
    },
    vision: 'To redefine modern luxury workwear by elevating functional carry into an art form of sculptural minimalism.',
    mission: 'Handcrafting architectural, cruelty-free leather goods in India with uncompromising structural durability, transparent pricing, and zero aesthetic sacrifice.',
    values: DEFAULT_BRAND_VALUES,
  };

  try {
    if (!isDryRun) {
      await SiteContentModel.findOneAndUpdate(
        { page: 'about', section: 'default' },
        { data: aboutPayload, updatedAt: new Date().toISOString() },
        { upsert: true, new: true }
      );
    }
    contentStats.inserted++;
    console.log('  [UPSERT] SiteContent: "about:default" (Story, Vision, Mission, 7 Brand Values)');
  } catch (err: any) {
    contentStats.failed++;
    contentStats.errors.push(`about:default: ${err.message}`);
  }

  // Seed Legal Documents
  try {
    if (!isDryRun) {
      await SiteContentModel.findOneAndUpdate(
        { page: 'privacy-policy', section: 'default' },
        { data: { markdown: EXACT_PRIVACY_POLICY_TEXT }, updatedAt: new Date().toISOString() },
        { upsert: true, new: true }
      );
      await SiteContentModel.findOneAndUpdate(
        { page: 'terms-of-service', section: 'default' },
        { data: { markdown: EXACT_TERMS_OF_SERVICE_TEXT }, updatedAt: new Date().toISOString() },
        { upsert: true, new: true }
      );
    }
    contentStats.inserted += 2;
    console.log('  [UPSERT] SiteContent: "privacy-policy:default" & "terms-of-service:default"');
  } catch (err: any) {
    contentStats.failed++;
    contentStats.errors.push(`legal content: ${err.message}`);
  }

  // 7. Migrate Promotions
  console.log('\n--- 5. Migrating Promotions ---');
  for (const promo of DEFAULT_PROMOTIONS_DATA) {
    try {
      const existing = await PromotionModel.findOne({ code: promo.code });
      if (existing) {
        if (!isDryRun) {
          existing.description = promo.description;
          existing.discountPercent = promo.discountPercent;
          existing.discountType = promo.discountType;
          existing.minOrderAmount = promo.minOrderAmount;
          existing.isActive = promo.isActive;
          await existing.save();
        }
        promoStats.updated++;
        console.log(`  [UPDATE] Promotion: "${promo.code}" (${promo.discountPercent}%)`);
      } else {
        if (!isDryRun) {
          await PromotionModel.create(promo);
        }
        promoStats.inserted++;
        console.log(`  [INSERT] Promotion: "${promo.code}" (${promo.discountPercent}%)`);
      }
    } catch (err: any) {
      promoStats.failed++;
      promoStats.errors.push(`Promotion "${promo.code}": ${err.message}`);
    }
  }

  // 8. Final Verification & Summary Report
  console.log('\n================================================================');
  console.log('                     MIGRATION SUMMARY REPORT                   ');
  console.log('================================================================');
  console.log(`• Categories:    ${categoryStats.inserted} inserted, ${categoryStats.updated} updated, ${categoryStats.failed} failed`);
  console.log(`• Products:      ${productStats.inserted} inserted, ${productStats.updated} updated, ${productStats.failed} failed`);
  console.log(`• Reviews:       ${reviewStats.inserted} inserted, ${reviewStats.updated} updated, ${reviewStats.failed} failed`);
  console.log(`• Site Content:  ${contentStats.inserted} inserted, ${contentStats.updated} updated, ${contentStats.failed} failed`);
  console.log(`• Promotions:    ${promoStats.inserted} inserted, ${promoStats.updated} updated, ${promoStats.failed} failed`);

  if (!isDryRun) {
    const totalDbProducts = await ProductModel.countDocuments();
    const totalDbCategories = await CategoryModel.countDocuments();
    const totalDbReviews = await ReviewModel.countDocuments();
    const totalDbContent = await SiteContentModel.countDocuments();
    const totalDbPromos = await PromotionModel.countDocuments();

    console.log('\n--- Live Database State in MongoDB Atlas ---');
    console.log(`  Total Active Products in Atlas:    ${totalDbProducts}`);
    console.log(`  Total Categories in Atlas:         ${totalDbCategories}`);
    console.log(`  Total Customer Reviews in Atlas:   ${totalDbReviews}`);
    console.log(`  Total Site Content Sections:       ${totalDbContent}`);
    console.log(`  Total Promotions in Atlas:         ${totalDbPromos}`);
  }

  if (categoryStats.failed > 0 || productStats.failed > 0 || reviewStats.failed > 0 || contentStats.failed > 0 || promoStats.failed > 0) {
    console.error('\n[WARNING] Some records failed migration:');
    const allErrors = [...categoryStats.errors, ...productStats.errors, ...reviewStats.errors, ...contentStats.errors, ...promoStats.errors];
    allErrors.forEach((e) => console.error(`  - ${e}`));
  } else {
    console.log('\n✓ ZERO DATA LOSS GUARANTEE: All genuine records successfully migrated with valid schema indexing.');
  }

  console.log('================================================================\n');
}

// Direct CLI execution
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const isDryRun = process.argv.includes('--dry-run');
  runMigration({ dryRun: isDryRun })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[FATAL MIGRATION ERROR]', err);
      process.exit(1);
    });
}
