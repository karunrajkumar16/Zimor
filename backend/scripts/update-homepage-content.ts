// backend/scripts/update-homepage-content.ts
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectToDatabase } from '../src/db/mongodb.js';
import { SiteContentModel } from '../src/db/models/SiteContent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const HOMEPAGE_LIFESTYLE_DATA = {
  isPublished: true,
  eyebrow: 'Find Your Everyday Match',
  heading: 'Shop by Lifestyle',
  subheading: 'Select your lifestyle to explore the silhouette engineered for your everyday rhythm, work focus, and travel escapes.',
  exploreLink: '/shop',
  exploreText: 'Explore All Silhouettes',
  cards: [
    {
      id: 'everyday',
      name: 'EVERYDAY',
      subtitle: 'For the everyday.',
      silhouette: 'The Classic Shoulder Bag',
      href: '/shop?section=everyday#everyday',
      editorialImage: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917846/zimor/lifestyle/brandgirl3.webp',
      topTitle: '',
      eyebrow: '',
      order: 1,
      isPublished: true,
    },
    {
      id: 'work',
      name: 'WORK',
      subtitle: 'For what lies ahead.',
      silhouette: 'The Rabota & Delo Totes',
      href: '/shop?section=work#work',
      editorialImage: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917850/zimor/about/image.webp',
      topTitle: '',
      eyebrow: '',
      order: 2,
      isPublished: true,
    },
    {
      id: 'travel',
      name: 'TRAVEL',
      subtitle: 'For places beyond.',
      silhouette: 'The Rabota & Delo Totes',
      href: '/shop?section=travel#travel',
      editorialImage: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917845/zimor/lifestyle/brandgirl2.webp',
      topTitle: '',
      eyebrow: '',
      order: 3,
      isPublished: true,
    },
  ],
};

const HOMEPAGE_CRAFTED_DATA = {
  isPublished: true,
  heading: 'Crafted in India',
  description:
    'Rooted in centuries of master leatherworking traditions, every Zimor silhouette is meticulously crafted in the renowned artisan clusters of India. Combining generational hand-stitching with refined architectural precision, our craftsmen transform premium materials into enduring modern heirlooms.',
  videoUrl:
    'https://res.cloudinary.com/kbeyfu3d/video/upload/v1794917863/zimor/videos/cafune-craftsmanship.mp4',
  posterUrl:
    'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917849/zimor/about/craftsmanship-atelier.webp',
  supportingImage:
    'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917847/zimor/about/artisan-heritage-landscape.webp',
  supportingAlt: 'Crafted in India artisan heritage and leatherwork atelier',
  ctaText: 'Discover More',
  ctaLink: '/about',
};

const HOMEPAGE_SPOTLIGHT_DATA = {
  isPublished: true,
  tag: 'About Zimor',
  heading: 'In the Spotlight',
  leadText:
    'A curated visual campaign capturing the convergence of Indian craftsmanship, architectural utility, and contemporary executive presence.',
  supportingText:
    'Sculpted for ambitious professional women across Mumbai, Delhi, and Bengaluru—built to carry modern tech without compromising architectural form.',
  badges: ['Cruelty-Free Craft', '15.6" Tech Protection', 'Crafted in India'],
  ctaText: 'The Zimor Story',
  ctaLink: '/about',
  frames: [
    {
      id: 'frame-craftsmanship',
      title: 'Rooted in\nCraftsmanship',
      linkText: 'Discover More',
      linkHref: '/about',
      image:
        'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917849/zimor/about/craftsmanship-atelier.webp',
      alt: 'Artisan hand-stitching luxury leather with needle and waxed thread',
      gridClasses:
        'col-span-1 md:col-start-6 md:col-end-10 md:row-start-1 md:row-end-2 min-h-[260px] md:min-h-0',
      objectPosition: 'object-center',
      order: 1,
      isPublished: true,
    },
    {
      id: 'frame-details',
      title: 'Designed for\nEveryday',
      linkText: 'Shop Now',
      linkHref: '/product/zimor-rabota-tote',
      image:
        'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917833/zimor/products/rabota-4.webp',
      alt: 'Macro texture of Zimor Rabota luxury bag showing zipper and grain',
      gridClasses:
        'col-span-1 md:col-start-10 md:col-end-13 md:row-start-1 md:row-end-2 min-h-[260px] md:min-h-0',
      objectPosition: 'object-top',
      order: 2,
      isPublished: true,
    },
    {
      id: 'frame-quality',
      title: 'Details That\nMatter',
      linkText: 'Explore Details',
      linkHref: '/product/zimor-delo-tote',
      image:
        'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917845/zimor/lifestyle/luxury-bag-tan.webp',
      alt: 'Luxury cruelty-free leather handbag detailing with refined brass hardware',
      gridClasses:
        'col-span-2 md:col-start-1 md:col-end-6 md:row-start-2 md:row-end-3 min-h-[280px] md:min-h-0',
      objectPosition: 'object-center',
      order: 3,
      isPublished: true,
    },
    {
      id: 'frame-made-in-india',
      title: 'Proudly Made\nin India',
      linkText: 'Our Heritage',
      linkHref: '/about',
      image:
        'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917847/zimor/about/artisan-heritage-landscape.webp',
      alt: 'Master artisan in Indian leathercraft atelier surrounded by leather rolls and hand tools',
      gridClasses:
        'col-span-2 md:col-start-6 md:col-end-13 md:row-start-2 md:row-end-3 min-h-[280px] md:min-h-0',
      objectPosition: 'object-center',
      order: 4,
      isPublished: true,
    },
  ],
};

async function main() {
  console.log('[Content Update] Connecting to MongoDB Atlas...');
  await connectToDatabase();

  const doc = await SiteContentModel.findOne({ page: 'homepage', section: 'default' });
  if (!doc) {
    console.error('Homepage content document not found in MongoDB!');
    process.exit(1);
  }

  const existingData = (doc.data as any) || {};

  // Preserve existing heroSlides, reels, announcement, etc., while adding/updating lifestyle, craftedInIndia, spotlight
  const updatedData = {
    ...existingData,
    lifestyle: HOMEPAGE_LIFESTYLE_DATA,
    craftedInIndia: HOMEPAGE_CRAFTED_DATA,
    spotlight: HOMEPAGE_SPOTLIGHT_DATA,
  };

  doc.data = updatedData;
  doc.markModified('data');
  doc.updatedAt = new Date().toISOString();
  await doc.save();

  console.log('[Content Update] Successfully updated homepage:default in MongoDB Atlas:');
  console.log(' - lifestyle cards:', updatedData.lifestyle.cards.length);
  console.log(' - craftedInIndia heading:', updatedData.craftedInIndia.heading);
  console.log(' - spotlight frames:', updatedData.spotlight.frames.length);

  process.exit(0);
}

main().catch((err) => {
  console.error('[Content Update] Fatal error:', err);
  process.exit(1);
});
