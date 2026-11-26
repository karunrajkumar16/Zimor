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

  // Theme styling helpers matching clean luxury admin aesthetic
  const cardBg = isDark
    ? 'bg-[#1C1A18]/90 border-[#2E2A27]'
    : 'bg-[#FAF9F6] border-[#E8E4DC] shadow-xs';
  const innerCardBg = isDark
    ? 'bg-[#161412]/80 border-[#282420]'
    : 'bg-[#F2EFE9]/70 border-[#E5E0D7]';

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
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#EAE5DE] dark:border-[#2C2825]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C2434] dark:text-[#F5F5F4]">
              About Page Media Manager
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              WebP Only
            </span>
          </div>
          <p className="text-xs mt-1 text-[#78716C] dark:text-[#A8A29E]">
            All previews match the exact aspect ratio, container dimensions, and visual composition of the live About Us storefront.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/about"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border border-[#E5DFD7] dark:border-[#36312C] bg-white dark:bg-[#1E1C1A] text-[#1C2434] dark:text-[#E8E1DA] hover:border-[#5146E5] hover:text-[#5146E5] transition-colors cursor-pointer"
          >
            <span>View Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={fetchMedia}
            disabled={loading}
            title="Refresh from MongoDB Atlas"
            className="p-2 rounded-lg border border-[#E5DFD7] dark:border-[#36312C] bg-white dark:bg-[#1E1C1A] text-[#78716C] dark:text-[#A8A29E] hover:text-[#5146E5] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-start justify-between gap-3 border transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
              : notification.type === 'warning'
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400'
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
            className="opacity-70 hover:opacity-100 p-0.5 rounded transition-opacity cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Jump Bar */}
      <div className="p-2 sm:p-2.5 rounded-xl bg-[#F6F4EF]/80 dark:bg-[#1C1A18]/80 border border-[#EAE5DE] dark:border-[#2C2825] flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#8C837A] dark:text-[#78716C] pl-2">
          Jump to Section
        </span>
        <div className="flex flex-wrap items-center gap-1">
          {SECTION_KEYS.map((key) => {
            const secNumber = SECTION_NUMBERS[key];
            const sec = mediaMapping[key] || FALLBACK_ABOUT_MEDIA[key];
            const ratio = SECTION_RATIOS[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => scrollToSection(key)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 text-[#5A534E] dark:text-[#B4B4B4] hover:text-[#1C2434] dark:hover:text-[#F5F5F4] hover:bg-white dark:hover:bg-[#282420] shadow-none hover:shadow-xs cursor-pointer"
              >
                <span className="font-mono text-[#5146E5] dark:text-[#818CF8] font-semibold">{secNumber}</span>
                <span>{sec.title.split(' ')[0]}</span>
                <span className="text-[10px] text-[#A8A29E] dark:text-[#78716C]">({ratio.desktop})</span>
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
              className={`rounded-2xl border p-6 sm:p-7 space-y-6 transition-all scroll-mt-20 ${cardBg}`}
            >
              {/* 1. SECTION HEADER: Number, Title, Subtitle & Storefront Aspect Ratio */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#EAE5DE]/60 dark:border-[#2C2825]/60 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold tracking-wider text-[#5146E5] dark:text-[#818CF8]">
                      SECTION {secNumber}
                    </span>
                    <span className="text-[#D6D3D1] dark:text-[#44403C]">·</span>
                    <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[#1C2434] dark:text-[#F5F5F4]">
                      {sec.title}
                    </h2>
                    <span className="text-xs text-[#8C837A] dark:text-[#78716C]">
                      — {sec.subtitle}
                    </span>
                  </div>
                  <p className="text-xs text-[#78716C] dark:text-[#A8A29E] max-w-2xl">
                    {sec.description}
                  </p>
                </div>

                {/* Aspect Ratio & Resolution Specs (Clean text hierarchy instead of heavy boxed borders) */}
                <div className="flex items-center gap-2.5 text-xs text-[#78716C] dark:text-[#A8A29E] shrink-0 pt-0.5">
                  <span className="font-medium text-[#5146E5] dark:text-[#818CF8]">
                    {ratios.desktop} Desktop
                  </span>
                  <span className="text-[#D6D3D1] dark:text-[#44403C]">·</span>
                  <span className="font-medium">
                    {ratios.mobile} Mobile
                  </span>
                  <span className="text-[#D6D3D1] dark:text-[#44403C]">·</span>
                  <span className="font-mono text-[11px] text-[#8C837A] dark:text-[#78716C]">
                    {sec.recommendedResolution}
                  </span>
                </div>
              </div>

              {/* 2. ACCURATE STOREFRONT IMAGE PREVIEW (Exact Ratio & Visual Composition) */}
              <div className="space-y-3">
                {/* Preview Control Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-[#8C837A] dark:text-[#78716C]">
                      {staged ? 'Staged Replacement Preview' : 'Storefront Composition Preview'}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      staged
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    }`}>
                      {staged ? 'Staged · Pending Publish' : 'Live Storefront'}
                    </span>
                  </div>

                  {/* Desktop / Mobile Composition Switch */}
                  <div className="inline-flex items-center p-0.5 rounded-lg bg-[#EFECE6]/70 dark:bg-[#141210]/70 text-xs self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => toggleViewportMode(key, 'desktop')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        mode === 'desktop'
                          ? 'bg-white dark:bg-[#282420] text-[#1C2434] dark:text-[#F5F5F4] shadow-xs'
                          : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C2434] dark:hover:text-[#F5F5F4]'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Desktop ({ratios.desktop})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleViewportMode(key, 'mobile')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        mode === 'mobile'
                          ? 'bg-white dark:bg-[#282420] text-[#1C2434] dark:text-[#F5F5F4] shadow-xs'
                          : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C2434] dark:hover:text-[#F5F5F4]'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Mobile ({ratios.mobile})</span>
                    </button>
                  </div>
                </div>
                {/* ==============================================================
                    BESPOKE PREVIEW CONTAINERS PER SECTION (EXACT STOREFRONT MATCH)
                    ============================================================== */}

                {/* SECTION 01: BRAND OVERVIEW PREVIEW */}
                {key === 'brandOverview' && (
                  <div className="flex justify-center">
                    <div
                      className={`relative overflow-hidden bg-[#141210] rounded-xl ring-1 ring-black/5 dark:ring-white/10 shadow-xs transition-all ${
                        mode === 'mobile'
                          ? 'w-full max-w-[420px] aspect-[16/9]'
                          : 'w-full aspect-[21/9] lg:aspect-[24/9] min-h-[220px] sm:min-h-[300px]'
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
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white/95 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-semibold border border-white/15">
                          ZIMOR · Distinctive Silhouettes &amp; Thoughtful Construction
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 z-10">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-black/60 backdrop-blur-md text-white/90 border border-white/15">
                          {mode === 'mobile' ? '16:9 Mobile' : '21:9 / 24:9 Panoramic'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 03: BRAND STORY PREVIEW */}
                {key === 'brandStory' && (
                  <div className="flex flex-col items-center justify-center py-2">
                    <div
                      className={`relative overflow-hidden bg-[#141210] rounded-xl ring-1 ring-black/5 dark:ring-white/10 shadow-xs transition-all ${
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
                      <div className="absolute top-3 right-3 z-10">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-black/60 backdrop-blur-md text-white/90 border border-white/15">
                          {mode === 'mobile' ? '4:5 Mobile Portrait' : '3:4 Atelier Portrait'}
                        </span>
                      </div>
                    </div>
                    {/* Exact Storefront Caption */}
                    <p className="text-xs text-center font-normal mt-3 max-w-sm text-[#78716C] dark:text-[#A8A29E]">
                      Crafted with care and precision · Founded by Swati Singh
                    </p>
                  </div>
                )}

                {/* SECTION 04: BRAND VISION PREVIEW */}
                {key === 'brandVision' && (
                  <div className="flex justify-center">
                    <div
                      className={`relative overflow-hidden bg-[#141210] rounded-xl ring-1 ring-black/5 dark:ring-white/10 shadow-xs flex flex-col justify-end transition-all ${
                        mode === 'mobile'
                          ? 'w-full max-w-[360px] aspect-[4/5] p-5'
                          : 'w-full max-w-xl aspect-[4/3] min-h-[340px] p-6 sm:p-8'
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
                      <div className="absolute top-3 right-3 z-10">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-black/60 backdrop-blur-md text-white/90 border border-white/15">
                          {mode === 'mobile' ? '4:5 Mobile' : '4:3 Editorial Card'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 05: BRAND MISSION PREVIEW */}
                {key === 'brandMission' && (
                  <div className="flex justify-center">
                    <div
                      className={`relative overflow-hidden bg-[#141210] rounded-xl ring-1 ring-black/5 dark:ring-white/10 shadow-xs flex flex-col justify-end transition-all ${
                        mode === 'mobile'
                          ? 'w-full max-w-[360px] aspect-[4/5] p-5'
                          : 'w-full max-w-xl aspect-[4/3] min-h-[340px] p-6 sm:p-8'
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
                      <div className="absolute top-3 right-3 z-10">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-black/60 backdrop-blur-md text-white/90 border border-white/15">
                          {mode === 'mobile' ? '4:5 Mobile' : '4:3 Editorial Card'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 06: BRAND VALUES PREVIEW */}
                {key === 'brandValues' && (
                  <div className="flex flex-col items-center justify-center py-2">
                    <div
                      className={`relative overflow-hidden bg-[#141210] rounded-xl ring-1 ring-black/5 dark:ring-white/10 shadow-xs transition-all ${
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
                      <div className="absolute top-3 right-3 z-10">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-black/60 backdrop-blur-md text-white/90 border border-white/15">
                          4:5 Quiet Luxury Portrait
                        </span>
                      </div>
                    </div>

                    {/* Exact Storefront Philosophy Quote */}
                    <div className="border-l-2 border-[#1C2434] dark:border-white pl-4 py-1 mt-4 max-w-sm w-full">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#1C2434] dark:text-white font-medium mb-0.5">
                        Brand Philosophy
                      </p>
                      <blockquote className="text-xs italic leading-relaxed text-[#78716C] dark:text-[#A8A29E]">
                        &ldquo;Fashion should not be limited to special occasions. Every day is an opportunity to express yourself.&rdquo;
                      </blockquote>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. UPLOAD AND EDITING CONTROLS */}
              <div className={`p-5 sm:p-6 rounded-xl border space-y-5 ${innerCardBg}`}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* WebP Upload Dropzone (Col 7) */}
                  <div className="md:col-span-7 space-y-2">
                    <label className="block text-xs font-semibold text-[#1C2434] dark:text-[#E8E1DA]">
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
                      className={`border border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                        isDragging
                          ? 'border-[#5146E5] bg-[#5146E5]/10'
                          : staged
                          ? 'border-[#5146E5]/50 bg-[#5146E5]/[0.04]'
                          : isDark
                          ? 'border-[#38332E] hover:border-[#5146E5]/60 bg-[#1A1816]/60 hover:bg-[#1A1816]'
                          : 'border-[#D8D2C8] hover:border-[#5146E5]/60 bg-white/70 hover:bg-white'
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

                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                          staged
                            ? 'bg-[#5146E5] text-white'
                            : 'bg-[#EEF0FF] dark:bg-[#5146E5]/20 text-[#5146E5] dark:text-[#818CF8]'
                        }`}>
                          {staged ? <FileCheck className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                        </div>

                        {staged ? (
                          <div>
                            <span className="font-semibold text-xs text-[#5146E5] dark:text-[#818CF8] block truncate max-w-xs mx-auto">
                              {staged.file.name}
                            </span>
                            <span className="text-[10px] mt-0.5 block text-[#8C837A] dark:text-[#78716C]">
                              {(staged.file.size / 1024).toFixed(1)} KB · WebP format verified
                              {staged.dimensions && ` · ${staged.dimensions.width}×${staged.dimensions.height}px`}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-medium text-xs block text-[#1C2434] dark:text-[#E8E1DA]">
                              Click to choose or drag &amp; drop WebP file
                            </span>
                            <span className="text-[10px] mt-0.5 block text-[#8C837A] dark:text-[#78716C]">
                              Target folder: <code className="font-mono text-[#5146E5] dark:text-[#818CF8]">zimor/about/</code>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Alt Description & Metadata (Col 5) */}
                  <div className="md:col-span-5 space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#1C2434] dark:text-[#E8E1DA]">
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
                        className="w-full px-3.5 py-2.5 rounded-lg border text-xs focus:outline-none focus:border-[#5146E5] focus:ring-1 focus:ring-[#5146E5]/20 transition-all bg-white dark:bg-[#1A1816] border-[#E2DDD5] dark:border-[#322E2A] text-[#1C2434] dark:text-[#F5F5F4] placeholder-[#A8A29E]"
                      />
                      <p className="text-[10px] text-[#8C837A] dark:text-[#78716C]">
                        Accessible description for screen readers and SEO.
                      </p>
                    </div>

                    {/* Metadata Specs */}
                    <div className="text-xs space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[#78716C] dark:text-[#A8A29E]">
                        <span>Cloudinary Public ID:</span>
                        <span className="truncate max-w-[140px] text-right font-mono text-[11px] font-medium text-[#5146E5] dark:text-[#818CF8]">
                          {sec.publicId || 'zimor/about/...'}
                        </span>
                      </div>
                      {sec.updatedAt && (
                        <div className="flex items-center justify-between text-[#78716C] dark:text-[#A8A29E]">
                          <span>Last Synced:</span>
                          <span className="font-mono text-[11px]">{new Date(sec.updatedAt).toLocaleDateString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. ACTIONS ROW: Save/Publish, Discard & Reset */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 border-t border-[#EAE5DE]/80 dark:border-[#2C2825]/80">
                  <div className="flex items-center gap-2">
                    {/* Primary Save / Publish Button */}
                    <button
                      type="button"
                      onClick={() => handleUploadAndPublish(key)}
                      disabled={isUploading || !staged}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs ${
                        staged
                          ? 'bg-[#5146E5] hover:bg-[#4338CA] text-white cursor-pointer'
                          : 'bg-[#E5DFD7]/70 dark:bg-[#25221F] text-[#A8A29E] dark:text-[#6E6760] cursor-not-allowed'
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
                        className="px-3.5 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/30 transition-colors cursor-pointer"
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C2434] dark:hover:text-[#F5F5F4] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
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
