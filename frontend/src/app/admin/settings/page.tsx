'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useAdminTheme } from '@/context/AdminThemeContext';
import {
  Server,
  Database,
  Cloud,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Key,
  Share2,
  Lock,
  ExternalLink,
  Save,
  Check,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { SOCIAL_LINKS } from '@/data/social';

export default function AdminSettingsPage() {
  const { isDark } = useAdminTheme();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Social Links CMS State
  const [socialLinks, setSocialLinks] = useState({
    instagram: SOCIAL_LINKS.instagram,
    facebook: SOCIAL_LINKS.facebook,
    pinterest: SOCIAL_LINKS.pinterest,
    youtube: SOCIAL_LINKS.youtube,
    threads: SOCIAL_LINKS.threads,
  });
  const [socialLoading, setSocialLoading] = useState(true);
  const [socialSaving, setSocialSaving] = useState(false);
  const [socialSavedMessage, setSocialSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    fetchSocialLinks();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/stats');
      const data = await res.json();
      setStats(data?.stats || data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSocialLinks = async () => {
    setSocialLoading(true);
    try {
      const res = await apiFetch('/api/content/social_links');
      const data = await res.json();
      if (data.content && data.content.data) {
        setSocialLinks({
          instagram: data.content.data.instagram || SOCIAL_LINKS.instagram,
          facebook: data.content.data.facebook || SOCIAL_LINKS.facebook,
          pinterest: data.content.data.pinterest || SOCIAL_LINKS.pinterest,
          youtube: data.content.data.youtube || SOCIAL_LINKS.youtube,
          threads: data.content.data.threads || SOCIAL_LINKS.threads,
        });
      }
    } catch (err) {
      console.warn('Failed to load social links from database:', err);
    } finally {
      setSocialLoading(false);
    }
  };

  const handleSaveSocialLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    setSocialSaving(true);
    setSocialSavedMessage(null);
    try {
      const res = await apiFetch('/api/content/social_links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'default', data: socialLinks }),
      });
      if (res.ok) {
        setSocialSavedMessage('Social media links persisted successfully in MongoDB Atlas.');
        setTimeout(() => setSocialSavedMessage(null), 4000);
      } else {
        throw new Error('Failed to save social links');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving social links');
    } finally {
      setSocialSaving(false);
    }
  };

  const providers = [
    {
      name: 'Database Layer',
      icon: Database,
      current: stats?.providers?.database === 'json' ? 'Local JSON Repository (Dev Mode)' : 'MongoDB Atlas (Production)',
      isDev: stats?.providers?.database === 'json',
      envKeys: ['MONGODB_URI', 'USE_MOCK_DB'],
      status: stats?.providers?.database === 'json' ? 'Temporary Storage Active' : 'Connected to MongoDB',
      switchGuide: 'Add MONGODB_URI=mongodb+srv://... to .env.local and set USE_MOCK_DB=false. Zero code changes required.',
    },
    {
      name: 'Media & Asset Storage',
      icon: Cloud,
      current: stats?.providers?.media === 'local' ? 'Local Filesystem Storage (Dev Mode)' : 'Cloudinary CDN (Production)',
      isDev: stats?.providers?.media === 'local',
      envKeys: ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'USE_MOCK_MEDIA'],
      status: stats?.providers?.media === 'local' ? 'Local Directory Active' : 'Cloudinary CDN Active',
      switchGuide: 'Add CLOUDINARY credentials to .env.local and set USE_MOCK_MEDIA=false. Folder hierarchy (zimor/products, zimor/homepage, etc.) auto-provisions.',
    },
    {
      name: 'Payment Processing',
      icon: CreditCard,
      current: stats?.providers?.payment === 'mock' ? 'Mock Payment Provider (Dev Mode)' : 'Razorpay Gateway (Production)',
      isDev: stats?.providers?.payment === 'mock',
      envKeys: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET', 'NEXT_PUBLIC_RAZORPAY_KEY_ID', 'USE_MOCK_PAYMENT'],
      status: stats?.providers?.payment === 'mock' ? 'Simulated Sandbox Mode' : 'Live Razorpay Active',
      switchGuide: 'Add RAZORPAY credentials to .env.local and set USE_MOCK_PAYMENT=false. Checkout modal automatically connects with signature verification.',
    },
  ];

  const cardBg = isDark
    ? 'bg-[#24211F] border-[#36312C]'
    : 'bg-[#FFFFFF] border-[#E5DFD7] shadow-xs';
  const inputClass = `w-full rounded px-3 py-2 text-xs border transition-colors focus:outline-none focus:border-[#B44220] ${
    isDark
      ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA]'
      : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#24211F]'
  }`;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">System &amp; Architecture Settings</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Centralized administration for external channels, legal registries, and infrastructure telemetry.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded border transition-colors ${
            isDark
              ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA] hover:border-[#B44220]'
              : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#24211F] hover:border-[#B44220]'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Diagnostics</span>
        </button>
      </div>

      {/* SECTION 1: SOCIAL MEDIA CHANNELS MANAGEMENT */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#B44220]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#24211F] dark:text-[#E8E1DA]">
              Official Social Media Channels (Storefront Integration)
            </h2>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            Persisted in MongoDB Atlas
          </span>
        </div>

        <div className={`rounded-lg p-5 border ${cardBg}`}>
          <form onSubmit={handleSaveSocialLinks} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Instagram */}
              <div>
                <label className={`block mb-1 text-xs font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                  Instagram URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={socialLinks.instagram}
                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                    className={inputClass}
                    required
                  />
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded border border-[#E5DFD7] dark:border-[#36312C] text-[#7A7269] hover:text-[#B44220]"
                    title="Test Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Facebook */}
              <div>
                <label className={`block mb-1 text-xs font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                  Facebook URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={socialLinks.facebook}
                    onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                    className={inputClass}
                    required
                  />
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded border border-[#E5DFD7] dark:border-[#36312C] text-[#7A7269] hover:text-[#B44220]"
                    title="Test Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Pinterest */}
              <div>
                <label className={`block mb-1 text-xs font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                  Pinterest URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={socialLinks.pinterest}
                    onChange={(e) => setSocialLinks({ ...socialLinks, pinterest: e.target.value })}
                    className={inputClass}
                    required
                  />
                  <a
                    href={socialLinks.pinterest}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded border border-[#E5DFD7] dark:border-[#36312C] text-[#7A7269] hover:text-[#B44220]"
                    title="Test Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* YouTube */}
              <div>
                <label className={`block mb-1 text-xs font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                  YouTube URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={socialLinks.youtube}
                    onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                    className={inputClass}
                    required
                  />
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded border border-[#E5DFD7] dark:border-[#36312C] text-[#7A7269] hover:text-[#B44220]"
                    title="Test Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Threads */}
              <div className="md:col-span-2">
                <label className={`block mb-1 text-xs font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                  Threads URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={socialLinks.threads}
                    onChange={(e) => setSocialLinks({ ...socialLinks, threads: e.target.value })}
                    className={inputClass}
                    required
                  />
                  <a
                    href={socialLinks.threads}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded border border-[#E5DFD7] dark:border-[#36312C] text-[#7A7269] hover:text-[#B44220]"
                    title="Test Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-[#E5DFD7] dark:border-[#36312C]">
              {socialSavedMessage ? (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>{socialSavedMessage}</span>
                </div>
              ) : (
                <p className={`text-[11px] ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                  Updates reflect instantly across Footer, Mobile Navigation, and Contact sections.
                </p>
              )}

              <button
                type="submit"
                disabled={socialSaving || socialLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#B44220] hover:bg-[#9B381B] text-[#FFFFFF] text-xs font-semibold uppercase tracking-wider rounded transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{socialSaving ? 'Saving...' : 'Save Social Channels'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* SECTION 2: PROTECTED LEGAL POLICIES REGISTRY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#B44220]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#24211F] dark:text-[#E8E1DA]">
              Protected Legal Documents (Editing Strictly Disabled)
            </h2>
          </div>
          <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
            Statutory Immutability Enforced
          </span>
        </div>

        <div className={`rounded-lg p-5 border ${cardBg} space-y-4`}>
          <div className="p-3.5 rounded bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong>Critical Policy Enforcement:</strong> Under strict legal compliance mandates, the <strong>Privacy Policy</strong> and <strong>Terms of Service</strong> are immutable legal documents. Modifications through automated CMS editors or administrative input are permanently disabled.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Document 1: Privacy Policy */}
            <div className={`p-4 rounded border ${isDark ? 'bg-[#1E1C1A] border-[#36312C]' : 'bg-[#FAF7F2] border-[#E5DFD7]'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-xs text-[#24211F] dark:text-[#E8E1DA]">
                  Privacy Policy
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  Locked &amp; Verified
                </span>
              </div>
              <p className="text-[11px] text-[#7A7269] mb-3 leading-relaxed">
                Last Updated: 17 November 2026. Stored in MongoDB Atlas (<code className="text-[10px]">SiteContent.privacy-policy</code>). Covers personal information handling, cookies, third-party disclosures, and user rights.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-[#E5DFD7] dark:border-[#36312C]">
                <span className="text-[10px] text-[#8C837A]">Status: Immutable</span>
                <Link
                  href="/privacy-policy"
                  target="_blank"
                  className="text-xs text-[#B44220] hover:underline flex items-center gap-1 font-medium"
                >
                  <span>View Live Document</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Document 2: Terms of Service */}
            <div className={`p-4 rounded border ${isDark ? 'bg-[#1E1C1A] border-[#36312C]' : 'bg-[#FAF7F2] border-[#E5DFD7]'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-xs text-[#24211F] dark:text-[#E8E1DA]">
                  Terms of Service
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  Locked &amp; Verified
                </span>
              </div>
              <p className="text-[11px] text-[#7A7269] mb-3 leading-relaxed">
                19 Comprehensive Sections &amp; Contact Info. Stored in MongoDB Atlas (<code className="text-[10px]">SiteContent.terms-of-service</code>). Governed by the laws of India.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-[#E5DFD7] dark:border-[#36312C]">
                <span className="text-[10px] text-[#8C837A]">Status: Immutable</span>
                <Link
                  href="/terms-of-service"
                  target="_blank"
                  className="text-xs text-[#B44220] hover:underline flex items-center gap-1 font-medium"
                >
                  <span>View Live Document</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: ARCHITECTURE PROVIDER INTERFACES */}
      <div className="space-y-4">
        <h2 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
          Architecture Provider Interfaces
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {providers.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className={`rounded-lg p-5 flex flex-col justify-between space-y-4 border ${cardBg}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-[#B44220]/15 border border-[#B44220]/30 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#B44220] dark:text-[#E07A5F]" />
                      </div>
                      <h3 className="font-semibold text-xs">{p.name}</h3>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                        p.isDev
                          ? 'bg-[#C07D2B]/15 text-[#C07D2B] dark:text-[#E9A855] border-[#C07D2B]/30'
                          : 'bg-[#2E7D5A]/15 text-[#2E7D5A] dark:text-[#52B788] border-[#2E7D5A]/30'
                      }`}
                    >
                      {p.isDev ? 'Development' : 'Production'}
                    </span>
                  </div>

                  <p className="text-xs font-medium mt-3">
                    {p.current}
                  </p>

                  <div className={`mt-3 p-3 rounded border text-[11px] space-y-1 ${
                    isDark ? 'bg-[#1E1C1A] border-[#36312C]' : 'bg-[#FAF7F2] border-[#E5DFD7]'
                  }`}>
                    <p className={`font-semibold uppercase text-[9px] tracking-wider ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                      Environment Variables
                    </p>
                    <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                      {p.envKeys.map((k) => (
                        <span key={k} className={`px-1.5 py-0.5 rounded border ${
                          isDark
                            ? 'bg-[#2C2825] border-[#36312C] text-[#B4B4B4]'
                            : 'bg-[#EDE7DE] border-[#E5DFD7] text-[#5A534E]'
                        }`}>
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={`pt-3 border-t text-[11px] ${
                  isDark ? 'border-[#36312C] text-[#8A837C]' : 'border-[#E5DFD7] text-[#8C837A]'
                }`}>
                  <p className={`font-medium ${isDark ? 'text-[#E8E1DA]' : 'text-[#24211F]'}`}>Migration Guide:</p>
                  <p className="mt-0.5 leading-relaxed">{p.switchGuide}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
