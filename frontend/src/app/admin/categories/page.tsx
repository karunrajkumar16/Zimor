'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Tag, Package } from 'lucide-react';
import { Category } from '@/types';
import { apiFetch } from '@/lib/api';

import { useAdminTheme } from '@/context/AdminThemeContext';

export default function AdminCategoriesPage() {
  const { isDark } = useAdminTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Partial<Category> | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const cardBg = isDark
    ? 'bg-[#24211F] border-[#36312C]'
    : 'bg-[#FFFFFF] border-[#E5DFD7] shadow-xs';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/categories');
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditCategory({
      name: '',
      slug: '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditCategory(JSON.parse(JSON.stringify(cat)));
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      const res = await apiFetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: `Category "${name}" deleted.` });
        fetchCategories();
      } else {
        setMessage({ type: 'error', text: 'Failed to delete category.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error deleting category.' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory) return;
    setSaving(true);
    setMessage(null);

    try {
      const isNew = !editCategory.id;
      const url = isNew ? '/api/categories' : `/api/categories/${editCategory.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCategory),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Category ${isNew ? 'created' : 'updated'} successfully.` });
        setIsModalOpen(false);
        fetchCategories();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to save category.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error saving category.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Category Architecture</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Organize collections, silhouettes, and catalog hierarchies for navigation.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#B44220] hover:bg-[#9B381B] text-[#F7F5F2] text-xs font-semibold uppercase tracking-wider rounded shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className={`col-span-3 p-12 text-center text-xs ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className={`col-span-3 p-12 text-center text-xs ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
            No categories created yet.
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className={`rounded-lg p-5 flex flex-col justify-between border transition-colors ${cardBg}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded flex items-center justify-center border ${
                    isDark ? 'bg-[#1E1C1A] border-[#36312C] text-[#B44220]' : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#B44220]'
                  }`}>
                    <Tag className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className={`p-1.5 rounded transition-colors ${
                        isDark ? 'hover:bg-[#1E1C1A] text-[#B4B4B4] hover:text-[#E8E1DA]' : 'hover:bg-[#FAF7F2] text-[#5A534E] hover:text-[#24211F]'
                      }`}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className={`p-1.5 rounded transition-colors ${
                        isDark ? 'hover:bg-[#B9382C]/15 text-[#8A837C] hover:text-[#F28B82]' : 'hover:bg-[#B9382C]/10 text-[#8C837A] hover:text-[#B9382C]'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-base">{cat.name}</h3>
                <p className={`text-[11px] font-mono mt-0.5 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>/{cat.slug}</p>
                <p className={`text-xs mt-3 line-clamp-2 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className={`mt-5 pt-3 border-t flex items-center justify-between text-[11px] ${
                isDark ? 'border-[#36312C] text-[#8A837C]' : 'border-[#E5DFD7] text-[#8C837A]'
              }`}>
                <span>Created {new Date(cat.createdAt).toLocaleDateString()}</span>
                <span className="text-[#2E7D5A] dark:text-[#52B788] font-medium">Active</span>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && editCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`rounded-lg max-w-md w-full p-6 space-y-4 border shadow-2xl ${
            isDark ? 'bg-[#24211F] border-[#36312C] text-[#E8E1DA]' : 'bg-[#FFFFFF] border-[#E5DFD7] text-[#24211F]'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDark ? 'border-[#36312C]' : 'border-[#E5DFD7]'
            }`}>
              <h2 className="text-base font-semibold">
                {editCategory.id ? 'Edit Category' : 'New Category'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className={`transition-colors ${
                isDark ? 'text-[#8A837C] hover:text-[#E8E1DA]' : 'text-[#8C837A] hover:text-[#24211F]'
              }`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Category Name *</label>
                <input
                  type="text"
                  required
                  value={editCategory.name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    setEditCategory({
                      ...editCategory,
                      name,
                      slug: editCategory.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    });
                  }}
                  className={`w-full rounded px-3 py-2 border focus:outline-none focus:border-[#B44220] transition-colors ${
                    isDark
                      ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA]'
                      : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#24211F]'
                  }`}
                />
              </div>

              <div>
                <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Slug *</label>
                <input
                  type="text"
                  required
                  value={editCategory.slug || ''}
                  onChange={(e) => setEditCategory({ ...editCategory, slug: e.target.value })}
                  className={`w-full rounded px-3 py-2 border focus:outline-none focus:border-[#B44220] transition-colors ${
                    isDark
                      ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA]'
                      : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#24211F]'
                  }`}
                />
              </div>

              <div>
                <label className={`block mb-1 font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Description</label>
                <textarea
                  rows={3}
                  value={editCategory.description || ''}
                  onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
                  className={`w-full rounded px-3 py-2 border focus:outline-none focus:border-[#B44220] transition-colors ${
                    isDark
                      ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA]'
                      : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#24211F]'
                  }`}
                />
              </div>

              <div className={`flex items-center justify-end gap-3 pt-3 border-t ${
                isDark ? 'border-[#36312C]' : 'border-[#E5DFD7]'
              }`}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-3 py-1.5 border rounded transition-colors ${
                    isDark
                      ? 'border-[#36312C] text-[#B4B4B4] hover:text-[#E8E1DA]'
                      : 'border-[#E5DFD7] text-[#5A534E] hover:text-[#24211F]'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-[#B44220] hover:bg-[#9B381B] text-[#F7F5F2] font-semibold rounded shadow-xs transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
