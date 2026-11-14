'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface CafuneSlide {
  id: string;
  name: string;
  shortName: string;
  category: string;
  eyebrow: string;
  headline: string;
  description: string;
  price: number;
  compareAtPrice: number;
  slug: string;
  cutoutImage: string;
  editorialImage: string;
  editorialAlt: string;
}

const SLIDES: CafuneSlide[] = [
  {
    id: 'delo-tote',
    name: 'Delo Tote',
    shortName: 'Delo',
    category: 'Executive Laptop Tote',
    eyebrow: 'INTRODUCING THE NEW',
    headline: 'ARCHITECTURAL STANCE',
    description:
      'Engineered for modern executive presence. Crafted in 100% superior faux leather with dedicated padded 15.6" laptop protection and an included matching wristlet pouch.',
    price: 2999,
    compareAtPrice: 5199,
    slug: '/product/zimor-delo-tote',
    cutoutImage: '/products/delo-1.jpg',
    editorialImage: '/brandgirl3.webp',
    editorialAlt: 'Zimor Delo Tote executive editorial campaign in warm daylight',
  },
  {
    id: 'classic-shoulder-bag',
    name: 'Classic Shoulder Bag',
    shortName: 'Classic',
    category: 'Crescent Flap Handbag',
    eyebrow: 'SIGNATURE EDITION',
    headline: 'SCULPTURAL CRESCENT',
    description:
      'A refined crescent flap silhouette with custom gold magnetic closure, heavyweight canvas trim, and smooth contours designed to move with you from morning to night.',
    price: 1699,
    compareAtPrice: 2999,
    slug: '/product/zimor-classic-shoulder-bag',
    cutoutImage: '/products/classic-1.jpg',
    editorialImage: '/brandgirl2.webp',
    editorialAlt: 'Zimor Classic Shoulder Bag sculptural crescent editorial',
  },
  {
    id: 'rabota-tote',
    name: 'Rabota Tote',
    shortName: 'Rabota',
    category: 'Dual-Carry Laptop Tote',
    eyebrow: 'TRANSIT & WORKDAY EDIT',
    headline: 'DUAL-CARRY AGILITY',
    description:
      'The definitive laptop tote for active professionals. Seamlessly transitions between reinforced grab handles and an adjustable crossbody sling on busy transit and flights.',
    price: 2999,
    compareAtPrice: 5199,
    slug: '/product/zimor-rabota-tote',
    cutoutImage: '/products/rabota-1.jpg',
    editorialImage: '/image.jpg',
    editorialAlt: 'Zimor Rabota Tote transit commuter editorial',
  },
];

export const HeroBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Auto-advance slide every 5 seconds
  const SLIDE_DURATION = 5000;

  const goToSlide = useCallback((nextIdx: number) => {
    setCurrentSlide((curr) => {
      setPrevSlide(curr);
      return nextIdx;
    });
  }, []);

  const handleNext = useCallback(() => {
    setCurrentSlide((curr) => {
      setPrevSlide(curr);
      return (curr + 1) % SLIDES.length;
    });
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentSlide((curr) => {
      setPrevSlide(curr);
      return (curr - 1 + SLIDES.length) % SLIDES.length;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(handleNext, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [handleNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-canvas-dark select-none group -mt-16 sm:-mt-20"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Editorial Hero Campaign"
    >
      {/* Viewport Canvas (Tucks under the transparent Cafuné header with pt-16 sm:pt-20) */}
      <div className="relative w-full h-[82vh] sm:h-[90vh] lg:h-screen min-h-[580px] sm:min-h-[640px] max-h-[1020px] pt-16 sm:pt-20">
        {/* Coordinated Slide Layers with Smooth Cross-Dissolve */}
        {SLIDES.map((slide, index) => {
          const isCurrent = index === currentSlide;
          const isPrevious = index === prevSlide && prevSlide !== currentSlide;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity ease-in-out ${
                isCurrent
                  ? 'z-20 opacity-100 pointer-events-auto'
                  : isPrevious
                  ? 'z-10 opacity-100 pointer-events-none'
                  : 'z-0 opacity-0 pointer-events-none'
              }`}
              style={{
                transitionDuration: '1800ms',
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* Background Editorial Image with Gentle Cinematic Zoom */}
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={slide.editorialImage}
                  alt={slide.editorialAlt}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover object-center scale-100 transition-transform duration-[5000ms] ease-out"
                  style={{
                    transform: isCurrent ? 'scale(1.035)' : 'scale(1.0)',
                  }}
                />
                {/* Contrast tint so header and typography are visible */}
                <div className="absolute inset-0 bg-black/40" />
              </div>

              {/* Bottom-Left Editorial Headline, Description & Pill CTA */}
              <div
                className={`absolute bottom-6 left-4 sm:bottom-10 sm:left-8 md:bottom-14 md:left-12 lg:left-16 z-20 max-w-[55%] sm:max-w-md md:max-w-lg lg:max-w-xl text-white transition-all ${
                  isCurrent
                    ? 'opacity-100 translate-y-0 duration-[1200ms] delay-[250ms] ease-out'
                    : 'opacity-0 -translate-y-2 duration-[500ms] ease-in pointer-events-none'
                }`}
                style={{
                  transitionTimingFunction: isCurrent
                    ? 'cubic-bezier(0.25, 1, 0.5, 1)'
                    : 'cubic-bezier(0.4, 0, 1, 1)',
                }}
              >
                {/* Eyebrow */}
                <p className="text-[10px] sm:text-xs md:text-sm font-sans uppercase tracking-[0.18em] sm:tracking-[0.2em] text-white/90 font-medium mb-1.5 sm:mb-2 drop-shadow-sm">
                  {slide.eyebrow}
                </p>

                {/* Large Bold Headline */}
                <h1 className="font-sans text-xl sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight uppercase leading-[1.1] sm:leading-[1.05] mb-2 sm:mb-4 text-white drop-shadow-md">
                  {slide.headline}
                </h1>

                {/* Description Paragraph (Visible on tablet & desktop) */}
                <p className="hidden sm:block text-xs sm:text-sm lg:text-base text-white/90 font-light leading-relaxed max-w-lg mb-4 sm:mb-6 md:mb-8 drop-shadow-sm">
                  {slide.description}
                </p>

                {/* Pill Outline CTA Button */}
                <div className="pt-1 sm:pt-0">
                  <Link
                    href={slide.slug}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-3.5 rounded-full border border-white text-white hover:bg-white hover:text-ink font-sans text-[11px] sm:text-xs uppercase tracking-luxury font-medium transition-all duration-300 shadow-md backdrop-blur-xs whitespace-nowrap"
                  >
                    <span>Discover More</span>
                    <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Bottom-Right Framed Inset Product Card */}
              <div
                className={`absolute bottom-6 right-4 sm:bottom-10 sm:right-8 md:bottom-14 md:right-12 lg:right-16 z-20 transition-all ${
                  isCurrent
                    ? 'opacity-100 translate-y-0 duration-[1200ms] delay-[250ms] ease-out'
                    : 'opacity-0 -translate-y-2 duration-[500ms] ease-in pointer-events-none'
                }`}
                style={{
                  transitionTimingFunction: isCurrent
                    ? 'cubic-bezier(0.25, 1, 0.5, 1)'
                    : 'cubic-bezier(0.4, 0, 1, 1)',
                }}
              >
                <Link
                  href={slide.slug}
                  className="group/card block bg-white border border-white/90 p-2 sm:p-3 md:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] hover:shadow-[0_28px_65px_rgba(0,0,0,0.45)] w-32 sm:w-44 md:w-56 lg:w-64 transition-all duration-300 hover:-translate-y-1"
                  aria-label={`View ${slide.name}`}
                >
                  {/* Cutout Bag Image inside White Frame */}
                  <div className="relative w-full h-24 sm:h-36 md:h-44 lg:h-52 bg-white flex items-center justify-center overflow-hidden">
                    <Image
                      src={slide.cutoutImage}
                      alt={slide.name}
                      fill
                      sizes="(max-width: 640px) 128px, (max-width: 768px) 176px, 256px"
                      className="object-contain object-center scale-95 group-hover/card:scale-100 transition-transform duration-500 ease-out"
                      priority={index === 0}
                    />
                  </div>

                  {/* Product Meta */}
                  <div className="pt-2 sm:pt-3 border-t border-line/60 flex items-start justify-between gap-1">
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-xs sm:text-sm md:text-base text-ink font-medium tracking-tight truncate">
                        {slide.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-ink-muted font-sans font-normal mt-0.5">
                        ₹{slide.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="text-ink-muted group-hover/card:text-ink transition-colors pt-0.5 shrink-0">
                      <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          );
        })}

        {/* Subtle Slide Indicator Dots */}
        <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1 rounded-full transition-all duration-700 cursor-pointer ${
                idx === currentSlide
                  ? 'w-7 bg-white shadow-sm'
                  : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        {/* Left & Right Edge Navigation Arrows */}
        <button
          type="button"
          onClick={handlePrev}
          className="flex absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/30 hover:border-white bg-black/25 hover:bg-black/50 text-white items-center justify-center transition-all duration-200 backdrop-blur-xs shadow-md"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.5]" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/30 hover:border-white bg-black/25 hover:bg-black/50 text-white items-center justify-center transition-all duration-200 backdrop-blur-xs shadow-md"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.5]" />
        </button>
      </div>
    </section>
  );
};
