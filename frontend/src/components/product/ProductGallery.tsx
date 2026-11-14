'use client';

import React, { useState } from 'react';
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
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });
  const rectRef = React.useRef<DOMRect | null>(null);

  const activeImage = images[activeIndex] || images[0];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    rectRef.current = e.currentTarget.getBoundingClientRect();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rectRef.current) {
      rectRef.current = e.currentTarget.getBoundingClientRect();
    }
    const { left, top, width, height } = rectRef.current;
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    rectRef.current = null;
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4">
      {/* Thumbnail Navigation */}
      <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-y-auto shrink-0 pb-2 lg:pb-0 scrollbar-none">
        {images.map((img, index) => (
          <button
            key={img.url + index}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded border overflow-hidden shrink-0 transition-all ${
              activeIndex === index
                ? 'border-brand-700 ring-1 ring-brand-700 shadow-sm'
                : 'border-line opacity-75 hover:opacity-100 hover:border-ink/40'
            }`}
            aria-label={`View image ${index + 1} of ${images.length}`}
          >
            <Image
              src={img.url}
              alt={img.alt || `${productName} view ${index + 1}`}
              fill
              sizes="(max-width: 640px) 64px, 80px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Large Visual Stage */}
      <div className="relative flex-1 aspect-3/4 sm:aspect-4/5 rounded-lg border border-line bg-canvas-alt overflow-hidden">
        {/* Main image with zoom effect */}
        <div
          className="relative w-full h-full cursor-zoom-in"
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => setIsLightboxOpen(true)}
        >
          <Image
            src={activeImage.url}
            alt={activeImage.alt || productName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover transition-opacity duration-300"
          />

          {/* Magnified Loupe Hover Layer */}
          <div
            className="hidden lg:block absolute inset-0 pointer-events-none transition-opacity duration-200"
            style={{
              ...zoomStyle,
              backgroundImage: `url(${activeImage.url})`,
              backgroundSize: '220%',
              backgroundColor: '#FAF8F5',
            }}
          />
        </div>

        {/* Arrow Navigation */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-ink shadow-sm flex items-center justify-center hover:bg-white transition-all backdrop-blur-xs"
              aria-label="Previous product image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-ink shadow-sm flex items-center justify-center hover:bg-white transition-all backdrop-blur-xs"
              aria-label="Next product image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Fullscreen Expansion Trigger */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 text-ink shadow-sm hover:bg-white transition-colors"
          aria-label="Open fullscreen image preview"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Image Counter Badge */}
        <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[11px] font-medium px-2.5 py-1 rounded-full backdrop-blur-xs">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-2 text-white/80 hover:text-white rounded-full bg-white/10"
            aria-label="Close fullscreen preview"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative w-full max-w-4xl h-[85vh]">
            <Image
              src={activeImage.url}
              alt={activeImage.alt || productName}
              fill
              className="object-contain"
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 text-white rounded-full bg-white/10 hover:bg-white/20"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 text-white rounded-full bg-white/10 hover:bg-white/20"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

