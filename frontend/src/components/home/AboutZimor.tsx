'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Layers } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export interface SpotlightFrame {
  id: string;
  title: string;
  linkText: string;
  linkHref: string;
  image?: string;
  alt?: string;
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

// ============================================================================
// 1. HARD-CODED STATIC FRONTEND PRESENTATION & MASONRY GALLERY STRUCTURE
// These elements never depend on an API response or MongoDB to render.
// ============================================================================
export const STATIC_SPOTLIGHT_CONFIG: SpotlightSectionData = {
  isPublished: true,
  tag: 'About Zimor',
  heading: 'In the Spotlight',
  leadText:
    'A curated visual campaign capturing the convergence of Indian craftsmanship, architectural utility, and contemporary executive presence.',
  supportingText:
    'Sculpted for ambitious professional women across Mumbai, Delhi, and Bengaluru—built to carry modern tech without compromising architectural form.',
  badges: ['Cruelty-Free Craft', '15.6" Tech Protection', 'Crafted in India'],
  ctaText: 'The Zimor Story',
  ctaLink: '/about',
  frames: [
    {
      id: 'frame-craftsmanship',
      title: 'Rooted in\nCraftsmanship',
      linkText: 'Discover More',
      linkHref: '/about',
      alt: 'Artisan hand-stitching luxury leather with needle and waxed thread',
      gridClasses:
        'col-span-1 md:col-start-6 md:col-end-10 md:row-start-1 md:row-end-2 min-h-[260px] md:min-h-0',
      objectPosition: 'object-center',
      order: 1,
      isPublished: true,
    },
    {
      id: 'frame-details',
      title: 'Designed for\nEveryday',
      linkText: 'Shop Now',
      linkHref: '/product/zimor-rabota-tote',
      alt: 'Macro texture of Zimor Rabota luxury bag showing zipper and grain',
      gridClasses:
        'col-span-1 md:col-start-10 md:col-end-13 md:row-start-1 md:row-end-2 min-h-[260px] md:min-h-0',
      objectPosition: 'object-top',
      order: 2,
      isPublished: true,
    },
    {
      id: 'frame-quality',
      title: 'Details That\nMatter',
      linkText: 'Explore Details',
      linkHref: '/product/zimor-delo-tote',
      alt: 'Luxury cruelty-free leather handbag detailing with refined brass hardware',
      gridClasses:
        'col-span-2 md:col-start-1 md:col-end-6 md:row-start-2 md:row-end-3 min-h-[280px] md:min-h-0',
      objectPosition: 'object-center',
      order: 3,
      isPublished: true,
    },
    {
      id: 'frame-made-in-india',
      title: 'Proudly Made\nin India',
      linkText: 'Our Heritage',
      linkHref: '/about',
      alt: 'Master artisan in Indian leathercraft atelier surrounded by leather rolls and hand tools',
      gridClasses:
        'col-span-2 md:col-start-6 md:col-end-13 md:row-start-2 md:row-end-3 min-h-[280px] md:min-h-0',
      objectPosition: 'object-center',
      order: 4,
      isPublished: true,
    },
  ],
};

interface AboutZimorProps {
  initialSpotlight?: SpotlightSectionData | null;
}

export const AboutZimor: React.FC<AboutZimorProps> = ({
  initialSpotlight,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisibleRef = useRef(false);
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Dynamic CMS state initialized with SSR props or null
  const [dynamicSpotlight, setDynamicSpotlight] = useState<SpotlightSectionData | null>(
    initialSpotlight || null
  );

  // Hydrate dynamic data from backend API without blocking initial static render
  useEffect(() => {
    let isMounted = true;
    apiFetch('/api/content/homepage')
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (!isMounted || !data?.content?.data?.spotlight) return;
        setDynamicSpotlight(data.content.data.spotlight);
      })
      .catch((err) => {
        console.warn('[AboutZimor] Offline or API unavailable; using static layout:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // ==========================================================================
  // HYBRID CONTENT MERGING
  // Combines static frontend layout/text with dynamic CMS media and overrides
  // ==========================================================================
  const isPublished = dynamicSpotlight?.isPublished ?? STATIC_SPOTLIGHT_CONFIG.isPublished;

  const tag = dynamicSpotlight?.tag || STATIC_SPOTLIGHT_CONFIG.tag;
  const heading = dynamicSpotlight?.heading || STATIC_SPOTLIGHT_CONFIG.heading;
  const leadText = dynamicSpotlight?.leadText || STATIC_SPOTLIGHT_CONFIG.leadText;
  const supportingText = dynamicSpotlight?.supportingText || STATIC_SPOTLIGHT_CONFIG.supportingText;
  const badges =
    dynamicSpotlight?.badges && dynamicSpotlight.badges.length > 0
      ? dynamicSpotlight.badges
      : STATIC_SPOTLIGHT_CONFIG.badges;
  const ctaText = dynamicSpotlight?.ctaText || STATIC_SPOTLIGHT_CONFIG.ctaText;
  const ctaLink = dynamicSpotlight?.ctaLink || STATIC_SPOTLIGHT_CONFIG.ctaLink;

  // Merge masonry frames: dynamic frames override static, or static frames serve as permanent base
  const mergedFrames: SpotlightFrame[] = (
    dynamicSpotlight?.frames && dynamicSpotlight.frames.length > 0
      ? dynamicSpotlight.frames
      : STATIC_SPOTLIGHT_CONFIG.frames
  ).map((frame, idx) => {
    const staticBase = STATIC_SPOTLIGHT_CONFIG.frames.find((f) => f.id === frame.id) || STATIC_SPOTLIGHT_CONFIG.frames[idx];
    return {
      id: frame.id || staticBase?.id || `frame-${idx}`,
      title: frame.title || staticBase?.title || 'Editorial Frame',
      linkText: frame.linkText || staticBase?.linkText || 'Discover More',
      linkHref: frame.linkHref || staticBase?.linkHref || '/about',
      alt: frame.alt || staticBase?.alt || 'Editorial frame',
      image: frame.image || '',
      gridClasses: frame.gridClasses || staticBase?.gridClasses || DEFAULT_GRID_CLASSES[idx % DEFAULT_GRID_CLASSES.length],
      objectPosition: frame.objectPosition || staticBase?.objectPosition || 'object-center',
      order: frame.order ?? staticBase?.order ?? idx + 1,
      isPublished: frame.isPublished ?? staticBase?.isPublished ?? true,
    };
  });

  const visibleFrames = mergedFrames
    .filter((f) => f.isPublished !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Multi-speed parallax calculation per masonry frame
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

  if (!isPublished) {
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
              {tag && (
                <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[#000000] font-semibold mb-2 font-primary">
                  {tag}
                </p>
              )}
              {heading && (
                <h2 className="font-primary text-[30px] sm:text-[38px] md:text-[42px] lg:text-[48px] font-normal text-ink tracking-tight leading-[1.15]">
                  {heading}
                </h2>
              )}
            </div>

            {leadText && (
              <p className="font-secondary text-sm sm:text-[15px] text-ink-secondary font-normal leading-[1.8] max-w-xl">
                {leadText}
              </p>
            )}

            <div className="space-y-3 pt-0.5">
              {supportingText && (
                <p className="font-secondary text-xs sm:text-[13.5px] text-ink-secondary font-normal leading-[1.75] max-w-xl">
                  {supportingText}
                </p>
              )}

              {Array.isArray(badges) && badges.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[10.5px] sm:text-[11px] font-secondary uppercase tracking-[0.2em] text-ink-muted/80 font-normal">
                  {badges.map((badge, bIdx) => (
                    <React.Fragment key={badge}>
                      {bIdx > 0 && <span className="text-ink-muted/80">•</span>}
                      <span>{badge}</span>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>

          {ctaLink && (
            <div className="pt-6 sm:pt-6 md:pt-4 lg:pt-5">
              <Link
                href={ctaLink}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink text-white font-primary text-xs sm:text-[13px] font-medium tracking-normal shadow-xs hover:bg-ink-secondary transition-colors"
              >
                <span>{ctaText || 'The Zimor Story'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* 4 MASONRY PHOTOGRAPHY FRAMES WITH SONGMONT-STYLE OVERLAID TEXT & LOCKED WINDOW PARALLAX */}
        {/* Mobile: Completely hidden (display: none); Desktop: Exact existing grid layout, overlays & positioning */}
        {visibleFrames.map((frame, idx) => {
          const gridClass = frame.gridClasses || DEFAULT_GRID_CLASSES[idx % DEFAULT_GRID_CLASSES.length];
          const hasImage = Boolean(frame.image && frame.image.trim());

          return (
            <div
              key={frame.id || idx}
              className={`hidden md:block group relative overflow-hidden bg-[#1A1816] rounded-none shadow-none ${gridClass}`}
            >
              {/* Inner Oversized Image Canvas: Only this scrolls inside the locked container */}
              <div
                ref={(el) => {
                  imgRefs.current[idx] = el;
                }}
                className="absolute -top-[25%] -bottom-[25%] left-0 right-0 h-[150%] w-full will-change-transform pointer-events-none"
              >
                {hasImage ? (
                  <Image
                    src={frame.image!}
                    alt={frame.alt || frame.title}
                    fill
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={`object-cover ${
                      frame.objectPosition || 'object-center'
                    } transition-transform duration-700 ease-out group-hover:scale-105`}
                  />
                ) : (
                  /* Neutral Frame Media Fallback: Preserves masonry tile without crashing */
                  <div
                    className="w-full h-full bg-[#181614] flex flex-col items-center justify-center p-6 text-center select-none"
                    aria-label={frame.alt || frame.title}
                  >
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/20 mb-2">
                      <Layers className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-primary">
                      Zimor Atelier
                    </span>
                  </div>
                )}
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
