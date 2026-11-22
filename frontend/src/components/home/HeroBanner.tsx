'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export interface HeroSlide {
  id: string;
  badge?: string;
  eyebrow?: string;
  title: string;
  headline?: string;
  subtitle: string;
  description?: string;
  image: string;
  editorialImage?: string;
  editorialAlt?: string;
  ctaText?: string;
  ctaLink?: string;
  slug?: string;
  isActive?: boolean;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 'hero-slide-1',
    badge: 'PERMANENT ATELIER COLLECTION',
    title: 'ARCHITECTURAL FORM.\nEVERYDAY PURPOSE.',
    subtitle:
      'Discover our permanent collection of six sculptural products engineered with 15.6" laptop compartments.',
    image:
      'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917825/zimor/banners/hero-first-edit.webp',
    ctaText: 'Shop Collection',
    ctaLink: '/shop',
    isActive: true,
  },
  {
    id: 'hero-slide-2',
    badge: 'NEW ATELIER EDITION',
    title: 'TIMELESS LUXURY.\nMINIMALIST PURSUIT.',
    subtitle:
      'Engineered with 15.6" padded protection and solid brass accents for seamless boardroom transitions.',
    image:
      'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917826/zimor/banners/hero-most-loved-tote.webp',
    ctaText: 'Shop Totes',
    ctaLink: '/shop?category=tote-bags',
    isActive: true,
  },
  {
    id: 'hero-slide-3',
    badge: 'WEEKEND & TRAVEL',
    title: 'EFFORTLESS TRAVEL.\nCURATED DESIGN.',
    subtitle:
      'French canvas with sculpted crescent contours and luminous gold hardware.',
    image:
      'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917826/zimor/banners/hero-model-crescent.webp',
    ctaText: 'Explore Shoulder Bags',
    ctaLink: '/shop?category=shoulder-bags',
    isActive: true,
  },
];

export const HeroBanner: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Auto-advance slide every 5 seconds
  const SLIDE_DURATION = 5000;

  useEffect(() => {
    let isMounted = true;

    async function loadLiveBanners() {
      try {
        const res = await apiFetch('/api/content/homepage', { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        const rawSlides = json.content?.data?.heroSlides || json.content?.data?.slides;
        if (Array.isArray(rawSlides) && rawSlides.length > 0) {
          // Filter active slides (isActive !== false) with valid image
          const active = rawSlides.filter(
            (s: any) => s.isActive !== false && (s.image || s.editorialImage)
          );
          if (isMounted && active.length > 0) {
            const normalized: HeroSlide[] = active.map((s: any, idx: number) => ({
              id: s.id || `hero-slide-${idx + 1}`,
              badge: s.badge ?? s.eyebrow ?? 'ZIMOR ATELIER',
              title: s.title ?? s.headline ?? '',
              subtitle: s.subtitle ?? s.description ?? '',
              image: s.image || s.editorialImage || '',
              ctaText: s.ctaText || 'Shop Now',
              ctaLink: s.ctaLink || s.slug || '/shop',
              isActive: s.isActive !== false,
            }));
            setSlides(normalized);
          }
        }
      } catch (err) {
        console.warn('Fallback to default hero billboard slides:', err);
      }
    }

    loadLiveBanners();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalSlides = slides.length;

  const goToSlide = useCallback((nextIdx: number) => {
    setCurrentSlide((curr) => {
      setPrevSlide(curr);
      return nextIdx;
    });
  }, []);

  const handleNext = useCallback(() => {
    setCurrentSlide((curr) => {
      setPrevSlide(curr);
      return (curr + 1) % (totalSlides || 1);
    });
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setCurrentSlide((curr) => {
      setPrevSlide(curr);
      return (curr - 1 + (totalSlides || 1)) % (totalSlides || 1);
    });
  }, [totalSlides]);

  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(handleNext, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [handleNext, totalSlides]);

  // Keep currentSlide within valid bounds if slides count changes
  useEffect(() => {
    if (currentSlide >= totalSlides && totalSlides > 0) {
      setCurrentSlide(0);
      setPrevSlide(0);
    }
  }, [currentSlide, totalSlides]);

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
        {slides.map((slide, index) => {
          const isCurrent = index === currentSlide;
          const isPrevious = index === prevSlide && prevSlide !== currentSlide;
          const badgeText = slide.badge ?? slide.eyebrow ?? 'ZIMOR ATELIER';
          const titleText = slide.title ?? slide.headline ?? '';
          const subtitleText = slide.subtitle ?? slide.description ?? '';
          const imageUrl =
            slide.image ||
            slide.editorialImage ||
            'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917825/zimor/banners/hero-first-edit.webp';
          const ctaLink = slide.ctaLink || slide.slug || '/shop';
          const ctaText = slide.ctaText || 'Shop Now';

          return (
            <div
              key={slide.id || index}
              className={`absolute inset-0 transition-opacity ease-in-out ${isCurrent
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
                  src={imageUrl}
                  alt={titleText || 'Zimor India Editorial Campaign'}
                  fill
                  priority={index === 0}
                  loading={index === 0 ? undefined : 'lazy'}
                  decoding="async"
                  sizes="100vw"
                  className="object-cover object-center scale-100 transition-transform duration-[5000ms] ease-out"
                  style={{
                    transform: isCurrent ? 'scale(1.035)' : 'scale(1.0)',
                  }}
                />
                {/* Balanced gradient so transparent header and bottom-left typography remain crisp while banner artwork stays luminous */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/30" />
              </div>

              {/* Bottom-Left Editorial Headline, Description & Pill CTA */}
              <div
                className={`absolute bottom-6 left-4 sm:bottom-10 sm:left-8 md:bottom-14 md:left-12 lg:left-16 z-20 max-w-xl sm:max-w-2xl text-white transition-all ${isCurrent
                  ? 'opacity-100 translate-y-0 duration-[1200ms] delay-[250ms] ease-out'
                  : 'opacity-0 -translate-y-2 duration-[500ms] ease-in pointer-events-none'
                  }`}
                style={{
                  transitionTimingFunction: isCurrent
                    ? 'cubic-bezier(0.25, 1, 0.5, 1)'
                    : 'cubic-bezier(0.4, 0, 1, 1)',
                }}
              >
                {/* Eyebrow / Badge */}
                {badgeText && (
                  <p className="text-[10px] sm:text-xs md:text-sm font-primary uppercase tracking-[0.18em] sm:tracking-[0.2em] text-white/90 font-medium mb-1.5 sm:mb-2 drop-shadow-sm">
                    {badgeText}
                  </p>
                )}

                {/* Large Headline with preserved line breaks */}
                <h1 className="font-primary text-xl sm:text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight uppercase leading-[1.1] sm:leading-[1.05] mb-2 sm:mb-4 text-white drop-shadow-md whitespace-pre-line">
                  {titleText}
                </h1>

                {/* Description Paragraph (Visible on tablet & desktop) */}
                {subtitleText && (
                  <p className="hidden sm:block text-xs sm:text-sm lg:text-base text-white/90 font-normal leading-relaxed max-w-lg mb-4 sm:mb-6 md:mb-8 drop-shadow-sm">
                    {subtitleText}
                  </p>
                )}

                {/* Pill Outline CTA Button */}
                <div className="pt-1 sm:pt-0">
                  <Link
                    href={ctaLink}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-full border border-white text-white hover:bg-white hover:text-ink font-primary text-xs sm:text-[13.5px] font-medium tracking-normal transition-all duration-300 shadow-md backdrop-blur-xs whitespace-nowrap"
                  >
                    <span>{ctaText}</span>
                    <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {/* Subtle Slide Indicator Dots */}
        {totalSlides > 1 && (
          <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {slides.map((slide, idx) => (
              <button
                key={slide.id || idx}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1 rounded-full transition-all duration-700 cursor-pointer ${idx === currentSlide
                  ? 'w-7 bg-white shadow-sm'
                  : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
              />
            ))}
          </div>
        )}

        {/* Left & Right Edge Navigation Arrows */}
        {totalSlides > 1 && (
          <>
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
          </>
        )}
      </div>
    </section>
  );
};
