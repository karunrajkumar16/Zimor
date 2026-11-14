'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, RefreshCw, Gift } from 'lucide-react';

const MESSAGES = [
  { text: 'Free Express Shipping Across India — No Minimum Order', icon: Truck },
  { text: 'Cash on Delivery Available Across 19,000+ Pin Codes', icon: ShieldCheck },
  { text: '7-Day Easy Returns — Shop with Complete Confidence', icon: RefreshCw },
  { text: 'Complimentary Luxury Gift Box with Every Order', icon: Gift },
];

export const AnnouncementBar: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  const CurrentIcon = MESSAGES[index].icon;

  return (
    <aside aria-label="Announcement" className="bg-canvas-dark text-white text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden md:flex items-center gap-4 text-white/80 text-[11px] uppercase tracking-luxury">
          <span>Official Zimor Store</span>
          <span>•</span>
          <span>Made in India</span>
        </div>

        <div className="flex-1 flex items-center justify-center gap-2 transition-opacity duration-300">
          <CurrentIcon className="w-3.5 h-3.5 text-brand-300 shrink-0" />
          <span className="text-white/90 font-medium tracking-wide text-[11px] sm:text-xs">
            {MESSAGES[index].text}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-4 text-[11px] text-brand-200">
          <Link href="/gifting" className="hover:text-white transition-colors">
            Gift Concierge
          </Link>
          <span>•</span>
          <Link href="/faq" className="hover:text-white transition-colors">
            Help & FAQs
          </Link>
        </div>
      </div>
    </aside>
  );
};
