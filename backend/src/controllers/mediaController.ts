import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { getMediaProvider } from '../media/index.js';
import { getDatabaseProvider } from '../db/index.js';
import { config } from '../config/index.js';

const ALLOWED_FOLDER_PREFIXES = [
  'zimor/products',
  'zimor/banners',
  'zimor/homepage',
  'zimor/about',
  'zimor/videos',
  'zimor/reels',
  'zimor/media',
  'zimor/lifestyle',
];

export function isValidUploadFolder(folder: string): boolean {
  if (!folder || typeof folder !== 'string') return false;
  if (!folder.startsWith('zimor/')) return false;
  if (!/^[a-zA-Z0-9_\-\/]+$/.test(folder)) return false;
  if (folder.includes('..')) return false;
  return ALLOWED_FOLDER_PREFIXES.some(prefix => folder === prefix || folder.startsWith(`${prefix}/`));
}

/**
 * POST /api/media/sign-upload
 * Generates an authenticated pre-signed Cloudinary upload payload for direct browser-to-Cloudinary uploads.
 * Restricts target folders, resource types, and formats without ever exposing CLOUDINARY_API_SECRET.
 */
export async function getUploadSignature(req: Request, res: Response) {
  try {
    const { folder, resourceType: rawResourceType, publicId } = req.body;

    let normalizedFolder = (folder || 'zimor/products').trim();
    if (!normalizedFolder.startsWith('zimor/')) {
      normalizedFolder = `zimor/${normalizedFolder}`;
    }

    if (!isValidUploadFolder(normalizedFolder)) {
      return res.status(400).json({
        error: `Invalid upload folder "${normalizedFolder}". Must be one of: ${ALLOWED_FOLDER_PREFIXES.join(', ')}`,
      });
    }

    const resourceType = rawResourceType === 'video' ? 'video' : 'image';
    if (rawResourceType && rawResourceType !== 'image' && rawResourceType !== 'video') {
      return res.status(400).json({ error: 'Invalid resourceType. Must be "image" or "video".' });
    }

    // Determine strict allowed formats based on folder and resource type
    let allowedFormats: string | undefined = undefined;
    if (normalizedFolder.startsWith('zimor/about')) {
      allowedFormats = 'webp';
    } else if (resourceType === 'video') {
      allowedFormats = 'mp4,webm,mov';
    } else {
      allowedFormats = 'webp,jpg,jpeg,png,gif,svg';
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign: Record<string, string | number> = {
      folder: normalizedFolder,
      timestamp,
    };

    if (allowedFormats) {
      paramsToSign.allowed_formats = allowedFormats;
    }

    const safePublicId =
      typeof publicId === 'string' && /^[a-zA-Z0-9_\-]+$/.test(publicId) ? publicId : undefined;
    if (safePublicId) {
      paramsToSign.public_id = safePublicId;
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, config.cloudinary.apiSecret);

    return res.json({
      signature,
      timestamp,
      apiKey: config.cloudinary.apiKey,
      cloudName: config.cloudinary.cloudName,
      folder: normalizedFolder,
      resourceType,
      allowedFormats,
      ...(safePublicId ? { publicId: safePublicId } : {}),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate upload signature' });
  }
}

/**
 * POST /api/media/register
 * Registers a completed direct browser-to-Cloudinary upload into MongoDB MediaItem collection.
 */
export async function registerUploadedMedia(req: Request, res: Response) {
  try {
    const {
      url,
      publicId,
      filename,
      originalName,
      mimeType,
      size,
      width,
      height,
      duration,
      folder,
      alt,
    } = req.body;

    if (!url || typeof url !== 'string' || !publicId || typeof publicId !== 'string') {
      return res.status(400).json({ error: 'Missing required media fields: "url" and "publicId" are required.' });
    }

    if (!url.startsWith('https://res.cloudinary.com/') && !url.startsWith('http://res.cloudinary.com/')) {
      return res.status(400).json({ error: 'Invalid media URL origin. Must be a secure Cloudinary asset.' });
    }

    let safeFolder = (folder || 'zimor/media').trim();
    if (!safeFolder.startsWith('zimor/')) {
      safeFolder = `zimor/${safeFolder}`;
    }
    if (!isValidUploadFolder(safeFolder)) {
      safeFolder = 'zimor/media';
    }

    const safeFilename = filename || (publicId.split('/').pop() || 'asset');

    const db = await getDatabaseProvider();
    const mediaItem = await db.createMediaItem({
      filename: safeFilename,
      originalName: originalName || safeFilename,
      url,
      publicId,
      mimeType: mimeType || (url.includes('/video/') ? 'video/mp4' : 'image/webp'),
      size: typeof size === 'number' ? size : 0,
      width: typeof width === 'number' ? width : undefined,
      height: typeof height === 'number' ? height : undefined,
      folder: safeFolder,
      alt: alt || safeFilename,
    });

    return res.status(201).json({ success: true, media: mediaItem });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to register media asset' });
  }
}

export async function getMedia(req: Request, res: Response) {
  try {
    const { folder = 'zimor/products' } = req.query;
    const mediaProvider = getMediaProvider();
    const media = await mediaProvider.listFiles(folder as string);
    return res.json({ media });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to list media' });
  }
}

export async function uploadMedia(req: Request, res: Response) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const folder = (req.body.folder as string) || 'zimor/products';
    const mediaProvider = getMediaProvider();
    const uploaded = await mediaProvider.upload(file.buffer, {
      filename: file.originalname,
      mimeType: file.mimetype,
      folder,
      alt: req.body.alt || file.originalname,
    });

    const db = await getDatabaseProvider();
    await db.createMediaItem({
      filename: file.originalname,
      originalName: file.originalname,
      url: uploaded.url,
      publicId: uploaded.publicId,
      mimeType: file.mimetype,
      size: file.size,
      width: uploaded.width,
      height: uploaded.height,
      folder,
    });

    return res.status(201).json({ media: uploaded });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to upload media' });
  }
}

export async function deleteMedia(req: Request, res: Response) {
  try {
    const { publicId, id } = req.query;
    const target = (publicId || id) as string;
    if (!target) {
      return res.status(400).json({ error: 'Media identifier required' });
    }

    const mediaProvider = getMediaProvider();
    await mediaProvider.delete(target);

    const db = await getDatabaseProvider();
    await db.deleteMediaItem(target);

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete media' });
  }
}
