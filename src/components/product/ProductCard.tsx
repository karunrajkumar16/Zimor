'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Eye } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
}) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const discountPercent = Math.round(
    ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
  );

  const inWishlist = isInWishlist(product.id);

  // Clean model title and subtitle matching reference style
  const getProductDisplayMeta = () => {
    if (product.id.includes('delo')) {
      const isNoir = product.id.includes('noir');
      return {
        title: 'Delo Tote',
        subtitle: isNoir ? 'Noir Black Executive' : 'Rust Caramel with Wristlet',
      };
    }
    if (product.id.includes('rabota')) {
      const isEspresso = product.id.includes('espresso');
      return {
        title: 'Rabota Tote',
        subtitle: isEspresso ? 'Espresso Roast Commuter' : 'Cognac Brown Dual-Carry',
      };
    }
    if (product.id.includes('classic')) {
      const isTan = product.id.includes('tan') || product.id.includes('cherry');
      return {
        title: 'Classic Shoulder Bag',
        subtitle: isTan ? 'Saddle Tan with Gold Clasp' : 'Cream Canvas Crescent',
      };
    }
    return {
      title: product.name,
      subtitle: product.defaultColor || product.tagline,
    };
  };

  const { title, subtitle } = getProductDisplayMeta();

  return (
    <div className="group flex flex-col relative bg-transparent overflow-hidden transition-all duration-300">
      {/* Visual Image Container — Clean neutral light background matching reference */}
      <div
        className="relative w-full aspect-square bg-[#F6F6F6] rounded-xs overflow-hidden flex items-center justify-center min-h-[220px] sm:min-h-[280px]"
        style={{ aspectRatio: '1 / 1' }}
      >
        <Link href={`/product/${product.slug}`} className="block w-full h-full relative">
          <Image
            src={product.images[selectedImageIndex]?.url || product.images[0]?.url}
            alt={product.images[selectedImageIndex]?.alt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 sm:p-6 md:p-7 transition-transform duration-500 ease-out group-hover:scale-105"
          />
          {product.images.length > 1 && (
            <Image
              src={product.images[1]?.url}
              alt={`${product.name} alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-4 sm:p-6 md:p-7 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
            />
          )}
        </Link>

        {/* Top Left: Clean Red Discount Text (matching reference "20% OFF") */}
        {discountPercent > 0 && (
          <div className="absolute top-3 left-3 sm:top-3.5 sm:left-3.5 z-10 pointer-events-none">
            <span className="text-[#BA3C3C] text-[11px] sm:text-xs font-semibold tracking-wider uppercase font-sans">
              {discountPercent}% OFF
            </span>
          </div>
        )}

        {/* Top Right: Delicate Outline Heart Icon (matching reference "♡") */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 z-10 text-ink/80 hover:text-ink transition-colors p-1"
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.4] transition-all ${
              inWishlist ? 'fill-[#BA3C3C] text-[#BA3C3C]' : 'text-ink/80 hover:text-ink'
            }`}
          />
        </button>

        {/* Bottom Right: Quick Actions */}
        <div className="absolute bottom-3 right-3 sm:bottom-3.5 sm:right-3.5 z-10 flex items-center gap-1.5">
          {onQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] hidden sm:flex items-center justify-center text-ink hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
              aria-label={`Quick view ${product.name}`}
              title="Quick view"
            >
              <Eye className="w-4 h-4 text-ink" />
            </button>
          )}

          {/* White Floating Circular Quick-Add Button with Bag+ Icon */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addItem(product, 1);
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] flex items-center justify-center text-ink hover:scale-110 active:scale-95 transition-all group/btn"
            aria-label={`Add ${product.name} to bag`}
            title="Quick add to bag"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-ink group-hover/btn:text-[#BA3C3C] transition-colors"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h7" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
              <line x1="19" y1="13" x2="19" y2="21" />
              <line x1="15" y1="17" x2="23" y2="17" />
            </svg>
          </button>
        </div>
      </div>

      {/* Details Container below Image Container */}
      <div className="pt-2.5 sm:pt-3 space-y-0.5">
        {/* Line 1: Product Name */}
        <Link
          href={`/product/${product.slug}`}
          className="block text-sm sm:text-[15px] font-medium text-ink hover:text-brand-700 transition-colors line-clamp-1"
        >
          {title}
        </Link>

        {/* Line 2: Subtitle / Colorway name */}
        <p className="text-xs sm:text-[13px] text-ink-muted line-clamp-1">
          {subtitle}
        </p>

        {/* Line 3: Price (left) and Color Swatches + Count (right) */}
        <div className="flex items-center justify-between pt-1">
          {/* Prices: Strikethrough original + Red discounted price */}
          <div className="flex items-baseline gap-1.5 font-sans">
            <span className="text-xs sm:text-[13px] text-ink-faint line-through">
              ₹{product.compareAtPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-xs sm:text-[13px] font-semibold text-[#BA3C3C]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Color Swatch Dots + Count */}
          <div className="flex items-center gap-1.5">
            {product.colors.map((color, idx) => (
              <button
                key={color.name}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedImageIndex(idx % product.images.length);
                }}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border transition-transform ${
                  selectedImageIndex === idx % product.images.length
                    ? 'ring-1 ring-offset-1 ring-ink border-white scale-110'
                    : 'border-black/20 hover:scale-125'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
                aria-label={`Select color ${color.name}`}
              />
            ))}
            <span className="text-[10px] sm:text-[11px] text-ink-muted font-sans font-normal ml-0.5">
              +{product.colors.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
