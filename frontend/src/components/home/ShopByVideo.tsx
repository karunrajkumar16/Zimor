'use client';

import React, { useRef, useEffect, useState, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ShoppingBag, Check } from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { SOCIAL_LINKS } from '@/data/social';

export interface ShoppableVideoItem {
  id: string;
  videoUrl: string;
  posterUrl: string;
  title: string;
  product: Product;
}

// Database-backed local video assets (ready for admin panel management)
export const SHOPPABLE_VIDEOS: ShoppableVideoItem[] = [
  {
    id: 'video-1',
    videoUrl: 'https://res.cloudinary.com/kbeyfu3d/video/upload/v1794917875/zimor/videos/reel-00001-preview.mp4',
    posterUrl: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917851/zimor/reels/poster-1.webp',
    title: 'Workday Essentials Pack',
    product: PRODUCTS.find((p) => p.id === 'zimor-delo-tote-rust') || PRODUCTS[0],
  },
  {
    id: 'video-2',
    videoUrl: 'https://res.cloudinary.com/kbeyfu3d/video/upload/v1794917882/zimor/videos/reel-00002-preview.mp4',
    posterUrl: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917852/zimor/reels/poster-2.webp',
    title: 'Dual-Carry Commute Agility',
    product: PRODUCTS.find((p) => p.id === 'zimor-rabota-tote-cognac') || PRODUCTS[2],
  },
  {
    id: 'video-3',
    videoUrl: 'https://res.cloudinary.com/kbeyfu3d/video/upload/v1794917886/zimor/videos/reel-00003-preview.mp4',
    posterUrl: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917852/zimor/reels/poster-3.webp',
    title: 'Sculptural Crescent Fit',
    product: PRODUCTS.find((p) => p.id === 'zimor-classic-shoulder-bag-cream') || PRODUCTS[4],
  },
  {
    id: 'video-4',
    videoUrl: 'https://res.cloudinary.com/kbeyfu3d/video/upload/v1794917893/zimor/videos/reel-00004-preview.mp4',
    posterUrl: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917853/zimor/reels/poster-4.webp',
    title: 'The Executive Boardroom Stance',
    product: PRODUCTS.find((p) => p.id === 'zimor-delo-tote-noir') || PRODUCTS[1],
  },
  {
    id: 'video-5',
    videoUrl: 'https://res.cloudinary.com/kbeyfu3d/video/upload/v1794917901/zimor/videos/reel-00005-preview.mp4',
    posterUrl: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917854/zimor/reels/poster-5.webp',
    title: 'Artisanal Unboxing & Handcraft',
    product: PRODUCTS.find((p) => p.id === 'zimor-rabota-tote-espresso') || PRODUCTS[3],
  },
];

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
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="group relative flex-none w-[160px] sm:w-[190px] md:w-[220px] lg:w-[240px] shrink-0 snap-start aspect-[9/16] rounded-xl overflow-hidden bg-ink shadow-xs hover:shadow-md transition-shadow duration-300"
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        contain: 'layout paint',
      }}
    >
      {/* Full-card link for natural mobile navigation */}
      <Link
        href={`/product/${item.product.slug}`}
        className="absolute inset-0 z-10 block"
        aria-label={`View ${item.product.name}`}
      >
        <span className="sr-only">View {item.product.name}</span>
      </Link>

      {/* Immediate Poster Fallback: Zero layout shift & immediate visual display */}
      <Image
        src={item.posterUrl}
        alt={item.title}
        fill
        loading="lazy"
        decoding="async"
        sizes="(max-width: 640px) 160px, (max-width: 1024px) 220px, 240px"
        className={`object-cover object-center pointer-events-none transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'
          }`}
      />

      {/* Ultra-efficient GIF-Style Silent Video Stream — Lazy Loaded with preload="none" */}
      <video
        ref={videoRef}
        src={item.videoUrl}
        poster={item.posterUrl}
        preload="none"
        muted
        playsInline
        loop
        disablePictureInPicture
        disableRemotePlayback
        aria-label={item.title}
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
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
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollTrack = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const offset = direction === 'left' ? -280 : 280;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleAddToCartFromVideo = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, product.defaultColor, product.sizes[0]);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId((current) => (current === product.id ? null : current));
    }, 1800);
  };

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

        {/* Mobile-Optimized Horizontal Carousel (Zero Scroll Trapping, Snappy Momentum Glide) */}
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
          {SHOPPABLE_VIDEOS.map((item) => (
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
