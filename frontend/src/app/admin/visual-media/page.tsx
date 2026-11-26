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
  Monitor,
  Smartphone,
  Layers,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { uploadDirectToCloudinary } from '@/lib/cloudinaryDirectUpload';
import { useAdminTheme } from '@/context/AdminThemeContext';
import { VisualMediaItem } from '@/types';

// ============================================================================
// VERIFIED FACTORY DEFAULTS (MATCHING BACKEND MONGODB SITE CONTENT)
// ============================================================================

const INITIAL_VISUAL_MEDIA: Record<string, VisualMediaItem> = {
  // 1. Homepage → Shop by Lifestyle
  lifestyle_everyday: {
    id: 'lifestyle_everyday',
    scope: 'homepage',
    sectionGroup: 'Shop by Lifestyle',
    title: 'Everyday Lifestyle',
    label: 'The Classic Shoulder Bag — Editorial Visual',
    description: 'Parallax editorial canvas displayed on the Everyday lifestyle card on the live Homepage.',
    recommendedAspect: '3:4 Portrait (4:5 Mobile)',
    recommendedResolution: '1200 x 1600 px (min 800 x 1060)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917846/zimor/lifestyle/brandgirl3.webp',
    publicId: 'zimor/lifestyle/brandgirl3',
    alt: 'EVERYDAY — For the everyday. The Classic Shoulder Bag',
    cloudinaryFolder: 'zimor/homepage/lifestyle',
    mediaType: 'image',
  },
  lifestyle_work: {
    id: 'lifestyle_work',
    scope: 'homepage',
    sectionGroup: 'Shop by Lifestyle',
    title: 'Work Lifestyle',
    label: 'The Rabota & Delo Totes — Editorial Visual',
    description: 'Parallax editorial canvas displayed on the Work lifestyle card on the live Homepage.',
    recommendedAspect: '3:4 Portrait (4:5 Mobile)',
    recommendedResolution: '1200 x 1600 px (min 800 x 1060)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917850/zimor/about/image.webp',
    publicId: 'zimor/about/image',
    alt: 'WORK — For what lies ahead. The Rabota & Delo Totes',
    cloudinaryFolder: 'zimor/homepage/lifestyle',
    mediaType: 'image',
  },
  lifestyle_travel: {
    id: 'lifestyle_travel',
    scope: 'homepage',
    sectionGroup: 'Shop by Lifestyle',
    title: 'Travel Lifestyle',
    label: 'The Travel Silhouettes — Editorial Visual',
    description: 'Parallax editorial canvas displayed on the Travel lifestyle card on the live Homepage.',
    recommendedAspect: '3:4 Portrait (4:5 Mobile)',
    recommendedResolution: '1200 x 1600 px (min 800 x 1060)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917845/zimor/lifestyle/brandgirl2.webp',
    publicId: 'zimor/lifestyle/brandgirl2',
    alt: 'TRAVEL — For places beyond. The Rabota & Delo Totes',
    cloudinaryFolder: 'zimor/homepage/lifestyle',
    mediaType: 'image',
  },

  // 2. Homepage → Crafted in India
  craft_poster: {
    id: 'craft_poster',
    scope: 'homepage',
    sectionGroup: 'Crafted in India',
    title: 'Manufacturing Video Poster',
    label: 'Craftsmanship Video Cover / Fallback Poster',
    description: 'High-resolution poster image loaded before the 50/50 split manufacturing video plays.',
    recommendedAspect: '4:5 Portrait (1:1 / 16:9 Mobile)',
    recommendedResolution: '1200 x 1500 px (min 800 x 1000)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917849/zimor/about/craftsmanship-atelier.webp',
    publicId: 'zimor/about/craftsmanship-atelier',
    alt: 'Artisanal leather craftsmanship and luxury handbag creation in India',
    cloudinaryFolder: 'zimor/homepage',
    mediaType: 'image',
  },
  craft_supporting: {
    id: 'craft_supporting',
    scope: 'homepage',
    sectionGroup: 'Crafted in India',
    title: 'Supporting Heritage Image',
    label: 'Crafted in India Editorial Inset Photograph',
    description: 'Landscape photograph displayed inside the editorial narrative panel next to the video.',
    recommendedAspect: '3:2 Landscape',
    recommendedResolution: '1200 x 800 px (min 920 x 613)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917847/zimor/about/artisan-heritage-landscape.webp',
    publicId: 'zimor/about/artisan-heritage-landscape',
    alt: 'Crafted in India artisan heritage and leatherwork atelier',
    cloudinaryFolder: 'zimor/homepage',
    mediaType: 'image',
  },

  // 3. Homepage → In the Spotlight (About Zimor Masonry)
  spotlight_craftsmanship: {
    id: 'spotlight_craftsmanship',
    scope: 'homepage',
    sectionGroup: 'In the Spotlight',
    title: 'Rooted in Craftsmanship',
    label: 'Atelier & Hand-Stitching Frame (Tile 02)',
    description: 'Editorial masonry tile highlighting artisanal hand-stitching with needle and thread.',
    recommendedAspect: '4:5 or 1:1 Square',
    recommendedResolution: '1000 x 1000 px (min 800 x 800)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917849/zimor/about/craftsmanship-atelier.webp',
    publicId: 'zimor/about/craftsmanship-atelier',
    alt: 'Artisan hand-stitching luxury leather with needle and waxed thread',
    cloudinaryFolder: 'zimor/homepage',
    mediaType: 'image',
  },
  spotlight_everyday: {
    id: 'spotlight_everyday',
    scope: 'homepage',
    sectionGroup: 'In the Spotlight',
    title: 'Designed for Everyday',
    label: 'Handbag Macro & Texture Frame (Tile 03)',
    description: 'Editorial masonry tile showcasing the Rabota tote texture, zipper, and fine grain.',
    recommendedAspect: '3:4 Portrait (4:5 Mobile)',
    recommendedResolution: '800 x 1000 px (min 600 x 800)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917833/zimor/products/rabota-4.webp',
    publicId: 'zimor/products/rabota-4',
    alt: 'Macro texture of Zimor Rabota luxury bag showing zipper and grain',
    cloudinaryFolder: 'zimor/homepage',
    mediaType: 'image',
  },
  spotlight_details: {
    id: 'spotlight_details',
    scope: 'homepage',
    sectionGroup: 'In the Spotlight',
    title: 'Details That Matter',
    label: 'Hardware & Silhouette Frame (Tile 04)',
    description: 'Editorial masonry tile displaying refined brass hardware and cruelty-free leather.',
    recommendedAspect: '16:9 or 3:2 Landscape',
    recommendedResolution: '1200 x 800 px (min 900 x 600)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917845/zimor/lifestyle/luxury-bag-tan.webp',
    publicId: 'zimor/lifestyle/luxury-bag-tan',
    alt: 'Luxury cruelty-free leather handbag detailing with refined brass hardware',
    cloudinaryFolder: 'zimor/homepage',
    mediaType: 'image',
  },
  spotlight_proudly_made: {
    id: 'spotlight_proudly_made',
    scope: 'homepage',
    sectionGroup: 'In the Spotlight',
    title: 'Proudly Made in India',
    label: 'Indian Atelier & Provenance Frame (Tile 05)',
    description: 'Wide cinematic masonry tile displaying master artisans and leather rolls in India.',
    recommendedAspect: '16:9 or 21:9 Panoramic',
    recommendedResolution: '1400 x 800 px (min 1000 x 600)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917847/zimor/about/artisan-heritage-landscape.webp',
    publicId: 'zimor/about/artisan-heritage-landscape',
    alt: 'Master artisan in Indian leathercraft atelier surrounded by leather rolls and hand tools',
    cloudinaryFolder: 'zimor/homepage',
    mediaType: 'image',
  },

  // 4. About Us Page → Sections 01 - 06
  brandOverview: {
    id: 'brandOverview',
    scope: 'about',
    sectionGroup: 'Brand Overview',
    title: 'Brand Overview Canvas',
    label: 'Panoramic Editorial Banner',
    description: 'Main wide-canvas visual displayed under Section 01 – Brand Overview on the About page.',
    recommendedAspect: '21:9 or 24:9 Panoramic (16:9 Mobile)',
    recommendedResolution: '2400 x 900 px (min 1920 x 720)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917844/zimor/lifestyle/corporate-workspace-horizontal.webp',
    publicId: 'zimor/lifestyle/corporate-workspace-horizontal',
    alt: 'ZIMOR Premium fashion and accessories collection overview',
    cloudinaryFolder: 'zimor/about',
    mediaType: 'image',
  },
  brandStory: {
    id: 'brandStory',
    scope: 'about',
    sectionGroup: 'Brand Story',
    title: 'Brand Story Portrait',
    label: 'Atelier & Craftsmanship Portrait',
    description: 'Vertical editorial portrait displayed next to the Section 03 – Brand Story narrative.',
    recommendedAspect: '3:4 Portrait (4:5 Mobile)',
    recommendedResolution: '1200 x 1500 px (min 800 x 1000)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917849/zimor/about/craftsmanship-atelier.webp',
    publicId: 'zimor/about/craftsmanship-atelier',
    alt: 'Precision, care and attention to detail in craftsmanship',
    cloudinaryFolder: 'zimor/about',
    mediaType: 'image',
  },
  brandVision: {
    id: 'brandVision',
    scope: 'about',
    sectionGroup: 'Brand Vision',
    title: 'Brand Vision Spread',
    label: 'Inspiring Women Editorial Card',
    description: 'Atmospheric background image for Section 04 – Brand Vision card.',
    recommendedAspect: '4:3 Card (4:5 Mobile / 1:1 Tablet)',
    recommendedResolution: '1200 x 1200 px (min 800 x 800)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917848/zimor/about/brand-vision-duo-colleagues.webp',
    publicId: 'zimor/about/brand-vision-duo-colleagues',
    alt: 'ZIMOR Brand Vision – Inspiring women through distinctive design and accessible premium fashion',
    cloudinaryFolder: 'zimor/about',
    mediaType: 'image',
  },
  brandMission: {
    id: 'brandMission',
    scope: 'about',
    sectionGroup: 'Brand Mission',
    title: 'Brand Mission Spread',
    label: 'Leathercraft Atelier Editorial Card',
    description: 'Atmospheric background image for Section 05 – Brand Mission card.',
    recommendedAspect: '4:3 Card (4:5 Mobile / 1:1 Tablet)',
    recommendedResolution: '1200 x 1200 px (min 800 x 800)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917847/zimor/about/brand-mission-leather.webp',
    publicId: 'zimor/about/brand-mission-leather',
    alt: 'ZIMOR Brand Mission – Fashion-forward handbags and meticulous craftsmanship',
    cloudinaryFolder: 'zimor/about',
    mediaType: 'image',
  },
  brandValues: {
    id: 'brandValues',
    scope: 'about',
    sectionGroup: 'Brand Values',
    title: 'Brand Values Visual',
    label: 'Quiet Luxury Atelier Photography',
    description: 'Editorial craftsmanship photography displayed alongside the 7 Brand Values in Section 06.',
    recommendedAspect: '4:5 Portrait',
    recommendedResolution: '1200 x 1500 px (min 800 x 1000)',
    url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917850/zimor/about/brand-values-craft.webp',
    publicId: 'zimor/about/brand-values-craft',
    alt: 'Artisanal leathercraft and precision stitching at the Zimor atelier',
    cloudinaryFolder: 'zimor/about',
    mediaType: 'image',
  },
};

const ALL_KEYS = Object.keys(INITIAL_VISUAL_MEDIA);

const SECTION_NUMBERS: Record<string, string> = {
  // Homepage
  lifestyle_everyday: '01',
  lifestyle_work: '02',
  lifestyle_travel: '03',
  craft_poster: '04',
  craft_supporting: '05',
  spotlight_craftsmanship: '06',
  spotlight_everyday: '07',
  spotlight_details: '08',
  spotlight_proudly_made: '09',
  // About Us
  brandOverview: '10',
  brandStory: '11',
  brandVision: '12',
  brandMission: '13',
  brandValues: '14',
};

const SECTION_RATIOS: Record<string, { desktop: string; mobile: string }> = {
  lifestyle_everyday: { desktop: '3:4', mobile: '4:5' },
  lifestyle_work: { desktop: '3:4', mobile: '4:5' },
  lifestyle_travel: { desktop: '3:4', mobile: '4:5' },
  craft_poster: { desktop: '4:5', mobile: '16:9' },
  craft_supporting: { desktop: '3:2', mobile: '3:2' },
  spotlight_craftsmanship: { desktop: '1:1', mobile: '4:5' },
  spotlight_everyday: { desktop: '3:4', mobile: '4:5' },
  spotlight_details: { desktop: '16:9', mobile: '3:2' },
  spotlight_proudly_made: { desktop: '16:9', mobile: '21:9' },
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

export default function VisualMediaManagerPage() {
  const { isDark } = useAdminTheme();

  const [mediaMapping, setMediaMapping] = useState<Record<string, VisualMediaItem>>(INITIAL_VISUAL_MEDIA);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadingSection, setUploadingSection] = useState<string | null>(null);
  const [resettingSection, setResettingSection] = useState<string | null>(null);

  // Staged files per section
  const [stagedUploads, setStagedUploads] = useState<Record<string, StagedUpload>>({});
  // Alt text per section
  const [altTexts, setAltTexts] = useState<Record<string, string>>({});
  // Viewport mode per section ('desktop' | 'mobile')
  const [viewportModes, setViewportModes] = useState<Record<string, 'desktop' | 'mobile'>>({
    lifestyle_everyday: 'desktop',
    lifestyle_work: 'desktop',
    lifestyle_travel: 'desktop',
    craft_poster: 'desktop',
    craft_supporting: 'desktop',
    spotlight_craftsmanship: 'desktop',
    spotlight_everyday: 'desktop',
    spotlight_details: 'desktop',
    spotlight_proudly_made: 'desktop',
    brandOverview: 'desktop',
    brandStory: 'desktop',
    brandVision: 'desktop',
    brandMission: 'desktop',
    brandValues: 'desktop',
  });

  // Scope filter: 'all' | 'homepage' | 'about'
  const [scopeFilter, setScopeFilter] = useState<'all' | 'homepage' | 'about'>('all');
  const [draggingSection, setDraggingSection] = useState<string | null>(null);

  // Notification banner matching About Page Media Manager
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning';
    text: string;
  } | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Theme styling helpers matching clean luxury admin aesthetic
  const cardBg = isDark
    ? 'bg-[#1C1A18]/90 border-[#2E2A27]'
    : 'bg-[#FAF9F6] border-[#E8E4DC] shadow-xs';
  const innerCardBg = isDark
    ? 'bg-[#161412]/80 border-[#282420]'
    : 'bg-[#F2EFE9]/70 border-[#E5E0D7]';

  // Fetch visual media from MongoDB
  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/visual-media');
      const data = await res.json();
      if (data.media) {
        setMediaMapping((prev) => ({ ...prev, ...data.media }));
        const initialAlt: Record<string, string> = {};
        for (const key of ALL_KEYS) {
          initialAlt[key] = data.media[key]?.alt || INITIAL_VISUAL_MEDIA[key]?.alt || '';
        }
        setAltTexts(initialAlt);
      }
    } catch {
      setNotification({
        type: 'warning',
        text: 'Synchronizing visual media mappings from MongoDB Atlas...',
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

  // File selection with validation & dimensions
  const handleFileSelection = (key: string, file: File) => {
    setNotification(null);

    const secDef = mediaMapping[key] || INITIAL_VISUAL_MEDIA[key];
    const isVideoExpected = secDef?.mediaType === 'video';

    const isAllowedImage =
      file.type.startsWith('image/') ||
      file.name.toLowerCase().endsWith('.webp') ||
      file.name.toLowerCase().endsWith('.jpg') ||
      file.name.toLowerCase().endsWith('.png') ||
      file.name.toLowerCase().endsWith('.jpeg');

    const isAllowedVideo =
      file.type.startsWith('video/') ||
      file.name.toLowerCase().endsWith('.mp4') ||
      file.name.toLowerCase().endsWith('.webm');

    const isAllowed = isVideoExpected ? isAllowedVideo : isAllowedImage;

    if (!isAllowed) {
      const ext = file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN';
      setNotification({
        type: 'error',
        text: `Invalid file format for Section ${SECTION_NUMBERS[key]}: "${file.name}" (${ext}). Please select ${isVideoExpected ? 'an MP4 or WebM video' : 'a WebP, JPEG, or PNG image'}.`,
      });
      if (fileInputRefs.current[key]) {
        fileInputRefs.current[key]!.value = '';
      }
      return;
    }

    const prev = stagedUploads[key];
    if (prev && prev.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(prev.previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    if (!isVideoExpected) {
      const img = new window.Image();
      img.onload = () => {
        setStagedUploads((curr) => ({
          ...curr,
          [key]: {
            file,
            previewUrl,
            dimensions: { width: img.naturalWidth, height: img.naturalHeight },
          },
        }));
      };
      img.src = previewUrl;
    }

    setStagedUploads((curr) => ({
      ...curr,
      [key]: { file, previewUrl },
    }));
  };

  const handleDiscardStaged = (key: string) => {
    const staged = stagedUploads[key];
    if (staged && staged.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(staged.previewUrl);
    }
    setStagedUploads((curr) => {
      const updated = { ...curr };
      delete updated[key];
      return updated;
    });
    if (fileInputRefs.current[key]) {
      fileInputRefs.current[key]!.value = '';
    }
  };

  // Direct upload to Cloudinary and update MongoDB
  const handleUploadAndPublish = async (key: string) => {
    const staged = stagedUploads[key];
    if (!staged) return;

    setUploadingSection(key);
    setNotification(null);

    try {
      const secDef = mediaMapping[key] || INITIAL_VISUAL_MEDIA[key];
      const folder = secDef.cloudinaryFolder || (secDef.scope === 'about' ? 'zimor/about' : 'zimor/homepage');
      const resourceType = secDef.mediaType === 'video' ? 'video' : 'image';
      const altToSubmit = altTexts[key] || mediaMapping[key]?.alt || INITIAL_VISUAL_MEDIA[key]?.alt || '';

      // Direct browser-to-Cloudinary upload bypassing Vercel body limits
      const uploaded = await uploadDirectToCloudinary(staged.file, {
        folder,
        resourceType,
        alt: altToSubmit,
      });

      // Synchronize metadata with MongoDB
      const res = await apiFetch(`/api/visual-media/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: uploaded.secureUrl,
          publicId: uploaded.publicId,
          alt: altToSubmit,
          width: uploaded.width,
          height: uploaded.height,
          format: uploaded.format,
          size: uploaded.size,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update media record');
      }

      const updatedItem = data.item;
      setMediaMapping((curr) => ({
        ...curr,
        [key]: updatedItem,
      }));

      handleDiscardStaged(key);

      setNotification({
        type: 'success',
        text: `Section ${SECTION_NUMBERS[key]} ("${updatedItem.title}") published to Cloudinary and synchronized with live storefront.`,
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err.message || 'Failed to upload and publish media.',
      });
    } finally {
      setUploadingSection(null);
    }
  };

  // Reset to factory default asset
  const handleResetSection = async (key: string) => {
    const secNumber = SECTION_NUMBERS[key];
    const sec = mediaMapping[key] || INITIAL_VISUAL_MEDIA[key];
    if (
      !confirm(
        `Are you sure you want to reset Section ${secNumber} (${sec.title}) to its factory default image?`
      )
    ) {
      return;
    }

    setResettingSection(key);
    setNotification(null);

    try {
      const res = await apiFetch('/api/visual-media/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset section');
      }

      const resetItem = data.item;
      setMediaMapping((curr) => ({
        ...curr,
        [key]: resetItem,
      }));
      setAltTexts((curr) => ({
        ...curr,
        [key]: resetItem.alt || '',
      }));

      handleDiscardStaged(key);

      setNotification({
        type: 'success',
        text: `Section ${secNumber} (${sec.title}) reset to factory default successfully.`,
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err.message || 'Failed to reset section to default.',
      });
    } finally {
      setResettingSection(null);
    }
  };

  const scrollToSection = (key: string) => {
    const el = document.getElementById(`section-card-${key}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleViewportMode = (key: string, mode: 'desktop' | 'mobile') => {
    setViewportModes((curr) => ({ ...curr, [key]: mode }));
  };

  // Filter keys based on scope
  const activeKeys = ALL_KEYS.filter((key) => {
    const item = mediaMapping[key] || INITIAL_VISUAL_MEDIA[key];
    if (scopeFilter === 'homepage') return item.scope === 'homepage';
    if (scopeFilter === 'about') return item.scope === 'about';
    return true;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#EAE5DE] dark:border-[#2C2825]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C2434] dark:text-[#F5F5F4]">
              Visual Media Manager
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              WebP &amp; Cloudinary
            </span>
          </div>
          <p className="text-xs mt-1 text-[#78716C] dark:text-[#A8A29E]">
            Direct visual asset replacement for all editorial photography and video elements across the live Homepage and About Us storefront.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border border-[#E5DFD7] dark:border-[#36312C] bg-white dark:bg-[#1E1C1A] text-[#1C2434] dark:text-[#E8E1DA] hover:border-[#5146E5] hover:text-[#5146E5] transition-colors cursor-pointer"
          >
            <span>Live Homepage</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/about"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border border-[#E5DFD7] dark:border-[#36312C] bg-white dark:bg-[#1E1C1A] text-[#1C2434] dark:text-[#E8E1DA] hover:border-[#5146E5] hover:text-[#5146E5] transition-colors cursor-pointer"
          >
            <span>Live About Us</span>
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

      {/* Quick Jump Bar & Scope Switcher */}
      <div className="p-2.5 sm:p-3 rounded-xl bg-[#F6F4EF]/80 dark:bg-[#1C1A18]/80 border border-[#EAE5DE] dark:border-[#2C2825] space-y-2.5 text-xs">
        {/* Scope Selector: All / Homepage / About Us */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE5DE]/60 dark:border-[#2C2825]/60 pb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#8C837A] dark:text-[#78716C] pl-1">
              Storefront Scope:
            </span>
            <div className="inline-flex p-0.5 rounded-lg bg-[#EFECE6]/70 dark:bg-[#141210]/70 text-xs">
              <button
                type="button"
                onClick={() => setScopeFilter('all')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  scopeFilter === 'all'
                    ? 'bg-white dark:bg-[#282420] text-[#1C2434] dark:text-[#F5F5F4] shadow-xs'
                    : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C2434] dark:hover:text-[#F5F5F4]'
                }`}
              >
                All Sections (14)
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter('homepage')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  scopeFilter === 'homepage'
                    ? 'bg-white dark:bg-[#282420] text-[#1C2434] dark:text-[#F5F5F4] shadow-xs'
                    : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C2434] dark:hover:text-[#F5F5F4]'
                }`}
              >
                Homepage (09)
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter('about')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  scopeFilter === 'about'
                    ? 'bg-white dark:bg-[#282420] text-[#1C2434] dark:text-[#F5F5F4] shadow-xs'
                    : 'text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C2434] dark:hover:text-[#F5F5F4]'
                }`}
              >
                About Us (05)
              </button>
            </div>
          </div>

          <span className="text-[11px] text-[#8C837A] dark:text-[#78716C] pr-1 hidden sm:inline">
            Click any section below to jump directly to its editor
          </span>
        </div>

        {/* Quick Jump Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {activeKeys.map((key) => {
            const secNumber = SECTION_NUMBERS[key];
            const sec = mediaMapping[key] || INITIAL_VISUAL_MEDIA[key];
            const ratio = SECTION_RATIOS[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => scrollToSection(key)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 text-[#5A534E] dark:text-[#B4B4B4] hover:text-[#1C2434] dark:hover:text-[#F5F5F4] hover:bg-white dark:hover:bg-[#282420] shadow-none hover:shadow-xs cursor-pointer"
              >
                <span className="font-mono text-[#5146E5] dark:text-[#818CF8] font-semibold">{secNumber}</span>
                <span className="truncate max-w-[120px]">{sec.title.split(' ')[0]}</span>
                <span className="text-[10px] text-[#A8A29E] dark:text-[#78716C]">({ratio.desktop})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SINGLE VERTICAL SEQUENCE: Bespoke Preview Containers with Storefront Accuracy */}
      <div className="space-y-8">
        {activeKeys.map((key) => {
          const sec = mediaMapping[key] || INITIAL_VISUAL_MEDIA[key];
          const secNumber = SECTION_NUMBERS[key];
          const staged = stagedUploads[key];
          const isUploading = uploadingSection === key;
          const isResetting = resettingSection === key;
          const isDragging = draggingSection === key;
          const currentAlt = altTexts[key] ?? sec.alt ?? '';
          const activeImageSrc = staged ? staged.previewUrl : sec.url;
          const mode = viewportModes[key] || 'desktop';
          const ratios = SECTION_RATIOS[key] || { desktop: '4:5', mobile: '4:5' };

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
                    <span className="text-xs font-medium text-[#78716C] dark:text-[#A8A29E]">
                      {sec.scope === 'homepage' ? 'Homepage' : 'About Us'} → {sec.sectionGroup}
                    </span>
                    <span className="text-[#D6D3D1] dark:text-[#44403C]">·</span>
                    <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[#1C2434] dark:text-[#F5F5F4]">
                      {sec.title}
                    </h2>
                  </div>
                  <p className="text-xs text-[#78716C] dark:text-[#A8A29E] max-w-2xl">
                    {sec.label} — {sec.description}
                  </p>
                </div>

                {/* Aspect Ratio & Resolution Specs */}
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

              {/* 2. ACCURATE STOREFRONT IMAGE PREVIEW */}
              <div className="space-y-3">
                {/* Preview Control Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-[#8C837A] dark:text-[#78716C]">
                      {staged ? 'Staged Replacement Preview' : 'Storefront Composition Preview'}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        staged
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
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

                {/* BESPOKE PREVIEW CONTAINER PER SECTION */}
                <div className="flex justify-center">
                  <div
                    className={`relative overflow-hidden bg-[#141210] rounded-xl ring-1 ring-black/5 dark:ring-white/10 shadow-xs transition-all ${
                      // Ratios logic
                      key === 'brandOverview'
                        ? mode === 'mobile'
                          ? 'w-full max-w-[420px] aspect-[16/9]'
                          : 'w-full aspect-[21/9] lg:aspect-[24/9] min-h-[220px] sm:min-h-[300px]'
                        : key === 'craft_supporting' || key === 'spotlight_details'
                        ? mode === 'mobile'
                          ? 'w-full max-w-[360px] aspect-[3/2]'
                          : 'w-full max-w-xl aspect-[3/2]'
                        : key === 'spotlight_proudly_made'
                        ? mode === 'mobile'
                          ? 'w-full max-w-[420px] aspect-[21/9]'
                          : 'w-full max-w-2xl aspect-[16/9]'
                        : key === 'spotlight_craftsmanship'
                        ? mode === 'mobile'
                          ? 'w-full max-w-[320px] aspect-[4/5]'
                          : 'w-full max-w-[340px] aspect-square'
                        : key === 'brandVision' || key === 'brandMission'
                        ? mode === 'mobile'
                          ? 'w-full max-w-[360px] aspect-[4/5]'
                          : 'w-full max-w-xl aspect-[4/3] min-h-[300px]'
                        : mode === 'mobile'
                        ? 'w-full max-w-[320px] aspect-[4/5]'
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

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Badges / Storefront text emulation */}
                    <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 text-white">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/95 text-[9px] sm:text-[10px] uppercase tracking-[0.18em] font-semibold border border-white/15">
                        {sec.title} · {sec.sectionGroup}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-black/60 backdrop-blur-md text-white/90 border border-white/15">
                        {mode === 'mobile' ? `${ratios.mobile} Mobile` : `${ratios.desktop} Desktop`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. UPLOAD DROPZONE & ACCESSIBLE ALT INPUT */}
              <div className={`rounded-xl border p-5 ${innerCardBg} space-y-4`}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* File Upload Dropzone (Col 7) */}
                  <div className="md:col-span-7 space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1C2434] dark:text-[#E8E1DA]">
                      Replace Section {secNumber} Image
                    </label>

                    {/* Hidden Native File Input */}
                    <input
                      ref={(el) => {
                        fileInputRefs.current[key] = el;
                      }}
                      type="file"
                      accept={sec.mediaType === 'video' ? 'video/mp4,video/webm' : 'image/webp,image/jpeg,image/png'}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelection(key, file);
                      }}
                      className="hidden"
                    />

                    {/* Drag-and-Drop Dropzone Box */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDraggingSection(key);
                      }}
                      onDragLeave={() => setDraggingSection(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDraggingSection(null);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleFileSelection(key, file);
                      }}
                      onClick={() => fileInputRefs.current[key]?.click()}
                      className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
                        isDragging
                          ? 'border-[#5146E5] bg-[#5146E5]/10'
                          : staged
                          ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/10'
                          : 'border-[#D8D2C8] dark:border-[#38332E] bg-white/70 dark:bg-[#1A1816]/60 hover:border-[#5146E5] dark:hover:border-[#5146E5]'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                            staged
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : 'bg-black/5 dark:bg-white/5 text-[#78716C] dark:text-[#A8A29E]'
                          }`}
                        >
                          <Upload className="w-4 h-4" />
                        </div>

                        {staged ? (
                          <div>
                            <span className="font-semibold text-xs text-emerald-700 dark:text-emerald-400 block truncate max-w-[240px]">
                              {staged.file.name}
                            </span>
                            <span className="text-[10px] mt-0.5 block text-[#8C837A] dark:text-[#78716C]">
                              {(staged.file.size / 1024).toFixed(1)} KB · File verified
                              {staged.dimensions && ` · ${staged.dimensions.width}×${staged.dimensions.height}px`}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-medium text-xs block text-[#1C2434] dark:text-[#E8E1DA]">
                              Click to choose or drag &amp; drop file
                            </span>
                            <span className="text-[10px] mt-0.5 block text-[#8C837A] dark:text-[#78716C]">
                              Target folder: <code className="font-mono text-[#5146E5] dark:text-[#818CF8]">{sec.cloudinaryFolder}/</code>
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
                          {sec.publicId || `${sec.cloudinaryFolder}/...`}
                        </span>
                      </div>
                      {sec.updatedAt && (
                        <div className="flex items-center justify-between text-[#78716C] dark:text-[#A8A29E]">
                          <span>Last Synced:</span>
                          <span className="font-mono text-[11px]">
                            {new Date(sec.updatedAt).toLocaleDateString('en-IN')}
                          </span>
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
