import { Request, Response } from 'express';
import { getDatabaseProvider } from '../db/index.js';

export async function getReviews(req: Request, res: Response) {
  try {
    const slug = (req.query.slug as string) || '';
    const db = await getDatabaseProvider();
    const reviews = await db.getReviewsBySlug(slug);
    return res.json({ reviews });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch reviews' });
  }
}

export async function createReview(req: Request, res: Response) {
  try {
    const { userName, rating, title, comment, productSlug, productName, userCity, userAvatar, media } = req.body;
    if (!userName || !rating || !title || !comment || !productSlug) {
      return res.status(400).json({ error: 'Missing required review fields' });
    }

    const db = await getDatabaseProvider();
    const created = await db.createReview({
      userName,
      userCity: userCity || 'India',
      userAvatar: userAvatar || '',
      rating: Number(rating),
      title,
      comment,
      verifiedPurchase: true,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      productSlug,
      productName: productName || productSlug,
      media: Array.isArray(media) ? media : [],
      helpfulCount: 0,
    });

    return res.status(201).json({ review: created });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create review' });
  }
}
