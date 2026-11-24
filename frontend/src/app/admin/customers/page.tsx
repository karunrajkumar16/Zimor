'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
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

  const totalLiveSpend = customers.reduce(
    (sum, c) => sum + (c.liveSpent ?? c.totalSpent ?? 0),
    0
  );
  const totalTestSpend = customers.reduce((sum, c) => sum + (c.testSpent ?? 0), 0);
  const totalOrdersCount = customers.reduce(
    (sum, c) => sum + (c.orderCount ?? c.orders?.length ?? 0),
    0
  );
  const liveOrdersTotal = customers.reduce((sum, c) => sum + (c.liveOrderCount ?? 0), 0);
  const testOrdersTotal = customers.reduce((sum, c) => sum + (c.testOrderCount ?? 0), 0);

  const cardBg = isDark
    ? 'bg-[#24211F] border-[#36312C]'
    : 'bg-[#FFFFFF] border-[#E5DFD7] shadow-xs';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Users Directory</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Comprehensive user directory, order frequencies, lifetime customer spend, and contact channels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${isDark ? 'bg-[#1E1C1A] border-[#36312C] text-[#B4B4B4]' : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#5A534E]'
            }`}>
            Total Users: {customers.length}
          </span>
        </div>
      </div>

      {/* KPI Cards Row (Matching Payments Overview System) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered Users */}
        <div className={`p-4 rounded-lg border ${cardBg}`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Registered Users
          </span>
          <p className="text-2xl font-bold mt-1 text-[#1C2434] dark:text-[#E2E8F0]">{customers.length}</p>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
            Active customer profiles in database
          </p>
        </div>

        {/* Card 2: Total Customer Orders */}
        <div className={`p-4 rounded-lg border ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
              Customer Orders
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {totalOrdersCount} Total
            </span>
          </div>
          <p className="text-2xl font-bold mt-1 text-[#1C2434] dark:text-[#E2E8F0]">{totalOrdersCount}</p>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
            {liveOrdersTotal} Live • {testOrdersTotal} Test Mode
          </p>
        </div>

        {/* Card 3: Live Genuine Revenue */}
        <div className={`p-4 rounded-lg border ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
              Live Revenue
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20">
              Live
            </span>
          </div>
          <p className="text-2xl font-bold mt-1 text-[#2E7D5A] dark:text-[#52B788]">
            ₹{totalLiveSpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
            Captured production orders
          </p>
        </div>

        {/* Card 4: Test Mode Volume */}
        <div className={`p-4 rounded-lg border ${cardBg}`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
              Test Mode Volume
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-500/20">
              Test
            </span>
          </div>
          <p className="text-2xl font-bold mt-1 text-[#5146E5] dark:text-[#818CF8]">
            ₹{totalTestSpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
            Razorpay sandbox captured
          </p>
        </div>
      </div>

      {/* Users Directory Table */}
      <div className={`rounded-lg border overflow-hidden ${cardBg}`}>
        {/* Search Bar */}
        <div className={`p-4 border-b flex items-center justify-between gap-3 ${isDark ? 'border-[#36312C]' : 'border-[#E5DFD7]'}`}>
          <div className="relative w-full max-w-md">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name, email, phone..."
              className={`w-full pl-9 pr-4 py-2 border rounded text-xs focus:outline-none focus:border-[#5146E5] transition-colors ${isDark
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
                className={`border-b font-medium uppercase tracking-wider text-[10px] ${isDark
                  ? 'border-[#36312C] bg-[#1E1C1A] text-[#B4B4B4]'
                  : 'border-[#E5DFD7] bg-[#EEE8DF] text-[#5A534E]'
                  }`}
              >
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Total Spend</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#36312C]' : 'divide-[#E5DFD7]'}`}>
              {loading ? (
                <tr>
                  <td colSpan={6} className={`py-12 text-center text-xs ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                    Loading registered users...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`py-12 text-center text-xs ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                    No registered users found. Customer profiles will appear here as orders are placed.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const orderCount = cust.orderCount ?? cust.orders?.length ?? 0;
                  const totalSpent = cust.totalSpent || 0;

                  return (
                    <tr
                      key={cust.id}
                      className={`transition-colors ${isDark ? 'hover:bg-[#2C2825]' : 'hover:bg-[#F3EEE6]'
                        }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] border ${isDark
                              ? 'bg-[#1E1C1A] border-[#36312C] text-[#818CF8]'
                              : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#5146E5]'
                              }`}
                          >
                            {cust.name ? cust.name[0].toUpperCase() : 'P'}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold">
                              {cust.name}
                            </span>
                            {(cust.isDemo || cust.name?.includes('[DEMO]') || cust.email?.includes('zimor-test.internal')) && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                                DEMO
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className={`py-3.5 px-4 font-mono ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                        {cust.email}
                      </td>

                      <td className={`py-3.5 px-4 font-mono ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                        {cust.phone || '—'}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-[#1C2434] dark:text-[#E2E8F0]">
                        <div>
                          <span>{orderCount} order{orderCount !== 1 ? 's' : ''}</span>
                          {(cust.testOrderCount ?? 0) > 0 && (
                            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-normal block">
                              {cust.liveOrderCount ?? 0} live • {cust.testOrderCount} test
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-[#1C2434] dark:text-[#E2E8F0]">
                        <div>
                          {cust.liveSpent && cust.liveSpent > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <span>₹{cust.liveSpent.toLocaleString('en-IN')}</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20">Live</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-normal">
                              <span>₹0</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20">Live</span>
                            </div>
                          )}
                          {cust.testSpent && cust.testSpent > 0 ? (
                            <div className="flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 mt-0.5">
                              <span>₹{cust.testSpent.toLocaleString('en-IN')}</span>
                              <span className="px-1 py-0.2 rounded text-[9px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-500/20">Test</span>
                            </div>
                          ) : null}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedCustomer(cust)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${isDark
                            ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA] hover:border-[#5146E5]'
                            : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#24211F] hover:border-[#5146E5]'
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
            className={`w-full max-w-md p-6 rounded-lg border shadow-2xl space-y-4 ${isDark ? 'bg-[#24211F] border-[#36312C] text-[#E8E1DA]' : 'bg-[#FFFFFF] border-[#E5DFD7] text-[#24211F]'
              }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-[#36312C]' : 'border-[#E5DFD7]'
              }`}>
              <h3 className="text-sm font-bold">User Profile</h3>
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
                <p className="font-semibold text-sm">
                  {selectedCustomer.orderCount ?? selectedCustomer.orders?.length ?? 0} orders
                  {(selectedCustomer.testOrderCount ?? 0) > 0 && (
                    <span className="text-xs font-normal text-amber-600 dark:text-amber-400 ml-1.5">
                      ({selectedCustomer.liveOrderCount ?? 0} Live • {selectedCustomer.testOrderCount} Test Mode)
                    </span>
                  )}
                </p>
              </div>

              <div>
                <span className={`text-[10px] font-semibold uppercase ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>Cumulative Lifetime Spend</span>
                <div className="space-y-1.5 mt-1 border rounded-lg p-2.5 bg-slate-50 dark:bg-[#1E1C1A] border-slate-200 dark:border-[#36312C]">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#64748B] dark:text-[#94A3B8]">Live Production:</span>
                      <span className="px-1 py-0.2 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20">Live</span>
                    </div>
                    <span className="font-bold text-[#2E7D5A] dark:text-[#52B788]">
                      ₹{(selectedCustomer.liveSpent ?? 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-dashed border-slate-200 dark:border-[#36312C]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#64748B] dark:text-[#94A3B8]">Test Mode Spend:</span>
                      <span className="px-1 py-0.2 rounded text-[9px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-500/20">Test</span>
                    </div>
                    <span className="font-bold text-amber-700 dark:text-amber-400">
                      ₹{(selectedCustomer.testSpent ?? 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedCustomer(null)}
              className="w-full mt-4 py-2 rounded bg-[#5146E5] hover:bg-[#4338CA] text-[#F7F5F2] font-semibold text-xs transition-colors shadow-xs"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
