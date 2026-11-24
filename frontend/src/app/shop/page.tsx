'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  Grid,
  LayoutGrid,
  Briefcase,
  Laptop,
  Sparkles,
  SlidersHorizontal,
  Check,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';
import { useProducts } from '@/context/ProductContext';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/types';
import QuickViewModal from '@/components/product/QuickViewModal';

// Category name mapping for active filter display
const CATEGORY_NAMES: Record<string, string> = {
  'office-bags': 'Office Bags',
  'tote-bags': 'Tote Bags',
  'laptop-bags': 'Laptop Bags',
  'shoulder-bags': 'Shoulder Bags',
  'crossbody-bags': 'Crossbody Bags',
};

// Three Distinct Lifestyle Subsections template metadata
const LIFESTYLE_BASE_CONFIG = [
  {
    id: "everyday",
    eyebrow: "EVERYDAY",
    title: "Everyday",
    archetype: "EVERYDAY",
    tagline: "For the everyday.",
    description: "Sleek crescent contours, refined underarm proportions, and luminous hardware engineered for effortless daily carrying and modern essentials.",
    specs: [
      "Fits iPad mini, phone & daily essentials",
      "Superior faux leather with refined trim",
      "Secure top zip & magnetic flap closure",
    ],
    horizontalImage: "https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917844/zimor/lifestyle/corporate-workspace-horizontal.webp",
    editorialImage: "https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917843/zimor/lifestyle/corporate-executive-editorial.webp",
    subtitleFilterText: "Everyday Carry · Classic Silhouette",
    icon: Sparkles,
    slugs: ["zimor-classic-shoulder-bag"],
  },
  {
    id: "work",
    eyebrow: "WORK",
    title: "Work",
    archetype: "WORK",
    tagline: "For what lies ahead.",
    description: "Dual-carry versatility with detachable sling, dedicated padded laptop protection up to 15.6\", and multi-compartment organization designed for focus and productivity.",
    specs: [
      "Dedicated 15.6\" cushioned laptop protection",
      "Dual grab handles + detachable crossbody sling",
      "Structured silhouette with protective base studs",
    ],
    horizontalImage: "https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917844/zimor/lifestyle/tech-commute-workspace-horizontal.webp",
    editorialImage: "https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917842/zimor/lifestyle/tech-commute-editorial.webp",
    subtitleFilterText: "Work & Focus · 15.6\" Laptop Totes",
    icon: Laptop,
    slugs: ["zimor-rabota-tote", "zimor-delo-tote"],
  },
  {
    id: "travel",
    eyebrow: "TRAVEL",
    title: "Travel",
    archetype: "TRAVEL",
    tagline: "For places beyond.",
    description: "Spacious capacity, secure top closures, and durable structured craftsmanship designed for weekend escapes, transit convenience, and journeys near and far.",
    specs: [
      "Spacious multi-compartment travel capacity",
      "Fits up to 15.6\" laptops & travel essentials",
      "Upright stability with solid protective bottom studs",
    ],
    horizontalImage: "https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917847/zimor/about/artisan-heritage-landscape.webp",
    editorialImage: "https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917845/zimor/lifestyle/brandgirl2.webp",
    subtitleFilterText: "Travel & Transit · Structured Totes",
    icon: Briefcase,
    slugs: ["zimor-rabota-tote", "zimor-delo-tote"],
  },
];

function ShopContent() {
  const { products } = useProducts();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialProfession = searchParams.get('profession') || 'all';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedProfession, setSelectedProfession] = useState<string>(initialProfession);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [columns, setColumns] = useState<2 | 3>(3);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedProfession('all');
  };

  // Lifestyle Subsections resolved dynamically against current products
  const lifestyleSubsections = useMemo(() => {
    return LIFESTYLE_BASE_CONFIG.map((cfg) => {
      const matched = cfg.slugs
        .map((slug) =>
          products.find(
            (p) =>
              p.slug === slug ||
              p.id === slug ||
              (slug === 'zimor-classic-shoulder-bag' && (p.slug === 'zimor-classic-shoulder-bag' || p.id === 'zimor-classic-shoulder-bag-cream')) ||
              (slug === 'zimor-rabota-tote' && (p.slug === 'zimor-rabota-tote' || p.id === 'zimor-rabota-tote-cognac')) ||
              (slug === 'zimor-delo-tote' && (p.slug === 'zimor-delo-tote' || p.id === 'zimor-delo-tote-rust'))
          )
        )
        .filter((p): p is Product => Boolean(p));

      // Fallback to first available products if exact slugs aren't matched
      const fallbackProducts = matched.length > 0 ? matched : products.slice(0, cfg.slugs.length);

      return {
        ...cfg,
        number: "",
        products: fallbackProducts,
      };
    });
  }, [products]);

  // Category counts calculated dynamically from live products
  const categoryCounts = useMemo(() => {
    const total = products.length;
    const totes = products.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      const catLabel = (p.categoryLabel || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      return cat === 'tote-bags' || catLabel.includes('tote') || name.includes('tote');
    }).length;

    const laptop = products.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      const catLabel = (p.categoryLabel || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      return cat === 'laptop-bags' || catLabel.includes('laptop') || Boolean(p.laptopCompatibility) || name.includes('laptop') || name.includes('rabota');
    }).length;

    const shoulder = products.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      const catLabel = (p.categoryLabel || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      return cat === 'shoulder-bags' || catLabel.includes('shoulder') || name.includes('shoulder') || name.includes('classic');
    }).length;

    return { total, totes, laptop, shoulder };
  }, [products]);

  // Filter & Sort Logic covering all live products, categories, and professions
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter logic
    if (selectedCategory !== 'all') {
      result = result.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        const catLabel = (p.categoryLabel || '').toLowerCase();
        const name = (p.name || '').toLowerCase();

        if (selectedCategory === 'office-bags') {
          return cat === 'office-bags' || cat === 'tote-bags' || catLabel.includes('office') || catLabel.includes('tote') || name.includes('delo') || name.includes('rabota');
        }
        if (selectedCategory === 'tote-bags') {
          return cat === 'tote-bags' || catLabel.includes('tote') || name.includes('tote');
        }
        if (selectedCategory === 'laptop-bags') {
          return cat === 'laptop-bags' || catLabel.includes('laptop') || Boolean(p.laptopCompatibility) || name.includes('laptop') || name.includes('rabota');
        }
        if (selectedCategory === 'shoulder-bags') {
          return cat === 'shoulder-bags' || catLabel.includes('shoulder') || name.includes('shoulder') || name.includes('classic');
        }
        if (selectedCategory === 'crossbody-bags') {
          return cat === 'crossbody-bags' || catLabel.includes('crossbody') || name.includes('crossbody');
        }
        return cat === selectedCategory || catLabel.includes(selectedCategory);
      });
    }

    // Profession / Lifestyle filter logic
    if (selectedProfession !== 'all') {
      if (selectedProfession === 'everyday' || selectedProfession === 'corporate-executive') {
        result = result.filter(
          (p) =>
            (p.slug && p.slug.startsWith('zimor-classic')) ||
            (p.id && p.id.startsWith('zimor-classic')) ||
            p.category === 'shoulder-bags' ||
            (p.suitableProfessions && p.suitableProfessions.includes(selectedProfession))
        );
      } else if (
        selectedProfession === 'work' ||
        selectedProfession === 'tech-transit' ||
        selectedProfession === 'tech-founder' ||
        selectedProfession === 'travel' ||
        selectedProfession === 'creative-studio' ||
        selectedProfession === 'creative-director'
      ) {
        result = result.filter(
          (p) =>
            (p.slug && (p.slug.startsWith('zimor-rabota') || p.slug.startsWith('zimor-delo'))) ||
            (p.id && (p.id.startsWith('zimor-rabota') || p.id.startsWith('zimor-delo'))) ||
            p.category === 'laptop-bags' ||
            p.category === 'tote-bags' ||
            (p.suitableProfessions && p.suitableProfessions.includes(selectedProfession))
        );
      } else {
        result = result.filter((p) => p.suitableProfessions && p.suitableProfessions.includes(selectedProfession));
      }
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
        result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'featured':
      default:
        result.sort((a, b) => {
          if (!a.isComingSoon && b.isComingSoon) return -1;
          if (a.isComingSoon && !b.isComingSoon) return 1;
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        });
        break;
    }

    return result;
  }, [products, selectedCategory, selectedProfession, sortBy]);

  const hasActiveFilters =
    selectedCategory !== 'all' || selectedProfession !== 'all';

  // Human-readable active filter name
  const activeFilterTitle = useMemo(() => {
    if (selectedCategory !== 'all') {
      return CATEGORY_NAMES[selectedCategory] || selectedCategory;
    }
    if (selectedProfession !== 'all') {
      const match = lifestyleSubsections.find((p) => p.id === selectedProfession);
      return match ? match.archetype : selectedProfession;
    }
    return '';
  }, [selectedCategory, selectedProfession, lifestyleSubsections]);

  // Smooth scroll to targeted lifestyle section (#everyday, #work, #travel, #lifestyle) on mount and hashchange
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const scrollToTarget = () => {
      const hash = window.location.hash ? window.location.hash.slice(1) : '';
      const sectionParam = searchParams.get('section') || '';

      let targetId = hash;
      if (!targetId && sectionParam) {
        if (sectionParam === 'everyday' || sectionParam === 'corporate-executive') targetId = 'everyday';
        else if (sectionParam === 'work' || sectionParam === 'tech-transit') targetId = 'work';
        else if (sectionParam === 'travel' || sectionParam === 'creative-studio') targetId = 'travel';
        else if (sectionParam === 'lifestyle' || sectionParam === 'profession') targetId = 'lifestyle';
        else targetId = sectionParam;
      }

      if (!targetId) return;

      let attempts = 0;
      const pollAndScroll = () => {
        const el =
          document.getElementById(targetId) ||
          (targetId === 'profession' ? document.getElementById('lifestyle') : null);

        if (el) {
          const header = document.querySelector('header');
          const headerHeight = header ? header.offsetHeight : 80;
          const rect = el.getBoundingClientRect();
          if (Math.abs(rect.top - headerHeight) > 4) {
            const targetScroll = rect.top + window.scrollY - headerHeight;
            window.scrollTo({ top: targetScroll, behavior: 'smooth' });
          }
        } else if (attempts < 25) {
          attempts++;
          setTimeout(pollAndScroll, 50);
        }
      };

      // Multiple ticks to ensure layout, images, and Lenis are stable
      setTimeout(pollAndScroll, 60);
      setTimeout(pollAndScroll, 250);
      setTimeout(pollAndScroll, 650);
    };

    scrollToTarget();
    window.addEventListener('hashchange', scrollToTarget);
    return () => window.removeEventListener('hashchange', scrollToTarget);
  }, [searchParams]);

  return (
    <div className="bg-white text-ink min-h-screen">
      {/* =========================================================================
          SECTION 1: ALL PRODUCTS COLLECTION
          ========================================================================= */}
      <section className="pt-3 sm:pt-4 pb-14 sm:pb-20 bg-white" aria-label="All Products Collection">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav className="text-[11px] uppercase tracking-[0.2em] text-ink-muted flex items-center gap-2 mb-1.5 font-secondary">
            <Link href="/" className="hover:text-ink transition-colors">
              Home
            </Link>
            <span className="text-ink-muted">/</span>
            <span className="text-ink font-semibold">Collection</span>
          </nav>

          {/* Section Header — Compact on Mobile */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-1 sm:gap-4 mb-3 sm:mb-5">
            <div>
              <h1 className="font-primary text-2xl sm:text-[40px] lg:text-[46px] font-normal text-ink tracking-tight leading-tight">
                All Products Collection
              </h1>
              <p className="hidden sm:block text-xs sm:text-[13px] text-ink-muted mt-1 max-w-2xl font-normal leading-relaxed">
                Explore our full line-up of six handcrafted silhouettes. Built with shock-absorbing laptop compartments, upright base studs, and certified cruelty-free materials.
              </p>
            </div>
            <p className="text-[11px] sm:text-xs text-ink-muted font-secondary shrink-0">
              Showing <strong>{filteredProducts.length}</strong> of {categoryCounts.total} silhouettes
            </p>
          </div>

          {/* Useful Filters & Sorting Bar — Borderless, Ultra-Clean & Perfectly Spaced */}
          <div className="mb-6 sm:mb-8 space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:bg-canvas sm:border sm:border-line sm:rounded-lg sm:p-4 sm:shadow-xs relative z-20">
            {/* Top Row / Scrollable Categories: Horizontal single line on mobile with zero scrollbar */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 py-1">
              <div className="hidden sm:flex items-center gap-1.5 text-ink-muted font-medium pr-1 text-xs shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-black" />
                <span>Filter:</span>
              </div>

              {/* Quick Category Buttons */}
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all ${selectedCategory === 'all'
                  ? 'bg-ink text-white shadow-xs'
                  : 'bg-white border border-line text-ink-secondary hover:text-ink hover:border-ink/40'
                  }`}
              >
                All ({categoryCounts.total})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('tote-bags')}
                className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all ${selectedCategory === 'tote-bags'
                  ? 'bg-ink text-white shadow-xs'
                  : 'bg-white border border-line text-ink-secondary hover:text-ink hover:border-ink/40'
                  }`}
              >
                Totes ({categoryCounts.totes})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('laptop-bags')}
                className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all ${selectedCategory === 'laptop-bags'
                  ? 'bg-ink text-white shadow-xs'
                  : 'bg-white border border-line text-ink-secondary hover:text-ink hover:border-ink/40'
                  }`}
              >
                Laptop Bags ({categoryCounts.laptop})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('shoulder-bags')}
                className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all ${selectedCategory === 'shoulder-bags'
                  ? 'bg-ink text-white shadow-xs'
                  : 'bg-white border border-line text-ink-secondary hover:text-ink hover:border-ink/40'
                  }`}
              >
                Shoulder Bags ({categoryCounts.shoulder})
              </button>

              {/* Reset active filters on Desktop */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="hidden sm:inline-flex items-center gap-1 text-xs text-black hover:text-[#b4b4b4] hover:underline font-medium ml-1 whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Mobile Secondary Row: Reset + Sort combined in a single clean hairline strip */}
            <div className="flex items-center justify-between gap-3 pt-2.5 sm:pt-0 border-t border-line/60 sm:border-0 text-xs">
              {/* Left Controls on Mobile: Inline Reset */}
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="sm:hidden inline-flex items-center gap-1 text-[11px] font-medium text-black bg-neutral-100 border border-[#b4b4b4] px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Right Controls: Sort Order (+ Desktop Grid Toggle) */}
              <div className="flex items-center gap-2 ml-auto sm:ml-0">
                <div className="relative inline-flex items-center">
                  <label htmlFor="shop-sort" className="text-ink-muted hidden sm:inline text-xs mr-1.5">
                    Sort:
                  </label>
                  <select
                    id="shop-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none bg-white border border-line text-xs py-1.5 pl-3 pr-7 rounded-full text-ink font-medium focus:outline-none focus:border-ink transition-colors cursor-pointer shadow-2xs"
                  >
                    <option value="featured">Featured First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Rated (4.8+)</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-ink-muted absolute right-2 pointer-events-none" />
                </div>

                {/* 2 or 3 Column Grid Toggle (Desktop Only) */}
                <div className="hidden sm:flex items-center border border-line rounded-full bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setColumns(2)}
                    className={`p-1.5 rounded-full transition-colors ${columns === 2 ? 'bg-ink text-white shadow-xs' : 'text-ink-muted hover:text-ink'
                      }`}
                    title="2 Columns (Editorial)"
                    aria-label="2 Columns"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setColumns(3)}
                    className={`p-1.5 rounded-full transition-colors ${columns === 3 ? 'bg-ink text-white shadow-xs' : 'text-ink-muted hover:text-ink'
                      }`}
                    title="3 Columns (Grid)"
                    aria-label="3 Columns"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filter Banner when filters are applied (Desktop Only to prevent mobile clutter) */}
          {hasActiveFilters && (
            <div className="hidden sm:flex items-center justify-between p-3 sm:p-3.5 mb-6 rounded-md bg-canvas border border-line/80">
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
                className="text-xs font-semibold text-black hover:text-[#b4b4b4] hover:underline"
              >
                View All 6 Silhouettes →
              </button>
            </div>
          )}

          {/* Clean Product Grid: All 6 Unique Products */}
          {filteredProducts.length > 0 ? (
            <div
              className={`grid gap-x-3.5 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:gap-x-8 lg:gap-y-14 relative z-10 ${columns === 2 ? 'grid-cols-2 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
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
            <div className="text-center py-16 sm:py-20 bg-canvas rounded-lg border border-line space-y-4">
              <h2 className="text-lg font-primary font-normal text-ink">
                No silhouettes match your selected filters
              </h2>
              <p className="text-xs text-ink-muted max-w-md mx-auto font-normal">
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
          SECTION 2: SHOP BY LIFESTYLE
          ========================================================================= */}
      <section
        id="lifestyle"
        className="pt-8 sm:pt-12 pb-16 sm:pb-24 bg-canvas border-t border-line scroll-mt-0 relative"
        aria-label="Shop by Lifestyle"
      >
        <span id="profession" className="sr-only" />
        <span id="shop-by-profession" className="sr-only" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Section Header */}
          <div className="mb-12 sm:mb-16">
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-black font-bold mb-1.5 font-secondary">
              Curated For Your Routine &amp; Beyond
            </p>
            <h2 className="font-primary text-[34px] sm:text-[42px] lg:text-[48px] font-normal text-ink tracking-tight leading-none">
              Shop by Lifestyle
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-2 max-w-2xl font-normal leading-relaxed">
              Three distinct carry archetypes engineered with specific tech dimensions, internal partitions, and ergonomic drops. Explore the curated silhouettes for each lifestyle below.
            </p>
          </div>

          {/* Subsections: Asymmetric 3-Part Grid (Top-Left, Bottom-Left, Half-Right) */}
          <div className="space-y-16 sm:space-y-24">
            {lifestyleSubsections.map((subsection) => {
              const IconComp = subsection.icon;

              return (
                <div
                  key={subsection.id}
                  id={subsection.id}
                  className="pt-8 sm:pt-10 border-t border-line/70 scroll-mt-20 sm:scroll-mt-24 relative"
                >
                  {/* Backward compatibility anchors */}
                  {subsection.id === 'everyday' && (
                    <>
                      <span id="corporate-executive" className="sr-only" />
                      <span id="01-everyday" className="sr-only" />
                    </>
                  )}
                  {subsection.id === 'work' && (
                    <>
                      <span id="tech-transit" className="sr-only" />
                      <span id="02-work" className="sr-only" />
                    </>
                  )}
                  {subsection.id === 'travel' && (
                    <>
                      <span id="creative-studio" className="sr-only" />
                      <span id="03-travel" className="sr-only" />
                    </>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-stretch">
                    {/* LEFT HALF (lg:col-span-6): TOP LEFT HORIZONTAL FRAMELESS IMAGE + BOTTOM LEFT PRODUCT CARDS */}
                    <div className="lg:col-span-6 flex flex-col justify-between space-y-6 sm:space-y-8">
                      {/* TOP LEFT: ONE HORIZONTAL FRAMELESS IMAGE OVERLAID WITH CINEMATIC HEADING & CONCISE DESCRIPTION */}
                      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-[16/9] min-h-[220px] sm:min-h-[250px] overflow-hidden border-0 bg-ink group rounded-none">
                        <Image
                          src={subsection.horizontalImage}
                          alt={`${subsection.archetype}`}
                          fill
                          loading="lazy"
                          decoding="async"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover object-center"
                        />
                        {/* Cinematic Lighting Scrims */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/25 pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent pointer-events-none" />

                        {/* Overlaid Cinematic Content */}
                        <div className="absolute inset-0 p-5 sm:p-7 lg:p-8 flex flex-col justify-end text-white z-10">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[10px] uppercase tracking-[0.22em] font-primary font-semibold">
                              <IconComp className="w-3.5 h-3.5 text-[#b4b4b4]" />
                              <span>{subsection.archetype}</span>
                            </span>
                          </div>

                          <h3 className="font-primary text-[24px] sm:text-[30px] lg:text-[34px] font-normal text-white tracking-tight leading-[1.1] mb-1 sm:mb-1.5">
                            {subsection.archetype}
                          </h3>

                          <p className="text-xs sm:text-sm text-white/90 italic font-primary mb-2 sm:mb-2.5">
                            “{subsection.tagline}”
                          </p>

                          <p className="text-xs sm:text-[13px] text-white/85 leading-relaxed font-normal max-w-lg mb-3">
                            {subsection.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {subsection.specs.map((spec, specIdx) => (
                              <span
                                key={specIdx}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/95 text-[10px] sm:text-[11px] font-secondary"
                              >
                                <Check className="w-3.5 h-3.5 text-[#b4b4b4]" />
                                <span>{spec}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* BOTTOM LEFT: DISPLAY THE TWO MATCHING PRODUCT CARDS (EXISTING CARD DESIGN) */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-line pb-2">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-black font-bold font-secondary">
                            Matching Silhouettes
                          </p>
                          <p className="text-[11px] text-ink-muted font-secondary">
                            Showing {subsection.products.length} {subsection.products.length === 1 ? 'model' : 'models'} · {subsection.subtitleFilterText}
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
                        alt={`${subsection.archetype} - ${subsection.tagline}`}
                        fill
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover object-[center_24%]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                      {/* Floating Base Badge */}
                      <div className="absolute bottom-5 left-5 right-5 z-10 text-white">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/95 text-[10px] uppercase tracking-[0.2em] font-primary font-semibold border border-white/20">
                          <IconComp className="w-3.5 h-3.5 text-[#b4b4b4]" />
                          <span>{subsection.archetype} · {subsection.tagline}</span>
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
