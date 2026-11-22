'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Save,
  Check,
  X,
  Eye,
  Plus,
  Trash2,
  Edit2,
  ToggleLeft,
  ToggleRight,
  GripVertical,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAdminTheme } from '@/context/AdminThemeContext';

export interface AnnouncementItem {
  id: string;
  text: string;
  link?: string;
  badge?: string;
  enabled?: boolean;
}

export default function AdminAnnouncementsPage() {
  const { isDark } = useAdminTheme();
  const [enabled, setEnabled] = useState(true);
  const [items, setItems] = useState<AnnouncementItem[]>([
    {
      id: 'ann-1',
      text: '10% Off Your First Order.',
      badge: '',
      link: '/shop',
      enabled: true,
    },
    {
      id: 'ann-2',
      text: 'Complimentary Shipping on Every Order.',
      badge: '',
      link: '/policy',
      enabled: true,
    },
    {
      id: 'ann-3',
      text: 'Discover the Latest Collection.',
      badge: '',
      link: '/shop',
      enabled: true,
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // New item form
  const [newItemText, setNewItemText] = useState('');
  const [newItemLink, setNewItemLink] = useState('/shop');
  const [newItemBadge, setNewItemBadge] = useState('');
  const [newItemEnabled, setNewItemEnabled] = useState(true);

  // Editing item modal state
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);

  const fetchAnnouncements = async () => {
    try {
      const res = await apiFetch('/api/content/announcements');
      if (res.ok) {
        const data = await res.json();
        if (data.content?.data) {
          if (typeof data.content.data.enabled === 'boolean') {
            setEnabled(data.content.data.enabled);
          }
          if (Array.isArray(data.content.data.items) && data.content.data.items.length > 0) {
            setItems(
              data.content.data.items.map((it: any, idx: number) => ({
                id: it.id || `ann-${idx + 1}`,
                text: it.text || '',
                link: it.link || it.href || '/shop',
                badge: it.badge || '',
                enabled: it.enabled !== false,
              }))
            );
          }
        }
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
      const payload = {
        data: {
          enabled,
          items: items.map((it) => ({
            id: it.id,
            text: it.text.trim(),
            link: it.link?.trim() || '/shop',
            badge: it.badge?.trim() || undefined,
            enabled: it.enabled !== false,
          })),
        },
      };

      const res = await apiFetch('/api/content/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage({
          type: 'success',
          text: 'Announcement bar order and contents saved persistently to MongoDB and published!',
        });
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to update announcements');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error updating announcements' });
    } finally {
      setSaving(false);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    // Optional cleanup
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...items];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);

    setItems(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const addItem = () => {
    if (!newItemText.trim()) return;
    const item: AnnouncementItem = {
      id: `ann-${Date.now()}`,
      text: newItemText.trim(),
      link: newItemLink.trim() || '/shop',
      badge: newItemBadge.trim() || undefined,
      enabled: newItemEnabled,
    };
    setItems([...items, item]);
    setNewItemText('');
    setNewItemBadge('');
    setNewItemLink('/shop');
    setNewItemEnabled(true);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const toggleItemEnabled = (id: string) => {
    setItems(
      items.map((i) => (i.id === id ? { ...i, enabled: i.enabled === false } : i))
    );
  };

  const saveEditedItem = () => {
    if (!editingItem) return;
    setItems(
      items.map((i) =>
        i.id === editingItem.id
          ? {
              ...editingItem,
              text: editingItem.text.trim(),
              badge: editingItem.badge?.trim() || undefined,
              link: editingItem.link?.trim() || '/shop',
            }
          : i
      )
    );
    setEditingItem(null);
  };

  const activeEnabledItems = items.filter((it) => it.enabled !== false);

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
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#24211F] dark:text-[#E8E1DA]">
            Announcement Bar Manager
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Drag and drop messages to rearrange display order. Changes synchronize live to the storefront via MongoDB.
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-[#B44220] hover:bg-[#9B381B] text-[#F7F5F2] shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Publishing to MongoDB...' : 'Save & Publish to Storefront'}</span>
        </button>
      </div>

      {/* Notification Banner */}
      {message && (
        <div
          className={`p-3.5 rounded-md text-xs flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Live Storefront Preview */}
      <div className={`p-5 rounded-lg border ${cardBg} space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#B44220]" />
            <h2 className="text-sm font-bold text-[#24211F] dark:text-[#E8E1DA]">
              Live Storefront Preview
            </h2>
          </div>
          <span className="text-[11px] font-mono font-medium">
            {enabled ? (
              <span className="text-emerald-600 dark:text-emerald-400">● Global Status: Active</span>
            ) : (
              <span className="text-neutral-400">○ Global Status: Disabled</span>
            )}
          </span>
        </div>

        {/* Live Visual Preview matching original storefront design */}
        <div className="w-full bg-[#000000] text-white py-2.5 px-4 rounded border border-[#b4b4b4]/20 text-center text-xs tracking-wide">
          {enabled && activeEnabledItems.length > 0 ? (
            <div className="flex items-center justify-center gap-6 lg:gap-10 overflow-x-auto whitespace-nowrap scrollbar-none text-[11px] lg:text-[12px] font-medium tracking-wide">
              {activeEnabledItems.map((it, idx) => (
                <span key={it.id || idx} className="inline-flex items-center gap-2 text-white/90">
                  <span className="text-[#b4b4b4] text-[9px]">●</span>
                  <span className="font-primary tracking-wide">{it.text}</span>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-neutral-400 italic text-xs">
              {enabled
                ? 'No active announcements enabled. Enable at least one item below.'
                : 'Announcement bar is toggled OFF globally.'}
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Drag-and-Drop List vs Add Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Drag-and-Drop Reordering List */}
        <div className={`lg:col-span-7 rounded-lg border ${cardBg} p-5 space-y-4`}>
          <div className="flex items-center justify-between border-b pb-3 border-[#E5DFD7] dark:border-[#36312C]">
            <div>
              <h2 className="text-sm font-bold text-[#24211F] dark:text-[#E8E1DA]">
                Announcements ({items.length})
              </h2>
              <p className={`text-[11px] ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                Grab the handle <GripVertical className="w-3 h-3 inline text-[#B44220]" /> to drag and reorder.
              </p>
            </div>

            {/* Master Toggle */}
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-[#B44220] focus:ring-0 cursor-pointer"
              />
              <span className="text-[#24211F] dark:text-[#E8E1DA]">Enable Top Bar</span>
            </label>
          </div>

          <div className="space-y-2.5">
            {items.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8C837A] dark:text-[#8A837C]">
                No announcements configured. Add your first message on the right.
              </div>
            ) : (
              items.map((it, idx) => {
                const isItemEnabled = it.enabled !== false;
                const isDragging = draggedIndex === idx;
                const isDragOver = dragOverIndex === idx && draggedIndex !== idx;

                return (
                  <div
                    key={it.id || idx}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between gap-3 p-3.5 rounded-lg border transition-all select-none ${
                      isDragging
                        ? 'opacity-40 border-dashed border-[#B44220] bg-[#B44220]/5 scale-[0.99]'
                        : isDragOver
                        ? 'border-[#B44220] ring-2 ring-[#B44220]/30 bg-[#B44220]/10 scale-[1.01]'
                        : isItemEnabled
                        ? 'border-[#E5DFD7] dark:border-[#36312C] bg-[#FAF7F2] dark:bg-[#1E1C1A]'
                        : 'border-[#E5DFD7]/50 dark:border-[#36312C]/50 bg-neutral-100/50 dark:bg-neutral-900/40 opacity-60'
                    }`}
                  >
                    {/* Drag Handle */}
                    <div
                      className="cursor-grab active:cursor-grabbing p-1.5 -ml-1 text-[#8C837A] hover:text-[#B44220] dark:text-[#8A837C] dark:hover:text-[#E8E1DA] rounded transition-colors"
                      title="Grab and drag to reorder"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Announcement Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] text-[#8C837A] dark:text-[#8A837C]">
                          #{idx + 1}
                        </span>
                        <p className="font-semibold text-xs truncate text-[#24211F] dark:text-[#E8E1DA]">
                          {it.text}
                        </p>
                        {!isItemEnabled && (
                          <span className="px-1.5 py-0.5 rounded bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20 text-[9px] font-semibold uppercase">
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#8C837A] dark:text-[#8A837C] mt-0.5 font-mono">
                        Destination: {it.link || '/shop'}
                      </p>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Enable/Disable Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleItemEnabled(it.id)}
                        title={isItemEnabled ? 'Disable announcement' : 'Enable announcement'}
                        className={`p-1.5 rounded transition-colors cursor-pointer ${
                          isItemEnabled
                            ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                            : 'text-neutral-400 hover:bg-neutral-500/10'
                        }`}
                      >
                        {isItemEnabled ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => setEditingItem({ ...it })}
                        title="Edit announcement"
                        className="p-1.5 rounded hover:bg-[#E5DFD7] dark:hover:bg-[#36312C] text-[#8C837A] hover:text-[#B44220] transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => removeItem(it.id)}
                        title="Delete announcement"
                        className="p-1.5 rounded hover:bg-rose-500/10 text-[#8C837A] hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Add New Announcement */}
        <div className={`lg:col-span-5 rounded-lg border ${cardBg} p-5 space-y-4`}>
          <div className="border-b pb-3 border-[#E5DFD7] dark:border-[#36312C]">
            <h2 className="text-sm font-bold text-[#24211F] dark:text-[#E8E1DA]">
              Add New Announcement
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
              Create messages displayed on the top storefront bar
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-[#24211F] dark:text-[#E8E1DA]">
                Message Text *
              </label>
              <textarea
                rows={2}
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="e.g. Complimentary Luxury Dust Bag with Every Handbag"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#24211F] dark:text-[#E8E1DA]">
                Destination URL
              </label>
              <input
                type="text"
                value={newItemLink}
                onChange={(e) => setNewItemLink(e.target.value)}
                placeholder="/shop"
                className={inputClass}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="newItemActive"
                checked={newItemEnabled}
                onChange={(e) => setNewItemEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-[#B44220] focus:ring-0 cursor-pointer"
              />
              <label
                htmlFor="newItemActive"
                className="font-medium text-xs text-[#24211F] dark:text-[#E8E1DA] cursor-pointer"
              >
                Enable immediately upon creation
              </label>
            </div>

            <button
              type="button"
              onClick={addItem}
              disabled={!newItemText.trim()}
              className="w-full py-2.5 rounded text-xs font-semibold bg-[#B44220] hover:bg-[#963518] text-white shadow-xs transition-colors mt-2 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
              <span>Add Announcement to List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Announcement Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div
            className={`w-full max-w-md p-6 rounded-xl border shadow-2xl space-y-4 ${
              isDark ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA]' : 'bg-[#FFFFFF] border-[#E5DFD7] text-[#24211F]'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-[#E5DFD7] dark:border-[#36312C]">
              <h3 className="font-bold text-sm">Edit Announcement</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Message Text</label>
                <textarea
                  rows={2}
                  value={editingItem.text}
                  onChange={(e) => setEditingItem({ ...editingItem, text: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Destination URL</label>
                <input
                  type="text"
                  value={editingItem.link || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, link: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editItemActive"
                  checked={editingItem.enabled !== false}
                  onChange={(e) => setEditingItem({ ...editingItem, enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-[#B44220] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="editItemActive" className="font-medium text-xs cursor-pointer">
                  Enabled
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2 rounded border border-[#E5DFD7] dark:border-[#36312C] text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEditedItem}
                  disabled={!editingItem.text.trim()}
                  className="flex-1 py-2 rounded bg-[#B44220] hover:bg-[#963518] text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Apply Edits
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
