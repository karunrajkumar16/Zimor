'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';
import {
  Upload,
  Folder,
  Image as ImageIcon,
  Video,
  Copy,
  Trash2,
  Check,
  Search,
  ExternalLink,
  X,
  Server,
} from 'lucide-react';
import { MediaItem } from '@/types';
import { useAdminTheme } from '@/context/AdminThemeContext';

const FOLDERS = [
  'zimor/products',
  'zimor/products/gallery',
  'zimor/products/variants',
  'zimor/homepage/hero',
  'zimor/homepage/lifestyle',
  'zimor/about',
  'zimor/banners',
  'zimor/videos',
];

export default function AdminMediaPage() {
  const { isDark } = useAdminTheme();
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string>('zimor/products');
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cardBg = isDark
    ? 'bg-[#24211F] border-[#36312C]'
    : 'bg-[#FFFFFF] border-[#E5DFD7] shadow-xs';

  useEffect(() => {
    fetchMedia();
  }, [selectedFolder]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/media?folder=${encodeURIComponent(selectedFolder)}`);
      const data = await res.json();
      if (data.media) {
        setMediaList(data.media);
      }
    } catch (err) {
      console.error('Failed to fetch media:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('folder', selectedFolder);

      const res = await apiFetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Media asset uploaded successfully.' });
        fetchMedia();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to upload media.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error uploading file.' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteMedia = async (publicId: string) => {
    if (!confirm('Are you sure you want to delete this media asset?')) return;
    try {
      const res = await apiFetch(`/api/media?publicId=${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Media asset deleted.' });
        fetchMedia();
      } else {
        setMessage({ type: 'error', text: 'Failed to delete asset.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error deleting asset.' });
    }
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Media Asset Vault</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Centralized Cloudinary & Local development media repository for products, banners, and campaign reels.
          </p>
        </div>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,video/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#B44220] hover:bg-[#9B381B] text-[#F7F5F2] text-xs font-semibold uppercase tracking-wider rounded shadow-xs transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload Asset'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded text-xs flex items-center justify-between border ${message.type === 'success'
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

      {/* Cloudinary Folder Structure Navigation */}
      <div className={`p-4 rounded-lg border ${cardBg}`}>
        <p className={`text-[10px] uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'
          }`}>
          <Folder className="w-3.5 h-3.5 text-[#B44220]" />
          <span>Cloudinary Storage Hierarchy</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {FOLDERS.map((folder) => {
            const isActive = selectedFolder === folder;
            return (
              <button
                key={folder}
                onClick={() => setSelectedFolder(folder)}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-colors border ${isActive
                  ? 'bg-[#B44220] text-[#F7F5F2] border-[#B44220] font-medium shadow-xs'
                  : isDark
                    ? 'bg-[#1E1C1A] text-[#B4B4B4] border-[#36312C] hover:border-[#B44220]'
                    : 'bg-[#FAF7F2] text-[#5A534E] border-[#E5DFD7] hover:border-[#B44220]'
                  }`}
              >
                {folder}/
              </button>
            );
          })}
        </div>
      </div>

      {/* Media Grid */}
      <div className={`rounded-lg p-5 border ${cardBg}`}>
        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Current Directory: <span className="font-mono text-[#B44220] dark:text-[#E07A5F]">{selectedFolder}/</span> ({mediaList.length} items)
          </span>
        </div>

        {loading ? (
          <div className={`p-12 text-center text-xs ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>Loading media library...</div>
        ) : mediaList.length === 0 ? (
          <div className={`p-16 text-center text-xs space-y-2 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
            <ImageIcon className="w-8 h-8 text-[#B44220] mx-auto mb-2 opacity-60" />
            <p>No media found in {selectedFolder}/</p>
            <p className="opacity-70">Click &ldquo;Upload Asset&rdquo; above to add images or reels.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mediaList.map((item) => (
              <div
                key={item.id}
                className={`group rounded overflow-hidden flex flex-col justify-between border transition-all ${isDark
                  ? 'bg-[#1E1C1A] border-[#36312C] hover:border-[#B44220]'
                  : 'bg-[#FAF7F2] border-[#E5DFD7] hover:border-[#B44220]'
                  }`}
              >
                <div className="relative aspect-square w-full overflow-hidden flex items-center justify-center bg-black/10">
                  {item.mimeType.startsWith('video') ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#B44220]">
                      <Video className="w-8 h-8 mb-1" />
                      <span className="text-[10px] uppercase font-mono">{item.mimeType.split('/')[1]}</span>
                    </div>
                  ) : (
                    <Image
                      src={item.url}
                      alt={item.alt || item.filename}
                      fill
                      sizes="200px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>

                <div className="p-2.5 space-y-1.5">
                  <p className={`text-[11px] font-mono truncate ${isDark ? 'text-[#E8E1DA]' : 'text-[#24211F]'}`} title={item.filename}>
                    {item.filename}
                  </p>
                  <p className={`text-[10px] ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                    {item.mimeType} {item.width ? `• ${item.width}×${item.height}` : ''}
                  </p>

                  <div className={`flex items-center justify-between pt-1 border-t ${isDark ? 'border-[#36312C]' : 'border-[#E5DFD7]'
                    }`}>
                    <button
                      onClick={() => handleCopy(item.url, item.id)}
                      className={`p-1 inline-flex items-center gap-1 text-[10px] transition-colors ${isDark ? 'text-[#B4B4B4] hover:text-[#E8E1DA]' : 'text-[#5A534E] hover:text-[#24211F]'
                        }`}
                      title="Copy URL"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-[#2E7D5A] dark:text-[#52B788]" />
                          <span className="text-[#2E7D5A] dark:text-[#52B788]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteMedia(item.id)}
                      className={`p-1 transition-colors ${isDark ? 'text-[#8A837C] hover:text-[#B9382C]' : 'text-[#8C837A] hover:text-[#B9382C]'}`}
                      title="Delete Asset"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
