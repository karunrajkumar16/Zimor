'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import type { AboutMediaMapping } from '@/types';

interface BrandValue {
  number: string;
  title: string;
  description: string;
}

interface AboutContentData {
  story?: {
    title?: string;
    subtitle?: string;
    paragraphs?: string[];
  };
  vision?: string;
  mission?: string;
  values?: BrandValue[];
}

export default function AboutPage() {
  const [aboutMedia, setAboutMedia] = useState<Partial<AboutMediaMapping>>({});
  const [aboutContent, setAboutContent] = useState<AboutContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dynamic About Page content & media from MongoDB Atlas
  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      apiFetch('/api/content/about').then((res) => (res.ok ? res.json() : null)),
      apiFetch('/api/about-media').then((res) => (res.ok ? res.json() : null)),
    ]).then(([contentResult, mediaResult]) => {
      if (!isMounted) return;

      if (contentResult.status === 'fulfilled' && contentResult.value?.content?.data) {
        setAboutContent(contentResult.value.content.data);
      }
      if (mediaResult.status === 'fulfilled' && mediaResult.value?.media) {
        setAboutMedia(mediaResult.value.media);
      }
      setIsLoading(false);
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const scrollToHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;
      const el = document.getElementById(hash);
      if (el) {
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 70;
        const targetPos = el.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    };

    // Scroll on mount if hash present with layout-settle retries
    scrollToHash();
    const timer1 = setTimeout(scrollToHash, 100);
    const timer2 = setTimeout(scrollToHash, 300);
    window.addEventListener('hashchange', scrollToHash);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('hashchange', scrollToHash);
    };
  }, []);

  return (
    <div className="bg-white text-ink min-h-screen">
      {/* =========================================================================
          BREADCRUMB NAVIGATION
          ========================================================================= */}
      <div className="pt-4 sm:pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-[11px] uppercase tracking-[0.2em] text-ink-muted flex items-center gap-2 mb-6 sm:mb-10 font-secondary">
            <Link href="/" className="hover:text-ink transition-colors">
              Home
            </Link>
            <span className="text-ink-muted">/</span>
            <span className="text-ink font-semibold">About Us</span>
          </nav>
        </div>
      </div>

      {/* =========================================================================
          SECTION 01 – BRAND OVERVIEW
          ========================================================================= */}
      <section
        id="brand-overview"
        className="scroll-mt-24 pb-16 sm:pb-24 border-b border-line/60"
        aria-label="Brand Overview"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mb-10 sm:mb-14">
            <h1 className="font-primary text-[36px] sm:text-[48px] lg:text-[58px] font-normal text-ink tracking-tight leading-[1.08] mb-6">
              Brand Overview
            </h1>
            <p className="font-secondary text-[15px] sm:text-[17px] text-ink-secondary font-normal leading-[1.85]">
              ZIMOR is a Premium fashion and accessories brand designed for the modern woman who believes that style is an expression of individuality. The brand combines globally inspired fashion aesthetics with practical functionality to create handbags and accessories that complement different personalities, lifestyles and occasions. ZIMOR stands for confidence, individuality, creativity and contemporary femininity. Its collections are designed to make everyday dressing more expressive through distinctive silhouettes, thoughtful details, modern colours and functional construction.
            </p>
          </div>

          {/* Editorial Visual Canvas */}
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-[24/9] min-h-[280px] sm:min-h-[400px] overflow-hidden bg-black">
            {aboutMedia.brandOverview?.url ? (
              <Image
                src={aboutMedia.brandOverview.url}
                alt={aboutMedia.brandOverview.alt || 'ZIMOR Premium fashion and accessories collection overview'}
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
              />
            ) : (
              <div className="absolute inset-0 bg-neutral-900 animate-pulse" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-5 left-5 sm:bottom-7 sm:left-7 z-10 text-white">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/95 text-[10px] uppercase tracking-[0.22em] font-primary font-semibold border border-white/20">
                ZIMOR · Distinctive Silhouettes &amp; Thoughtful Construction
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 02 – BRAND PHILOSOPHY
          ========================================================================= */}
      <section
        id="brand-philosophy"
        className="scroll-mt-24 py-20 sm:py-32 border-b border-line/60 bg-[#f8f8f8]"
        aria-label="Brand Philosophy"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-black font-bold mb-6 font-primary">
            BRAND PHILOSOPHY
          </p>
          <h2 className="sr-only">Brand Philosophy</h2>
          <blockquote className="font-primary text-[28px] sm:text-[40px] lg:text-[48px] font-normal text-ink tracking-tight leading-[1.25] sm:leading-[1.2]">
            &ldquo;Fashion should not be limited to special occasions. Every day is an opportunity to express yourself.&rdquo;
          </blockquote>
          <div className="w-12 h-0.5 bg-black mx-auto mt-8" />
        </div>
      </section>

      {/* =========================================================================
          SECTION 03 – BRAND STORY
          ========================================================================= */}
      <section
        id="brand-story"
        className="scroll-mt-24 py-16 sm:py-28 border-b border-line/60"
        aria-label="Brand Story"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left Column: Narrative Copy */}
            <div className="lg:col-span-7 space-y-6">
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-black font-bold font-primary">
                BRAND STORY
              </p>
              <h2 className="font-primary text-[32px] sm:text-[44px] lg:text-[50px] font-normal text-ink tracking-tight leading-[1.1]">
                The Story Behind Zimor
              </h2>
              <div className="space-y-5 font-secondary text-[14px] sm:text-[15.5px] text-ink-secondary font-normal leading-[1.85]">
                <p>
                  Zimor was born from a daughter&apos;s admiration for her father and his dedication to craftsmanship. Founded by Swati Singh, the inspiration began during a visit to her father&apos;s car seat-cover manufacturing company, where she witnessed the precision, care and attention to detail that went into creating each product. Fascinated by the process, she experimented with the same material to make a bag for herself, followed by two custom bags for personal use. What started as a personal experiment soon sparked a bigger vision: to bring the same level of precision and craftsmanship into something women could carry every day. After developing her first two samples, she realised the need for materials better suited to bag-making, which led her to research, explore and refine her approach before creating Zimor&apos;s first collection. Today, Zimor is a women&apos;s bags and accessories brand that brings together beautiful silhouettes, thoughtful details, quality materials and meticulous craftsmanship to create bags for different purposes and everyday moments. Because we believe the things women carry every day deserve to be crafted with care and precision.
                </p>
              </div>
            </div>

            {/* Right Column: Workshop & Craftsmanship Editorial Portrait */}
            <div className="lg:col-span-5">
              <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-canvas">
                {aboutMedia.brandStory?.url ? (
                  <Image
                    src={aboutMedia.brandStory.url}
                    alt={aboutMedia.brandStory.alt || 'Precision, care and attention to detail in craftsmanship'}
                    fill
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover object-center"
                  />
                ) : (
                  <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
                )}
              </div>
              <p className="font-secondary text-[11px] text-ink-muted font-normal mt-3">
                Crafted with care and precision · Founded by Swati Singh
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTIONS 04 & 05 – BRAND VISION & BRAND MISSION (PAIRED EDITORIAL SPREAD)
          ========================================================================= */}
      <section
        id="brand-vision-mission"
        className="scroll-mt-24 py-14 sm:py-24 border-b border-line/60 bg-[#f8f8f8]"
        aria-label="Brand Vision and Mission"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* SECTION 04 – BRAND VISION */}
            <div
              id="brand-vision"
              className="scroll-mt-28 group relative w-full aspect-[4/5] sm:aspect-[1/1] lg:aspect-[4/3] min-h-[420px] sm:min-h-[460px] overflow-hidden bg-black flex flex-col justify-end p-6 sm:p-8 lg:p-10"
            >
              {aboutMedia.brandVision?.url ? (
                <Image
                  src={aboutMedia.brandVision.url}
                  alt={aboutMedia.brandVision.alt || 'ZIMOR Brand Vision'}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              ) : (
                <div className="absolute inset-0 bg-neutral-900 animate-pulse" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10 pointer-events-none" />
              <div className="relative z-10 text-white max-w-xl">
                <h2 className="font-primary text-[26px] sm:text-[32px] lg:text-[36px] font-normal text-white tracking-tight mb-3 leading-[1.15]">
                  Brand Vision
                </h2>
                <p className="font-secondary text-[13.5px] sm:text-[15px] text-white/90 font-normal leading-[1.7] sm:leading-[1.75]">
                  {aboutContent?.vision || 'To become a globally recognised contemporary fashion accessories brand that inspires women through distinctive design, creativity and accessible premium fashion.'}
                </p>
              </div>
            </div>

            {/* SECTION 05 – BRAND MISSION */}
            <div
              id="brand-mission"
              className="scroll-mt-28 group relative w-full aspect-[4/5] sm:aspect-[1/1] lg:aspect-[4/3] min-h-[420px] sm:min-h-[460px] overflow-hidden bg-black flex flex-col justify-end p-6 sm:p-8 lg:p-10"
            >
              {aboutMedia.brandMission?.url ? (
                <Image
                  src={aboutMedia.brandMission.url}
                  alt={aboutMedia.brandMission.alt || 'ZIMOR Brand Mission'}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              ) : (
                <div className="absolute inset-0 bg-neutral-900 animate-pulse" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10 pointer-events-none" />
              <div className="relative z-10 text-white max-w-xl">
                <h2 className="font-primary text-[26px] sm:text-[32px] lg:text-[36px] font-normal text-white tracking-tight mb-3 leading-[1.15]">
                  Brand Mission
                </h2>
                <p className="font-secondary text-[13.5px] sm:text-[15px] text-white/90 font-normal leading-[1.7] sm:leading-[1.75]">
                  {aboutContent?.mission || 'To create fashion-forward handbags and accessories that combine distinctive aesthetics, functional design and quality, empowering modern women to express their individuality confidently.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 06 – BRAND VALUES (QUIET LUXURY EDITORIAL LEDGER)
          ========================================================================= */}
      <section
        id="brand-values"
        className="scroll-mt-24 py-10 sm:py-16 md:py-20 lg:py-28 border-b border-line/60 bg-white"
        aria-labelledby="brand-values-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-start">
            {/* Left Column: Masthead, Brand Philosophy Quote & Editorial Visual */}
            <div className="lg:col-span-5 space-y-6 sm:space-y-8 lg:sticky lg:top-28">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-black font-medium font-primary mb-2.5">
                  BRAND VALUES
                </p>
                <h2
                  id="brand-values-heading"
                  className="font-primary text-[30px] sm:text-[38px] lg:text-[46px] font-normal text-black tracking-tight leading-[1.08]"
                >
                  Brand Values
                </h2>
              </div>

              {/* Editorial Brand Philosophy Quote */}
              <div className="border-l-2 border-black pl-4 sm:pl-5 py-0.5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-black font-primary font-medium mb-1.5">
                  Brand Philosophy
                </p>
                <blockquote className="font-secondary text-[13.5px] sm:text-[15px] lg:text-[16px] text-ink-secondary leading-[1.7] font-normal">
                  &ldquo;Fashion should not be limited to special occasions. Every day is an opportunity to express yourself.&rdquo;
                </blockquote>
              </div>

              {/* Quiet Luxury Craftsmanship Editorial Photography (Tablet & Desktop) */}
              <div className="hidden md:block">
                <div className="relative w-full aspect-[4/5] overflow-hidden bg-white border border-line/40">
                  {aboutMedia.brandValues?.url ? (
                    <Image
                      src={aboutMedia.brandValues.url}
                      alt={aboutMedia.brandValues.alt || 'Artisanal leathercraft and precision stitching at the Zimor atelier'}
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 45vw, 35vw"
                      className="object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.02] motion-reduce:transition-none"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: The 7 Brand Values Editorial Hairline Ledger */}
            <div className="lg:col-span-7">
              <ol
                aria-label="Brand Values"
                className="border-t border-line/70 divide-y divide-line/70"
              >
                {(aboutContent?.values && aboutContent.values.length > 0 ? aboutContent.values : [
                  { number: '01', title: 'Individuality', description: 'Celebrating different personalities and personal styles.' },
                  { number: '02', title: 'Creativity', description: 'Exploring fresh silhouettes, colours, materials and design details.' },
                  { number: '03', title: 'Confidence', description: 'Creating accessories that make women feel expressive and empowered.' },
                  { number: '04', title: 'Functionality', description: 'Ensuring fashion complements everyday lifestyles.' },
                  { number: '05', title: 'Quality', description: 'Prioritising material selection, construction and finishing.' },
                  { number: '06', title: 'Innovation', description: 'Continuously evolving with changing fashion and consumer preferences.' },
                  { number: '07', title: 'Accessibility', description: 'Bringing premium-looking fashion within reach of a wider audience.' },
                ]).map((val) => (
                  <li
                    key={val.number}
                    className="group py-3.5 sm:py-5 lg:py-6 transition-colors duration-300 hover:bg-neutral-50 px-2 sm:px-3 -mx-2 sm:-mx-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-6">
                      <div className="flex items-baseline gap-2.5 sm:gap-3 shrink-0 sm:w-44 lg:w-48">
                        <span className="font-primary text-[11px] sm:text-xs lg:text-[13px] text-black font-medium tracking-[0.16em] shrink-0">
                          {val.number}
                        </span>
                        <h3 className="font-primary text-[15.5px] sm:text-[18px] lg:text-[20px] font-medium text-black tracking-tight transition-transform duration-300 group-hover:translate-x-1">
                          {val.title}
                        </h3>
                      </div>
                      <p className="font-secondary text-[12.5px] sm:text-[13.5px] lg:text-[14.5px] text-ink-secondary font-normal leading-[1.65] pl-5 sm:pl-0 flex-1">
                        {val.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CLOSING COLLECTION LINK
          ========================================================================= */}
      <section className="py-16 sm:py-20 text-center bg-white" aria-label="Shop Zimor">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-black text-white hover:bg-ink-secondary transition-all duration-300 font-primary text-xs sm:text-sm font-medium uppercase tracking-[0.16em]"
          >
            <span>Explore the Collection</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
