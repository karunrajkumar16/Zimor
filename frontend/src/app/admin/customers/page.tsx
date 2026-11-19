'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  User,
  Mail,
  Phone,
  ShoppingBag,
  Calendar,
  CheckCircle,
  Download,
  Filter,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAdminTheme } from '@/context/AdminThemeContext';
import type { Customer } from '@/types';

export default function AdminCustomersPage() {
  const { isDark } = useAdminTheme();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/customers');
      const data = await res.json();
      if (data.customers) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    );
  });

  const totalSpendAll = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const vipCount = customers.filter((c) => (c.orders?.length || 0) > 1 || (c.totalSpent || 0) > 5000).length;

  const cardBg = isDark
    ? 'bg-[#24211F] border-[#36312C]'
    : 'bg-[#FFFFFF] border-[#E5DFD7] shadow-xs';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Users & Patrons CRM</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Comprehensive patron directory, order frequencies, lifetime customer spend, and contact channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
            isDark ? 'bg-[#1E1C1A] border-[#36312C] text-[#B4B4B4]' : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#5A534E]'
          }`}>
            Total Patrons: {customers.length}
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg border ${cardBg}`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Registered Patrons
          </span>
          <p className="text-2xl font-bold mt-1">{customers.length}</p>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>Acquired through storefront checkout</p>
        </div>

        <div className={`p-4 rounded-lg border ${cardBg}`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            VIP Repeat Patrons
          </span>
          <p className="text-2xl font-bold mt-1 text-[#B44220] dark:text-[#E07A5F]">{vipCount}</p>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>Multi-silhouette purchasers</p>
        </div>

        <div className={`p-4 rounded-lg border ${cardBg}`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Cumulative Lifetime Spend
          </span>
          <p className="text-2xl font-bold mt-1 text-[#2E7D5A] dark:text-[#52B788]">
            ₹{totalSpendAll.toLocaleString('en-IN')}
          </p>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>Gross patron lifetime value</p>
        </div>
      </div>

      {/* Patrons Directory Table */}
      <div className={`rounded-lg border overflow-hidden ${cardBg}`}>
        {/* Search Bar */}
        <div className={`p-4 border-b flex items-center justify-between gap-3 ${isDark ? 'border-[#36312C]' : 'border-[#E5DFD7]'}`}>
          <div className="relative w-full max-w-md">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patrons by name, email, phone..."
              className={`w-full pl-9 pr-4 py-2 border rounded text-xs focus:outline-none focus:border-[#B44220] transition-colors ${
                isDark
                  ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA] placeholder-[#8A837C]'
                  : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#24211F] placeholder-[#8C837A]'
              }`}
            />
          </div>

          <span className={`text-xs ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
            Showing {filteredCustomers.length} of {customers.length}
          </span>
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
                <th className="py-3 px-4">Patron Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Total Spend</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#36312C]' : 'divide-[#E5DFD7]'}`}>
              {loading ? (
                <tr>
                  <td colSpan={7} className={`py-12 text-center text-xs ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                    Loading registered patrons...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`py-12 text-center text-xs ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                    No registered patrons found. Customer profiles will appear here as orders are placed.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const orderCount = cust.orders?.length || 0;
                  const totalSpent = cust.totalSpent || 0;
                  const isVip = orderCount > 1 || totalSpent > 5000;

                  return (
                    <tr
                      key={cust.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-[#2C2825]' : 'hover:bg-[#F3EEE6]'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] border ${
                              isDark
                                ? 'bg-[#1E1C1A] border-[#36312C] text-[#E07A5F]'
                                : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#B44220]'
                            }`}
                          >
                            {cust.name ? cust.name[0].toUpperCase() : 'P'}
                          </div>
                          <span className="font-semibold">
                            {cust.name}
                          </span>
                        </div>
                      </td>

                      <td className={`py-3.5 px-4 font-mono ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                        {cust.email}
                      </td>

                      <td className={`py-3.5 px-4 font-mono ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                        {cust.phone || '—'}
                      </td>

                      <td className="py-3.5 px-4 font-semibold">
                        {orderCount} order{orderCount !== 1 ? 's' : ''}
                      </td>

                      <td className="py-3.5 px-4 font-bold">
                        ₹{totalSpent.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4">
                        {isVip ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#B44220]/15 text-[#B44220] dark:text-[#E07A5F] border border-[#B44220]/30">
                            VIP Patron
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            isDark
                              ? 'bg-[#1E1C1A] text-[#B4B4B4] border-[#36312C]'
                              : 'bg-[#EDE7DE] text-[#5A534E] border-[#E5DFD7]'
                          }`}>
                            Standard
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedCustomer(cust)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                            isDark
                              ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA] hover:border-[#B44220]'
                              : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#24211F] hover:border-[#B44220]'
                          }`}
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

      {/* Customer Inspector Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-md p-6 rounded-lg border shadow-2xl space-y-4 ${
              isDark ? 'bg-[#24211F] border-[#36312C] text-[#E8E1DA]' : 'bg-[#FFFFFF] border-[#E5DFD7] text-[#24211F]'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDark ? 'border-[#36312C]' : 'border-[#E5DFD7]'
            }`}>
              <h3 className="text-sm font-bold">Patron Profile</h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className={`transition-colors ${isDark ? 'text-[#8A837C] hover:text-[#E8E1DA]' : 'text-[#8C837A] hover:text-[#24211F]'}`}
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className={`text-[10px] font-semibold uppercase ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>Full Name</span>
                <p className="font-bold text-sm">{selectedCustomer.name}</p>
              </div>

              <div>
                <span className={`text-[10px] font-semibold uppercase ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>Email Address</span>
                <p className="font-mono">{selectedCustomer.email}</p>
              </div>

              <div>
                <span className={`text-[10px] font-semibold uppercase ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>Phone Number</span>
                <p className="font-mono">{selectedCustomer.phone || 'Not provided'}</p>
              </div>

              <div>
                <span className={`text-[10px] font-semibold uppercase ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>Lifetime Orders</span>
                <p className="font-semibold">{selectedCustomer.orders?.length || 1} orders</p>
              </div>

              <div>
                <span className={`text-[10px] font-semibold uppercase ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>Cumulative Spend</span>
                <p className="font-bold text-[#2E7D5A] dark:text-[#52B788] text-sm">
                  ₹{(selectedCustomer.totalSpent || 2999).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedCustomer(null)}
              className="w-full mt-4 py-2 rounded bg-[#B44220] hover:bg-[#9B381B] text-[#F7F5F2] font-semibold text-xs transition-colors shadow-xs"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
