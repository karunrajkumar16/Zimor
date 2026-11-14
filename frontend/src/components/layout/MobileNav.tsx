'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ChevronRight, Heart, User, ShoppingBag, ShieldCheck, Truck, Gift } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { wishlistCount } = useWishlist();
  const { itemCount } = useCart();

  if (!isOpen) return null;

  return (
    <div data-lenis-prevent-modal className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div data-lenis-prevent-modal className="fixed inset-y-0 left-0 w-full max-w-xs bg-canvas shadow-drawer flex flex-col justify-between animate-in slide-in-from-left duration-300 overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-line">
            <div className="relative w-32 h-8">
              <Image src="/logo.png" alt="Zimor India" fill className="object-contain" priority />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-ink-muted hover:text-ink"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-3 border-b border-line bg-canvas-card text-center text-xs py-3">
            <Link
              href="/account"
              onClick={onClose}
              className="flex flex-col items-center gap-1 text-ink-secondary hover:text-ink"
            >
              <User className="w-4 h-4 text-brand-600" />
              <span>Account</span>
            </Link>
            <Link
              href="/wishlist"
              onClick={onClose}
              className="flex flex-col items-center gap-1 text-ink-secondary hover:text-ink border-x border-line relative"
            >
              <Heart className="w-4 h-4 text-brand-600" />
              <span>Wishlist ({wishlistCount})</span>
            </Link>
            <Link
              href="/cart"
              onClick={onClose}
              className="flex flex-col items-center gap-1 text-ink-secondary hover:text-ink"
            >
              <ShoppingBag className="w-4 h-4 text-brand-600" />
              <span>Cart ({itemCount})</span>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="p-4 space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-ink-muted px-3 py-2 font-semibold">
              Collections
            </p>
            <Link
              href="/shop"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded text-sm font-medium text-ink hover:bg-canvas-alt transition-colors"
            >
              <span>All Workbags (6)</span>
              <ChevronRight className="w-4 h-4 text-ink-muted" />
            </Link>
            <Link
              href="/shop?category=tote-bags"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded text-sm text-ink-secondary hover:bg-canvas-alt transition-colors"
            >
              <span>Tote Bags (15.6" Laptop)</span>
              <ChevronRight className="w-4 h-4 text-ink-muted" />
            </Link>
            <Link
              href="/shop?category=laptop-bags"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded text-sm text-ink-secondary hover:bg-canvas-alt transition-colors"
            >
              <span>Laptop Bags with Sling</span>
              <ChevronRight className="w-4 h-4 text-ink-muted" />
            </Link>
            <Link
              href="/shop?category=shoulder-bags"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded text-sm text-ink-secondary hover:bg-canvas-alt transition-colors"
            >
              <span>Shoulder Bags (Crescent)</span>
              <ChevronRight className="w-4 h-4 text-ink-muted" />
            </Link>

            <div className="pt-3 border-t border-line mt-3">
              <p className="text-[10px] uppercase tracking-widest text-ink-muted px-3 py-2 font-semibold">
                Curated Experiences
              </p>
              <Link
                href="/shop?section=profession#profession"
                onClick={() => {
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
                }}
                className="flex items-center justify-between px-3 py-2.5 rounded text-sm font-medium text-ink hover:bg-canvas-alt transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  Shop by Profession
                </span>
                <ChevronRight className="w-4 h-4 text-ink-muted" />
              </Link>
              <Link
                href="/gifting"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2.5 rounded text-sm font-medium text-ink hover:bg-canvas-alt transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-brand-600" />
                  Gifts by Occasion
                </span>
                <ChevronRight className="w-4 h-4 text-ink-muted" />
              </Link>
            </div>

            <div className="pt-3 border-t border-line mt-3">
              <p className="text-[10px] uppercase tracking-widest text-ink-muted px-3 py-2 font-semibold">
                About Zimor
              </p>
              <Link
                href="/about"
                onClick={onClose}
                className="block px-3 py-2 text-sm text-ink-secondary hover:text-ink"
              >
                Our Story & Craftsmanship
              </Link>
              <Link
                href="/contact"
                onClick={onClose}
                className="block px-3 py-2 text-sm text-ink-secondary hover:text-ink"
              >
                Contact Us
              </Link>
              <Link
                href="/faq"
                onClick={onClose}
                className="block px-3 py-2 text-sm text-ink-secondary hover:text-ink"
              >
                FAQs & Product Guide
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Brand Banner in Mobile Drawer */}
        <div className="p-4 bg-canvas-card border-t border-line text-xs text-ink-muted space-y-2">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-brand-600 shrink-0" />
            <span>Free Express Shipping across India</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
            <span>7-Day Return Guarantee</span>
          </div>
          <p className="text-[11px] text-ink-faint pt-2 border-t border-line">
            Support: zimorindia@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
};

