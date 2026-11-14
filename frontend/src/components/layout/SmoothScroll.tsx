'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, options?: { offset?: number; duration?: number; immediate?: boolean }) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scrollTo: () => {},
});

export const useLenisScroll = () => useContext(SmoothScrollContext);

interface SmoothScrollProps {
  children: React.ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let lenis: Lenis | null = null;
    let rafId: number | null = null;

    try {
      const LenisConstructor = (typeof Lenis === 'function' ? Lenis : (Lenis as any)?.default) as typeof Lenis;
      if (typeof LenisConstructor === 'function') {
        lenis = new LenisConstructor({
          lerp: 0.075, // Silky exponential damping (eliminates abrupt stops and stutter)
          smoothWheel: true,
          wheelMultiplier: 0.82, // Decreases scroll velocity by ~18% for composed, controlled scrolling
          touchMultiplier: 1.0,
          syncTouch: false, // Preserves natural high-refresh mobile gesture physics
          infinite: false,
          autoResize: true,
        });
        lenisRef.current = lenis;

        // Direct 60-120fps RAF loop
        const raf = (time: number) => {
          lenis?.raf(time);
          rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);
      }
    } catch (e) {
      console.warn('Lenis smooth scroll failed to initialize:', e);
    }

    // Intercept in-page hash links for luxurious buttery glide
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href) return;

      // Case 1: Pure hash link (e.g. href="#profession")
      if (href.startsWith('#') && href.length > 1) {
        const el = document.getElementById(href.slice(1)) || document.querySelector(href);
        if (el) {
          e.preventDefault();
          const header = document.querySelector('header');
          const headerOffset = header ? -header.offsetHeight : -80;
          lenis?.scrollTo(el as HTMLElement, { offset: headerOffset, duration: 1.0 });
          window.history.pushState(null, '', href);
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        }
      }
      // Case 2: Link on current page with hash (e.g. href="/shop#profession" or "/shop?section=profession#profession")
      else if (href.includes('#')) {
        const [targetPathWithQuery, hash] = href.split('#');
        const targetPath = targetPathWithQuery.split('?')[0];
        const currentPath = window.location.pathname;
        if (hash && (targetPath === currentPath || targetPath === '')) {
          const el = document.getElementById(hash);
          if (el) {
            e.preventDefault();
            const header = document.querySelector('header');
            const headerOffset = header ? -header.offsetHeight : -80;
            lenis?.scrollTo(el as HTMLElement, { offset: headerOffset, duration: 1.0 });
            window.history.pushState(null, '', href);
            window.dispatchEvent(new HashChangeEvent('hashchange'));
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true });
      if (rafId !== null) cancelAnimationFrame(rafId);
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, []);

  // When pathname changes (client-side route navigation), handle hash scroll or scroll to top
  useEffect(() => {
    if (!lenisRef.current) return;
    if (typeof window === 'undefined') return;

    const isProfession =
      window.location.hash.includes('profession') ||
      window.location.hash.includes('corporate') ||
      window.location.hash.includes('tech-transit') ||
      window.location.hash.includes('creative') ||
      window.location.search.includes('section=profession') ||
      sessionStorage.getItem('scroll_to_profession') === 'true';

    if (isProfession) {
      sessionStorage.removeItem('scroll_to_profession');
      let attempts = 0;
      const targetHash = window.location.hash ? window.location.hash.slice(1) : 'profession';
      const pollAndScroll = () => {
        const el = document.getElementById(targetHash) || document.getElementById('profession');
        if (el && lenisRef.current) {
          const header = document.querySelector('header');
          const headerOffset = header ? -header.offsetHeight : -80;
          lenisRef.current.scrollTo(el, { offset: headerOffset, duration: 1.0 });
        } else if (attempts < 25) {
          attempts++;
          setTimeout(pollAndScroll, 50);
        }
      };
      setTimeout(pollAndScroll, 60);
      return;
    }

    if (window.location.hash) {
      const hashId = window.location.hash.slice(1);
      let attempts = 0;
      const pollAndScroll = () => {
        const el = document.getElementById(hashId);
        if (el && lenisRef.current) {
          const header = document.querySelector('header');
          const headerOffset = header ? -header.offsetHeight : -80;
          lenisRef.current.scrollTo(el, { offset: headerOffset, duration: 1.0 });
        } else if (attempts < 25) {
          attempts++;
          setTimeout(pollAndScroll, 50);
        }
      };
      setTimeout(pollAndScroll, 60);
      return;
    }

    lenisRef.current.scrollTo(0, { immediate: true });
  }, [pathname]);

  const scrollTo = (
    target: string | number | HTMLElement,
    options?: { offset?: number; duration?: number; immediate?: boolean }
  ) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, options);
    }
  };

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisRef.current, scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

