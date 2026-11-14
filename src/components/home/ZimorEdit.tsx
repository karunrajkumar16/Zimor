'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
} from 'lucide-react';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const MusicIcon: React.FC<{ className?: string }> = ({ className = 'w-3 h-3' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

interface ZimorReel {
  id: string;
  videoSrc: string;
  posterSrc: string;
  instagramUrl: string;
  handle: string;
  povText?: string;
  title: string;
  caption: string;
  silhouette: string;
  likes: string;
  comments: string;
  audioTrack: string;
  startTime: number;
  endTime: number;
}

// Exactly the five Instagram Reels with authentic Instagram Reel POV copy
const ZIMOR_REELS: ZimorReel[] = [
  {
    id: 'reel-1',
    videoSrc: '/reels/reel-00001.mp4',
    posterSrc: '/reels/poster-1.jpg',
    instagramUrl: 'https://www.instagram.com/reel/DehSFkxvmew/',
    handle: '@zimorindia',
    povText: 'POV: Packing your entire workday into one bag 💼✨',
    title: 'Workday Essentials Pack',
    caption: 'Delo Tote in Caramel — Laptop, charger, notebooks & daily essentials 🤍 #ZimorEdit',
    silhouette: 'Delo Tote • Rust Caramel',
    likes: '3.8k',
    comments: '84',
    audioTrack: 'zimorindia • Original audio',
    startTime: 2.0,
    endTime: 7.8,
  },
  {
    id: 'reel-2',
    videoSrc: '/reels/reel-00002.mp4',
    posterSrc: '/reels/poster-2.jpg',
    instagramUrl: 'https://www.instagram.com/reel/DdeBTWksCJM/',
    handle: '@zimorindia',
    povText: 'POV: Seamless commute from boardroom to evening 🚇☕',
    title: 'Dual-Carry Commute Agility',
    caption: 'Dual-carry agility with the Rabota Tote. Structured for tech & transit. #WorkStyle',
    silhouette: 'Rabota Tote • Cognac Brown',
    likes: '4.2k',
    comments: '112',
    audioTrack: 'zimorindia • Original audio',
    startTime: 2.0,
    endTime: 7.8,
  },
  {
    id: 'reel-3',
    videoSrc: '/reels/reel-00003.mp4',
    posterSrc: '/reels/poster-3.jpg',
    instagramUrl: 'https://www.instagram.com/reel/Ddasvd6xhQn/',
    handle: '@zimorindia',
    povText: 'POV: When your daily carry fits literally everything 🤍',
    title: 'Minimalist Crescent Styling',
    caption: 'Classic Crescent Bag in Cream. Lightweight sculpture with magnetic gold closure ✨',
    silhouette: 'Classic Shoulder Bag • Cream',
    likes: '2.9k',
    comments: '67',
    audioTrack: 'zimorindia • Original audio',
    startTime: 2.0,
    endTime: 7.8,
  },
  {
    id: 'reel-4',
    videoSrc: '/reels/reel-00004.mp4',
    posterSrc: '/reels/poster-4.jpg',
    instagramUrl: 'https://www.instagram.com/reel/DdTqQ5qBW-N/',
    handle: '@zimorindia',
    povText: 'POV: The executive presence that commands authority 🖤',
    title: 'Executive Presence',
    caption: 'Jet Noir Delo Tote. Dedicated 15.6" padded tech sleeve & matching pouch 💼',
    silhouette: 'Delo Tote • Noir Black',
    likes: '5.1k',
    comments: '143',
    audioTrack: 'zimorindia • Original audio',
    startTime: 2.0,
    endTime: 7.8,
  },
  {
    id: 'reel-5',
    videoSrc: '/reels/reel-00005.mp4',
    posterSrc: '/reels/poster-5.jpg',
    instagramUrl: 'https://www.instagram.com/reel/Db7t3Ikx1C1/',
    handle: '@zimorindia',
    povText: 'POV: Unboxing master handcrafted Indian leathercraft 📦✨',
    title: 'Unboxing Handcrafted Grace',
    caption: 'Every stitch tells a story of artisanal perfection. Delivered across India 🇮🇳',
    silhouette: 'Signature Collection',
    likes: '6.4k',
    comments: '198',
    audioTrack: 'zimorindia • Original audio',
    startTime: 2.0,
    endTime: 7.8,
  },
];

export const ZimorEdit: React.FC = () => {
  const [activeModalReel, setActiveModalReel] = useState<ZimorReel | null>(null);
  const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({
    'reel-1': true,
    'reel-2': true,
    'reel-3': true,
    'reel-4': true,
    'reel-5': true,
  });

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const progressBarRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const carouselRef = useRef<HTMLDivElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize and maintain 2.0s to 7.8s 5-6 second loop with direct DOM updates (0 re-renders per second)
  const handleTimeUpdate = useCallback((reel: ZimorReel) => {
    const video = videoRefs.current[reel.id];
    if (!video) return;

    const current = video.currentTime;
    const duration = reel.endTime - reel.startTime; // ~5.8s

    if (current < reel.startTime) {
      video.currentTime = reel.startTime;
    } else if (current >= reel.endTime) {
      video.currentTime = reel.startTime;
      if (video.paused) {
        video.play().catch(() => {});
      }
    }

    const progress = Math.max(0, Math.min(100, ((current - reel.startTime) / duration) * 100));
    const bar = progressBarRefs.current[reel.id];
    if (bar) {
      bar.style.width = `${progress}%`;
    }
  }, []);

  const handleLoadedMetadata = useCallback((reel: ZimorReel) => {
    const video = videoRefs.current[reel.id];
    if (!video) return;
    video.currentTime = reel.startTime;
    video.play().catch(() => {});
  }, []);

  const toggleMute = (reelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRefs.current[reelId];
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setMutedStates((prev) => ({ ...prev, [reelId]: nextMuted }));
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const offset = direction === 'left' ? -320 : 320;
    carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  // Keyboard navigation for accessible modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModalReel) {
        setActiveModalReel(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalReel]);

  return (
    <section
      className="pt-8 sm:pt-12 lg:pt-16 pb-12 sm:pb-16 lg:pb-20 bg-canvas border-b border-line select-none overflow-hidden"
      aria-label="The Zimor Edit - As Seen on Instagram"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs uppercase tracking-[0.25em] text-brand-700 font-bold mb-2">
              <InstagramIcon className="w-3.5 h-3.5" />
              <span>Community &amp; Moments</span>
            </div>
            <h2 className="font-serif text-[34px] sm:text-[42px] lg:text-[48px] font-normal text-ink tracking-tight leading-none">
              The Zimor Edit
            </h2>
            <p className="text-xs sm:text-sm text-ink-secondary mt-2 font-light max-w-xl leading-relaxed">
              Real moments, daily commutes, and effortless styling shared by our community. Curated directly from our official Instagram reels.
            </p>
          </div>

          {/* Mobile / Tablet scroll buttons */}
          <div className="flex lg:hidden items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => scrollCarousel('left')}
              className="w-8 h-8 rounded-full border border-line bg-white flex items-center justify-center text-ink hover:bg-canvas-alt active:scale-95 transition-all"
              aria-label="Previous reel"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              className="w-8 h-8 rounded-full border border-line bg-white flex items-center justify-center text-ink hover:bg-canvas-alt active:scale-95 transition-all"
              aria-label="Next reel"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5-Reel Responsive Grid & Touch Carousel — Authentic Instagram Reel Layout */}
        <div
          ref={carouselRef}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-4 overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory pb-3 lg:pb-0 scroll-smooth no-scrollbar"
        >
          {ZIMOR_REELS.map((reel) => {
            const isMuted = mutedStates[reel.id];

            return (
              <div
                key={reel.id}
                onClick={() => setActiveModalReel(reel)}
                className="group relative flex-none w-[72vw] sm:w-[45vw] lg:w-auto snap-start aspect-[9/16] rounded-md sm:rounded-lg overflow-hidden bg-black shadow-md hover:shadow-2xl ring-1 ring-white/10 hover:ring-white/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                {/* HTML5 Video Element with High-Visibility Hover Zoom */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="w-full h-full transform transition-transform duration-500 ease-out will-change-transform group-hover:scale-110">
                    <video
                      ref={(el) => {
                        videoRefs.current[reel.id] = el;
                      }}
                      src={reel.videoSrc}
                      poster={reel.posterSrc}
                      muted={isMuted}
                      playsInline
                      autoPlay
                      preload="metadata"
                      onLoadedMetadata={() => handleLoadedMetadata(reel)}
                      onTimeUpdate={() => handleTimeUpdate(reel)}
                      className="w-full h-full object-cover object-center pointer-events-none"
                      aria-label={reel.title}
                    />
                  </div>
                </div>

                {/* Top Instagram Story / Reel Loop Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/25 z-30 overflow-hidden">
                  <div
                    ref={(el) => {
                      progressBarRefs.current[reel.id] = el;
                    }}
                    className="h-full bg-white transition-[width] duration-100 ease-linear shadow-xs"
                    style={{ width: '0%' }}
                  />
                </div>

                {/* Top Status Bar: Player Controls on Left, Official Instagram Text on Right */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-20 pointer-events-auto">
                  {/* Left: Player Audio & Expand Controls */}
                  <div className="flex items-center gap-1.5">
                    {/* Audio / Mute toggle */}
                    <button
                      type="button"
                      onClick={(e) => toggleMute(reel.id, e)}
                      className="w-7 h-7 rounded-full bg-black/45 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-all border border-white/15 shadow-sm"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-brand-300" />}
                    </button>

                    {/* Expand icon */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveModalReel(reel);
                      }}
                      className="w-7 h-7 rounded-full bg-black/45 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center opacity-90 transition-all border border-white/15 shadow-sm"
                      aria-label="Expand video"
                    >
                      <Maximize2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Top Right: Official Instagram Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md text-white border border-white/15 drop-shadow-sm">
                    <InstagramIcon className="w-3 h-3 text-pink-400 shrink-0" />
                    <span className="text-[10px] font-semibold tracking-wide text-white">Instagram</span>
                  </div>
                </div>

                {/* Dark Vignette Gradient for Crystal Clear Text & Button Visibility */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85 pointer-events-none" />

                {/* Bottom Left: Official Brand Profile & Caption (Instagram Native Style) */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:right-3.5 z-20 text-white space-y-1.5 pointer-events-auto">
                  {/* Brand Profile Row */}
                  <div className="flex items-center gap-1.5">
                    {/* Official Avatar with Instagram Story Ring */}
                    <div className="w-6 h-6 rounded-full p-[1px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shrink-0 shadow-xs">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[9px] font-bold text-white tracking-widest">
                        Z
                      </div>
                    </div>

                    {/* Official Brand Handle */}
                    <Link
                      href="https://www.instagram.com/zimorindia/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="font-sans font-semibold text-xs text-white tracking-tight hover:underline drop-shadow-sm truncate"
                    >
                      {reel.handle}
                    </Link>

                    {/* Follow Pill */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open('https://www.instagram.com/zimorindia/', '_blank');
                      }}
                      className="px-2 py-0.5 rounded-full border border-white/50 bg-white/10 hover:bg-white/25 backdrop-blur-xs text-[9.5px] font-semibold text-white tracking-tight transition-all shrink-0"
                    >
                      Follow
                    </button>
                  </div>

                  {/* Reel Caption with Instagram Typography */}
                  <p className="font-sans text-[11px] text-white/95 font-normal leading-snug line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {reel.caption}
                  </p>

                  {/* Audio Music Track Ticker */}
                  <div className="flex items-center gap-1.5 text-[9.5px] text-white/80 font-normal pt-0.5 drop-shadow-sm">
                    <MusicIcon className="w-3 h-3 text-white/90 shrink-0" />
                    <span className="truncate max-w-[125px] font-sans">
                      {reel.audioTrack}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Social Banner: Direct Invite to Community */}
        <div className="mt-8 sm:mt-12 p-4 sm:p-6 rounded-xs bg-white border border-line shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-serif text-sm sm:text-base font-semibold text-ink">
              Share your workday style with Zimor
            </p>
            <p className="text-xs text-ink-secondary font-light">
              Tag <span className="font-medium text-ink">@zimorindia</span> and use hashtag <span className="font-medium text-ink">#ZimorEdit</span> to be featured on our official channel.
            </p>
          </div>

          <Link
            href="https://www.instagram.com/zimorindia/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-ink text-white hover:bg-brand-800 text-xs uppercase tracking-wider font-medium transition-colors shadow-xs shrink-0"
          >
            <InstagramIcon className="w-3.5 h-3.5" />
            <span>Join Our Instagram</span>
          </Link>
        </div>
      </div>

      {/* Expanded Interactive Modal Reel Viewer */}
      {activeModalReel && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setActiveModalReel(null)}
        >
          <div
            className="relative w-full max-w-sm sm:max-w-md aspect-[9/16] max-h-[90vh] bg-black rounded-lg overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Video Player with Sound */}
            <video
              ref={modalVideoRef}
              src={activeModalReel.videoSrc}
              poster={activeModalReel.posterSrc}
              autoPlay
              controls
              playsInline
              className="w-full h-full object-cover object-center"
            />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveModalReel(null)}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors z-30"
              aria-label="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Bottom Detail Drawer with Instagram Styling */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent text-white space-y-2 pointer-events-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shrink-0">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-white">
                      Z
                    </div>
                  </div>
                  <div>
                    <p className="font-sans text-xs font-semibold text-white">{activeModalReel.handle}</p>
                    <p className="font-sans text-xs text-brand-200">{activeModalReel.title}</p>
                  </div>
                </div>
                <Link
                  href={activeModalReel.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-ink font-sans text-xs font-semibold hover:bg-brand-100 transition-colors"
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-brand-700" />
                  <span>Open on IG ↗</span>
                </Link>
              </div>
              <p className="font-sans text-xs text-white/85 font-normal line-clamp-2">
                {activeModalReel.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
