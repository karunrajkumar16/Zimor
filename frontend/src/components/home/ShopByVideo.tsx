'use client';

import React, { useRef, useEffect, useState, useMemo, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ShoppingBag, Check } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext';
import { SOCIAL_LINKS } from '@/data/social';
import { apiFetch } from '@/lib/api';

export interface ReelConfigItem {
  id: string;
  title: string;
  videoUrl: string;
  posterUrl: string;
  instagramUrl?: string;
  productSlug?: string;
}

export interface ShoppableVideoItem {
  id: string;
  videoUrl: string;
  posterUrl: string;
  title: string;
  instagramUrl?: string;
  product: Product;
}

interface ShoppableVideoCardProps {
  item: ShoppableVideoItem;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  isAdded: boolean;
}

/**
 * High-performance GIF-style video card:
 * - Employs a dedicated per-card IntersectionObserver so ONLY cards currently
 *   visible on screen decode frames, completely preventing GPU queue stalls and lag.
 * - Hardware-accelerated without live CSS transforms on the video element.
 */
const ShoppableVideoCard = memo<ShoppableVideoCardProps>(({
  item,
  onAddToCart,
  isAdded,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const cardEl = cardRef.current;
    const videoEl = videoRef.current;
    if (!cardEl || !videoEl) return;

    // Per-card visibility observer: plays strictly when visible in the viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
          videoEl.play().then(() => setIsPlaying(true)).catch(() => { });
        } else {
          videoEl.pause();
          setIsPlaying(false);
        }
      },
      {
        threshold: [0, 0.25, 0.75],
        rootMargin: '40px 0px 40px 0px',
      }
    );

    observer.observe(cardEl);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="group relative flex-none w-[220px] sm:w-[240px] md:w-[260px] aspect-[9/16] rounded-xl overflow-hidden bg-neutral-900 shadow-sm snap-start select-none transform-gpu isolate border border-line/40"
      style={{
        contain: 'paint layout',
        contentVisibility: 'auto',
      }}
    >
      {/* Autoplaying Loop Video */}
      <video
        ref={videoRef}
        src={item.videoUrl}
        poster={item.posterUrl}
        loop
        muted
        playsInline
        preload="none"
        aria-label={item.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      />

      {/* Subtle bottom gradient shade for text legibility */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none z-10" />

      {/* Miraggio-Style Floating Shoppable Product Tag */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 pointer-events-auto">
        <div className="bg-white/95 hover:bg-white backdrop-blur-xs rounded-lg p-2 sm:p-2.5 shadow-sm border border-line/60 transition-all">
          <div className="flex items-center gap-2">
            {/* Thumbnail */}
            <Link
              href={`/product/${item.product.slug}`}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-canvas shrink-0 overflow-hidden block"
            >
              <Image
                src={item.product.images[0]?.url || item.posterUrl}
                alt={item.product.name}
                fill
                loading="lazy"
                decoding="async"
                sizes="40px"
                className="object-contain p-0.5"
              />
            </Link>

            {/* Product Meta */}
            <Link
              href={`/product/${item.product.slug}`}
              className="min-w-0 flex-1 block group/link"
            >
              <p className="font-primary text-[11px] sm:text-xs font-normal text-ink truncate leading-tight group-hover/link:text-[#b4b4b4] transition-colors">
                {item.product.name}
              </p>
              <p className="font-secondary text-[11px] sm:text-xs font-bold text-ink mt-0.5">
                ₹{item.product.price.toLocaleString('en-IN')}
              </p>
            </Link>

            {/* Quick Add Action Button */}
            <button
              type="button"
              onClick={(e) => onAddToCart(item.product, e)}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 shadow-2xs ${isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-ink hover:bg-ink-secondary text-white'
                }`}
              aria-label={`Add ${item.product.name} to bag`}
              title="Add to Bag"
            >
              {isAdded ? (
                <Check className="w-3.5 h-3.5 stroke-[2.2]" />
              ) : (
                <ShoppingBag className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ShoppableVideoCard.displayName = 'ShoppableVideoCard';

export const ShopByVideo: React.FC = () => {
  const { addItem } = useCart();
  const { products, getProductBySlug, isLoading: isProductsLoading } = useProducts();
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [reelsConfig, setReelsConfig] = useState<ReelConfigItem[]>([]);
  const [isLoadingReels, setIsLoadingReels] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic shoppable reels from MongoDB Atlas via /api/content/homepage
  useEffect(() => {
    let isMounted = true;
    apiFetch('/api/content/homepage', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        const liveReels = data?.content?.data?.reels;
        if (Array.isArray(liveReels) && liveReels.length > 0) {
          setReelsConfig(liveReels);
        }
      })
      .catch((err) => {
        console.warn('[ShopByVideo] Live reels fetch notice:', err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoadingReels(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Map each reel dynamically to its genuine MongoDB Product document
  const shoppableVideos: ShoppableVideoItem[] = useMemo(() => {
    if (!reelsConfig || reelsConfig.length === 0 || products.length === 0) return [];

    const items: ShoppableVideoItem[] = [];
    for (const reel of reelsConfig) {
      const matchedProduct =
        (reel.productSlug ? getProductBySlug(reel.productSlug) : undefined) ||
        products[0];

      if (matchedProduct && reel.videoUrl) {
        items.push({
          id: reel.id || `video-${items.length + 1}`,
          videoUrl: reel.videoUrl,
          posterUrl: reel.posterUrl || matchedProduct.images[0]?.url || '',
          title: reel.title || matchedProduct.name,
          instagramUrl: reel.instagramUrl,
          product: matchedProduct,
        });
      }
    }
    return items;
  }, [reelsConfig, products, getProductBySlug]);

  const scrollTrack = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const offset = direction === 'left' ? -280 : 280;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleAddToCartFromVideo = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, product.sizes?.[0] || 'Standard');
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId((current) => (current === product.id ? null : current));
    }, 1800);
  };

  // Do not render section if there are no videos configured and loading completed
  if (!isLoadingReels && !isProductsLoading && shoppableVideos.length === 0) {
    return null;
  }

  return (
    <section
      className="py-10 sm:py-14 lg:py-18 bg-white select-none overflow-hidden content-auto"
      aria-label="Shop by Video"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Clean, Clutter-Free Miraggio-Inspired Header */}
        <div className="flex items-end justify-between gap-4 mb-5 sm:mb-7">
          <div>
            <h2 className="font-primary text-xl sm:text-2xl md:text-3xl font-medium text-ink tracking-tight leading-tight">
              Shop by Video
            </h2>
            <p className="text-xs sm:text-[13px] text-ink-muted mt-1 font-normal max-w-lg leading-relaxed">
              Experience how each handbag fits, moves, and styles in real workday motion.{' '}
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-ink hover:underline font-medium"
              >
                Follow @zimorindia ↗
              </a>
            </p>
          </div>

          {/* Minimalist Carousel Controls (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => scrollTrack('left')}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-line hover:border-ink hover:bg-canvas-card text-ink flex items-center justify-center transition-all shadow-2xs active:scale-95"
              aria-label="Previous video"
            >
              <ChevronLeft className="w-4 h-4 stroke-[1.8]" />
            </button>
            <button
              type="button"
              onClick={() => scrollTrack('right')}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-line hover:border-ink hover:bg-canvas-card text-ink flex items-center justify-center transition-all shadow-2xs active:scale-95"
              aria-label="Next video"
            >
              <ChevronRight className="w-4 h-4 stroke-[1.8]" />
            </button>
          </div>
        </div>

        {/* Mobile-Optimized Horizontal Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar gap-3 sm:gap-4 md:gap-5 pb-3 -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x pan-y',
            overscrollBehaviorX: 'contain',
            overscrollBehaviorY: 'auto',
          }}
        >
          {isLoadingReels || isProductsLoading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={`video-skeleton-${idx}`}
                  className="flex-none w-[220px] sm:w-[240px] md:w-[260px] aspect-[9/16] rounded-xl bg-canvas-card animate-pulse border border-line/40"
                />
              ))
            : shoppableVideos.map((item) => (
                <ShoppableVideoCard
                  key={item.id}
                  item={item}
                  onAddToCart={handleAddToCartFromVideo}
                  isAdded={addedProductId === item.product.id}
                />
              ))}
        </div>
      </div>
    </section>
  );
};
