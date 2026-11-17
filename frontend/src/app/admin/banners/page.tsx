'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Save,
  Check,
  Image as ImageIcon,
  Link as LinkIcon,
  RefreshCw,
  X,
  Upload,
  Eye,
  Sliders,
  Sparkles,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAdminTheme } from '@/context/AdminThemeContext';

interface HeroSlide {
  id: string;
  badge?: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  isActive?: boolean;
}

export default function AdminHeroBannersPage() {
  const { isDark } = useAdminTheme();
  const [slides, setSlides] = useState<HeroSlide[]>([
    {
      id: 'hero-slide-1',
      badge: 'PERMANENT ATELIER COLLECTION',
      title: 'ARCHITECTURAL FORM.\nEVERYDAY PURPOSE.',
      subtitle: 'Discover our permanent collection of six sculptural silhouettes engineered with 15.6" laptop compartments.',
      image: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917825/zimor/banners/hero-first-edit.webp',
      ctaText: 'Shop Collection',
      ctaLink: '/shop',
      isActive: true,
    },
    {
      id: 'hero-slide-2',
      badge: 'NEW ATELIER EDITION',
      title: 'TIMELESS LUXURY.\nMINIMALIST PURSUIT.',
      subtitle: 'Engineered with 15.6" padded protection and solid brass accents for seamless boardroom transitions.',
      image: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917826/zimor/banners/hero-most-loved-tote.webp',
      ctaText: 'Shop Totes',
      ctaLink: '/shop?category=tote-bags',
      isActive: true,
    },
    {
      id: 'hero-slide-3',
      badge: 'WEEKEND & TRAVEL',
      title: 'EFFORTLESS TRAVEL.\nCURATED SILHOUETTE.',
      subtitle: 'French canvas with sculpted crescent contours and luminous gold hardware.',
      image: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917826/zimor/banners/hero-model-crescent.webp',
      ctaText: 'Explore Shoulder Bags',
      ctaLink: '/shop?category=shoulder-bags',
      isActive: true,
    },
  ]);

  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/content/homepage');
      const data = await res.json();
      if (data.content?.data?.heroSlides?.length) {
        setSlides(data.content.data.heroSlides);
      }
    } catch (err) {
      console.error('Failed to load hero banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await apiFetch('/api/content/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            heroSlides: slides,
          },
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Hero billboards successfully updated and published to the live storefront!' });
      } else {
        throw new Error('Failed to save banners');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error updating hero banners' });
    } finally {
      setSaving(false);
    }
  };

  const updateActiveSlide = (field: keyof HeroSlide, value: any) => {
    const updated = [...slides];
    updated[activeSlideIdx] = {
      ...updated[activeSlideIdx],
      [field]: value,
    };
    setSlides(updated);
  };

  const addNewSlide = () => {
    const newSlide: HeroSlide = {
      id: `hero-slide-${Date.now()}`,
      badge: 'SEASONAL CURATION',
      title: 'NEW SILHOUETTE IN FOCUS',
      subtitle: 'Engineered for modern movement and everyday elegance.',
      image: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917825/zimor/banners/hero-first-edit.webp',
      ctaText: 'Explore Bags',
      ctaLink: '/shop',
      isActive: true,
    };
    setSlides([...slides, newSlide]);
    setActiveSlideIdx(slides.length);
  };

  const deleteActiveSlide = () => {
    if (slides.length <= 1) {
      alert('You must retain at least one active hero billboard.');
      return;
    }
    const filtered = slides.filter((_, idx) => idx !== activeSlideIdx);
    setSlides(filtered);
    setActiveSlideIdx(Math.max(0, activeSlideIdx - 1));
  };

  const activeSlide = slides[activeSlideIdx] || slides[0];

  const cardBg = isDark
    ? 'bg-[#24211F] border-[#36312C]'
    : 'bg-[#FFFFFF] border-[#E5DFD7] shadow-xs';

  const inputClass = isDark
    ? 'w-full px-3 py-2 bg-[#1E1C1A] border border-[#36312C] rounded text-xs text-[#E8E1DA] placeholder-[#78726C] focus:outline-none focus:border-[#B44220]'
    : 'w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DFD7] rounded text-xs text-[#24211F] placeholder-[#8C837A] focus:outline-none focus:border-[#B44220] focus:bg-[#FFFFFF]';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#24211F] dark:text-[#E8E1DA]">Hero Billboard Manager</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Manage the primary homepage rotating billboards, imagery, headlines, and call-to-action destinations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={addNewSlide}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold border transition-all ${
              isDark
                ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA] hover:border-[#8A837C]'
                : 'bg-[#FFFFFF] border-[#E5DFD7] text-[#24211F] hover:bg-[#FAF7F2]'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-[#B44220]" />
            <span>Add Slide</span>
          </button>

          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-[#B44220] hover:bg-[#9B381B] text-[#F7F5F2] shadow-xs disabled:opacity-50 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Publishing...' : 'Publish to Storefront'}</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {message && (
        <div
          className={`p-3.5 rounded-md text-xs flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-[#2E7D5A]/10 border-[#2E7D5A]/25 text-[#25684A] dark:bg-[#2E7D5A]/15 dark:text-[#62C697]'
              : 'bg-[#B9382C]/10 border-[#B9382C]/25 text-[#9C281D] dark:bg-[#B9382C]/15 dark:text-[#F28B82]'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Slide Selection Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {slides.map((s, idx) => (
          <button
            key={s.id || idx}
            onClick={() => setActiveSlideIdx(idx)}
            className={`px-4 py-2 rounded-md text-xs font-semibold shrink-0 transition-all border ${
              activeSlideIdx === idx
                ? 'bg-[#B44220] text-[#F7F5F2] border-transparent shadow-xs'
                : isDark
                ? 'bg-[#1E1C1A] border-[#36312C] text-[#B4B4B4] hover:text-[#E8E1DA]'
                : 'bg-[#FFFFFF] border-[#E5DFD7] text-[#5A534E] hover:bg-[#FAF7F2]'
            }`}
          >
            Slide {idx + 1}: {s.badge || 'Banner'}
          </button>
        ))}
      </div>

      {/* 2-Column Layout: Live 16:9 Visual Preview + Slide Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live 16:9 Storefront Billboard Preview */}
        <div className={`lg:col-span-7 rounded-lg border overflow-hidden ${cardBg} p-5 space-y-4`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-[#222428]">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-bold">Live Storefront Billboard Preview</h2>
            </div>
            <span className="text-[10px] uppercase font-mono text-slate-400">
              16:9 Aspect Ratio
            </span>
          </div>

          {/* Realistic Storefront Mock Preview Card */}
          <div className="relative aspect-[16/9] w-full rounded-md overflow-hidden bg-black text-white shadow-xl">
            <Image
              src={activeSlide.image || 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917825/zimor/banners/hero-first-edit.webp'}
              alt={activeSlide.title}
              fill
              className="object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

            {/* Overlaid Storefront Typography */}
            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
              <div className="max-w-md space-y-2">
                <span className="inline-block px-2 py-0.5 rounded bg-white/20 backdrop-blur-xs text-[10px] font-bold tracking-widest uppercase">
                  {activeSlide.badge || 'ZIMOR ATELIER'}
                </span>
                <h3 className="text-lg sm:text-2xl font-bold tracking-tight uppercase whitespace-pre-line leading-tight">
                  {activeSlide.title}
                </h3>
                <p className="text-xs text-white/80 line-clamp-2">
                  {activeSlide.subtitle}
                </p>
                <div className="pt-2">
                  <span className="inline-block px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-sm shadow-md">
                    {activeSlide.ctaText || 'Shop Collection'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            This live visual preview updates in real-time as you edit the fields on the right.
          </p>
        </div>

        {/* Right Column: Active Slide Form Editor */}
        <div className={`lg:col-span-5 rounded-lg border ${cardBg} p-5 space-y-4`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-[#222428]">
            <h2 className="text-sm font-bold">Edit Slide {activeSlideIdx + 1} Properties</h2>
            {slides.length > 1 && (
              <button
                type="button"
                onClick={deleteActiveSlide}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Slide</span>
              </button>
            )}
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Top Badge */}
            <div>
              <label className="block font-semibold mb-1">Top Badge Pill</label>
              <input
                type="text"
                value={activeSlide.badge || ''}
                onChange={(e) => updateActiveSlide('badge', e.target.value)}
                placeholder="e.g. PERMANENT ATELIER COLLECTION"
                className={inputClass}
              />
            </div>

            {/* Headline */}
            <div>
              <label className="block font-semibold mb-1">Main Headline (Use \n for line breaks) *</label>
              <textarea
                rows={2}
                value={activeSlide.title || ''}
                onChange={(e) => updateActiveSlide('title', e.target.value)}
                required
                className={inputClass}
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block font-semibold mb-1">Subtitle Description *</label>
              <textarea
                rows={3}
                value={activeSlide.subtitle || ''}
                onChange={(e) => updateActiveSlide('subtitle', e.target.value)}
                required
                className={inputClass}
              />
            </div>

            {/* Billboard Image URL */}
            <div>
              <label className="block font-semibold mb-1">Billboard Background Image Path *</label>
              <input
                type="text"
                value={activeSlide.image || ''}
                onChange={(e) => updateActiveSlide('image', e.target.value)}
                required
                placeholder="e.g. /banners/hero-first-edit.webp"
                className={inputClass}
              />
              <p className="text-[10px] text-slate-400 mt-1">Accepts local `/banners/...` or Cloudinary secure URLs.</p>
            </div>

            {/* CTA Button Text & Destination URL */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Button Text</label>
                <input
                  type="text"
                  value={activeSlide.ctaText || ''}
                  onChange={(e) => updateActiveSlide('ctaText', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Button Link URL</label>
                <input
                  type="text"
                  value={activeSlide.ctaLink || ''}
                  onChange={(e) => updateActiveSlide('ctaLink', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="w-full py-2.5 rounded-md text-xs font-semibold bg-[#B44220] hover:bg-[#9B381B] text-[#F7F5F2] shadow-xs disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Apply & Publish Slide'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
