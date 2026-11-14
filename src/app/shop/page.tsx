'use client';

import React, { useState, useMemo, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  Grid,
  LayoutGrid,
  ArrowRight,
  Briefcase,
  Laptop,
  Sparkles,
  SlidersHorizontal,
  Check,
  RotateCcw,
} from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import { ProductCard } from '@/components/product/ProductCard';
import { QuickViewModal } from '@/components/product/QuickViewModal';
import { Product } from '@/types';

// Category name mapping for active filter display
const CATEGORY_NAMES: Record<string, string> = {
  'office-bags': 'Office Bags',
  'tote-bags': 'Tote Bags',
  'laptop-bags': 'Laptop Bags',
  'shoulder-bags': 'Shoulder Bags',
  'crossbody-bags': 'Crossbody Bags',
};

// Three Distinct Lifestyle & Profession Subsections with authentic editorial photography
const LIFESTYLE_SUBSECTIONS = [
  {
    id: "corporate-executive",
    number: "01",
    eyebrow: "Corporate • Legal • Executive",
    title: "Corporate & Executive",
    archetype: "The Boardroom Silhouette",
    tagline: "Structured Authority & Padded 15.6\" Laptop Protection",
    description: "Architectural structure, upright base studs, and dedicated 15.6\" laptop protection engineered for corporate leadership.",
    specs: [
      "Padded cradle for up to 15.6\" laptops",
      "5 solid brass protective bottom studs",
      "Matching detachable wristlet pouch included",
    ],
    horizontalImage: "/corporate-workspace-horizontal.jpg",
    editorialImage: "/corporate-executive-editorial.jpg",
    subtitleFilterText: "15.6\" Laptop Fit",
    icon: Briefcase,
    products: [
      PRODUCTS.find((p) => p.id === "zimor-delo-tote-rust") || PRODUCTS[0],
      PRODUCTS.find((p) => p.id === "zimor-delo-tote-noir") || PRODUCTS[1],
    ],
  },
  {
    id: "tech-transit",
    number: "02",
    eyebrow: "Tech • Founders • Commute",
    title: "Tech & Modern Commute",
    archetype: "The Dynamic Commute",
    tagline: "Dual-Carry Versatility with Detachable Crossbody Sling",
    description: "Dual-carry versatility with detachable 110cm crossbody sling, padded 15\" laptop sleeve, and 6 internal organizer pockets.",
    specs: [
      "Dedicated 15\" cushioned laptop cradle",
      "Dual grab handles + 110cm detachable sling",
      "Full-zip top closure + cosmetic pouch",
    ],
    horizontalImage: "/tech-commute-workspace-horizontal.jpg",
    editorialImage: "/tech-commute-editorial.jpg",
    subtitleFilterText: "15\" Dual-Carry Transit",
    icon: Laptop,
    products: [
      PRODUCTS.find((p) => p.id === "zimor-rabota-tote-cognac") || PRODUCTS[2],
      PRODUCTS.find((p) => p.id === "zimor-rabota-tote-espresso") || PRODUCTS[3],
    ],
  },
  {
    id: "creative-studio",
    number: "03",
    eyebrow: "Design • Studio • Evenings",
    title: "Creative & Studio",
    archetype: "The Sculptural Silhouette",
    tagline: "Sculptural French Curves & Contoured Shoulder Fit",
    description: "Sculptural curves, heavyweight French canvas, and luminous gold clasps designed for gallery afternoons and evening dinners.",
    specs: [
      "Fits iPad mini, Kindle & daily essentials",
      "Heavyweight French canvas with vegan leather trim",
      "Luminous gold-tone clasp & underarm contour",
    ],
    horizontalImage: "/artisan-heritage-landscape.jpg",
    editorialImage: "/brandgirl2.webp",
    subtitleFilterText: "Underarm Crescent Fit",
    icon: Sparkles,
    products: [
      PRODUCTS.find((p) => p.id === "zimor-classic-shoulder-bag-cream") || PRODUCTS[4],
      PRODUCTS.find((p) => p.id === "zimor-classic-shoulder-bag-tan") || PRODUCTS[5],
    ],
  },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialProfession = searchParams.get('profession') || 'all';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedProfession, setSelectedProfession] = useState<string>(initialProfession);
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [columns, setColumns] = useState<2 | 3>(3);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedProfession('all');
    setSelectedColor('all');
  };

  // Filter & Sort Logic covering all 6 products, categories, and professions
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // Category filter logic
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'office-bags') {
        result = result.filter((p) => p.id.startsWith('zimor-delo'));
      } else if (selectedCategory === 'tote-bags') {
        result = result.filter((p) => p.id.startsWith('zimor-delo') || p.id.startsWith('zimor-rabota'));
      } else if (selectedCategory === 'laptop-bags') {
        result = result.filter((p) => p.id.startsWith('zimor-rabota'));
      } else if (selectedCategory === 'shoulder-bags') {
        result = result.filter((p) => p.id.startsWith('zimor-classic'));
      } else if (selectedCategory === 'crossbody-bags') {
        result = result.filter((p) => p.id.startsWith('zimor-rabota') || p.id.startsWith('zimor-classic'));
      } else {
        result = result.filter((p) => p.category === selectedCategory);
      }
    }

    // Profession filter logic
    if (selectedProfession !== 'all') {
      if (selectedProfession === 'corporate-executive') {
        result = result.filter((p) => p.id.startsWith('zimor-delo'));
      } else if (selectedProfession === 'tech-transit' || selectedProfession === 'tech-founder') {
        result = result.filter((p) => p.id.startsWith('zimor-rabota'));
      } else if (selectedProfession === 'creative-studio' || selectedProfession === 'creative-director') {
        result = result.filter((p) => p.id.startsWith('zimor-classic'));
      } else {
        result = result.filter((p) => p.suitableProfessions.includes(selectedProfession));
      }
    }

    // Color filter logic
    if (selectedColor !== 'all') {
      result = result.filter((p) =>
        p.colors.some((c) => c.name.toLowerCase().includes(selectedColor.toLowerCase()))
      );
    }

    // Sort logic
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return result;
  }, [selectedCategory, selectedProfession, selectedColor, sortBy]);

  const hasActiveFilters =
    selectedCategory !== 'all' || selectedProfession !== 'all' || selectedColor !== 'all';

  // Human-readable active filter name
  const activeFilterTitle = useMemo(() => {
    if (selectedCategory !== 'all') {
      return CATEGORY_NAMES[selectedCategory] || selectedCategory;
    }
    if (selectedProfession !== 'all') {
      const match = LIFESTYLE_SUBSECTIONS.find((p) => p.id === selectedProfession);
      return match ? match.title : selectedProfession;
    }
    if (selectedColor !== 'all') {
      return `Color: ${selectedColor}`;
    }
    return '';
  }, [selectedCategory, selectedProfession, selectedColor]);

  return (
    <div className="bg-white text-ink min-h-screen">
      {/* =========================================================================
          SECTION 1: ALL PRODUCTS COLLECTION
          ========================================================================= */}
      <section className="pt-3 sm:pt-4 pb-14 sm:pb-20 bg-white" aria-label="All Products Collection">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav className="text-[11px] uppercase tracking-[0.2em] text-ink-muted flex items-center gap-2 mb-1.5 font-sans">
            <Link href="/" className="hover:text-ink transition-colors">
              Home
            </Link>
            <span className="text-line-dark">/</span>
            <span className="text-ink font-semibold">Collection</span>
          </nav>

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 sm:gap-4 mb-4 sm:mb-5">
            <div>
              <h1 className="font-serif text-[32px] sm:text-[40px] lg:text-[46px] font-normal text-ink tracking-tight leading-none">
                All Products Collection
              </h1>
              <p className="text-xs sm:text-[13px] text-ink-muted mt-1.5 max-w-2xl font-light leading-relaxed">
                Explore our full line-up of six handcrafted silhouettes. Built with shock-absorbing laptop compartments, upright base studs, and certified cruelty-free materials.
              </p>
            </div>
            <p className="text-xs text-ink-muted font-sans shrink-0">
              Showing <strong>{filteredProducts.length}</strong> of {PRODUCTS.length} silhouettes
            </p>
          </div>

          {/* Useful Filters & Sorting Bar */}
          <div className="bg-[#FAF8F5] border border-line rounded-lg p-3 sm:p-4 mb-6 sm:mb-8 flex flex-wrap items-center justify-between gap-3 sm:gap-4 shadow-xs">
            {/* Left Controls: Category Pills & Dropdown Refinements */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-ink-muted font-medium pr-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-brand-700" />
                <span className="hidden sm:inline">Filter:</span>
              </div>

              {/* Quick Category Buttons */}
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-ink text-white shadow-xs'
                    : 'bg-white border border-line text-ink-secondary hover:text-ink'
                }`}
              >
                All ({PRODUCTS.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('tote-bags')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'tote-bags'
                    ? 'bg-ink text-white shadow-xs'
                    : 'bg-white border border-line text-ink-secondary hover:text-ink'
                }`}
              >
                Totes (4)
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('laptop-bags')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'laptop-bags'
                    ? 'bg-ink text-white shadow-xs'
                    : 'bg-white border border-line text-ink-secondary hover:text-ink'
                }`}
              >
                Laptop Bags (2)
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('shoulder-bags')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'shoulder-bags'
                    ? 'bg-ink text-white shadow-xs'
                    : 'bg-white border border-line text-ink-secondary hover:text-ink'
                }`}
              >
                Shoulder Bags (2)
              </button>

              {/* Color Dropdown */}
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="bg-white border border-line px-3 py-1.5 rounded-full text-ink text-xs focus:outline-none focus:border-ink transition-colors cursor-pointer"
                aria-label="Filter by color variation"
              >
                <option value="all">All Colors</option>
                <option value="Rust">Rust Caramel</option>
                <option value="Noir">Noir Black</option>
                <option value="Cognac">Cognac Brown</option>
                <option value="Espresso">Espresso Roast</option>
                <option value="Cream">Cream Canvas</option>
                <option value="Saddle">Saddle Tan</option>
              </select>

              {/* Reset active filters */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1 text-xs text-[#BA3C3C] hover:underline font-medium ml-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Right Controls: Sort Dropdown & Column Toggle */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <label htmlFor="shop-sort" className="text-ink-muted hidden sm:inline">
                  Sort:
                </label>
                <select
                  id="shop-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-line text-xs py-1.5 px-3 rounded-full text-ink focus:outline-none focus:border-ink transition-colors cursor-pointer"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated (4.8+)</option>
                </select>
              </div>

              {/* 2 or 3 Column Grid Toggle */}
              <div className="hidden sm:flex items-center border border-line rounded-full bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setColumns(2)}
                  className={`p-1.5 rounded-full transition-colors ${
                    columns === 2 ? 'bg-ink text-white shadow-xs' : 'text-ink-muted hover:text-ink'
                  }`}
                  title="2 Columns (Editorial)"
                  aria-label="2 Columns"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setColumns(3)}
                  className={`p-1.5 rounded-full transition-colors ${
                    columns === 3 ? 'bg-ink text-white shadow-xs' : 'text-ink-muted hover:text-ink'
                  }`}
                  title="3 Columns (Grid)"
                  aria-label="3 Columns"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Banner when filters are applied */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between p-3 sm:p-3.5 mb-6 rounded-md bg-[#FAF8F5] border border-line/80">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-ink-muted">Filtered by:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-ink bg-white px-2.5 py-0.5 rounded-full border border-line">
                  {activeFilterTitle}
                  <button type="button" onClick={clearAllFilters} aria-label="Clear filter">
                    <X className="w-3 h-3 text-ink-muted hover:text-ink" />
                  </button>
                </span>
                <span className="text-ink-muted">({filteredProducts.length} silhouettes found)</span>
              </div>
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-semibold text-brand-700 hover:underline"
              >
                View All 6 Silhouettes →
              </button>
            </div>
          )}

          {/* Clean Product Grid: All 6 Unique Products */}
          {filteredProducts.length > 0 ? (
            <div
              className={`grid gap-5 sm:gap-7 lg:gap-8 ${
                columns === 2 ? 'grid-cols-2 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-3'
              }`}
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 sm:py-20 bg-[#FAF8F5] rounded-lg border border-line space-y-4">
              <h2 className="text-lg font-serif font-normal text-ink">
                No silhouettes match your selected filters
              </h2>
              <p className="text-xs text-ink-muted max-w-md mx-auto font-light">
                Reset your filter criteria to display the full permanent collection of six bags.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 bg-ink text-white text-xs font-semibold uppercase tracking-[0.16em] py-2.5 px-6 rounded-full hover:bg-ink/85 transition-colors"
              >
                <span>Reset Filters</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: SHOP BY PROFESSION & LIFESTYLE
          ========================================================================= */}
      <section className="pt-14 sm:pt-20 pb-16 sm:pb-24 bg-[#FAF8F5] border-t border-line" aria-label="Shop by Profession and Lifestyle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Section Header */}
          <div className="mb-12 sm:mb-16">
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-brand-700 font-bold mb-1.5 font-sans">
              Curated For Your Workday
            </p>
            <h2 className="font-serif text-[34px] sm:text-[42px] lg:text-[48px] font-normal text-ink tracking-tight leading-none">
              Shop by Profession &amp; Lifestyle
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-2 max-w-2xl font-light leading-relaxed">
              Three distinct carry archetypes engineered with specific tech dimensions, internal partitions, and ergonomic drops. Explore the curated silhouettes for each lifestyle below.
            </p>
          </div>

          {/* Subsections: Asymmetric 3-Part Grid (Top-Left, Bottom-Left, Half-Right) */}
          <div className="space-y-16 sm:space-y-24">
            {LIFESTYLE_SUBSECTIONS.map((subsection) => {
              const IconComp = subsection.icon;

              return (
                <div key={subsection.id} className="pt-8 sm:pt-10 border-t border-line/70">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-stretch">
                    {/* LEFT HALF (lg:col-span-6): TOP LEFT HORIZONTAL FRAMELESS IMAGE + BOTTOM LEFT PRODUCT CARDS */}
                    <div className="lg:col-span-6 flex flex-col justify-between space-y-6 sm:space-y-8">
                      {/* TOP LEFT: ONE HORIZONTAL FRAMELESS IMAGE OVERLAID WITH CINEMATIC HEADING & CONCISE DESCRIPTION */}
                      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-[16/9] min-h-[220px] sm:min-h-[250px] overflow-hidden border-0 bg-ink group rounded-none">
                        <Image
                          src={subsection.horizontalImage}
                          alt={`${subsection.title} Workspace`}
                          fill
                          priority={subsection.id === "corporate-executive"}
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-102"
                        />
                        {/* Cinematic Lighting Scrims */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/25 pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent pointer-events-none" />

                        {/* Overlaid Cinematic Content */}
                        <div className="absolute inset-0 p-5 sm:p-7 lg:p-8 flex flex-col justify-end text-white z-10">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[10px] uppercase tracking-[0.22em] font-sans font-semibold">
                              <IconComp className="w-3.5 h-3.5 text-[#E8D8C8]" />
                              <span>{subsection.title}</span>
                            </span>
                            <span className="text-white/60 text-[11px] font-serif italic hidden sm:inline">
                              Archetype {subsection.number}
                            </span>
                          </div>

                          <h3 className="font-serif text-[24px] sm:text-[30px] lg:text-[34px] font-normal text-white tracking-tight leading-[1.1] mb-1.5 sm:mb-2">
                            {subsection.archetype}
                          </h3>

                          <p className="text-xs sm:text-[13px] text-white/85 leading-relaxed font-light max-w-lg mb-3">
                            {subsection.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {subsection.specs.map((spec, specIdx) => (
                              <span
                                key={specIdx}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/95 text-[10px] sm:text-[11px] font-sans"
                              >
                                <Check className="w-3.5 h-3.5 text-[#E8D8C8]" />
                                <span>{spec}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* BOTTOM LEFT: DISPLAY THE TWO MATCHING PRODUCT CARDS (EXISTING CARD DESIGN) */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-line pb-2">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-brand-700 font-bold font-sans">
                            Matching Silhouettes
                          </p>
                          <p className="text-[11px] text-ink-muted font-sans">
                            Showing {subsection.products.length} models · {subsection.subtitleFilterText}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3.5 sm:gap-5">
                          {subsection.products.map((product) => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              onQuickView={(p) => setQuickViewProduct(p)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT HALF (lg:col-span-6): FULL HEIGHT BORDERLESS IMAGE COVERING RIGHT HALF */}
                    <div className="lg:col-span-6 relative w-full h-full min-h-[480px] sm:min-h-[560px] lg:min-h-[660px] overflow-hidden border-0 bg-ink group rounded-none">
                      <Image
                        src={subsection.editorialImage}
                        alt={`${subsection.title} - ${subsection.archetype}`}
                        fill
                        priority={subsection.id === "corporate-executive"}
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover object-[center_24%] transition-transform duration-1000 ease-out group-hover:scale-102"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                      {/* Floating Base Badge */}
                      <div className="absolute bottom-5 left-5 right-5 z-10 text-white">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/95 text-[10px] uppercase tracking-[0.2em] font-sans font-semibold border border-white/20">
                          <IconComp className="w-3.5 h-3.5 text-[#E8D8C8]" />
                          <span>{subsection.archetype} · Full Height Editorial</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-ink-muted">Loading collection...</div>}>
      <ShopContent />
    </Suspense>
  );
}
