'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Filter,
  DollarSign,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  X,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { apiFetch } from '@/lib/api';
import { useAdminTheme } from '@/context/AdminThemeContext';
import { downloadOrderTaxInvoice } from '@/lib/invoiceDownload';

export interface PaymentRecord {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  amountPaid?: number;
  amountRefunded?: number;
  refundId?: string;
  refundDetails?: string;
  currency?: string;
  method: string;
  gateway: string;
  paymentMode?: string;
  transactionId?: string;
  status: 'Captured' | 'Pending' | 'Refunded';
  date: string;
  rawDate?: string;
  isDemo?: boolean;
  isTest?: boolean;
}

type DateFilterType = 'all' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
type ModeFilterType = 'all' | 'live' | 'test';
type StatusTabType = 'all' | 'unpaid' | 'paid' | 'refunded';

export default function AdminPaymentsPage() {
  const { isDark } = useAdminTheme();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState<StatusTabType>('all');
  const [modeFilter, setModeFilter] = useState<ModeFilterType>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Selection & Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [downloadingInvoices, setDownloadingInvoices] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Pagination state (TailAdmin layout)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const actionMenuRef = useRef<HTMLDivElement | null>(null);
  const filterDropdownRef = useRef<HTMLDivElement | null>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setActionMenuOpenId(null);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/payments');
      const data = await res.json();
      if (data.payments) {
        setPayments(data.payments);
      }
    } catch (err) {
      console.warn('Failed to load transaction records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter payments based on Search, Status, Mode (Live vs Test), and Date Filter
  const filtered = useMemo(() => {
    const now = new Date();

    return payments.filter((p) => {
      // 1. Search Query
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.orderId.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.customerEmail?.toLowerCase().includes(q) ||
        p.method.toLowerCase().includes(q) ||
        (p.transactionId && p.transactionId.toLowerCase().includes(q));

      // 2. Status Tab Filter (Matching TailAdmin Invoices: All Invoices | Paid | Unpaid/Pending | Refunded)
      let matchesStatus = true;
      if (statusTab === 'paid') {
        matchesStatus = p.status === 'Captured';
      } else if (statusTab === 'unpaid') {
        matchesStatus = p.status === 'Pending';
      } else if (statusTab === 'refunded') {
        matchesStatus = p.status === 'Refunded';
      }

      // 3. Test vs Live Mode Separation Filter
      const isTestRecord = Boolean(
        p.isTest ||
          p.isDemo ||
          p.paymentMode === 'test' ||
          p.id.startsWith('TEST-') ||
          p.id.startsWith('DEMO-') ||
          p.gateway.includes('Test')
      );

      let matchesMode = true;
      if (modeFilter === 'live') {
        matchesMode = !isTestRecord;
      } else if (modeFilter === 'test') {
        matchesMode = isTestRecord;
      }

      // 4. Date Filter
      let matchesDate = true;
      const recordDate = p.rawDate ? new Date(p.rawDate) : new Date(p.date);

      if (!isNaN(recordDate.getTime())) {
        if (dateFilter === 'daily') {
          matchesDate =
            recordDate.getFullYear() === now.getFullYear() &&
            recordDate.getMonth() === now.getMonth() &&
            recordDate.getDate() === now.getDate();
        } else if (dateFilter === 'weekly') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = recordDate >= sevenDaysAgo && recordDate <= now;
        } else if (dateFilter === 'monthly') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = recordDate >= thirtyDaysAgo && recordDate <= now;
        } else if (dateFilter === 'yearly') {
          matchesDate = recordDate.getFullYear() === now.getFullYear();
        } else if (dateFilter === 'custom') {
          if (customStartDate) {
            const start = new Date(customStartDate);
            start.setHours(0, 0, 0, 0);
            if (recordDate < start) matchesDate = false;
          }
          if (customEndDate) {
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            if (recordDate > end) matchesDate = false;
          }
        }
      }

      return matchesSearch && matchesStatus && matchesMode && matchesDate;
    });
  }, [payments, search, statusTab, modeFilter, dateFilter, customStartDate, customEndDate]);

  // Financial Metrics matching TailAdmin Overview
  const liveCapturedTotal = useMemo(() => {
    return filtered
      .filter((p) => {
        const isTestRecord = Boolean(
          p.isTest ||
            p.isDemo ||
            p.paymentMode === 'test' ||
            p.id.startsWith('TEST-') ||
            p.id.startsWith('DEMO-') ||
            p.gateway.includes('Test')
        );
        return !isTestRecord && p.status === 'Captured';
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [filtered]);

  const testCapturedTotal = useMemo(() => {
    return filtered
      .filter((p) => {
        const isTestRecord = Boolean(
          p.isTest ||
            p.isDemo ||
            p.paymentMode === 'test' ||
            p.id.startsWith('TEST-') ||
            p.id.startsWith('DEMO-') ||
            p.gateway.includes('Test')
        );
        return isTestRecord && p.status === 'Captured';
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [filtered]);

  const capturedCount = useMemo(() => {
    return filtered.filter((p) => p.status === 'Captured').length;
  }, [filtered]);

  const refundTotal = useMemo(() => {
    return filtered
      .filter((p) => p.status === 'Refunded' || (p.amountRefunded && p.amountRefunded > 0))
      .reduce((sum, p) => sum + (p.amountRefunded || (p.status === 'Refunded' ? p.amount : 0)), 0);
  }, [filtered]);

  // Format Date in TailAdmin style: "August 7, 2028"
  const formatDateTailAdmin = (raw?: string, fallback?: string) => {
    if (!raw && !fallback) return 'N/A';
    const d = raw ? new Date(raw) : new Date(fallback || '');
    if (isNaN(d.getTime())) return fallback || 'N/A';
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Pagination calculation
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const paginatedTransactions = filtered.slice(startIndex, startIndex + itemsPerPage);

  // Selection helpers
  const allCurrentPageSelected =
    paginatedTransactions.length > 0 && paginatedTransactions.every((p) => selectedIds.has(p.id));

  const toggleSelectAllCurrentPage = () => {
    if (allCurrentPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedTransactions.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedTransactions.forEach((p) => next.add(p.id));
        return next;
      });
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Export to Excel (.xlsx) function using SheetJS (xlsx)
  const handleExportExcel = (exportOnlySelected = false) => {
    const recordsToExport = exportOnlySelected
      ? filtered.filter((p) => selectedIds.has(p.id))
      : filtered;

    if (recordsToExport.length === 0) {
      setFeedbackMessage({ type: 'error', text: 'No transaction records to export.' });
      return;
    }

    setExporting(true);
    try {
      const exportData = recordsToExport.map((tx) => {
        const isTestRecord = Boolean(
          tx.isTest ||
            tx.isDemo ||
            tx.paymentMode === 'test' ||
            tx.id.startsWith('TEST-') ||
            tx.id.startsWith('DEMO-') ||
            tx.gateway.includes('Test')
        );

        return {
          'Transaction ID': tx.id,
          'Order ID': tx.orderId,
          'Customer Name': tx.customerName,
          'Customer Email': tx.customerEmail,
          'Created Date': formatDateTailAdmin(tx.rawDate, tx.date),
          'Payment Method': tx.method,
          'Gateway': tx.gateway,
          'Amount (INR)': tx.amount,
          'Status': tx.status,
          'Refund Amount (INR)': tx.amountRefunded || 0,
          'Refund ID': tx.refundId || 'N/A',
          'Refund Details': tx.refundDetails || (tx.status === 'Refunded' ? 'Full Refund' : 'None'),
          'Mode': isTestRecord ? 'TEST MODE' : 'LIVE PRODUCTION',
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      worksheet['!cols'] = [
        { wch: 18 },
        { wch: 20 },
        { wch: 22 },
        { wch: 26 },
        { wch: 18 },
        { wch: 20 },
        { wch: 24 },
        { wch: 14 },
        { wch: 12 },
        { wch: 20 },
        { wch: 20 },
        { wch: 24 },
        { wch: 18 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `ZIMOR_Transactions_${dateStr}.xlsx`;
      XLSX.writeFile(workbook, filename);

      setFeedbackMessage({
        type: 'success',
        text: `Exported ${recordsToExport.length} transaction records to ${filename}`,
      });
    } catch (err: any) {
      console.error('Failed to export transactions to Excel', err);
      setFeedbackMessage({ type: 'error', text: 'Failed to generate Excel file.' });
    } finally {
      setExporting(false);
    }
  };

  // Download Individual Invoice PDF
  const handleDownloadSingleInvoice = async (orderId: string) => {
    setActionMenuOpenId(null);
    setFeedbackMessage({ type: 'success', text: `Preparing invoice for order ${orderId}...` });
    const res = await downloadOrderTaxInvoice(orderId);
    if (res.success) {
      setFeedbackMessage({ type: 'success', text: `Invoice for ${orderId} downloaded successfully.` });
    } else {
      setFeedbackMessage({ type: 'error', text: res.error || `Failed to download invoice for ${orderId}.` });
    }
  };

  // Batch Download Invoices for Selected Transactions
  const handleBatchDownloadInvoices = async () => {
    if (selectedIds.size === 0) return;
    const selectedTransactions = filtered.filter((p) => selectedIds.has(p.id) && p.orderId);
    if (selectedTransactions.length === 0) {
      setFeedbackMessage({ type: 'error', text: 'No valid order numbers associated with selected records.' });
      return;
    }

    setDownloadingInvoices(true);
    setFeedbackMessage({
      type: 'success',
      text: `Initiating download of ${selectedTransactions.length} invoice PDF(s)...`,
    });

    let successCount = 0;
    let failCount = 0;

    for (const tx of selectedTransactions) {
      const res = await downloadOrderTaxInvoice(tx.orderId);
      if (res.success) {
        successCount++;
      } else {
        failCount++;
      }
      await new Promise((r) => setTimeout(r, 600));
    }

    setDownloadingInvoices(false);
    if (failCount === 0) {
      setFeedbackMessage({
        type: 'success',
        text: `Successfully downloaded all ${successCount} invoice(s).`,
      });
    } else {
      setFeedbackMessage({
        type: 'error',
        text: `Downloaded ${successCount} invoice(s). Failed to download ${failCount}.`,
      });
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const cardBg = isDark
    ? 'bg-[#1E1C1A] border-[#36312C]'
    : 'bg-[#FFFFFF] border-[#E5DFD7] shadow-xs';

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOP BREADCRUMB & PAGE TITLE (TailAdmin Exact Layout)
          ========================================================================= */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C2434] dark:text-[#E2E8F0]">
          Invoices
        </h1>
        <div className="flex items-center gap-1.5 text-sm text-[#64748B] dark:text-[#94A3B8]">
          <Link href="/admin" className="hover:text-[#1C2434] dark:hover:text-white transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <span className="text-[#1C2434] dark:text-[#E2E8F0] font-medium">Invoices</span>
        </div>
      </div>

      {/* =========================================================================
          OVERVIEW CARD (TailAdmin Exact Horizontal Overview Layout with Dividers)
          ========================================================================= */}
      <div className={`rounded-xl border p-6 ${cardBg}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-[#1C2434] dark:text-[#E2E8F0]">
            Overview
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchPayments}
              title="Refresh transaction data"
              className="p-2 rounded-lg border border-[#E5DFD7] dark:border-[#36312C] text-[#64748B] dark:text-[#94A3B8] hover:text-[#1C2434] dark:hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Continuous Metric Columns with Thin Dividers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x divide-[#E5DFD7] dark:divide-[#36312C]">
          {/* Col 1: Live Genuine Revenue */}
          <div className="lg:pr-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-normal text-[#64748B] dark:text-[#94A3B8]">
                Live Revenue
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                Live
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1C2434] dark:text-[#E2E8F0]">
              ₹{liveCapturedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Col 2: Test Mode Volume */}
          <div className="lg:px-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-normal text-[#64748B] dark:text-[#94A3B8]">
                Test Mode Volume
              </span>
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                Test
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1C2434] dark:text-[#E2E8F0]">
              ₹{testCapturedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Col 3: Captured Transactions */}
          <div className="lg:px-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-normal text-[#64748B] dark:text-[#94A3B8]">
                Captured Orders
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1C2434] dark:text-[#E2E8F0]">
              {capturedCount}
              <span className="text-sm font-normal text-[#64748B] dark:text-[#94A3B8] ml-1.5">
                of {filtered.length} total
              </span>
            </p>
          </div>

          {/* Col 4: Refunds & Reversals */}
          <div className="lg:pl-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-normal text-[#64748B] dark:text-[#94A3B8]">
                Refunds &amp; Reversals
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1C2434] dark:text-[#E2E8F0]">
              ₹{refundTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Alert Notification Toast */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-lg text-sm flex items-center justify-between border ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button onClick={() => setFeedbackMessage(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          MASTER TAILADMIN INVOICES TABLE CARD
          ========================================================================= */}
      <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
        {/* Table Top Header Row (Matching TailAdmin Invoices Reference Screenshot) */}
        <div
          className={`p-6 border-b flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
            isDark ? 'border-[#36312C]' : 'border-[#E5DFD7]'
          }`}
        >
          {/* Left Title & Subtitle */}
          <div>
            <h2 className="text-lg font-semibold text-[#1C2434] dark:text-[#E2E8F0]">
              Invoices
            </h2>
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8] font-normal mt-0.5">
              Your most recent invoices list
            </p>
          </div>

          {/* Right Toolbar: Segmented Tabs, Search Input, Filter Button, Export Button */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Segmented Filter Pills (TailAdmin exact: All Invoices | Unpaid | Draft) */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#F1F5F9] dark:bg-[#25221F] border border-transparent dark:border-[#36312C]">
              {[
                { id: 'all', label: 'All Invoices' },
                { id: 'paid', label: 'Paid' },
                { id: 'unpaid', label: 'Unpaid' },
                { id: 'refunded', label: 'Refunded' },
              ].map((tab) => {
                const isActive = statusTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setStatusTab(tab.id as StatusTabType);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-[#1E1C1A] text-[#1C2434] dark:text-[#E2E8F0] shadow-xs'
                        : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#1C2434] dark:hover:text-[#E2E8F0]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search..."
                className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm border focus:outline-none focus:border-[#5146E5] transition-colors ${
                  isDark
                    ? 'bg-[#25221F] border-[#36312C] text-[#E2E8F0] placeholder-[#78726C]'
                    : 'bg-white border-[#E2E8F0] text-[#1C2434] placeholder-[#94A3B8]'
                }`}
              />
            </div>

            {/* Filter Toggle Button */}
            <div className="relative" ref={filterDropdownRef}>
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                  dateFilter !== 'all' || modeFilter !== 'all'
                    ? 'bg-[#1C2434] text-white border-[#1C2434] dark:bg-white dark:text-[#1C2434]'
                    : isDark
                    ? 'bg-[#25221F] border-[#36312C] text-[#E2E8F0] hover:bg-[#2C2825]'
                    : 'bg-white border-[#E2E8F0] text-[#1C2434] hover:bg-[#F8FAFC]'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
                <span>Filter</span>
                {(dateFilter !== 'all' || modeFilter !== 'all') && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5146E5]" />
                )}
              </button>

              {/* Filter Popover Dropdown */}
              {isFilterOpen && (
                <div
                  className={`absolute right-0 mt-2 w-72 rounded-xl shadow-xl border p-4 z-30 space-y-3.5 ${
                    isDark ? 'bg-[#1E1C1A] border-[#36312C]' : 'bg-[#FFFFFF] border-[#E5DFD7]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5DFD7] dark:border-[#36312C]">
                    <span className="text-xs font-bold text-[#1C2434] dark:text-[#E2E8F0]">
                      Filter Records
                    </span>
                    <button
                      onClick={() => {
                        setDateFilter('all');
                        setModeFilter('all');
                        setCustomStartDate('');
                        setCustomEndDate('');
                      }}
                      className="text-xs text-[#5146E5] hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Mode Filter */}
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1.5">
                      Transaction Mode
                    </label>
                    <select
                      value={modeFilter}
                      onChange={(e) => {
                        setModeFilter(e.target.value as ModeFilterType);
                        setCurrentPage(1);
                      }}
                      className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-medium focus:outline-none focus:border-[#5146E5] ${
                        isDark
                          ? 'bg-[#25221F] border-[#36312C] text-[#E2E8F0]'
                          : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#1C2434]'
                      }`}
                    >
                      <option value="all">All Modes (Live &amp; Test)</option>
                      <option value="live">Live Production Only</option>
                      <option value="test">Test Mode Only</option>
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1.5">
                      Date Range
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(
                        [
                          { id: 'all', label: 'All Time' },
                          { id: 'daily', label: 'Daily (Today)' },
                          { id: 'weekly', label: 'Weekly' },
                          { id: 'monthly', label: 'Monthly' },
                          { id: 'yearly', label: 'Yearly' },
                          { id: 'custom', label: 'Custom' },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setDateFilter(tab.id);
                            setCurrentPage(1);
                          }}
                          className={`px-2 py-1.5 rounded text-xs font-medium text-center transition-colors cursor-pointer ${
                            dateFilter === tab.id
                              ? 'bg-[#1C2434] text-white dark:bg-white dark:text-[#1C2434]'
                              : isDark
                              ? 'bg-[#25221F] text-[#B4B4B4] hover:text-[#E2E8F0]'
                              : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#1C2434]'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {dateFilter === 'custom' && (
                      <div className="mt-2.5 space-y-1.5 text-xs">
                        <div>
                          <span className="text-[11px] text-[#64748B]">From:</span>
                          <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className={`w-full px-2 py-1 border rounded text-xs ${
                              isDark
                                ? 'bg-[#25221F] border-[#36312C] text-[#E2E8F0]'
                                : 'bg-white border-[#E2E8F0] text-[#1C2434]'
                            }`}
                          />
                        </div>
                        <div>
                          <span className="text-[11px] text-[#64748B]">To:</span>
                          <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className={`w-full px-2 py-1 border rounded text-xs ${
                              isDark
                                ? 'bg-[#25221F] border-[#36312C] text-[#E2E8F0]'
                                : 'bg-white border-[#E2E8F0] text-[#1C2434]'
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Export Button matching reference */}
            <button
              onClick={() => handleExportExcel(false)}
              disabled={exporting || filtered.length === 0}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#25221F] border-[#36312C] text-[#E2E8F0] hover:bg-[#2C2825]'
                  : 'bg-white border-[#E2E8F0] text-[#1C2434] hover:bg-[#F8FAFC]'
              }`}
            >
              <Download className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Bulk Selection Bar (Download Invoices, Export Selected) */}
        {selectedIds.size > 0 && (
          <div
            className={`px-6 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm ${
              isDark ? 'bg-[#25221F] border-[#36312C]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#1C2434] dark:text-[#E2E8F0]">
                {selectedIds.size} invoice(s) selected
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Batch Download Invoices PDF */}
              <button
                onClick={handleBatchDownloadInvoices}
                disabled={downloadingInvoices}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1C2434] hover:bg-black text-white dark:bg-white dark:text-[#1C2434] dark:hover:bg-slate-100 text-sm font-medium shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                <span>
                  {downloadingInvoices ? 'Downloading Invoices...' : 'Download Selected Invoices (PDF)'}
                </span>
              </button>

              {/* Export Selected to Excel */}
              <button
                onClick={() => handleExportExcel(true)}
                disabled={exporting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#36312C] bg-white dark:bg-[#1E1C1A] text-sm font-medium hover:border-[#1C2434] transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#10B981]" />
                <span>Export Selected (.xlsx)</span>
              </button>

              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-sm text-[#64748B] hover:text-[#1C2434] dark:hover:text-white ml-1 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Master Invoices Table Component (Exact Typography & Style from Reference) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr
                className={`border-b text-sm font-medium ${
                  isDark
                    ? 'border-[#36312C] bg-[#1E1C1A] text-[#94A3B8]'
                    : 'border-[#E2E8F0] bg-white text-[#64748B]'
                }`}
              >
                {/* Checkbox */}
                <th className="py-4 px-6 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allCurrentPageSelected}
                    onChange={toggleSelectAllCurrentPage}
                    className="w-4 h-4 rounded border-gray-300 text-[#1C2434] focus:ring-0 cursor-pointer"
                  />
                </th>

                <th className="py-4 px-4 font-medium">Invoice Number</th>
                <th className="py-4 px-4 font-medium">Customer</th>
                <th className="py-4 px-4 font-medium">Created Date</th>
                <th className="py-4 px-4 font-medium">Payment Method</th>
                <th className="py-4 px-4 font-medium">Total</th>
                <th className="py-4 px-4 font-medium">Status</th>
                <th className="py-4 px-6 text-right w-16 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>

            <tbody className={`divide-y ${isDark ? 'divide-[#36312C]' : 'divide-[#E2E8F0]'}`}>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-[#64748B]">
                    Loading invoices list...
                  </td>
                </tr>
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-[#64748B]">
                    No invoices found matching the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const isSelected = selectedIds.has(tx.id);
                  const isTestRecord = Boolean(
                    tx.isTest ||
                      tx.isDemo ||
                      tx.paymentMode === 'test' ||
                      tx.id.startsWith('TEST-') ||
                      tx.id.startsWith('DEMO-') ||
                      tx.gateway.includes('Test')
                  );

                  return (
                    <tr
                      key={tx.id}
                      className={`transition-colors ${
                        isSelected
                          ? isDark
                            ? 'bg-[#25221F]'
                            : 'bg-[#F8FAFC]'
                          : isDark
                          ? 'hover:bg-[#25221F]'
                          : 'hover:bg-[#F8FAFC]'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(tx.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#1C2434] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Invoice Number (TailAdmin #323534 style) */}
                      <td className="py-4 px-4 text-[#1C2434] dark:text-[#E2E8F0] font-normal">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>#{tx.id}</span>
                          {isTestRecord ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                              Test
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                              Live
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4 text-[#1C2434] dark:text-[#E2E8F0] font-normal">
                        <p className="font-normal text-[#1C2434] dark:text-[#E2E8F0]">
                          {tx.customerName}
                        </p>
                      </td>

                      {/* Created Date (TailAdmin "August 7, 2028" format) */}
                      <td className="py-4 px-4 text-[#1C2434] dark:text-[#E2E8F0] font-normal whitespace-nowrap">
                        {formatDateTailAdmin(tx.rawDate, tx.date)}
                      </td>

                      {/* Payment Method / Due Date column */}
                      <td className="py-4 px-4 text-[#1C2434] dark:text-[#E2E8F0] font-normal">
                        <span>{tx.method}</span>
                      </td>

                      {/* Total (TailAdmin "$999" style) */}
                      <td className="py-4 px-4 font-normal text-[#1C2434] dark:text-[#E2E8F0] whitespace-nowrap">
                        ₹{tx.amount?.toLocaleString('en-IN')}
                      </td>

                      {/* Status (TailAdmin clean text style: Paid in Green, Overdue in Red, Pending in Orange) */}
                      <td className="py-4 px-4">
                        {tx.status === 'Captured' ? (
                          <span className="text-[#10B981] font-medium text-sm">
                            Paid
                          </span>
                        ) : tx.status === 'Refunded' ? (
                          <span className="text-[#10B981] font-medium text-sm">
                            Refunded
                          </span>
                        ) : (
                          <span className="text-[#F59E0B] font-medium text-sm">
                            Pending
                          </span>
                        )}

                        {typeof tx.amountRefunded === 'number' && tx.amountRefunded > 0 ? (
                          <span className="block text-xs text-[#EF4444] font-normal mt-0.5">
                            ₹{tx.amountRefunded.toLocaleString('en-IN')} refunded
                          </span>
                        ) : null}
                      </td>

                      {/* Actions (...) */}
                      <td className="py-4 px-6 text-right relative">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActionMenuOpenId(actionMenuOpenId === tx.id ? null : tx.id);
                            }}
                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#25221F] text-[#94A3B8] hover:text-[#1C2434] dark:hover:text-white transition-colors cursor-pointer"
                            title="Actions"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>

                          {/* Action Popover Menu */}
                          {actionMenuOpenId === tx.id && (
                            <div
                              ref={actionMenuRef}
                              className={`absolute right-0 mt-1 w-48 rounded-lg shadow-lg border py-1.5 z-30 ${
                                isDark ? 'bg-[#1E1C1A] border-[#36312C]' : 'bg-[#FFFFFF] border-[#E2E8F0]'
                              }`}
                            >
                              {/* Download Tax Invoice PDF */}
                              <button
                                onClick={() => handleDownloadSingleInvoice(tx.orderId)}
                                className="w-full px-3.5 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-[#25221F] text-[#1C2434] dark:text-[#E2E8F0] cursor-pointer"
                              >
                                <FileText className="w-4 h-4 text-[#5146E5]" />
                                <span>Download PDF</span>
                              </button>

                              {/* View Order in Orders Pipeline */}
                              <Link
                                href={`/admin/orders`}
                                onClick={() => setActionMenuOpenId(null)}
                                className="w-full px-3.5 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-[#25221F] text-[#1C2434] dark:text-[#E2E8F0] cursor-pointer"
                              >
                                <ExternalLink className="w-4 h-4 text-indigo-500" />
                                <span>View in Orders</span>
                              </Link>

                              {/* Copy Transaction ID */}
                              <button
                                onClick={() => {
                                  copyToClipboard(tx.id, tx.id);
                                  setActionMenuOpenId(null);
                                }}
                                className="w-full px-3.5 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-[#25221F] text-[#1C2434] dark:text-[#E2E8F0] cursor-pointer"
                              >
                                <Copy className="w-4 h-4 text-[#94A3B8]" />
                                <span>
                                  {copiedId === tx.id ? 'Copied!' : 'Copy Invoice #'}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls Bar (TailAdmin Exact Layout) */}
        <div
          className={`p-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm ${
            isDark ? 'border-[#36312C] text-[#94A3B8]' : 'border-[#E2E8F0] text-[#64748B]'
          }`}
        >
          {/* Left: Showing 1 to 8 of 20 */}
          <div>
            {totalItems > 0 ? (
              <span>
                Showing <span className="font-medium text-[#1C2434] dark:text-[#E2E8F0]">{startIndex + 1}</span> to{' '}
                <span className="font-medium text-[#1C2434] dark:text-[#E2E8F0]">
                  {Math.min(startIndex + itemsPerPage, totalItems)}
                </span>{' '}
                of <span className="font-medium text-[#1C2434] dark:text-[#E2E8F0]">{totalItems}</span>
              </span>
            ) : (
              <span>Showing 0 to 0 of 0</span>
            )}
          </div>

          {/* Right: Pagination Buttons [←] [1] [2] [3] [→] */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              {/* Prev Button */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validCurrentPage === 1}
                className="p-2 rounded-lg border border-[#E2E8F0] dark:border-[#36312C] hover:bg-gray-50 dark:hover:bg-[#25221F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-[#64748B] dark:text-[#94A3B8]"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => {
                const isActive = pageNum === validCurrentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'border border-[#E2E8F0] dark:border-[#36312C] hover:bg-gray-50 dark:hover:bg-[#25221F] text-[#64748B] dark:text-[#94A3B8]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validCurrentPage === totalPages}
                className="p-2 rounded-lg border border-[#E2E8F0] dark:border-[#36312C] hover:bg-gray-50 dark:hover:bg-[#25221F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-[#64748B] dark:text-[#94A3B8]"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
