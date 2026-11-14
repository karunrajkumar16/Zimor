'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ShoppingBag,
  ArrowRight,
  Play,
  Pause,
  Sparkles,
} from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface ShoppableVideoItem {
  id: string;
  videoSrc: string;
  posterSrc: string;
  startTime: number;
  endTime: number;
  title: string;
  tagline: string;
  stylingTip: string;
  product: Product;
}

const SHOPPABLE_VIDEOS: ShoppableVideoItem[] = [
  {
    id: 'video-1',
    videoSrc: '/reels/reel-00001.mp4',
    posterSrc: '/reels/poster-1.jpg',
    startTime: 2.0,
    endTime: 7.8,
    title: 'Workday Essentials Pack',
    tagline: '15.6" Laptop + Padded Tech Sleeve',
    stylingTip: 'Styled in Caramel Grain with matching wristlet',
    product: PRODUCTS.find((p) => p.id === 'zimor-delo-tote-rust') || PRODUCTS[0],
  },
  {
    id: 'video-2',
    videoSrc: '/reels/reel-00002.mp4',
    posterSrc: '/reels/poster-2.jpg',
    startTime: 2.0,
    endTime: 7.8,
    title: 'Dual-Carry Commute Agility',
    tagline: '15" Laptop + Detachable Crossbody Sling',
    stylingTip: 'Cognac Brown with 8 intuitive pockets',
    product: PRODUCTS.find((p) => p.id === 'zimor-rabota-tote-cognac') || PRODUCTS[2],
  },
  {
    id: 'video-3',
    videoSrc: '/reels/reel-00003.mp4',
    posterSrc: '/reels/poster-3.jpg',
    startTime: 2.0,
    endTime: 7.8,
    title: 'Sculptural Crescent Fit',
    tagline: 'Lightweight Underarm Contour & Magnetic Clasp',
    stylingTip: 'Cream Canvas with custom gold hardware',
    product: PRODUCTS.find((p) => p.id === 'zimor-classic-shoulder-bag-cream') || PRODUCTS[4],
  },
  {
    id: 'video-4',
    videoSrc: '/reels/reel-00004.mp4',
    posterSrc: '/reels/poster-4.jpg',
    startTime: 2.0,
    endTime: 7.8,
    title: 'The Executive Boardroom Stance',
    tagline: '15.6" Tech Cradle + Upright Solid Studs',
    stylingTip: 'Jet Noir Matte Leather with gold accents',
    product: PRODUCTS.find((p) => p.id === 'zimor-delo-tote-noir') || PRODUCTS[1],
  },
  {
    id: 'video-5',
    videoSrc: '/reels/reel-00005.mp4',
    posterSrc: '/reels/poster-5.jpg',
    startTime: 2.0,
    endTime: 7.8,
    title: 'Artisanal Unboxing & Handcraft',
    tagline: 'Hand-Finished Grain Composite & Brass Accents',
    stylingTip: 'Espresso Roast deep coffee leathercraft',
    product: PRODUCTS.find((p) => p.id === 'zimor-rabota-tote-espresso') || PRODUCTS[3],
  },
];

export const ShopByVideo: React.FC = () => {
  const { addItem } = useCart();
  const [activeModalVideo, setActiveModalVideo] = useState<ShoppableVideoItem | null>(null);
  const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({
    'video-1': true,
    'video-2': true,
    'video-3': true,
    'video-4': true,
    'video-5': true,
  });
  const [modalMuted, setModalMuted] = useState(false);
  const [isModalPlaying, setIsModalPlaying] = useState(true);

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const progressBarRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);

  // Viewport-aware playback: only play background video reels when section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        Object.values(videoRefs.current).forEach((v) => {
          if (!v) return;
          if (isVisible) {
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        });
      },
      { rootMargin: '100px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Maintain seamless 5-6s loop with direct DOM updates (0 component re-renders per second)
  const handleTimeUpdate = useCallback((videoItem: ShoppableVideoItem) => {
    const video = videoRefs.current[videoItem.id];
    if (!video) return;

    const current = video.currentTime;
    const duration = videoItem.endTime - videoItem.startTime;

    if (current < videoItem.startTime) {
      video.currentTime = videoItem.startTime;
    } else if (current >= videoItem.endTime) {
      video.currentTime = videoItem.startTime;
      if (video.paused) {
        video.play().catch(() => {});
      }
    }

    const progress = Math.max(0, Math.min(100, ((current - videoItem.startTime) / duration) * 100));
    const bar = progressBarRefs.current[videoItem.id];
    if (bar) {
      bar.style.width = `${progress}%`;
    }
  }, []);

  const handleLoadedMetadata = useCallback((videoItem: ShoppableVideoItem) => {
    const video = videoRefs.current[videoItem.id];
    if (!video) return;
    video.currentTime = videoItem.startTime;
    video.play().catch(() => {});
  }, []);

  const toggleMute = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRefs.current[videoId];
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setMutedStates((prev) => ({ ...prev, [videoId]: nextMuted }));
  };

  const scrollTrack = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const offset = direction === 'left' ? -320 : 320;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModalVideo) {
        setActiveModalVideo(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalVideo]);

  const handleNextModalVideo = () => {
    if (!activeModalVideo) return;
    const currentIndex = SHOPPABLE_VIDEOS.findIndex((v) => v.id === activeModalVideo.id);
    const nextIndex = (currentIndex + 1) % SHOPPABLE_VIDEOS.length;
    setActiveModalVideo(SHOPPABLE_VIDEOS[nextIndex]);
  };

  const handlePrevModalVideo = () => {
    if (!activeModalVideo) return;
    const currentIndex = SHOPPABLE_VIDEOS.findIndex((v) => v.id === activeModalVideo.id);
    const prevIndex = (currentIndex - 1 + SHOPPABLE_VIDEOS.length) % SHOPPABLE_VIDEOS.length;
    setActiveModalVideo(SHOPPABLE_VIDEOS[prevIndex]);
  };

  const handleModalPlayToggle = () => {
    if (!modalVideoRef.current) return;
    if (modalVideoRef.current.paused) {
      modalVideoRef.current.play();
      setIsModalPlaying(true);
    } else {
      modalVideoRef.current.pause();
      setIsModalPlaying(false);
    }
  };

  const handleAddToCartFromVideo = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1, product.defaultColor, product.sizes[0]);
  };

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-16 lg:py-20 bg-white border-b border-line select-none overflow-hidden content-auto"
      aria-label="Shop by Video - Miraggio Interactive Shoppable Video Style"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header: Miraggio-style Shop by Video Title & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-brand-700 font-bold mb-1.5 font-sans">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
              <span>Interactive Shopping · Real Motion</span>
            </div>
            <h2 className="font-serif text-[32px] sm:text-[40px] lg:text-[46px] font-normal text-ink tracking-tight leading-tight">
              Shop by Video
            </h2>
            <p className="text-xs sm:text-[13px] text-ink-secondary mt-1 font-light max-w-xl leading-relaxed">
              Experience how each handbag fits, moves, and styles in real workday scenarios. Tap any video to inspect craftsmanship and add directly to your bag.
            </p>
          </div>

          {/* Desktop & Tablet Carousel Arrow Navigation */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-end">
            <button
              type="button"
              onClick={() => scrollTrack('left')}
              className="w-9 h-9 rounded-full border border-line hover:border-ink bg-white text-ink flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-95"
              aria-label="Previous video reel"
            >
              <ChevronLeft className="w-4 h-4 stroke-[1.8]" />
            </button>
            <button
              type="button"
              onClick={() => scrollTrack('right')}
              className="w-9 h-9 rounded-full border border-line hover:border-ink bg-white text-ink flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-95"
              aria-label="Next video reel"
            >
              <ChevronRight className="w-4 h-4 stroke-[1.8]" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            HORIZONTAL SWIPABLE TRACK (Never vertical on mobile: 100% horizontal swipe)
            ========================================================================= */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar gap-3.5 sm:gap-4 md:gap-5 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {SHOPPABLE_VIDEOS.map((item) => {
            const isMuted = mutedStates[item.id];
            const discountPercent = Math.round(
              ((item.product.compareAtPrice - item.product.price) / item.product.compareAtPrice) * 100
            );

            return (
              <div
                key={item.id}
                onClick={() => {
                  setActiveModalVideo(item);
                  setIsModalPlaying(true);
                }}
                className="group relative flex-none w-[72vw] sm:w-[44vw] md:w-[31vw] lg:w-[230px] xl:w-[240px] shrink-0 snap-start aspect-[9/16] rounded-xl overflow-hidden bg-black shadow-subtle hover:shadow-xl transition-all duration-300 cursor-pointer border border-line/40 ring-1 ring-black/5"
              >
                {/* HTML5 Background Video */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="w-full h-full transform transition-transform duration-500 ease-out will-change-transform group-hover:scale-105">
                    <video
                      ref={(el) => {
                        videoRefs.current[item.id] = el;
                      }}
                      src={item.videoSrc}
                      poster={item.posterSrc}
                      muted={isMuted}
                      playsInline
                      autoPlay
                      preload="metadata"
                      onLoadedMetadata={() => handleLoadedMetadata(item)}
                      onTimeUpdate={() => handleTimeUpdate(item)}
                      className="w-full h-full object-cover object-center pointer-events-none"
                      aria-label={item.title}
                    />
                  </div>
                </div>

                {/* Top Video Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-20 overflow-hidden">
                  <div
                    ref={(el) => {
                      progressBarRefs.current[item.id] = el;
                    }}
                    className="h-full bg-white transition-[width] duration-100 ease-linear"
                    style={{ width: '0%' }}
                  />
                </div>

                {/* Top Controls: Sound Toggle + Expand */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-20 pointer-events-auto">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => toggleMute(item.id, e)}
                      className="w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-all border border-white/20"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-brand-300" />}
                    </button>
                    <span className="px-2 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-[10px] text-white/95 font-sans font-medium uppercase tracking-wider border border-white/15">
                      Shop Look
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModalVideo(item);
                    }}
                    className="w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-all border border-white/20"
                    aria-label="Expand video"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Subtle Gradient Shade for Text Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/25 pointer-events-none" />

                {/* =========================================================================
                    MIRAGGIO-STYLE SHOPPABLE PRODUCT OVERLAY CARD AT BOTTOM
                    ========================================================================= */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20">
                  <div className="bg-white/95 hover:bg-white backdrop-blur-md rounded-lg p-2 sm:p-2.5 border border-white/80 shadow-md transition-all duration-300">
                    <div className="flex items-center gap-2">
                      {/* Product Thumbnail */}
                      <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-md bg-[#F6F6F6] shrink-0 overflow-hidden border border-line/60">
                        <Image
                          src={item.product.images[0]?.url || item.posterSrc}
                          alt={item.product.name}
                          fill
                          sizes="44px"
                          className="object-contain p-0.5"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="min-w-0 flex-1">
                        <p className="font-serif text-[12px] sm:text-[13px] font-medium text-ink truncate leading-tight">
                          {item.product.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-sans font-semibold text-[11px] sm:text-xs text-ink">
                            ₹{item.product.price.toLocaleString('en-IN')}
                          </span>
                          <span className="font-sans text-[10px] text-ink-muted line-through">
                            ₹{item.product.compareAtPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Quick Add / Shop Button */}
                      <button
                        type="button"
                        onClick={(e) => handleAddToCartFromVideo(item.product, e)}
                        className="w-8 h-8 rounded-full bg-ink hover:bg-brand-700 text-white flex items-center justify-center shrink-0 transition-all shadow-xs active:scale-95"
                        aria-label={`Add ${item.product.name} to bag`}
                        title="Add to Bag"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          FULL-SCREEN SHOPPABLE VIDEO STORY MODAL (Miraggio Interactive Experience)
          ========================================================================= */}
      {activeModalVideo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
          onClick={() => setActiveModalVideo(null)}
        >
          {/* Main Modal Card Container */}
          <div
            className="relative w-full max-w-sm sm:max-w-md h-[88vh] max-h-[760px] rounded-2xl overflow-hidden bg-black shadow-2xl flex flex-col border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Modal Controls */}
            <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between text-white pointer-events-auto">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] uppercase tracking-wider font-semibold border border-white/20 text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span>Shop This Look</span>
                </span>
                <button
                  type="button"
                  onClick={() => setModalMuted(!modalMuted)}
                  className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 hover:bg-black/90 transition-all"
                  aria-label={modalMuted ? 'Unmute' : 'Mute'}
                >
                  {modalMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-brand-300" />}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalVideo(null)}
                className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 hover:bg-black/90 transition-all"
                aria-label="Close video player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player */}
            <div
              className="relative flex-1 bg-black overflow-hidden flex items-center justify-center cursor-pointer"
              onClick={handleModalPlayToggle}
            >
              <video
                ref={modalVideoRef}
                src={activeModalVideo.videoSrc}
                poster={activeModalVideo.posterSrc}
                autoPlay
                loop
                playsInline
                muted={modalMuted}
                className="w-full h-full object-cover object-center"
              />

              {/* Play/Pause Overlay indicator when paused */}
              {!isModalPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-white/90 text-ink flex items-center justify-center shadow-lg">
                    <Play className="w-6 h-6 ml-1 fill-ink" />
                  </div>
                </div>
              )}

              {/* Left / Right Carousel Arrow Overlays */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevModalVideo();
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 transition-all z-20"
                aria-label="Previous look"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextModalVideo();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 transition-all z-20"
                aria-label="Next look"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Shoppable Card in Modal */}
            <div className="p-3.5 sm:p-4 bg-white text-ink shrink-0 border-t border-line">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-14 h-14 rounded-lg bg-[#F6F6F6] shrink-0 overflow-hidden border border-line">
                  <Image
                    src={activeModalVideo.product.images[0]?.url || activeModalVideo.posterSrc}
                    alt={activeModalVideo.product.name}
                    fill
                    sizes="56px"
                    className="object-contain p-1"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-serif text-base sm:text-lg font-medium text-ink truncate">
                      {activeModalVideo.product.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-[10px] font-semibold uppercase tracking-wider shrink-0">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-ink-secondary truncate">
                    {activeModalVideo.product.defaultColor} • Fits 15.6" Laptop
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-sans font-semibold text-sm sm:text-base text-ink">
                      ₹{activeModalVideo.product.price.toLocaleString('en-IN')}
                    </span>
                    <span className="font-sans text-xs text-ink-muted line-through">
                      ₹{activeModalVideo.product.compareAtPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] font-semibold text-rose-700">
                      {Math.round(
                        ((activeModalVideo.product.compareAtPrice - activeModalVideo.product.price) /
                          activeModalVideo.product.compareAtPrice) *
                          100
                      )}
                      % OFF
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={(e) => handleAddToCartFromVideo(activeModalVideo.product, e)}
                  className="w-full py-2.5 px-3 rounded-full bg-brand-700 hover:bg-brand-800 text-white font-sans text-xs uppercase tracking-luxury font-semibold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Bag</span>
                </button>

                <Link
                  href={`/product/${activeModalVideo.product.slug}`}
                  onClick={() => setActiveModalVideo(null)}
                  className="w-full py-2.5 px-3 rounded-full border border-ink text-ink hover:bg-ink hover:text-white font-sans text-xs uppercase tracking-luxury font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-98"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

