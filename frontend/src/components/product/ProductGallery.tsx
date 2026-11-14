'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { ProductImage } from '@/types';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const mobileCarouselRef = useRef<HTMLDivElement | null>(null);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handleNextLightbox = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrevLightbox = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Mobile carousel scroll synchronization
  const scrollToMobileIndex = (index: number) => {
    setActiveIndex(index);
    if (mobileCarouselRef.current) {
      const target = mobileCarouselRef.current.children[index] as HTMLElement;
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  const handleMobileScroll = () => {
    if (!mobileCarouselRef.current) return;
    const { scrollLeft, clientWidth } = mobileCarouselRef.current;
    if (clientWidth > 0) {
      const newIndex = Math.round(scrollLeft / clientWidth);
      if (newIndex >= 0 && newIndex < images.length && newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') handleNextLightbox();
      if (e.key === 'ArrowLeft') handlePrevLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handleNextLightbox, handlePrevLightbox]);

  // Desktop hover zoom handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {/* ============================================================ */}
      {/* MOBILE GALLERY: Proportionate Carousel (Never full-screen)  */}
      {/* ============================================================ */}
      <div className="lg:hidden relative w-full overflow-hidden">
        <div
          ref={mobileCarouselRef}
          onScroll={handleMobileScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none bg-[#F7F7F7] w-full"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {images.map((img, idx) => (
            <div
              key={'mobile-' + img.url + idx}
              onClick={() => openLightbox(idx)}
              className="w-full shrink-0 snap-center relative cursor-pointer bg-[#F7F7F7] min-h-[380px] sm:min-h-[440px]"
              style={{ aspectRatio: '4 / 5' }}
            >
              <Image
                src={img.url}
                alt={img.alt || `${productName} view ${idx + 1}`}
                fill
                priority={idx === 0}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              {/* Bestseller Badge on First Slide */}
              {idx === 0 && (
                <div className="absolute top-3 left-3 bg-black text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1">
                  BESTSELLER
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Minimalist Floating Chevrons on Mobile */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => scrollToMobileIndex((activeIndex - 1 + images.length) % images.length)}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 text-black shadow-sm flex items-center justify-center backdrop-blur-xs active:scale-95 transition-transform"
              aria-label="Previous product image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollToMobileIndex((activeIndex + 1) % images.length)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 text-black shadow-sm flex items-center justify-center backdrop-blur-xs active:scale-95 transition-transform"
              aria-label="Next product image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Floating Bottom Details: Counter & Expand */}
        <div className="absolute bottom-2.5 left-3 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-xs">
          {activeIndex + 1} / {images.length}
        </div>

        <button
          type="button"
          onClick={() => openLightbox(activeIndex)}
          className="absolute bottom-2.5 right-3 w-7 h-7 rounded-full bg-white/85 text-black flex items-center justify-center shadow-xs backdrop-blur-xs"
          aria-label="Open fullscreen image preview"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Clean Proportionate Pagination Dots */}
        <div className="flex justify-center items-center gap-1.5 pt-2.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToMobileIndex(idx)}
              className={`transition-all duration-200 rounded-full ${
                activeIndex === idx
                  ? 'w-4 h-1 bg-black'
                  : 'w-1 h-1 bg-neutral-300 hover:bg-neutral-500'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* DESKTOP GALLERY: 2-Column Seamless Image Grid (Benchmark)     */}
      {/* ============================================================ */}
      <div className="hidden lg:grid grid-cols-2 gap-2 w-full">
        {images.map((img, idx) => (
          <div
            key={'desktop-grid-' + img.url + idx}
            onClick={() => openLightbox(idx)}
            onMouseMove={(e) => handleMouseMove(e, idx)}
            onMouseLeave={handleMouseLeave}
            className="group relative w-full bg-[#F7F7F7] overflow-hidden cursor-zoom-in min-h-[440px] xl:min-h-[500px]"
            style={{ aspectRatio: '3 / 4' }}
          >
            <Image
              src={img.url}
              alt={img.alt || `${productName} view ${idx + 1}`}
              fill
              priority={idx < 2}
              sizes="(max-width: 1200px) 35vw, 450px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />

            {/* Desktop Zoom Loupe on Active Hover */}
            {hoveredIndex === idx && (
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-150"
                style={{
                  backgroundImage: `url(${img.url})`,
                  backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                  backgroundSize: '220%',
                  backgroundColor: '#F7F7F7',
                }}
              />
            )}

            {/* Top-Left Bestseller Badge (First Image) */}
            {idx === 0 && (
              <div className="absolute top-3 left-3 z-10 bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">
                BESTSELLER
              </div>
            )}

            {/* Bottom-Right Floating Expand Icon (Miraggio Style) */}
            {idx === 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openLightbox(idx);
                }}
                className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 text-black shadow-sm flex items-center justify-center hover:bg-white active:scale-95 transition-all"
                aria-label="Expand view"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/* FULLSCREEN LIGHTBOX MODAL (Shared Clean White/Dark View)     */}
      {/* ============================================================ */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 sm:p-6 backdrop-blur-md">
          {/* Top Bar */}
          <div className="w-full flex items-center justify-between text-white/90 max-w-6xl">
            <span className="text-xs sm:text-sm font-medium tracking-wide">
              {productName} • {lightboxIndex + 1} of {images.length}
            </span>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close fullscreen preview"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Center Image */}
          <div className="relative w-full max-w-4xl h-[70vh] sm:h-[78vh]">
            <Image
              src={images[lightboxIndex]?.url || images[0]?.url}
              alt={images[lightboxIndex]?.alt || productName}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Left / Right Navigation */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevLightbox}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 text-white rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={handleNextLightbox}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 text-white rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Bottom Thumbnails */}
          <div className="flex gap-2 overflow-x-auto max-w-full pb-2 scrollbar-none">
            {images.map((img, idx) => (
              <button
                key={'lightbox-thumb-' + idx}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className={`relative w-12 h-14 sm:w-14 sm:h-16 border overflow-hidden shrink-0 transition-all ${
                  lightboxIndex === idx
                    ? 'border-white ring-1 ring-white'
                    : 'border-white/30 opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={img.url}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
