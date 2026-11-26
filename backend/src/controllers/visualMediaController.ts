import path from 'path';
import { Request, Response } from 'express';
import { getDatabaseProvider } from '../db/index.js';
import { getMediaProvider } from '../media/index.js';
import { VisualMediaItem, VisualMediaMapping } from '../types/index.js';
import { DEFAULT_ABOUT_MEDIA } from './aboutMediaController.js';

// ============================================================================
// VERIFIED STOREFRONT FACTORY DEFAULTS (ZERO LAYOUT SHIFT & RELIABLE CDN ASSETS)
// ============================================================================

export const DEFAULT_HOMEPAGE_VISUAL_MEDIA: Record<string, VisualMediaItem> = {
  // 1. Homepage → Shop by Lifestyle
  lifestyle_everyday: {
    id: 'lifestyle_everyday',
    scope: 'homepage',
    sectionGroup: 'Shop by Lifestyle',
    title: 'Everyday Lifestyle',
    label: 'The Classic Shoulder Bag — Editorial Visual',
    description: 'Parallax editorial canvas displayed on the Everyday lifestyle card.',
    recommendedAspect: '3:4 or 4:5 Portrait',
    recommendedResolution: '1200 x 1600 px (min 800 x 1060)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917846/zimor/lifestyle/brandgirl3.webp',
    publicId: 'zimor/lifestyle/brandgirl3',
    alt: 'EVERYDAY — For the everyday. The Classic Shoulder Bag',
    cloudinaryFolder: 'zimor/homepage/lifestyle',
    mediaType: 'image',
  },
  lifestyle_work: {
    id: 'lifestyle_work',
    scope: 'homepage',
    sectionGroup: 'Shop by Lifestyle',
    title: 'Work Lifestyle',
    label: 'The Rabota & Delo Totes — Editorial Visual',
    description: 'Parallax editorial canvas displayed on the Work lifestyle card.',
    recommendedAspect: '3:4 or 4:5 Portrait',
    recommendedResolution: '1200 x 1600 px (min 800 x 1060)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917850/zimor/about/image.webp',
    publicId: 'zimor/about/image',
    alt: 'WORK — For what lies ahead. The Rabota & Delo Totes',
    cloudinaryFolder: 'zimor/homepage/lifestyle',
    mediaType: 'image',
  },
  lifestyle_travel: {
    id: 'lifestyle_travel',
    scope: 'homepage',
    sectionGroup: 'Shop by Lifestyle',
    title: 'Travel Lifestyle',
    label: 'The Travel Silhouettes — Editorial Visual',
    description: 'Parallax editorial canvas displayed on the Travel lifestyle card.',
    recommendedAspect: '3:4 or 4:5 Portrait',
    recommendedResolution: '1200 x 1600 px (min 800 x 1060)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917845/zimor/lifestyle/brandgirl2.webp',
    publicId: 'zimor/lifestyle/brandgirl2',
    alt: 'TRAVEL — For places beyond. The Rabota & Delo Totes',
    cloudinaryFolder: 'zimor/homepage/lifestyle',
    mediaType: 'image',
  },

  // 2. Homepage → Crafted in India
  craft_poster: {
    id: 'craft_poster',
    scope: 'homepage',
    sectionGroup: 'Crafted in India',
    title: 'Manufacturing Video Poster',
    label: 'Craftsmanship Video Cover / Fallback Poster',
    description: 'High-resolution poster image loaded before the manufacturing video plays.',
    recommendedAspect: '4:5 or 1:1 or 16:9',
    recommendedResolution: '1200 x 1500 px (min 800 x 1000)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917849/zimor/about/craftsmanship-atelier.webp',
    publicId: 'zimor/about/craftsmanship-atelier',
    alt: 'Artisanal leather craftsmanship and luxury handbag creation in India',
    cloudinaryFolder: 'zimor/homepage',
    mediaType: 'image',
  },
  craft_video: {
    id: 'craft_video',
    scope: 'homepage',
    sectionGroup: 'Crafted in India',
    title: 'Manufacturing Video Stream',
    label: 'Artisanal Craftsmanship Showcase Video (MP4)',
    description: 'Seamless loop video showcasing Indian leatherworking craftsmanship.',
    recommendedAspect: '4:5 or 16:9 Vertical/Square Video',
    recommendedResolution: '1080p MP4 / WebM',
    url: 'https://res.cloudinary.com/kbeyfu3d/video/upload/v1794917863/zimor/videos/cafune-craftsmanship.mp4',
    publicId: 'zimor/videos/cafune-craftsmanship',
    alt: 'Artisanal leather craftsmanship video in atelier',
    cloudinaryFolder: 'zimor/videos',
    mediaType: 'video',
  },
  craft_supporting: {
    id: 'craft_supporting',
    scope: 'homepage',
    sectionGroup: 'Crafted in India',
    title: 'Supporting Heritage Image',
    label: 'Crafted in India Editorial Inset Photograph',
    description: 'Landscape photograph displayed inside the editorial narrative panel.',
    recommendedAspect: '3:2 Landscape',
    recommendedResolution: '1200 x 800 px (min 920 x 613)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917847/zimor/about/artisan-heritage-landscape.webp',
    publicId: 'zimor/about/artisan-heritage-landscape',
    alt: 'Crafted in India artisan heritage and leatherwork atelier',
    cloudinaryFolder: 'zimor/homepage',
    mediaType: 'image',
  },

  // 3. Homepage → In the Spotlight (About Zimor Masonry)
  spotlight_craftsmanship: {
    id: 'spotlight_craftsmanship',
    scope: 'homepage',
    sectionGroup: 'In the Spotlight',
    title: 'Rooted in Craftsmanship',
    label: 'Atelier & Hand-Stitching Frame (Tile 02)',
    description: 'Editorial masonry tile highlighting artisanal hand-stitching with needle and thread.',
    recommendedAspect: '4:5 or 1:1 Portrait / Square',
    recommendedResolution: '1000 x 1000 px (min 800 x 800)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917849/zimor/about/craftsmanship-atelier.webp',
    publicId: 'zimor/about/craftsmanship-atelier',
    alt: 'Artisan hand-stitching luxury leather with needle and waxed thread',
    cloudinaryFolder: 'zimor/homepage',
    mediaType: 'image',
  },
  spotlight_everyday: {
    id: 'spotlight_everyday',
    scope: 'homepage',
    sectionGroup: 'In the Spotlight',
    title: 'Designed for Everyday',
    label: 'Handbag Macro & Texture Frame (Tile 03)',
    description: 'Editorial masonry tile showcasing the Rabota tote texture, zipper, and fine grain.',
    recommendedAspect: '3:4 or 4:5 Portrait',
    recommendedResolution: '800 x 1000 px (min 600 x 800)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917833/zimor/products/rabota-4.webp',
    publicId: 'zimor/products/rabota-4',
    alt: 'Macro texture of Zimor Rabota luxury bag showing zipper and grain',
    cloudinaryFolder: 'zimor/homepage',
    mediaType: 'image',
  },
  spotlight_details: {
    id: 'spotlight_details',
    scope: 'homepage',
    sectionGroup: 'In the Spotlight',
    title: 'Details That Matter',
    label: 'Hardware & Silhouette Frame (Tile 04)',
    description: 'Editorial masonry tile displaying refined brass hardware and cruelty-free leather.',
    recommendedAspect: '16:9 or 3:2 Landscape',
    recommendedResolution: '1200 x 800 px (min 900 x 600)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917845/zimor/lifestyle/luxury-bag-tan.webp',
    publicId: 'zimor/lifestyle/luxury-bag-tan',
    alt: 'Luxury cruelty-free leather handbag detailing with refined brass hardware',
    cloudinaryFolder: 'zimor/homepage',
    mediaType: 'image',
  },
  spotlight_proudly_made: {
    id: 'spotlight_proudly_made',
    scope: 'homepage',
    sectionGroup: 'In the Spotlight',
    title: 'Proudly Made in India',
    label: 'Indian Atelier & Provenance Frame (Tile 05)',
    description: 'Wide cinematic masonry tile displaying master artisans and leather rolls in India.',
    recommendedAspect: '16:9 or 21:9 Panoramic Landscape',
    recommendedResolution: '1400 x 800 px (min 1000 x 600)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917847/zimor/about/artisan-heritage-landscape.webp',
    publicId: 'zimor/about/artisan-heritage-landscape',
    alt: 'Master artisan in Indian leathercraft atelier surrounded by leather rolls and hand tools',
    cloudinaryFolder: 'zimor/homepage',
    mediaType: 'image',
  },
};

export const DEFAULT_ABOUT_VISUAL_MEDIA: Record<string, VisualMediaItem> = {
  brandOverview: {
    id: 'brandOverview',
    scope: 'about',
    sectionGroup: 'Brand Overview',
    title: 'Brand Overview Canvas',
    label: 'Section 01 — Panoramic Editorial Banner',
    description: 'Main wide-canvas visual displayed under Section 01 – Brand Overview.',
    recommendedAspect: '21:9 or 24:9 Panoramic',
    recommendedResolution: '2400 x 900 px (min 1920 x 720)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917844/zimor/lifestyle/corporate-workspace-horizontal.webp',
    publicId: 'zimor/lifestyle/corporate-workspace-horizontal',
    alt: 'ZIMOR Premium fashion and accessories collection overview',
    cloudinaryFolder: 'zimor/about',
    mediaType: 'image',
  },
  brandStory: {
    id: 'brandStory',
    scope: 'about',
    sectionGroup: 'Brand Story',
    title: 'Brand Story Portrait',
    label: 'Section 03 — Atelier & Craftsmanship Portrait',
    description: 'Vertical editorial portrait displayed next to the Section 03 – Brand Story narrative.',
    recommendedAspect: '3:4 or 4:5 Portrait',
    recommendedResolution: '1200 x 1500 px (min 800 x 1000)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917849/zimor/about/craftsmanship-atelier.webp',
    publicId: 'zimor/about/craftsmanship-atelier',
    alt: 'Precision, care and attention to detail in craftsmanship',
    cloudinaryFolder: 'zimor/about',
    mediaType: 'image',
  },
  brandVision: {
    id: 'brandVision',
    scope: 'about',
    sectionGroup: 'Brand Vision',
    title: 'Brand Vision Spread',
    label: 'Section 04 — Inspiring Women Editorial Card',
    description: 'Atmospheric background image for Section 04 – Brand Vision card.',
    recommendedAspect: '4:3 or 1:1 Card',
    recommendedResolution: '1200 x 1200 px (min 800 x 800)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917848/zimor/about/brand-vision-duo-colleagues.webp',
    publicId: 'zimor/about/brand-vision-duo-colleagues',
    alt: 'ZIMOR Brand Vision – Inspiring women through distinctive design and accessible premium fashion',
    cloudinaryFolder: 'zimor/about',
    mediaType: 'image',
  },
  brandMission: {
    id: 'brandMission',
    scope: 'about',
    sectionGroup: 'Brand Mission',
    title: 'Brand Mission Spread',
    label: 'Section 05 — Leathercraft Atelier Editorial Card',
    description: 'Atmospheric background image for Section 05 – Brand Mission card.',
    recommendedAspect: '4:3 or 1:1 Card',
    recommendedResolution: '1200 x 1200 px (min 800 x 800)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917847/zimor/about/brand-mission-leather.webp',
    publicId: 'zimor/about/brand-mission-leather',
    alt: 'ZIMOR Brand Mission – Fashion-forward handbags and meticulous craftsmanship',
    cloudinaryFolder: 'zimor/about',
    mediaType: 'image',
  },
  brandValues: {
    id: 'brandValues',
    scope: 'about',
    sectionGroup: 'Brand Values',
    title: 'Brand Values Visual',
    label: 'Section 06 — Quiet Luxury Atelier Photography',
    description: 'Editorial craftsmanship photography displayed alongside the 7 Brand Values in Section 06.',
    recommendedAspect: '4:5 Portrait',
    recommendedResolution: '1200 x 1500 px (min 800 x 1000)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917850/zimor/about/brand-values-craft.webp',
    publicId: 'zimor/about/brand-values-craft',
    alt: 'Artisanal leathercraft and precision stitching at the Zimor atelier',
    cloudinaryFolder: 'zimor/about',
    mediaType: 'image',
  },
};

export const ALL_DEFAULT_VISUAL_MEDIA: Record<string, VisualMediaItem> = {
  ...DEFAULT_HOMEPAGE_VISUAL_MEDIA,
  ...DEFAULT_ABOUT_VISUAL_MEDIA,
};

// ============================================================================
// HELPERS
// ============================================================================

export function isWebPBuffer(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 12) return false;
  const isRiff = buffer.toString('ascii', 0, 4) === 'RIFF';
  const isWebp = buffer.toString('ascii', 8, 12) === 'WEBP';
  return isRiff && isWebp;
}

// ============================================================================
// CONTROLLERS
// ============================================================================

/**
 * GET /api/visual-media
 * Returns all visual media items for both Homepage and About page.
 */
export async function getVisualMedia(req: Request, res: Response) {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const { scope } = req.query; // 'homepage' | 'about' | undefined (all)
    const db = await getDatabaseProvider();

    // 1. Fetch Homepage Media from MongoDB
    const homeItems = await db.getContent('homepage', 'media');
    let homeData: VisualMediaMapping =
      homeItems.length > 0 && homeItems[0].data
        ? (homeItems[0].data as VisualMediaMapping)
        : {};

    // Seed homepage defaults if missing
    let homeModified = false;
    const mergedHome: VisualMediaMapping = { ...DEFAULT_HOMEPAGE_VISUAL_MEDIA, ...homeData };
    for (const key of Object.keys(DEFAULT_HOMEPAGE_VISUAL_MEDIA)) {
      if (!homeData[key]) {
        mergedHome[key] = DEFAULT_HOMEPAGE_VISUAL_MEDIA[key];
        homeModified = true;
      }
    }
    if (homeModified || homeItems.length === 0) {
      await db.upsertContent('homepage', 'media', mergedHome as unknown as Record<string, unknown>);
      homeData = mergedHome;
    }

    // 2. Fetch About Page Media from MongoDB
    const aboutItems = await db.getContent('about', 'media');
    let aboutData: Record<string, any> =
      aboutItems.length > 0 && aboutItems[0].data
        ? (aboutItems[0].data as Record<string, any>)
        : {};

    // Map aboutData into VisualMediaItem format
    const mergedAbout: VisualMediaMapping = {};
    for (const key of Object.keys(DEFAULT_ABOUT_VISUAL_MEDIA)) {
      const def = DEFAULT_ABOUT_VISUAL_MEDIA[key];
      const existing = aboutData[key];
      mergedAbout[key] = {
        ...def,
        url: existing?.url || def.url,
        publicId: existing?.publicId || def.publicId,
        alt: existing?.alt || def.alt,
        updatedAt: existing?.updatedAt || def.updatedAt,
        updatedBy: existing?.updatedBy || def.updatedBy,
      };
    }

    if (scope === 'homepage') {
      return res.json({
        scope: 'homepage',
        media: homeData,
        items: Object.values(homeData),
      });
    }

    if (scope === 'about') {
      return res.json({
        scope: 'about',
        media: mergedAbout,
        items: Object.values(mergedAbout),
      });
    }

    const allItems: VisualMediaMapping = {
      ...homeData,
      ...mergedAbout,
    };

    return res.json({
      media: allItems,
      homepage: homeData,
      about: mergedAbout,
      items: Object.values(allItems),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch visual media' });
  }
}

/**
 * GET /api/homepage-media
 * Public endpoint for storefront homepage components to consume dynamic media.
 */
export async function getHomepageMedia(_req: Request, res: Response) {
  try {
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    const db = await getDatabaseProvider();
    const homeItems = await db.getContent('homepage', 'media');
    const homeData: VisualMediaMapping =
      homeItems.length > 0 && homeItems[0].data
        ? (homeItems[0].data as VisualMediaMapping)
        : DEFAULT_HOMEPAGE_VISUAL_MEDIA;

    const merged: VisualMediaMapping = { ...DEFAULT_HOMEPAGE_VISUAL_MEDIA, ...homeData };
    return res.json({ media: merged });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to load homepage media' });
  }
}

/**
 * POST /api/visual-media/upload
 * Strictly uploads WebP/image/video asset to Cloudinary in the correct folder,
 * updates MongoDB mappings, and returns the updated item.
 */
export async function uploadVisualMedia(req: Request, res: Response) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No media file provided.' });
    }

    const itemId = (req.body.id || req.body.section || req.query.id || req.query.section || '') as string;
    const targetDef = ALL_DEFAULT_VISUAL_MEDIA[itemId];
    if (!targetDef) {
      return res.status(400).json({
        error: `Invalid visual media identifier "${itemId}". Available IDs: ${Object.keys(ALL_DEFAULT_VISUAL_MEDIA).join(', ')}`,
      });
    }

    const mime = (file.mimetype || '').toLowerCase();
    const ext = path.extname(file.originalname || '').toLowerCase();
    const isVideo = mime.startsWith('video/') || ext === '.mp4' || ext === '.webm';

    // Allow WebP, PNG, JPG, JPEG for images; MP4/WebM for videos
    const isAllowedImage =
      mime === 'image/webp' ||
      mime === 'image/jpeg' ||
      mime === 'image/jpg' ||
      mime === 'image/png' ||
      ext === '.webp' ||
      ext === '.jpg' ||
      ext === '.jpeg' ||
      ext === '.png';

    if (!isAllowedImage && !isVideo) {
      return res.status(400).json({
        error: `Unsupported file format. Please upload a WebP, JPEG, PNG image or MP4 video. Received: ${mime} (${ext})`,
      });
    }

    // Determine Cloudinary target folder based on exact section definition
    const folder = targetDef.cloudinaryFolder || (targetDef.scope === 'about' ? 'zimor/about' : 'zimor/homepage');
    const safeBaseName = targetDef.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${safeBaseName}-${Date.now()}${ext}`;
    const alt = req.body.alt || targetDef.alt || file.originalname;

    const mediaProvider = getMediaProvider();
    const uploaded = await mediaProvider.upload(file.buffer, {
      filename,
      mimeType: file.mimetype,
      folder,
      alt,
    });

    const db = await getDatabaseProvider();

    // Trace in MediaItem collection
    await db.createMediaItem({
      filename,
      originalName: file.originalname,
      url: uploaded.url,
      publicId: uploaded.publicId,
      mimeType: file.mimetype,
      size: file.size,
      width: uploaded.width,
      height: uploaded.height,
      alt,
      folder,
    });

    // Update in MongoDB SiteContent
    const adminEmail = (req as any).admin?.email || 'admin@zimor.com';
    const updatedItem: VisualMediaItem = {
      ...targetDef,
      url: uploaded.url,
      publicId: uploaded.publicId,
      alt,
      width: uploaded.width,
      height: uploaded.height,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail,
    };

    if (targetDef.scope === 'homepage') {
      const homeItems = await db.getContent('homepage', 'media');
      const existing =
        homeItems.length > 0 && homeItems[0].data
          ? (homeItems[0].data as VisualMediaMapping)
          : DEFAULT_HOMEPAGE_VISUAL_MEDIA;

      const newHomeMapping: VisualMediaMapping = {
        ...existing,
        [itemId]: updatedItem,
      };

      await db.upsertContent('homepage', 'media', newHomeMapping as unknown as Record<string, unknown>);
    } else {
      // Sync About page mapping in MongoDB
      const aboutItems = await db.getContent('about', 'media');
      const existing =
        aboutItems.length > 0 && aboutItems[0].data
          ? (aboutItems[0].data as Record<string, any>)
          : DEFAULT_ABOUT_MEDIA;

      const newAboutMapping = {
        ...existing,
        [itemId]: {
          ...(existing[itemId] || DEFAULT_ABOUT_MEDIA[itemId]),
          url: uploaded.url,
          publicId: uploaded.publicId,
          alt,
          width: uploaded.width,
          height: uploaded.height,
          updatedAt: new Date().toISOString(),
          updatedBy: adminEmail,
        },
      };

      await db.upsertContent('about', 'media', newAboutMapping as unknown as Record<string, unknown>);
    }

    return res.status(200).json({
      success: true,
      message: `Successfully updated visual media asset for ${targetDef.title}`,
      item: updatedItem,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to upload visual media asset' });
  }
}

/**
 * PUT /api/visual-media/:id
 * Updates asset metadata (e.g. alt text or manual URL).
 */
export async function updateVisualMedia(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const targetDef = ALL_DEFAULT_VISUAL_MEDIA[id];
    if (!targetDef) {
      return res.status(400).json({ error: `Unknown visual media item "${id}"` });
    }

    const { url, alt, publicId } = req.body;
    const db = await getDatabaseProvider();
    const adminEmail = (req as any).admin?.email || 'admin@zimor.com';

    if (targetDef.scope === 'homepage') {
      const homeItems = await db.getContent('homepage', 'media');
      const existing =
        homeItems.length > 0 && homeItems[0].data
          ? (homeItems[0].data as VisualMediaMapping)
          : DEFAULT_HOMEPAGE_VISUAL_MEDIA;

      const currentItem = existing[id] || targetDef;
      const updatedItem: VisualMediaItem = {
        ...currentItem,
        url: url !== undefined ? url : currentItem.url,
        alt: alt !== undefined ? alt : currentItem.alt,
        publicId: publicId !== undefined ? publicId : currentItem.publicId,
        updatedAt: new Date().toISOString(),
        updatedBy: adminEmail,
      };

      const newMapping: VisualMediaMapping = {
        ...existing,
        [id]: updatedItem,
      };

      await db.upsertContent('homepage', 'media', newMapping as unknown as Record<string, unknown>);
      return res.json({ success: true, item: updatedItem });
    } else {
      const aboutItems = await db.getContent('about', 'media');
      const existing =
        aboutItems.length > 0 && aboutItems[0].data
          ? (aboutItems[0].data as Record<string, any>)
          : DEFAULT_ABOUT_MEDIA;

      const currentItem = existing[id] || DEFAULT_ABOUT_MEDIA[id];
      const updatedAbout = {
        ...currentItem,
        url: url !== undefined ? url : currentItem.url,
        alt: alt !== undefined ? alt : currentItem.alt,
        publicId: publicId !== undefined ? publicId : currentItem.publicId,
        updatedAt: new Date().toISOString(),
        updatedBy: adminEmail,
      };

      const newMapping = {
        ...existing,
        [id]: updatedAbout,
      };

      await db.upsertContent('about', 'media', newMapping as unknown as Record<string, unknown>);
      return res.json({ success: true, item: updatedAbout });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update asset metadata' });
  }
}

/**
 * POST /api/visual-media/reset
 * Resets a single asset or entire section back to factory default.
 */
export async function resetVisualMedia(req: Request, res: Response) {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Asset id is required to reset' });
    }

    const defaultItem = ALL_DEFAULT_VISUAL_MEDIA[id];
    if (!defaultItem) {
      return res.status(400).json({ error: `Cannot reset unknown item "${id}"` });
    }

    const db = await getDatabaseProvider();

    if (defaultItem.scope === 'homepage') {
      const homeItems = await db.getContent('homepage', 'media');
      const existing =
        homeItems.length > 0 && homeItems[0].data
          ? (homeItems[0].data as VisualMediaMapping)
          : DEFAULT_HOMEPAGE_VISUAL_MEDIA;

      const newMapping: VisualMediaMapping = {
        ...existing,
        [id]: {
          ...defaultItem,
          updatedAt: new Date().toISOString(),
          updatedBy: 'Factory Default Reset',
        },
      };

      await db.upsertContent('homepage', 'media', newMapping as unknown as Record<string, unknown>);
      return res.json({ success: true, item: newMapping[id] });
    } else {
      const aboutDefault = DEFAULT_ABOUT_MEDIA[id];
      const aboutItems = await db.getContent('about', 'media');
      const existing =
        aboutItems.length > 0 && aboutItems[0].data
          ? (aboutItems[0].data as Record<string, any>)
          : DEFAULT_ABOUT_MEDIA;

      const newMapping = {
        ...existing,
        [id]: {
          ...aboutDefault,
          updatedAt: new Date().toISOString(),
          updatedBy: 'Factory Default Reset',
        },
      };

      await db.upsertContent('about', 'media', newMapping as unknown as Record<string, unknown>);
      return res.json({ success: true, item: newMapping[id] });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to reset visual media item' });
  }
}
