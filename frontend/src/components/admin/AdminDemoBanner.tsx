'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Trash2,
  RefreshCw,
  ShieldAlert,
  Clock,
  Layers,
  CheckCircle,
  Database,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAdminTheme } from '@/context/AdminThemeContext';

interface DemoStatus {
  isDemoActive: boolean;
  demoCounts: {
    orders: number;
    customers: number;
    issues: number;
    inventoryMovements: number;
  };
  expiresAt: string | null;
  createdAt: string | null;
  lifespanDays: number;
}

export default function AdminDemoBanner() {
  const { isDark } = useAdminTheme();
  const [status, setStatus] = useState<DemoStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await apiFetch('/api/admin/demo/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch {
      // Ignore background errors
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll every 60s
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const handlePurge = async () => {
    if (!window.confirm('Are you sure you want to purge all 7-day demo records? Genuine business records, products, and admin accounts will be strictly preserved.')) {
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await apiFetch('/api/admin/demo', { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setMessage('All demo data purged. Admin dashboard refreshed to genuine state.');
        await fetchStatus();
        window.location.reload();
      } else {
        alert(data.error || 'Failed to purge demo data');
      }
    } catch (err: any) {
      alert(err.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await apiFetch('/api/admin/demo/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMessage('Fresh 7-day demo dataset created across all 6 ZIMOR products.');
        await fetchStatus();
        window.location.reload();
      } else {
        alert(data.error || 'Failed to seed demo data');
      }
    } catch (err: any) {
      alert(err.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  };

  if (!status) return null;

  if (!status.isDemoActive) {
    return (
      <div
        className={`mb-6 p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
          isDark
            ? 'bg-[#1E1C1A] border-[#36312C] text-[#B4B4B4]'
            : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#5A534E]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Database className="w-4 h-4 text-[#B44220] shrink-0" />
          <div>
            <span className="font-semibold text-[#24211F] dark:text-[#E8E1DA]">
              Production Mode Active
            </span>
            <span className="mx-2 opacity-40">•</span>
            <span>Zero temporary demo records. Currently viewing real database activity.</span>
          </div>
        </div>

        <button
          onClick={handleSeed}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B44220] text-white hover:bg-[#96371B] transition-colors font-medium text-[11px] shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{loading ? 'Generating...' : 'Load 7-Day Demo Dataset'}</span>
        </button>
      </div>
    );
  }

  // Calculate days remaining
  let daysRemaining = '7 days';
  if (status.expiresAt) {
    const diffMs = new Date(status.expiresAt).getTime() - Date.now();
    const diffDays = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
    daysRemaining = diffDays === 1 ? '1 day' : `${diffDays} days`;
  }

  return (
    <div
      className={`mb-6 p-4 rounded-xl border transition-all ${
        isDark
          ? 'bg-[#2A231F] border-[#663A26]/50 text-[#E8E1DA]'
          : 'bg-[#FDF6F0] border-[#E2B7A0] text-[#4A382A]'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider uppercase bg-[#B44220] text-white">
              7-Day Demo Dataset Active
            </span>
            <span className="flex items-center gap-1 text-[11px] font-medium opacity-80">
              <Clock className="w-3 h-3" />
              Auto-expires in {daysRemaining}
            </span>
            <span className="opacity-40">•</span>
            <span className="text-[11px] font-mono text-[#B44220] dark:text-[#E07A5F] font-semibold">
              Strictly Isolated (isDemo: true)
            </span>
          </div>

          <p className="text-xs opacity-90 leading-relaxed">
            Loaded <strong>{status.demoCounts.orders} orders</strong>,{' '}
            <strong>{status.demoCounts.customers} test patrons</strong>,{' '}
            <strong>{status.demoCounts.issues} atelier support tickets</strong>, and{' '}
            <strong>{status.demoCounts.inventoryMovements} inventory movements</strong> across all 6
            actual ZIMOR products. Use this sandbox to test all filters, status updates, and
            management controls.
          </p>

          {message && (
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-1 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              {message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 pt-1 lg:pt-0">
          <button
            onClick={handleSeed}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              isDark
                ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA] hover:bg-[#36312C]'
                : 'bg-white border-[#E5DFD7] text-[#24211F] hover:bg-[#FAF7F2]'
            }`}
            title="Reset and regenerate a fresh 7-day dataset"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>

          <button
            onClick={handlePurge}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-xs font-semibold shadow-xs"
            title="Purge all demo records immediately and return to clean production state"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge Demo Dataset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
