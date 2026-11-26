'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  FolderOpen,
  Search,
  ExternalLink,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { uploadAndRegisterMedia } from '@/lib/cloudinaryDirectUpload';
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

// Curated high-resolution ZIMOR billboard artworks ready for immediate selection
const CURATED_BANNER_PRESETS = [
  {
    title: 'The First Edit — Structured Luxury Handbag',
    category: 'Permanent Collection',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917825/zimor/banners/hero-first-edit.webp',
  },
  {
    title: 'Our Most-Loved Tote — Delo 15.6" Laptop Tote',
    category: 'Executive Edit',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917826/zimor/banners/hero-most-loved-tote.webp',
  },
  {
    title: 'Sculptural Crescent — Model Editorial Campaign',
    category: 'Editorial Campaign',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917826/zimor/banners/hero-model-crescent.webp',
  },
  {
    title: 'Artisan Heritage & Leathercraft Atelier Workshop',
    category: 'Brand Heritage',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917847/zimor/about/artisan-heritage-landscape.webp',
  },
  {
    title: 'Corporate Executive Boardroom Landscape',
    category: 'Work & Boardroom',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917850/zimor/about/image.webp',
  },
  {
    title: 'Modern Travel & Weekend Escape Edit',
    category: 'Travel & Escapes',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917845/zimor/lifestyle/brandgirl2.webp',
  },
  {
    title: 'Everyday Atelier Stance Campaign',
    category: 'Everyday Luxury',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917846/zimor/lifestyle/brandgirl3.webp',
  },
  {
    title: 'Tech & Modern Professional Commute',
    category: 'Commute Edit',
    url: '/tech-commute-editorial.webp',
  },
];

export default function AdminHeroBannersPage() {
  const { isDark } = useAdminTheme();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [slides, setSlides] = useState<HeroSlide[]>([
    {
      id: 'hero-slide-1',
      badge: 'PERMANENT ATELIER COLLECTION',
      title: 'ARCHITECTURAL FORM.\nEVERYDAY PURPOSE.',
      subtitle: 'Discover our permanent collection of six sculptural products engineered with 15.6" laptop compartments.',
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
      title: 'EFFORTLESS TRAVEL.\nCURATED DESIGN.',
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Media picker modal state
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState<{ id: string; url: string; filename: string }[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaTab, setMediaTab] = useState<'presets' | 'library'>('presets');
  const [mediaSearch, setMediaSearch] = useState('');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/content/homepage', { cache: 'no-store' });
      const data = await res.json();
      const rawSlides = data.content?.data?.heroSlides || data.content?.data?.slides;
      if (Array.isArray(rawSlides) && rawSlides.length > 0) {
        setSlides(
          rawSlides.map((s: any, idx: number) => ({
            id: s.id || `hero-slide-${idx + 1}`,
            badge: s.badge ?? s.eyebrow ?? '',
            title: s.title ?? s.headline ?? '',
            subtitle: s.subtitle ?? s.description ?? '',
            image: s.image || s.editorialImage || '',
            ctaText: s.ctaText || 'Shop Collection',
            ctaLink: s.ctaLink || s.slug || '/shop',
            isActive: s.isActive !== false,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load hero banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMediaLibrary = async () => {
    setLoadingMedia(true);
    try {
      const res = await apiFetch('/api/media?folder=banners');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.media)) {
          setMediaLibrary(data.media);
        }
      }
    } catch (err) {
      console.warn('Could not load dynamic media repository:', err);
    } finally {
      setLoadingMedia(false);
    }
  };

  const openMediaModal = () => {
    setIsMediaModalOpen(true);
    fetchMediaLibrary();
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const processedSlides = slides.map((s) => ({
        ...s,
        ctaLink: s.ctaLink && s.ctaLink.trim() ? s.ctaLink : '/shop',
      }));

      const res = await apiFetch('/api/content/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            heroSlides: processedSlides,
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

  // Add a clean, blank slide with no cloned data
  const addNewBlankSlide = () => {
    const newSlide: HeroSlide = {
      id: `hero-slide-${Date.now()}`,
      badge: '',
      title: '',
      subtitle: '',
      image: '',
      ctaText: 'Shop Collection',
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

  const moveSlide = (direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? activeSlideIdx - 1 : activeSlideIdx + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;
    const updated = [...slides];
    const [moved] = updated.splice(activeSlideIdx, 1);
    updated.splice(targetIdx, 0, moved);
    setSlides(updated);
    setActiveSlideIdx(targetIdx);
  };

  // Direct image upload from computer
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setMessage(null);

    try {
      const uploaded = await uploadAndRegisterMedia(file, {
        folder: 'zimor/banners',
        alt: slides[activeSlideIdx]?.title || file.name.replace(/\.[^/.]+$/, ''),
      });

      if (uploaded.secureUrl) {
        updateActiveSlide('image', uploaded.secureUrl);
        setMessage({ type: 'success', text: `Image "${file.name}" uploaded to Cloudinary and set for Slide ${activeSlideIdx + 1}!` });
      }
    } catch (err: any) {
      console.error('Direct Cloudinary banner upload failed, falling back:', err);
      // Fallback to local DataURL preview if backend media route is unavailable
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          updateActiveSlide('image', dataUrl);
          setMessage({ type: 'success', text: `Local image "${file.name}" loaded for Slide ${activeSlideIdx + 1}.` });
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const selectImageFromPreset = (url: string) => {
    updateActiveSlide('image', url);
    setIsMediaModalOpen(false);
    setMessage({ type: 'success', text: `Billboard artwork selected for Slide ${activeSlideIdx + 1}!` });
  };

  const activeSlide = slides[activeSlideIdx] || slides[0];

  const cardBg = isDark
    ? 'bg-[#24211F] border-[#36312C]'
    : 'bg-[#FFFFFF] border-[#E5DFD7] shadow-xs';

  const inputClass = isDark
    ? 'w-full px-3 py-2 bg-[#1E1C1A] border border-[#36312C] rounded text-xs text-[#E8E1DA] placeholder-[#78726C] focus:outline-none focus:border-[#5146E5]'
    : 'w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DFD7] rounded text-xs text-[#24211F] placeholder-[#8C837A] focus:outline-none focus:border-[#5146E5] focus:bg-[#FFFFFF]';

  const filteredPresets = CURATED_BANNER_PRESETS.filter(
    (p) =>
      p.title.toLowerCase().includes(mediaSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(mediaSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Hidden file input for uploading from device */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

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
            onClick={addNewBlankSlide}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold border transition-all cursor-pointer ${isDark
              ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA] hover:border-[#8A837C]'
              : 'bg-[#FFFFFF] border-[#E5DFD7] text-[#24211F] hover:bg-[#FAF7F2]'
              }`}
          >
            <Plus className="w-3.5 h-3.5 text-[#5146E5]" />
            <span>Add Blank Slide</span>
          </button>

          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-[#5146E5] hover:bg-[#4338CA] text-[#F7F5F2] shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Publishing...' : 'Publish to Storefront'}</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {message && (
        <div
          className={`p-3.5 rounded-md text-xs flex items-center justify-between border ${message.type === 'success'
            ? 'bg-[#2E7D5A]/10 border-[#2E7D5A]/25 text-[#25684A] dark:bg-[#2E7D5A]/15 dark:text-[#62C697]'
            : 'bg-[#B9382C]/10 border-[#B9382C]/25 text-[#9C281D] dark:bg-[#B9382C]/15 dark:text-[#F28B82]'
            }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Slide Selection Bar & Reorder Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {slides.map((s, idx) => {
            const isSlideActive = s.isActive !== false;
            const slideLabel = s.badge ? s.badge : s.title ? s.title.split('\n')[0] : 'Blank Slide';
            return (
              <button
                key={s.id || idx}
                onClick={() => setActiveSlideIdx(idx)}
                className={`px-3.5 py-2 rounded-md text-xs font-semibold shrink-0 transition-all border flex items-center gap-2 cursor-pointer ${activeSlideIdx === idx
                  ? 'bg-[#5146E5] text-[#F7F5F2] border-transparent shadow-xs'
                  : isDark
                    ? 'bg-[#1E1C1A] border-[#36312C] text-[#B4B4B4] hover:text-[#E8E1DA]'
                    : 'bg-[#FFFFFF] border-[#E5DFD7] text-[#5A534E] hover:bg-[#FAF7F2]'
                  }`}
              >
                <span>Slide {idx + 1}: {slideLabel}</span>
                {!isSlideActive && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono">
                    Draft
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Order Adjuster Controls */}
        <div className="flex items-center gap-1.5 text-xs text-[#5A534E] dark:text-[#B4B4B4]">
          <span className="text-[11px] mr-1">Reorder:</span>
          <button
            type="button"
            onClick={() => moveSlide('left')}
            disabled={activeSlideIdx === 0}
            className={`p-1.5 rounded border transition-all cursor-pointer ${isDark
              ? 'border-[#36312C] hover:bg-[#36312C] text-[#E8E1DA] disabled:opacity-30 disabled:cursor-not-allowed'
              : 'border-[#E5DFD7] hover:bg-[#FAF7F2] text-[#24211F] disabled:opacity-30 disabled:cursor-not-allowed'
              }`}
            title="Move slide left (earlier in rotation)"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => moveSlide('right')}
            disabled={activeSlideIdx === slides.length - 1}
            className={`p-1.5 rounded border transition-all cursor-pointer ${isDark
              ? 'border-[#36312C] hover:bg-[#36312C] text-[#E8E1DA] disabled:opacity-30 disabled:cursor-not-allowed'
              : 'border-[#E5DFD7] hover:bg-[#FAF7F2] text-[#24211F] disabled:opacity-30 disabled:cursor-not-allowed'
              }`}
            title="Move slide right (later in rotation)"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
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
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${activeSlide.isActive !== false
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}>
                {activeSlide.isActive !== false ? 'Live on Storefront' : 'Draft / Inactive'}
              </span>
              <span className="text-[10px] uppercase font-mono text-slate-400">
                16:9 Aspect Ratio
              </span>
            </div>
          </div>

          {/* Realistic Storefront Mock Preview Card */}
          <div className="relative aspect-[16/9] w-full rounded-md overflow-hidden bg-black text-white shadow-xl">
            {activeSlide.image ? (
              <Image
                src={activeSlide.image}
                alt={activeSlide.title || 'Billboard Preview'}
                fill
                className="object-cover opacity-85"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1C1A18] to-[#2B2724] border-2 border-dashed border-white/20 p-6 text-center text-white/80">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white mb-2">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-white tracking-wide">No Billboard Artwork Selected</p>
                <p className="text-xs text-white/60 max-w-sm mt-1">
                  Upload an image from your device or pick from the curated Zimor campaign library on the right.
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-full bg-[#5146E5] hover:bg-[#4338CA] text-white text-xs font-semibold shadow transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={openMediaModal}
                    className="px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Choose from Library</span>
                  </button>
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

            {/* Overlaid Storefront Typography */}
            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end pointer-events-none">
              <div className="max-w-md space-y-2">
                <span className={`inline-block px-2 py-0.5 rounded backdrop-blur-xs text-[10px] font-bold tracking-widest uppercase ${activeSlide.badge ? 'bg-white/20 text-white' : 'bg-white/10 text-white/40 border border-white/20'
                  }`}>
                  {activeSlide.badge || 'TOP EYEBROW BADGE'}
                </span>

                <h3 className={`text-lg sm:text-2xl font-bold tracking-tight uppercase whitespace-pre-line leading-tight ${activeSlide.title ? 'text-white' : 'text-white/40'
                  }`}>
                  {activeSlide.title || 'YOUR HEADLINE HERE'}
                </h3>

                <p className={`text-xs line-clamp-2 ${activeSlide.subtitle ? 'text-white/80' : 'text-white/40'
                  }`}>
                  {activeSlide.subtitle || 'Your subtitle description will appear here on tablet and desktop viewports.'}
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
            This live visual preview updates in real-time as you edit fields or select imagery.
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
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Slide</span>
              </button>
            )}
          </div>

          <div className="space-y-4 text-xs">
            {/* Active / Published Toggle */}
            <div className={`flex items-center justify-between p-3 rounded border transition-colors ${isDark
              ? 'bg-[#1E1C1A] border-[#36312C]'
              : 'bg-[#FAF7F2] border-[#E5DFD7]'
              }`}>
              <div>
                <span className="font-semibold block text-xs text-[#24211F] dark:text-[#E8E1DA]">Slide Visibility</span>
                <span className="text-[10px] text-[#5A534E] dark:text-[#B4B4B4]">
                  {activeSlide.isActive !== false ? 'Published to homepage carousel' : 'Hidden from storefront'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeSlide.isActive !== false}
                  onChange={(e) => updateActiveSlide('isActive', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5146E5]"></div>
              </label>
            </div>

            {/* Billboard Background Image Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-[#24211F] dark:text-[#E8E1DA]">
                  Billboard Background Artwork *
                </label>
                {activeSlide.image && (
                  <button
                    type="button"
                    onClick={() => updateActiveSlide('image', '')}
                    className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear Image</span>
                  </button>
                )}
              </div>

              {activeSlide.image ? (
                <div className={`relative rounded-lg overflow-hidden border p-2.5 transition-colors ${isDark ? 'bg-[#1E1C1A] border-[#36312C]' : 'bg-[#FAF7F2] border-[#E5DFD7]'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="relative w-20 h-12 rounded overflow-hidden bg-black shrink-0 border border-black/10">
                      <Image
                        src={activeSlide.image}
                        alt="Selected Banner"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-semibold truncate text-[#24211F] dark:text-[#E8E1DA]">
                        {activeSlide.image.split('/').pop()?.split('?')[0] || 'Selected Artwork'}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {activeSlide.image}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="px-2.5 py-1.5 rounded border border-[#E5DFD7] dark:border-[#36312C] hover:bg-black/5 dark:hover:bg-white/5 text-[11px] font-semibold transition-colors cursor-pointer text-[#24211F] dark:text-[#E8E1DA]"
                      >
                        {uploadingImage ? 'Uploading...' : 'Replace'}
                      </button>
                      <button
                        type="button"
                        onClick={openMediaModal}
                        className="px-2.5 py-1.5 rounded bg-[#5146E5] hover:bg-[#4338CA] text-white text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Browse
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-2 border-dashed border-slate-200 dark:border-white/15 rounded-lg text-center space-y-2.5 bg-black/[0.02] dark:bg-white/[0.02]">
                  <div className="w-9 h-9 mx-auto rounded-full bg-[#EEF0FF] dark:bg-[#5146E5]/20 flex items-center justify-center text-[#5146E5]">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#24211F] dark:text-[#E8E1DA]">
                      No Image Chosen
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Upload from your device or pick from curated ZIMOR campaign billboards.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#5146E5] hover:bg-[#4338CA] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload from Device'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={openMediaModal}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer text-[#24211F] dark:text-[#E8E1DA]"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#5146E5]" />
                      <span>Choose from Library</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Direct URL input accordion */}
              <details className="text-[11px] text-slate-400 pt-1">
                <summary className="cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 select-none">
                  Or enter image URL manually
                </summary>
                <div className="pt-2">
                  <input
                    type="text"
                    value={activeSlide.image || ''}
                    onChange={(e) => updateActiveSlide('image', e.target.value)}
                    placeholder="e.g. https://res.cloudinary.com/... or /banners/..."
                    className={inputClass}
                  />
                </div>
              </details>
            </div>

            {/* Top Eyebrow Badge */}
            <div>
              <label className="block font-semibold mb-1 text-[#24211F] dark:text-[#E8E1DA]">Top Eyebrow Badge</label>
              <input
                type="text"
                value={activeSlide.badge || ''}
                onChange={(e) => updateActiveSlide('badge', e.target.value)}
                placeholder="e.g. PERMANENT ATELIER COLLECTION or leave blank"
                className={inputClass}
              />
            </div>

            {/* Headline */}
            <div>
              <label className="block font-semibold mb-1 text-[#24211F] dark:text-[#E8E1DA]">Main Headline (Use \n for line breaks) *</label>
              <textarea
                rows={2}
                value={activeSlide.title || ''}
                onChange={(e) => updateActiveSlide('title', e.target.value)}
                placeholder="e.g. ARCHITECTURAL FORM.\nEVERYDAY PURPOSE."
                required
                className={inputClass}
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block font-semibold mb-1 text-[#24211F] dark:text-[#E8E1DA]">Subtitle Description *</label>
              <textarea
                rows={3}
                value={activeSlide.subtitle || ''}
                onChange={(e) => updateActiveSlide('subtitle', e.target.value)}
                placeholder="e.g. Discover our permanent collection of sculptural luxury bags engineered with 15.6&quot; laptop protection."
                required
                className={inputClass}
              />
            </div>

            {/* CTA Button Text (Destination URL is automatically set to /shop) */}
            <div>
              <label className="block font-semibold mb-1 text-[#24211F] dark:text-[#E8E1DA]">Button Text</label>
              <input
                type="text"
                value={activeSlide.ctaText || ''}
                onChange={(e) => updateActiveSlide('ctaText', e.target.value)}
                placeholder="e.g. Shop Collection"
                className={inputClass}
              />
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="w-full py-2.5 rounded-md text-xs font-semibold bg-[#5146E5] hover:bg-[#4338CA] text-[#F7F5F2] shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                {saving ? 'Saving...' : 'Apply & Publish Slide'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Media Library & Curated Artwork Modal */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`relative w-full max-w-4xl max-h-[85vh] rounded-xl border shadow-2xl flex flex-col overflow-hidden ${cardBg}`}>
            {/* Modal Header */}
            <div className="p-4 border-b flex items-center justify-between border-slate-100 dark:border-[#36312C]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#5146E5]" />
                <h3 className="text-sm font-bold text-[#24211F] dark:text-[#E8E1DA]">
                  Choose Billboard Artwork for Slide {activeSlideIdx + 1}
                </h3>
              </div>
              <button
                onClick={() => setIsMediaModalOpen(false)}
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Subheader: Search & Upload CTA */}
            <div className="p-4 border-b border-slate-100 dark:border-[#36312C] flex flex-wrap items-center justify-between gap-3 bg-black/[0.01] dark:bg-white/[0.01]">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  placeholder="Search campaign presets..."
                  className={`w-full pl-9 pr-3 py-1.5 rounded text-xs border focus:outline-none focus:border-[#5146E5] ${isDark
                    ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA]'
                    : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#24211F]'
                    }`}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setIsMediaModalOpen(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#5146E5] hover:bg-[#4338CA] text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload from Computer</span>
                </button>
              </div>
            </div>

            {/* Modal Content: Grid of 16:9 Artwork Cards */}
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPresets.map((preset, idx) => {
                const isSelected = activeSlide.image === preset.url;
                return (
                  <div
                    key={idx}
                    onClick={() => selectImageFromPreset(preset.url)}
                    className={`group relative rounded-lg overflow-hidden border cursor-pointer transition-all hover:shadow-md ${isSelected
                      ? 'border-[#5146E5] ring-2 ring-[#5146E5]/30'
                      : 'border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30'
                      }`}
                  >
                    <div className="relative aspect-[16/9] w-full bg-black">
                      <Image
                        src={preset.url}
                        alt={preset.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-bold shadow-md">
                          Select This Artwork
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#5146E5] text-white text-[10px] font-bold shadow">
                          Current
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <span className="text-[10px] uppercase font-mono text-[#5146E5] font-semibold block">
                        {preset.category}
                      </span>
                      <p className="text-xs font-semibold text-[#24211F] dark:text-[#E8E1DA] truncate mt-0.5">
                        {preset.title}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Also render any media uploaded in the dynamic library */}
              {mediaLibrary.map((item) => (
                <div
                  key={item.id}
                  onClick={() => selectImageFromPreset(item.url)}
                  className={`group relative rounded-lg overflow-hidden border cursor-pointer transition-all hover:shadow-md ${activeSlide.image === item.url
                    ? 'border-[#5146E5] ring-2 ring-[#5146E5]/30'
                    : 'border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30'
                    }`}
                >
                  <div className="relative aspect-[16/9] w-full bg-black">
                    <Image
                      src={item.url}
                      alt={item.filename}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-bold shadow-md">
                        Select This Artwork
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <span className="text-[10px] uppercase font-mono text-indigo-500 font-semibold block">
                      Uploaded Asset
                    </span>
                    <p className="text-xs font-semibold text-[#24211F] dark:text-[#E8E1DA] truncate mt-0.5">
                      {item.filename}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-[#36312C] flex items-center justify-between text-xs text-slate-400">
              <span>Click on any artwork to apply it immediately to Slide {activeSlideIdx + 1}.</span>
              <button
                onClick={() => setIsMediaModalOpen(false)}
                className="px-3 py-1.5 rounded border border-slate-200 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[#24211F] dark:text-[#E8E1DA] font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
