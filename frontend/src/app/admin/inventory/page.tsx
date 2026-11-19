'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Boxes,
  Plus,
  Minus,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Save,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAdminTheme } from '@/context/AdminThemeContext';
import type { Product } from '@/types';

export default function AdminInventoryPage() {
  const { isDark } = useAdminTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockChanges, setStockChanges] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/products');
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
        const map: Record<string, number> = {};
        data.products.forEach((p: Product) => {
          map[p.id] = p.stock ?? 0;
        });
        setStockChanges(map);
      }
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const adjustStock = (productId: string, delta: number) => {
    const current = stockChanges[productId] ?? 0;
    const next = Math.max(0, current + delta);
    setStockChanges({ ...stockChanges, [productId]: next });
  };

  const handleSaveStock = async (productId: string) => {
    setSavingId(productId);
    const newStock = stockChanges[productId] ?? 0;
    try {
      const res = await apiFetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        setMessage('Stock level updated successfully!');
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
        );
        setTimeout(() => setMessage(null), 2500);
      }
    } catch (err) {
      console.error('Failed to update stock', err);
    } finally {
      setSavingId(null);
    }
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q);
  });

  const lowStockCount = products.filter((p) => (stockChanges[p.id] ?? p.stock ?? 0) <= 5 && (stockChanges[p.id] ?? p.stock ?? 0) > 0).length;
  const outOfStockCount = products.filter((p) => (stockChanges[p.id] ?? p.stock ?? 0) === 0).length;
  const inStockCount = products.filter((p) => (stockChanges[p.id] ?? p.stock ?? 0) > 5).length;

  const cardBg = isDark
    ? 'bg-[#24211F] border-[#36312C]'
    : 'bg-[#FFFFFF] border-[#E5DFD7] shadow-xs';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#24211F] dark:text-[#E8E1DA]">Live Inventory Units</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Real-time atelier warehouse stock levels with instant increment/decrement controls.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          disabled={loading}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold border transition-all ${
            isDark
              ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA] hover:border-[#8A837C]'
              : 'bg-[#FFFFFF] border-[#E5DFD7] text-[#24211F] hover:bg-[#FAF7F2]'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Alert banner if saved */}
      {message && (
        <div className="p-3 bg-[#2E7D5A]/10 border border-[#2E7D5A]/25 text-[#25684A] dark:bg-[#2E7D5A]/15 dark:text-[#62C697] text-xs rounded font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg border ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
              Healthy Stock
            </span>
            <CheckCircle className="w-4 h-4 text-[#2E7D5A] dark:text-[#62C697]" />
          </div>
          <p className="text-2xl font-bold mt-1 text-[#2E7D5A] dark:text-[#62C697]">
            {inStockCount} Silhouettes
          </p>
          <p className="text-[10px] text-[#8C837A] dark:text-[#8A837C] mt-1">Stock level &gt; 5 units</p>
        </div>

        <div className={`p-4 rounded-lg border ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
              Low Stock Alert
            </span>
            <AlertTriangle className="w-4 h-4 text-[#C07D2B] dark:text-[#F0B265]" />
          </div>
          <p className="text-2xl font-bold mt-1 text-[#C07D2B] dark:text-[#F0B265]">
            {lowStockCount} Silhouettes
          </p>
          <p className="text-[10px] text-[#8C837A] dark:text-[#8A837C] mt-1">Threshold: 1–5 units remaining</p>
        </div>

        <div className={`p-4 rounded-lg border ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
              Sold Out / Zero Stock
            </span>
            <XCircle className="w-4 h-4 text-[#B9382C] dark:text-[#F28B82]" />
          </div>
          <p className="text-2xl font-bold mt-1 text-[#B9382C] dark:text-[#F28B82]">
            {outOfStockCount} Silhouettes
          </p>
          <p className="text-[10px] text-[#8C837A] dark:text-[#8A837C] mt-1">Requires factory batch reorder</p>
        </div>
      </div>

      {/* Inventory Matrix Table */}
      <div className={`rounded-lg border overflow-hidden ${cardBg}`}>
        {/* Search */}
        <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-[#36312C]' : 'border-[#E5DFD7]'}`}>
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-[#8C837A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by silhouette name..."
              className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] dark:bg-[#1E1C1A] border border-[#E5DFD7] dark:border-[#36312C] rounded text-xs text-[#24211F] dark:text-[#E8E1DA] focus:outline-none focus:border-[#B44220]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr
                className={`border-b font-medium uppercase tracking-wider text-[10px] ${
                  isDark
                    ? 'border-[#36312C] bg-[#1E1C1A] text-[#B4B4B4]'
                    : 'border-[#E5DFD7] bg-[#EEE8DF] text-[#5A534E]'
                }`}
              >
                <th className="py-3 px-4">Silhouette</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Colors</th>
                <th className="py-3 px-4 text-center">Unit Adjustment</th>
                <th className="py-3 px-4">Health Status</th>
                <th className="py-3 px-4 text-right">Commit Changes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DFD7] dark:divide-[#36312C]">
              {filtered.map((prod) => {
                const currentVal = stockChanges[prod.id] ?? prod.stock ?? 0;
                const isDirty = currentVal !== prod.stock;
                const isZero = currentVal === 0;
                const isLow = currentVal > 0 && currentVal <= 5;

                return (
                  <tr
                    key={prod.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden border border-slate-200 dark:border-neutral-700 shrink-0">
                          <Image
                            src={prod.images?.[0]?.url || 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp'}
                            alt={prod.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {prod.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            SKU: {prod.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-neutral-300 font-medium">
                      {prod.categoryLabel || prod.category}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {prod.colors?.map((col, i) => (
                          <span
                            key={i}
                            title={col.name}
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: col.hex }}
                          />
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => adjustStock(prod.id, -1)}
                          disabled={currentVal <= 0}
                          className="w-7 h-7 rounded border flex items-center justify-center hover:border-[#B44220] hover:text-[#B44220] hover:bg-[#B44220]/5 disabled:opacity-30 border-slate-300 dark:border-neutral-700 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <input
                          type="number"
                          value={currentVal}
                          onChange={(e) =>
                            setStockChanges({
                              ...stockChanges,
                              [prod.id]: Math.max(0, parseInt(e.target.value) || 0),
                            })
                          }
                          className="w-14 text-center py-1 font-bold font-mono rounded border border-[#E5DFD7] dark:border-[#36312C] bg-[#FAF7F2] dark:bg-[#1E1C1A] text-xs text-[#24211F] dark:text-[#E8E1DA] focus:outline-none focus:border-[#B44220]"
                        />

                        <button
                          type="button"
                          onClick={() => adjustStock(prod.id, 1)}
                          className="w-7 h-7 rounded border flex items-center justify-center hover:border-[#B44220] hover:text-[#B44220] hover:bg-[#B44220]/5 border-[#E5DFD7] dark:border-[#36312C] text-[#24211F] dark:text-[#E8E1DA] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {isZero ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#B9382C]/10 text-[#9C281D] dark:bg-[#B9382C]/15 dark:text-[#F28B82] border border-[#B9382C]/25">
                          Sold Out
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#C07D2B]/10 text-[#9C611B] dark:bg-[#C07D2B]/15 dark:text-[#F0B265] border border-[#C07D2B]/25">
                          Low Stock ({currentVal} left)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#2E7D5A]/10 text-[#25684A] dark:bg-[#2E7D5A]/15 dark:text-[#62C697] border border-[#2E7D5A]/25">
                          Optimal ({currentVal} units)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleSaveStock(prod.id)}
                        disabled={!isDirty || savingId === prod.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                          isDirty
                            ? 'bg-[#B44220] hover:bg-[#9B381B] text-[#F7F5F2] shadow-xs'
                            : 'bg-[#FAF7F2] dark:bg-[#1E1C1A] border border-[#E5DFD7] dark:border-[#36312C] text-[#8C837A] dark:text-[#8A837C] opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <Save className="w-3 h-3" />
                        <span>{savingId === prod.id ? 'Updating...' : 'Save'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
