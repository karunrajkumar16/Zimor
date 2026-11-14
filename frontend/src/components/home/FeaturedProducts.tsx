'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import { PRODUCTS } from '@/data/products';
import { ProductCard } from '@/components/product/ProductCard';
import { QuickViewModal } from '@/components/product/QuickViewModal';

// Curated 4 flagship silhouettes representing all Zimor silhouettes
const FEATURED_PRODUCTS: Product[] = [
  PRODUCTS.find((p) => p.id === 'zimor-delo-tote-rust') || PRODUCTS[0],
  PRODUCTS.find((p) => p.id === 'zimor-rabota-tote-cognac') || PRODUCTS[2],
  PRODUCTS.find((p) => p.id === 'zimor-classic-shoulder-bag-cream') || PRODUCTS[4],
  PRODUCTS.find((p) => p.id === 'zimor-delo-tote-noir') || PRODUCTS[1],
];

export const FeaturedProducts: React.FC = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  return (
    <section className="pt-8 sm:pt-16 pb-10 sm:pb-16 bg-white" aria-label="Our Collection">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header — Left Aligned, Clean & Compact */}
        <div className="mb-4 sm:mb-8">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-brand-700 font-bold mb-1 font-sans">
            Curated Silhouettes
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-ink tracking-tight leading-none">
            Our Collection
          </h2>
        </div>

        {/* Curated 4 Product Grid (4 columns on desktop, 2 columns on mobile/tablet) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 lg:gap-7">
          {FEATURED_PRODUCTS.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>

        {/* View All CTA Button — Redirects to full catalogue */}
        <div className="mt-12 sm:mt-16 text-center">
          <Link
            href="/shop"
            className="group inline-flex items-center justify-center gap-2.5 px-8 py-3.5 sm:px-12 sm:py-4 rounded-full border border-ink text-ink hover:bg-ink hover:text-white transition-all duration-300 font-sans text-[13.5px] sm:text-sm font-medium tracking-normal shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>View All Bags</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
          <p className="text-[11px] sm:text-xs text-ink-muted mt-3.5 uppercase tracking-wider font-sans">
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

