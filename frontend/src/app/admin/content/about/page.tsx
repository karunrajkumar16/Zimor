'use client';

import React, { useState, useEffect } from 'react';
import { Save, Check, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAdminTheme } from '@/context/AdminThemeContext';

export default function AdminContentAboutPage() {
  const { isDark } = useAdminTheme();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const cardBg = isDark
    ? 'bg-[#24211F] border-[#36312C]'
    : 'bg-[#FFFFFF] border-[#E5DFD7] shadow-xs';
  const innerCardBg = isDark
    ? 'bg-[#1E1C1A] border-[#36312C]'
    : 'bg-[#FAF7F2] border-[#E5DFD7]';
  const inputClass = `w-full rounded px-3 py-2 border transition-colors focus:outline-none focus:border-[#B44220] ${
    isDark
      ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA]'
      : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#24211F]'
  }`;

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/content/about');
      const data = await res.json();
      if (data.content && data.content.data) {
        setContent(data.content.data);
      }
    } catch (err) {
      console.error('Failed to load about content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await apiFetch('/api/content/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: content }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'About Us page content successfully saved!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to update about content.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error saving content.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">About Us CMS</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Brand Story, Vision, Mission, and the 7 Verbatim Brand Values.
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

      {message && (
        <div
          className={`p-3 rounded text-xs flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-[#2E7D5A]/15 border-[#2E7D5A]/30 text-[#2E7D5A] dark:text-[#52B788]'
              : 'bg-[#B9382C]/15 border-[#B9382C]/30 text-[#B9382C] dark:text-[#F28B82]'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {loading || !content ? (
        <div className={`p-16 text-center text-xs ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>Loading about content...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Brand Story */}
          <div className={`rounded-lg p-5 space-y-4 border ${cardBg}`}>
            <h2 className="text-base font-semibold">Brand Story</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Headline</label>
                <input
                  type="text"
                  value={content.story?.title || ''}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      story: { ...content.story, title: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Subheadline</label>
                <input
                  type="text"
                  value={content.story?.subtitle || ''}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      story: { ...content.story, subtitle: e.target.value },
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>
            <div className="text-xs">
              <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Story Narrative (Paragraphs separated by new lines)</label>
              <textarea
                rows={5}
                value={
                  Array.isArray(content.story?.paragraphs)
                    ? content.story.paragraphs.join('\n\n')
                    : content.story?.paragraphs || ''
                }
                onChange={(e) =>
                  setContent({
                    ...content,
                    story: {
                      ...content.story,
                      paragraphs: e.target.value.split('\n\n'),
                    },
                  })
                }
                className={`${inputClass} font-mono text-[11px]`}
              />
            </div>
          </div>

          {/* Vision & Mission */}
          <div className={`rounded-lg p-5 space-y-4 border ${cardBg}`}>
            <h2 className="text-base font-semibold">Vision & Mission</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Brand Vision Statement</label>
                <textarea
                  rows={4}
                  value={content.vision || ''}
                  onChange={(e) => setContent({ ...content, vision: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Brand Mission Statement</label>
                <textarea
                  rows={4}
                  value={content.mission || ''}
                  onChange={(e) => setContent({ ...content, mission: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* 7 Brand Values */}
          <div className={`rounded-lg p-5 space-y-4 border ${cardBg}`}>
            <h2 className="text-base font-semibold">The 7 Brand Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {content.values?.map((val: any, idx: number) => (
                <div key={idx} className={`rounded p-3 space-y-2 border ${innerCardBg}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#B44220] dark:text-[#E07A5F]">Value {val.number}: {val.title}</span>
                  </div>
                  <input
                    type="text"
                    value={val.title}
                    onChange={(e) => {
                      const updated = [...content.values];
                      updated[idx].title = e.target.value;
                      setContent({ ...content, values: updated });
                    }}
                    placeholder="Title"
                    className={inputClass}
                  />
                  <textarea
                    rows={2}
                    value={val.description}
                    onChange={(e) => {
                      const updated = [...content.values];
                      updated[idx].description = e.target.value;
                      setContent({ ...content, values: updated });
                    }}
                    placeholder="Description"
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
