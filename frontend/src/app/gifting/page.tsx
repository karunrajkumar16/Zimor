'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Gift, Check, Package } from 'lucide-react';
import { GIFTING_OCCASIONS, GIFT_SERVICES } from '@/data/gifting';
import { getProductBySlug } from '@/data/products';
import { ProductCard } from '@/components/product/ProductCard';

export default function GiftingPage() {
  const [selectedOccasionId, setSelectedOccasionId] = useState<string>(GIFTING_OCCASIONS[0].id);

  const activeOccasion = GIFTING_OCCASIONS.find((o) => o.id === selectedOccasionId) || GIFTING_OCCASIONS[0];
  const recommendedBags = activeOccasion.recommendedSlugs
    .map((slug) => getProductBySlug(slug))
    .filter(Boolean);

  return (
    <div className="bg-canvas min-h-screen py-10 sm:py-16 border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-[11px] text-ink-muted uppercase tracking-wider flex items-center gap-2 mb-6">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <span className="text-ink font-semibold">Gifts & Occasions</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs uppercase tracking-widest text-brand-700 font-bold bg-brand-50 border border-brand-200 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5" />
            <span>Zimor Signature Gifting Concierge</span>
          </span>
          <h1 className="font-serif text-[34px] sm:text-[46px] lg:text-[52px] font-normal text-ink tracking-tight leading-tight">
            Gifts of Enduring Elegance
          </h1>
          <p className="text-xs sm:text-base text-ink-secondary leading-relaxed">
            From celebrating boardroom promotions and new entrepreneurial ventures to birthdays, anniversaries, and graduations — give a timeless piece she will carry every single day.
          </p>
        </div>

        {/* Gifting Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {GIFT_SERVICES.map((serv) => (
            <div
              key={serv.title}
              className="bg-canvas-card border border-line rounded p-5 space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                  {serv.badge}
                </span>
                <Package className="w-4 h-4 text-ink-muted" />
              </div>
              <h3 className="text-xs font-bold text-ink">{serv.title}</h3>
              <p className="text-[11px] text-ink-secondary leading-relaxed">
                {serv.description}
              </p>
            </div>
          ))}
        </div>

        {/* Occasion Switcher */}
        <div className="border-t border-line pt-12">
          <div className="text-center mb-8 space-y-1">
            <p className="text-xs uppercase tracking-widest text-brand-700 font-bold">
              Find the Perfect Match
            </p>
            <h2 className="font-serif text-[28px] sm:text-[36px] font-normal text-ink tracking-tight">
              Shop Gifts by Occasion
            </h2>
          </div>

          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
            {GIFTING_OCCASIONS.map((occ) => (
              <button
                key={occ.id}
                type="button"
                onClick={() => setSelectedOccasionId(occ.id)}
                className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedOccasionId === occ.id
                    ? 'bg-brand-700 text-white shadow-sm'
                    : 'bg-canvas-card border border-line text-ink-secondary hover:text-ink hover:border-ink/40'
                }`}
              >
                {occ.title.split('&')[0].trim()}
              </button>
            ))}
          </div>

          {/* Active Occasion Showcase */}
          <div className="bg-canvas-card rounded-lg border border-line p-6 sm:p-10 mb-12 shadow-subtle grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-block text-[11px] font-bold text-brand-700 uppercase tracking-widest">
                Ideal For: {activeOccasion.idealFor}
              </span>
              <h3 className="font-serif text-[26px] sm:text-[32px] font-normal text-ink tracking-tight">
                {activeOccasion.title}
              </h3>
              <p className="text-sm font-semibold text-brand-800">
                {activeOccasion.subtitle}
              </p>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                {activeOccasion.description}
              </p>

              <div className="pt-2 border-t border-line space-y-2 text-xs text-ink-secondary">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Complimentary signature gift box with grosgrain ribbon included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Free handwritten note card included with your personalized message</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Price tags concealed; digital receipt emailed to you</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative aspect-4/3 rounded-lg overflow-hidden border border-line bg-canvas-alt shadow-sm">
              <Image
                src={activeOccasion.image}
                alt={activeOccasion.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Recommended Handbags for this Occasion */}
          <div className="space-y-6">
            <h3 className="text-xl font-serif font-bold text-ink">
              Recommended Gifts for {activeOccasion.title}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedBags.map((bag) => (
                bag && <ProductCard key={bag.id} product={bag} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

