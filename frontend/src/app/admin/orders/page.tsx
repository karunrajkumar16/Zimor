'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  X,
  User,
  MapPin,
  CreditCard,
  Package,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAdminTheme } from '@/context/AdminThemeContext';
import type { Order } from '@/types';

const STATUS_TABS = ['All', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrdersPage() {
  const { isDark } = useAdminTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [awbInput, setAwbInput] = useState('');
  const [courierInput, setCourierInput] = useState('BlueDart Express');

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const res = await apiFetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          trackingNumber: awbInput || undefined,
          courierName: courierInput || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId || o.orderNumber === orderId ? data.order : o))
        );
        if (selectedOrder?.id === orderId || selectedOrder?.orderNumber === orderId) {
          setSelectedOrder(data.order);
        }
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdating(false);
    }
  };

  const openOrderModal = (ord: Order) => {
    setSelectedOrder(ord);
    setAwbInput(ord.trackingNumber || '');
    setCourierInput(ord.courierName || 'BlueDart Express');
  };

  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === 'All' || o.status.toLowerCase() === activeTab.toLowerCase();
    const query = search.toLowerCase();
    const matchesSearch =
      o.orderNumber?.toLowerCase().includes(query) ||
      o.shippingAddress?.fullName?.toLowerCase().includes(query) ||
      o.shippingAddress?.phone?.includes(query);
    return matchesTab && matchesSearch;
  });

  const cardBg = isDark
    ? 'bg-[#24211F] border-[#36312C]'
    : 'bg-[#FFFFFF] border-[#E5DFD7] shadow-xs';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#24211F] dark:text-[#E8E1DA]">Orders Pipeline</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Track customer orders, manage shipments, and update dispatch tracking numbers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
            isDark ? 'bg-[#1E1C1A] border-[#36312C] text-[#B4B4B4]' : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#5A534E]'
          }`}>
            Total Orders: {orders.length}
          </span>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className={`rounded-lg border overflow-hidden ${cardBg}`}>
        {/* Status Filter Tabs & Search */}
        <div className={`p-4 border-b space-y-4 ${isDark ? 'border-[#36312C]' : 'border-[#E5DFD7]'}`}>
          <div className="flex flex-wrap items-center gap-1">
            {STATUS_TABS.map((tab) => {
              const count =
                tab === 'All'
                  ? orders.length
                  : orders.filter((o) => o.status.toLowerCase() === tab.toLowerCase()).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activeTab === tab
                      ? 'bg-[#B44220] text-[#F7F5F2] shadow-xs'
                      : isDark
                      ? 'text-[#B4B4B4] hover:text-[#E8E1DA] hover:bg-[#2A2724]'
                      : 'text-[#5A534E] hover:text-[#24211F] hover:bg-[#EFEAE2]'
                  }`}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>

          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-[#8C837A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, customer name, phone..."
              className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] dark:bg-[#1E1C1A] border border-[#E5DFD7] dark:border-[#36312C] rounded text-xs text-[#24211F] dark:text-[#E8E1DA] focus:outline-none focus:border-[#B44220]"
            />
          </div>
        </div>

        {/* Orders Table */}
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
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Patron</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DFD7] dark:divide-[#36312C]">
              {filteredOrders.map((ord) => {
                const statusBadge =
                  ord.status === 'Delivered'
                    ? 'bg-[#2E7D5A]/10 text-[#25684A] dark:bg-[#2E7D5A]/15 dark:text-[#62C697] border border-[#2E7D5A]/25'
                    : ord.status === 'Shipped'
                    ? 'bg-[#C86D48]/10 text-[#9B4D2C] dark:bg-[#C86D48]/15 dark:text-[#E28965] border border-[#C86D48]/25'
                    : ord.status === 'Processing'
                    ? 'bg-[#C07D2B]/10 text-[#9C611B] dark:bg-[#C07D2B]/15 dark:text-[#F0B265] border border-[#C07D2B]/25'
                    : 'bg-[#B44220]/10 text-[#B44220] dark:bg-[#B44220]/15 dark:text-[#E8A593] border border-[#B44220]/25';

                return (
                  <tr
                    key={ord.id}
                    className="hover:bg-[#F3EEE6] dark:hover:bg-[#2C2825] transition-colors cursor-pointer"
                    onClick={() => openOrderModal(ord)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#B44220] dark:text-[#E07A5F]">
                      {ord.orderNumber}
                    </td>

                    <td className="py-3.5 px-4 text-[#8C837A] dark:text-[#8A837C]">
                      {ord.date}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#24211F] dark:text-[#E8E1DA]">
                        {ord.shippingAddress?.fullName || 'Patron'}
                      </p>
                      <p className="text-[10px] text-[#8C837A] dark:text-[#8A837C]">
                        {ord.shippingAddress?.phone}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {ord.items?.map((it, idx) => (
                          <div
                            key={idx}
                            title={`${it.name} (${it.color})`}
                            className="w-8 h-8 rounded bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden border border-slate-200 dark:border-neutral-700 shrink-0"
                          >
                            <Image
                              src={it.image || 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp'}
                              alt={it.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                        <span className="text-[11px] text-slate-500 ml-1">
                          {ord.items?.length || 1} item
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold">
                      ₹{ord.total?.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${statusBadge}`}>
                        {ord.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openOrderModal(ord);
                        }}
                        className="px-3 py-1 rounded bg-[#FAF7F2] dark:bg-[#1E1C1A] text-xs font-semibold hover:bg-[#EFEAE2] dark:hover:bg-[#2A2724] border border-[#E5DFD7] dark:border-[#36312C] text-[#24211F] dark:text-[#E8E1DA] transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Slide-Over Inspector */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg h-full overflow-y-auto p-6 flex flex-col justify-between border-l shadow-2xl ${
              isDark ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA]' : 'bg-[#FFFFFF] border-[#E5DFD7] text-[#24211F]'
            }`}
          >
            <div className="space-y-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b pb-4 border-[#E5DFD7] dark:border-[#36312C]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C837A] dark:text-[#8A837C]">
                    Order Details
                  </span>
                  <h2 className="text-lg font-bold font-mono text-[#B44220] dark:text-[#E07A5F]">{selectedOrder.orderNumber}</h2>
                  <p className="text-xs text-[#8C837A] dark:text-[#8A837C]">{selectedOrder.date}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-full hover:bg-[#FAF7F2] dark:hover:bg-[#24211F] text-[#8C837A] dark:text-[#8A837C]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Update Card */}
              <div className="p-4 rounded-lg bg-[#FAF7F2] dark:bg-[#24211F] border border-[#E5DFD7] dark:border-[#36312C] space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5A534E] dark:text-[#B4B4B4]">
                  Update Fulfillment Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedOrder.id || selectedOrder.orderNumber, st)}
                      disabled={updating}
                      className={`py-1.5 px-2 rounded text-xs font-semibold transition-all border ${
                        selectedOrder.status === st
                          ? 'bg-[#B44220] text-[#F7F5F2] border-transparent font-bold shadow-xs'
                          : 'bg-[#FFFFFF] dark:bg-[#1E1C1A] border-[#E5DFD7] dark:border-[#36312C] text-[#5A534E] dark:text-[#B4B4B4] hover:border-[#B44220]/50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold mb-1 text-[#8C837A] dark:text-[#8A837C]">Courier Partner</label>
                    <input
                      type="text"
                      value={courierInput}
                      onChange={(e) => setCourierInput(e.target.value)}
                      placeholder="e.g. BlueDart Express"
                      className="w-full px-2.5 py-1.5 rounded bg-[#FFFFFF] dark:bg-[#1E1C1A] border border-[#E5DFD7] dark:border-[#36312C] text-[#24211F] dark:text-[#E8E1DA] text-xs focus:outline-none focus:border-[#B44220]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold mb-1">AWB Tracking #</label>
                    <input
                      type="text"
                      value={awbInput}
                      onChange={(e) => setAwbInput(e.target.value)}
                      placeholder="e.g. ZMR-EXP-829104"
                      className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Purchased Silhouettes
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-md border border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50"
                    >
                      <div className="w-12 h-12 rounded bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden shrink-0 border border-slate-200 dark:border-neutral-700">
                        <Image
                          src={it.image || 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp'}
                          alt={it.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <p className="font-bold truncate">{it.name}</p>
                        <p className="text-[11px] text-slate-500">
                          Color: {it.color} • Qty: {it.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-xs">
                        ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-2 text-xs">
                <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                  Delivery Address & Contact
                </h3>
                <div className="p-3.5 rounded-md border border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {selectedOrder.shippingAddress?.fullName}
                  </p>
                  <p className="text-slate-600 dark:text-neutral-400">
                    {selectedOrder.shippingAddress?.addressLine1}
                  </p>
                  {selectedOrder.shippingAddress?.addressLine2 && (
                    <p className="text-slate-600 dark:text-neutral-400">
                      {selectedOrder.shippingAddress?.addressLine2}
                    </p>
                  )}
                  <p className="text-slate-600 dark:text-neutral-400">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} — {selectedOrder.shippingAddress?.pincode}
                  </p>
                  <p className="text-slate-600 dark:text-neutral-400 pt-1 font-mono">
                    Phone: {selectedOrder.shippingAddress?.phone}
                  </p>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-2 text-xs border-t pt-4 border-slate-100 dark:border-neutral-800">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping Fee</span>
                  <span>{selectedOrder.shippingFee === 0 ? 'Complimentary' : `₹${selectedOrder.shippingFee}`}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount</span>
                    <span>-₹{selectedOrder.discount?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-2 border-t border-slate-100 dark:border-neutral-800">
                  <span>Final Total</span>
                  <span>₹{selectedOrder.total?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-6 w-full py-2.5 rounded bg-black text-white dark:bg-white dark:text-black font-semibold text-xs"
            >
              Done & Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
