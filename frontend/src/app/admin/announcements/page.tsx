'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Save,
  Check,
  X,
  Eye,
  Sparkles,
  Link as LinkIcon,
  Plus,
  Trash2,
  Sliders,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAdminTheme } from '@/context/AdminThemeContext';

interface AnnouncementItem {
  id: string;
  text: string;
  link?: string;
  badge?: string;
}

export default function AdminAnnouncementsPage() {
  const { isDark } = useAdminTheme();
  const [enabled, setEnabled] = useState(true);
  const [items, setItems] = useState<AnnouncementItem[]>([
    {
      id: 'ann-1',
      text: '10% Off Your First Order with Code FIRST10',
      badge: 'FIRST10',
      link: '/shop',
    },
    {
      id: 'ann-2',
      text: 'Complimentary Express Air Shipping Across India on All Orders',
      badge: 'SHIPPING',
      link: '/shop',
    },
    {
      id: 'ann-3',
      text: 'Discover the Permanent Atelier Collection: Engineered for 15.6" Laptops',
      badge: 'COLLECTION',
      link: '/shop?category=tote-bags',
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newItemText, setNewItemText] = useState('');
  const [newItemBadge, setNewItemBadge] = useState('');
  const [newItemLink, setNewItemLink] = useState('/shop');

  const fetchAnnouncements = async () => {
    try {
      const res = await apiFetch('/api/content/announcements');
      const data = await res.json();
      if (data.content?.data?.items?.length) {
        setItems(data.content.data.items);
        setEnabled(data.content.data.enabled ?? true);
      }
    } catch (err) {
      console.error('Failed to load announcements', err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await apiFetch('/api/content/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            enabled,
            items,
          },
        }),
      });

      if (res.ok) {
        setMessage({
          type: 'success',
          text: 'Top announcement bar updated and published to the live storefront!',
        });
      } else {
        throw new Error('Failed to update announcements');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error updating announcements' });
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    if (!newItemText.trim()) return;
    const item: AnnouncementItem = {
      id: `ann-${Date.now()}`,
      text: newItemText.trim(),
      badge: newItemBadge.trim() || undefined,
      link: newItemLink.trim() || '/shop',
    };
    setItems([...items, item]);
    setNewItemText('');
    setNewItemBadge('');
    setNewItemLink('/shop');
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const cardBg = isDark
    ? 'bg-[#24211F] border-[#36312C]'
    : 'bg-[#FFFFFF] border-[#E5DFD7] shadow-xs';

  const inputClass = isDark
    ? 'w-full px-3 py-2 bg-[#1E1C1A] border border-[#36312C] rounded text-xs text-[#E8E1DA] placeholder-[#78726C] focus:outline-none focus:border-[#B44220]'
    : 'w-full px-3 py-2 bg-[#FAF7F2] border border-[#E5DFD7] rounded text-xs text-[#24211F] placeholder-[#8C837A] focus:outline-none focus:border-[#B44220] focus:bg-[#FFFFFF]';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#24211F] dark:text-[#E8E1DA]">Announcement Bar Manager</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Manage the scrolling top marquee messages, promo codes, and special notices visible to all store visitors.
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-[#B44220] hover:bg-[#9B381B] text-[#F7F5F2] shadow-xs disabled:opacity-50 transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Publishing...' : 'Publish to Storefront'}</span>
        </button>
      </div>

      {/* Notification Banner */}
      {message && (
        <div
          className={`p-3.5 rounded-md text-xs flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Live Storefront Preview */}
      <div className={`p-5 rounded-lg border ${cardBg} space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold">Live Storefront Top Bar Preview</h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {enabled ? 'Status: Active on Storefront' : 'Status: Disabled'}
          </span>
        </div>

        {/* Live Visual Marquee Preview */}
        <div className="w-full bg-black text-white py-2 px-4 rounded overflow-hidden text-center text-xs tracking-wider font-medium">
          {enabled && items.length > 0 ? (
            <div className="flex items-center justify-center gap-6 overflow-hidden whitespace-nowrap">
              {items.map((it, idx) => (
                <span key={idx} className="inline-flex items-center gap-2">
                  <span className="text-[10px] font-bold opacity-60">•</span>
                  <span>{it.text}</span>
                  {it.badge && (
                    <span className="px-1.5 py-0.5 rounded bg-white text-black text-[9px] font-bold">
                      {it.badge}
                    </span>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-neutral-500 italic text-[11px]">
              Announcement bar is currently toggled OFF.
            </span>
          )}
        </div>
      </div>

      {/* Settings & Active Announcements List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Messages List */}
        <div className={`lg:col-span-7 rounded-lg border ${cardBg} p-5 space-y-4`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-[#222428]">
            <h2 className="text-sm font-bold">Active Marquee Announcements ({items.length})</h2>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-black focus:ring-0"
              />
              <span>Enable Announcement Bar</span>
            </label>
          </div>

          <div className="space-y-3">
            {items.map((it, idx) => (
              <div
                key={it.id || idx}
                className="flex items-center justify-between gap-3 p-3 rounded-md border border-[#E5DFD7] dark:border-[#36312C] bg-[#FAF7F2] dark:bg-[#1E1C1A] text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#8C837A] dark:text-[#8A837C]">#{idx + 1}</span>
                    <p className="font-semibold truncate text-[#24211F] dark:text-[#E8E1DA]">{it.text}</p>
                    {it.badge && (
                      <span className="px-1.5 py-0.5 rounded bg-[#B44220]/15 text-[#B44220] dark:text-[#E07A5F] border border-[#B44220]/25 text-[9px] font-bold shrink-0">
                        {it.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#8C837A] dark:text-[#8A837C] mt-0.5">Link: {it.link || '/shop'}</p>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(it.id)}
                  title="Remove message"
                  className="p-1.5 rounded text-[#8C837A] hover:text-[#9C281D] dark:hover:text-[#F28B82] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Add New Announcement */}
        <div className={`lg:col-span-5 rounded-lg border ${cardBg} p-5 space-y-4`}>
          <div className="border-b pb-3 border-slate-100 dark:border-[#222428]">
            <h2 className="text-sm font-bold">Add New Announcement</h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Add promo discounts, shipping offers, or event updates
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">Message Text *</label>
              <textarea
                rows={2}
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="e.g. Complimentary Luxury Dust Bag with Every Delo Tote"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Coupon Badge</label>
                <input
                  type="text"
                  value={newItemBadge}
                  onChange={(e) => setNewItemBadge(e.target.value)}
                  placeholder="e.g. DELO10"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Destination URL</label>
                <input
                  type="text"
                  value={newItemLink}
                  onChange={(e) => setNewItemLink(e.target.value)}
                  placeholder="/shop"
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="w-full py-2.5 rounded text-xs font-semibold bg-[#B44220] hover:bg-[#963518] text-white shadow-xs transition-colors mt-2 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Announcement Bar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
