'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export interface SpotlightFrame {
  id: string;
  title: string;
  linkText: string;
  linkHref: string;
  image: string;
  alt: string;
  gridClasses?: string;
  objectPosition?: string;
  order: number;
  isPublished?: boolean;
}

export interface SpotlightSectionData {
  isPublished?: boolean;
  tag?: string;
  heading?: string;
  leadText?: string;
  supportingText?: string;
  badges?: string[];
  ctaText?: string;
  ctaLink?: string;
  frames: SpotlightFrame[];
}

const DEFAULT_GRID_CLASSES = [
  'col-span-1 md:col-start-6 md:col-end-10 md:row-start-1 md:row-end-2 min-h-[260px] md:min-h-0',
  'col-span-1 md:col-start-10 md:col-end-13 md:row-start-1 md:row-end-2 min-h-[260px] md:min-h-0',
  'col-span-2 md:col-start-1 md:col-end-6 md:row-start-2 md:row-end-3 min-h-[280px] md:min-h-0',
  'col-span-2 md:col-start-6 md:col-end-13 md:row-start-2 md:row-end-3 min-h-[280px] md:min-h-0',
];

export const AboutZimor: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisibleRef = useRef(false);
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [loading, setLoading] = useState(true);
  const [spotlight, setSpotlight] = useState<SpotlightSectionData | null>(null);

  useEffect(() => {
    let isMounted = true;
    apiFetch('/api/content/homepage')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || !data?.content?.data?.spotlight) return;
        setSpotlight(data.content.data.spotlight);
      })
      .catch((err) => {
        console.error('Failed to load spotlight content:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleFrames = (spotlight?.frames || [])
    .filter((f) => f.isPublished !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  useEffect(() => {
    let isTicking = false;

    const updateParallax = () => {
      if (typeof window === 'undefined' || !isVisibleRef.current) return;
      const windowHeight = window.innerHeight;
      const isDesktop = window.innerWidth >= 768;

      imgRefs.current.forEach((imgEl, idx) => {
        if (!imgEl) return;
        const parentCard = imgEl.parentElement;
        if (!parentCard || parentCard.offsetParent === null) return;

        const rect = parentCard.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = windowHeight / 2;
        const totalSpan = (windowHeight + rect.height) / 2;
        const rawProgress = (viewportCenter - elementCenter) / (totalSpan || 1);
        const p = Math.max(-1.15, Math.min(1.15, rawProgress));

        const speeds = isDesktop ? [65, 80, 70, 85] : [40, 50, 45, 55];
        const offset = p * (speeds[idx % speeds.length] || 70);
        imgEl.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
    };

    const handleScroll = () => {
      if (!isVisibleRef.current) return;
      if (!isTicking) {
        window.requestAnimationFrame(() => {
          updateParallax();
          isTicking = false;
        });
        isTicking = true;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          updateParallax();
        }
      },
      { rootMargin: '150px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [visibleFrames.length]);

  if (loading) {
    return (
      <section
        className="pt-6 sm:pt-10 lg:pt-14 pb-10 sm:pb-14 lg:pb-18 bg-white overflow-hidden w-full content-auto"
        aria-label="Loading Spotlight"
      >
        <div className="w-full grid grid-cols-1 md:grid-cols-12 md:grid-rows-[360px_390px] gap-0 md:gap-2 md:h-[750px] p-0 bg-white">
          <div className="col-span-1 md:col-start-1 md:col-end-6 md:row-start-1 md:row-end-2 w-full bg-white px-5 py-7 sm:px-8 sm:py-9 md:p-6 lg:p-9 xl:p-10 space-y-4">
            <div className="h-3 w-28 bg-gray-200/70 animate-pulse rounded" />
            <div className="h-10 w-64 bg-gray-200/70 animate-pulse rounded" />
            <div className="h-4 w-full bg-gray-200/70 animate-pulse rounded" />
            <div className="h-4 w-3/4 bg-gray-200/70 animate-pulse rounded" />
          </div>
          <div className="hidden md:block col-start-6 col-end-10 row-start-1 row-end-2 bg-gray-200/50 animate-pulse" />
          <div className="hidden md:block col-start-10 col-end-13 row-start-1 row-end-2 bg-gray-200/60 animate-pulse" />
          <div className="hidden md:block col-start-1 col-end-6 row-start-2 row-end-3 bg-gray-200/55 animate-pulse" />
          <div className="hidden md:block col-start-6 col-end-13 row-start-2 row-end-3 bg-gray-200/65 animate-pulse" />
        </div>
      </section>
    );
  }

  if (!spotlight || spotlight.isPublished === false || (!spotlight.heading && visibleFrames.length === 0)) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="pt-6 sm:pt-10 lg:pt-14 pb-10 sm:pb-14 lg:pb-18 bg-white select-none overflow-hidden w-full content-auto"
      aria-label="About Zimor - Editorial Campaign Collage"
    >
      {/* Seamless Edge-to-Edge Pinterest-Style Asymmetric Editorial Masonry Collage */}
      {/* 2-Row Grid on Desktop; Mobile shows only the clean, full-width text story panel */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 md:grid-rows-[360px_390px] gap-0 md:gap-2 md:h-[750px] p-0 bg-white">
        {/* TILE 1 (Cols 1-5, Row 1 on Desktop): Full-Width Editorial Story Panel on Mobile */}
        <div className="col-span-1 md:col-start-1 md:col-end-6 md:row-start-1 md:row-end-2 w-full bg-white px-5 py-7 sm:px-8 sm:py-9 md:p-6 lg:p-9 xl:p-10 flex flex-col justify-between">
          <div className="space-y-4 sm:space-y-4.5">
            <div>
              {spotlight.tag && (
                <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[#000000] font-semibold mb-2 font-primary">
                  {spotlight.tag}
                </p>
              )}
              {spotlight.heading && (
                <h2 className="font-primary text-[30px] sm:text-[38px] md:text-[42px] lg:text-[48px] font-normal text-ink tracking-tight leading-[1.15]">
                  {spotlight.heading}
                </h2>
              )}
            </div>

            {spotlight.leadText && (
              <p className="font-secondary text-sm sm:text-[15px] text-ink-secondary font-normal leading-[1.8] max-w-xl">
                {spotlight.leadText}
              </p>
            )}

            <div className="space-y-3 pt-0.5">
              {spotlight.supportingText && (
                <p className="font-secondary text-xs sm:text-[13.5px] text-ink-secondary font-normal leading-[1.75] max-w-xl">
                  {spotlight.supportingText}
                </p>
              )}

              {Array.isArray(spotlight.badges) && spotlight.badges.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[10.5px] sm:text-[11px] font-secondary uppercase tracking-[0.2em] text-ink-muted/80 font-normal">
                  {spotlight.badges.map((badge, bIdx) => (
                    <React.Fragment key={badge}>
                      {bIdx > 0 && <span className="text-ink-muted/80">•</span>}
                      <span>{badge}</span>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>

          {spotlight.ctaLink && (
            <div className="pt-6 sm:pt-6 md:pt-4 lg:pt-5">
              <Link
                href={spotlight.ctaLink}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink text-white font-primary text-xs sm:text-[13px] font-medium tracking-normal shadow-xs hover:bg-ink-secondary transition-colors"
              >
                <span>{spotlight.ctaText || 'The Zimor Story'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* 4 MASONRY PHOTOGRAPHY FRAMES WITH SONGMONT-STYLE OVERLAID TEXT & LOCKED WINDOW PARALLAX */}
        {/* Mobile: Completely hidden (display: none); Desktop: Exact existing grid layout, overlays & positioning */}
        {visibleFrames.map((frame, idx) => {
          const gridClass = frame.gridClasses || DEFAULT_GRID_CLASSES[idx % DEFAULT_GRID_CLASSES.length];
          return (
            <div
              key={frame.id || idx}
              className={`hidden md:block group relative overflow-hidden bg-ink rounded-none shadow-none ${gridClass}`}
            >
              {/* Inner Oversized Image Canvas: Only this scrolls inside the locked container */}
              <div
                ref={(el) => {
                  imgRefs.current[idx] = el;
                }}
                className="absolute -top-[25%] -bottom-[25%] left-0 right-0 h-[150%] w-full will-change-transform pointer-events-none"
              >
                <Image
                  src={frame.image}
                  alt={frame.alt || frame.title}
                  fill
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={`object-cover ${
                    frame.objectPosition || 'object-center'
                  } transition-transform duration-700 ease-out group-hover:scale-105`}
                />
              </div>

              {/* Subtle Gradient Tint for Text Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Reference-Image Text Overlay: Bottom-left bold white sans title + underlined link */}
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 z-10 space-y-1 sm:space-y-1.5 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.85)]">
                <h3 className="font-primary font-semibold text-white text-base sm:text-lg lg:text-xl xl:text-2xl leading-tight tracking-tight whitespace-pre-line">
                  {frame.title}
                </h3>
                {frame.linkHref && (
                  <div>
                    <Link
                      href={frame.linkHref}
                      className="inline-block font-primary text-xs sm:text-sm font-normal text-white underline underline-offset-4 decoration-white/80 hover:decoration-white transition-opacity"
                    >
                      {frame.linkText || 'Discover More'}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
