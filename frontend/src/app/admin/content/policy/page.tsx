'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Save, Check, X, Lock, ExternalLink, ShieldCheck, FileText } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function AdminContentPolicyPage() {
  const { isDark } = useAdminTheme();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const cardBg = isDark
    ? 'bg-[#24211F] border-[#36312C]'
    : 'bg-[#FFFFFF] border-[#E5DFD7] shadow-xs';
  const inputClass = `w-full rounded px-3 py-2 border transition-colors focus:outline-none focus:border-[#B44220] ${
    isDark
      ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA]'
      : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#24211F]'
  }`;

  useEffect(() => {
    fetchPolicyContent();
  }, []);

  const fetchPolicyContent = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/content/policy');
      const data = await res.json();
      if (data.content && data.content.data) {
        setContent(data.content.data);
      }
    } catch (err) {
      console.error('Failed to load policy content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await apiFetch('/api/content/policy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: content }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Policy content successfully updated!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update policy content.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error saving policy content.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Policy Guidelines CMS</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Shipping terms, 7-day exchange window, craftsmanship warranty, and aftercare rules.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#B44220] hover:bg-[#9B381B] text-[#F7F5F2] text-xs font-semibold uppercase tracking-wider rounded shadow-xs transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>

      {/* Statutory Legal Policies — Protected & Immutable Directive */}
      <div className={`p-4 rounded-lg border ${
        isDark ? 'bg-[#1E1C1A] border-[#36312C]' : 'bg-[#FAF7F2] border-[#E5DFD7]'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#B44220]/15 text-[#B44220] flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#B44220]">
                  Protected Legal Documents (Editing Disabled)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium">
                  Immutable in MongoDB Atlas
                </span>
              </div>
              <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-[#8A837C]' : 'text-[#6E6760]'}`}>
                The <strong>Privacy Policy</strong> and <strong>Terms of Service</strong> are legally protected, immutable documents. Content editing for these documents is strictly disabled across all administrative interfaces.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/privacy-policy"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-[#E5DFD7] dark:border-[#36312C] hover:border-[#B44220] transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Privacy Policy</span>
              <ExternalLink className="w-3 h-3 text-[#8A837C]" />
            </Link>
            <Link
              href="/terms-of-service"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-[#E5DFD7] dark:border-[#36312C] hover:border-[#B44220] transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Terms of Service</span>
              <ExternalLink className="w-3 h-3 text-[#8A837C]" />
            </Link>
          </div>
        </div>
      </div>

      {loading || !content ? (
        <div className={`p-16 text-center text-xs ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>Loading policy content...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Shipping Policy */}
          <div className={`rounded-lg p-5 space-y-4 border ${cardBg}`}>
            <h2 className="text-base font-semibold">Shipping &amp; Transit Guidelines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Domestic Delivery Timeline</label>
                <input
                  type="text"
                  value={content.shipping?.timeline || '3-5 Business Days across Metro Cities'}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      shipping: { ...content.shipping, timeline: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Complimentary Shipping Threshold</label>
                <input
                  type="text"
                  value={content.shipping?.threshold || 'All Prepaid Orders Nationwide'}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      shipping: { ...content.shipping, threshold: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>
            <div className="text-xs">
              <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Shipping Details &amp; Packaging Notes</label>
              <textarea
                rows={4}
                value={content.shipping?.details || ''}
                onChange={(e) =>
                  setContent({
                    ...content,
                    shipping: { ...content.shipping, details: e.target.value },
                  })
                }
                className={inputClass}
              />
            </div>
          </div>

          {/* Returns & Exchange */}
          <div className={`rounded-lg p-5 space-y-4 border ${cardBg}`}>
            <h2 className="text-base font-semibold">7-Day Return &amp; Exchange Window</h2>
            <div className="text-xs">
              <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Return Eligibility Requirements</label>
              <textarea
                rows={4}
                value={content.returns?.policy || ''}
                onChange={(e) =>
                  setContent({
                    ...content,
                    returns: { ...content.returns, policy: e.target.value },
                  })
                }
                className={inputClass}
              />
            </div>
          </div>

          {/* Master Craftsmanship Warranty */}
          <div className={`rounded-lg p-5 space-y-4 border ${cardBg}`}>
            <h2 className="text-base font-semibold">Master Craftsmanship Warranty</h2>
            <div className="text-xs">
              <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>1-Year Hardware &amp; Stitching Warranty</label>
              <textarea
                rows={4}
                value={content.warranty?.details || ''}
                onChange={(e) =>
                  setContent({
                    ...content,
                    warranty: { ...content.warranty, details: e.target.value },
                  })
                }
                className={inputClass}
              />
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
