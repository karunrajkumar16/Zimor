'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { PROFESSIONS } from '@/data/professions';
import { getProductBySlug } from '@/data/products';
import { ProductCard } from '@/components/product/ProductCard';

export default function ProfessionPage() {
  const [activeTab, setActiveTab] = useState<string>(PROFESSIONS[0].id);

  const activeProf = PROFESSIONS.find((p) => p.id === activeTab) || PROFESSIONS[0];
  const bags = activeProf.recommendedBagSlugs
    .map((slug) => getProductBySlug(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="bg-canvas min-h-screen py-10 sm:py-16 border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-[11px] text-ink-muted uppercase tracking-wider flex items-center gap-2 mb-6">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <span className="text-ink font-semibold">Shop by Profession</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs uppercase tracking-widest text-brand-700 font-bold bg-brand-50 border border-brand-200 px-3 py-1 rounded-full">
            Ergonomic Professional Curation
          </span>
          <h1 className="font-serif text-[34px] sm:text-[46px] lg:text-[52px] font-normal text-ink tracking-tight leading-tight">
            Designed for the Way You Work
          </h1>
          <p className="text-xs sm:text-base text-ink-secondary leading-relaxed">
            Every career has unique carry demands — from protecting 15.6" laptops and confidential legal dossiers to carrying tech accessories, tablets, and cosmetic touch-ups. Discover the exact Zimor silhouette tailored for your professional day.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-12 scrollbar-none">
          {PROFESSIONS.map((prof) => (
            <button
              key={prof.id}
              type="button"
              onClick={() => setActiveTab(prof.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === prof.id
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'bg-canvas-card border border-line text-ink-secondary hover:text-ink hover:border-ink/40'
              }`}
            >
              {prof.name}
            </button>
          ))}
        </div>

        {/* Active Profession Detailed Presentation */}
        <div key={activeProf.id} className="space-y-12 animate-in fade-in duration-300">
          {/* Profile Card */}
          <div className="bg-canvas-card rounded-lg border border-line p-6 sm:p-10 shadow-subtle grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-block px-3 py-1 bg-brand-50 border border-brand-200 rounded text-[11px] font-semibold text-brand-800 uppercase tracking-wider">
                {activeProf.badge}
              </span>
              <h2 className="font-serif text-[28px] sm:text-[36px] font-normal text-ink tracking-tight">
                {activeProf.title}
              </h2>
              <p className="text-sm font-medium text-brand-800">
                {activeProf.tagline}
              </p>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                {activeProf.description}
              </p>

              {/* Essentials Checklist */}
              <div className="pt-3 border-t border-line">
                <p className="text-xs font-bold uppercase tracking-wider text-ink mb-3">
                  Your Everyday Workday Essentials:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink-secondary">
                  {activeProf.essentialsCarried.map((ess) => (
                    <div key={ess} className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                      <span>{ess}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="lg:col-span-5 relative aspect-4/3 sm:aspect-16/10 lg:aspect-square rounded-lg border border-line overflow-hidden bg-canvas-alt shadow-sm">
              <Image
                src={activeProf.image}
                alt={activeProf.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Recommended Handbags for this Profession */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h3 className="font-serif text-[22px] sm:text-[28px] font-normal text-ink tracking-tight">
                  Recommended Silhouettes for {activeProf.name}
                </h3>
                <p className="text-xs text-ink-muted">
                  Tailored capacity, drop height, and compartments for your workflow
                </p>
              </div>
              <Link
                href={`/shop?profession=${activeProf.id}`}
                className="text-xs font-semibold text-brand-700 hover:text-brand-900 underline"
              >
                Filter in Shop →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bags.map((bag) => (
                <ProductCard key={bag.id} product={bag} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

