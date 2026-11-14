'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { Product } from '@/types';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const discountPercent = Math.round(
    ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
  );

  const inWishlist = isInWishlist(product.id);

  // Clean model title matching reference style
  const getProductDisplayTitle = () => {
    if (product.id.includes('delo')) {
      return product.id.includes('noir') ? 'Delo Tote — Noir' : 'Delo Tote';
    }
    if (product.id.includes('rabota')) {
      return product.id.includes('espresso') ? 'Rabota Tote — Espresso' : 'Rabota Tote';
    }
    if (product.id.includes('classic')) {
      return product.id.includes('tan') ? 'Classic Shoulder Bag — Tan' : 'Classic Shoulder Bag';
    }
    return product.name;
  };

  const title = getProductDisplayTitle();

  return (
    <div className="group flex flex-col relative bg-transparent transition-all duration-300">
      {/* Frameless Studio Image Canvas — Louis Vuitton Reference Style */}
      <div className="relative w-full aspect-square sm:aspect-[4/5] bg-white overflow-hidden flex items-center justify-center">
        <Link href={`/product/${product.slug}`} className="block w-full h-full relative" aria-label={`View ${product.name}`}>
          <Image
            src={product.images[selectedImageIndex]?.url || product.images[0]?.url}
            alt={product.images[selectedImageIndex]?.alt || product.name}
            fill
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3.5 sm:p-5 lg:p-6 transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {product.images.length > 1 && (
            <Image
              src={product.images[1]?.url}
              alt={`${product.name} alternate view`}
              fill
              loading="lazy"
              decoding="async"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-3.5 sm:p-5 lg:p-6 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
            />
          )}
        </Link>

        {/* Top Right: Delicate Minimalist Outline Heart Icon */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-10 text-ink/80 hover:text-ink transition-colors p-1"
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 stroke-[1.2] transition-all ${inWishlist ? 'fill-zimor-orange text-zimor-orange' : 'text-ink/80 hover:text-ink'
              }`}
          />
        </button>
      </div>

      {/* Details Container Below Image — Clean LV Reference Hierarchy */}
      <div className="pt-2 sm:pt-3 space-y-0.5">
        {/* Line 1: Discount Badge / Status Tag (LV Reference Style) */}
        {discountPercent > 0 && (
          <p className="text-[10px] sm:text-[11px] font-primary font-medium uppercase tracking-wider text-zimor-orange leading-none">
            {discountPercent}% OFF
          </p>
        )}

        {/* Line 2: Product Name */}
        <Link
          href={`/product/${product.slug}`}
          className="block text-xs sm:text-[13.5px] font-primary font-normal text-ink hover:text-brand-700 transition-colors truncate leading-tight"
        >
          {title}
        </Link>

        {/* Line 3: Price (left) and Color Swatches (right on desktop) */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-baseline gap-1.5 font-secondary">
            <span className="text-xs sm:text-[13px] font-bold text-ink">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <span className="text-[10.5px] sm:text-xs text-ink-muted line-through font-normal">
              ₹{product.compareAtPrice.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Desktop Subtle Color Swatches (LV Reference Style) */}
          <div className="hidden sm:flex items-center gap-1">
            {product.colors.map((color, idx) => (
              <button
                key={color.name}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedImageIndex(idx % product.images.length);
                }}
                className={`w-2 h-2 rounded-full border transition-transform ${selectedImageIndex === idx % product.images.length
                  ? 'ring-1 ring-offset-1 ring-ink border-white scale-110'
                  : 'border-black/20 hover:scale-125'
                  }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
                aria-label={`Select color ${color.name}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
