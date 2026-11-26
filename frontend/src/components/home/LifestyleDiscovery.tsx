'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Laptop, Sparkles, Briefcase } from 'lucide-react';
import { apiFetch } from '@/lib/api';

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
    id: 'everyday',
    topTitle: '',
    number: '',
    eyebrow: '',
    name: 'EVERYDAY',
    subtitle: 'For the everyday.',
    silhouette: 'The Classic Shoulder Bag',
    href: '/shop?section=everyday#everyday',
    editorialImage: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917846/zimor/lifestyle/brandgirl3.webp',
    macroImage: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917840/zimor/products/classic-4.webp',
    icon: Sparkles,
  },
  {
    id: 'work',
    topTitle: '',
    number: '',
    eyebrow: '',
    name: 'WORK',
    subtitle: 'For what lies ahead.',
    silhouette: 'The Rabota & Delo Totes',
    href: '/shop?section=work#work',
    editorialImage: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917850/zimor/about/image.webp',
    macroImage: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917833/zimor/products/rabota-4.webp',
    icon: Laptop,
  },
  {
    id: 'travel',
    topTitle: '',
    number: '',
    eyebrow: '',
    name: 'TRAVEL',
    subtitle: 'For places beyond.',
    silhouette: 'The Rabota & Delo Totes',
    href: '/shop?section=travel#travel',
    editorialImage: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917845/zimor/lifestyle/brandgirl2.webp',
    macroImage: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp',
    icon: Briefcase,
  },
];

export const LifestyleDiscovery: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const craftVideoRef = useRef<HTMLVideoElement>(null);
  const isVisibleRef = useRef(false);
  // Parallax element references for the inner images ONLY (Containers are fixed, locked & borderless)
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);

  // Dynamic visual media state synchronized with MongoDB Visual Media Manager
  const [pillars, setPillars] = useState<PolenePillar[]>(PILLARS);
  const [craftPoster, setCraftPoster] = useState(
    'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917849/zimor/about/craftsmanship-atelier.webp'
  );
  const [craftVideoUrl, setCraftVideoUrl] = useState(
    'https://res.cloudinary.com/kbeyfu3d/video/upload/v1794917863/zimor/videos/cafune-craftsmanship.mp4'
  );
  const [craftSupportingImage, setCraftSupportingImage] = useState(
    'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917847/zimor/about/artisan-heritage-landscape.webp'
  );

  // Dynamic media synchronization on mount
  useEffect(() => {
    let isMounted = true;
    apiFetch('/api/homepage-media')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || !data?.media) return;
        const media = data.media;

        if (media.lifestyle_everyday?.url || media.lifestyle_work?.url || media.lifestyle_travel?.url) {
          setPillars((prev) =>
            prev.map((p) => {
              if (p.id === 'everyday' && media.lifestyle_everyday?.url) {
                return { ...p, editorialImage: media.lifestyle_everyday.url };
              }
              if (p.id === 'work' && media.lifestyle_work?.url) {
                return { ...p, editorialImage: media.lifestyle_work.url };
              }
              if (p.id === 'travel' && media.lifestyle_travel?.url) {
                return { ...p, editorialImage: media.lifestyle_travel.url };
              }
              return p;
            })
          );
        }

        if (media.craft_poster?.url) setCraftPoster(media.craft_poster.url);
        if (media.craft_video?.url) setCraftVideoUrl(media.craft_video.url);
        if (media.craft_supporting?.url) setCraftSupportingImage(media.craft_supporting.url);
      })
      .catch(() => {
        // Retain factory default constants gracefully
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleTrackScroll = () => {
    if (!trackRef.current) return;
    const { scrollLeft, clientWidth } = trackRef.current;
    if (clientWidth === 0) return;
    const firstCard = trackRef.current.firstElementChild as HTMLElement;
    const cardWidth = firstCard?.clientWidth || clientWidth * 0.82;
    const gap = 14;
    const index = Math.round(scrollLeft / (cardWidth + gap));
    setActiveMobileIndex(Math.min(PILLARS.length - 1, Math.max(0, index)));
  };

  const scrollToPillar = (idx: number) => {
    if (!trackRef.current) return;
    const cardEl = trackRef.current.children[idx] as HTMLElement;
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

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
          craftVideoRef.current?.play().catch(() => { });
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
    <section ref={sectionRef} className="pt-10 sm:pt-16 pb-0 bg-canvas content-auto" aria-label="Shop by Lifestyle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-6 sm:mb-10">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#000000] font-bold mb-1.5 font-primary">
            Find Your Everyday Match
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="font-primary text-2xl sm:text-3xl lg:text-4xl font-normal text-ink tracking-tight leading-tight">
                Shop by Lifestyle
              </h2>
              <p className="text-xs sm:text-sm text-ink-secondary mt-1 font-normal max-w-xl leading-relaxed">
                Select your lifestyle to explore the silhouette engineered for your everyday rhythm, work focus, and travel escapes.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 font-primary text-xs sm:text-sm font-medium tracking-normal text-ink hover:text-[#b4b4b4] transition-colors shrink-0"
            >
              <span>Explore All Silhouettes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Editorial Photography Cards:
            - Mobile: Comfortable horizontal swipable carousel with natural peek (~68vw) & snap
            - Desktop: Pure 3-Column Luxury Grid (md:grid-cols-3) */}
        <div
          ref={trackRef}
          onScroll={handleTrackScroll}
          className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory scroll-smooth no-scrollbar gap-3 sm:gap-4 lg:gap-4 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 mb-3 sm:mb-8 md:mb-12"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x pan-y',
            overscrollBehaviorX: 'contain',
            overscrollBehaviorY: 'auto',
          }}
        >
          {pillars.map((pillar, idx) => {
            return (
              <Link
                key={pillar.id}
                href={pillar.href}
                className="group relative h-[380px] sm:h-[460px] md:h-[520px] lg:h-[600px] w-[68vw] min-w-[245px] max-w-[290px] sm:w-[320px] sm:max-w-none md:w-full shrink-0 snap-start rounded-xl md:rounded-xs overflow-hidden text-left transition-all duration-500 cursor-pointer block border-none outline-none ring-0 shadow-sm hover:shadow-lg"
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
                    sizes="(max-width: 768px) 70vw, 33vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    priority={pillar.id === 'everyday'}
                  />
                </div>

                {/* Balanced Vignette Gradient for Top Title & Bottom Content */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/85 group-hover:from-black/60 group-hover:to-black/90 transition-opacity duration-300 pointer-events-none" />

                {/* Top Title: 1-2 Word Representative Category Title (if present) */}
                {pillar.topTitle && (
                  <div className="absolute top-4 sm:top-5 left-4 sm:left-5 z-10 pointer-events-none drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.85)]">
                    <h4 className="font-primary font-semibold text-white text-base sm:text-lg lg:text-xl tracking-tight leading-tight">
                      {pillar.topTitle}
                    </h4>
                  </div>
                )}

                {/* Bottom Overlay Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-white z-10 space-y-1.5 sm:space-y-2 pointer-events-none drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.85)]">
                  <p className="font-primary text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/80 font-medium">
                    {pillar.eyebrow}
                  </p>
                  <h3 className="font-primary font-semibold text-white text-lg sm:text-xl lg:text-2xl leading-tight tracking-tight">
                    {pillar.name}
                  </h3>
                  <p className="font-secondary text-[11px] sm:text-xs text-white/90 font-normal leading-relaxed line-clamp-1 sm:line-clamp-none">
                    {pillar.subtitle}
                  </p>

                  {/* Bottom Action Line: Unified design for all 3 cards */}
                  <div className="pt-2 sm:pt-2.5 border-t border-white/20 flex items-center justify-between text-xs pointer-events-auto">
                    <span className="font-primary font-medium text-white/90 flex items-center gap-1 group-hover:text-white text-[11px] sm:text-xs">
                      <span>{pillar.silhouette}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 font-primary text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-white/90 group-hover:text-white group-hover:translate-x-1 transition-all">
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile Slide Position Indicators (01 / 02 / 03) */}
        <div className="flex md:hidden items-center justify-center gap-2 mb-8 -mt-1">
          {pillars.map((pillar, idx) => (
            <button
              key={pillar.id}
              type="button"
              onClick={() => scrollToPillar(idx)}
              className={`h-1.5 transition-all duration-300 rounded-full ${activeMobileIndex === idx ? 'w-8 bg-ink' : 'w-2 bg-line hover:bg-ink-muted'
                }`}
              aria-label={`Go to slide - ${pillar.name}`}
            />
          ))}
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
              poster={craftPoster}
              className="w-full h-full object-cover object-center"
              aria-label="Artisanal leather craftsmanship and luxury handbag creation in India"
            >
              <source src={craftVideoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Right 50%: Seamless Continuous Clean Editorial Panel */}
          <div className="p-8 sm:p-14 lg:p-20 xl:p-24 flex flex-col items-center justify-center text-center bg-white">
            {/* Title: Crafted in India */}
            <h3 className="font-primary text-[38px] sm:text-[46px] md:text-[52px] font-normal text-ink tracking-tight mb-7 sm:mb-9 leading-none">
              Crafted in India
            </h3>

            {/* Inset Landscape Photograph */}
            <div className="relative w-full max-w-[460px] aspect-[3/2] overflow-hidden mb-7 sm:mb-9">
              <Image
                src={craftSupportingImage}
                alt="Crafted in India artisan heritage"
                fill
                sizes="(max-width: 768px) 100vw, 460px"
                className="object-cover object-center"
                priority
              />
            </div>

            {/* Editorial Body Paragraph */}
            <p className="font-secondary text-[13px] sm:text-[14px] text-ink-secondary font-normal leading-[1.8] max-w-[440px] mx-auto text-center mb-6 sm:mb-8">
              Rooted in centuries of master leatherworking traditions, every Zimor silhouette is meticulously crafted in the renowned artisan clusters of India. Combining generational hand-stitching with refined architectural precision, our craftsmen transform premium materials into enduring modern heirlooms.
            </p>

            {/* Underlined Call to Action */}
            <Link
              href="/about"
              className="font-primary text-xs sm:text-sm font-medium tracking-normal text-ink hover:text-[#b4b4b4] underline underline-offset-8 transition-colors"
            >
              Discover More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
