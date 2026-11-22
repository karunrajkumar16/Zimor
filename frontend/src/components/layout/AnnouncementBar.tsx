'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export interface AnnouncementItem {
  id?: string;
  text: string;
  link?: string;
  href?: string;
  enabled?: boolean;
}

const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
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
  const [items, setItems] = useState<AnnouncementItem[]>(DEFAULT_ANNOUNCEMENTS);
  const [barEnabled, setBarEnabled] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // Fetch dynamic announcements from MongoDB content API
  useEffect(() => {
    let isMounted = true;
    async function loadLiveAnnouncements() {
      try {
        const res = await apiFetch('/api/content/announcements');
        if (!res.ok) return;
        const data = await res.json();
        const contentData = data.content?.data;
        if (contentData) {
          if (typeof contentData.enabled === 'boolean') {
            setBarEnabled(contentData.enabled);
          }
          if (Array.isArray(contentData.items) && contentData.items.length > 0) {
            const activeItems = contentData.items.filter(
              (it: any) => it.enabled !== false && Boolean(it.text?.trim())
            );
            if (isMounted && activeItems.length > 0) {
              setItems(
                activeItems.map((it: any) => ({
                  id: it.id,
                  text: it.text.trim(),
                  href: it.link || it.href || '/shop',
                  enabled: it.enabled !== false,
                }))
              );
            }
          }
        }
      } catch (err) {
        console.warn('Using default announcements fallback', err);
      }
    }

    loadLiveAnnouncements();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-rotate on mobile / single-item view every 3.2 seconds with smooth fade
  useEffect(() => {
    if (!items || items.length <= 1) return;
    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
        setIsFading(false);
      }, 250);
    }, 3200);
    return () => clearInterval(timer);
  }, [items]);

  if (!barEnabled || items.length === 0) {
    return null;
  }

  const currentAnnouncement = items[currentIndex % items.length] || items[0];

  return (
    <aside
      aria-label="Announcement Bar"
      className="bg-[#000000] text-white py-2.5 px-4 border-b border-[#b4b4b4]/20 select-none overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* DESKTOP & TABLET (md+): All points displayed simultaneously with elegant bullets */}
        <div className="hidden md:flex items-center justify-center gap-6 lg:gap-10 xl:gap-12 text-[11px] lg:text-[12px] font-medium tracking-wide">
          {items.map((item, idx) => (
            <Link
              key={(item.text || '') + idx}
              href={item.href || item.link || '/shop'}
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
            href={currentAnnouncement.href || currentAnnouncement.link || '/shop'}
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
