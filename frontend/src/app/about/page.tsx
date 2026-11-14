'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check } from 'lucide-react';
import { PRODUCTS } from '@/data/products';

// Three flagship silhouettes for Section 8 closing showcase
const FEATURED_SHOWCASE = [
  {
    product: PRODUCTS.find((p) => p.id === 'zimor-delo-tote-rust') || PRODUCTS[0],
    role: 'Executive & Boardroom Carry',
    fit: 'Fits 15.6" Laptops',
  },
  {
    product: PRODUCTS.find((p) => p.id === 'zimor-rabota-tote-cognac') || PRODUCTS[2],
    role: 'Dynamic Transit & Dual Carry',
    fit: 'Fits 15" Laptops',
  },
  {
    product: PRODUCTS.find((p) => p.id === 'zimor-classic-shoulder-bag-cream') || PRODUCTS[4],
    role: 'Sculptural French Silhouette',
    fit: 'Fits iPad & Essentials',
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white text-ink min-h-screen">
      {/* =========================================================================
          SECTION 1: ABOUT ZIMOR – BRAND INTRODUCTION (CINEMATIC HERO)
          ========================================================================= */}
      <section className="pt-4 sm:pt-6 pb-16 sm:pb-24 border-b border-line/60" aria-label="Brand Introduction">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav className="text-[11px] uppercase tracking-[0.2em] text-ink-muted flex items-center gap-2 mb-8 sm:mb-12 font-secondary">
            <Link href="/" className="hover:text-ink transition-colors">
              Home
            </Link>
            <span className="text-ink-muted">/</span>
            <span className="text-ink font-semibold">About Zimor</span>
          </nav>

          {/* Cinematic Hero Header */}
          <div className="max-w-4xl mb-10 sm:mb-14">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-brand-700 font-semibold mb-3 font-primary">
              About Zimor · Atelier &amp; House Introduction
            </p>
            <h1 className="font-primary text-[40px] sm:text-[54px] lg:text-[64px] font-normal text-ink tracking-tight leading-[1.05] mb-6">
              The Architecture of Everyday Carry.
            </h1>
            <p className="font-secondary text-[14px] sm:text-[16px] text-ink-secondary font-normal leading-[1.8] max-w-2xl">
              Zimor is an Indian luxury carry house conceived at the intersection of architectural discipline, master leathercraft, and executive function. We build structured silhouettes engineered to protect 15.6-inch laptops and daily essentials without sacrificing composure.
            </p>
          </div>

          {/* Cinematic Hero Full-Width Borderless Visual */}
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-[24/9] min-h-[300px] sm:min-h-[420px] overflow-hidden border-0 bg-ink">
            <Image
              src="/corporate-workspace-horizontal.jpg"
              alt="Zimor executive carry atelier and boardroom setting"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-5 left-5 sm:bottom-7 sm:left-7 z-10 text-white">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/95 text-[10px] uppercase tracking-[0.22em] font-primary font-semibold border border-white/20">
                <span>Handcrafted in India · Permanent Collection</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: OUR STORY (50/50 EDITORIAL SPLIT)
          ========================================================================= */}
      <section id="story" className="py-16 sm:py-28 border-b border-line/60 scroll-mt-20" aria-label="Our Story">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left Column: Narrative Copy */}
            <div className="lg:col-span-6 space-y-6">
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-brand-700 font-semibold font-primary">
                Our Story · Conceived in Mumbai
              </p>
              <h2 className="font-primary text-[34px] sm:text-[44px] lg:text-[50px] font-normal text-ink tracking-tight leading-[1.1]">
                Conceived from Real Workday Realities
              </h2>
              <div className="space-y-4 font-secondary text-[13px] sm:text-[14px] text-ink-secondary font-normal leading-[1.8]">
                <p>
                  Zimor was founded in Mumbai after observing an everyday paradox across India’s commercial centers. Professional women in legal chambers, management consulting, and technology leadership carry heavy 15.6-inch laptops, chargers, documents, and personal essentials every day.
                </p>
                <p>
                  Yet traditional luxury handbags fell into two extremes: unstructured designer totes that sagged and spilled their contents, or utilitarian polyester backpacks that felt out of place in boardrooms and client presentations.
                </p>
                <p>
                  We created Zimor to provide the third alternative: a bag with the structural posture of modern architecture, the interior utility of a mobile workstation, and the dignified elegance required for high-stakes business.
                </p>
              </div>

              <div className="pt-2">
                <a
                  href="#craftsmanship"
                  className="font-primary text-xs uppercase tracking-[0.22em] font-medium text-ink hover:text-brand-700 underline underline-offset-8 transition-colors inline-block"
                >
                  DISCOVER OUR CRAFT PROCESS →
                </a>
              </div>
            </div>

            {/* Right Column: Full-Height Borderless Portrait */}
            <div className="lg:col-span-6">
              <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-canvas">
                <Image
                  src="/brandgirl3.webp"
                  alt="Zimor Delo Tote carried in Mumbai corporate district"
                  fill
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-top"
                />
              </div>
              <p className="font-secondary text-[11px] text-ink-muted font-normal mt-3">
                The Delo Tote in Rust Caramel · Conceived in Mumbai, crafted in India
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: PROUDLY MADE IN INDIA (50/50 REVERSED SPREAD WITH VIDEO)
          ========================================================================= */}
      <section className="py-16 sm:py-28 border-b border-line/60 bg-canvas" aria-label="Proudly Made in India">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left Column: Frameless Artisan Video Player */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] overflow-hidden bg-black">
                <video
                  loop
                  muted
                  playsInline
                  preload="none"
                  poster="/craftsmanship-atelier.jpg"
                  className="w-full h-full object-cover object-center"
                  aria-label="Artisanal leather craftsmanship in Indian ateliers"
                >
                  <source src="/cafune-craftsmanship.mp4" type="video/mp4" />
                  <source src="/craftsmanship.mp4" type="video/mp4" />
                </video>
              </div>
              <p className="font-secondary text-[11px] text-ink-muted font-normal mt-3">
                Master leatherworkers shaping panels in our domestic partner atelier
              </p>
            </div>

            {/* Right Column: Indian Identity & Craft Narrative */}
            <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-brand-700 font-semibold font-primary">
                Indian Identity · Domestic Ateliers
              </p>
              <h2 className="font-primary text-[34px] sm:text-[44px] lg:text-[50px] font-normal text-ink tracking-tight leading-[1.1]">
                Proudly Made in India
              </h2>
              <div className="space-y-4 font-secondary text-[13px] sm:text-[14px] text-ink-secondary font-normal leading-[1.8]">
                <p>
                  India holds one of the world&apos;s oldest traditions of leatherworking, saddlery, and metal hardware finishing. Every Zimor silhouette is produced in domestic ateliers, partnering directly with master artisans who have perfected their trade over decades.
                </p>
                <p>
                  From hand-skiving panel borders to applying four coats of Italian edge paint, our craftsmen bring focused tactile wisdom to each stitch. By building in India, we preserve generational skill sets, champion fair living wages, and create authentic pieces built to global standards.
                </p>
              </div>

              {/* Factual Metrics Strip */}
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-line/60">
                <div>
                  <p className="font-primary text-3xl sm:text-4xl text-ink font-normal">100%</p>
                  <p className="font-secondary text-xs text-ink-muted mt-1 font-normal">Domestic Production</p>
                </div>
                <div>
                  <p className="font-primary text-3xl sm:text-4xl text-ink font-normal">24+</p>
                  <p className="font-secondary text-xs text-ink-muted mt-1 font-normal">Precision Steps</p>
                </div>
                <div>
                  <p className="font-primary text-3xl sm:text-4xl text-ink font-normal">0%</p>
                  <p className="font-secondary text-xs text-ink-muted mt-1 font-normal">Animal Hides</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/shop"
                  className="font-primary text-xs uppercase tracking-[0.22em] font-medium text-ink hover:text-brand-700 underline underline-offset-8 transition-colors inline-block"
                >
                  VIEW HANDCRAFTED BAGS →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: OUR CRAFTSMANSHIP (CREED-STYLE 4-COLUMN GALLERY)
          ========================================================================= */}
      <section id="craftsmanship" className="py-16 sm:py-28 border-b border-line/60 scroll-mt-20" aria-label="Our Craftsmanship">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12 sm:mb-16">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-brand-700 font-semibold mb-3 font-primary">
              Atelier Discipline · Process &amp; Quality
            </p>
            <h2 className="font-primary text-[34px] sm:text-[44px] lg:text-[50px] font-normal text-ink tracking-tight leading-[1.1] mb-4">
              Our Craftsmanship
            </h2>
            <p className="font-secondary text-[13px] sm:text-[14px] text-ink-secondary font-normal leading-[1.8]">
              Four deliberate phases of construction that ensure every Zimor piece maintains its architectural shape through years of daily carry.
            </p>
          </div>

          {/* Creed-Style 4-Column Frameless Image Gallery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {/* Step 1: Pattern Cutting */}
            <div className="space-y-4">
              <div className="relative w-full aspect-square overflow-hidden bg-canvas">
                <Image
                  src="/craftsmanship-workshop.jpg"
                  alt="Precision pattern cutting in artisan workshop"
                  fill
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center"
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-brand-700 font-semibold font-primary">
                  Phase 01 · Geometry
                </p>
                <h3 className="font-primary text-lg sm:text-xl font-normal text-ink">
                  Pattern Cutting &amp; Skiving
                </h3>
                <p className="font-secondary text-[13px] text-ink-secondary font-normal leading-[1.75]">
                  Panels are calibrated and skived to feather-edge tolerances, ensuring clean fold lines and minimal bulk at the seams.
                </p>
                <div className="pt-1">
                  <a
                    href="#story"
                    className="font-primary text-[11px] uppercase tracking-[0.2em] font-medium text-ink hover:text-brand-700 underline underline-offset-8 transition-colors inline-block"
                  >
                    DISCOVER GEOMETRY →
                  </a>
                </div>
              </div>
            </div>

            {/* Step 2: Internal Structure */}
            <div className="space-y-4">
              <div className="relative w-full aspect-square overflow-hidden bg-canvas">
                <Image
                  src="/products/delo-2.jpg"
                  alt="Internal laptop compartment and organizer structure"
                  fill
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center"
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-brand-700 font-semibold font-primary">
                  Phase 02 · Tech Protection
                </p>
                <h3 className="font-primary text-lg sm:text-xl font-normal text-ink">
                  Shock-Absorbing Cradles
                </h3>
                <p className="font-secondary text-[13px] text-ink-secondary font-normal leading-[1.75]">
                  Interior laptop partitions are reinforced with high-density foam padding to absorb drops and prevent tech damage.
                </p>
                <div className="pt-1">
                  <Link
                    href="/shop"
                    className="font-primary text-[11px] uppercase tracking-[0.2em] font-medium text-ink hover:text-brand-700 underline underline-offset-8 transition-colors inline-block"
                  >
                    VIEW TECH CRADLE →
                  </Link>
                </div>
              </div>
            </div>

            {/* Step 3: Edge Finishing */}
            <div className="space-y-4">
              <div className="relative w-full aspect-square overflow-hidden bg-canvas">
                <Image
                  src="/craftsmanship-atelier.jpg"
                  alt="Hand-applied edge paint on luxury handbag seams"
                  fill
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center"
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-brand-700 font-semibold font-primary">
                  Phase 03 · Finishing
                </p>
                <h3 className="font-primary text-lg sm:text-xl font-normal text-ink">
                  Four-Coat Edge Paint
                </h3>
                <p className="font-secondary text-[13px] text-ink-secondary font-normal leading-[1.75]">
                  Raw edges receive four coats of edge paint, hand-sanded between applications to form a water-resistant seal.
                </p>
                <div className="pt-1">
                  <a
                    href="#quality"
                    className="font-primary text-[11px] uppercase tracking-[0.2em] font-medium text-ink hover:text-brand-700 underline underline-offset-8 transition-colors inline-block"
                  >
                    INSPECT EDGE COAT →
                  </a>
                </div>
              </div>
            </div>

            {/* Step 4: Hardware & Assembly */}
            <div className="space-y-4">
              <div className="relative w-full aspect-square overflow-hidden bg-canvas">
                <Image
                  src="/luxury-handbag-detail.jpg"
                  alt="Solid brass studs and custom metal hardware"
                  fill
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center"
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-brand-700 font-semibold font-primary">
                  Phase 04 · Durability
                </p>
                <h3 className="font-primary text-lg sm:text-xl font-normal text-ink">
                  Solid Brass Base Studs
                </h3>
                <p className="font-secondary text-[13px] text-ink-secondary font-normal leading-[1.75]">
                  Five solid brass protective studs and heavy-gauge pullers are riveted through double-layer base plates.
                </p>
                <div className="pt-1">
                  <Link
                    href="/shop"
                    className="font-primary text-[11px] uppercase tracking-[0.2em] font-medium text-ink hover:text-brand-700 underline underline-offset-8 transition-colors inline-block"
                  >
                    EXAMINE HARDWARE →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: OUR DESIGN PHILOSOPHY (EDITORIAL SPREAD WITH FLATLAY)
          ========================================================================= */}
      <section className="py-16 sm:py-28 border-b border-line/60" aria-label="Our Design Philosophy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left Column: Design Philosophy Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-brand-700 font-semibold font-primary">
                Design Philosophy · Form &amp; Function
              </p>
              <h2 className="font-primary text-[34px] sm:text-[44px] lg:text-[50px] font-normal text-ink tracking-tight leading-[1.1]">
                Balancing Style with Everyday Usability
              </h2>
              <div className="space-y-4 font-secondary text-[13px] sm:text-[14px] text-ink-secondary font-normal leading-[1.8]">
                <p>
                  We design around the objects that accompany your workday. An executive handbag must balance crisp French contours with the pragmatic engineering of an industrial product.
                </p>
                <p>
                  No decorative gimmicks, no flimsy dividers. Every zipper pull, handle drop, and internal slot exists to serve a clear daily purpose—from securing transit cards to cradling heavy laptops.
                </p>
              </div>

              {/* Three Design Tenets */}
              <div className="pt-2 space-y-3.5 border-t border-line/60">
                <div className="space-y-1">
                  <h3 className="font-primary text-base font-normal text-ink">
                    01 · Upright Architecture
                  </h3>
                  <p className="font-secondary text-xs text-ink-secondary font-normal leading-relaxed">
                    Rigid reinforced base panels keep your bag standing upright beside your chair or boardroom table.
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="font-primary text-base font-normal text-ink">
                    02 · Dedicated Placement
                  </h3>
                  <p className="font-secondary text-xs text-ink-secondary font-normal leading-relaxed">
                    Dedicated internal pockets keep keys, chargers, cosmetics, and notebooks organized and reachable.
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="font-primary text-base font-normal text-ink">
                    03 · Fatigue-Free Drops
                  </h3>
                  <p className="font-secondary text-xs text-ink-secondary font-normal leading-relaxed">
                    Handles and slings calibrated to distribute up to 8 kilograms across the shoulder without strain.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/shop"
                  className="font-primary text-xs uppercase tracking-[0.22em] font-medium text-ink hover:text-brand-700 underline underline-offset-8 transition-colors inline-block"
                >
                  EXPLORE ERGONOMIC DESIGNS →
                </Link>
              </div>
            </div>

            {/* Right Column: Flatlay Image Showing Organization */}
            <div className="lg:col-span-6">
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] overflow-hidden bg-canvas">
                <Image
                  src="/products/delo-4.jpg"
                  alt="Zimor Delo Tote flatlay with laptop, notebook, charger, and daily accessories"
                  fill
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
              <p className="font-secondary text-[11px] text-ink-muted font-normal mt-3">
                The Delo Tote flatlay · Engineered for 15.6&quot; tech and daily workflow
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: OUR COMMITMENT TO QUALITY (MATERIALS & DURABILITY)
          ========================================================================= */}
      <section id="quality" className="py-16 sm:py-28 border-b border-line/60 bg-canvas scroll-mt-20" aria-label="Our Commitment to Quality">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left Column: Macro Material Grain Detail */}
            <div className="lg:col-span-6">
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] overflow-hidden bg-canvas">
                <Image
                  src="/luxury-tote-grain.jpg"
                  alt="Close-up macro grain of cruelty-free faux leather"
                  fill
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
              <p className="font-secondary text-[11px] text-ink-muted font-normal mt-3">
                High-density superior faux leather with scratch-resistant micro-coat
              </p>
            </div>

            {/* Right Column: Material Standards & Durability Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-brand-700 font-semibold font-primary">
                Material Standards · Zero Compromise
              </p>
              <h2 className="font-primary text-[34px] sm:text-[44px] lg:text-[50px] font-normal text-ink tracking-tight leading-[1.1]">
                Our Commitment to Quality
              </h2>
              <div className="space-y-4 font-secondary text-[13px] sm:text-[14px] text-ink-secondary font-normal leading-[1.8]">
                <p>
                  We reject the premise that luxury requires animal hides or toxic chrome tanning. Our micro-coated faux leather replicates the hand-feel, structural grain, and supple drape of calfskin while offering superior resistance to water, scratches, and humid weather.
                </p>
                <p>
                  Paired with solid brass hardware, smooth Japanese nylon zip tracks, and reinforced handles tested to hold up to 8 kilograms of cargo without stretching.
                </p>
              </div>

              {/* Factual Quality Checkpoints */}
              <div className="pt-2 space-y-2.5">
                <div className="flex items-center gap-2.5 text-[13px] text-ink-secondary font-secondary font-normal">
                  <Check className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                  <span>Scratch-resistant micro-coat resisting keys and daily abrasion</span>
                </div>
                <div className="flex items-center gap-2.5 text-[13px] text-ink-secondary font-secondary font-normal">
                  <Check className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                  <span>Water-resistant barrier protecting laptops during sudden rain</span>
                </div>
                <div className="flex items-center gap-2.5 text-[13px] text-ink-secondary font-secondary font-normal">
                  <Check className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                  <span>Load-tested handles calibrated to support up to 8 kg without fatigue</span>
                </div>
                <div className="flex items-center gap-2.5 text-[13px] text-ink-secondary font-secondary font-normal">
                  <Check className="w-3.5 h-3.5 text-brand-700 shrink-0" />
                  <span>Reinforced base panel with five solid brass protective studs</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/shop"
                  className="font-primary text-xs uppercase tracking-[0.22em] font-medium text-ink hover:text-brand-700 underline underline-offset-8 transition-colors inline-block"
                >
                  READ MATERIAL SPECIFICATIONS →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: OUR VISION & VALUES (3 CONTINUOUS TYPOGRAPHIC COLUMNS)
          ========================================================================= */}
      <section className="py-16 sm:py-28 border-b border-line/60" aria-label="Our Vision and Values">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12 sm:mb-16">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-brand-700 font-semibold mb-3 font-primary">
              House Principles · Vision &amp; Values
            </p>
            <h2 className="font-primary text-[34px] sm:text-[44px] lg:text-[50px] font-normal text-ink tracking-tight leading-[1.1] mb-4">
              What We Stand For
            </h2>
            <p className="font-secondary text-[13px] sm:text-[14px] text-ink-secondary font-normal leading-[1.8]">
              Three clear commitments guiding our design choices, manufacturing relationships, and client care.
            </p>
          </div>

          {/* Three Borderless Value Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="space-y-3">
              <span className="font-primary text-3xl sm:text-4xl text-ink-secondary font-normal block">
                01
              </span>
              <h3 className="font-primary text-xl sm:text-2xl font-normal text-ink">
                Functional Dignity
              </h3>
              <p className="font-secondary text-[13px] sm:text-[14px] text-ink-secondary font-normal leading-[1.8]">
                Professional women should never have to compromise between carrying what they need and looking composed in formal business settings.
              </p>
            </div>

            <div className="space-y-3">
              <span className="font-primary text-3xl sm:text-4xl text-ink-secondary font-normal block">
                02
              </span>
              <h3 className="font-primary text-xl sm:text-2xl font-normal text-ink">
                Ethical Production
              </h3>
              <p className="font-secondary text-[13px] sm:text-[14px] text-ink-secondary font-normal leading-[1.8]">
                We partner with domestic ateliers in India, paying fair living wages and preserving the heritage craft of generational leatherworkers.
              </p>
            </div>

            <div className="space-y-3">
              <span className="font-primary text-3xl sm:text-4xl text-ink-secondary font-normal block">
                03
              </span>
              <h3 className="font-primary text-xl sm:text-2xl font-normal text-ink">
                Conscious Permanence
              </h3>
              <p className="font-secondary text-[13px] sm:text-[14px] text-ink-secondary font-normal leading-[1.8]">
                We reject seasonal fast-fashion cycles. We release permanent silhouettes engineered to endure daily commutes for years.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: EXPLORE OUR COLLECTION (ENGAGING CLOSING VISUAL SECTION)
          ========================================================================= */}
      <section className="py-16 sm:py-28 bg-canvas" aria-label="Explore Our Collection">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-brand-700 font-semibold font-primary">
              The Permanent Collection
            </p>
            <h2 className="font-primary text-[36px] sm:text-[46px] lg:text-[54px] font-normal text-ink tracking-tight leading-none">
              Explore Our Collection
            </h2>
            <p className="font-secondary text-[13px] sm:text-[14px] text-ink-secondary font-normal leading-[1.8]">
              Discover our permanent line-up of six handcrafted silhouettes, built with dedicated laptop compartments, rigid base studs, and certified cruelty-free materials.
            </p>
          </div>

          {/* 3 Signature Silhouettes Showcase (Borderless Creed / Polène Style) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-14 sm:mb-20">
            {FEATURED_SHOWCASE.map((item) => {
              const p = item.product;
              return (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="group flex flex-col transition-opacity duration-300 hover:opacity-95"
                >
                  <div className="relative w-full aspect-square bg-canvas overflow-hidden mb-5 flex items-center justify-center p-6">
                    <Image
                      src={p.images[0]?.url}
                      alt={p.name}
                      fill
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 z-10">
                      <span className="text-[10px] font-primary font-medium uppercase tracking-[0.18em] text-ink-secondary bg-white/90 backdrop-blur-sm px-2.5 py-1">
                        {item.fit}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-brand-700 font-semibold font-primary">
                      {item.role}
                    </p>
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-primary text-xl sm:text-2xl font-normal text-ink group-hover:text-brand-700 transition-colors">
                        {p.name}
                      </h3>
                      <span className="font-secondary text-sm font-bold text-ink">
                        ₹{p.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="font-secondary text-[13px] text-ink-secondary font-normal leading-[1.7] line-clamp-2">
                      {p.description}
                    </p>
                    <div className="pt-2">
                      <span className="font-primary text-xs uppercase tracking-[0.2em] font-medium text-ink group-hover:text-brand-700 underline underline-offset-8 transition-colors inline-flex items-center gap-1.5">
                        <span>View Silhouette</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Signature Underlined CTA Link */}
          <div className="text-center pt-4">
            <Link
              href="/shop"
              className="inline-block font-primary text-xs uppercase tracking-[0.25em] font-medium text-ink hover:text-brand-700 underline underline-offset-8 transition-colors"
            >
              DISCOVER ALL HANDBAGS &amp; TOTES →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}