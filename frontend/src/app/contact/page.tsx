'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { SOCIAL_LINKS } from '@/data/social';
import {
  InstagramIcon,
  PinterestIcon,
  YoutubeIcon,
  FacebookIcon,
  ThreadsIcon,
} from '@/components/layout/Footer';

function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.71 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
    </svg>
  );
}

function GmailIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.545l8.073-6.052C21.69 2.28 24 3.434 24 5.457z" />
    </svg>
  );
}

const SOCIAL_CHANNELS = [
  {
    name: 'Instagram',
    handle: '@zimorworld',
    href: SOCIAL_LINKS.instagram,
    Icon: InstagramIcon,
    hoverBg: 'group-hover:bg-gradient-to-tr group-hover:from-[#f09433] group-hover:via-[#dc2743] group-hover:to-[#bc1888] group-hover:border-transparent group-hover:text-white',
    description: 'Visual stories & atelier moments',
  },
  {
    name: 'Pinterest',
    handle: 'Zimor',
    href: SOCIAL_LINKS.pinterest,
    Icon: PinterestIcon,
    hoverBg: 'group-hover:bg-[#E60023] group-hover:border-[#E60023] group-hover:text-white',
    description: 'Moodboards & silhouette styling',
  },
  {
    name: 'YouTube',
    handle: '@zimorworld-z3p4i',
    href: SOCIAL_LINKS.youtube,
    Icon: YoutubeIcon,
    hoverBg: 'group-hover:bg-[#FF0000] group-hover:border-[#FF0000] group-hover:text-white',
    description: 'Craftsmanship films & product reviews',
  },
  {
    name: 'Facebook',
    handle: 'Zimor',
    href: SOCIAL_LINKS.facebook,
    Icon: FacebookIcon,
    hoverBg: 'group-hover:bg-[#1877F2] group-hover:border-[#1877F2] group-hover:text-white',
    description: 'Community updates & releases',
  },
  {
    name: 'Threads',
    handle: '@zimorworld',
    href: SOCIAL_LINKS.threads,
    Icon: ThreadsIcon,
    hoverBg: 'group-hover:bg-black group-hover:border-black group-hover:text-white',
    description: 'Conversations & brand chronicles',
  },
];

export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. Breadcrumb Strip */}
      <div className="border-b border-line bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="text-[11px] text-ink-muted uppercase tracking-wider flex items-center gap-2">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-black font-semibold">Contact Us</span>
          </nav>
        </div>
      </div>

      {/* 2. Editorial Hero Banner — "At Your Service" */}
      <section className="relative w-full overflow-hidden min-h-[300px] sm:min-h-[360px] md:min-h-[420px] flex items-center bg-black">
        <div className="absolute inset-0">
          <Image
            src="https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917844/zimor/lifestyle/corporate-workspace-horizontal.webp"
            alt="Zimor Client Support"
            fill
            priority
            className="object-cover object-center opacity-65 scale-105"
          />
          {/* Subtle cinematic gradient overlay for editorial typography readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 w-full">
          <div className="max-w-2xl text-left">
            <p className="text-[11px] sm:text-[12px] uppercase tracking-[0.25em] text-[#b4b4b4] font-medium mb-3 sm:mb-4">
              Zimor Client Support
            </p>
            <h1 className="font-primary text-[38px] sm:text-[50px] md:text-[60px] lg:text-[68px] font-normal text-white tracking-tight leading-[1.08] mb-4 sm:mb-5">
              At Your Service
            </h1>
            <p className="text-white/85 text-xs sm:text-sm md:text-[15px] font-light leading-relaxed max-w-xl">
              The Zimor team is available 24 hours a day, 7 days a week to assist with order inquiries, tailored styling recommendations, craftsmanship details, leather aftercare, and corporate gifting.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Direct Contact Channels (WhatsApp & Email) */}
      <section className="bg-white border-b border-line py-14 sm:py-18 md:py-22">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Subhead */}
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#000000] font-semibold mb-2 font-primary">
              Reach Us Anytime
            </p>
            <h2 className="font-primary text-[26px] sm:text-[32px] md:text-[36px] font-normal text-black tracking-tight mb-2.5">
              Direct Contact Channels
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
              Connect with our team anytime across your preferred channel. We are on hand to provide dedicated assistance around the clock.
            </p>
          </div>

          {/* 2 Cards Grid: WhatsApp & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-6 lg:gap-8">
            {/* Channel 1: WhatsApp */}
            <div className="group bg-[#FAFAFA] border border-line rounded-xs p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:bg-white hover:shadow-lift hover:border-[#25D366]/40">
              <div>
                {/* Clean Top Icon Circle */}
                <div className="w-12 h-12 rounded-full bg-black/5 border border-[#b4b4b4]/30 flex items-center justify-center text-black mb-5 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#25D366] group-hover:border-[#25D366] group-hover:text-white group-hover:shadow-sm">
                  <WhatsAppIcon className="w-5 h-5" />
                </div>

                {/* Title & Contact Details */}
                <h3 className="font-primary text-[20px] sm:text-[22px] font-semibold text-black tracking-tight mb-1 group-hover:text-[#25D366] transition-colors">
                  WhatsApp
                </h3>
                <p className="text-[15px] font-medium text-black mb-3">
                  +91 86046 47888
                </p>

                {/* Informative Guidance */}
                <div className="space-y-2 text-xs sm:text-[12.5px] text-[#555555] leading-relaxed pt-3 border-t border-line/80 mb-6">
                  <p>
                    <strong className="text-black font-medium">Best for:</strong> Real-time product consultations, 15.6" laptop fit verification, immediate order status, and leather aftercare advice.
                  </p>
                  <p className="text-[11.5px] text-[#777777]">
                    • Direct chat with our client support team
                  </p>
                  <p className="text-[11.5px] text-[#777777]">
                    • Instant photo sharing for sizing checks
                  </p>
                </div>
              </div>

              {/* Action Link Button */}
              <a
                href="https://wa.me/918604647888"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-black text-white hover:bg-[#25D366] font-primary text-[12.5px] font-medium rounded-xs transition-all duration-200 flex items-center justify-center gap-2 text-center shadow-xs"
              >
                <span>Start A Conversation on WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Channel 2: Email */}
            <div className="group bg-[#FAFAFA] border border-line rounded-xs p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:bg-white hover:shadow-lift hover:border-[#EA4335]/40">
              <div>
                {/* Clean Top Icon Circle */}
                <div className="w-12 h-12 rounded-full bg-black/5 border border-[#b4b4b4]/30 flex items-center justify-center text-black mb-5 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#EA4335] group-hover:border-[#EA4335] group-hover:text-white group-hover:shadow-sm">
                  <GmailIcon className="w-5 h-5" />
                </div>

                {/* Title & Contact Details */}
                <h3 className="font-primary text-[20px] sm:text-[22px] font-semibold text-black tracking-tight mb-1 group-hover:text-[#EA4335] transition-colors">
                  By Email
                </h3>
                <p className="text-[15px] font-medium text-black mb-3">
                  zimorindia@gmail.com
                </p>

                {/* Informative Guidance */}
                <div className="space-y-2 text-xs sm:text-[12.5px] text-[#555555] leading-relaxed pt-3 border-t border-line/80 mb-6">
                  <p>
                    <strong className="text-black font-medium">Best for:</strong> Detailed documentation, press & editorial requests, warranty claims, corporate partnerships, and invoicing.
                  </p>
                  <p className="text-[11.5px] text-[#777777]">
                    • Dedicated inbox with immediate receipt
                  </p>
                  <p className="text-[11.5px] text-[#777777]">
                    • Direct communication with brand leadership
                  </p>
                </div>
              </div>

              {/* Action Link Button */}
              <a
                href="mailto:zimorindia@gmail.com"
                className="w-full py-3 px-4 bg-black text-white hover:bg-[#EA4335] font-primary text-[12.5px] font-medium rounded-xs transition-all duration-200 flex items-center justify-center gap-2 text-center shadow-xs"
              >
                <span>Send An Email</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Social Media Banner — "Follow Us On" */}
      <section className="bg-canvas border-b border-line py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#000000] font-semibold mb-2 font-primary">
            Connect With Zimor
          </p>
          <h2 className="font-primary text-[28px] sm:text-[36px] md:text-[42px] font-normal text-black tracking-tight mb-3">
            Follow Us On
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] max-w-md mx-auto mb-10 sm:mb-12 leading-relaxed">
            Discover behind-the-scenes leathercraft, campaign visuals, and curated styling updates across all our official handles.
          </p>

          {/* Social Channels 5-Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 max-w-6xl mx-auto">
            {SOCIAL_CHANNELS.map((item) => {
              const Icon = item.Icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white border border-line rounded-xs p-6 sm:p-7 flex flex-col items-center justify-between text-center transition-all duration-300 hover:shadow-lift hover:-translate-y-1 hover:border-[#b4b4b4]"
                >
                  <div
                    className={`w-12 h-12 rounded-full bg-black/5 border border-[#b4b4b4]/30 flex items-center justify-center text-black mb-4 transition-all duration-300 group-hover:scale-110 ${item.hoverBg}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 mb-4">
                    <h3 className="font-primary text-[15px] font-semibold text-black tracking-tight">
                      {item.name}
                    </h3>
                    <p className="text-[12px] text-black/75 font-medium">
                      {item.handle}
                    </p>
                    <p className="text-[11px] text-[#777777] leading-snug">
                      {item.description}
                    </p>
                  </div>
                  <span className="font-primary text-[12px] font-medium text-black group-hover:underline inline-flex items-center gap-1">
                    <span>Follow Us</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#b4b4b4] group-hover:text-black transition-colors" />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
