'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  ExternalLink,
  RotateCcw,
  FileCheck,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAdminTheme } from '@/context/AdminThemeContext';
import type { AboutMediaSection, AboutMediaMapping } from '@/types';

// Default fallback matching backend verification
const FALLBACK_ABOUT_MEDIA: AboutMediaMapping = {
  brandOverview: {
    id: 'brandOverview',
    title: 'Brand Overview Canvas',
    subtitle: 'Panoramic Editorial Banner',
    description: 'Main wide-canvas visual displayed under Section 01 – Brand Overview.',
    recommendedAspect: '21:9 or 24:9 Panoramic (16:9 Mobile)',
    recommendedResolution: '2400 x 900 px (min 1920 x 720)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917844/zimor/lifestyle/corporate-workspace-horizontal.webp',
    publicId: 'zimor/lifestyle/corporate-workspace-horizontal',
    alt: 'ZIMOR Premium fashion and accessories collection overview',
    updatedAt: '2026-11-24T00:00:00.000Z',
  },
  brandStory: {
    id: 'brandStory',
    title: 'Brand Story Portrait',
    subtitle: 'Atelier & Craftsmanship',
    description: 'Vertical editorial portrait displayed next to the Section 03 – Brand Story narrative.',
    recommendedAspect: '3:4 Portrait (4:5 Mobile)',
    recommendedResolution: '1200 x 1500 px (min 800 x 1000)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917849/zimor/about/craftsmanship-atelier.webp',
    publicId: 'zimor/about/craftsmanship-atelier',
    alt: 'Precision, care and attention to detail in craftsmanship',
    updatedAt: '2026-11-24T00:00:00.000Z',
  },
  brandVision: {
    id: 'brandVision',
    title: 'Brand Vision Spread',
    subtitle: 'Editorial Spread Card',
    description: 'Atmospheric background image for Section 04 – Brand Vision card.',
    recommendedAspect: '4:3 Card (4:5 Mobile / 1:1 Tablet)',
    recommendedResolution: '1200 x 1200 px (min 800 x 800)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917848/zimor/about/brand-vision-duo-colleagues.webp',
    publicId: 'zimor/about/brand-vision-duo-colleagues',
    alt: 'ZIMOR Brand Vision – Inspiring women through distinctive design and accessible premium fashion',
    updatedAt: '2026-11-24T00:00:00.000Z',
  },
  brandMission: {
    id: 'brandMission',
    title: 'Brand Mission Spread',
    subtitle: 'Editorial Spread Card',
    description: 'Atmospheric background image for Section 05 – Brand Mission card.',
    recommendedAspect: '4:3 Card (4:5 Mobile / 1:1 Tablet)',
    recommendedResolution: '1200 x 1200 px (min 800 x 800)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917847/zimor/about/brand-mission-leather.webp',
    publicId: 'zimor/about/brand-mission-leather',
    alt: 'ZIMOR Brand Mission – Fashion-forward handbags and meticulous craftsmanship',
    updatedAt: '2026-11-24T00:00:00.000Z',
  },
  brandValues: {
    id: 'brandValues',
    title: 'Brand Values Visual',
    subtitle: 'Quiet Luxury Atelier',
    description: 'Editorial craftsmanship photography displayed alongside the 7 Brand Values in Section 06.',
    recommendedAspect: '4:5 Portrait',
    recommendedResolution: '1200 x 1500 px (min 800 x 1000)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917850/zimor/about/brand-values-craft.webp',
    publicId: 'zimor/about/brand-values-craft',
    alt: 'Artisanal leathercraft and precision stitching at the Zimor atelier',
    updatedAt: '2026-11-24T00:00:00.000Z',
  },
};

const SECTION_KEYS: Array<keyof AboutMediaMapping> = [
  'brandOverview',
  'brandStory',
  'brandVision',
  'brandMission',
  'brandValues',
];

const SECTION_NUMBERS: Record<string, string> = {
  brandOverview: '01',
  brandStory: '03',
  brandVision: '04',
  brandMission: '05',
  brandValues: '06',
};

const SECTION_RATIOS: Record<string, { desktop: string; mobile: string }> = {
  brandOverview: { desktop: '21:9', mobile: '16:9' },
  brandStory: { desktop: '3:4', mobile: '4:5' },
  brandVision: { desktop: '4:3', mobile: '4:5' },
  brandMission: { desktop: '4:3', mobile: '4:5' },
  brandValues: { desktop: '4:5', mobile: '4:5' },
};

interface StagedUpload {
  file: File;
  previewUrl: string;
  dimensions?: { width: number; height: number };
}

export default function AdminAboutMediaPage() {
  const { isDark } = useAdminTheme();

  const [mediaMapping, setMediaMapping] = useState<AboutMediaMapping>(FALLBACK_ABOUT_MEDIA);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadingSection, setUploadingSection] = useState<string | null>(null);
  const [resettingSection, setResettingSection] = useState<string | null>(null);

  // Staged files per section
  const [stagedUploads, setStagedUploads] = useState<Record<string, StagedUpload>>({});
  // Alt text per section
  const [altTexts, setAltTexts] = useState<Record<string, string>>({});
  // Viewport mode per section ('desktop' | 'mobile')
  const [viewportModes, setViewportModes] = useState<Record<string, 'desktop' | 'mobile'>>({
    brandOverview: 'desktop',
    brandStory: 'desktop',
    brandVision: 'desktop',
    brandMission: 'desktop',
    brandValues: 'desktop',
  });
  // Dragging state per section
  const [draggingSection, setDraggingSection] = useState<string | null>(null);

  // Notification banner
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning';
    text: string;
  } | null>(null);

  // File input refs per section
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Theme styling helpers
  const cardBg = isDark
    ? 'bg-[#24211F] border-[#36312C]'
    : 'bg-[#FFFFFF] border-[#E5DFD7] shadow-xs';
  const innerCardBg = isDark
    ? 'bg-[#1E1C1A] border-[#36312C]'
    : 'bg-[#FAF7F2] border-[#E5DFD7]';

  // Fetch current media from MongoDB
  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/about-media');
      const data = await res.json();
      if (data.media) {
        setMediaMapping(data.media);
        // Initialize alt texts
        const initialAlt: Record<string, string> = {};
        for (const key of SECTION_KEYS) {
          initialAlt[key] = data.media[key]?.alt || FALLBACK_ABOUT_MEDIA[key]?.alt || '';
        }
        setAltTexts(initialAlt);
      }
    } catch (err: any) {
      console.error('Failed to fetch about media:', err);
      setNotification({
        type: 'error',
        text: 'Failed to load About page media mappings from MongoDB Atlas.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(stagedUploads).forEach((s) => {
        if (s.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(s.previewUrl);
        }
      });
    };
  }, [stagedUploads]);

  // Client-side strict validation for WebP
  const handleFileSelection = (sectionKey: string, file: File) => {
    setNotification(null);

    const isWebpMime = file.type === 'image/webp';
    const isWebpExt = file.name.toLowerCase().endsWith('.webp');

    if (!isWebpMime || !isWebpExt) {
      const ext = file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN';
      setNotification({
        type: 'error',
        text: `Invalid file format for Section ${SECTION_NUMBERS[sectionKey]}: "${file.name}" (${ext}). Only WebP (.webp) format is allowed. JPEG, PNG, JPG, SVG, and other formats are strictly rejected.`,
      });
      if (fileInputRefs.current[sectionKey]) {
        fileInputRefs.current[sectionKey]!.value = '';
      }
      return;
    }

    // Clean up previous staged preview for this section
    const prev = stagedUploads[sectionKey];
    if (prev && prev.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(prev.previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      setStagedUploads((curr) => ({
        ...curr,
        [sectionKey]: {
          file,
          previewUrl,
          dimensions: { width: img.naturalWidth, height: img.naturalHeight },
        },
      }));
    };
    img.src = previewUrl;

    setStagedUploads((curr) => ({
      ...curr,
      [sectionKey]: { file, previewUrl },
    }));
  };

  const handleDiscardStaged = (sectionKey: string) => {
    const staged = stagedUploads[sectionKey];
    if (staged && staged.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(staged.previewUrl);
    }
    setStagedUploads((curr) => {
      const updated = { ...curr };
      delete updated[sectionKey];
      return updated;
    });
    if (fileInputRefs.current[sectionKey]) {
      fileInputRefs.current[sectionKey]!.value = '';
    }
  };

  // Upload to Cloudinary & save to MongoDB
  const handleUploadAndPublish = async (sectionKey: string) => {
    const staged = stagedUploads[sectionKey];
    const sec = mediaMapping[sectionKey] || FALLBACK_ABOUT_MEDIA[sectionKey];
    const currentAlt = altTexts[sectionKey] || sec.alt || '';

    if (!staged) {
      setNotification({
        type: 'warning',
        text: `Please select a WebP image for ${sec.title} before publishing.`,
      });
      return;
    }

    setUploadingSection(sectionKey);
    setNotification(null);

    try {
      const formData = new FormData();
      formData.append('file', staged.file);
      formData.append('section', sectionKey);
      formData.append('alt', currentAlt);

      const res = await apiFetch('/api/about-media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      if (data.media) {
        setMediaMapping(data.media);
      }

      setNotification({
        type: 'success',
        text: `Successfully uploaded and published image for Section ${SECTION_NUMBERS[sectionKey]} (${sec.title}) to Cloudinary (zimor/about/) and MongoDB!`,
      });

      handleDiscardStaged(sectionKey);
    } catch (err: any) {
      console.error('Failed to upload media:', err);
      setNotification({
        type: 'error',
        text: err.message || 'An error occurred while uploading the image.',
      });
    } finally {
      setUploadingSection(null);
    }
  };

  // Revert section to default Cloudinary image
  const handleResetSection = async (sectionKey: string) => {
    const sec = mediaMapping[sectionKey] || FALLBACK_ABOUT_MEDIA[sectionKey];
    const confirmed = window.confirm(
      `Revert Section ${SECTION_NUMBERS[sectionKey]} ("${sec.title}") to its default verified Cloudinary image?`
    );
    if (!confirmed) return;

    setResettingSection(sectionKey);
    setNotification(null);

    try {
      const res = await apiFetch('/api/about-media/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: sectionKey }),
      });
      const data = await res.json();
      if (data.media) {
        setMediaMapping(data.media);
        setAltTexts((curr) => ({
          ...curr,
          [sectionKey]: data.media[sectionKey]?.alt || FALLBACK_ABOUT_MEDIA[sectionKey].alt,
        }));
      }
      setNotification({
        type: 'success',
        text: `Reset Section ${SECTION_NUMBERS[sectionKey]} ("${sec.title}") to default Cloudinary image.`,
      });
      handleDiscardStaged(sectionKey);
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err.message || 'Failed to reset section.',
      });
    } finally {
      setResettingSection(null);
    }
  };

  const scrollToSection = (sectionKey: string) => {
    const el = document.getElementById(`section-card-${sectionKey}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleViewportMode = (sectionKey: string, mode: 'desktop' | 'mobile') => {
    setViewportModes((curr) => ({ ...curr, [sectionKey]: mode }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 border-line/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">About Page Media Manager</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              WebP Only
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            All previews match the exact aspect ratio, container dimensions, and visual composition of the live About Us storefront.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/about"
            target="_blank"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
              isDark
                ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA] hover:border-[#5146E5]'
                : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#24211F] hover:border-[#5146E5]'
            }`}
          >
            <span>View Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={fetchMedia}
            disabled={loading}
            title="Refresh from MongoDB Atlas"
            className={`p-2 rounded border transition-colors ${
              isDark
                ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA] hover:border-[#5146E5]'
                : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#24211F] hover:border-[#5146E5]'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-3.5 rounded-lg text-xs flex items-start justify-between gap-3 border transition-all ${
            notification.type === 'success'
              ? 'bg-[#2E7D5A]/15 border-[#2E7D5A]/30 text-[#2E7D5A] dark:text-[#52B788]'
              : notification.type === 'warning'
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400'
              : 'bg-[#B9382C]/15 border-[#B9382C]/30 text-[#B9382C] dark:text-[#F28B82]'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span className="font-medium">{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="opacity-70 hover:opacity-100 p-0.5 rounded transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Jump Bar */}
      <div className={`p-3 rounded-lg border flex flex-wrap items-center justify-between gap-2 text-xs ${cardBg}`}>
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
          Jump to Section:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {SECTION_KEYS.map((key) => {
            const secNumber = SECTION_NUMBERS[key];
            const sec = mediaMapping[key] || FALLBACK_ABOUT_MEDIA[key];
            const ratio = SECTION_RATIOS[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => scrollToSection(key)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors flex items-center gap-1.5 ${
                  isDark
                    ? 'bg-[#1E1C1A] border-[#36312C] text-[#B4B4B4] hover:text-[#E8E1DA] hover:border-[#5146E5]'
                    : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#5A534E] hover:text-[#24211F] hover:border-[#5146E5]'
                }`}
              >
                <span className="font-mono text-[#5146E5] font-bold">Sec {secNumber}</span>
                <span>{sec.title.split(' ')[0]}</span>
                <span className="text-[9px] opacity-60">({ratio.desktop})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SINGLE VERTICAL SEQUENCE: Bespoke Preview Containers with Storefront Accuracy */}
      <div className="space-y-8">
        {SECTION_KEYS.map((key) => {
          const sec = mediaMapping[key] || FALLBACK_ABOUT_MEDIA[key];
          const secNumber = SECTION_NUMBERS[key];
          const staged = stagedUploads[key];
          const isUploading = uploadingSection === key;
          const isResetting = resettingSection === key;
          const isDragging = draggingSection === key;
          const currentAlt = altTexts[key] ?? sec.alt ?? '';
          const activeImageSrc = staged ? staged.previewUrl : sec.url;
          const mode = viewportModes[key] || 'desktop';
          const ratios = SECTION_RATIOS[key];

          return (
            <div
              key={key}
              id={`section-card-${key}`}
              className={`rounded-lg border p-5 sm:p-6 space-y-5 transition-all scroll-mt-20 ${cardBg}`}
            >
              {/* 1. SECTION HEADER: Number, Title, Subtitle & Storefront Aspect Ratio Badges */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-line/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#5146E5] text-white">
                      SECTION {secNumber}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#1C2434] dark:text-[#E2E8F0]">
                      {sec.title}
                    </h2>
                    <span className={`text-xs font-normal ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                      — {sec.subtitle}
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                    {sec.description}
                  </p>
                </div>

                {/* Aspect Ratio & Resolution Specs */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded border ${innerCardBg} text-[#5146E5] dark:text-[#818CF8]`}>
                    Desktop: {ratios.desktop} · Mobile: {ratios.mobile}
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-1 rounded border ${innerCardBg} ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                    {sec.recommendedResolution}
                  </span>
                </div>
              </div>

              {/* 2. ACCURATE STOREFRONT IMAGE PREVIEW (Exact Ratio & Visual Composition) */}
              <div className="space-y-3">
                {/* Preview Control Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                      {staged ? 'Staged Replacement Preview' : 'Storefront Composition Preview'}
                    </span>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border ${
                      staged
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-500/20'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                    }`}>
                      {staged ? 'Staged · Pending Publish' : 'Live Storefront Proportions'}
                    </span>
                  </div>

                  {/* Desktop / Mobile Composition Switch */}
                  <div className="flex items-center gap-1 p-0.5 rounded border bg-neutral-100 dark:bg-neutral-900 border-line/40 text-[10px] self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => toggleViewportMode(key, 'desktop')}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all ${
                        mode === 'desktop'
                          ? 'bg-white dark:bg-[#24211F] text-[#5146E5] font-bold shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                      }`}
                    >
                      <Monitor className="w-3 h-3" />
                      <span>Desktop ({ratios.desktop})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleViewportMode(key, 'mobile')}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-all ${
                        mode === 'mobile'
                          ? 'bg-white dark:bg-[#24211F] text-[#5146E5] font-bold shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                      }`}
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>Mobile ({ratios.mobile})</span>
                    </button>
                  </div>
                </div>

                {/* ==============================================================
                    BESPOKE PREVIEW CONTAINERS PER SECTION (EXACT STOREFRONT MATCH)
                    ============================================================== */}

                {/* SECTION 01: BRAND OVERVIEW PREVIEW
                    Desktop: aspect-[21/9] or 24/9 panoramic | Mobile: aspect-[16/9] landscape
                    Overlay: Gradient + pill badge "ZIMOR · Distinctive Silhouettes & Thoughtful Construction" */}
                {key === 'brandOverview' && (
                  <div className="flex justify-center p-2 rounded-lg bg-black/5 dark:bg-black/30 border border-line/30">
                    <div
                      className={`relative overflow-hidden bg-black border border-line/40 shadow-xs transition-all ${
                        mode === 'mobile'
                          ? 'w-full max-w-[420px] aspect-[16/9] rounded-lg'
                          : 'w-full aspect-[21/9] lg:aspect-[24/9] min-h-[220px] sm:min-h-[300px] rounded-lg'
                      }`}
                    >
                      {activeImageSrc && (
                        <Image
                          src={activeImageSrc}
                          alt={currentAlt || sec.alt || sec.title}
                          fill
                          unoptimized
                          className="object-cover object-center"
                        />
                      )}
                      {/* Storefront gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      {/* Storefront bottom pill badge */}
                      <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 z-10 text-white">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/95 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-semibold border border-white/20">
                          ZIMOR · Distinctive Silhouettes &amp; Thoughtful Construction
                        </span>
                      </div>
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-medium bg-black/70 text-white/90 border border-white/20">
                          {mode === 'mobile' ? '16:9 Mobile' : '21:9 / 24:9 Panoramic'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 03: BRAND STORY PREVIEW
                    Desktop: aspect-[3/4] portrait | Mobile: aspect-[4/5] portrait
                    Layout: Contained portrait container with caption underneath */}
                {key === 'brandStory' && (
                  <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-canvas/30 border border-line/30">
                    <div
                      className={`relative overflow-hidden bg-canvas rounded-lg border border-line/40 shadow-xs transition-all ${
                        mode === 'mobile'
                          ? 'w-full max-w-[340px] aspect-[4/5]'
                          : 'w-full max-w-[360px] aspect-[3/4]'
                      }`}
                    >
                      {activeImageSrc && (
                        <Image
                          src={activeImageSrc}
                          alt={currentAlt || sec.alt || sec.title}
                          fill
                          unoptimized
                          className="object-cover object-center"
                        />
                      )}
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-medium bg-black/70 text-white/90 border border-white/20">
                          {mode === 'mobile' ? '4:5 Mobile Portrait' : '3:4 Atelier Portrait'}
                        </span>
                      </div>
                    </div>
                    {/* Exact Storefront Caption */}
                    <p className={`text-[11px] text-center font-normal mt-2.5 max-w-sm ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                      Crafted with care and precision · Founded by Swati Singh
                    </p>
                  </div>
                )}

                {/* SECTION 04: BRAND VISION PREVIEW
                    Desktop: aspect-[4/3] card | Mobile: aspect-[4/5] portrait
                    Overlay: Deep gradient with Brand Vision typography */}
                {key === 'brandVision' && (
                  <div className="flex justify-center p-2 rounded-lg bg-black/5 dark:bg-black/30 border border-line/30">
                    <div
                      className={`relative overflow-hidden bg-black border border-line/40 shadow-xs flex flex-col justify-end transition-all ${
                        mode === 'mobile'
                          ? 'w-full max-w-[360px] aspect-[4/5] p-5 rounded-lg'
                          : 'w-full max-w-xl aspect-[4/3] min-h-[340px] p-6 sm:p-8 rounded-lg'
                      }`}
                    >
                      {activeImageSrc && (
                        <Image
                          src={activeImageSrc}
                          alt={currentAlt || sec.alt || sec.title}
                          fill
                          unoptimized
                          className="object-cover object-center"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10 pointer-events-none" />
                      <div className="relative z-10 text-white max-w-lg space-y-1.5">
                        <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-white/80 font-bold">
                          BRAND VISION
                        </p>
                        <h3 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-tight">
                          Brand Vision
                        </h3>
                        <p className="text-xs sm:text-[13px] text-white/90 font-normal leading-relaxed line-clamp-3">
                          To become a globally recognised contemporary fashion accessories brand that inspires women through distinctive design, creativity and accessible premium fashion.
                        </p>
                      </div>
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-medium bg-black/70 text-white/90 border border-white/20">
                          {mode === 'mobile' ? '4:5 Mobile' : '4:3 Editorial Card'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 05: BRAND MISSION PREVIEW
                    Desktop: aspect-[4/3] card | Mobile: aspect-[4/5] portrait
                    Overlay: Deep gradient with Brand Mission typography */}
                {key === 'brandMission' && (
                  <div className="flex justify-center p-2 rounded-lg bg-black/5 dark:bg-black/30 border border-line/30">
                    <div
                      className={`relative overflow-hidden bg-black border border-line/40 shadow-xs flex flex-col justify-end transition-all ${
                        mode === 'mobile'
                          ? 'w-full max-w-[360px] aspect-[4/5] p-5 rounded-lg'
                          : 'w-full max-w-xl aspect-[4/3] min-h-[340px] p-6 sm:p-8 rounded-lg'
                      }`}
                    >
                      {activeImageSrc && (
                        <Image
                          src={activeImageSrc}
                          alt={currentAlt || sec.alt || sec.title}
                          fill
                          unoptimized
                          className="object-cover object-center"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10 pointer-events-none" />
                      <div className="relative z-10 text-white max-w-lg space-y-1.5">
                        <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-white/80 font-bold">
                          BRAND MISSION
                        </p>
                        <h3 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-tight">
                          Brand Mission
                        </h3>
                        <p className="text-xs sm:text-[13px] text-white/90 font-normal leading-relaxed line-clamp-3">
                          To create fashion-forward handbags and accessories that combine distinctive aesthetics, functional design and quality, empowering modern women to express their individuality confidently.
                        </p>
                      </div>
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-medium bg-black/70 text-white/90 border border-white/20">
                          {mode === 'mobile' ? '4:5 Mobile' : '4:3 Editorial Card'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 06: BRAND VALUES PREVIEW
                    Desktop: aspect-[4/5] portrait | Mobile: aspect-[4/5] portrait
                    Layout: Quiet luxury craftsmanship photography with philosophy quote */}
                {key === 'brandValues' && (
                  <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-canvas/30 border border-line/30">
                    <div
                      className={`relative overflow-hidden bg-white rounded-lg border border-line/40 shadow-xs transition-all ${
                        mode === 'mobile'
                          ? 'w-full max-w-[340px] aspect-[4/5]'
                          : 'w-full max-w-[360px] aspect-[4/5]'
                      }`}
                    >
                      {activeImageSrc && (
                        <Image
                          src={activeImageSrc}
                          alt={currentAlt || sec.alt || sec.title}
                          fill
                          unoptimized
                          className="object-cover object-center"
                        />
                      )}
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-medium bg-black/70 text-white/90 border border-white/20">
                          4:5 Quiet Luxury Portrait
                        </span>
                      </div>
                    </div>

                    {/* Exact Storefront Philosophy Quote */}
                    <div className="border-l-2 border-black dark:border-white pl-3.5 py-0.5 mt-3 max-w-sm w-full">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-black dark:text-white font-medium mb-0.5">
                        Brand Philosophy
                      </p>
                      <blockquote className={`text-xs italic leading-relaxed ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                        &ldquo;Fashion should not be limited to special occasions. Every day is an opportunity to express yourself.&rdquo;
                      </blockquote>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. UPLOAD AND EDITING CONTROLS (Directly Below Preview) */}
              <div className={`p-4 sm:p-5 rounded-lg border space-y-4 ${innerCardBg}`}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* WebP Upload Dropzone (Col 7) */}
                  <div className="md:col-span-7 space-y-1.5">
                    <label className={`block text-xs font-semibold ${isDark ? 'text-[#E8E1DA]' : 'text-[#24211F]'}`}>
                      Upload Replacement WebP (.webp only)
                    </label>

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDraggingSection(key);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDraggingSection(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDraggingSection(null);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleFileSelection(key, e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => fileInputRefs.current[key]?.click()}
                      className={`border-2 border-dashed rounded-lg p-4 sm:p-5 text-center cursor-pointer transition-all ${
                        isDragging
                          ? 'border-[#5146E5] bg-[#5146E5]/15'
                          : staged
                          ? 'border-[#5146E5]/70 bg-[#5146E5]/5'
                          : isDark
                          ? 'border-[#36312C] hover:border-[#5146E5]/60 bg-[#1A1816]'
                          : 'border-[#E5DFD7] hover:border-[#5146E5]/60 bg-[#FFFFFF]'
                      }`}
                    >
                      <input
                        ref={(el) => {
                          fileInputRefs.current[key] = el;
                        }}
                        type="file"
                        accept="image/webp,.webp"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileSelection(key, e.target.files[0]);
                          }
                        }}
                      />

                      <div className="flex flex-col items-center justify-center space-y-1.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                          staged
                            ? 'bg-[#5146E5] text-white border-[#5146E5]'
                            : isDark
                            ? 'bg-[#24211F] text-[#8A837C] border-[#36312C]'
                            : 'bg-[#EEE8DF] text-[#5A534E] border-[#E5DFD7]'
                        }`}>
                          {staged ? <FileCheck className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                        </div>

                        {staged ? (
                          <div>
                            <span className="font-bold text-xs text-[#5146E5] dark:text-[#818CF8] block truncate max-w-xs mx-auto">
                              {staged.file.name}
                            </span>
                            <span className={`text-[10px] mt-0.5 block ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                              {(staged.file.size / 1024).toFixed(1)} KB · WebP format verified
                              {staged.dimensions && ` · ${staged.dimensions.width}×${staged.dimensions.height}px`}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-semibold text-xs block">
                              Click to choose or drag &amp; drop WebP file
                            </span>
                            <span className={`text-[10px] mt-0.5 block ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                              Target folder: <code className="font-mono text-[#5146E5]">zimor/about/</code>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Alt Description & Metadata (Col 5) */}
                  <div className="md:col-span-5 space-y-3">
                    <div className="space-y-1">
                      <label className={`block text-xs font-semibold ${isDark ? 'text-[#E8E1DA]' : 'text-[#24211F]'}`}>
                        Accessible Alt Description
                      </label>
                      <input
                        type="text"
                        value={currentAlt}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAltTexts((curr) => ({ ...curr, [key]: val }));
                        }}
                        placeholder="e.g. Precision craftsmanship in atelier"
                        className={`w-full px-3 py-2 rounded border text-xs focus:outline-none focus:border-[#5146E5] transition-colors ${
                          isDark
                            ? 'bg-[#24211F] border-[#36312C] text-[#E8E1DA]'
                            : 'bg-[#FFFFFF] border-[#E5DFD7] text-[#24211F]'
                        }`}
                      />
                      <p className={`text-[10px] ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                        Accessible description for screen readers and SEO.
                      </p>
                    </div>

                    {/* Metadata Specs */}
                    <div className="text-[10px] space-y-1 font-mono pt-1">
                      <div className="flex items-center justify-between text-[#8A837C]">
                        <span>Cloudinary Public ID:</span>
                        <span className="truncate max-w-[140px] text-right font-medium text-[#5146E5]">
                          {sec.publicId || 'zimor/about/...'}
                        </span>
                      </div>
                      {sec.updatedAt && (
                        <div className="flex items-center justify-between text-[#8A837C]">
                          <span>Last Synced:</span>
                          <span>{new Date(sec.updatedAt).toLocaleDateString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. ACTIONS ROW: Save/Publish, Discard & Reset */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-line/20">
                  <div className="flex items-center gap-2">
                    {/* Primary Save / Publish Button */}
                    <button
                      type="button"
                      onClick={() => handleUploadAndPublish(key)}
                      disabled={isUploading || !staged}
                      className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs ${
                        staged
                          ? 'bg-[#5146E5] hover:bg-[#4338CA] text-[#F7F5F2] cursor-pointer'
                          : 'bg-neutral-300 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Publishing to Cloudinary &amp; MongoDB...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Save &amp; Publish Section {secNumber}</span>
                        </>
                      )}
                    </button>

                    {/* Discard Staged Preview Button */}
                    {staged && (
                      <button
                        type="button"
                        onClick={() => handleDiscardStaged(key)}
                        className={`px-3 py-2 rounded text-xs font-medium border transition-colors ${
                          isDark
                            ? 'bg-[#1E1C1A] border-[#36312C] text-[#8A837C] hover:text-[#E8E1DA]'
                            : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#5A534E] hover:text-[#24211F]'
                        }`}
                      >
                        Discard File
                      </button>
                    )}
                  </div>

                  {/* Reset to Default Action */}
                  <button
                    type="button"
                    onClick={() => handleResetSection(key)}
                    disabled={isResetting || isUploading}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium border transition-colors ${
                      isDark
                        ? 'bg-[#1E1C1A] border-[#36312C] text-[#8A837C] hover:text-[#E8E1DA] hover:border-[#5146E5]'
                        : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#5A534E] hover:text-[#24211F] hover:border-[#5146E5]'
                    }`}
                  >
                    <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
                    <span>Reset to Default</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
