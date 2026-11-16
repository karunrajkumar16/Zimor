'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const ANNOUNCEMENTS = [
  {
    text: '10% Off Your First Order.',
    href: '/shop',
  },
  {
    text: 'Complimentary Shipping on Every Order.',
    href: '/policy',
  },
  {
    text: 'Discover the Latest Collection.',
    href: '/shop',
  },
];

export const AnnouncementBar: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // Auto-rotate on mobile / single-item view every 3.2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
        setIsFading(false);
      }, 250);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const currentAnnouncement = ANNOUNCEMENTS[currentIndex];

  return (
    <aside
      aria-label="Announcement Bar"
      className="bg-[#000000] text-white py-2.5 px-4 border-b border-[#b4b4b4]/20 select-none overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* DESKTOP & TABLET (md+): All 3 points displayed simultaneously with elegant bullets */}
        <div className="hidden md:flex items-center justify-center gap-6 lg:gap-10 xl:gap-12 text-[11px] lg:text-[12px] font-medium tracking-wide">
          {ANNOUNCEMENTS.map((item, idx) => (
            <Link
              key={item.text + idx}
              href={item.href}
              className="group inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors"
            >
              <span className="text-[#b4b4b4] text-[9px] group-hover:text-white transition-colors">
                ●
              </span>
              <span className="font-primary tracking-wide">
                {item.text}
              </span>
            </Link>
          ))}
        </div>

        {/* MOBILE (< md): Clean single-line rotating ticker with smooth fade */}
        <div className="flex md:hidden items-center justify-center min-h-[18px]">
          <Link
            href={currentAnnouncement.href}
            className={`inline-flex items-center gap-2 text-[11px] font-medium tracking-wide text-white/90 hover:text-white transition-opacity duration-250 ${
              isFading ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <span className="text-[#b4b4b4] text-[8px]">●</span>
            <span className="font-primary tracking-wide">
              {currentAnnouncement.text}
            </span>
          </Link>
        </div>
      </div>
    </aside>
  );
};
