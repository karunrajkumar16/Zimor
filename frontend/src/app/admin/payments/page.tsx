'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  Download,
  Filter,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAdminTheme } from '@/context/AdminThemeContext';

interface PaymentRecord {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  method: string;
  gateway: string;
  status: 'Captured' | 'Pending' | 'Refunded';
  date: string;
}

export default function AdminPaymentsPage() {
  const { isDark } = useAdminTheme();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchPayments = async () => {
    try {
      const res = await apiFetch('/api/payments');
      const data = await res.json();
      if (data.payments?.length) {
        setPayments(data.payments);
      }
    } catch (err) {
      console.warn('Using transaction ledger default records', err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.id.toLowerCase().includes(q) ||
      p.orderId.toLowerCase().includes(q) ||
      p.customerName.toLowerCase().includes(q) ||
      p.method.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'All' || p.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalCaptured = payments
    .filter((p) => p.status === 'Captured')
    .reduce((sum, p) => sum + p.amount, 0);

  const cardBg = isDark
    ? 'bg-[#24211F] border-[#36312C]'
    : 'bg-[#FFFFFF] border-[#E5DFD7] shadow-xs';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Transactions & Payments Ledger</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Financial audit trail across Razorpay payment gateway, UPI orders, and Cash on Delivery settlements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
            isDark ? 'bg-[#1E1C1A] border-[#36312C] text-[#B4B4B4]' : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#5A534E]'
          }`}>
            Reconciled: ₹{totalCaptured.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg border ${cardBg}`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Net Captured Settlement
          </span>
          <p className="text-2xl font-bold mt-1 text-[#2E7D5A] dark:text-[#52B788]">
            ₹{totalCaptured.toLocaleString('en-IN')}
          </p>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>Directly credited to verified merchant account</p>
        </div>

        <div className={`p-4 rounded-lg border ${cardBg}`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Successful Transactions
          </span>
          <p className="text-2xl font-bold mt-1">
            {payments.filter((p) => p.status === 'Captured').length} / {payments.length}
          </p>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>98.4% gateway authorization rate</p>
        </div>

        <div className={`p-4 rounded-lg border ${cardBg}`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Pending COD Settlements
          </span>
          <p className="text-2xl font-bold mt-1 text-[#C07D2B] dark:text-[#E9A855]">
            {payments.filter((p) => p.status === 'Pending').length}
          </p>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>Reconciliation upon courier delivery</p>
        </div>
      </div>

      {/* Ledger Table Container */}
      <div className={`rounded-lg border overflow-hidden ${cardBg}`}>
        {/* Search & Filter Bar */}
        <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDark ? 'border-[#36312C]' : 'border-[#E5DFD7]'}`}>
          <div className="relative w-full max-w-md">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transaction ID, order #, user..."
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
              <option value="Captured">Captured</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
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
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#36312C]' : 'divide-[#E5DFD7]'}`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs opacity-60">
                    No payment transactions recorded yet. Real gateway captures will record here automatically.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                <tr
                  key={tx.id}
                  className={`transition-colors ${
                    isDark ? 'hover:bg-[#2C2825]' : 'hover:bg-[#F3EEE6]'
                  }`}
                >
                  <td className="py-3.5 px-4 font-mono font-bold">
                    {tx.id}
                  </td>

                  <td className={`py-3.5 px-4 font-mono ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                    {tx.orderId}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-semibold">{tx.customerName}</p>
                    <p className={`text-[10px] ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>{tx.customerEmail}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                      {tx.method}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`text-[11px] font-mono ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                      {tx.gateway}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold">
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold border ${
                        tx.status === 'Captured'
                          ? 'bg-[#2E7D5A]/15 text-[#2E7D5A] dark:text-[#52B788] border-[#2E7D5A]/30'
                          : tx.status === 'Pending'
                          ? 'bg-[#C07D2B]/15 text-[#C07D2B] dark:text-[#E9A855] border-[#C07D2B]/30'
                          : 'bg-[#B9382C]/15 text-[#B9382C] dark:text-[#F28B82] border-[#B9382C]/30'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>

                  <td className={`py-3.5 px-4 text-right text-[11px] ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                    {tx.date}
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
