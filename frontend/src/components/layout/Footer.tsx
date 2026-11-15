'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Truck, ShieldCheck, RefreshCw, Award } from 'lucide-react';

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function PinterestIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.379l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

function YoutubeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#111111] text-white border-t border-white/10 content-auto">
      {/* Value Badges Banner */}
      <div className="border-b border-white/10 py-7 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-zimor-orange">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[12px] sm:text-[13px] font-medium uppercase tracking-wider text-white font-primary">
                Free Express Shipping
              </h4>
              <p className="text-[11px] text-white/60 font-secondary mt-0.5">Across all states in India</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-zimor-orange">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[12px] sm:text-[13px] font-medium uppercase tracking-wider text-white font-primary">
                7-Day Easy Returns
              </h4>
              <p className="text-[11px] text-white/60 font-secondary mt-0.5">Verified defect &amp; exchange support</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-zimor-orange">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[12px] sm:text-[13px] font-medium uppercase tracking-wider text-white font-primary">
                6-Month Warranty
              </h4>
              <p className="text-[11px] text-white/60 font-secondary mt-0.5">Hardware elements protected</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-zimor-orange">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[12px] sm:text-[13px] font-medium uppercase tracking-wider text-white font-primary">
                100% Superior Faux Leather
              </h4>
              <p className="text-[11px] text-white/60 font-secondary mt-0.5">Cruelty-free &amp; water-resistant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main 4-Column Footer matching Reference Image */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8">
          {/* Column 1: Zimor Brand, Slogan & Socials */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-5">
            <h3 className="font-primary text-2xl sm:text-[26px] font-medium text-white tracking-tight">
              Zimor
            </h3>
            <p className="font-secondary text-xs sm:text-[13.5px] text-white/70 leading-relaxed">
              Made to Move With You
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://www.instagram.com/zimorindia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-zimor-orange text-white flex items-center justify-center transition-all duration-200"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/zimorindia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-zimor-orange text-white flex items-center justify-center transition-all duration-200"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.pinterest.com/zimorindia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-zimor-orange text-white flex items-center justify-center transition-all duration-200"
                aria-label="Pinterest"
              >
                <PinterestIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@zimorindia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-zimor-orange text-white flex items-center justify-center transition-all duration-200"
                aria-label="YouTube"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: QUICK LINKS */}
          <div className="lg:col-span-2 space-y-3.5 sm:space-y-4">
            <h4 className="font-primary text-[11.5px] sm:text-[12.5px] font-semibold uppercase tracking-[0.18em] text-white">
              QUICK LINKS
            </h4>
            <ul className="space-y-2.5 font-secondary text-xs sm:text-[13px] text-white/70">
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
          <div className="lg:col-span-3 space-y-3.5 sm:space-y-4">
            <h4 className="font-primary text-[11.5px] sm:text-[12.5px] font-semibold uppercase tracking-[0.18em] text-white">
              POLICIES
            </h4>
            <ul className="space-y-2.5 font-secondary text-xs sm:text-[13px] text-white/70">
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
          <div className="lg:col-span-4 space-y-3.5 sm:space-y-4">
            <h4 className="font-primary text-[11.5px] sm:text-[12.5px] font-semibold uppercase tracking-[0.18em] text-white">
              CONTACT US
            </h4>
            <div className="space-y-3 font-secondary text-xs sm:text-[13px] text-white/75 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-white/60 shrink-0 mt-0.5" />
                <span>Shivdaspur, manduadih, varanasi, uttar pradesh- 221103</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-white/60 shrink-0" />
                <a
                  href="tel:+918953696928"
                  className="hover:text-white transition-colors"
                >
                  +91 89536 96928
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-white/60 shrink-0" />
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
        <div className="mt-12 pt-7 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-secondary text-[11px] sm:text-xs text-white/60">
          <p>© 2026 Zimor India. All rights reserved. Thoughtfully Designed &amp; Crafted in India.</p>
          <div className="flex flex-wrap items-center gap-3 text-white/50">
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
