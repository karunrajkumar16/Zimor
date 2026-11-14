'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, ArrowRight } from 'lucide-react';
import { FAQS } from '@/data/faqs';

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory =
      selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-canvas min-h-screen py-10 sm:py-16 border-b border-line">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <nav className="text-[11px] text-ink-muted uppercase tracking-wider flex items-center gap-2">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <span className="text-ink font-semibold">Help & FAQs</span>
        </nav>

        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest text-brand-700 font-bold">
            Frequently Asked Questions
          </span>
          <h1 className="font-serif text-[34px] sm:text-[46px] lg:text-[52px] font-normal text-ink tracking-tight leading-tight">
            How Can We Assist You?
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary max-w-lg mx-auto">
            Everything you need to know about laptop dimensions, materials, care, free shipping across India, and 7-day returns.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
          <input
            type="text"
            placeholder="Search questions (e.g. laptop, waterproof, COD, returns)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-canvas-card border border-line rounded text-xs text-ink focus:outline-none focus:border-ink shadow-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {['all', 'Products & Sizing', 'Materials & Care', 'Shipping & Delivery', 'Returns & Refunds'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-ink text-white'
                  : 'bg-canvas-card border border-line text-ink-secondary hover:text-ink'
              }`}
            >
              {cat === 'all' ? 'All Questions' : cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-canvas-card border border-line rounded-lg overflow-hidden transition-colors shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-semibold text-xs sm:text-sm text-ink hover:bg-canvas-alt/40 transition-colors"
                  >
                    <span className="pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-ink-muted shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-brand-700' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-4 sm:p-5 pt-0 border-t border-line/50 text-xs text-ink-secondary leading-relaxed animate-in fade-in duration-150">
                      <p>{faq.answer}</p>
                      <span className="inline-block mt-3 text-[10px] text-brand-700 font-bold uppercase tracking-wider">
                        Category: {faq.category}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-canvas-card rounded border border-line">
              <p className="text-xs text-ink-muted">No questions found matching your query.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="mt-2 text-xs font-semibold text-brand-700 underline"
              >
                Reset Search
              </button>
            </div>
          )}
        </div>

        {/* Still Have Questions Banner */}
        <div className="p-6 bg-brand-50 border border-brand-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h3 className="text-sm font-bold text-brand-950">Still Have Questions?</h3>
            <p className="text-xs text-brand-800 mt-0.5">
              Our concierge team is available Mon–Sat to help you choose the right workbag.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold uppercase tracking-wider py-2.5 px-5 rounded transition-colors shrink-0"
          >
            <span>Contact Support</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

