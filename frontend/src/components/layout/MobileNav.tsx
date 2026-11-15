'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  X,
  ChevronDown,
  Heart,
  User,
  ShoppingBag,
  ShieldCheck,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavSection {
  id: string;
  label: string;
  badge?: string;
  subItems: {
    label: string;
    href: string;
    isFeatured?: boolean;
    onClick?: () => void;
  }[];
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { wishlistCount } = useWishlist();
  const { itemCount } = useCart();

  // Progressive disclosure: only one section open at a time, initially all closed
  const [activeSection, setActiveSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSection = (id: string) => {
    setActiveSection((prev) => (prev === id ? null : id));
  };

  const handleProfessionScroll = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('scroll_to_profession', 'true');
    }
    onClose();
    if (typeof window !== 'undefined' && window.location.pathname === '/shop') {
      setTimeout(() => {
        const el = document.getElementById('profession');
        if (el) {
          const header = document.querySelector('header');
          const headerHeight = header ? header.offsetHeight : 64;
          const rect = el.getBoundingClientRect();
          const targetScroll = rect.top + window.scrollY - headerHeight;
          window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
      }, 120);
    }
  };

  const SECTIONS: NavSection[] = [
    {
      id: 'collections',
      label: 'Collections',
      badge: '6 Silhouettes',
      subItems: [
        { label: 'View All Workbags (6)', href: '/shop', isFeatured: true },
        { label: 'Tote Bags (15.6" Laptop Fit)', href: '/shop?category=tote-bags' },
        { label: 'Laptop Bags with Crossbody Sling', href: '/shop?category=laptop-bags' },
        { label: 'Shoulder Bags (Sculptural Crescent)', href: '/shop?category=shoulder-bags' },
      ],
    },
    {
      id: 'profession',
      label: 'Shop by Profession',
      badge: 'Curated',
      subItems: [
        {
          label: 'Explore All Work Archetypes',
          href: '/shop?section=profession#profession',
          isFeatured: true,
          onClick: handleProfessionScroll,
        },
        {
          label: 'Corporate & Executive Carry',
          href: '/shop?section=profession#profession',
          onClick: handleProfessionScroll,
        },
        {
          label: 'Dynamic Commuter & Tech Founders',
          href: '/shop?section=profession#profession',
          onClick: handleProfessionScroll,
        },
        {
          label: 'Creative Studio & Evening Carry',
          href: '/shop?section=profession#profession',
          onClick: handleProfessionScroll,
        },
      ],
    },
    {
      id: 'about',
      label: 'About Zimor',
      subItems: [
        { label: 'Brand Overview', href: '/about#brand-overview', isFeatured: true },
        { label: 'Brand Philosophy', href: '/about#brand-philosophy' },
        { label: 'Brand Story', href: '/about#brand-story' },
        { label: 'Brand Vision and Mission', href: '/about#brand-vision-mission' },
        { label: 'Brand Values', href: '/about#brand-values' },
      ],
    },
    {
      id: 'care',
      label: 'Customer Care',
      subItems: [
        { label: 'Track Your Order', href: '/account/orders', isFeatured: true },
        { label: 'Policy & Customer Guidelines', href: '/policy' },
        { label: 'Frequently Asked Questions (FAQ)', href: '/faq' },
        { label: 'Client Concierge & Support', href: '/contact' },
      ],
    },
  ];

  return (
    <div data-lenis-prevent-modal className="fixed inset-0 z-50 lg:hidden">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Canvas — Clean Pure White Architecture */}
      <div
        data-lenis-prevent-modal
        className="fixed inset-y-0 left-0 w-full max-w-[310px] bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-300 overflow-y-auto"
      >
        <div>
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-line/60">
            <Link href="/" onClick={onClose} className="relative w-28 h-7">
              <Image src="/logo.png" alt="Zimor India" fill className="object-contain" priority />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-ink-muted hover:text-ink transition-colors rounded-full hover:bg-canvas-card"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Quick Account / Wishlist / Cart Bar */}
          <div className="grid grid-cols-3 border-b border-line/60 bg-zimor-cream/10 text-center py-2.5">
            <Link
              href="/account"
              onClick={onClose}
              className="flex flex-col items-center gap-1 text-ink-secondary hover:text-ink transition-colors py-1"
            >
              <User className="w-4 h-4 stroke-[1.5] text-ink" />
              <span className="text-[11px] font-medium tracking-tight">Account</span>
            </Link>
            <Link
              href="/wishlist"
              onClick={onClose}
              className="flex flex-col items-center gap-1 text-ink-secondary hover:text-ink transition-colors border-x border-line/60 py-1"
            >
              <Heart className="w-4 h-4 stroke-[1.5] text-ink" />
              <span className="text-[11px] font-medium tracking-tight">Wishlist ({wishlistCount})</span>
            </Link>
            <Link
              href="/cart"
              onClick={onClose}
              className="flex flex-col items-center gap-1 text-ink-secondary hover:text-ink transition-colors py-1"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.5] text-ink" />
              <span className="text-[11px] font-medium tracking-tight">Bag ({itemCount})</span>
            </Link>
          </div>

          {/* Progressive Disclosure Accordion List */}
          <div className="divide-y divide-line/40">
            {SECTIONS.map((section) => {
              const isExpanded = activeSection === section.id;

              return (
                <div key={section.id} className="transition-colors">
                  {/* Top-Level Trigger Button */}
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-5 py-3.5 flex items-center justify-between text-left group hover:bg-zimor-cream/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-primary text-[14px] font-medium text-ink tracking-tight">
                        {section.label}
                      </span>
                      {section.badge && (
                        <span className="text-[9px] font-medium uppercase tracking-wider text-ink-muted bg-zimor-cream/25 px-1.5 py-0.5 rounded-sm">
                          {section.badge}
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-ink-muted transition-transform duration-200 ease-out group-hover:text-ink ${
                        isExpanded ? 'rotate-180 text-ink' : ''
                      }`}
                    />
                  </button>

                  {/* Sub-Items (Progressive Disclosure upon Interaction) */}
                  {isExpanded && (
                    <div className="px-5 pb-3 pt-1 animate-in slide-in-from-top-1 duration-200">
                      <div className="pl-3 border-l border-line space-y-1.5 my-1">
                        {section.subItems.map((sub, idx) => (
                          <Link
                            key={sub.label + idx}
                            href={sub.href}
                            onClick={() => {
                              if (sub.onClick) {
                                sub.onClick();
                              } else {
                                onClose();
                              }
                            }}
                            className={`block py-1.5 text-xs transition-colors ${
                              sub.isFeatured
                                ? 'font-semibold text-ink hover:text-brand-700 flex items-center justify-between'
                                : 'text-ink-secondary hover:text-ink'
                            }`}
                          >
                            <span>{sub.label}</span>
                            {sub.isFeatured && <ArrowRight className="w-3.5 h-3.5 text-ink-muted" />}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Brand & Assurance Strip */}
        <div className="p-4 bg-zimor-cream/10 border-t border-line/60 space-y-2">
          <div className="flex items-center gap-2 text-ink-secondary">
            <Truck className="w-3.5 h-3.5 stroke-[1.5] text-ink shrink-0" />
            <span className="text-[11px] font-medium">Free Express Shipping across India</span>
          </div>
          <div className="flex items-center gap-2 text-ink-secondary">
            <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5] text-ink shrink-0" />
            <span className="text-[11px] font-medium">7-Day Easy Returns & Exchange</span>
          </div>
          <div className="pt-2 border-t border-line/60 flex items-center justify-between text-[10px] text-ink-muted">
            <span>© Zimor India</span>
            <a href="mailto:zimorindia@gmail.com" className="hover:text-ink transition-colors">
              zimorindia@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
