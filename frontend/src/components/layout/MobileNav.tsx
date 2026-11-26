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
import { useProducts } from '@/context/ProductContext';
import { SOCIAL_LINKS } from '@/data/social';
import { InstagramIcon, FacebookIcon, PinterestIcon, YoutubeIcon, ThreadsIcon } from './Footer';
import { useWhatsAppUrl } from '@/lib/whatsapp';

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
  const whatsappUrl = useWhatsAppUrl();
  const { wishlistCount } = useWishlist();
  const { itemCount } = useCart();
  const { products, categories } = useProducts();

  // Progressive disclosure: only one section open at a time, initially all closed
  const [activeSection, setActiveSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSection = (id: string) => {
    setActiveSection((prev) => (prev === id ? null : id));
  };

  const handleLifestyleScroll = (targetId: string = 'lifestyle') => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('scroll_to_section', targetId);
    }
    onClose();
    if (typeof window !== 'undefined' && window.location.pathname === '/shop') {
      setTimeout(() => {
        const el =
          document.getElementById(targetId) ||
          document.getElementById('lifestyle') ||
          document.getElementById('profession');
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

  const bagCategories = categories.length > 0
    ? categories.filter((c) => !['everyday', 'work', 'travel'].includes(c.slug))
    : [
        { slug: 'tote-bags', name: 'Tote Bags' },
        { slug: 'shoulder-bags', name: 'Shoulder Bags' },
      ];

  const SECTIONS: NavSection[] = [
    {
      id: 'collections',
      label: 'Collections',
      badge: `${products.length || 6} Silhouettes`,
      subItems: [
        { label: `View All Workbags (${products.length || 6})`, href: '/shop', isFeatured: true },
        ...bagCategories.map((cat) => ({
          label: cat.name,
          href: `/shop?category=${cat.slug}`,
        })),
      ],
    },
    {
      id: 'profession',
      label: 'Shop by Lifestyle',
      badge: 'Curated',
      subItems: [
        {
          label: 'Explore All Lifestyles',
          href: '/shop?section=lifestyle#lifestyle',
          isFeatured: true,
          onClick: () => handleLifestyleScroll('lifestyle'),
        },
        {
          label: 'Everyday Carry',
          href: '/shop?section=everyday#everyday',
          onClick: () => handleLifestyleScroll('everyday'),
        },
        {
          label: 'Work Silhouettes',
          href: '/shop?section=work#work',
          onClick: () => handleLifestyleScroll('work'),
        },
        {
          label: 'Travel & Beyond',
          href: '/shop?section=travel#travel',
          onClick: () => handleLifestyleScroll('travel'),
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
      id: 'contact',
      label: 'Contact Us',
      subItems: [
        { label: 'Contact Page & Inquiries', href: '/contact', isFeatured: true },
        { label: 'WhatsApp (+91 86046 47888)', href: whatsappUrl },
        { label: 'Send Email', href: 'mailto:zimorindia@gmail.com' },
        { label: 'Track Your Order', href: '/account/orders' },
        { label: 'Policy & Customer Guidelines', href: '/policy' },
        { label: 'Frequently Asked Questions (FAQ)', href: '/faq' },
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

      {/* Drawer Canvas — Clean Pure White Architecture with Monochromatic Minimalist Finish */}
      <div
        data-lenis-prevent-modal
        className="fixed inset-y-0 left-0 w-full max-w-[320px] bg-[#ffffff] text-[#000000] shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-300 overflow-y-auto"
      >
        <div>
          {/* Header Bar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#b4b4b4]/30">
            <Link href="/" onClick={onClose} className="relative w-28 h-7">
              <Image src="/logo.png" alt="Zimor India" fill className="object-contain" priority />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#000000] hover:text-[#b4b4b4] transition-colors rounded-full hover:bg-neutral-100"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Quick Account / Wishlist / Cart Bar */}
          <div className="grid grid-cols-3 border-b border-[#b4b4b4]/30 bg-[#f8f8f8] text-center py-2.5">
            <Link
              href="/account"
              onClick={onClose}
              className="flex flex-col items-center gap-1 text-[#000000] hover:text-[#b4b4b4] transition-colors py-1"
            >
              <User className="w-4 h-4 stroke-[1.5]" />
              <span className="text-[11px] font-medium tracking-tight">Account</span>
            </Link>
            <Link
              href="/wishlist"
              onClick={onClose}
              className="flex flex-col items-center gap-1 text-[#000000] hover:text-[#b4b4b4] transition-colors border-x border-[#b4b4b4]/30 py-1"
            >
              <Heart className="w-4 h-4 stroke-[1.5]" />
              <span className="text-[11px] font-medium tracking-tight">Wishlist ({wishlistCount})</span>
            </Link>
            <Link
              href="/cart"
              onClick={onClose}
              className="flex flex-col items-center gap-1 text-[#000000] hover:text-[#b4b4b4] transition-colors py-1"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
              <span className="text-[11px] font-medium tracking-tight">Bag ({itemCount})</span>
            </Link>
          </div>

          {/* Progressive Disclosure Accordion List */}
          <div className="divide-y divide-[#b4b4b4]/25">
            {SECTIONS.map((section) => {
              const isExpanded = activeSection === section.id;

              return (
                <div key={section.id} className="transition-colors">
                  {/* Top-Level Trigger Button */}
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-5 py-3.5 flex items-center justify-between text-left group hover:bg-[#f8f8f8] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-primary text-[14px] font-medium text-[#000000] tracking-tight">
                        {section.label}
                      </span>
                      {section.badge && (
                        <span className="text-[9px] font-medium uppercase tracking-wider text-[#000000] bg-[#b4b4b4]/20 px-1.5 py-0.5 rounded-sm">
                          {section.badge}
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[#b4b4b4] transition-transform duration-200 ease-out group-hover:text-[#000000] ${
                        isExpanded ? 'rotate-180 text-[#000000]' : ''
                      }`}
                    />
                  </button>

                  {/* Sub-Items (Progressive Disclosure upon Interaction) */}
                  {isExpanded && (
                    <div className="px-5 pb-3 pt-1 animate-in slide-in-from-top-1 duration-200">
                      <div className="pl-3 border-l-2 border-[#000000] space-y-1.5 my-1">
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
                                ? 'font-semibold text-[#000000] hover:text-[#b4b4b4] flex items-center justify-between'
                                : 'text-[#333333] hover:text-[#000000]'
                            }`}
                          >
                            <span>{sub.label}</span>
                            {sub.isFeatured && <ArrowRight className="w-3.5 h-3.5 text-[#000000]" />}
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
        <div className="p-4 bg-[#f8f8f8] border-t border-[#b4b4b4]/30 space-y-2">
          <div className="flex items-center gap-2 text-[#333333]">
            <Truck className="w-3.5 h-3.5 stroke-[1.5] text-[#000000] shrink-0" />
            <span className="text-[11px] font-medium">Free Express Shipping across India</span>
          </div>
          <div className="flex items-center gap-2 text-[#333333]">
            <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5] text-[#000000] shrink-0" />
            <span className="text-[11px] font-medium">7-Day Easy Returns & Exchange</span>
          </div>

          {/* Social Media Links with Brand Hover Colors */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-black/5 border border-[#b4b4b4]/30 text-[#000000] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:border-transparent hover:text-white hover:shadow-sm"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
            </a>
            <a
              href={SOCIAL_LINKS.pinterest}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-black/5 border border-[#b4b4b4]/30 text-[#000000] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#E60023] hover:border-[#E60023] hover:text-white hover:shadow-sm"
              aria-label="Pinterest"
            >
              <PinterestIcon className="w-3.5 h-3.5" />
            </a>
            <a
              href={SOCIAL_LINKS.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-black/5 border border-[#b4b4b4]/30 text-[#000000] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white hover:shadow-sm"
              aria-label="YouTube"
            >
              <YoutubeIcon className="w-3.5 h-3.5" />
            </a>
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-black/5 border border-[#b4b4b4]/30 text-[#000000] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white hover:shadow-sm"
              aria-label="Facebook"
            >
              <FacebookIcon className="w-3.5 h-3.5" />
            </a>
            <a
              href={SOCIAL_LINKS.threads}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-black/5 border border-[#b4b4b4]/30 text-[#000000] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-black hover:border-black hover:text-white hover:shadow-sm"
              aria-label="Threads"
            >
              <ThreadsIcon className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="pt-2 border-t border-[#b4b4b4]/25 flex items-center justify-between text-[10px] text-[#555555]">
            <span>© Zimor India</span>
            <a href="mailto:zimorindia@gmail.com" className="hover:text-[#000000] transition-colors">
              zimorindia@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
