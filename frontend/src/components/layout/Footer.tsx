'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Truck, ShieldCheck, RefreshCw, Award, ChevronDown } from 'lucide-react';
import { SOCIAL_LINKS } from '@/data/social';

export function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function FacebookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.704 0-1.233.093-1.588.277-.354.184-.572.484-.653.9-.047.241-.07.607-.07 1.099v1.708h4.283l-.564 3.667h-3.719v7.98h-4.47z" />
    </svg>
  );
}

export function PinterestIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9.04 21.54c.96-4.49 1.5-6.97 1.5-6.97s-.38-.76-.38-1.88c0-1.76 1.02-3.08 2.29-3.08 1.08 0 1.6.81 1.6 1.79 0 1.09-.69 2.72-1.05 4.23-.3 1.27.63 2.3 1.88 2.3 2.26 0 3.79-2.89 3.79-6.33 0-2.62-1.77-4.57-4.96-4.57-3.88 0-6.29 2.89-6.29 6.11 0 1.12.43 2.32.96 2.97.1.13.12.24.09.37-.1.4-.33 1.34-.37 1.52-.06.25-.2.3-.46.18-1.72-.8-2.52-2.93-2.52-4.73 0-3.51 2.96-7.72 8.82-7.72 4.71 0 7.82 3.4 7.82 7.07 0 4.84-2.69 8.44-6.66 8.44-1.33 0-2.59-.72-3.02-1.54l-.82 3.12c-.3 1.13-.88 2.27-1.41 3.13z" />
    </svg>
  );
}

export function YoutubeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export const Footer: React.FC = () => {
  // Mobile accordion state for clean Miraggio-style progressive disclosure
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  return (
    <footer className="bg-[#000000] text-[#ffffff] border-t border-[#b4b4b4]/20 content-auto">
      {/* Value Badges Banner */}
      <div className="border-b border-[#b4b4b4]/20 py-7 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-white/5 border border-[#b4b4b4]/30 flex items-center justify-center shrink-0 text-[#b4b4b4]">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[12px] sm:text-[13px] font-medium uppercase tracking-wider text-white font-primary">
                Free Express Shipping
              </h4>
              <p className="text-[11px] text-[#b4b4b4] font-secondary mt-0.5">Across all states in India</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-white/5 border border-[#b4b4b4]/30 flex items-center justify-center shrink-0 text-[#b4b4b4]">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[12px] sm:text-[13px] font-medium uppercase tracking-wider text-white font-primary">
                7-Day Easy Returns
              </h4>
              <p className="text-[11px] text-[#b4b4b4] font-secondary mt-0.5">Verified defect &amp; exchange support</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-white/5 border border-[#b4b4b4]/30 flex items-center justify-center shrink-0 text-[#b4b4b4]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[12px] sm:text-[13px] font-medium uppercase tracking-wider text-white font-primary">
                6-Month Warranty
              </h4>
              <p className="text-[11px] text-[#b4b4b4] font-secondary mt-0.5">Hardware elements protected</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-white/5 border border-[#b4b4b4]/30 flex items-center justify-center shrink-0 text-[#b4b4b4]">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[12px] sm:text-[13px] font-medium uppercase tracking-wider text-white font-primary">
                100% Superior Faux Leather
              </h4>
              <p className="text-[11px] text-[#b4b4b4] font-secondary mt-0.5">Cruelty-free &amp; water-resistant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main 4-Column Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8">
          {/* Column 1: Zimor Brand, Slogan & Socials */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-5">
            <h3 className="font-primary text-2xl sm:text-[26px] font-medium text-white tracking-tight">
              Zimor
            </h3>
            <p className="font-secondary text-xs sm:text-[13.5px] text-[#b4b4b4] leading-relaxed">
              Made to Move With You
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              {/* Instagram */}
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group/insta w-9 h-9 rounded-full bg-white/5 border border-[#b4b4b4]/25 text-[#b4b4b4] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:border-transparent hover:text-white hover:shadow-[0_0_16px_rgba(220,39,67,0.5)]"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4 transition-transform duration-300 group-hover/insta:scale-110" />
              </a>

              {/* Pinterest */}
              <a
                href={SOCIAL_LINKS.pinterest}
                target="_blank"
                rel="noopener noreferrer"
                className="group/pin w-9 h-9 rounded-full bg-white/5 border border-[#b4b4b4]/25 text-[#b4b4b4] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#E60023] hover:border-[#E60023] hover:text-white hover:shadow-[0_0_16px_rgba(230,0,35,0.5)]"
                aria-label="Pinterest"
              >
                <PinterestIcon className="w-4 h-4 transition-transform duration-300 group-hover/pin:scale-110" />
              </a>

              {/* YouTube */}
              <a
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="group/yt w-9 h-9 rounded-full bg-white/5 border border-[#b4b4b4]/25 text-[#b4b4b4] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white hover:shadow-[0_0_16px_rgba(255,0,0,0.5)]"
                aria-label="YouTube"
              >
                <YoutubeIcon className="w-4 h-4 transition-transform duration-300 group-hover/yt:scale-110" />
              </a>

              {/* Facebook */}
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="group/fb w-9 h-9 rounded-full bg-white/5 border border-[#b4b4b4]/25 text-[#b4b4b4] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white hover:shadow-[0_0_16px_rgba(24,119,242,0.5)]"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4 transition-transform duration-300 group-hover/fb:scale-110" />
              </a>
            </div>
          </div>

          {/* Column 2: QUICK LINKS */}
          <div className="lg:col-span-2 space-y-3.5 sm:space-y-4 border-t sm:border-t-0 border-[#b4b4b4]/15 pt-4 sm:pt-0">
            <button
              type="button"
              onClick={() => toggleSection('quick-links')}
              className="w-full flex items-center justify-between sm:pointer-events-none text-left"
            >
              <h4 className="font-primary text-[11.5px] sm:text-[12.5px] font-semibold uppercase tracking-[0.18em] text-white">
                QUICK LINKS
              </h4>
              <ChevronDown
                className={`w-4 h-4 text-[#b4b4b4] sm:hidden transition-transform duration-200 ${
                  openSection === 'quick-links' ? 'rotate-180' : ''
                }`}
              />
            </button>
            <ul
              className={`space-y-2.5 font-secondary text-xs sm:text-[13px] text-[#b4b4b4] ${
                openSection === 'quick-links' ? 'block' : 'hidden sm:block'
              }`}
            >
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: POLICIES (All 6 Policies Listed) */}
          <div className="lg:col-span-3 space-y-3.5 sm:space-y-4 border-t sm:border-t-0 border-[#b4b4b4]/15 pt-4 sm:pt-0">
            <button
              type="button"
              onClick={() => toggleSection('policies')}
              className="w-full flex items-center justify-between sm:pointer-events-none text-left"
            >
              <h4 className="font-primary text-[11.5px] sm:text-[12.5px] font-semibold uppercase tracking-[0.18em] text-white">
                POLICIES
              </h4>
              <ChevronDown
                className={`w-4 h-4 text-[#b4b4b4] sm:hidden transition-transform duration-200 ${
                  openSection === 'policies' ? 'rotate-180' : ''
                }`}
              />
            </button>
            <ul
              className={`space-y-2.5 font-secondary text-xs sm:text-[13px] text-[#b4b4b4] ${
                openSection === 'policies' ? 'block' : 'hidden sm:block'
              }`}
            >
              <li>
                <Link href="/policy#shipping" className="hover:text-white transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/policy#cancellation" className="hover:text-white transition-colors">
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/policy#returns" className="hover:text-white transition-colors">
                  Returns &amp; Exchanges
                </Link>
              </li>
              <li>
                <Link href="/policy#refund" className="hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/policy#warranty" className="hover:text-white transition-colors">
                  Warranty Policy
                </Link>
              </li>
              <li>
                <Link href="/policy#care" className="hover:text-white transition-colors">
                  Bag Care Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: CONTACT US */}
          <div className="lg:col-span-4 space-y-3.5 sm:space-y-4 border-t sm:border-t-0 border-[#b4b4b4]/15 pt-4 sm:pt-0">
            <h4 className="font-primary text-[11.5px] sm:text-[12.5px] font-semibold uppercase tracking-[0.18em] text-white">
              CONTACT US
            </h4>
            <div className="space-y-3 font-secondary text-xs sm:text-[13px] text-[#b4b4b4] leading-relaxed">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#b4b4b4] shrink-0 mt-0.5" />
                <span>Shivdaspur, manduadih, varanasi, uttar pradesh- 221103</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#b4b4b4] shrink-0" />
                <a
                  href="tel:+918953696928"
                  className="hover:text-white transition-colors"
                >
                  +91 89536 96928
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#b4b4b4] shrink-0" />
                <a
                  href="mailto:Zimorindia@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  Zimorindia@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-7 border-t border-[#b4b4b4]/20 flex flex-col sm:flex-row items-center justify-between gap-4 font-secondary text-[11px] sm:text-xs text-[#b4b4b4]">
          <p>© 2026 Zimor India. All rights reserved. Thoughtfully Designed &amp; Crafted in India.</p>
          <div className="flex flex-wrap items-center gap-3 text-[#b4b4b4]/80">
            <span>100% Encrypted Payments</span>
            <span>•</span>
            <span>UPI / Cards / NetBanking / COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
