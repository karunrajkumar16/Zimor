'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Video, Image as ImageIcon } from 'lucide-react';
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
  order?: number;
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

// ============================================================================
// 1. HARD-CODED STATIC FRONTEND PRESENTATION & STRUCTURAL CONTENT
// These elements never depend on an API response or MongoDB to render.
// ============================================================================
export const STATIC_LIFESTYLE_CONFIG: LifestyleSectionData = {
  isPublished: true,
  eyebrow: 'FIND YOUR EVERYDAY MATCH',
  heading: 'Shop by Lifestyle',
  subheading:
    'Select your lifestyle to explore the silhouette engineered for your everyday rhythm, work focus, and travel escapes.',
  exploreLink: '/shop',
  exploreText: 'Explore All Silhouettes',
  cards: [
    {
      id: 'everyday',
      name: 'EVERYDAY',
      subtitle: 'For the everyday.',
      silhouette: 'The Classic Shoulder Bag',
      href: '/shop?section=everyday#everyday',
      topTitle: '',
      eyebrow: '',
      order: 1,
      isPublished: true,
    },
    {
      id: 'work',
      name: 'WORK',
      subtitle: 'For what lies ahead.',
      silhouette: 'The Rabota & Delo Totes',
      href: '/shop?section=work#work',
      topTitle: '',
      eyebrow: '',
      order: 2,
      isPublished: true,
    },
    {
      id: 'travel',
      name: 'TRAVEL',
      subtitle: 'For places beyond.',
      silhouette: 'The Rabota & Delo Totes',
      href: '/shop?section=travel#travel',
      topTitle: '',
      eyebrow: '',
      order: 3,
      isPublished: true,
    },
  ],
};

export const STATIC_CRAFTED_CONFIG: CraftedSectionData = {
  isPublished: true,
  heading: 'Crafted in India',
  description:
    'Rooted in centuries of master leatherworking traditions, every Zimor silhouette is meticulously crafted in the renowned artisan clusters of India. Combining generational hand-stitching with refined architectural precision, our craftsmen transform premium materials into enduring modern heirlooms.',
  ctaText: 'Discover More',
  ctaLink: '/about',
  supportingAlt: 'Crafted in India artisan heritage and leatherwork atelier',
};

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

  // Dynamic CMS state initialized with SSR props or null
  const [dynamicLifestyle, setDynamicLifestyle] = useState<LifestyleSectionData | null>(
    initialLifestyle || null
  );
  const [dynamicCrafted, setDynamicCrafted] = useState<CraftedSectionData | null>(
    initialCrafted || null
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
        if (!isMounted || !data?.content?.data) return;
        const pageData = data.content.data;
        if (pageData.lifestyle) {
          setDynamicLifestyle(pageData.lifestyle);
        }
        if (pageData.craftedInIndia) {
          setDynamicCrafted(pageData.craftedInIndia);
        }
      })
      .catch((err) => {
        console.warn('[LifestyleDiscovery] Offline or API unavailable; using static layout:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // ==========================================================================
  // HYBRID CONTENT MERGING
  // Combines static frontend layout/text with dynamic CMS media and overrides
  // ==========================================================================
  const isLifestylePublished = dynamicLifestyle?.isPublished ?? STATIC_LIFESTYLE_CONFIG.isPublished;
  const isCraftedPublished = dynamicCrafted?.isPublished ?? STATIC_CRAFTED_CONFIG.isPublished;

  const lifestyleHeading = dynamicLifestyle?.heading || STATIC_LIFESTYLE_CONFIG.heading;
  const lifestyleEyebrow = dynamicLifestyle?.eyebrow || STATIC_LIFESTYLE_CONFIG.eyebrow;
  const lifestyleSubheading = dynamicLifestyle?.subheading || STATIC_LIFESTYLE_CONFIG.subheading;
  const lifestyleExploreLink = dynamicLifestyle?.exploreLink || STATIC_LIFESTYLE_CONFIG.exploreLink;
  const lifestyleExploreText = dynamicLifestyle?.exploreText || STATIC_LIFESTYLE_CONFIG.exploreText;

  // Merge cards: dynamic cards override static cards, or static cards serve as permanent base
  const mergedCards: LifestyleCardItem[] = (
    dynamicLifestyle?.cards && dynamicLifestyle.cards.length > 0
      ? dynamicLifestyle.cards
      : STATIC_LIFESTYLE_CONFIG.cards
  ).map((card, idx) => {
    const staticBase = STATIC_LIFESTYLE_CONFIG.cards.find((c) => c.id === card.id) || STATIC_LIFESTYLE_CONFIG.cards[idx];
    return {
      id: card.id || staticBase?.id || `lifestyle-${idx}`,
      name: card.name || staticBase?.name || 'LIFESTYLE',
      subtitle: card.subtitle || staticBase?.subtitle || '',
      silhouette: card.silhouette || staticBase?.silhouette || '',
      href: card.href || staticBase?.href || '/shop',
      editorialImage: card.editorialImage || '',
      topTitle: card.topTitle ?? staticBase?.topTitle ?? '',
      eyebrow: card.eyebrow ?? staticBase?.eyebrow ?? '',
      order: card.order ?? staticBase?.order ?? idx + 1,
      isPublished: card.isPublished ?? staticBase?.isPublished ?? true,
    };
  });

  const visibleCards = mergedCards
    .filter((card) => card.isPublished !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Crafted in India merged fields
  const craftedHeading = dynamicCrafted?.heading || STATIC_CRAFTED_CONFIG.heading;
  const craftedDescription = dynamicCrafted?.description || STATIC_CRAFTED_CONFIG.description;
  const craftedCtaText = dynamicCrafted?.ctaText || STATIC_CRAFTED_CONFIG.ctaText;
  const craftedCtaLink = dynamicCrafted?.ctaLink || STATIC_CRAFTED_CONFIG.ctaLink;
  const craftedVideoUrl = dynamicCrafted?.videoUrl || '';
  const craftedPosterUrl = dynamicCrafted?.posterUrl || '';
  const craftedSupportingImage = dynamicCrafted?.supportingImage || '';
  const craftedSupportingAlt = dynamicCrafted?.supportingAlt || STATIC_CRAFTED_CONFIG.supportingAlt;

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

  // Parallax animation: preserves exact travel speeds and responsive offsets
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
  }, [visibleCards.length]);

  if (!isLifestylePublished && !isCraftedPublished) {
    return null;
  }

  return (
    <section ref={sectionRef} className="pt-10 sm:pt-16 pb-0 bg-canvas content-auto" aria-label="Shop by Lifestyle">
      {/* 1. SHOP BY LIFESTYLE */}
      {isLifestylePublished && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header: Static layout & typography */}
          <div className="mb-6 sm:mb-10">
            {lifestyleEyebrow && (
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#000000] font-bold mb-1.5 font-primary">
                {lifestyleEyebrow}
              </p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                {lifestyleHeading && (
                  <h2 className="font-primary text-2xl sm:text-3xl lg:text-4xl font-normal text-ink tracking-tight leading-tight">
                    {lifestyleHeading}
                  </h2>
                )}
                {lifestyleSubheading && (
                  <p className="text-xs sm:text-sm text-ink-secondary mt-1 font-normal max-w-xl leading-relaxed">
                    {lifestyleSubheading}
                  </p>
                )}
              </div>
              {lifestyleExploreLink && (
                <Link
                  href={lifestyleExploreLink}
                  className="inline-flex items-center gap-1.5 font-primary text-xs sm:text-sm font-medium tracking-normal text-ink hover:text-[#b4b4b4] transition-colors shrink-0"
                >
                  <span>{lifestyleExploreText}</span>
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
                    {hasImage ? (
                      <Image
                        src={pillar.editorialImage!}
                        alt={pillar.name || 'Lifestyle Silhouette'}
                        fill
                        sizes="(max-width: 768px) 70vw, 33vw"
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                        priority={idx === 0}
                      />
                    ) : (
                      /* Neutral Media Fallback: Preserves container & parallax without crashing */
                      <div
                        className="w-full h-full bg-[#181614] flex flex-col items-center justify-center p-6 text-center select-none"
                        aria-label={`${pillar.name} - ${pillar.silhouette}`}
                      >
                        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/20 mb-2">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-primary">
                          {pillar.name}
                        </span>
                      </div>
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

                  {/* Bottom Overlay Content: Fully hardcoded typography & structure */}
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

                    {/* Bottom Action Line: Unified design & static "Explore" label */}
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

      {/* 2. CRAFTED IN INDIA: Strathberry/Cafuné-Style 50/50 Full-Width Split Showcase */}
      {isCraftedPublished && (
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-[520px] lg:min-h-[640px]">
            {/* Left 50%: Full Bleed Craftsmanship Video Container (Dimensions strictly preserved) */}
            <div className="relative w-full h-[360px] sm:h-[480px] lg:h-full min-h-[360px] lg:min-h-[640px] bg-[#1A1816] overflow-hidden">
              {craftedVideoUrl && craftedVideoUrl.trim() ? (
                <video
                  ref={craftVideoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  poster={craftedPosterUrl && craftedPosterUrl.trim() ? craftedPosterUrl : undefined}
                  className="w-full h-full object-cover object-center"
                  aria-label={craftedHeading || 'Crafted in India video'}
                >
                  <source src={craftedVideoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : craftedPosterUrl && craftedPosterUrl.trim() ? (
                <Image
                  src={craftedPosterUrl}
                  alt={craftedHeading || 'Crafted in India'}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              ) : (
                /* Neutral Video Placeholder: Preserves 50% split dimensions when video is empty */
                <div
                  className="w-full h-full bg-[#161412] flex flex-col items-center justify-center p-8 text-center select-none"
                  aria-label="Artisanal Leather Craftsmanship"
                >
                  <div className="w-16 h-16 rounded-full border border-white/15 flex items-center justify-center text-white/30 mb-3">
                    <Video className="w-7 h-7 stroke-[1.5]" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40 font-primary">
                    Atelier Craftsmanship
                  </p>
                </div>
              )}
            </div>

            {/* Right 50%: Seamless Continuous Clean Editorial Panel */}
            <div className="p-8 sm:p-14 lg:p-20 xl:p-24 flex flex-col items-center justify-center text-center bg-white">
              {/* Title: Crafted in India (Static Heading) */}
              <h3 className="font-primary text-[38px] sm:text-[46px] md:text-[52px] font-normal text-ink tracking-tight mb-7 sm:mb-9 leading-none">
                {craftedHeading}
              </h3>

              {/* Inset Landscape Photograph Container: Dimensions strictly preserved to prevent layout shift */}
              <div className="relative w-full max-w-[460px] aspect-[3/2] overflow-hidden mb-7 sm:mb-9 bg-neutral-100 dark:bg-neutral-900 rounded-xs">
                {craftedSupportingImage && craftedSupportingImage.trim() ? (
                  <Image
                    src={craftedSupportingImage}
                    alt={craftedSupportingAlt || 'Crafted in India artisan heritage'}
                    fill
                    sizes="(max-width: 768px) 100vw, 460px"
                    className="object-cover object-center"
                    priority
                  />
                ) : (
                  /* Neutral Image Placeholder: Preserves aspect-[3/2] and margins */
                  <div
                    className="w-full h-full bg-[#F5F2EC] dark:bg-[#1E1C1A] flex flex-col items-center justify-center text-neutral-400 select-none"
                    aria-label="Artisan Heritage Atelier"
                  >
                    <ImageIcon className="w-8 h-8 opacity-40 stroke-[1.5] mb-2" />
                    <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-primary">
                      Artisan Heritage
                    </span>
                  </div>
                )}
              </div>

              {/* Editorial Body Paragraph */}
              <p className="font-secondary text-[13px] sm:text-[14px] text-ink-secondary font-normal leading-[1.8] max-w-[440px] mx-auto text-center mb-6 sm:mb-8">
                {craftedDescription}
              </p>

              {/* Underlined Call to Action: Static label & dynamic destination */}
              {craftedCtaLink && (
                <Link
                  href={craftedCtaLink}
                  className="font-primary text-xs sm:text-sm font-medium tracking-normal text-ink hover:text-[#b4b4b4] underline underline-offset-8 transition-colors"
                >
                  {craftedCtaText || 'Discover More'}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
