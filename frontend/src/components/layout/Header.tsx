'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, Search, Heart, ShoppingBag, User, X, ChevronDown, Mail, MessageSquare } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useProducts } from '@/context/ProductContext';
import { MobileNav } from './MobileNav';
import { useLenisScroll } from './SmoothScroll';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { itemCount, openCartDrawer } = useCart();
  const { wishlistCount } = useWishlist();
  const { products } = useProducts();
  const { lenis } = useLenisScroll();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isShopHovered, setIsShopHovered] = useState(false);
  const [isProfessionHovered, setIsProfessionHovered] = useState(false);
  const [isAboutHovered, setIsAboutHovered] = useState(false);
  const [isContactHovered, setIsContactHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfessionActive, setIsProfessionActive] = useState(false);

  const isHome = pathname === '/';

  // Cafuné adaptive scroll behavior: transparent on hero at scroll top, solid white on scroll & subpages
  useEffect(() => {
    let lastScrolled = window.scrollY > 20;
    setIsScrolled(lastScrolled);

    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      if (scrolled !== lastScrolled) {
        lastScrolled = scrolled;
        setIsScrolled(scrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Intelligent active section observer for /shop
  useEffect(() => {
    if (pathname !== '/shop') {
      setIsProfessionActive(false);
      return;
    }

    const checkActiveSection = () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash;
      if (
        hash === '#profession' ||
        hash === '#shop-by-profession' ||
        hash === '#lifestyle' ||
        hash === '#everyday' ||
        hash === '#work' ||
        hash === '#travel' ||
        hash === '#corporate-executive' ||
        hash === '#tech-transit' ||
        hash === '#creative-studio'
      ) {
        setIsProfessionActive(true);
        return;
      }

      const el = document.getElementById('profession');
      if (el) {
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 80;
        const rect = el.getBoundingClientRect();
        // If the top of the profession section is touching or past the header
        if (rect.top <= headerHeight + 10 && rect.bottom >= headerHeight) {
          setIsProfessionActive(true);
          return;
        }
      }
      setIsProfessionActive(false);
    };

    checkActiveSection();
    window.addEventListener('scroll', checkActiveSection, { passive: true });
    window.addEventListener('hashchange', checkActiveSection);
    return () => {
      window.removeEventListener('scroll', checkActiveSection);
      window.removeEventListener('hashchange', checkActiveSection);
    };
  }, [pathname]);

  const isShopActive = pathname === '/shop' && !isProfessionActive;

  const handleShopBagsClick = (e: React.MouseEvent) => {
    if (pathname === '/shop') {
      e.preventDefault();
      setIsShopHovered(false);
      if (lenis) {
        lenis.scrollTo(0, { duration: 0.8 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.history.pushState(null, '', '/shop');
      setIsProfessionActive(false);
    }
  };

  const handleProfessionClick = (e: React.MouseEvent) => {
    setIsProfessionHovered(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('scroll_to_profession', 'true');
    }
    if (pathname === '/shop') {
      e.preventDefault();
      const el = document.getElementById('profession');
      if (el) {
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 80;
        if (lenis) {
          lenis.scrollTo(el, { offset: -headerHeight, duration: 1.0 });
        } else {
          const rect = el.getBoundingClientRect();
          const targetScroll = rect.top + window.scrollY - headerHeight;
          window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
        window.history.pushState(null, '', '/shop?section=profession#profession');
        window.dispatchEvent(new HashChangeEvent('hashchange'));
        setIsProfessionActive(true);
      }
    }
  };

  const handleProfessionSubsectionClick = (sectionId: string, e?: React.MouseEvent) => {
    setIsProfessionHovered(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('scroll_to_section', sectionId);
    }
    if (pathname === '/shop') {
      if (e) e.preventDefault();
      const el = document.getElementById(sectionId);
      if (el) {
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 80;
        if (lenis) {
          lenis.scrollTo(el, { offset: -headerHeight, duration: 1.0 });
        } else {
          const rect = el.getBoundingClientRect();
          const targetScroll = rect.top + window.scrollY - headerHeight;
          window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
        window.history.pushState(null, '', `/shop?section=${sectionId}#${sectionId}`);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
        setIsProfessionActive(true);
      }
    }
  };

  const handleAboutSectionClick = (sectionId: string, e?: React.MouseEvent) => {
    setIsAboutHovered(false);
    if (pathname === '/about') {
      if (e) e.preventDefault();
      const el = document.getElementById(sectionId);
      if (el) {
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 70;
        const targetScroll = el.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        window.history.pushState(null, '', `/about#${sectionId}`);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
    }
  };

  const isTransparent = isHome && !isScrolled;

  const filteredSearch = searchQuery.trim()
    ? products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.categoryLabel && p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (Array.isArray(p.suitableProfessions) && p.suitableProfessions.some((pr) => pr.toLowerCase().includes(searchQuery.toLowerCase())))
    )
    : [];

  return (
    <>
      {/* Cafuné-Style Header — Transparent on Hero (No Borders), Solid White on Scroll */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ease-in-out ${isTransparent
          ? 'bg-transparent text-white'
          : 'bg-white/95 backdrop-blur-md text-ink shadow-xs'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center h-16 sm:h-20">
            {/* COLUMN 1: LEFT NAVIGATION */}
            <div className="flex items-center justify-start lg:justify-center">
              {/* Mobile Menu Trigger */}
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                className={`lg:hidden p-2 -ml-2 transition-opacity ${isTransparent ? 'text-white hover:opacity-75' : 'text-ink hover:opacity-60'
                  }`}
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5 stroke-[1.5]" />
              </button>

              {/* Left Nav Links — Miraggio Modern Clean Sans Typography */}
              <nav className="hidden lg:flex items-center gap-8 xl:gap-10 2xl:gap-12 font-primary text-[13px] xl:text-[13.5px] font-medium tracking-normal text-ink">
                {/* Shop Bags ⌵ */}
                <div
                  className="relative"
                  onMouseEnter={() => setIsShopHovered(true)}
                  onMouseLeave={() => setIsShopHovered(false)}
                >
                  <Link
                    href="/shop"
                    onClick={handleShopBagsClick}
                    className={`header-nav-link relative inline-flex items-center gap-1.5 py-1.5 transition-colors whitespace-nowrap ${isTransparent
                      ? 'text-white hover:text-white/80'
                      : isShopActive
                        ? 'text-ink font-semibold after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-ink'
                        : 'text-ink/80 hover:text-ink'
                      }`}
                  >
                    <span>Shop Bags</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 stroke-[1.8] transition-transform duration-200 ${isShopHovered ? 'rotate-180' : ''
                        } ${isTransparent ? 'text-white/80' : 'text-ink-muted'}`}
                    />
                  </Link>

                  {/* Dropdown Menu — Only Types */}
                  {isShopHovered && (
                    <div className="absolute top-full left-0 w-56 pt-2 z-50">
                      <div className="bg-white border border-line shadow-lift p-5 rounded-xs text-ink animate-in fade-in-50 duration-150">
                        <p className="font-primary font-semibold text-[11px] uppercase tracking-[0.1em] text-ink-muted/80 mb-2.5">
                          BY TYPES
                        </p>
                        <div className="space-y-1 text-left normal-case">
                          <Link
                            href="/shop"
                            onClick={() => setIsShopHovered(false)}
                            className="header-dropdown-link font-primary text-[13px] font-medium text-ink/80 hover:text-ink hover:underline underline-offset-4 transition-all block py-1"
                          >
                            All Handbags
                          </Link>
                          <Link
                            href="/shop?category=tote-bags"
                            onClick={() => setIsShopHovered(false)}
                            className="header-dropdown-link font-primary text-[13px] font-medium text-ink/80 hover:text-ink hover:underline underline-offset-4 transition-all block py-1"
                          >
                            Tote Bags
                          </Link>
                          <Link
                            href="/shop?category=laptop-bags"
                            onClick={() => setIsShopHovered(false)}
                            className="header-dropdown-link font-primary text-[13px] font-medium text-ink/80 hover:text-ink hover:underline underline-offset-4 transition-all block py-1"
                          >
                            Shoulder Bags
                          </Link>
                          <Link
                            href="/shop?category=shoulder-bags"
                            onClick={() => setIsShopHovered(false)}
                            className="header-dropdown-link font-primary text-[13px] font-medium text-ink/80 hover:text-ink hover:underline underline-offset-4 transition-all block py-1"
                          >
                            Crossbody &amp; Slings
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Shop by Profession ⌵ */}
                <div
                  className="relative"
                  onMouseEnter={() => setIsProfessionHovered(true)}
                  onMouseLeave={() => setIsProfessionHovered(false)}
                >
                  <Link
                    href="/shop?section=profession#profession"
                    onClick={handleProfessionClick}
                    className={`header-nav-link relative inline-flex items-center gap-1.5 py-1.5 transition-colors whitespace-nowrap ${isTransparent
                      ? 'text-white hover:text-white/80'
                      : isProfessionActive
                        ? 'text-ink font-semibold after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-ink'
                        : 'text-ink/80 hover:text-ink'
                      }`}
                  >
                    <span>Shop by Profession</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 stroke-[1.8] transition-transform duration-200 ${isProfessionHovered ? 'rotate-180' : ''
                        } ${isTransparent ? 'text-white/80' : 'text-ink-muted'}`}
                    />
                  </Link>

                  {/* Dropdown Menu — By Occasions / Profession */}
                  {isProfessionHovered && (
                    <div className="absolute top-full left-0 w-60 pt-2 z-50">
                      <div className="bg-white border border-line shadow-lift p-5 rounded-xs text-ink animate-in fade-in-50 duration-150">
                        <p className="font-primary font-semibold text-[11px] uppercase tracking-[0.1em] text-ink-muted/80 mb-2.5">
                          BY OCCASIONS
                        </p>
                        <div className="space-y-1 text-left normal-case">
                          <Link
                            href="/shop?section=everyday#everyday"
                            onClick={(e) => handleProfessionSubsectionClick('everyday', e)}
                            className="header-dropdown-link font-primary text-[13px] font-medium text-ink/80 hover:text-ink hover:underline underline-offset-4 transition-all block py-1"
                          >
                            Everyday
                          </Link>
                          <Link
                            href="/shop?section=work#work"
                            onClick={(e) => handleProfessionSubsectionClick('work', e)}
                            className="header-dropdown-link font-primary text-[13px] font-medium text-ink/80 hover:text-ink hover:underline underline-offset-4 transition-all block py-1"
                          >
                            Work
                          </Link>
                          <Link
                            href="/shop?section=travel#travel"
                            onClick={(e) => handleProfessionSubsectionClick('travel', e)}
                            className="header-dropdown-link font-primary text-[13px] font-medium text-ink/80 hover:text-ink hover:underline underline-offset-4 transition-all block py-1"
                          >
                            Travel
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </nav>
            </div>

            {/* COLUMN 2: CENTER BRAND LOGO (Perfect Mathematical Center) */}
            <div className="flex items-center justify-center shrink-0 px-4 sm:px-6 lg:px-7 xl:px-8">
              <Link
                href="/"
                className="inline-flex items-center justify-center py-1 transition-opacity hover:opacity-85"
                aria-label="Zimor India Home"
              >
                <Image
                  src="/logo.png"
                  alt="Zimor India"
                  width={1019}
                  height={231}
                  priority
                  className={`h-7 sm:h-8 md:h-9 lg:h-10 w-auto object-contain transition-all duration-300 ${isTransparent ? 'brightness-0 invert' : ''
                    }`}
                />
              </Link>
            </div>

            {/* COLUMN 3: RIGHT NAVIGATION & RIGHT-ALIGNED ACTION ICONS */}
            <div className="flex items-center justify-end w-full">
              {/* Right Nav Links — Miraggio Modern Clean Sans Typography */}
              <nav className="hidden lg:flex items-center gap-8 xl:gap-10 2xl:gap-12 font-primary text-[13px] xl:text-[13.5px] font-medium tracking-normal text-ink">
                {/* About Us ⌵ */}
                <div
                  className="relative"
                  onMouseEnter={() => setIsAboutHovered(true)}
                  onMouseLeave={() => setIsAboutHovered(false)}
                >
                  <Link
                    href="/about"
                    className={`header-nav-link relative inline-flex items-center gap-1.5 py-1.5 transition-colors whitespace-nowrap ${isTransparent
                      ? 'text-white hover:text-white/80'
                      : pathname === '/about'
                        ? 'text-ink font-semibold after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-ink'
                        : 'text-ink/80 hover:text-ink'
                      }`}
                  >
                    <span>About Us</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 stroke-[1.8] transition-transform duration-200 ${isAboutHovered ? 'rotate-180' : ''
                        } ${isTransparent ? 'text-white/80' : 'text-ink-muted'}`}
                    />
                  </Link>

                  {isAboutHovered && (
                    <div className="absolute top-full left-0 w-64 pt-2 z-50">
                      <div className="bg-white border border-line shadow-lift p-5 rounded-xs text-ink animate-in fade-in-50 duration-150">
                        <p className="font-primary font-semibold text-[11px] uppercase tracking-[0.1em] text-ink-muted/80 mb-2.5">
                          ABOUT ZIMOR
                        </p>
                        <div className="space-y-1 text-left normal-case">
                          <Link
                            href="/about#brand-overview"
                            onClick={(e) => handleAboutSectionClick('brand-overview', e)}
                            className="header-dropdown-link font-primary text-[13px] font-medium text-ink/80 hover:text-ink hover:underline underline-offset-4 transition-all block py-1"
                          >
                            Brand Overview
                          </Link>
                          <Link
                            href="/about#brand-philosophy"
                            onClick={(e) => handleAboutSectionClick('brand-philosophy', e)}
                            className="header-dropdown-link font-primary text-[13px] font-medium text-ink/80 hover:text-ink hover:underline underline-offset-4 transition-all block py-1"
                          >
                            Brand Philosophy
                          </Link>
                          <Link
                            href="/about#brand-story"
                            onClick={(e) => handleAboutSectionClick('brand-story', e)}
                            className="header-dropdown-link font-primary text-[13px] font-medium text-ink/80 hover:text-ink hover:underline underline-offset-4 transition-all block py-1"
                          >
                            Brand Story
                          </Link>
                          <Link
                            href="/about#brand-vision-mission"
                            onClick={(e) => handleAboutSectionClick('brand-vision-mission', e)}
                            className="header-dropdown-link font-primary text-[13px] font-medium text-ink/80 hover:text-ink hover:underline underline-offset-4 transition-all block py-1"
                          >
                            Brand Vision and Mission
                          </Link>
                          <Link
                            href="/about#brand-values"
                            onClick={(e) => handleAboutSectionClick('brand-values', e)}
                            className="header-dropdown-link font-primary text-[13px] font-medium text-ink/80 hover:text-ink hover:underline underline-offset-4 transition-all block py-1"
                          >
                            Brand Values
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Us ⌵ */}
                <div
                  className="relative"
                  onMouseEnter={() => setIsContactHovered(true)}
                  onMouseLeave={() => setIsContactHovered(false)}
                >
                  <Link
                    href="/contact"
                    className={`header-nav-link relative inline-flex items-center gap-1.5 py-1.5 transition-colors whitespace-nowrap ${isTransparent
                      ? 'text-white hover:text-white/80'
                      : pathname === '/contact'
                        ? 'text-ink font-semibold after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-ink'
                        : 'text-ink/80 hover:text-ink'
                      }`}
                  >
                    <span>Contact Us</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 stroke-[1.8] transition-transform duration-200 ${isContactHovered ? 'rotate-180' : ''
                        } ${isTransparent ? 'text-white/80' : 'text-ink-muted'}`}
                    />
                  </Link>

                  {isContactHovered && (
                    <div className="absolute top-full right-0 w-[280px] pt-2 z-50">
                      <div className="bg-white border border-line shadow-lift p-4 rounded-xs text-ink animate-in fade-in-50 duration-150">
                        <p className="font-primary font-semibold text-[11px] uppercase tracking-[0.1em] text-ink-muted/80 mb-3">
                          DIRECT CONTACT
                        </p>
                        <div className="space-y-1.5 text-left normal-case">
                          {/* 1. Direct Email */}
                          <a
                            href="mailto:zimorindia@gmail.com"
                            onClick={() => setIsContactHovered(false)}
                            className="flex items-center gap-3 p-2 rounded-xs hover:bg-[#f5f5f5] transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-black group-hover:bg-[#EA4335] group-hover:text-white transition-colors shrink-0">
                              <Mail className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-primary text-[13px] font-medium text-ink group-hover:text-[#EA4335] transition-colors">
                                Send an Email
                              </p>
                              <p className="text-[11px] text-ink-muted truncate">zimorindia@gmail.com</p>
                            </div>
                          </a>

                          {/* 2. Direct WhatsApp */}
                          <a
                            href="https://wa.me/918604647888"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsContactHovered(false)}
                            className="flex items-center gap-3 p-2 rounded-xs hover:bg-[#f5f5f5] transition-colors group"
                          >
                            <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-black group-hover:bg-[#25D366] group-hover:text-white transition-colors shrink-0">
                              <MessageSquare className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-primary text-[13px] font-medium text-ink group-hover:text-[#25D366] transition-colors">
                                WhatsApp
                              </p>
                              <p className="text-[11px] text-ink-muted truncate">+91 86046 47888</p>
                            </div>
                          </a>

                          {/* Divider and Visit Contact Page */}
                          <div className="pt-2 mt-2 border-t border-line">
                            <Link
                              href="/contact"
                              onClick={() => setIsContactHovered(false)}
                              className="font-primary text-[12px] font-medium text-black hover:underline block text-center py-1 transition-colors"
                            >
                              Visit Contact Page →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </nav>

              {/* Action Icons in Cafuné sequence: User, Search, Wishlist, Bag (Far Right) */}
              <div className="flex items-center gap-4 sm:gap-4.5 xl:gap-5 ml-6 lg:ml-8 xl:ml-12 2xl:ml-14">
                {/* 1. User / Account (Hidden on phone view, accessible via drawer) */}
                <Link
                  href="/account"
                  className={`hidden sm:inline-flex p-1.5 sm:p-2 transition-opacity ${isTransparent ? 'text-white hover:opacity-75' : 'text-ink hover:opacity-60'
                    }`}
                  aria-label="Customer Account"
                >
                  <User className="w-[19px] h-[19px] sm:w-5 sm:h-5 stroke-[1.35]" />
                </Link>

                {/* 2. Search */}
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={`p-1.5 sm:p-2 transition-opacity ${isTransparent ? 'text-white hover:opacity-75' : 'text-ink hover:opacity-60'
                    }`}
                  aria-label="Search products"
                >
                  <Search className="w-[19px] h-[19px] sm:w-5 sm:h-5 stroke-[1.35]" />
                </button>

                {/* 3. Wishlist (Heart) */}
                <Link
                  href="/wishlist"
                  className={`relative p-1.5 sm:p-2 transition-opacity ${isTransparent ? 'text-white hover:opacity-75' : 'text-ink hover:opacity-60'
                    }`}
                  aria-label={`Wishlist (${wishlistCount} items)`}
                >
                  <Heart className="w-[19px] h-[19px] sm:w-5 sm:h-5 stroke-[1.35]" />
                  {wishlistCount > 0 && (
                    <span
                      className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs ${isTransparent ? 'bg-white text-black' : 'bg-black text-white'
                        }`}
                    >
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* 4. Bag / Cart (Signature Cafuné style with circle count badge) */}
                <button
                  type="button"
                  onClick={openCartDrawer}
                  className={`relative p-1.5 sm:p-2 transition-opacity ${isTransparent ? 'text-white hover:opacity-75' : 'text-ink hover:opacity-60'
                    }`}
                  aria-label={`Shopping bag (${itemCount} items)`}
                >
                  <ShoppingBag className="w-[19px] h-[19px] sm:w-5 sm:h-5 stroke-[1.35]" />
                  <span
                    className={`absolute -top-1 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs ${isTransparent ? 'bg-white text-ink' : 'bg-ink text-white'
                      }`}
                  >
                    {itemCount}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar Flyout */}
        {isSearchOpen && (
          <div className="border-t border-line bg-canvas-card px-4 py-4 sm:py-6 shadow-md animate-in slide-in-from-top-2 duration-200 text-ink">
            <div className="max-w-3xl mx-auto">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-ink-muted stroke-[1.5]" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search silhouettes, laptop sizes, professions (Delo, Rabota, Crescent)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-canvas text-sm border border-line rounded-none focus:outline-none focus:border-ink transition-colors font-secondary"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="absolute right-3 p-1.5 text-ink-muted hover:text-ink transition-colors rounded"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4 stroke-[1.5]" />
                </button>
              </div>

              {searchQuery.trim() && (
                <div className="mt-4 border-t border-line pt-3">
                  <p className="text-xs text-ink-muted mb-2 font-medium">
                    Found {filteredSearch.length} product{filteredSearch.length === 1 ? '' : 's'}:
                  </p>
                  {filteredSearch.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto">
                      {filteredSearch.map((p) => (
                        <Link
                          key={p.id}
                          href={`/product/${p.slug}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center gap-3 p-2 hover:bg-canvas rounded transition-colors group"
                        >
                          <div className="relative w-12 h-12 bg-canvas-alt shrink-0 border border-line">
                            <Image
                              src={p.images[0].url}
                              alt={p.name}
                              fill
                              loading="lazy"
                              decoding="async"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-black group-hover:underline transition-colors">
                              {p.name}
                            </p>
                            <p className="text-[11px] text-ink-muted">
                              ₹{p.price.toLocaleString('en-IN')}{' '}
                              <span className="line-through text-ink-muted">
                                ₹{p.compareAtPrice.toLocaleString('en-IN')}
                              </span>
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-ink-muted py-4 text-center">
                      No matching products found. Try searching for "Tote", "Laptop", or "Shoulder".
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Nav Slide-over */}
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
    </>
  );
};
