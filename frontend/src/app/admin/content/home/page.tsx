'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';
import { Save, Check, AlertCircle, Image as ImageIcon, Link as LinkIcon, RefreshCw, X } from 'lucide-react';
import { useAdminTheme } from '@/context/AdminThemeContext';

interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}

interface LifestyleCard {
  id: string;
  category: string;
  title: string;
  subheading: string;
  image: string;
  href: string;
}

export default function AdminContentHomePage() {
  const { isDark } = useAdminTheme();
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [lifestyleCards, setLifestyleCards] = useState<LifestyleCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const cardBg = isDark
    ? 'bg-[#24211F] border-[#36312C]'
    : 'bg-[#FFFFFF] border-[#E5DFD7] shadow-xs';
  const innerCardBg = isDark
    ? 'bg-[#1E1C1A] border-[#36312C]'
    : 'bg-[#FAF7F2] border-[#E5DFD7]';
  const inputClass = `w-full rounded px-3 py-1.5 border transition-colors focus:outline-none focus:border-[#B44220] ${
    isDark
      ? 'bg-[#24211F] border-[#36312C] text-[#E8E1DA]'
      : 'bg-[#FFFFFF] border-[#E5DFD7] text-[#24211F]'
  }`;

  useEffect(() => {
    fetchHomeContent();
  }, []);

  const fetchHomeContent = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/content/homepage');
      const data = await res.json();
      if (data.content && data.content.data) {
        setHeroSlides(data.content.data.heroSlides || []);
        setLifestyleCards(data.content.data.lifestyleCards || []);
      }
    } catch (err) {
      console.error('Failed to load homepage content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await apiFetch('/api/content/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            heroSlides,
            lifestyleCards,
          },
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Homepage content successfully updated!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update homepage content.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error saving homepage content.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Homepage CMS</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Dynamically update Hero slider banners, lifestyle cards, and call-to-action endpoints.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#B44220] hover:bg-[#9B381B] text-[#F7F5F2] text-xs font-semibold uppercase tracking-wider rounded shadow-xs transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save All Changes'}</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded text-xs flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-[#2E7D5A]/15 border-[#2E7D5A]/30 text-[#2E7D5A] dark:text-[#52B788]'
              : 'bg-[#B9382C]/15 border-[#B9382C]/30 text-[#B9382C] dark:text-[#F28B82]'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {loading ? (
        <div className={`p-16 text-center text-xs ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>Loading homepage configuration...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
          {/* Section 1: Hero Carousel Slides */}
          <div className={`rounded-lg p-5 space-y-4 border ${cardBg}`}>
            <h2 className="text-base font-semibold">Hero Slider Banners</h2>
            <p className={`text-xs ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
              Manage the 3 primary rotating billboards on the storefront hero banner.
            </p>

            <div className="space-y-6">
              {heroSlides.map((slide, idx) => (
                <div
                  key={slide.id || idx}
                  className={`rounded p-4 space-y-4 border ${innerCardBg}`}
                >
                  <div className={`flex items-center justify-between border-b pb-2 ${isDark ? 'border-[#36312C]' : 'border-[#E5DFD7]'}`}>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#B44220] dark:text-[#E07A5F]">
                      Slide {idx + 1}: {slide.badge}
                    </span>
                    <span className={`text-[10px] font-mono ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>ID: {slide.id}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Badge Tag</label>
                      <input
                        type="text"
                        value={slide.badge}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[idx].badge = e.target.value;
                          setHeroSlides(updated);
                        }}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Title</label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[idx].title = e.target.value;
                          setHeroSlides(updated);
                        }}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Subtitle</label>
                      <input
                        type="text"
                        value={slide.subtitle}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[idx].subtitle = e.target.value;
                          setHeroSlides(updated);
                        }}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Image Asset Path / URL</label>
                      <input
                        type="text"
                        value={slide.image}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[idx].image = e.target.value;
                          setHeroSlides(updated);
                        }}
                        className={`${inputClass} font-mono text-[11px]`}
                      />
                    </div>
                    <div>
                      <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>CTA Button Text</label>
                      <input
                        type="text"
                        value={slide.ctaText}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[idx].ctaText = e.target.value;
                          setHeroSlides(updated);
                        }}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>CTA Destination Link</label>
                      <input
                        type="text"
                        value={slide.ctaLink}
                        onChange={(e) => {
                          const updated = [...heroSlides];
                          updated[idx].ctaLink = e.target.value;
                          setHeroSlides(updated);
                        }}
                        className={`${inputClass} font-mono text-[11px]`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Shop by Lifestyle Cards */}
          <div className={`rounded-lg p-5 space-y-4 border ${cardBg}`}>
            <h2 className="text-base font-semibold">Shop by Lifestyle Cards</h2>
            <p className={`text-xs ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
              Configure the 3 lifestyle navigation portals (Everyday, Work, Travel) linked directly to shop filters.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {lifestyleCards.map((card, idx) => (
                <div
                  key={card.id || idx}
                  className={`rounded p-4 space-y-3 text-xs border ${innerCardBg}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#B44220] dark:text-[#E07A5F]">
                    {card.category} Card
                  </p>
                  <div>
                    <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Heading</label>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => {
                        const updated = [...lifestyleCards];
                        updated[idx].title = e.target.value;
                        setLifestyleCards(updated);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Subheading</label>
                    <input
                      type="text"
                      value={card.subheading}
                      onChange={(e) => {
                        const updated = [...lifestyleCards];
                        updated[idx].subheading = e.target.value;
                        setLifestyleCards(updated);
                      }}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Image URL</label>
                    <input
                      type="text"
                      value={card.image}
                      onChange={(e) => {
                        const updated = [...lifestyleCards];
                        updated[idx].image = e.target.value;
                        setLifestyleCards(updated);
                      }}
                      className={`${inputClass} font-mono text-[11px]`}
                    />
                  </div>
                  <div>
                    <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Destination URL / Anchor</label>
                    <input
                      type="text"
                      value={card.href}
                      onChange={(e) => {
                        const updated = [...lifestyleCards];
                        updated[idx].href = e.target.value;
                        setLifestyleCards(updated);
                      }}
                      className={`${inputClass} font-mono text-[11px]`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
