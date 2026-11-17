import { Request, Response } from 'express';
import { getMediaProvider } from '../media/index.js';
import { getDatabaseProvider } from '../db/index.js';

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
