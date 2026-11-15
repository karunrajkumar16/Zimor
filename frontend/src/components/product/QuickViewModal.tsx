'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Heart, ShoppingBag, Check, Star } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const quantity = 1;

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const currentColor = selectedColor || product.defaultColor;

  const handleAddToCart = () => {
    addItem(product, quantity, currentColor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-3xl bg-canvas-card border border-line rounded-lg shadow-lift overflow-hidden z-10 my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-ink-muted hover:text-ink rounded-full bg-canvas/80 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Column */}
          <div className="p-4 sm:p-6 bg-canvas-alt flex flex-col justify-between">
            <div className="relative aspect-square w-full rounded border border-line overflow-hidden bg-white">
              <Image
                src={product.images[selectedImage]?.url || product.images[0]?.url}
                alt={product.images[selectedImage]?.alt || product.name}
                fill
                loading="lazy"
                decoding="async"
                className={`object-cover ${product.isComingSoon ? 'filter blur-[7px] scale-105' : ''}`}
              />
              {product.isComingSoon && (
                <div className="absolute top-2.5 left-2.5 bg-black/90 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1">
                  COMING SOON
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-14 h-14 rounded border shrink-0 overflow-hidden transition-all ${selectedImage === idx ? 'ring-2 ring-brand-700 border-transparent' : 'border-line opacity-75 hover:opacity-100'
                    }`}
                >
                  <Image src={img.url} alt={img.alt} fill loading="lazy" decoding="async" className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
                <span className="uppercase tracking-widest font-semibold text-brand-700">
                  {product.categoryLabel}
                </span>
                <div className="flex items-center gap-1 text-zimor-orange">
                  <Star className="w-3.5 h-3.5 fill-zimor-orange text-zimor-orange" />
                  <span className="font-semibold text-ink">{product.averageRating.toFixed(1)}</span>
                  <span>({product.numReviews} reviews)</span>
                </div>
              </div>

              <h2 className="text-lg sm:text-xl font-semibold font-primary text-ink">{product.name}</h2>
              <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                {product.tagline}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-xl font-bold text-ink">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-ink-muted line-through">
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-semibold text-zimor-orange bg-zimor-cream/25 px-2 py-0.5 rounded">
                  Save ₹{(product.compareAtPrice - product.price).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Laptop fit indicator */}
              <div className="mt-4 p-2.5 bg-canvas rounded border border-line text-xs text-ink-secondary flex items-center gap-2">
                <Check className="w-4 h-4 text-ink shrink-0" />
                <span>{product.laptopCompatibility}</span>
              </div>

              {/* Color Selection */}
              <div className="mt-4 space-y-2">
                <label className="block text-xs font-semibold text-ink">
                  Color: <span className="font-normal text-ink-muted">{currentColor}</span>
                </label>
                <div className="flex items-center gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color.name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border transition-all ${currentColor === color.name
                        ? 'border-brand-700 bg-brand-50 text-brand-900 font-semibold'
                        : 'border-line text-ink hover:border-ink/40'
                        }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/20"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-3 border-t border-line">
              <div className="flex gap-3">
                {product.isComingSoon ? (
                  <button
                    type="button"
                    disabled
                    className="flex-1 bg-zimor-ashGrey/20 text-ink-muted py-3 px-4 rounded font-primary font-medium text-sm tracking-normal flex items-center justify-center gap-2 cursor-not-allowed border border-line"
                  >
                    <span>Coming Soon</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 bg-ink hover:bg-ink-secondary text-white py-3 px-4 rounded font-primary font-medium text-sm tracking-normal flex items-center justify-center gap-2 transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3 rounded border transition-colors ${inWishlist ? 'border-brand-700 text-brand-700 bg-brand-50' : 'border-line text-ink hover:border-ink'
                    }`}
                  aria-label="Wishlist toggle"
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <Link
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="text-brand-700 hover:text-brand-900 font-medium underline"
                >
                  View Full Specifications & Reviews →
                </Link>
                <span className="text-[11px] text-ink-muted">Free Shipping across India</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;

