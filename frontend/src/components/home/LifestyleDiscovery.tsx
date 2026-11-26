'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export interface LifestyleCardItem {
  id: string;
  name: string;
  subtitle: string;
  silhouette: string;
  href: string;
  editorialImage?: string;
  topTitle?: string;
  eyebrow?: string;
  order: number;
  isPublished?: boolean;
}

export interface LifestyleSectionData {
  isPublished?: boolean;
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  exploreLink?: string;
  exploreText?: string;
  cards: LifestyleCardItem[];
}

export interface CraftedSectionData {
  isPublished?: boolean;
  heading?: string;
  description?: string;
  videoUrl?: string;
  posterUrl?: string;
  supportingImage?: string;
  supportingAlt?: string;
  ctaText?: string;
  ctaLink?: string;
}

interface LifestyleDiscoveryProps {
  initialLifestyle?: LifestyleSectionData | null;
  initialCrafted?: CraftedSectionData | null;
}

export const LifestyleDiscovery: React.FC<LifestyleDiscoveryProps> = ({
  initialLifestyle,
  initialCrafted,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const craftVideoRef = useRef<HTMLVideoElement>(null);
  const isVisibleRef = useRef(false);
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);

  const [lifestyle, setLifestyle] = useState<LifestyleSectionData | null>(initialLifestyle || null);
  const [crafted, setCrafted] = useState<CraftedSectionData | null>(initialCrafted || null);

  useEffect(() => {
    let isMounted = true;
    apiFetch('/api/content/homepage')
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (!isMounted || !data?.content?.data) return;
        const pageData = data.content.data;
        if (pageData.lifestyle) {
          setLifestyle(pageData.lifestyle);
        }
        if (pageData.craftedInIndia) {
          setCrafted(pageData.craftedInIndia);
        }
      })
      .catch((err) => {
        console.error('Failed to load homepage lifestyle content:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleCards = (lifestyle?.cards || [])
    .filter((card) => card.isPublished !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleTrackScroll = () => {
    if (!trackRef.current) return;
    const { scrollLeft, clientWidth } = trackRef.current;
    if (clientWidth === 0 || visibleCards.length === 0) return;
    const firstCard = trackRef.current.firstElementChild as HTMLElement;
    const cardWidth = firstCard?.clientWidth || clientWidth * 0.82;
    const gap = 14;
    const index = Math.round(scrollLeft / (cardWidth + gap));
    setActiveMobileIndex(Math.min(visibleCards.length - 1, Math.max(0, index)));
  };

  const scrollToPillar = (idx: number) => {
    if (!trackRef.current) return;
    const cardEl = trackRef.current.children[idx] as HTMLElement;
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

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
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = windowHeight / 2;
        const totalSpan = (windowHeight + rect.height) / 2;
        const rawProgress = (viewportCenter - elementCenter) / (totalSpan || 1);
        const p = Math.max(-1.15, Math.min(1.15, rawProgress));

        const speeds = isDesktop ? [85, 110, 90] : [55, 70, 60];
        const offset = p * (speeds[idx % speeds.length] || 85);
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
  }, [visibleCards.length, crafted]);

  const showLifestyle = lifestyle?.isPublished !== false;
  const showCrafted = crafted?.isPublished !== false;

  if (!showLifestyle && !showCrafted) {
    return null;
  }

  return (
    <section ref={sectionRef} className="pt-10 sm:pt-16 pb-0 bg-canvas content-auto" aria-label="Shop by Lifestyle">
      {showLifestyle && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-6 sm:mb-10">
            {lifestyle?.eyebrow && (
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#000000] font-bold mb-1.5 font-primary">
                {lifestyle.eyebrow}
              </p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                {lifestyle?.heading && (
                  <h2 className="font-primary text-2xl sm:text-3xl lg:text-4xl font-normal text-ink tracking-tight leading-tight">
                    {lifestyle.heading}
                  </h2>
                )}
                {lifestyle?.subheading && (
                  <p className="text-xs sm:text-sm text-ink-secondary mt-1 font-normal max-w-xl leading-relaxed">
                    {lifestyle.subheading}
                  </p>
                )}
              </div>
              {lifestyle?.exploreLink && (
                <Link
                  href={lifestyle.exploreLink}
                  className="inline-flex items-center gap-1.5 font-primary text-xs sm:text-sm font-medium tracking-normal text-ink hover:text-[#b4b4b4] transition-colors shrink-0"
                >
                  <span>{lifestyle.exploreText || 'Explore All Silhouettes'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
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
            {visibleCards.map((pillar, idx) => {
              const hasImage = Boolean(pillar.editorialImage && pillar.editorialImage.trim());

              return (
                <Link
                  key={pillar.id || idx}
                  href={pillar.href || '/shop'}
                  className="group relative h-[380px] sm:h-[460px] md:h-[520px] lg:h-[600px] w-[68vw] min-w-[245px] max-w-[290px] sm:w-[320px] sm:max-w-none md:w-full shrink-0 snap-start rounded-xl md:rounded-xs overflow-hidden text-left transition-all duration-500 cursor-pointer block border border-line/20 bg-[#1A1816] shadow-sm hover:shadow-lg"
                >
                  {/* Inner Image Canvas: Oversized & Translates Smoothly Inside the Locked Fixed Container */}
                  <div
                    ref={(el) => {
                      imgRefs.current[idx] = el;
                    }}
                    className="absolute -top-[20%] -bottom-[20%] left-0 right-0 h-[140%] w-full will-change-transform pointer-events-none"
                  >
                    {hasImage && (
                      <Image
                        src={pillar.editorialImage!}
                        alt={pillar.name || 'Lifestyle Silhouette'}
                        fill
                        sizes="(max-width: 768px) 70vw, 33vw"
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                        priority={idx === 0}
                      />
                    )}
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
                    {pillar.eyebrow && (
                      <p className="font-primary text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/80 font-medium">
                        {pillar.eyebrow}
                      </p>
                    )}
                    <h3 className="font-primary font-semibold text-white text-lg sm:text-xl lg:text-2xl leading-tight tracking-tight">
                      {pillar.name}
                    </h3>
                    <p className="font-secondary text-[11px] sm:text-xs text-white/90 font-normal leading-relaxed line-clamp-1 sm:line-clamp-none">
                      {pillar.subtitle}
                    </p>

                    {/* Bottom Action Line: Unified design for cards */}
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

          {/* Mobile Slide Position Indicators */}
          {visibleCards.length > 1 && (
            <div className="flex md:hidden items-center justify-center gap-2 mb-8 -mt-1">
              {visibleCards.map((pillar, idx) => (
                <button
                  key={pillar.id || idx}
                  type="button"
                  onClick={() => scrollToPillar(idx)}
                  className={`h-1.5 transition-all duration-300 rounded-full ${
                    activeMobileIndex === idx ? 'w-8 bg-ink' : 'w-2 bg-line hover:bg-ink-muted'
                  }`}
                  aria-label={`Go to slide - ${pillar.name}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Strathberry/Cafuné-Style 50/50 Full-Width Split Showcase */}
      {showCrafted && (
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-[520px] lg:min-h-[640px]">
            {/* Left 50%: Full Bleed Craftsmanship Video Container (Always maintains layout) */}
            <div className="relative w-full h-[360px] sm:h-[480px] lg:h-full min-h-[360px] lg:min-h-[640px] bg-[#1A1816] overflow-hidden">
              {crafted?.videoUrl && crafted.videoUrl.trim() ? (
                <video
                  ref={craftVideoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  poster={crafted.posterUrl && crafted.posterUrl.trim() ? crafted.posterUrl : undefined}
                  className="w-full h-full object-cover object-center"
                  aria-label={crafted.heading || 'Crafted in India video'}
                >
                  <source src={crafted.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : crafted?.posterUrl && crafted.posterUrl.trim() ? (
                <Image
                  src={crafted.posterUrl}
                  alt={crafted.heading || 'Crafted in India'}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              ) : null}
            </div>

            {/* Right 50%: Seamless Continuous Clean Editorial Panel */}
            <div className="p-8 sm:p-14 lg:p-20 xl:p-24 flex flex-col items-center justify-center text-center bg-white">
              {/* Title: Crafted in India */}
              {crafted?.heading && (
                <h3 className="font-primary text-[38px] sm:text-[46px] md:text-[52px] font-normal text-ink tracking-tight mb-7 sm:mb-9 leading-none">
                  {crafted.heading}
                </h3>
              )}

              {/* Inset Landscape Photograph Container (Always maintains dimensions to prevent layout shifts) */}
              <div className="relative w-full max-w-[460px] aspect-[3/2] overflow-hidden mb-7 sm:mb-9 bg-neutral-100 dark:bg-neutral-900 rounded-xs">
                {crafted?.supportingImage && crafted.supportingImage.trim() ? (
                  <Image
                    src={crafted.supportingImage}
                    alt={crafted.supportingAlt || crafted.heading || 'Crafted in India artisan heritage'}
                    fill
                    sizes="(max-width: 768px) 100vw, 460px"
                    className="object-cover object-center"
                    priority
                  />
                ) : null}
              </div>

              {/* Editorial Body Paragraph */}
              {crafted?.description && (
                <p className="font-secondary text-[13px] sm:text-[14px] text-ink-secondary font-normal leading-[1.8] max-w-[440px] mx-auto text-center mb-6 sm:mb-8">
                  {crafted.description}
                </p>
              )}

              {/* Underlined Call to Action */}
              {crafted?.ctaLink && (
                <Link
                  href={crafted.ctaLink}
                  className="font-primary text-xs sm:text-sm font-medium tracking-normal text-ink hover:text-[#b4b4b4] underline underline-offset-8 transition-colors"
                >
                  {crafted.ctaText || 'Discover More'}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
