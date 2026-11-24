'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  Search,
  ExternalLink,
  X,
  Package,
  RefreshCw,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  CreditCard,
  MapPin,
  User,
  ArrowRight,
  AlertCircle,
  FileText,
  CornerDownRight,
  GitBranch,
  Download,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { downloadOrderTaxInvoice } from '@/lib/invoiceDownload';
import { useAdminTheme } from '@/context/AdminThemeContext';
import type { Order } from '@/types';

// Exactly four primary shipment stages as specified
type PrimaryTab = 'Confirmed' | 'Dispatched' | 'In Transit' | 'Delivered';
const PRIMARY_TABS: PrimaryTab[] = ['Confirmed', 'Dispatched', 'In Transit', 'Delivered'];

export default function AdminOrdersPage() {
  const { isDark } = useAdminTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PrimaryTab>('Confirmed');
  const [showReturns, setShowReturns] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [syncingTracking, setSyncingTracking] = useState(false);
  const [shippingFeedback, setShippingFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [shippingStatus, setShippingStatus] = useState<{
    connected: boolean;
    environment: string;
    accountEmail: string;
    primaryPickupLocation?: string;
  } | null>(null);
  const [handlingReturnAction, setHandlingReturnAction] = useState(false);
  const [returnRejectReason, setReturnRejectReason] = useState('');
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);
  const [downloadingInvoiceNum, setDownloadingInvoiceNum] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/orders');
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchShippingStatus = async () => {
    try {
      const res = await apiFetch('/api/shipping/status');
      const data = await res.json();
      if (data) {
        setShippingStatus(data);
      }
    } catch (err) {
      console.error('Failed to load Shiprocket status', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchShippingStatus();
  }, []);

  // Sync Live Tracking from Shiprocket API
  const handleLiveTrackSync = async (orderId: string) => {
    setSyncingTracking(true);
    setShippingFeedback(null);
    try {
      const res = await apiFetch(`/api/shipping/orders/${orderId}/track`);
      const data = await res.json();
      if (res.ok && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId || o.orderNumber === orderId ? data.order : o))
        );
        setSelectedOrder(data.order);
        setShippingFeedback({
          type: 'success',
          message: `Live tracking synchronized: ${data.order.status}.`,
        });
      } else {
        setShippingFeedback({
          type: 'error',
          message: data.error || 'Failed to sync live tracking from Shiprocket.',
        });
      }
    } catch (err: any) {
      setShippingFeedback({ type: 'error', message: err.message || 'Tracking sync network error.' });
    } finally {
      setSyncingTracking(false);
    }
  };

  const handleDownloadInvoice = async (orderNumber: string) => {
    setDownloadingInvoiceNum(orderNumber);
    setShippingFeedback(null);
    const res = await downloadOrderTaxInvoice(orderNumber);
    setDownloadingInvoiceNum(null);
    if (res.success) {
      setShippingFeedback({ type: 'success', message: `Tax Invoice for Order #${orderNumber} downloaded.` });
    } else {
      setShippingFeedback({ type: 'error', message: res.error || 'Failed to download invoice.' });
    }
  };

  const handleReviewReturn = async (decision: 'approve' | 'reject') => {
    if (!selectedOrder) return;
    if (decision === 'reject' && !returnRejectReason.trim()) {
      setShowRejectPrompt(true);
      return;
    }

    setHandlingReturnAction(true);
    setShippingFeedback(null);
    try {
      const res = await apiFetch(`/api/orders/${selectedOrder.orderNumber}/return-decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          reason: returnRejectReason.trim() || undefined,
          notes: decision === 'approve' ? 'Return request verified and approved by admin.' : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to review return request.');

      setSelectedOrder(data.order);
      setOrders((prev) => prev.map((o) => (o.orderNumber === data.order.orderNumber ? data.order : o)));
      setShowRejectPrompt(false);
      setReturnRejectReason('');
      setShippingFeedback({
        type: 'success',
        message: `Return request ${decision === 'approve' ? 'Approved' : 'Declined'}.`,
      });
    } catch (err: any) {
      setShippingFeedback({ type: 'error', message: err.message || 'Action failed.' });
    } finally {
      setHandlingReturnAction(false);
    }
  };

  const handleExecuteRefund = async () => {
    if (!selectedOrder) return;
    const confirmMsg = `Confirm Razorpay Refund of ₹${(selectedOrder.total || 0).toLocaleString('en-IN')} for Order #${selectedOrder.orderNumber}?\n\nThis will initiate an authentic refund through Razorpay Test Mode and mark the order as Returned.`;
    if (!window.confirm(confirmMsg)) return;

    setHandlingReturnAction(true);
    setShippingFeedback(null);
    try {
      const res = await apiFetch(`/api/orders/${selectedOrder.orderNumber}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedOrder.total,
          reason: 'Customer Return Approved Refund',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Refund failed.');

      setSelectedOrder(data.order);
      setOrders((prev) => prev.map((o) => (o.orderNumber === data.order.orderNumber ? data.order : o)));
      setShippingFeedback({
        type: 'success',
        message: `Refund of ₹${(selectedOrder.total || 0).toLocaleString('en-IN')} processed successfully (Refund ID: ${data.refundId}).`,
      });
    } catch (err: any) {
      setShippingFeedback({ type: 'error', message: err.message || 'Refund execution failed.' });
    } finally {
      setHandlingReturnAction(false);
    }
  };

  const handleInspectReturn = async (inspectionPassed: boolean) => {
    if (!selectedOrder) return;
    const confirmMsg = inspectionPassed
      ? `Confirm Physical Return Inspection PASSED for Order #${selectedOrder.orderNumber}?\n\nThis will verify that the returned merchandise has physically arrived at the ZIMOR atelier in pristine sellable condition and RESTOCK the items to available inventory.`
      : `Confirm Physical Return Inspection FAILED for Order #${selectedOrder.orderNumber}?\n\nThis will record that the merchandise was received damaged or worn. Sellable inventory will NOT be restored.`;
    if (!window.confirm(confirmMsg)) return;

    setHandlingReturnAction(true);
    setShippingFeedback(null);
    try {
      const res = await apiFetch(`/api/orders/${selectedOrder.orderNumber}/return-inspection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemReceived: true,
          inspectionPassed,
          notes: inspectionPassed
            ? 'Merchandise verified in pristine sellable condition by atelier staff.'
            : 'Merchandise damaged/worn upon physical return inspection. Quarantined without restock.',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Return inspection failed.');

      setSelectedOrder(data.order);
      setOrders((prev) => prev.map((o) => (o.orderNumber === data.order.orderNumber ? data.order : o)));
      setShippingFeedback({
        type: 'success',
        message: data.message,
      });
    } catch (err: any) {
      setShippingFeedback({ type: 'error', message: err.message || 'Inspection failed.' });
    } finally {
      setHandlingReturnAction(false);
    }
  };

  const handleReleaseQuarantine = async (productId: string, action: 'restock' | 'write_off') => {
    if (!selectedOrder) return;
    const defaultReason = action === 'restock'
      ? 'Merchandise refurbished in atelier and verified pristine for resale'
      : 'Merchandise damaged beyond repair; scrapped per atelier write-off protocol';
    const reason = window.prompt(
      `Enter authorized justification for quarantine ${action === 'restock' ? 'restock' : 'write-off'}:`,
      defaultReason
    );
    if (!reason || !reason.trim()) return;

    setHandlingReturnAction(true);
    setShippingFeedback(null);
    try {
      const res = await apiFetch(`/api/orders/${selectedOrder.orderNumber}/quarantine-release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          action,
          reason: reason.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Quarantine release failed.');

      setSelectedOrder(data.order);
      setOrders((prev) => prev.map((o) => (o.orderNumber === data.order.orderNumber ? data.order : o)));
      setShippingFeedback({
        type: 'success',
        message: data.message,
      });
    } catch (err: any) {
      setShippingFeedback({ type: 'error', message: err.message || 'Quarantine action failed.' });
    } finally {
      setHandlingReturnAction(false);
    }
  };

  // Helper to match order against automated primary tabs
  const isOrderInTab = (ord: Order, tab: PrimaryTab): boolean => {
    const st = (ord.status || '').toLowerCase();
    const shipSt = (ord.shiprocketStatus || '').toLowerCase();

    if (tab === 'Confirmed') {
      return (
        st === 'confirmed' ||
        st === 'processing' ||
        st === 'paid' ||
        st === 'pending' ||
        (ord.paymentStatus === 'Paid' &&
          !st.includes('dispatch') &&
          !st.includes('pick') &&
          !st.includes('transit') &&
          !st.includes('shipped') &&
          !st.includes('deliver'))
      );
    }
    if (tab === 'Dispatched') {
      return (
        st === 'dispatched' ||
        st === 'picked up' ||
        shipSt.includes('picked up') ||
        shipSt.includes('pickup') ||
        shipSt.includes('manifest')
      );
    }
    if (tab === 'In Transit') {
      return (
        st === 'in transit' ||
        st === 'shipped' ||
        st === 'out for delivery' ||
        st === 'delayed' ||
        shipSt.includes('transit') ||
        shipSt.includes('out for delivery') ||
        shipSt.includes('hub')
      );
    }
    if (tab === 'Delivered') {
      return st === 'delivered' || shipSt.includes('delivered');
    }
    return false;
  };

  const isOrderReturned = (ord: Order): boolean => {
    const st = (ord.status || '').toLowerCase();
    const shipSt = (ord.shiprocketStatus || '').toLowerCase();
    return st === 'returned' || st === 'rto' || shipSt.includes('rto') || shipSt.includes('return');
  };

  // Counts for tabs & return outcome filter
  const countConfirmed = orders.filter((o) => isOrderInTab(o, 'Confirmed') && !isOrderReturned(o)).length;
  const countDispatched = orders.filter((o) => isOrderInTab(o, 'Dispatched') && !isOrderReturned(o)).length;
  const countInTransit = orders.filter((o) => isOrderInTab(o, 'In Transit') && !isOrderReturned(o)).length;
  const countDelivered = orders.filter((o) => isOrderInTab(o, 'Delivered') && !isOrderReturned(o)).length;
  const countReturned = orders.filter((o) => isOrderReturned(o)).length;

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = showReturns
      ? isOrderReturned(o)
      : isOrderInTab(o, activeTab) && !isOrderReturned(o);

    const q = search.toLowerCase().trim();
    if (!q) return matchesStatus;

    const matchesSearch =
      o.orderNumber?.toLowerCase().includes(q) ||
      o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
      o.shippingAddress?.phone?.includes(q) ||
      o.customerEmail?.toLowerCase().includes(q) ||
      o.items?.some((it) => it.name.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const getOrderStatusBadge = (ord: Order) => {
    if (isOrderReturned(ord)) {
      return {
        label: 'Returned',
        style: 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/30',
      };
    }
    if (ord.status === 'Delivered') {
      return {
        label: 'Delivered',
        style: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
      };
    }
    if (isOrderInTab(ord, 'In Transit')) {
      return {
        label: 'In Transit',
        style: 'bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border-indigo-500/30',
      };
    }
    if (isOrderInTab(ord, 'Dispatched')) {
      return {
        label: 'Dispatched',
        style: 'bg-[#C86D48]/10 text-[#9B4D2C] dark:text-[#E28965] border-[#C86D48]/30',
      };
    }
    return {
      label: 'Confirmed',
      style: 'bg-[#C07D2B]/10 text-[#9C611B] dark:text-[#F0B265] border-[#C07D2B]/30',
    };
  };

  // Determine active stage & progress for the Flowchart Timeline
  const getTimelineProgress = (ord: Order) => {
    const isReturned = isOrderReturned(ord);
    const st = (ord.status || '').toLowerCase();
    const shipSt = (ord.shiprocketStatus || '').toLowerCase();

    const isDelivered = st === 'delivered' || shipSt.includes('delivered');
    const isInTransit =
      st === 'in transit' ||
      st === 'shipped' ||
      st === 'out for delivery' ||
      shipSt.includes('transit') ||
      shipSt.includes('out for delivery');
    const isDispatched =
      st === 'dispatched' ||
      st === 'picked up' ||
      shipSt.includes('picked up') ||
      shipSt.includes('pickup') ||
      shipSt.includes('manifest');

    let currentStage: 'Confirmed' | 'Dispatched' | 'In Transit' | 'Delivered' | 'Returned' = 'Confirmed';

    if (isReturned) {
      currentStage = 'Returned';
    } else if (isDelivered) {
      currentStage = 'Delivered';
    } else if (isInTransit) {
      currentStage = 'In Transit';
    } else if (isDispatched) {
      currentStage = 'Dispatched';
    } else {
      currentStage = 'Confirmed';
    }

    return {
      currentStage,
      isReturned,
      confirmedPassed: true,
      dispatchedPassed: isDispatched || isInTransit || isDelivered || (isReturned && (isDispatched || isInTransit || Boolean(ord.awbCode))),
      inTransitPassed: isInTransit || isDelivered || (isReturned && (isInTransit || st.includes('transit'))),
      deliveredPassed: isDelivered && !isReturned,
    };
  };

  const cardBg = isDark
    ? 'bg-[#1E1C1A] border-[#2E3A47]'
    : 'bg-[#FFFFFF] border-[#E2E8F0] shadow-xs';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C2434] dark:text-[#E2E8F0]">
            Orders Pipeline
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
            Four primary shipment stages automated via verified Razorpay &amp; Shiprocket sync.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {shippingStatus && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                shippingStatus.connected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  shippingStatus.connected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                }`}
              />
              <span>Shiprocket: {shippingStatus.connected ? 'Connected' : 'Auth Required'}</span>
            </div>
          )}

          <button
            onClick={() => {
              fetchOrders();
              fetchShippingStatus();
            }}
            title="Refresh orders pipeline"
            className="p-2 rounded-lg border border-[#E2E8F0] dark:border-[#2E3A47] bg-white dark:bg-[#1E1C1A] text-[#64748B] dark:text-[#94A3B8] hover:text-[#1C2434] dark:hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
        {/* Navigation Ribbon: 4 Primary Status Tabs + Separate Returned Filter + Search */}
        <div
          className={`p-5 border-b space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4 ${
            isDark ? 'border-[#2E3A47]' : 'border-[#E2E8F0]'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            {/* Exactly Four Primary Status Tabs */}
            <div className="inline-flex rounded-lg p-1 bg-[#F1F5F9] dark:bg-[#25221F] border border-transparent dark:border-[#2E3A47]">
              {PRIMARY_TABS.map((tab) => {
                const count =
                  tab === 'Confirmed'
                    ? countConfirmed
                    : tab === 'Dispatched'
                    ? countDispatched
                    : tab === 'In Transit'
                    ? countInTransit
                    : countDelivered;

                const isActive = activeTab === tab && !showReturns;

                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setShowReturns(false);
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#5146E5] text-[#F7F5F2] shadow-xs'
                        : isDark
                        ? 'text-[#B4B4B4] hover:text-[#E8E1DA] hover:bg-[#2A2724]'
                        : 'text-[#5A534E] hover:text-[#24211F] hover:bg-[#EFEAE2]'
                    }`}
                  >
                    {tab} <span className="opacity-75 text-[11px] ml-1">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Separate Returned Outcome Filter (Not a 5th Primary Tab) */}
            <button
              onClick={() => setShowReturns(!showReturns)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                showReturns
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-800 dark:text-rose-300 font-bold shadow-xs'
                  : isDark
                  ? 'bg-[#1E1C1A] border-[#36312C] text-[#8C837A] hover:text-[#E8E1DA] hover:border-neutral-600'
                  : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#5A534E] hover:text-[#24211F] hover:border-neutral-400'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Returned</span>
              <span className="opacity-80 text-[11px]">({countReturned})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#8C837A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, customer, phone..."
              className="w-full pl-9 pr-4 py-1.5 bg-[#FAF7F2] dark:bg-[#1E1C1A] border border-[#E5DFD7] dark:border-[#36312C] rounded-md text-xs text-[#24211F] dark:text-[#E8E1DA] focus:outline-none focus:border-[#5146E5]"
            />
          </div>
        </div>

        {/* Minimal Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr
                className={`border-b text-sm font-medium ${
                  isDark
                    ? 'border-[#2E3A47] bg-[#1E1C1A] text-[#94A3B8]'
                    : 'border-[#E2E8F0] bg-white text-[#64748B]'
                }`}
              >
                <th className="py-4 px-5 font-medium">Order ID</th>
                <th className="py-4 px-4 font-medium">Date</th>
                <th className="py-4 px-4 font-medium">Customer</th>
                <th className="py-4 px-4 font-medium">Product</th>
                <th className="py-4 px-4 font-medium">Amount</th>
                <th className="py-4 px-4 font-medium">Status</th>
                <th className="py-4 px-5 text-right font-medium">Inspect</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#2E3A47]' : 'divide-[#E2E8F0]'}`}>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[#64748B]">
                    Loading verified orders pipeline...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[#64748B]">
                    {showReturns
                      ? 'No returned or RTO orders found.'
                      : `No orders currently in "${activeTab}" stage.`}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const badge = getOrderStatusBadge(ord);

                  return (
                    <tr
                      key={ord.id}
                      className={`transition-colors cursor-pointer ${
                        isDark ? 'hover:bg-[#25221F]' : 'hover:bg-[#F8FAFC]'
                      }`}
                      onClick={() => {
                        setSelectedOrder(ord);
                        setShippingFeedback(null);
                      }}
                    >
                      {/* 1. Order ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#5146E5] dark:text-[#818CF8]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{ord.orderNumber}</span>
                          {(ord.paymentMode === 'test' ||
                            ord.paymentMethod?.includes('Test') ||
                            ord.orderNumber?.startsWith('DEMO-')) && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                              TEST
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Date */}
                      <td className="py-3.5 px-4 text-[#8C837A] dark:text-[#8A837C] whitespace-nowrap">
                        {ord.date}
                      </td>

                      {/* 3. Customer */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#24211F] dark:text-[#E8E1DA] truncate max-w-[140px]">
                          {ord.shippingAddress?.fullName || 'Customer'}
                        </p>
                        <p className="text-[10px] text-[#8C837A] dark:text-[#8A837C] font-mono">
                          {ord.shippingAddress?.phone}
                        </p>
                      </td>

                      {/* 4. Product */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden border border-[#E5DFD7] dark:border-[#36312C] shrink-0">
                            <Image
                              src={
                                ord.items?.[0]?.image ||
                                'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp'
                              }
                              alt={ord.items?.[0]?.name || 'Product'}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-[#24211F] dark:text-[#E8E1DA] truncate max-w-[160px]">
                              {ord.items?.[0]?.name || 'ZIMOR Handbag'}
                            </p>
                            <span className="text-[10px] text-[#8C837A] dark:text-[#8A837C]">
                              {ord.items?.length || 1} item{(ord.items?.length || 1) > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 5. Amount */}
                      <td className="py-3.5 px-4 font-bold text-[#24211F] dark:text-[#E8E1DA] whitespace-nowrap">
                        <div>₹{ord.total?.toLocaleString('en-IN')}</div>
                        <span className="text-[9px] font-normal uppercase text-emerald-700 dark:text-emerald-400">
                          {ord.paymentStatus || 'Paid'}
                        </span>
                      </td>

                      {/* 6. Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold border ${badge.style}`}>
                            {badge.label}
                          </span>
                          {ord.returnRequest && ord.returnRequest.status !== 'none' && (
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                                ord.returnRequest.status === 'requested'
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                                  : ord.returnRequest.status === 'approved'
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                  : ord.returnRequest.status === 'completed'
                                  ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
                                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                              }`}
                            >
                              {ord.returnRequest.status === 'requested' && 'Return Pending'}
                              {ord.returnRequest.status === 'approved' && 'Return Approved'}
                              {ord.returnRequest.status === 'completed' && 'Refunded'}
                              {ord.returnRequest.status === 'rejected' && 'Return Declined'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 7. Inspect */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(ord);
                            setShippingFeedback(null);
                          }}
                          className="px-3 py-1 rounded bg-[#FAF7F2] dark:bg-[#1E1C1A] text-xs font-semibold hover:bg-[#EFEAE2] dark:hover:bg-[#2A2724] border border-[#E5DFD7] dark:border-[#36312C] text-[#24211F] dark:text-[#E8E1DA] transition-colors cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Slide-Over Panel: Flowchart Timeline, Customer, Delivery Address, Product Details, Razorpay Details, Chronological Timeline */}
      {mounted && selectedOrder && typeof document !== 'undefined' && createPortal((() => {
        const progress = getTimelineProgress(selectedOrder);

        return (
          <div
            className="fixed inset-0 z-[9999] flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn admin-panel-theme"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedOrder(null);
              }
            }}
          >
            <div
              className={`w-full max-w-xl h-full overflow-y-auto p-6 flex flex-col justify-between border-l shadow-2xl ${
                isDark ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA]' : 'bg-[#FFFFFF] border-[#E5DFD7] text-[#24211F]'
              }`}
            >
              <div className="space-y-6">
                {/* 1. Header: Order ID, Status Badge, Order Date, and Action Buttons */}
                <div className="border-b pb-4 border-[#E5DFD7] dark:border-[#36312C]">
                  {/* Top Eyebrow Label */}
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C837A] dark:text-[#8A837C] block mb-1">
                    Order Inspection
                  </span>

                  {/* Main Row: Order ID & Badge on Left, Action Buttons on Right */}
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                    {/* Left: Order Identifier & Status Badge Group */}
                    <div className="flex items-center flex-wrap gap-2.5 min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold font-mono text-[#5146E5] dark:text-[#818CF8] tracking-tight whitespace-nowrap">
                        {selectedOrder.orderNumber}
                      </h2>
                      {(selectedOrder.paymentMode === 'test' ||
                        selectedOrder.paymentMethod?.includes('Test') ||
                        selectedOrder.orderNumber?.startsWith('DEMO-')) ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shrink-0 whitespace-nowrap">
                          TEST ORDER
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0 whitespace-nowrap">
                          VERIFIED
                        </span>
                      )}
                    </div>

                    {/* Right: Actions (Invoice, Refresh, Close) */}
                    <div className="flex items-center gap-2 shrink-0 ml-auto">
                      <button
                        type="button"
                        onClick={() => handleDownloadInvoice(selectedOrder.orderNumber)}
                        disabled={downloadingInvoiceNum === selectedOrder.orderNumber}
                        title="Download Tax Invoice PDF"
                        className="h-8 px-2.5 rounded-md border border-[#E5DFD7] dark:border-[#36312C] bg-[#FAF7F2] dark:bg-[#24211F] text-[#5A534E] dark:text-[#B4B4B4] hover:text-[#5146E5] transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Download className={`w-3.5 h-3.5 shrink-0 ${downloadingInvoiceNum === selectedOrder.orderNumber ? 'animate-bounce' : ''}`} />
                        <span>{downloadingInvoiceNum === selectedOrder.orderNumber ? '...' : 'Invoice'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLiveTrackSync(selectedOrder.id || selectedOrder.orderNumber)}
                        disabled={syncingTracking}
                        title="Sync latest live tracking events"
                        className="h-8 w-8 rounded-md border border-[#E5DFD7] dark:border-[#36312C] bg-[#FAF7F2] dark:bg-[#24211F] text-[#5A534E] dark:text-[#B4B4B4] hover:text-[#5146E5] transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${syncingTracking ? 'animate-spin text-[#5146E5]' : ''}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(null)}
                        title="Close inspection"
                        aria-label="Close inspection"
                        className="h-8 w-8 rounded-md hover:bg-[#FAF7F2] dark:hover:bg-[#24211F] text-[#8C837A] dark:text-[#8A837C] hover:text-[#24211F] dark:hover:text-[#E8E1DA] transition-colors cursor-pointer flex items-center justify-center"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Order Timestamp */}
                  <p className="text-xs text-[#8C837A] dark:text-[#8A837C] mt-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>Placed on: {selectedOrder.date}</span>
                  </p>
                </div>

                {/* Feedback Alert if Syncing */}
                {shippingFeedback && (
                  <div
                    className={`p-2.5 rounded text-xs border ${
                      shippingFeedback.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                        : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300'
                    }`}
                  >
                    {shippingFeedback.message}
                  </div>
                )}

                {/* FLOWCHART TIMELINE: Shows all five stages simultaneously with connecting lines and separate Returned branch */}
                <div className="p-4 rounded-lg bg-[#FAF7F2] dark:bg-[#24211F] border border-[#E5DFD7] dark:border-[#36312C] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C837A] dark:text-[#8A837C] flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-[#5146E5]" />
                      <span>Fulfillment Flowchart Timeline</span>
                    </span>

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-white dark:bg-[#1E1C1A] border-[#E5DFD7] dark:border-[#36312C] text-[#24211F] dark:text-[#E8E1DA]">
                      Active: {progress.currentStage}
                    </span>
                  </div>

                  {/* DESKTOP FLOWCHART (md+): Horizontal pipeline with separate downward outcome branch for Returned */}
                  <div className="hidden md:block space-y-4 pt-1">
                    {/* Primary Forward Pipeline */}
                    <div className="grid grid-cols-4 gap-2 relative">
                      {/* 1. Confirmed */}
                      <div className="flex flex-col items-center text-center relative z-10">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                            progress.currentStage === 'Confirmed'
                              ? 'bg-[#5146E5] text-white ring-4 ring-[#5146E5]/25 scale-105'
                              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-[11px] mt-1.5 text-[#24211F] dark:text-[#E8E1DA]">Confirmed</span>
                        <span className="text-[9px] text-[#8C837A] dark:text-[#8A837C]">Payment Verified</span>
                      </div>

                      {/* Connecting Line 1 -> 2 */}
                      <div
                        className={`absolute top-4 left-[12.5%] w-[25%] h-0.5 -translate-y-1/2 z-0 ${
                          progress.dispatchedPassed ? 'bg-emerald-500/80 dark:bg-emerald-400/80' : 'bg-[#E5DFD7] dark:bg-[#36312C]'
                        }`}
                      />

                      {/* 2. Dispatched */}
                      <div className="flex flex-col items-center text-center relative z-10">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                            progress.currentStage === 'Dispatched'
                              ? 'bg-[#5146E5] text-white ring-4 ring-[#5146E5]/25 scale-105'
                              : progress.dispatchedPassed
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40'
                              : 'bg-[#FAF7F2] dark:bg-[#1E1C1A] text-[#8C837A] dark:text-[#8A837C] border border-[#E5DFD7] dark:border-[#36312C]'
                          }`}
                        >
                          {progress.dispatchedPassed && progress.currentStage !== 'Dispatched' ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Truck className="w-4 h-4" />
                          )}
                        </div>
                        <span className="font-bold text-[11px] mt-1.5 text-[#24211F] dark:text-[#E8E1DA]">Dispatched</span>
                        <span className="text-[9px] text-[#8C837A] dark:text-[#8A837C]">Courier Pickup</span>
                      </div>

                      {/* Connecting Line 2 -> 3 */}
                      <div
                        className={`absolute top-4 left-[37.5%] w-[25%] h-0.5 -translate-y-1/2 z-0 ${
                          progress.inTransitPassed ? 'bg-emerald-500/80 dark:bg-emerald-400/80' : 'bg-[#E5DFD7] dark:bg-[#36312C]'
                        }`}
                      />

                      {/* 3. In Transit */}
                      <div className="flex flex-col items-center text-center relative z-10">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                            progress.currentStage === 'In Transit'
                              ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/25 scale-105'
                              : progress.inTransitPassed
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40'
                              : 'bg-[#FAF7F2] dark:bg-[#1E1C1A] text-[#8C837A] dark:text-[#8A837C] border border-[#E5DFD7] dark:border-[#36312C]'
                          }`}
                        >
                          {progress.inTransitPassed && progress.currentStage !== 'In Transit' ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <span className="font-bold text-[11px] mt-1.5 text-[#24211F] dark:text-[#E8E1DA]">In Transit</span>
                        <span className="text-[9px] text-[#8C837A] dark:text-[#8A837C]">Air Cargo / Hub</span>
                      </div>

                      {/* Connecting Line 3 -> 4 */}
                      <div
                        className={`absolute top-4 left-[62.5%] w-[25%] h-0.5 -translate-y-1/2 z-0 ${
                          progress.deliveredPassed
                            ? 'bg-emerald-500/80 dark:bg-emerald-400/80'
                            : progress.isReturned
                            ? 'border-t-2 border-dashed border-[#8C837A]/40'
                            : 'bg-[#E5DFD7] dark:bg-[#36312C]'
                        }`}
                      />

                      {/* 4. Delivered */}
                      <div className="flex flex-col items-center text-center relative z-10">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                            progress.currentStage === 'Delivered'
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/25 scale-105'
                              : progress.isReturned
                              ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 border border-neutral-300 dark:border-neutral-700 opacity-50'
                              : 'bg-[#FAF7F2] dark:bg-[#1E1C1A] text-[#8C837A] dark:text-[#8A837C] border border-[#E5DFD7] dark:border-[#36312C]'
                          }`}
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className={`font-bold text-[11px] mt-1.5 ${progress.isReturned ? 'line-through text-neutral-400' : 'text-[#24211F] dark:text-[#E8E1DA]'}`}>
                          Delivered
                        </span>
                        <span className="text-[9px] text-[#8C837A] dark:text-[#8A837C]">
                          {progress.isReturned ? 'Bypassed' : 'Recipient Signed'}
                        </span>
                      </div>
                    </div>

                    {/* SEPARATE OUTCOME BRANCH: Returned */}
                    <div className="pt-2 pl-[50%] relative">
                      {/* Connecting Branch Line downwards and curving right to Returned */}
                      <div
                        className={`absolute top-0 left-[62.5%] w-px h-6 ${
                          progress.isReturned ? 'bg-rose-500' : 'border-l border-dashed border-[#8C837A]/50'
                        }`}
                      />
                      <div
                        className={`absolute top-6 left-[62.5%] w-6 h-px ${
                          progress.isReturned ? 'bg-rose-500' : 'border-t border-dashed border-[#8C837A]/50'
                        }`}
                      />

                      {/* Returned Outcome Card */}
                      <div
                        className={`ml-6 p-2.5 rounded-md border flex items-center justify-between gap-3 transition-all ${
                          progress.isReturned
                            ? 'bg-rose-500/15 border-rose-500/50 text-rose-800 dark:text-rose-300 ring-2 ring-rose-500/20'
                            : 'bg-white/60 dark:bg-[#1E1C1A]/60 border-[#E5DFD7] dark:border-[#36312C] text-[#8C837A] dark:text-[#8A837C] opacity-75'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                              progress.isReturned ? 'bg-rose-600 text-white shadow-xs' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                            }`}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-[11px] block">5. Returned (Branch Outcome)</span>
                            <span className="text-[10px] block opacity-80">
                              {progress.isReturned ? 'RTO or genuine return verified by courier' : 'Alternative branch (No return requested)'}
                            </span>
                          </div>
                        </div>

                        {progress.isReturned && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-600 text-white shrink-0">
                            Active Outcome
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* MOBILE FLOWCHART (< md): Connected vertical timeline with dedicated branch outcome */}
                  <div className="block md:hidden space-y-3 pt-1">
                    <div className="relative pl-6 space-y-4 border-l-2 border-[#E5DFD7] dark:border-[#36312C] ml-3">
                      {/* Confirmed */}
                      <div className="relative">
                        <span className="absolute -left-[31px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] bg-emerald-500 text-white">
                          ✓
                        </span>
                        <div className="text-xs">
                          <span className="font-bold">1. Confirmed</span>
                          <span className="block text-[10px] text-[#8C837A]">Payment verified</span>
                        </div>
                      </div>

                      {/* Dispatched */}
                      <div className="relative">
                        <span
                          className={`absolute -left-[31px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                            progress.currentStage === 'Dispatched'
                              ? 'bg-[#5146E5] text-white ring-2 ring-[#5146E5]/30'
                              : progress.dispatchedPassed
                              ? 'bg-emerald-500 text-white'
                              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                          }`}
                        >
                          {progress.dispatchedPassed && progress.currentStage !== 'Dispatched' ? '✓' : '2'}
                        </span>
                        <div className="text-xs">
                          <span className="font-bold">2. Dispatched</span>
                          <span className="block text-[10px] text-[#8C837A]">Courier pickup completed</span>
                        </div>
                      </div>

                      {/* In Transit */}
                      <div className="relative">
                        <span
                          className={`absolute -left-[31px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                            progress.currentStage === 'In Transit'
                              ? 'bg-indigo-600 text-white ring-2 ring-indigo-500/30'
                              : progress.inTransitPassed
                              ? 'bg-emerald-500 text-white'
                              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                          }`}
                        >
                          {progress.inTransitPassed && progress.currentStage !== 'In Transit' ? '✓' : '3'}
                        </span>
                        <div className="text-xs">
                          <span className="font-bold">3. In Transit</span>
                          <span className="block text-[10px] text-[#8C837A]">In transit via air / hub</span>
                        </div>
                      </div>

                      {/* Delivered */}
                      <div className="relative">
                        <span
                          className={`absolute -left-[31px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                            progress.currentStage === 'Delivered'
                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/30'
                              : progress.isReturned
                              ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400'
                              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                          }`}
                        >
                          {progress.currentStage === 'Delivered' ? '✓' : '4'}
                        </span>
                        <div className="text-xs">
                          <span className={`font-bold ${progress.isReturned ? 'line-through text-neutral-400' : ''}`}>
                            4. Delivered
                          </span>
                          <span className="block text-[10px] text-[#8C837A]">Recipient verified</span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Returned Outcome Branch */}
                    <div
                      className={`p-3 rounded-lg border mt-2 flex items-center justify-between gap-2 ${
                        progress.isReturned
                          ? 'bg-rose-500/15 border-rose-500/40 text-rose-800 dark:text-rose-300'
                          : 'bg-white/60 dark:bg-[#1E1C1A]/60 border-[#E5DFD7] dark:border-[#36312C] text-[#8C837A] dark:text-[#8A837C] opacity-75'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CornerDownRight className="w-4 h-4 text-rose-500 shrink-0" />
                        <div>
                          <span className="font-bold text-xs block">5. Returned (Outcome Branch)</span>
                          <span className="text-[10px] block opacity-80">
                            {progress.isReturned ? 'Genuine return / RTO outcome active' : 'No return / RTO requested'}
                          </span>
                        </div>
                      </div>
                      {progress.isReturned && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-600 text-white shrink-0">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Customer Details & Contact Information */}
                <div className="space-y-2 text-xs">
                  <h3 className="font-bold uppercase tracking-wider text-[#8C837A] dark:text-[#8A837C] text-[10px] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#5146E5]" />
                    <span>Customer Details & Contact Information</span>
                  </h3>
                  <div className="p-3.5 rounded-md bg-[#FAF7F2] dark:bg-[#24211F] border border-[#E5DFD7] dark:border-[#36312C] grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-[#8C837A] dark:text-[#8A837C] uppercase font-semibold block">Full Name</span>
                      <span className="font-bold text-sm block text-[#24211F] dark:text-[#E8E1DA] mt-0.5">
                        {selectedOrder.shippingAddress?.fullName || 'Valued Customer'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#8C837A] dark:text-[#8A837C] uppercase font-semibold block">Phone Number</span>
                      <span className="font-mono font-semibold text-xs block text-[#24211F] dark:text-[#E8E1DA] mt-0.5">
                        {selectedOrder.shippingAddress?.phone || 'Not Provided'}
                      </span>
                    </div>

                    <div className="sm:col-span-2 pt-1 border-t border-[#E5DFD7]/60 dark:border-[#36312C]/60">
                      <span className="text-[10px] text-[#8C837A] dark:text-[#8A837C] uppercase font-semibold block">Email Address</span>
                      <span className="font-mono text-xs block text-[#24211F] dark:text-[#E8E1DA] mt-0.5">
                        {selectedOrder.customerEmail || 'client@zimor.in'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Complete Delivery Address */}
                <div className="space-y-2 text-xs">
                  <h3 className="font-bold uppercase tracking-wider text-[#8C837A] dark:text-[#8A837C] text-[10px] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#5146E5]" />
                    <span>Complete Delivery Address</span>
                  </h3>
                  <div className="p-3.5 rounded-md bg-[#FAF7F2] dark:bg-[#24211F] border border-[#E5DFD7] dark:border-[#36312C] space-y-1">
                    <p className="font-semibold text-xs text-[#24211F] dark:text-[#E8E1DA]">
                      {selectedOrder.shippingAddress?.addressLine1}
                    </p>
                    {selectedOrder.shippingAddress?.addressLine2 && (
                      <p className="text-xs text-[#5A534E] dark:text-[#B4B4B4]">
                        {selectedOrder.shippingAddress?.addressLine2}
                      </p>
                    )}
                    <p className="text-xs text-[#5A534E] dark:text-[#B4B4B4] font-medium">
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} —{' '}
                      <span className="font-mono font-bold text-[#5146E5] dark:text-[#818CF8]">
                        {selectedOrder.shippingAddress?.pincode}
                      </span>
                    </p>
                  </div>
                </div>

                {/* 4. Product Details, Quantity and Order Amount */}
                <div className="space-y-2 text-xs">
                  <h3 className="font-bold uppercase tracking-wider text-[#8C837A] dark:text-[#8A837C] text-[10px] flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-[#5146E5]" />
                    <span>Product Details & Quantities ({selectedOrder.items?.length || 0})</span>
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-md bg-[#FAF7F2] dark:bg-[#24211F] border border-[#E5DFD7] dark:border-[#36312C]"
                      >
                        <div className="w-12 h-12 rounded bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden shrink-0 border border-[#E5DFD7] dark:border-[#36312C]">
                          <Image
                            src={
                              it.image ||
                              'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp'
                            }
                            alt={it.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate text-[#24211F] dark:text-[#E8E1DA]">{it.name}</p>
                          <p className="text-[11px] text-[#8C837A] dark:text-[#8A837C]">
                            {it.color ? (
                              <>
                                Color: <span className="font-medium text-[#24211F] dark:text-[#E8E1DA]">{it.color}</span> •{' '}
                              </>
                            ) : null}
                            Size:{' '}
                            <span className="font-medium text-[#24211F] dark:text-[#E8E1DA]">{it.size || 'Standard'}</span>
                          </p>
                          <p className="text-[11px] text-[#8C837A] dark:text-[#8A837C]">
                            Qty: <span className="font-bold">{it.quantity}</span> × ₹{it.price.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-sm text-[#24211F] dark:text-[#E8E1DA] block">
                            ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Razorpay Transaction Details */}
                <div className="space-y-2 text-xs">
                  <h3 className="font-bold uppercase tracking-wider text-[#8C837A] dark:text-[#8A837C] text-[10px] flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#5146E5]" />
                    <span>Razorpay Transaction Details</span>
                  </h3>
                  <div className="p-3.5 rounded-md bg-[#FAF7F2] dark:bg-[#24211F] border border-[#E5DFD7] dark:border-[#36312C] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[#8C837A] dark:text-[#8A837C]">Payment Method:</span>
                      <span className="font-semibold text-[#24211F] dark:text-[#E8E1DA]">
                        {selectedOrder.paymentMethod || 'Razorpay Gateway'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center font-mono">
                      <span className="text-[#8C837A] dark:text-[#8A837C]">Payment ID:</span>
                      <span className="font-semibold text-xs text-[#24211F] dark:text-[#E8E1DA]">
                        {selectedOrder.razorpayPaymentId || 'N/A'}
                      </span>
                    </div>

                    {selectedOrder.razorpayOrderId && (
                      <div className="flex justify-between items-center font-mono">
                        <span className="text-[#8C837A] dark:text-[#8A837C]">Razorpay Order ID:</span>
                        <span className="text-xs text-[#8C837A] dark:text-[#8A837C]">
                          {selectedOrder.razorpayOrderId}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-[#8C837A] dark:text-[#8A837C]">Payment Status:</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          selectedOrder.paymentStatus === 'Paid'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : selectedOrder.paymentStatus === 'Refunded'
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {selectedOrder.paymentStatus || 'Paid'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#E5DFD7]/60 dark:border-[#36312C]/60 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#8C837A] dark:text-[#8A837C]">Subtotal:</span>
                        <span>₹{(selectedOrder.subtotal || selectedOrder.total || 0).toLocaleString('en-IN')}</span>
                      </div>
                      {Boolean(selectedOrder.discount) && (
                        <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400">
                          <span>Discount:</span>
                          <span>-₹{selectedOrder.discount?.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs">
                        <span className="text-[#8C837A] dark:text-[#8A837C]">Shipping Fee:</span>
                        <span>{selectedOrder.shippingFee === 0 ? 'Complimentary' : `₹${selectedOrder.shippingFee}`}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-1 border-t border-[#E5DFD7]/60 dark:border-[#36312C]/60">
                        <span>Total Amount:</span>
                        <span className="text-[#5146E5] dark:text-[#818CF8]">
                          ₹{selectedOrder.total?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Chronological Shipment Timeline */}
                <div className="space-y-2 text-xs">
                  <h3 className="font-bold uppercase tracking-wider text-[#8C837A] dark:text-[#8A837C] text-[10px] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#5146E5]" />
                    <span>
                      Chronological Shipment Timeline (
                      {selectedOrder.trackingHistory?.length || 0} Events)
                    </span>
                  </h3>

                  {selectedOrder.trackingHistory && selectedOrder.trackingHistory.length > 0 ? (
                    <div className="p-3.5 rounded-md bg-[#FAF7F2] dark:bg-[#24211F] border border-[#E5DFD7] dark:border-[#36312C] max-h-48 overflow-y-auto space-y-3">
                      {selectedOrder.trackingHistory.map((s, idx) => (
                        <div
                          key={idx}
                          className="text-[11px] pb-2 border-b border-[#E5DFD7]/60 dark:border-[#36312C]/60 last:border-b-0 last:pb-0"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#5146E5] dark:text-[#818CF8]">{s.status}</span>
                            <span className="text-[10px] text-[#8C837A] dark:text-[#8A837C] font-mono">{s.date}</span>
                          </div>
                          <p className="text-[#24211F] dark:text-[#E8E1DA] mt-0.5">{s.activity}</p>
                          {s.location && (
                            <span className="text-[10px] text-[#8C837A] dark:text-[#8A837C] block mt-0.5">
                              Location: {s.location}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-md bg-[#FAF7F2] dark:bg-[#24211F] border border-[#E5DFD7] dark:border-[#36312C] text-center text-[11px] text-[#8C837A] dark:text-[#8A837C]">
                      Order confirmed. Tracking updates will populate here chronologically.
                    </div>
                  )}
                </div>

                {/* 7. Customer Return & Exchange Claim Review */}
                {selectedOrder.returnRequest && selectedOrder.returnRequest.status !== 'none' && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold uppercase tracking-wider text-[#8C837A] dark:text-[#8A837C] text-[10px] flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5 text-[#5146E5]" />
                        <span>Return & Exchange Request Review</span>
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          selectedOrder.returnRequest.status === 'requested'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                            : selectedOrder.returnRequest.status === 'approved'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : selectedOrder.returnRequest.status === 'completed'
                            ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {selectedOrder.returnRequest.status}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-md bg-[#FAF7F2] dark:bg-[#24211F] border border-[#E5DFD7] dark:border-[#36312C] space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-[#8C837A] dark:text-[#8A837C] uppercase font-semibold block">Claim Service</span>
                          <span className="font-bold text-[#24211F] dark:text-[#E8E1DA]">
                            {selectedOrder.returnRequest.type === 'exchange' ? 'Product Exchange' : 'Return & Refund'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#8C837A] dark:text-[#8A837C] uppercase font-semibold block">Policy Reason</span>
                          <span className="font-bold text-[#24211F] dark:text-[#E8E1DA]">
                            {selectedOrder.returnRequest.reason}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-[#8C837A] dark:text-[#8A837C] uppercase font-semibold block">Customer Description</span>
                        <p className="text-xs text-[#24211F] dark:text-[#E8E1DA] italic bg-white dark:bg-[#1E1C1A] p-2.5 rounded border border-[#E5DFD7] dark:border-[#36312C] mt-1">
                          &quot;{selectedOrder.returnRequest.details}&quot;
                        </p>
                      </div>

                      {selectedOrder.returnRequest.imageUrls && selectedOrder.returnRequest.imageUrls.length > 0 && (
                        <div>
                          <span className="text-[10px] text-[#8C837A] dark:text-[#8A837C] uppercase font-semibold block mb-1">
                            Photographic Evidence ({selectedOrder.returnRequest.imageUrls.length})
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {selectedOrder.returnRequest.imageUrls.map((url, idx) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block relative w-16 h-16 rounded border border-[#E5DFD7] dark:border-[#36312C] overflow-hidden hover:opacity-80 transition-opacity"
                              >
                                <Image src={url} alt={`Evidence ${idx + 1}`} fill className="object-cover" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedOrder.returnRequest.adminNotes && (
                        <div className="pt-2 border-t border-[#E5DFD7]/60 dark:border-[#36312C]/60 text-xs">
                          <span className="text-[10px] text-[#8C837A] dark:text-[#8A837C] uppercase font-semibold block">
                            Atelier Decision Notes ({selectedOrder.returnRequest.adminDecidedBy})
                          </span>
                          <p className="text-xs text-[#24211F] dark:text-[#E8E1DA] mt-0.5">
                            {selectedOrder.returnRequest.adminNotes}
                          </p>
                        </div>
                      )}

                      {selectedOrder.returnRequest.refundInitiated && (
                        <div className="p-2.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-900 dark:text-purple-300 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-bold block">Razorpay Refund Confirmed</span>
                            <span className="font-mono text-[11px]">Refund ID: {selectedOrder.returnRequest.refundId}</span>
                          </div>
                          <span className="font-bold text-sm">
                            ₹{(selectedOrder.returnRequest.refundAmount || selectedOrder.total).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}

                      {/* Reject Reason Modal / Inline Prompt */}
                      {showRejectPrompt && (
                        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded space-y-2">
                          <span className="text-xs font-bold text-rose-900 dark:text-rose-200 block">
                            Mandatory Rejection Reason (Policy Audit Log)
                          </span>
                          <input
                            type="text"
                            placeholder="e.g. Return request submitted outside the 24-hour delivery window / missing tags..."
                            value={returnRejectReason}
                            onChange={(e) => setReturnRejectReason(e.target.value)}
                            className="w-full p-2 text-xs rounded border border-rose-300 dark:border-rose-700 bg-white dark:bg-[#1E1C1A] text-black dark:text-white"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setShowRejectPrompt(false);
                                setReturnRejectReason('');
                              }}
                              className="px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-400"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewReturn('reject')}
                              disabled={!returnRejectReason.trim() || handlingReturnAction}
                              className="px-3 py-1 bg-rose-600 text-white rounded text-xs font-semibold disabled:opacity-50"
                            >
                              Confirm Rejection
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Admin Decision Action Buttons */}
                      <div className="pt-2 border-t border-[#E5DFD7]/60 dark:border-[#36312C]/60 flex flex-wrap items-center gap-2">
                        {selectedOrder.returnRequest.status === 'requested' && !showRejectPrompt && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleReviewReturn('approve')}
                              disabled={handlingReturnAction}
                              className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {handlingReturnAction ? 'Processing...' : 'Approve Return'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowRejectPrompt(true)}
                              disabled={handlingReturnAction}
                              className="px-3.5 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Decline Return
                            </button>
                          </>
                        )}

                        {(selectedOrder.returnRequest.status === 'approved' || selectedOrder.status === 'Returned') &&
                          !selectedOrder.returnRequest.refundInitiated &&
                          selectedOrder.paymentStatus !== 'Refunded' && (
                            <button
                              type="button"
                              onClick={handleExecuteRefund}
                              disabled={handlingReturnAction}
                              className="px-4 py-1.5 rounded bg-[#5146E5] hover:bg-[#4338CA] text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>
                                {handlingReturnAction
                                  ? 'Processing Refund...'
                                  : `Execute Razorpay Refund (₹${selectedOrder.total?.toLocaleString('en-IN')})`}
                              </span>
                            </button>
                          )}
                      </div>

                      {/* Physical Return & Atelier Quality Inspection / Restocking */}
                      {(selectedOrder.returnRequest.status === 'approved' ||
                        selectedOrder.returnRequest.status === 'completed' ||
                        selectedOrder.status === 'Returned') && (
                        <div className="pt-3 border-t border-[#E5DFD7]/60 dark:border-[#36312C]/60 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-[#8C837A] dark:text-[#8A837C] uppercase font-semibold block">
                              Atelier Physical Return & Inventory Restocking
                            </span>
                            {selectedOrder.returnRequest.totalRestockedQuantity !== undefined && (
                              <span className="text-[10px] text-neutral-500 font-mono">
                                Restocked: {selectedOrder.returnRequest.totalRestockedQuantity} • Quarantined: {selectedOrder.returnRequest.totalQuarantinedQuantity || 0}
                              </span>
                            )}
                          </div>

                          {/* Item-Level Partial Return & Quarantine Inspection Records */}
                          {selectedOrder.returnRequest.items && selectedOrder.returnRequest.items.length > 0 && (
                            <div className="space-y-2">
                              {selectedOrder.returnRequest.items.map((item, itIdx) => (
                                <div
                                  key={item.productId || itIdx}
                                  className="p-2.5 rounded border border-[#E5DFD7] dark:border-[#36312C] bg-[#FAF7F2]/60 dark:bg-[#1E1C1A]/60 text-xs space-y-1.5"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-[#24211F] dark:text-[#E8E1DA]">
                                      {item.name} {item.color ? `• ${item.color}` : ''}
                                    </span>
                                    <span className="text-[11px] text-[#8C837A] dark:text-[#8A837C]">
                                      Requested: <strong>{item.quantityRequested}</strong> of {item.quantityOrdered}
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                                    {item.restockedQuantity > 0 && (
                                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/40">
                                        ✓ Restocked: {item.restockedQuantity} unit(s)
                                      </span>
                                    )}
                                    {item.quarantinedQuantity > 0 && (
                                      <span className="text-rose-700 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900/40">
                                        ⚠ Quarantined: {item.quarantinedQuantity} unit(s)
                                      </span>
                                    )}
                                    {item.inspectionStatus === 'pending' && (
                                      <span className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/40">
                                        Awaiting Physical Receipt
                                      </span>
                                    )}
                                  </div>

                                  {/* Quarantine Resolution Controls */}
                                  {item.quarantined && item.quarantinedQuantity > 0 && (
                                    <div className="p-2 rounded bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex flex-wrap items-center justify-between gap-2 mt-1">
                                      <div>
                                        <span className="font-semibold text-rose-900 dark:text-rose-200 text-[11px] block">
                                          Quarantine Hold: {item.quarantineReason || 'Failed physical inspection'}
                                        </span>
                                        <span className="text-[10px] text-rose-700 dark:text-rose-400">
                                          Stock is NOT in sellable inventory. Explicit authorized release required.
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => handleReleaseQuarantine(item.productId, 'restock')}
                                          disabled={handlingReturnAction}
                                          className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] transition-colors cursor-pointer"
                                        >
                                          Release to Sellable Stock
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleReleaseQuarantine(item.productId, 'write_off')}
                                          disabled={handlingReturnAction}
                                          className="px-2 py-1 rounded bg-neutral-600 hover:bg-neutral-700 text-white font-semibold text-[10px] transition-colors cursor-pointer"
                                        >
                                          Write Off (Scrap)
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {selectedOrder.returnRequest.inventoryRestocked ? (
                            <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-300 text-xs flex items-center justify-between">
                              <div>
                                <span className="font-bold block">✓ Physical Inspection Completed & Approved Items Restocked</span>
                                <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                                  Restocked: {selectedOrder.returnRequest.totalRestockedQuantity} unit(s) • Inspected by {selectedOrder.returnRequest.inspectedBy || 'Atelier'}
                                </span>
                              </div>
                            </div>
                          ) : selectedOrder.returnRequest.inspectionStatus === 'failed' ? (
                            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-300 text-xs flex items-center justify-between">
                              <div>
                                <span className="font-bold block">⚠ Physical Inspection Failed — Stock Placed in Quarantine</span>
                                <span className="text-[11px] text-rose-700 dark:text-rose-400">
                                  Merchandise non-sellable • Quarantined ({selectedOrder.returnRequest.inspectedBy || 'Atelier'})
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs space-y-2">
                              <div>
                                <span className="font-bold block">Awaiting Atelier Physical Arrival & Inspection</span>
                                <span className="text-[11px] text-amber-700 dark:text-amber-400 block mt-0.5">
                                  Financial refund does not affect stock. Inventory is restocked strictly after physical item verification.
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleInspectReturn(true)}
                                  disabled={handlingReturnAction}
                                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  Accept & Restock Approved Items
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleInspectReturn(false)}
                                  disabled={handlingReturnAction}
                                  className="px-3 py-1.5 rounded bg-neutral-600 hover:bg-neutral-700 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  Mark Damaged (Quarantine All)
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Bottom Footer */}
              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="w-full py-2.5 rounded bg-[#24211F] text-[#FAF7F2] dark:bg-[#FAF7F2] dark:text-[#24211F] font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        );
      })(), document.body)}
    </div>
  );
}
