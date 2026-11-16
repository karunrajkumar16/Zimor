'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface MasonryFrame {
  id: string;
  title: string;
  linkText: string;
  linkHref: string;
  image: string;
  alt: string;
  gridClasses: string;
  objectPosition?: string;
}

const MASONRY_FRAMES: MasonryFrame[] = [
  // Second Picture: Craftsmanship & Atelier (Cols 6-9, Row 1)
  {
    id: 'frame-craftsmanship',
    title: 'Rooted in\nCraftsmanship',
    linkText: 'Discover More',
    linkHref: '/about',
    image: '/craftsmanship-atelier.jpg',
    alt: 'Artisan hand-stitching luxury leather with needle and waxed thread',
    gridClasses:
      'col-span-1 md:col-start-6 md:col-end-10 md:row-start-1 md:row-end-2 min-h-[260px] md:min-h-0',
    objectPosition: 'object-center',
  },

  // Third Picture: Handbag Details & Macro (Cols 10-12, Row 1)
  {
    id: 'frame-details',
    title: 'Designed for\nEveryday',
    linkText: 'Shop Now',
    linkHref: '/product/zimor-rabota-tote',
    image: '/products/rabota-4.jpg',
    alt: 'Macro texture of Zimor Rabota luxury bag showing zipper and grain',
    gridClasses:
      'col-span-1 md:col-start-10 md:col-end-13 md:row-start-1 md:row-end-2 min-h-[260px] md:min-h-0',
    objectPosition: 'object-top',
  },

  // Fifth Picture: Quality & Material Resilience (Cols 1-5, Row 2 — sitting directly below the text panel)
  {
    id: 'frame-quality',
    title: 'Details That\nMatter',
    linkText: 'Explore Details',
    linkHref: '/product/zimor-delo-tote',
    image: '/luxury-bag-tan.jpg',
    alt: 'Luxury cruelty-free leather handbag detailing with refined brass hardware',
    gridClasses:
      'col-span-2 md:col-start-1 md:col-end-6 md:row-start-2 md:row-end-3 min-h-[280px] md:min-h-0',
    objectPosition: 'object-center',
  },

  // Fourth Picture: Made in India / Provenance (Cols 6-12, Row 2 — ending on same surface as Fifth Picture)
  {
    id: 'frame-made-in-india',
    title: 'Proudly Made\nin India',
    linkText: 'Our Heritage',
    linkHref: '/about',
    image: '/artisan-heritage-landscape.jpg',
    alt: 'Master artisan in Indian leathercraft atelier surrounded by leather rolls and hand tools',
    gridClasses:
      'col-span-2 md:col-start-6 md:col-end-13 md:row-start-2 md:row-end-3 min-h-[280px] md:min-h-0',
    objectPosition: 'object-center',
  },
];

export const AboutZimor: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisibleRef = useRef(false);
  // Parallax element references for the inner images ONLY (Containers are fixed & locked)
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Smooth scroll-driven window parallax: only active when section is in viewport
  useEffect(() => {
    let isTicking = false;

    const updateParallax = () => {
      if (typeof window === 'undefined' || !isVisibleRef.current) return;
      const windowHeight = window.innerHeight;
      const isDesktop = window.innerWidth >= 768;

      imgRefs.current.forEach((imgEl, idx) => {
        if (!imgEl) return;
        const parentCard = imgEl.parentElement;
        if (!parentCard) return;

        const rect = parentCard.getBoundingClientRect();

        // Calculate card position relative to viewport center
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = windowHeight / 2;
        const totalSpan = (windowHeight + rect.height) / 2;
        const rawProgress = (viewportCenter - elementCenter) / (totalSpan || 1);
        const p = Math.max(-1.15, Math.min(1.15, rawProgress));

        // Different travel speeds per tile for organic cinematic depth across the masonry collage
        const speeds = isDesktop ? [65, 80, 70, 85] : [40, 50, 45, 55];
        const offset = p * speeds[idx];
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
  }, []);

  return (
    <section
      ref={sectionRef}
      className="pt-6 sm:pt-10 lg:pt-14 pb-10 sm:pb-14 lg:pb-18 bg-white select-none overflow-hidden w-full content-auto"
      aria-label="About Zimor - Editorial Campaign Collage"
    >
      {/* Seamless Edge-to-Edge Pinterest-Style Asymmetric Editorial Masonry Collage */}
      {/* 2-Row Grid: Fourth Image & Fifth Image share Row 2 for identical ending surface */}
      <div className="w-full grid grid-cols-2 md:grid-cols-12 md:grid-rows-[360px_390px] gap-1 sm:gap-1.5 md:gap-2 md:h-[750px] p-0 bg-white">
        {/* TILE 1 (Cols 1-5, Row 1): Prominent Heading & Editorial Story Panel — Creed Boutique Editorial Styling */}
        <div className="col-span-2 md:col-start-1 md:col-end-6 md:row-start-1 md:row-end-2 min-h-[320px] md:min-h-0 bg-white p-6 sm:p-8 lg:p-9 xl:p-10 flex flex-col justify-between">
          <div className="space-y-4 sm:space-y-4.5">
            <div>
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-[#000000] font-semibold mb-2 font-primary">
                About Zimor
              </p>
              <h2 className="font-primary text-[34px] sm:text-[42px] lg:text-[48px] font-normal text-ink tracking-tight leading-[1.15]">
                In the Spotlight
              </h2>
            </div>

            <p className="font-secondary text-sm sm:text-[15px] text-ink-secondary font-normal leading-[1.8] max-w-xl">
              A curated visual campaign capturing the convergence of Indian craftsmanship, architectural utility, and contemporary executive presence.
            </p>

            <div className="space-y-3 pt-0.5">
              <p className="font-secondary text-xs sm:text-[13.5px] text-ink-secondary font-normal leading-[1.75]">
                Sculpted for ambitious professional women across Mumbai, Delhi, and Bengaluru—built to carry modern tech without compromising architectural form.
              </p>

              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10.5px] sm:text-[11px] font-secondary uppercase tracking-[0.2em] text-ink-muted/80 font-normal">
                <span>Cruelty-Free Craft</span>
                <span className="text-ink-muted/80">•</span>
                <span>15.6&quot; Tech Protection</span>
                <span className="text-ink-muted/80">•</span>
                <span>Crafted in India</span>
              </div>
            </div>
          </div>

          <div className="pt-4 sm:pt-5">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink text-white font-primary text-xs sm:text-[13px] font-medium tracking-normal shadow-xs hover:bg-ink-secondary transition-colors"
            >
              <span>The Zimor Story</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 MASONRY PHOTOGRAPHY FRAMES WITH SONGMONT-STYLE OVERLAID TEXT & LOCKED WINDOW PARALLAX */}
        {MASONRY_FRAMES.map((frame, idx) => (
          <div
            key={frame.id}
            className={`group relative overflow-hidden bg-ink rounded-none shadow-none ${frame.gridClasses}`}
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
                alt={frame.alt}
                fill
                loading="lazy"
                decoding="async"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={`object-cover ${frame.objectPosition || 'object-center'} transition-transform duration-700 ease-out group-hover:scale-105`}
              />
            </div>

            {/* Subtle Gradient Tint for Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Reference-Image Text Overlay: Bottom-left bold white sans title + underlined link */}
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 z-10 space-y-1 sm:space-y-1.5 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.85)]">
              <h3 className="font-primary font-semibold text-white text-base sm:text-lg lg:text-xl xl:text-2xl leading-tight tracking-tight whitespace-pre-line">
                {frame.title}
              </h3>
              <div>
                <Link
                  href={frame.linkHref}
                  className="inline-block font-primary text-xs sm:text-sm font-normal text-white underline underline-offset-4 decoration-white/80 hover:decoration-white transition-opacity"
                >
                  {frame.linkText}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
