'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Star,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Filter,
  Eye,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAdminTheme } from '@/context/AdminThemeContext';

interface CustomerReview {
  id: string;
  productName: string;
  productImage: string;
  productSlug: string;
  customerName: string;
  customerEmail: string;
  rating: number; // 1 - 5
  title: string;
  body: string;
  date: string;
  verifiedBuyer: boolean;
  status: 'Approved' | 'Pending' | 'Hidden';
  featured?: boolean;
}

const DEFAULT_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-01',
    productName: 'ZIMOR DELO TOTE',
    productImage: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp',
    productSlug: 'zimor-delo-tote',
    customerName: 'Ananya Sharma',
    customerEmail: 'ananya.s@lawcorp.in',
    rating: 5,
    title: 'The architectural structure holds my 15.6" laptop effortlessly',
    body: 'As a corporate lawyer in Mumbai, finding a structured tote that fits my 15.6" Dell XPS without losing its silhouette was impossible until the Delo Tote. The caramel interior accent and brass hardware feel exceptionally premium.',
    date: 'Nov 12, 2026',
    verifiedBuyer: true,
    status: 'Approved',
    featured: true,
  },
  {
    id: 'rev-02',
    productName: 'ZIMOR RABOTA TOTE',
    productImage: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917831/zimor/products/rabota-1.webp',
    productSlug: 'zimor-rabota-tote',
    customerName: 'Priya Nambiar',
    customerEmail: 'priya.n@techconsulting.com',
    rating: 5,
    title: 'Dual carry versatility makes boardroom transitions seamless',
    body: 'The detachable crossbody sling makes airport terminals a breeze, and unhooking it transforms it into an elegant structured executive tote. The dedicated cosmetic pouch included was a thoughtful touch.',
    date: 'Nov 10, 2026',
    verifiedBuyer: true,
    status: 'Approved',
    featured: true,
  },
  {
    id: 'rev-03',
    productName: 'ZIMOR CLASSIC SHOULDER BAG',
    productImage: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917835/zimor/products/classic-1.webp',
    productSlug: 'zimor-classic-shoulder-bag',
    customerName: 'Kavya Rao',
    customerEmail: 'kavya.rao@design.studio',
    rating: 5,
    title: 'Minimalist crescent contour with luminous gold finish',
    body: 'Understated Parisian silhouette with just the right capacity for Kindle, cardholder, and lipstick. The magnetic closure clicks with reassuring precision.',
    date: 'Nov 08, 2026',
    verifiedBuyer: true,
    status: 'Approved',
    featured: false,
  },
  {
    id: 'rev-04',
    productName: 'ZIMOR DELO TOTE — NOIR',
    productImage: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917830/zimor/products/delo-noir-blur.webp',
    productSlug: 'zimor-delo-tote-noir',
    customerName: 'Meghna Kapoor',
    customerEmail: 'meghna.k@gmail.com',
    rating: 4,
    title: 'Stunning pebbled texture, wish it came with silver hardware too',
    body: 'The pebbled grain is scratch-resistant and cleans with a single soft wipe. Highly recommend for corporate executives.',
    date: 'Nov 05, 2026',
    verifiedBuyer: true,
    status: 'Pending',
    featured: false,
  },
];

export default function AdminReviewsPage() {
  const { isDark } = useAdminTheme();
  const [reviews, setReviews] = useState<CustomerReview[]>(DEFAULT_REVIEWS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');

  const filtered = reviews.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch =
      r.customerName.toLowerCase().includes(q) ||
      r.productName.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.body.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'All' || r.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesRating =
      ratingFilter === 'All' || r.rating.toString() === ratingFilter;
    return matchesSearch && matchesStatus && matchesRating;
  });

  const updateReviewStatus = (id: string, status: CustomerReview['status']) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const toggleFeatured = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, featured: !r.featured } : r))
    );
  };

  const deleteReview = (id: string) => {
    if (!confirm('Are you sure you want to delete this customer review?')) return;
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const approvedCount = reviews.filter((r) => r.status === 'Approved').length;
  const pendingCount = reviews.filter((r) => r.status === 'Pending').length;
  const avgRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)
  ).toFixed(1);

  const cardBg = isDark
    ? 'bg-[#24211F] border-[#36312C]'
    : 'bg-[#FFFFFF] border-[#E5DFD7] shadow-xs';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Customer Reviews Management</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Moderate patron feedback, approve verified buyer reviews, and curate featured PDP testimonials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
            isDark ? 'bg-[#1E1C1A] border-[#36312C] text-[#B4B4B4]' : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#5A534E]'
          }`}>
            Live Reviews: {approvedCount}
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg border ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
              Average Rating
            </span>
            <div className="flex items-center text-[#C07D2B]">
              <Star className="w-4 h-4 fill-[#C07D2B]" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-1">
            {avgRating} <span className={`text-xs font-normal ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>/ 5.0</span>
          </p>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>Based on {reviews.length} patron submissions</p>
        </div>

        <div className={`p-4 rounded-lg border ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
              Published Testimonials
            </span>
            <CheckCircle className="w-4 h-4 text-[#2E7D5A] dark:text-[#52B788]" />
          </div>
          <p className="text-2xl font-bold mt-1 text-[#2E7D5A] dark:text-[#52B788]">
            {approvedCount} Approved
          </p>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>Live across PDP product pages</p>
        </div>

        <div className={`p-4 rounded-lg border ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
              Awaiting Moderation
            </span>
            <Sparkles className="w-4 h-4 text-[#B44220]" />
          </div>
          <p className="text-2xl font-bold mt-1 text-[#C07D2B] dark:text-[#E9A855]">
            {pendingCount} Pending
          </p>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>New reviews pending approval</p>
        </div>
      </div>

      {/* Reviews Table Container */}
      <div className={`rounded-lg border overflow-hidden ${cardBg}`}>
        {/* Search & Filters */}
        <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDark ? 'border-[#36312C]' : 'border-[#E5DFD7]'}`}>
          <div className="relative w-full max-w-md">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patron name, silhouette, review text..."
              className={`w-full pl-9 pr-4 py-2 border rounded text-xs focus:outline-none focus:border-[#B44220] transition-colors ${
                isDark
                  ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA] placeholder-[#8A837C]'
                  : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#24211F] placeholder-[#8C837A]'
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 border rounded text-xs font-semibold focus:outline-none focus:border-[#B44220] transition-colors ${
                isDark
                  ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA]'
                  : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#24211F]'
              }`}
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Hidden">Hidden</option>
            </select>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className={`px-3 py-2 border rounded text-xs font-semibold focus:outline-none focus:border-[#B44220] transition-colors ${
                isDark
                  ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA]'
                  : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#24211F]'
              }`}
            >
              <option value="All">All Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
            </select>
          </div>
        </div>

        {/* Reviews Cards List */}
        <div className={`divide-y ${isDark ? 'divide-[#36312C]' : 'divide-[#E5DFD7]'}`}>
          {filtered.map((rev) => (
            <div
              key={rev.id}
              className={`p-5 transition-colors space-y-3 ${
                isDark ? 'hover:bg-[#2C2825]' : 'hover:bg-[#F3EEE6]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded relative overflow-hidden border shrink-0 ${
                    isDark ? 'bg-[#1E1C1A] border-[#36312C]' : 'bg-[#FAF7F2] border-[#E5DFD7]'
                  }`}>
                    <Image
                      src={rev.productImage || 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp'}
                      alt={rev.productName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs">
                        {rev.productName}
                      </p>
                      <span className={`text-[10px] font-mono ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                        {rev.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center text-[#C07D2B]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating
                                ? 'fill-[#C07D2B] text-[#C07D2B]'
                                : isDark
                                ? 'text-[#36312C]'
                                : 'text-[#E5DFD7]'
                            }`}
                          />
                        ))}
                      </div>

                      <span className={`font-semibold text-xs ${isDark ? 'text-[#E8E1DA]' : 'text-[#24211F]'}`}>
                        {rev.customerName}
                      </span>

                      {rev.verifiedBuyer && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#2E7D5A] dark:text-[#52B788] font-medium">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified Patron</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badges & Quick Action */}
                <div className="flex items-center gap-2 self-start">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${
                      rev.status === 'Approved'
                        ? 'bg-[#2E7D5A]/15 text-[#2E7D5A] dark:text-[#52B788] border-[#2E7D5A]/30'
                        : rev.status === 'Pending'
                        ? 'bg-[#C07D2B]/15 text-[#C07D2B] dark:text-[#E9A855] border-[#C07D2B]/30'
                        : isDark
                        ? 'bg-[#1E1C1A] text-[#B4B4B4] border-[#36312C]'
                        : 'bg-[#EDE7DE] text-[#5A534E] border-[#E5DFD7]'
                    }`}
                  >
                    {rev.status}
                  </span>

                  {rev.featured && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#B44220]/15 text-[#B44220] dark:text-[#E07A5F] border border-[#B44220]/30">
                      Featured PDP
                    </span>
                  )}
                </div>
              </div>

              {/* Review Content */}
              <div className="space-y-1 text-xs">
                <p className="font-bold">
                  "{rev.title}"
                </p>
                <p className={`leading-relaxed ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                  {rev.body}
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs ${
                isDark ? 'border-[#36312C]' : 'border-[#E5DFD7]'
              }`}>
                <div className="flex items-center gap-2">
                  {rev.status !== 'Approved' && (
                    <button
                      onClick={() => updateReviewStatus(rev.id, 'Approved')}
                      className="px-2.5 py-1 rounded bg-[#2E7D5A]/15 hover:bg-[#2E7D5A]/25 border border-[#2E7D5A]/30 text-[#2E7D5A] dark:text-[#52B788] font-semibold text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve Review</span>
                    </button>
                  )}

                  {rev.status !== 'Hidden' && (
                    <button
                      onClick={() => updateReviewStatus(rev.id, 'Hidden')}
                      className={`px-2.5 py-1 rounded font-medium text-[11px] border transition-colors ${
                        isDark
                          ? 'bg-[#1E1C1A] border-[#36312C] text-[#B4B4B4] hover:border-[#B44220]'
                          : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#5A534E] hover:border-[#B44220]'
                      }`}
                    >
                      Hide
                    </button>
                  )}

                  <button
                    onClick={() => toggleFeatured(rev.id)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                      rev.featured
                        ? 'border-[#B44220]/40 bg-[#B44220]/15 text-[#B44220] dark:text-[#E07A5F]'
                        : isDark
                        ? 'border-[#36312C] bg-[#1E1C1A] text-[#B4B4B4] hover:border-[#B44220]'
                        : 'border-[#E5DFD7] bg-[#FAF7F2] text-[#5A534E] hover:border-[#B44220]'
                    }`}
                  >
                    {rev.featured ? 'Unfeature from PDP' : 'Feature on PDP'}
                  </button>
                </div>

                <button
                  onClick={() => deleteReview(rev.id)}
                  title="Delete review"
                  className={`p-1 rounded transition-colors ${isDark ? 'text-[#8A837C] hover:text-[#B9382C]' : 'text-[#8C837A] hover:text-[#B9382C]'}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
