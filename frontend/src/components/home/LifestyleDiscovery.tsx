'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Laptop, Sparkles, Briefcase } from 'lucide-react';

interface PolenePillar {
  id: string;
  topTitle: string;
  number: string;
  eyebrow: string;
  name: string;
  subtitle: string;
  silhouette: string;
  href: string;
  editorialImage: string;
  macroImage: string;
  icon: React.ElementType;
}

const PILLARS: PolenePillar[] = [
  {
    id: 'corporate-executive',
    topTitle: 'Executive Carry',
    number: '01',
    eyebrow: 'Corporate • Legal • Executive',
    name: 'The Executive Suite',
    subtitle: '15.6" Executive Laptop Tote',
    silhouette: 'The Delo Collection',
    href: '/product/zimor-delo-tote',
    editorialImage: '/brandgirl3.webp',
    macroImage: '/products/classic-4.jpg',
    icon: Briefcase,
  },
  {
    id: 'tech-transit',
    topTitle: 'Daily Commute',
    number: '02',
    eyebrow: 'Tech • Founders • Commute',
    name: 'The Dynamic Commute',
    subtitle: '15" Dual-Carry Laptop Tote',
    silhouette: 'The Rabota Collection',
    href: '/product/zimor-rabota-tote',
    editorialImage: '/image.jpg',
    macroImage: '/products/rabota-4.jpg',
    icon: Laptop,
  },
  {
    id: 'creative-studio',
    topTitle: 'Creative Studio',
    number: '03',
    eyebrow: 'Design • Curators • Evening',
    name: 'The Creative Studio',
    subtitle: 'Sculptural Crescent Handbag',
    silhouette: 'The Classic Collection',
    href: '/product/zimor-classic-shoulder-bag',
    editorialImage: '/brandgirl2.webp',
    macroImage: '/products/classic-4.jpg',
    icon: Sparkles,
  },
];

export const LifestyleDiscovery: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const craftVideoRef = useRef<HTMLVideoElement>(null);
  const isVisibleRef = useRef(false);
  // Parallax element references for the inner images ONLY (Containers are fixed, locked & borderless)
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Smooth, scroll-driven window parallax: only active when section is in viewport
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

        // Travel speeds for inner image scrolling inside locked container
        const speeds = isDesktop ? [85, 110, 90] : [55, 70, 60];
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
          craftVideoRef.current?.play().catch(() => {});
        } else {
          craftVideoRef.current?.pause();
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
    <section ref={sectionRef} className="pt-6 sm:pt-10 pb-0 bg-canvas content-auto" aria-label="Shop by Profession and Lifestyle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-6 sm:mb-10">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-brand-700 font-bold mb-1.5">
            Find Your Everyday Match
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-[34px] sm:text-[42px] lg:text-[48px] font-normal text-ink tracking-tight leading-[1.12]">
                Shop by Profession & Lifestyle
              </h2>
              <p className="text-xs sm:text-sm text-ink-secondary mt-1 font-light max-w-xl">
                Select your daily routine to explore the silhouette engineered for your workday carry, tech protection, and transit agility.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink hover:text-brand-700 transition-colors shrink-0"
            >
              <span>Explore All Silhouettes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 3-Column Editorial Photography Grid: All 3 Cards Borderless with Uniform Clean Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 lg:gap-4 mb-8 sm:mb-12">
          {PILLARS.map((pillar, idx) => {
            return (
              <Link
                key={pillar.id}
                href={pillar.href}
                className="group relative h-[480px] sm:h-[560px] lg:h-[640px] w-full rounded-xs overflow-hidden text-left transition-all duration-500 cursor-pointer block border-none outline-none ring-0 shadow-none hover:shadow-lg"
              >
                {/* Inner Image Canvas: Oversized & Translates Smoothly Inside the Locked Fixed Container */}
                <div
                  ref={(el) => {
                    imgRefs.current[idx] = el;
                  }}
                  className="absolute -top-[20%] -bottom-[20%] left-0 right-0 h-[140%] w-full will-change-transform pointer-events-none"
                >
                  <Image
                    src={pillar.editorialImage}
                    alt={pillar.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    priority={pillar.id === 'corporate-executive'}
                  />
                </div>

                {/* Balanced Vignette Gradient for Top Title & Bottom Content */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/85 group-hover:from-black/60 group-hover:to-black/90 transition-opacity duration-300 pointer-events-none" />

                {/* Top Title: 1-2 Word Representative Category Title */}
                <div className="absolute top-5 sm:top-6 left-5 sm:left-6 z-10 pointer-events-none drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.85)]">
                  <h4 className="font-sans font-bold text-white text-lg sm:text-xl lg:text-[22px] tracking-tight leading-tight">
                    {pillar.topTitle}
                  </h4>
                </div>

                {/* Bottom Overlay Content with About-Brand Style Bold Sans Typography */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white z-10 space-y-2 pointer-events-none drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.85)]">
                  <p className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-white/80 font-medium">
                    {pillar.eyebrow}
                  </p>
                  <h3 className="font-sans font-bold text-white text-xl sm:text-2xl lg:text-[26px] leading-tight tracking-tight">
                    {pillar.name}
                  </h3>
                  <p className="font-sans text-xs sm:text-[13px] text-white/90 font-normal leading-relaxed">
                    {pillar.subtitle}
                  </p>

                  {/* Bottom Action Line: Unified design for all 3 cards */}
                  <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs pointer-events-auto">
                    <span className="font-sans font-medium text-white/90 flex items-center gap-1 group-hover:text-white">
                      <span>{pillar.silhouette}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 font-sans text-[11px] uppercase tracking-wider font-semibold text-white/90 group-hover:text-white group-hover:translate-x-1 transition-all">
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Strathberry/Cafuné-Style 50/50 Full-Width Split Showcase (Clean & Static) */}
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-[520px] lg:min-h-[640px]">
          {/* Left 50%: Full Bleed Craftsmanship Video */}
          <div className="relative w-full h-[360px] sm:h-[480px] lg:h-full min-h-[360px] lg:min-h-[640px] bg-canvas-alt overflow-hidden">
            <video
              ref={craftVideoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster="/craftsmanship-atelier.jpg"
              className="w-full h-full object-cover object-center"
              aria-label="Artisanal leather craftsmanship and luxury handbag creation in India"
            >
              <source src="/cafune-craftsmanship.mp4" type="video/mp4" />
              <source src="/craftsmanship.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Right 50%: Seamless Continuous Clean Editorial Panel */}
          <div className="p-8 sm:p-14 lg:p-20 xl:p-24 flex flex-col items-center justify-center text-center bg-white">
            {/* Title: Crafted in India */}
            <h3 className="font-serif text-[38px] sm:text-[46px] md:text-[52px] font-normal text-ink tracking-tight mb-7 sm:mb-9 leading-none">
              Crafted in India
            </h3>

            {/* Inset Landscape Photograph */}
            <div className="relative w-full max-w-[460px] aspect-[3/2] overflow-hidden mb-7 sm:mb-9">
              <Image
                src="/artisan-heritage-landscape.jpg"
                alt="Crafted in India artisan heritage"
                fill
                sizes="(max-width: 768px) 100vw, 460px"
                className="object-cover object-center"
                priority
              />
            </div>

            {/* Editorial Body Paragraph */}
            <p className="font-sans text-[13px] sm:text-[14px] text-ink-secondary font-light leading-[1.8] max-w-[440px] mx-auto text-center mb-6 sm:mb-8">
              Rooted in centuries of master leatherworking traditions, every Zimor silhouette is meticulously crafted in the renowned artisan clusters of India. Combining generational hand-stitching with refined architectural precision, our craftsmen transform premium materials into enduring modern heirlooms.
            </p>

            {/* Underlined Call to Action */}
            <Link
              href="/about"
              className="font-sans text-xs uppercase tracking-[0.22em] font-medium text-ink hover:text-brand-700 underline underline-offset-8 transition-colors"
            >
              DISCOVER MORE
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
