'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Product } from '@/types';
import { PRODUCTS } from '@/data/products';
import { ProductCard } from '@/components/product/ProductCard';

const QuickViewModal = dynamic(
  () => import('@/components/product/QuickViewModal'),
  { ssr: false }
);

// Curated 4 flagship silhouettes representing all Zimor silhouettes
const FEATURED_PRODUCTS: Product[] = [
  PRODUCTS.find((p) => p.id === 'zimor-delo-tote-rust') || PRODUCTS[0],
  PRODUCTS.find((p) => p.id === 'zimor-rabota-tote-cognac') || PRODUCTS[2],
  PRODUCTS.find((p) => p.id === 'zimor-classic-shoulder-bag-cream') || PRODUCTS[4],
  PRODUCTS.find((p) => p.id === 'zimor-delo-tote-noir') || PRODUCTS[1],
];

export const FeaturedProducts: React.FC = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  // Synchronize mobile active index on scroll
  const handleScroll = () => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    if (scrollWidth > clientWidth) {
      const cardWidth = trackRef.current.children[0]?.clientWidth || clientWidth * 0.48;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveMobileIndex(Math.min(FEATURED_PRODUCTS.length - 1, Math.max(0, index)));
    }
  };

  const scrollToProduct = (index: number) => {
    if (!trackRef.current) return;
    const targetCard = trackRef.current.children[index] as HTMLElement;
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      setActiveMobileIndex(index);
    }
  };

  const handlePrev = () => {
    const nextIndex = Math.max(0, activeMobileIndex - 1);
    scrollToProduct(nextIndex);
  };

  const handleNext = () => {
    const nextIndex = Math.min(FEATURED_PRODUCTS.length - 1, activeMobileIndex + 1);
    scrollToProduct(nextIndex);
  };

  return (
    <section className="pt-8 sm:pt-14 pb-10 sm:pb-16 bg-white" aria-label="Our Collection">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Left/Right Selectable Controls on Mobile */}
        <div className="flex items-end justify-between mb-4 sm:mb-8">
          <div>
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-brand-700 font-bold mb-1 font-primary">
              Curated Silhouettes
            </p>
            <h2 className="font-primary text-2xl sm:text-3xl lg:text-4xl font-normal text-ink tracking-tight leading-none">
              Our Collection
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Left & Right Selectable Buttons */}
            <div className="flex lg:hidden items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                disabled={activeMobileIndex === 0}
                className={`w-8 h-8 rounded-full border border-line flex items-center justify-center text-ink transition-all ${activeMobileIndex === 0
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:border-black hover:bg-canvas-card active:scale-95'
                  }`}
                aria-label="Previous product"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={activeMobileIndex >= FEATURED_PRODUCTS.length - 2}
                className={`w-8 h-8 rounded-full border border-line flex items-center justify-center text-ink transition-all ${activeMobileIndex >= FEATURED_PRODUCTS.length - 2
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:border-black hover:bg-canvas-card active:scale-95'
                  }`}
                aria-label="Next product"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop View All Link */}
            <Link
              href="/shop"
              className="hidden sm:inline-flex items-center gap-1.5 font-primary text-xs sm:text-sm font-medium tracking-normal text-ink hover:text-brand-700 transition-colors shrink-0"
            >
              <span>View All Bags</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Product Display:
            - Mobile: Horizontal swipeable & selectable carousel showing 1-2 products at a time
            - Desktop: Full 4-Column Luxury Grid (lg:grid lg:grid-cols-4) */}
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex lg:grid lg:grid-cols-4 overflow-x-auto lg:overflow-visible snap-x snap-mandatory scroll-smooth no-scrollbar gap-3 sm:gap-5 lg:gap-7 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x pan-y',
            overscrollBehaviorX: 'contain',
          }}
        >
          {FEATURED_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="w-[47vw] min-w-[165px] max-w-[215px] sm:w-[32vw] lg:w-auto lg:max-w-none shrink-0 snap-start"
            >
              <ProductCard
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            </div>
          ))}
        </div>

        {/* Mobile Slide Position Indicators (Dots) */}
        <div className="flex lg:hidden items-center justify-center gap-1.5 mt-3 mb-2">
          {FEATURED_PRODUCTS.map((product, idx) => (
            <button
              key={'dot-' + product.id}
              type="button"
              onClick={() => scrollToProduct(idx)}
              className={`transition-all duration-300 rounded-full ${activeMobileIndex === idx
                ? 'w-5 h-1 bg-ink'
                : 'w-1 h-1 bg-line hover:bg-ink-muted'
                }`}
              aria-label={`Go to product ${idx + 1}`}
            />
          ))}
        </div>

        {/* View All CTA Button — Mobile & Desktop */}
        <div className="mt-8 sm:mt-14 text-center">
          <Link
            href="/shop"
            className="group inline-flex items-center justify-center gap-2 px-7 py-3 sm:px-12 sm:py-4 rounded-full border border-ink text-ink hover:bg-ink hover:text-white transition-all duration-300 font-primary text-xs sm:text-sm font-medium tracking-normal shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>View All Bags ({PRODUCTS.length})</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <p className="text-[10px] sm:text-xs text-ink-muted mt-3 uppercase tracking-wider font-secondary">
            Complimentary Express Shipping Across India • 7-Day Easy Returns • COD Available
          </p>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </section>
  );
};
