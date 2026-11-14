'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-canvas-dark text-white border-t border-line-dark content-auto">
      {/* Value Badges Banner */}
      <div className="border-b border-line-dark py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-canvas-darkSurface border border-line-dark flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-brand-300" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Free Express Shipping</h4>
              <p className="text-[11px] text-ink-faint">Across all states in India</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-canvas-darkSurface border border-line-dark flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 text-brand-300" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white">7-Day Easy Returns</h4>
              <p className="text-[11px] text-ink-faint">Hassle-free doorstep pickup</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-canvas-darkSurface border border-line-dark flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-brand-300" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Cash on Delivery</h4>
              <p className="text-[11px] text-ink-faint">Pay securely upon delivery</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-canvas-darkSurface border border-line-dark flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-brand-300" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white">100% Superior Faux Leather</h4>
              <p className="text-[11px] text-ink-faint">Scratch & water-resistant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative w-36 h-9">
              <Image src="/logo.png" alt="Zimor India" fill className="object-contain brightness-200 invert" />
            </div>
            <p className="text-xs text-ink-faint leading-relaxed max-w-sm">
              Structured, elegant leather bags and accessories thoughtfully designed for the modern working professional. Designed and crafted with love in India.
            </p>
            <div className="pt-2">
              <p className="text-[11px] uppercase tracking-widest text-brand-300 font-semibold mb-1">
                Client Concierge
              </p>
              <p className="text-xs text-white">Email: zimorindia@gmail.com</p>
              <p className="text-xs text-ink-faint">Mon–Sat: 10:00 AM – 7:00 PM IST</p>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-200">Shop Collections</h3>
            <ul className="space-y-2 text-xs text-ink-faint">
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  All Workbags (6)
                </Link>
              </li>
              <li>
                <Link href="/shop?category=tote-bags" className="hover:text-white transition-colors">
                  Delo Tote Bags
                </Link>
              </li>
              <li>
                <Link href="/shop?category=laptop-bags" className="hover:text-white transition-colors">
                  Rabota Laptop Totes
                </Link>
              </li>
              <li>
                <Link href="/shop?category=shoulder-bags" className="hover:text-white transition-colors">
                  Classic Shoulder Bags
                </Link>
              </li>
              <li>
                <Link href="/profession" className="hover:text-white transition-colors">
                  Shop by Profession
                </Link>
              </li>
              <li>
                <Link href="/gifting" className="hover:text-white transition-colors">
                  Gifts by Occasion
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-200">Contact Us</h3>
            <ul className="space-y-2 text-xs text-ink-faint">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/policies/returns" className="hover:text-white transition-colors">
                  7-Day Return Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-white transition-colors">
                  Shipping Across India
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQs & Sizing Guide
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-200">Zimor Insiders</h3>
            <p className="text-xs text-ink-faint leading-relaxed">
              Subscribe to receive 10% off your first order and exclusive access to limited-edition drops.
            </p>

            {subscribed ? (
              <div className="p-3 bg-canvas-darkSurface border border-line-dark rounded text-xs text-brand-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                <span>You are subscribed! Use code <strong>WELCOME10</strong> at checkout.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-canvas-darkSurface text-xs text-white border border-line-dark px-3 py-2.5 rounded focus:outline-none focus:border-brand-400 placeholder:text-ink-faint transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold py-2.5 px-4 rounded uppercase tracking-wider transition-colors"
                >
                  Join Insiders
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-line-dark flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-faint">
          <p>© 2026 Zimor India. All rights reserved. Thoughtfully Designed & Crafted in India.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>100% Encrypted Payments</span>
            <span>•</span>
            <span>UPI / NetBanking / Cards / COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

