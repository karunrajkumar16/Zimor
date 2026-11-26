'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';
import {
  Save,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  RefreshCw,
  X,
  Upload,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Video,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAdminTheme } from '@/context/AdminThemeContext';
import { uploadAndRegisterMedia } from '@/lib/cloudinaryDirectUpload';
import { DEFAULT_REELS, type ReelItem } from '@/data/reels-config';
import type {
  LifestyleCardItem,
  LifestyleSectionData,
  CraftedSectionData,
} from '@/components/home/LifestyleDiscovery';
import type {
  SpotlightFrame,
  SpotlightSectionData,
} from '@/components/home/AboutZimor';

interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description?: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}

export default function AdminContentHomePage() {
  const { isDark } = useAdminTheme();

  // Content states
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [reels, setReels] = useState<ReelItem[]>(DEFAULT_REELS);
  const [lifestyle, setLifestyle] = useState<LifestyleSectionData>({
    isPublished: true,
    eyebrow: 'Find Your Everyday Match',
    heading: 'Shop by Lifestyle',
    subheading:
      'Select your lifestyle to explore the silhouette engineered for your everyday rhythm, work focus, and travel escapes.',
    exploreLink: '/shop',
    exploreText: 'Explore All Silhouettes',
    cards: [],
  });
  const [craftedInIndia, setCraftedInIndia] = useState<CraftedSectionData>({
    isPublished: true,
    heading: 'Crafted in India',
    description: '',
    videoUrl: '',
    posterUrl: '',
    supportingImage: '',
    supportingAlt: '',
    ctaText: 'Discover More',
    ctaLink: '/about',
  });
  const [spotlight, setSpotlight] = useState<SpotlightSectionData>({
    isPublished: true,
    tag: 'About Zimor',
    heading: 'In the Spotlight',
    leadText: '',
    supportingText: '',
    badges: ['Cruelty-Free Craft', '15.6" Tech Protection', 'Crafted in India'],
    ctaText: 'The Zimor Story',
    ctaLink: '/about',
    frames: [],
  });

  const [announcement, setAnnouncement] = useState<any>(null);

  // UI / Status states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Uploading states
  const [uploadingHeroIdx, setUploadingHeroIdx] = useState<number | null>(null);
  const [uploadingReel, setUploadingReel] = useState<{ idx: number; field: 'video' | 'poster' } | null>(null);
  const [uploadingLifestyleIdx, setUploadingLifestyleIdx] = useState<number | null>(null);
  const [uploadingCraftField, setUploadingCraftField] = useState<'video' | 'poster' | 'supporting' | null>(null);
  const [uploadingSpotlightIdx, setUploadingSpotlightIdx] = useState<number | null>(null);

  const cardBg = isDark
    ? 'bg-[#24211F] border-[#36312C]'
    : 'bg-[#FFFFFF] border-[#E5DFD7] shadow-xs';
  const innerCardBg = isDark
    ? 'bg-[#1E1C1A] border-[#36312C]'
    : 'bg-[#FAF7F2] border-[#E5DFD7]';
  const inputClass = `w-full rounded px-3 py-1.5 border transition-colors focus:outline-none focus:border-[#5146E5] ${
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
        const d = data.content.data;
        if (Array.isArray(d.heroSlides)) setHeroSlides(d.heroSlides);
        if (Array.isArray(d.reels) && d.reels.length > 0) setReels(d.reels);
        if (d.announcement) setAnnouncement(d.announcement);
        if (d.lifestyle) setLifestyle(d.lifestyle);
        if (d.craftedInIndia) setCraftedInIndia(d.craftedInIndia);
        if (d.spotlight) setSpotlight(d.spotlight);
      }
    } catch (err) {
      console.error('Failed to load homepage content:', err);
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
            heroSlides,
            reels,
            announcement: announcement || {
              text: 'Complimentary Express Shipping Across India · 100% Secure Checkout',
              enabled: true,
            },
            lifestyle,
            craftedInIndia,
            spotlight,
          },
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'All homepage sections successfully updated in MongoDB Atlas!' });
      } else {
        const errJson = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: errJson.error || 'Failed to update homepage content.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error saving homepage content.' });
    } finally {
      setSaving(false);
    }
  };

  // --- Upload Handlers ---
  const handleHeroImageUpload = async (idx: number, file: File) => {
    setUploadingHeroIdx(idx);
    try {
      const uploaded = await uploadAndRegisterMedia(file, {
        folder: 'zimor/banners',
        resourceType: 'image',
        alt: heroSlides[idx].title || file.name,
      });
      const updated = [...heroSlides];
      updated[idx].image = uploaded.secureUrl;
      setHeroSlides(updated);
      setMessage({ type: 'success', text: `Hero slide ${idx + 1} image uploaded to Cloudinary!` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to upload hero image.' });
    } finally {
      setUploadingHeroIdx(null);
    }
  };

  const handleLifestyleImageUpload = async (idx: number, file: File) => {
    setUploadingLifestyleIdx(idx);
    try {
      const uploaded = await uploadAndRegisterMedia(file, {
        folder: 'zimor/homepage/lifestyle',
        resourceType: 'image',
        alt: lifestyle.cards[idx]?.name || file.name,
      });
      const updatedCards = [...lifestyle.cards];
      updatedCards[idx].editorialImage = uploaded.secureUrl;
      setLifestyle({ ...lifestyle, cards: updatedCards });
      setMessage({ type: 'success', text: `Lifestyle card "${updatedCards[idx].name}" image uploaded!` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to upload lifestyle image.' });
    } finally {
      setUploadingLifestyleIdx(null);
    }
  };

  const handleCraftMediaUpload = async (field: 'video' | 'poster' | 'supporting', file: File) => {
    setUploadingCraftField(field);
    try {
      const isVideo = field === 'video';
      const uploaded = await uploadAndRegisterMedia(file, {
        folder: isVideo ? 'zimor/videos' : 'zimor/homepage',
        resourceType: isVideo ? 'video' : 'image',
        alt: craftedInIndia.heading || 'Crafted in India asset',
      });
      if (field === 'video') {
        setCraftedInIndia((prev) => ({ ...prev, videoUrl: uploaded.secureUrl }));
      } else if (field === 'poster') {
        setCraftedInIndia((prev) => ({ ...prev, posterUrl: uploaded.secureUrl }));
      } else {
        setCraftedInIndia((prev) => ({ ...prev, supportingImage: uploaded.secureUrl }));
      }
      setMessage({ type: 'success', text: `Crafted in India ${field} uploaded to Cloudinary!` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || `Failed to upload craft ${field}.` });
    } finally {
      setUploadingCraftField(null);
    }
  };

  const handleSpotlightFrameUpload = async (idx: number, file: File) => {
    setUploadingSpotlightIdx(idx);
    try {
      const uploaded = await uploadAndRegisterMedia(file, {
        folder: 'zimor/homepage',
        resourceType: 'image',
        alt: spotlight.frames[idx]?.alt || file.name,
      });
      const updatedFrames = [...spotlight.frames];
      updatedFrames[idx].image = uploaded.secureUrl;
      setSpotlight({ ...spotlight, frames: updatedFrames });
      setMessage({ type: 'success', text: `Spotlight frame ${idx + 1} image uploaded to Cloudinary!` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to upload frame image.' });
    } finally {
      setUploadingSpotlightIdx(null);
    }
  };

  const handleReelMediaUpload = async (idx: number, field: 'video' | 'poster', file: File) => {
    setUploadingReel({ idx, field });
    try {
      const isVideo = field === 'video';
      const uploaded = await uploadAndRegisterMedia(file, {
        folder: 'zimor/reels',
        resourceType: isVideo ? 'video' : 'image',
        alt: reels[idx].title || file.name,
      });
      const updated = [...reels];
      if (field === 'video') {
        updated[idx].videoUrl = uploaded.secureUrl;
      } else {
        updated[idx].posterUrl = uploaded.secureUrl;
      }
      setReels(updated);
      setMessage({ type: 'success', text: `Reel 0${idx + 1} ${field} uploaded directly to Cloudinary!` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || `Failed to upload reel ${field}.` });
    } finally {
      setUploadingReel(null);
    }
  };

  // --- Lifestyle Cards Helpers ---
  const moveLifestyleCard = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lifestyle.cards.length) return;
    const cards = [...lifestyle.cards];
    const temp = cards[index];
    cards[index] = cards[targetIndex];
    cards[targetIndex] = temp;
    // Normalize order
    cards.forEach((c, i) => {
      c.order = i + 1;
    });
    setLifestyle({ ...lifestyle, cards });
  };

  const addLifestyleCard = () => {
    const newCard: LifestyleCardItem = {
      id: `lifestyle-${Date.now()}`,
      name: 'NEW SILHOUETTE',
      subtitle: 'Engineered for modern pursuits.',
      silhouette: 'The Signature Bag',
      href: '/shop',
      editorialImage: '',
      topTitle: '',
      eyebrow: '',
      order: lifestyle.cards.length + 1,
      isPublished: true,
    };
    setLifestyle({ ...lifestyle, cards: [...lifestyle.cards, newCard] });
  };

  const removeLifestyleCard = (index: number) => {
    const cards = lifestyle.cards.filter((_, i) => i !== index);
    cards.forEach((c, i) => {
      c.order = i + 1;
    });
    setLifestyle({ ...lifestyle, cards });
  };

  // --- Spotlight Frames Helpers ---
  const moveSpotlightFrame = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= spotlight.frames.length) return;
    const frames = [...spotlight.frames];
    const temp = frames[index];
    frames[index] = frames[targetIndex];
    frames[targetIndex] = temp;
    frames.forEach((f, i) => {
      f.order = i + 1;
    });
    setSpotlight({ ...spotlight, frames });
  };

  const addSpotlightFrame = () => {
    const newFrame: SpotlightFrame = {
      id: `frame-${Date.now()}`,
      title: 'Architectural\nElegance',
      linkText: 'Explore More',
      linkHref: '/about',
      image: '',
      alt: 'Luxury architectural handbag detailing',
      gridClasses:
        'col-span-1 md:col-start-6 md:col-end-10 md:row-start-1 md:row-end-2 min-h-[260px] md:min-h-0',
      objectPosition: 'object-center',
      order: spotlight.frames.length + 1,
      isPublished: true,
    };
    setSpotlight({ ...spotlight, frames: [...spotlight.frames, newFrame] });
  };

  const removeSpotlightFrame = (index: number) => {
    const frames = spotlight.frames.filter((_, i) => i !== index);
    frames.forEach((f, i) => {
      f.order = i + 1;
    });
    setSpotlight({ ...spotlight, frames });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Homepage Dynamic Content CMS</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Manage Hero Banners, Shop by Lifestyle, Crafted in India, In the Spotlight, and Shoppable Video Reels with direct Cloudinary uploads.
          </p>
        </div>
        <button
          onClick={() => handleSave()}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5146E5] hover:bg-[#4338CA] text-[#F7F5F2] text-xs font-semibold uppercase tracking-wider rounded-md shadow-xs transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving to MongoDB...' : 'Save All Changes'}</span>
        </button>
      </div>

      {/* Alert Notification */}
      {message && (
        <div
          className={`p-3.5 rounded-lg text-xs flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-[#2E7D5A]/15 border-[#2E7D5A]/30 text-[#2E7D5A] dark:text-[#52B788]'
              : 'bg-[#B9382C]/15 border-[#B9382C]/30 text-[#B9382C] dark:text-[#F28B82]'
          }`}
        >
          <span className="font-medium">{message.text}</span>
          <button onClick={() => setMessage(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className={`p-20 text-center text-sm ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
          Loading homepage content configuration from MongoDB Atlas...
        </div>
      ) : (
        <div className="space-y-10">
          {/* ========================================================================= */}
          {/* SECTION 1: HERO SLIDER BANNERS */}
          {/* ========================================================================= */}
          <div className={`rounded-xl p-6 space-y-6 border ${cardBg}`}>
            <div className="flex items-center justify-between border-b pb-4 border-inherit">
              <div>
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#5146E5]" />
                  <span>1. Hero Slider Banners</span>
                </h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                  Top rotating full-bleed storefront hero billboards.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-[#EEF0FF] dark:bg-[#5146E5]/20 text-[#5146E5] font-semibold">
                {heroSlides.length} Slides
              </span>
            </div>

            <div className="space-y-6">
              {heroSlides.map((slide, idx) => (
                <div key={slide.id || idx} className={`rounded-lg p-5 space-y-4 border ${innerCardBg}`}>
                  <div className={`flex items-center justify-between border-b pb-2 ${isDark ? 'border-[#36312C]' : 'border-[#E5DFD7]'}`}>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#5146E5] dark:text-[#818CF8]">
                      Slide {idx + 1}: {slide.badge || 'Banner'}
                    </span>
                    <span className={`text-[10px] font-mono ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                      ID: {slide.id}
                    </span>
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
                      <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Title (Supports multi-line)</label>
                      <textarea
                        rows={2}
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
                      <textarea
                        rows={2}
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

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs items-center">
                    <div className="md:col-span-6">
                      <div className="flex items-center justify-between mb-1">
                        <label className={`font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Image URL</label>
                        <label className="text-[10px] text-[#5146E5] dark:text-[#818CF8] hover:underline cursor-pointer flex items-center gap-1 font-semibold">
                          <Upload className="w-3 h-3" />
                          {uploadingHeroIdx === idx ? 'Uploading...' : 'Upload Image'}
                          <input
                            type="file"
                            accept="image/webp,image/jpeg,image/png"
                            className="hidden"
                            disabled={uploadingHeroIdx !== null}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleHeroImageUpload(idx, file);
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </div>
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

                    <div className="md:col-span-3">
                      <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>CTA Text</label>
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

                    <div className="md:col-span-3">
                      <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>CTA Link</label>
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

          {/* ========================================================================= */}
          {/* SECTION 2: SHOP BY LIFESTYLE */}
          {/* ========================================================================= */}
          <div className={`rounded-xl p-6 space-y-6 border ${cardBg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-inherit">
              <div>
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#5146E5]" />
                  <span>2. Shop by Lifestyle</span>
                </h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                  Curated lifestyle portals (Everyday, Work, Travel) with parallax imagery and direct collection linking.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setLifestyle({ ...lifestyle, isPublished: !lifestyle.isPublished })}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    lifestyle.isPublished !== false
                      ? 'bg-[#2E7D5A]/15 text-[#2E7D5A] dark:text-[#52B788]'
                      : 'bg-[#B9382C]/15 text-[#B9382C] dark:text-[#F28B82]'
                  }`}
                >
                  {lifestyle.isPublished !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{lifestyle.isPublished !== false ? 'Section Published' : 'Section Unpublished'}</span>
                </button>

                <button
                  type="button"
                  onClick={addLifestyleCard}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#5146E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Card</span>
                </button>
              </div>
            </div>

            {/* Section Header Inputs */}
            <div className={`p-4 rounded-lg space-y-3 border ${innerCardBg}`}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5146E5]">Section Header & Copy</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Eyebrow Tag</label>
                  <input
                    type="text"
                    value={lifestyle.eyebrow || ''}
                    onChange={(e) => setLifestyle({ ...lifestyle, eyebrow: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Heading</label>
                  <input
                    type="text"
                    value={lifestyle.heading || ''}
                    onChange={(e) => setLifestyle({ ...lifestyle, heading: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Subheading</label>
                  <input
                    type="text"
                    value={lifestyle.subheading || ''}
                    onChange={(e) => setLifestyle({ ...lifestyle, subheading: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Explore Link Text</label>
                  <input
                    type="text"
                    value={lifestyle.exploreText || ''}
                    onChange={(e) => setLifestyle({ ...lifestyle, exploreText: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Explore Destination URL</label>
                  <input
                    type="text"
                    value={lifestyle.exploreLink || ''}
                    onChange={(e) => setLifestyle({ ...lifestyle, exploreLink: e.target.value })}
                    className={`${inputClass} font-mono text-[11px]`}
                  />
                </div>
              </div>
            </div>

            {/* Cards List */}
            <div className="space-y-4">
              {lifestyle.cards.map((card, idx) => (
                <div key={card.id || idx} className={`p-4 rounded-lg border space-y-4 ${innerCardBg}`}>
                  {/* Card Header with controls */}
                  <div className="flex items-center justify-between border-b pb-2 border-inherit">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#5146E5] dark:text-[#818CF8]">
                        Card 0{idx + 1}: {card.name || 'Untitled'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...lifestyle.cards];
                          updated[idx].isPublished = updated[idx].isPublished === false ? true : false;
                          setLifestyle({ ...lifestyle, cards: updated });
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded font-medium cursor-pointer ${
                          card.isPublished !== false
                            ? 'bg-[#2E7D5A]/15 text-[#2E7D5A]'
                            : 'bg-[#B9382C]/15 text-[#B9382C]'
                        }`}
                      >
                        {card.isPublished !== false ? 'Published' : 'Hidden'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveLifestyleCard(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveLifestyleCard(idx, 'down')}
                        disabled={idx === lifestyle.cards.length - 1}
                        className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLifestyleCard(idx)}
                        className="p-1 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                        title="Delete Card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs items-center">
                    {/* Image Preview & Upload */}
                    <div className="md:col-span-3">
                      <div className="relative w-full aspect-[3/4] max-w-[140px] mx-auto rounded-lg overflow-hidden bg-black/10 border border-inherit">
                        {card.editorialImage ? (
                          <Image
                            src={card.editorialImage}
                            alt={card.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <label className="mt-2 text-center text-[11px] text-[#5146E5] dark:text-[#818CF8] hover:underline cursor-pointer flex items-center justify-center gap-1 font-semibold">
                        <Upload className="w-3 h-3" />
                        {uploadingLifestyleIdx === idx ? 'Uploading...' : 'Upload Image'}
                        <input
                          type="file"
                          accept="image/webp,image/jpeg,image/png"
                          className="hidden"
                          disabled={uploadingLifestyleIdx !== null}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleLifestyleImageUpload(idx, file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>

                    {/* Inputs */}
                    <div className="md:col-span-9 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                            Card Name (Uppercase)
                          </label>
                          <input
                            type="text"
                            value={card.name}
                            onChange={(e) => {
                              const updated = [...lifestyle.cards];
                              updated[idx].name = e.target.value;
                              setLifestyle({ ...lifestyle, cards: updated });
                            }}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                            Subtitle / Theme
                          </label>
                          <input
                            type="text"
                            value={card.subtitle}
                            onChange={(e) => {
                              const updated = [...lifestyle.cards];
                              updated[idx].subtitle = e.target.value;
                              setLifestyle({ ...lifestyle, cards: updated });
                            }}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                            Assigned Silhouette / Bag Line
                          </label>
                          <input
                            type="text"
                            value={card.silhouette}
                            onChange={(e) => {
                              const updated = [...lifestyle.cards];
                              updated[idx].silhouette = e.target.value;
                              setLifestyle({ ...lifestyle, cards: updated });
                            }}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                            Destination URL / Anchor
                          </label>
                          <input
                            type="text"
                            value={card.href}
                            onChange={(e) => {
                              const updated = [...lifestyle.cards];
                              updated[idx].href = e.target.value;
                              setLifestyle({ ...lifestyle, cards: updated });
                            }}
                            className={`${inputClass} font-mono text-[11px]`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                          Cloudinary Image URL
                        </label>
                        <input
                          type="text"
                          value={card.editorialImage}
                          onChange={(e) => {
                            const updated = [...lifestyle.cards];
                            updated[idx].editorialImage = e.target.value;
                            setLifestyle({ ...lifestyle, cards: updated });
                          }}
                          className={`${inputClass} font-mono text-[11px]`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3: CRAFTED IN INDIA */}
          {/* ========================================================================= */}
          <div className={`rounded-xl p-6 space-y-6 border ${cardBg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-inherit">
              <div>
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#5146E5]" />
                  <span>3. Crafted in India Showcase</span>
                </h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                  50/50 full-bleed split section: autoplaying craftsmanship video stream on left, editorial narrative with inset photograph on right.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCraftedInIndia({ ...craftedInIndia, isPublished: !craftedInIndia.isPublished })}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  craftedInIndia.isPublished !== false
                    ? 'bg-[#2E7D5A]/15 text-[#2E7D5A] dark:text-[#52B788]'
                    : 'bg-[#B9382C]/15 text-[#B9382C] dark:text-[#F28B82]'
                }`}
              >
                {craftedInIndia.isPublished !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{craftedInIndia.isPublished !== false ? 'Section Published' : 'Section Unpublished'}</span>
              </button>
            </div>

            <div className="space-y-5">
              {/* Text narrative inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Heading</label>
                  <input
                    type="text"
                    value={craftedInIndia.heading || ''}
                    onChange={(e) => setCraftedInIndia({ ...craftedInIndia, heading: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>CTA Text</label>
                  <input
                    type="text"
                    value={craftedInIndia.ctaText || ''}
                    onChange={(e) => setCraftedInIndia({ ...craftedInIndia, ctaText: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>CTA Destination Link</label>
                  <input
                    type="text"
                    value={craftedInIndia.ctaLink || ''}
                    onChange={(e) => setCraftedInIndia({ ...craftedInIndia, ctaLink: e.target.value })}
                    className={`${inputClass} font-mono text-[11px]`}
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                  Editorial Body Description
                </label>
                <textarea
                  rows={3}
                  value={craftedInIndia.description || ''}
                  onChange={(e) => setCraftedInIndia({ ...craftedInIndia, description: e.target.value })}
                  className={inputClass}
                />
              </div>

              {/* Media assets grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs pt-2">
                {/* 1. Video Stream */}
                <div className={`p-4 rounded-lg border space-y-3 ${innerCardBg}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#5146E5]">1. Video Stream (.mp4)</span>
                    <label className="text-[10px] text-[#5146E5] dark:text-[#818CF8] hover:underline cursor-pointer flex items-center gap-1 font-semibold">
                      <Upload className="w-3 h-3" />
                      {uploadingCraftField === 'video' ? 'Uploading...' : 'Upload Video'}
                      <input
                        type="file"
                        accept="video/mp4,video/webm"
                        className="hidden"
                        disabled={uploadingCraftField !== null}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCraftMediaUpload('video', file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                  <div className="relative w-full aspect-video rounded overflow-hidden bg-black">
                    {craftedInIndia.videoUrl ? (
                      <video
                        src={craftedInIndia.videoUrl}
                        poster={craftedInIndia.posterUrl}
                        controls
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <Video className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={craftedInIndia.videoUrl || ''}
                    onChange={(e) => setCraftedInIndia({ ...craftedInIndia, videoUrl: e.target.value })}
                    className={`${inputClass} font-mono text-[10px]`}
                    placeholder="https://res.cloudinary.com/.../video.mp4"
                  />
                </div>

                {/* 2. Video Poster */}
                <div className={`p-4 rounded-lg border space-y-3 ${innerCardBg}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#5146E5]">2. Video Poster (.webp)</span>
                    <label className="text-[10px] text-[#5146E5] dark:text-[#818CF8] hover:underline cursor-pointer flex items-center gap-1 font-semibold">
                      <Upload className="w-3 h-3" />
                      {uploadingCraftField === 'poster' ? 'Uploading...' : 'Upload Poster'}
                      <input
                        type="file"
                        accept="image/webp,image/jpeg,image/png"
                        className="hidden"
                        disabled={uploadingCraftField !== null}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCraftMediaUpload('poster', file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                  <div className="relative w-full aspect-video rounded overflow-hidden bg-black/10">
                    {craftedInIndia.posterUrl ? (
                      <Image
                        src={craftedInIndia.posterUrl}
                        alt="Poster"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={craftedInIndia.posterUrl || ''}
                    onChange={(e) => setCraftedInIndia({ ...craftedInIndia, posterUrl: e.target.value })}
                    className={`${inputClass} font-mono text-[10px]`}
                    placeholder="https://res.cloudinary.com/.../poster.webp"
                  />
                </div>

                {/* 3. Supporting Editorial Image */}
                <div className={`p-4 rounded-lg border space-y-3 ${innerCardBg}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#5146E5]">3. Supporting Inset Photo</span>
                    <label className="text-[10px] text-[#5146E5] dark:text-[#818CF8] hover:underline cursor-pointer flex items-center gap-1 font-semibold">
                      <Upload className="w-3 h-3" />
                      {uploadingCraftField === 'supporting' ? 'Uploading...' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/webp,image/jpeg,image/png"
                        className="hidden"
                        disabled={uploadingCraftField !== null}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCraftMediaUpload('supporting', file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                  <div className="relative w-full aspect-video rounded overflow-hidden bg-black/10">
                    {craftedInIndia.supportingImage ? (
                      <Image
                        src={craftedInIndia.supportingImage}
                        alt="Supporting"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={craftedInIndia.supportingImage || ''}
                    onChange={(e) => setCraftedInIndia({ ...craftedInIndia, supportingImage: e.target.value })}
                    className={`${inputClass} font-mono text-[10px]`}
                    placeholder="https://res.cloudinary.com/.../photo.webp"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 4: IN THE SPOTLIGHT */}
          {/* ========================================================================= */}
          <div className={`rounded-xl p-6 space-y-6 border ${cardBg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-inherit">
              <div>
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#5146E5]" />
                  <span>4. In the Spotlight Editorial Campaign</span>
                </h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                  Pinterest-style 12-column asymmetric masonry photography collage with multi-speed parallax and storytelling narrative.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSpotlight({ ...spotlight, isPublished: !spotlight.isPublished })}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    spotlight.isPublished !== false
                      ? 'bg-[#2E7D5A]/15 text-[#2E7D5A] dark:text-[#52B788]'
                      : 'bg-[#B9382C]/15 text-[#B9382C] dark:text-[#F28B82]'
                  }`}
                >
                  {spotlight.isPublished !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{spotlight.isPublished !== false ? 'Section Published' : 'Section Unpublished'}</span>
                </button>

                <button
                  type="button"
                  onClick={addSpotlightFrame}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#5146E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Frame</span>
                </button>
              </div>
            </div>

            {/* Story Panel Narrative Inputs */}
            <div className={`p-4 rounded-lg space-y-4 border ${innerCardBg}`}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5146E5]">Editorial Story Panel Copy (Tile 01)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Tag / Eyebrow</label>
                  <input
                    type="text"
                    value={spotlight.tag || ''}
                    onChange={(e) => setSpotlight({ ...spotlight, tag: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Heading</label>
                  <input
                    type="text"
                    value={spotlight.heading || ''}
                    onChange={(e) => setSpotlight({ ...spotlight, heading: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Feature Badges (Comma-separated)</label>
                  <input
                    type="text"
                    value={(spotlight.badges || []).join(', ')}
                    onChange={(e) => {
                      const badges = e.target.value.split(',').map((b) => b.trim()).filter(Boolean);
                      setSpotlight({ ...spotlight, badges });
                    }}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Lead Narrative Paragraph</label>
                  <textarea
                    rows={2}
                    value={spotlight.leadText || ''}
                    onChange={(e) => setSpotlight({ ...spotlight, leadText: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Supporting Narrative Paragraph</label>
                  <textarea
                    rows={2}
                    value={spotlight.supportingText || ''}
                    onChange={(e) => setSpotlight({ ...spotlight, supportingText: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>CTA Button Text</label>
                  <input
                    type="text"
                    value={spotlight.ctaText || ''}
                    onChange={(e) => setSpotlight({ ...spotlight, ctaText: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>CTA Destination Link</label>
                  <input
                    type="text"
                    value={spotlight.ctaLink || ''}
                    onChange={(e) => setSpotlight({ ...spotlight, ctaLink: e.target.value })}
                    className={`${inputClass} font-mono text-[11px]`}
                  />
                </div>
              </div>
            </div>

            {/* Gallery Frames List */}
            <div className="space-y-4">
              {spotlight.frames.map((frame, idx) => (
                <div key={frame.id || idx} className={`p-4 rounded-lg border space-y-4 ${innerCardBg}`}>
                  <div className="flex items-center justify-between border-b pb-2 border-inherit">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#5146E5] dark:text-[#818CF8]">
                        Tile 0{idx + 2}: {frame.title?.replace('\n', ' ') || 'Gallery Frame'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...spotlight.frames];
                          updated[idx].isPublished = updated[idx].isPublished === false ? true : false;
                          setSpotlight({ ...spotlight, frames: updated });
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded font-medium cursor-pointer ${
                          frame.isPublished !== false
                            ? 'bg-[#2E7D5A]/15 text-[#2E7D5A]'
                            : 'bg-[#B9382C]/15 text-[#B9382C]'
                        }`}
                      >
                        {frame.isPublished !== false ? 'Published' : 'Hidden'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveSpotlightFrame(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSpotlightFrame(idx, 'down')}
                        disabled={idx === spotlight.frames.length - 1}
                        className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSpotlightFrame(idx)}
                        className="p-1 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                        title="Delete Frame"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs items-center">
                    {/* Thumbnail & Upload */}
                    <div className="md:col-span-3">
                      <div className="relative w-full aspect-square max-w-[130px] mx-auto rounded-lg overflow-hidden bg-black/10 border border-inherit">
                        {frame.image ? (
                          <Image
                            src={frame.image}
                            alt={frame.alt || frame.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <label className="mt-2 text-center text-[11px] text-[#5146E5] dark:text-[#818CF8] hover:underline cursor-pointer flex items-center justify-center gap-1 font-semibold">
                        <Upload className="w-3 h-3" />
                        {uploadingSpotlightIdx === idx ? 'Uploading...' : 'Upload Image'}
                        <input
                          type="file"
                          accept="image/webp,image/jpeg,image/png"
                          className="hidden"
                          disabled={uploadingSpotlightIdx !== null}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleSpotlightFrameUpload(idx, file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>

                    {/* Inputs */}
                    <div className="md:col-span-9 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                            Frame Title (Line breaks supported)
                          </label>
                          <textarea
                            rows={2}
                            value={frame.title}
                            onChange={(e) => {
                              const updated = [...spotlight.frames];
                              updated[idx].title = e.target.value;
                              setSpotlight({ ...spotlight, frames: updated });
                            }}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                            Object Position
                          </label>
                          <select
                            value={frame.objectPosition || 'object-center'}
                            onChange={(e) => {
                              const updated = [...spotlight.frames];
                              updated[idx].objectPosition = e.target.value;
                              setSpotlight({ ...spotlight, frames: updated });
                            }}
                            className={inputClass}
                          >
                            <option value="object-center">Center</option>
                            <option value="object-top">Top</option>
                            <option value="object-bottom">Bottom</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                            Overlay Link Text
                          </label>
                          <input
                            type="text"
                            value={frame.linkText}
                            onChange={(e) => {
                              const updated = [...spotlight.frames];
                              updated[idx].linkText = e.target.value;
                              setSpotlight({ ...spotlight, frames: updated });
                            }}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                            Overlay Destination Link
                          </label>
                          <input
                            type="text"
                            value={frame.linkHref}
                            onChange={(e) => {
                              const updated = [...spotlight.frames];
                              updated[idx].linkHref = e.target.value;
                              setSpotlight({ ...spotlight, frames: updated });
                            }}
                            className={`${inputClass} font-mono text-[11px]`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                          Cloudinary Image URL
                        </label>
                        <input
                          type="text"
                          value={frame.image}
                          onChange={(e) => {
                            const updated = [...spotlight.frames];
                            updated[idx].image = e.target.value;
                            setSpotlight({ ...spotlight, frames: updated });
                          }}
                          className={`${inputClass} font-mono text-[11px]`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 5: SHOPPABLE VIDEO REELS */}
          {/* ========================================================================= */}
          <div className={`rounded-xl p-6 space-y-6 border ${cardBg}`}>
            <div className="flex items-center justify-between border-b pb-4 border-inherit">
              <div>
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#5146E5]" />
                  <span>5. Shoppable Video Reels (Shop by Video)</span>
                </h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                  5 High-performance Instagram Reels hosted on Cloudinary, complete with video stream, poster image, title, and assigned shoppable product.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-[#EEF0FF] dark:bg-[#5146E5]/20 text-[#5146E5] font-semibold">
                {reels.length} Active Reels
              </span>
            </div>

            <div className="space-y-4">
              {reels.map((reel, idx) => (
                <div key={reel.id} className={`p-4 rounded-lg border space-y-3 ${innerCardBg}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#5146E5] dark:text-[#818CF8]">
                      Reel 0{idx + 1}: {reel.title}
                    </span>
                    {reel.instagramUrl && (
                      <a
                        href={reel.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-mono text-[#5146E5] hover:underline flex items-center gap-1"
                      >
                        Original Instagram Reel ↗
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs items-center">
                    {/* Video Player Preview */}
                    <div className="md:col-span-3">
                      <div className="relative w-full aspect-[9/16] max-w-[130px] mx-auto rounded-lg overflow-hidden bg-black border border-inherit">
                        <video
                          src={reel.videoUrl}
                          poster={reel.posterUrl}
                          muted
                          loop
                          playsInline
                          controls
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Metadata Inputs */}
                    <div className="md:col-span-9 space-y-3">
                      <div>
                        <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                          Reel Caption / Title
                        </label>
                        <input
                          type="text"
                          value={reel.title}
                          onChange={(e) => {
                            const updated = [...reels];
                            updated[idx].title = e.target.value;
                            setReels(updated);
                          }}
                          className={inputClass}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className={`font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                              Cloudinary Video Stream URL (.mp4)
                            </label>
                            <label className="text-[10px] text-[#5146E5] dark:text-[#818CF8] hover:underline cursor-pointer flex items-center gap-1 font-semibold">
                              <Upload className="w-3 h-3" />
                              {uploadingReel?.idx === idx && uploadingReel?.field === 'video' ? 'Uploading...' : 'Upload Video'}
                              <input
                                type="file"
                                accept="video/mp4,video/webm"
                                className="hidden"
                                disabled={uploadingReel !== null}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleReelMediaUpload(idx, 'video', file);
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          </div>
                          <input
                            type="text"
                            value={reel.videoUrl}
                            onChange={(e) => {
                              const updated = [...reels];
                              updated[idx].videoUrl = e.target.value;
                              setReels(updated);
                            }}
                            className={`${inputClass} font-mono text-[11px]`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className={`font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                              Cloudinary Poster Image URL (.webp)
                            </label>
                            <label className="text-[10px] text-[#5146E5] dark:text-[#818CF8] hover:underline cursor-pointer flex items-center gap-1 font-semibold">
                              <Upload className="w-3 h-3" />
                              {uploadingReel?.idx === idx && uploadingReel?.field === 'poster' ? 'Uploading...' : 'Upload Poster'}
                              <input
                                type="file"
                                accept="image/webp,image/jpeg,image/png"
                                className="hidden"
                                disabled={uploadingReel !== null}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleReelMediaUpload(idx, 'poster', file);
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          </div>
                          <input
                            type="text"
                            value={reel.posterUrl}
                            onChange={(e) => {
                              const updated = [...reels];
                              updated[idx].posterUrl = e.target.value;
                              setReels(updated);
                            }}
                            className={`${inputClass} font-mono text-[11px]`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                            Instagram Reference URL
                          </label>
                          <input
                            type="text"
                            value={reel.instagramUrl || ''}
                            onChange={(e) => {
                              const updated = [...reels];
                              updated[idx].instagramUrl = e.target.value;
                              setReels(updated);
                            }}
                            className={`${inputClass} font-mono text-[11px]`}
                          />
                        </div>
                        <div>
                          <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                            Associated Product Slug
                          </label>
                          <input
                            type="text"
                            value={reel.productSlug || ''}
                            onChange={(e) => {
                              const updated = [...reels];
                              updated[idx].productSlug = e.target.value;
                              setReels(updated);
                            }}
                            className={`${inputClass} font-mono text-[11px]`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
