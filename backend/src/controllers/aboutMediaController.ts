import path from 'path';
import { Request, Response } from 'express';
import { getDatabaseProvider } from '../db/index.js';
import { getMediaProvider } from '../media/index.js';
import { AboutMediaSection, AboutMediaMapping } from '../types/index.js';

export const DEFAULT_ABOUT_MEDIA: AboutMediaMapping = {
  brandOverview: {
    id: 'brandOverview',
    title: 'Brand Overview Canvas',
    subtitle: 'Panoramic Editorial Banner',
    description: 'Main wide-canvas visual displayed under Section 01 – Brand Overview.',
    recommendedAspect: '21:9 or 24:9 Panoramic',
    recommendedResolution: '2400 x 900 px (min 1920 x 720)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917844/zimor/lifestyle/corporate-workspace-horizontal.webp',
    publicId: 'zimor/lifestyle/corporate-workspace-horizontal',
    alt: 'ZIMOR Premium fashion and accessories collection overview',
    updatedAt: '2026-11-24T00:00:00.000Z',
  },
  brandStory: {
    id: 'brandStory',
    title: 'Brand Story Portrait',
    subtitle: 'Atelier & Craftsmanship',
    description: 'Vertical editorial portrait displayed next to the Section 03 – Brand Story narrative.',
    recommendedAspect: '3:4 or 4:5 Portrait',
    recommendedResolution: '1200 x 1500 px (min 800 x 1000)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917849/zimor/about/craftsmanship-atelier.webp',
    publicId: 'zimor/about/craftsmanship-atelier',
    alt: 'Precision, care and attention to detail in craftsmanship',
    updatedAt: '2026-11-24T00:00:00.000Z',
  },
  brandVision: {
    id: 'brandVision',
    title: 'Brand Vision Spread',
    subtitle: 'Editorial Spread Card',
    description: 'Atmospheric background image for Section 04 – Brand Vision card.',
    recommendedAspect: '4:3 or 1:1 Card',
    recommendedResolution: '1200 x 1200 px (min 800 x 800)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917848/zimor/about/brand-vision-duo-colleagues.webp',
    publicId: 'zimor/about/brand-vision-duo-colleagues',
    alt: 'ZIMOR Brand Vision – Inspiring women through distinctive design and accessible premium fashion',
    updatedAt: '2026-11-24T00:00:00.000Z',
  },
  brandMission: {
    id: 'brandMission',
    title: 'Brand Mission Spread',
    subtitle: 'Editorial Spread Card',
    description: 'Atmospheric background image for Section 05 – Brand Mission card.',
    recommendedAspect: '4:3 or 1:1 Card',
    recommendedResolution: '1200 x 1200 px (min 800 x 800)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917847/zimor/about/brand-mission-leather.webp',
    publicId: 'zimor/about/brand-mission-leather',
    alt: 'ZIMOR Brand Mission – Fashion-forward handbags and meticulous craftsmanship',
    updatedAt: '2026-11-24T00:00:00.000Z',
  },
  brandValues: {
    id: 'brandValues',
    title: 'Brand Values Visual',
    subtitle: 'Quiet Luxury Atelier',
    description: 'Editorial craftsmanship photography displayed alongside the 7 Brand Values in Section 06.',
    recommendedAspect: '4:5 Portrait',
    recommendedResolution: '1200 x 1500 px (min 800 x 1000)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917850/zimor/about/brand-values-craft.webp',
    publicId: 'zimor/about/brand-values-craft',
    alt: 'Artisanal leathercraft and precision stitching at the Zimor atelier',
    updatedAt: '2026-11-24T00:00:00.000Z',
  },
};

/**
 * Validates whether the buffer begins with the standard WebP binary magic header.
 * Bytes 0-3: 'RIFF' (0x52, 0x49, 0x46, 0x46)
 * Bytes 8-11: 'WEBP' (0x57, 0x45, 0x42, 0x50)
 */
export function isWebPBuffer(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 12) return false;
  const isRiff = buffer.toString('ascii', 0, 4) === 'RIFF';
  const isWebp = buffer.toString('ascii', 8, 12) === 'WEBP';
  return isRiff && isWebp;
}

/**
 * GET /api/about-media
 * Returns the full About page media mapping from MongoDB.
 * If not yet seeded, initializes MongoDB with the verified default Cloudinary URLs.
 */
export async function getAboutMedia(req: Request, res: Response) {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const db = await getDatabaseProvider();
    const items = await db.getContent('about', 'media');
    let currentData = items.length > 0 && items[0].data ? (items[0].data as AboutMediaMapping) : null;

    if (!currentData || Object.keys(currentData).length === 0) {
      await db.upsertContent('about', 'media', DEFAULT_ABOUT_MEDIA as unknown as Record<string, unknown>);
      currentData = DEFAULT_ABOUT_MEDIA;
    } else {
      // Ensure any newly added sections are merged seamlessly
      let hasChanges = false;
      const merged: AboutMediaMapping = { ...DEFAULT_ABOUT_MEDIA, ...currentData };
      for (const key of Object.keys(DEFAULT_ABOUT_MEDIA)) {
        if (!currentData[key]) {
          merged[key] = DEFAULT_ABOUT_MEDIA[key];
          hasChanges = true;
        }
      }
      if (hasChanges) {
        await db.upsertContent('about', 'media', merged as unknown as Record<string, unknown>);
        currentData = merged;
      }
    }

    return res.json({
      media: currentData,
      sections: Object.values(currentData),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch about media' });
  }
}

/**
 * POST /api/about-media/upload
 * Validates WebP format strictly, uploads to Cloudinary (zimor/about/), and saves to MongoDB.
 */
export async function uploadAboutMedia(req: Request, res: Response) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No image file provided. Please select a WebP image.' });
    }

    const section = (req.body.section || req.query.section || '') as string;
    const validSections = Object.keys(DEFAULT_ABOUT_MEDIA);
    if (!validSections.includes(section)) {
      return res.status(400).json({
        error: `Invalid section identifier "${section}". Valid sections are: ${validSections.join(', ')}`,
      });
    }

    // STRICT WEBP FORMAT & MIME TYPE VALIDATION
    const mime = (file.mimetype || '').toLowerCase();
    const ext = path.extname(file.originalname || '').toLowerCase();
    const validMagicBytes = isWebPBuffer(file.buffer);

    if (mime !== 'image/webp' || ext !== '.webp' || !validMagicBytes) {
      return res.status(400).json({
        error: `Invalid file format: Only WebP (.webp) images are allowed. Rejected file with MIME type "${file.mimetype}" and extension "${ext}". JPEG, PNG, JPG, SVG, and all other formats are strictly rejected.`,
      });
    }

    // Upload to Cloudinary under zimor/about/
    const mediaProvider = getMediaProvider();
    const filename = `about-${section}-${Date.now()}.webp`;
    const folder = 'zimor/about';
    const alt = req.body.alt || DEFAULT_ABOUT_MEDIA[section]?.alt || file.originalname;

    const uploaded = await mediaProvider.upload(file.buffer, {
      filename,
      mimeType: 'image/webp',
      folder,
      alt,
    });

    const db = await getDatabaseProvider();

    // Register in MediaItem collection for full traceability
    await db.createMediaItem({
      filename,
      originalName: file.originalname,
      url: uploaded.url,
      publicId: uploaded.publicId,
      mimeType: 'image/webp',
      size: file.size,
      width: uploaded.width,
      height: uploaded.height,
      alt,
      folder,
    });

    // Update MongoDB SiteContent mapping for About page media
    const items = await db.getContent('about', 'media');
    const existing = items.length > 0 && items[0].data ? (items[0].data as AboutMediaMapping) : DEFAULT_ABOUT_MEDIA;

    const updatedSection: AboutMediaSection = {
      ...(existing[section] || DEFAULT_ABOUT_MEDIA[section]),
      url: uploaded.url,
      publicId: uploaded.publicId,
      alt,
      width: uploaded.width,
      height: uploaded.height,
      updatedAt: new Date().toISOString(),
      updatedBy: (req as any).admin?.email || 'admin@zimor.com',
    };

    const newMapping: AboutMediaMapping = {
      ...existing,
      [section]: updatedSection,
    };

    await db.upsertContent('about', 'media', newMapping as unknown as Record<string, unknown>);

    return res.status(200).json({
      success: true,
      message: `Successfully uploaded and published image for ${updatedSection.title}`,
      section,
      updatedSection,
      media: newMapping,
      uploaded,
    });
  } catch (err: any) {
    console.error('[ABOUT MEDIA UPLOAD ERROR]:', err);
    return res.status(500).json({ error: err.message || 'Failed to upload about media' });
  }
}

/**
 * PUT /api/about-media/:section
 * Updates metadata (alt text, title) or manual verified URL for a specific About section.
 */
export async function updateAboutMedia(req: Request, res: Response) {
  try {
    const { section } = req.params;
    const validSections = Object.keys(DEFAULT_ABOUT_MEDIA);
    if (!validSections.includes(section)) {
      return res.status(400).json({
        error: `Invalid section identifier "${section}". Valid sections are: ${validSections.join(', ')}`,
      });
    }

    const { alt, title, subtitle, description, url, publicId, width, height } = req.body;
    if (url && !url.toLowerCase().endsWith('.webp') && !url.includes('.webp')) {
      return res.status(400).json({
        error: 'Only WebP (.webp) image URLs are permitted.',
      });
    }

    const db = await getDatabaseProvider();
    const items = await db.getContent('about', 'media');
    const existing = items.length > 0 && items[0].data ? (items[0].data as AboutMediaMapping) : DEFAULT_ABOUT_MEDIA;

    const currentSection = existing[section] || DEFAULT_ABOUT_MEDIA[section];
    const updatedSection: AboutMediaSection = {
      ...currentSection,
      ...(alt !== undefined ? { alt } : {}),
      ...(title !== undefined ? { title } : {}),
      ...(subtitle !== undefined ? { subtitle } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(url ? { url } : {}),
      ...(publicId ? { publicId } : {}),
      ...(typeof width === 'number' ? { width } : {}),
      ...(typeof height === 'number' ? { height } : {}),
      updatedAt: new Date().toISOString(),
      updatedBy: (req as any).admin?.email || 'admin@zimor.com',
    };

    // If new asset was uploaded (url + publicId provided), record in MediaItem collection
    if (url && publicId) {
      const filename = `about-${section}-${Date.now()}.webp`;
      await db.createMediaItem({
        filename,
        originalName: filename,
        url,
        publicId,
        mimeType: 'image/webp',
        size: typeof req.body.size === 'number' ? req.body.size : 0,
        width: typeof width === 'number' ? width : undefined,
        height: typeof height === 'number' ? height : undefined,
        alt: updatedSection.alt || currentSection.alt,
        folder: 'zimor/about',
      }).catch(err => console.error('[ABOUT MEDIA ITEM RECORD ERROR]:', err));
    }

    const newMapping: AboutMediaMapping = {
      ...existing,
      [section]: updatedSection,
    };

    await db.upsertContent('about', 'media', newMapping as unknown as Record<string, unknown>);

    return res.json({
      success: true,
      message: `Successfully updated ${updatedSection.title}`,
      section,
      updatedSection,
      media: newMapping,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update about section' });
  }
}

/**
 * POST /api/about-media/reset
 * Resets a section or all sections back to default verified Cloudinary images.
 */
export async function resetAboutMedia(req: Request, res: Response) {
  try {
    const { section } = req.body;
    const db = await getDatabaseProvider();
    const items = await db.getContent('about', 'media');
    const existing = items.length > 0 && items[0].data ? (items[0].data as AboutMediaMapping) : DEFAULT_ABOUT_MEDIA;

    let newMapping: AboutMediaMapping;
    if (section && DEFAULT_ABOUT_MEDIA[section]) {
      newMapping = {
        ...existing,
        [section]: {
          ...DEFAULT_ABOUT_MEDIA[section],
          updatedAt: new Date().toISOString(),
          updatedBy: (req as any).admin?.email || 'admin@zimor.com',
        },
      };
    } else {
      newMapping = { ...DEFAULT_ABOUT_MEDIA };
    }

    await db.upsertContent('about', 'media', newMapping as unknown as Record<string, unknown>);

    return res.json({
      success: true,
      message: section ? `Reset ${section} to default image` : 'Reset all sections to default images',
      media: newMapping,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to reset about media' });
  }
}
