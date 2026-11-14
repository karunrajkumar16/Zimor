'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GiftingCardItem {
  id: string;
  bagName: string;
  title: string;
  description: string;
  linkText: string;
  ctaHref: string;
  image: string;
  imageAlt: string;
}

const GIFT_CARDS: GiftingCardItem[] = [
  // 1. ZIMOR Delo Tote in Caramel (Flagship)
  {
    id: 'gift-delo-caramel',
    bagName: 'Delo Tote — Caramel Grain',
    title: 'The Art of Lasting Grace',
    description:
      'Celebrate career milestones, executive promotions, and cherished celebrations with our flagship Delo Tote. Meticulously shaped in supple cruelty-free grain composite with dedicated padded tech protection, each piece arrives encased in our signature keepsake box with an espresso ribbon and a personalized handwritten card.',
    linkText: 'Discover The Delo in Caramel',
    ctaHref: '/product/zimor-delo-tote',
    image: '/image.jpg',
    imageAlt: 'Zimor Delo luxury tote in rich caramel carry styling',
  },

  // 2. ZIMOR Delo Tote in Jet Noir
  {
    id: 'gift-delo-noir',
    bagName: 'Delo Tote — Jet Noir',
    title: 'The Executive Silhouette',
    description:
      'A commanding tribute to leadership, partner tracks, and boardroom triumphs. The Jet Noir Delo Tote unites architectural structure with storm-proof resilience, complemented by custom gold-tone hardware and our complimentary bespoke gift concierge.',
    linkText: 'Discover The Delo in Noir',
    ctaHref: '/product/zimor-delo-tote-noir',
    image: '/products/delo-3.jpg',
    imageAlt: 'Zimor Delo Tote in Jet Noir showing structured silhouette and matching wristlet',
  },

  // 3. ZIMOR Rabota Tote in Cognac Brown
  {
    id: 'gift-rabota-cognac',
    bagName: 'Rabota Tote — Cognac Brown',
    title: 'A Definitive Beginning',
    description:
      'Honor university graduations and first corporate steps with the versatile Rabota Tote. Engineered with eight intuitive organizer compartments and dual-carry agility to accompany her seamlessly into every presentation.',
    linkText: 'Discover The Rabota in Cognac',
    ctaHref: '/product/zimor-rabota-tote',
    image: '/products/rabota-1.jpg',
    imageAlt: 'Zimor Rabota Tote in rich Cognac Brown with dual grab handles',
  },

  // 4. ZIMOR Rabota Tote in Espresso Roast
  {
    id: 'gift-rabota-espresso',
    bagName: 'Rabota Tote — Espresso Roast',
    title: 'The Creative Visionary',
    description:
      'Deep earthy tones sculpted for architects, designers, and creative leaders. Built to cradle a 15-inch laptop alongside sketchbooks and tech essentials, finished with reinforced protective feet that stand effortlessly on any surface.',
    linkText: 'Discover The Rabota in Espresso',
    ctaHref: '/product/zimor-rabota-tote-espresso',
    image: '/products/rabota-3.jpg',
    imageAlt: 'Zimor Rabota Tote in deep Espresso Roast with detachable shoulder strap',
  },

  // 5. ZIMOR Classic Shoulder Bag in Jet Black & Cream
  {
    id: 'gift-classic-cream',
    bagName: 'Classic Shoulder Tote — Cream & Black',
    title: 'Monochrome Harmony',
    description:
      'A timeless celebration of festive reunions, anniversaries, and joyful surprises. Dual-tone cream and jet black leathercraft shaped into a featherlight silhouette that glides effortlessly from daytime galleries to candlelit dinners.',
    linkText: 'Discover The Classic in Cream',
    ctaHref: '/product/zimor-classic-shoulder-bag',
    image: '/products/classic-1.jpg',
    imageAlt: 'Zimor Classic Shoulder Bag in black with cream accents',
  },

  // 6. ZIMOR Classic Shoulder Bag in Tan & Gold
  {
    id: 'gift-classic-tan',
    bagName: 'Classic Shoulder Tote — Tan & Gold',
    title: 'Warm Sunlit Heritage',
    description:
      'Surprise someone extraordinary with sunlit tan leathercraft accented by custom-polished gold buckles. An enduring gift of warmth and daily companionship, delivered with sealed wax-look calligraphy cards across India.',
    linkText: 'Discover The Classic in Tan',
    ctaHref: '/product/zimor-classic-shoulder-bag-tan',
    image: '/luxury-bag-tan.jpg',
    imageAlt: 'Zimor Classic Shoulder Bag in rich tan leather grain with gold-tone buckle',
  },
];

export const GiftingBanner: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // Sync activeIndex with scroll position
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth } = scrollContainerRef.current;
    if (clientWidth === 0) return;
    const newIndex = Math.round(scrollLeft / clientWidth);
    setActiveIndex(Math.min(Math.max(newIndex, 0), GIFT_CARDS.length - 1));
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Scroll to a specific card index
  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    const clientWidth = scrollContainerRef.current.clientWidth;
    scrollContainerRef.current.scrollTo({
      left: index * clientWidth,
      behavior: 'smooth',
    });
    setActiveIndex(index);
  };

  const handlePrev = () => {
    const target = activeIndex === 0 ? GIFT_CARDS.length - 1 : activeIndex - 1;
    scrollToIndex(target);
  };

  const handleNext = () => {
    const target = activeIndex === GIFT_CARDS.length - 1 ? 0 : activeIndex + 1;
    scrollToIndex(target);
  };

  // Mouse drag support for desktop swiping
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <section
      className="py-14 sm:py-18 lg:py-24 bg-canvas-card border-b border-line select-none overflow-hidden"
      aria-label="The Art of Gifting — Creed Boutique Editorial Style"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Control Bar: Creed-inspired clean header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-brand-700 font-semibold mb-1">
              Services | The Art of Gifting
            </p>
            <h2 className="font-serif text-[34px] sm:text-[42px] lg:text-[48px] font-normal text-ink tracking-tight leading-[1.12]">
              Curated for Life&apos;s Defining Moments
            </h2>
          </div>

          {/* Arrow Navigation Controls */}
          <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-end">
            <button
              onClick={handlePrev}
              aria-label="Previous gift card"
              className="w-9 h-9 rounded-full border border-line hover:border-ink bg-white text-ink flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next gift card"
              className="w-9 h-9 rounded-full border border-line hover:border-ink bg-white text-ink flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Swipeable & Scrollable Cards Track */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar cursor-grab active:cursor-grabbing pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {GIFT_CARDS.map((card, idx) => (
            <div
              key={card.id}
              className="w-full shrink-0 snap-center rounded-lg overflow-hidden border border-line bg-canvas shadow-subtle"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center min-h-[440px] sm:min-h-[480px] lg:min-h-[520px]">
                {/* Visual Column */}
                <div className="lg:col-span-6 xl:col-span-6 relative aspect-square sm:aspect-4/3 lg:aspect-auto lg:h-full min-h-[340px] sm:min-h-[420px] lg:min-h-[520px] bg-canvas-alt">
                  <Image
                    src={card.image}
                    alt={card.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority={idx === 0}
                  />
                </div>

                {/* Content Column — Creed Boutique Editorial Text Style */}
                <div className="lg:col-span-6 xl:col-span-6 p-8 sm:p-12 lg:p-14 xl:p-16 flex flex-col justify-center">
                  <div className="space-y-4 sm:space-y-5 max-w-lg">
                    {/* Creed-Style Serif Headline */}
                    <h3 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-normal text-ink tracking-tight leading-[1.18]">
                      {card.title}
                    </h3>

                    {/* Creed-Style Refined Editorial Body Prose */}
                    <p className="font-sans text-sm sm:text-[15px] text-ink-secondary font-light leading-[1.8]">
                      {card.description}
                    </p>

                    {/* Creed-Style Understated Underlined Text Link */}
                    <div className="pt-3 sm:pt-4">
                      <Link
                        href={card.ctaHref}
                        className="inline-block font-sans text-sm font-medium text-ink hover:text-brand-700 underline underline-offset-8 decoration-ink/35 hover:decoration-brand-700 transition-colors tracking-wide"
                      >
                        {card.linkText}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Pagination Dots */}
        <div className="flex items-center justify-center mt-4 sm:mt-6 px-1">
          {/* 6 Clickable Indicator Dots */}
          <div className="flex items-center gap-2">
            {GIFT_CARDS.map((card, dotIdx) => (
              <button
                key={card.id}
                onClick={() => scrollToIndex(dotIdx)}
                aria-label={`Go to ${card.bagName}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  dotIdx === activeIndex
                    ? 'w-7 bg-brand-700'
                    : 'w-2 bg-line hover:bg-ink-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
