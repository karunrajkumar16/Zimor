// backend/src/controllers/promotionController.ts
import { Request, Response } from 'express';
import { connectToDatabase } from '../db/mongodb.js';
import { PromotionModel } from '../db/models/Promotion.js';

// Standard fallback promotions for graceful degradation
const VERIFIED_FALLBACK_PROMOTIONS: Record<string, { discountPercent: number; description: string; minOrder: number }> = {
  WELCOME10: { discountPercent: 10, description: '10% Welcome Discount applied', minOrder: 0 },
  ZIMOR15: { discountPercent: 15, description: '15% Seasonal Discount applied', minOrder: 2000 },
  FIRSTBUY: { discountPercent: 10, description: '10% First Order Discount applied', minOrder: 0 },
  ZIMOR10: { discountPercent: 10, description: '10% Atelier Discount applied', minOrder: 0 },
};

/**
 * Validates a promotional code against MongoDB Atlas with backward compatibility.
 * POST /api/checkout/validate-promo or POST /api/promotions/validate
 */
export async function validatePromotion(req: Request, res: Response) {
  try {
    const { code, subtotal = 0 } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        valid: false,
        error: 'Please enter a valid promotional code.',
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const orderSubtotal = Math.max(0, Number(subtotal) || 0);

    let promoDoc: any = null;

    try {
      await connectToDatabase();
      promoDoc = await PromotionModel.findOne({ code: cleanCode }).lean();
    } catch (dbErr) {
      console.warn('[PROMO WARNING] Database lookup failed, checking fallback promotions:', dbErr);
    }

    // 1. If promo exists in MongoDB
    if (promoDoc) {
      if (!promoDoc.isActive) {
        return res.status(400).json({
          success: false,
          valid: false,
          error: 'This promotional code has expired or is no longer active.',
        });
      }

      if (promoDoc.expiresAt && new Date(promoDoc.expiresAt).getTime() < Date.now()) {
        return res.status(400).json({
          success: false,
          valid: false,
          error: 'This promotional code has expired.',
        });
      }

      if (promoDoc.minOrderAmount > 0 && orderSubtotal < promoDoc.minOrderAmount) {
        return res.status(400).json({
          success: false,
          valid: false,
          error: `Minimum order value of ₹${promoDoc.minOrderAmount.toLocaleString('en-IN')} required to apply code "${cleanCode}".`,
        });
      }

      let discount = 0;
      if (promoDoc.discountType === 'percentage') {
        discount = Math.round((orderSubtotal * promoDoc.discountPercent) / 100);
        if (promoDoc.maxDiscountAmount && promoDoc.maxDiscountAmount > 0) {
          discount = Math.min(discount, promoDoc.maxDiscountAmount);
        }
      } else {
        discount = Math.min(orderSubtotal, promoDoc.discountAmount || 0);
      }

      return res.json({
        success: true,
        valid: true,
        code: promoDoc.code,
        discountPercent: promoDoc.discountPercent,
        discountAmount: discount,
        description: promoDoc.description || `${promoDoc.discountPercent}% Discount Applied`,
      });
    }

    // 2. Check verified fallback promotions if database does not contain this code yet
    const fallback = VERIFIED_FALLBACK_PROMOTIONS[cleanCode];
    if (fallback) {
      if (fallback.minOrder > 0 && orderSubtotal < fallback.minOrder) {
        return res.status(400).json({
          success: false,
          valid: false,
          error: `Minimum order value of ₹${fallback.minOrder.toLocaleString('en-IN')} required to apply code "${cleanCode}".`,
        });
      }

      const discount = Math.round((orderSubtotal * fallback.discountPercent) / 100);
      return res.json({
        success: true,
        valid: true,
        code: cleanCode,
        discountPercent: fallback.discountPercent,
        discountAmount: discount,
        description: fallback.description,
      });
    }

    return res.status(400).json({
      success: false,
      valid: false,
      error: `Promotional code "${cleanCode}" is not recognized. Please check your spelling.`,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      valid: false,
      error: err.message || 'Unable to validate promotional code at this time.',
    });
  }
}

/**
 * Calculates discount for an order server-side during checkout creation or verification.
 */
export async function calculateServerPromoDiscount(code: string | undefined | null, subtotal: number): Promise<{ discountAmount: number; appliedCode: string | null }> {
  if (!code || typeof code !== 'string') {
    return { discountAmount: 0, appliedCode: null };
  }

  const cleanCode = code.trim().toUpperCase();
  const orderSubtotal = Math.max(0, Number(subtotal) || 0);

  try {
    await connectToDatabase();
    const promoDoc = await PromotionModel.findOne({ code: cleanCode, isActive: true }).lean();
    if (promoDoc) {
      if (promoDoc.expiresAt && new Date(promoDoc.expiresAt).getTime() < Date.now()) {
        return { discountAmount: 0, appliedCode: null };
      }
      if (promoDoc.minOrderAmount > 0 && orderSubtotal < promoDoc.minOrderAmount) {
        return { discountAmount: 0, appliedCode: null };
      }

      let discount = 0;
      if (promoDoc.discountType === 'percentage') {
        discount = Math.round((orderSubtotal * promoDoc.discountPercent) / 100);
        if (promoDoc.maxDiscountAmount && promoDoc.maxDiscountAmount > 0) {
          discount = Math.min(discount, promoDoc.maxDiscountAmount);
        }
      } else {
        discount = Math.min(orderSubtotal, promoDoc.discountAmount || 0);
      }

      return { discountAmount: discount, appliedCode: promoDoc.code };
    }
  } catch {
    // Continue to fallback check
  }

  const fallback = VERIFIED_FALLBACK_PROMOTIONS[cleanCode];
  if (fallback) {
    if (fallback.minOrder > 0 && orderSubtotal < fallback.minOrder) {
      return { discountAmount: 0, appliedCode: null };
    }
    const discount = Math.round((orderSubtotal * fallback.discountPercent) / 100);
    return { discountAmount: discount, appliedCode: cleanCode };
  }

  return { discountAmount: 0, appliedCode: null };
}

/**
 * GET /api/promotions (Admin)
 */
export async function getPromotions(_req: Request, res: Response) {
  try {
    await connectToDatabase();
    const promos = await PromotionModel.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, promotions: promos });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to fetch promotions' });
  }
}

/**
 * POST /api/promotions (Admin)
 */
export async function createOrUpdatePromotion(req: Request, res: Response) {
  try {
    await connectToDatabase();
    const { code, description, discountPercent, discountType, discountAmount, minOrderAmount, maxDiscountAmount, isActive, expiresAt, usageLimit } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, error: 'Promo code is required.' });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const promo = await PromotionModel.findOneAndUpdate(
      { code: cleanCode },
      {
        code: cleanCode,
        description: description || `${discountPercent || 10}% Off`,
        discountPercent: Number(discountPercent) || 0,
        discountType: discountType || 'percentage',
        discountAmount: Number(discountAmount) || 0,
        minOrderAmount: Number(minOrderAmount) || 0,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
        isActive: isActive !== false,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
      },
      { upsert: true, new: true }
    );

    return res.status(201).json({ success: true, promotion: promo });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to save promotion' });
  }
}
