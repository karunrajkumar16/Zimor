'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { isDark } = useAdminTheme();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">System &amp; Provider Settings</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Monitor active architecture providers and verify credentials when transitioning from Development to Production.
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

      {/* Provider Status Grid */}
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
