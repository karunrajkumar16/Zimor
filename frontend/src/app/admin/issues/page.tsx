'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  Search,
  CheckCircle,
  Clock,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  Filter,
  X,
  FileText,
  User,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAdminTheme } from '@/context/AdminThemeContext';

interface IssueTicket {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  category: 'Transit Damage' | 'Hardware Defect' | 'Size Exchange' | 'Return Request' | 'Missing Accessory';
  description: string;
  date: string;
  status: 'Open' | 'Under Review' | 'Replacement Sent' | 'Refund Issued' | 'Resolved';
  resolutionNote?: string;
}

export default function AdminIssuesPage() {
  const { isDark } = useAdminTheme();
  const [issues, setIssues] = useState<IssueTicket[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIssue, setSelectedIssue] = useState<IssueTicket | null>(null);
  const [newResolutionNote, setNewResolutionNote] = useState('');

  const filtered = issues.filter((iss) => {
    const q = search.toLowerCase();
    const matchesSearch =
      iss.id.toLowerCase().includes(q) ||
      iss.orderNumber.toLowerCase().includes(q) ||
      iss.customerName.toLowerCase().includes(q) ||
      iss.category.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'All' || iss.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (id: string, newStatus: IssueTicket['status']) => {
    setIssues((prev) =>
      prev.map((iss) =>
        iss.id === id
          ? {
              ...iss,
              status: newStatus,
              resolutionNote: newResolutionNote || iss.resolutionNote,
            }
          : iss
      )
    );
    if (selectedIssue && selectedIssue.id === id) {
      setSelectedIssue({
        ...selectedIssue,
        status: newStatus,
        resolutionNote: newResolutionNote || selectedIssue.resolutionNote,
      });
    }
    setNewResolutionNote('');
  };

  const openCount = issues.filter((i) => i.status === 'Open' || i.status === 'Under Review').length;

  const cardBg = isDark
    ? 'bg-[#24211F] border-[#36312C]'
    : 'bg-[#FFFFFF] border-[#E5DFD7] shadow-xs';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Order Issues & Returns Resolution Desk</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Manage user support tickets, defect claims, transit damages, and size exchange requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
              openCount > 0
                ? 'bg-[#B44220]/15 border-[#B44220]/30 text-[#B44220] dark:text-[#E07A5F]'
                : 'bg-[#2E7D5A]/15 border-[#2E7D5A]/30 text-[#2E7D5A] dark:text-[#52B788]'
            }`}
          >
            {openCount} Open Action Item{openCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg border ${cardBg}`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Active Tickets
          </span>
          <p className="text-2xl font-bold mt-1 text-[#B44220] dark:text-[#E07A5F]">{openCount}</p>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>Requires customer concierge attention</p>
        </div>

        <div className={`p-4 rounded-lg border ${cardBg}`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Resolved Cases
          </span>
          <p className="text-2xl font-bold mt-1 text-[#2E7D5A] dark:text-[#52B788]">
            {issues.filter((i) => i.status === 'Resolved').length}
          </p>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>Replaced or resolved under 7-day guarantee</p>
        </div>

        <div className={`p-4 rounded-lg border ${cardBg}`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
            Average Resolution Time
          </span>
          <p className="text-2xl font-bold mt-1 text-[#C86D48] dark:text-[#D1825F]">
            {issues.length === 0 ? '—' : '18.4 Hours'}
          </p>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>Target SLA: &lt; 24 hours</p>
        </div>
      </div>

      {/* Table Container */}
      <div className={`rounded-lg border overflow-hidden ${cardBg}`}>
        {/* Search & Filter */}
        <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDark ? 'border-[#36312C]' : 'border-[#E5DFD7]'}`}>
          <div className="relative w-full max-w-md">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticket #, order #, user, reason..."
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
              <option value="Open">Open</option>
              <option value="Under Review">Under Review</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Tickets Table */}
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
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Issue Category</th>
                <th className="py-3 px-4">Date Filed</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#36312C]' : 'divide-[#E5DFD7]'}`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`py-12 text-center text-xs ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                    No customer issues or support tickets recorded.
                  </td>
                </tr>
              ) : (
                filtered.map((iss) => (
                <tr
                  key={iss.id}
                  className={`transition-colors cursor-pointer ${
                    isDark ? 'hover:bg-[#2C2825]' : 'hover:bg-[#F3EEE6]'
                  }`}
                  onClick={() => setSelectedIssue(iss)}
                >
                  <td className="py-3.5 px-4 font-mono font-bold">
                    {iss.id}
                  </td>

                  <td className={`py-3.5 px-4 font-mono ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                    {iss.orderNumber}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-semibold">{iss.customerName}</p>
                    <p className={`text-[10px] ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>{iss.customerPhone}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`font-medium ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>
                      {iss.category}
                    </span>
                  </td>

                  <td className={`py-3.5 px-4 text-[11px] ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                    {iss.date}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold border ${
                        iss.status === 'Resolved'
                          ? 'bg-[#2E7D5A]/15 text-[#2E7D5A] dark:text-[#52B788] border-[#2E7D5A]/30'
                          : iss.status === 'Under Review'
                          ? 'bg-[#C07D2B]/15 text-[#C07D2B] dark:text-[#E9A855] border-[#C07D2B]/30'
                          : 'bg-[#B9382C]/15 text-[#B9382C] dark:text-[#F28B82] border-[#B9382C]/30'
                      }`}
                    >
                      {iss.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIssue(iss);
                      }}
                      className={`px-3 py-1 rounded text-xs font-semibold border transition-colors ${
                        isDark
                          ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA] hover:border-[#B44220]'
                          : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#24211F] hover:border-[#B44220]'
                      }`}
                    >
                      Resolve
                    </button>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details & Resolution Slide-Over */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-md h-full overflow-y-auto p-6 flex flex-col justify-between border-l shadow-2xl ${
              isDark ? 'bg-[#24211F] border-[#36312C] text-[#E8E1DA]' : 'bg-[#FFFFFF] border-[#E5DFD7] text-[#24211F]'
            }`}
          >
            <div className="space-y-6">
              {/* Header */}
              <div className={`flex items-center justify-between border-b pb-4 ${isDark ? 'border-[#36312C]' : 'border-[#E5DFD7]'}`}>
                <div>
                  <span className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                    Resolution Ticket
                  </span>
                  <h2 className="text-lg font-bold font-mono">{selectedIssue.id}</h2>
                  <p className={`text-xs ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>Order: {selectedIssue.orderNumber}</p>
                </div>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className={`p-1.5 rounded-full transition-colors ${isDark ? 'hover:bg-[#1E1C1A] text-[#8A837C]' : 'hover:bg-[#FAF7F2] text-[#8C837A]'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Info */}
              <div className={`p-3.5 rounded-md border text-xs space-y-1 ${
                isDark ? 'bg-[#1E1C1A] border-[#36312C]' : 'bg-[#FAF7F2] border-[#E5DFD7]'
              }`}>
                <p className="font-bold">{selectedIssue.customerName}</p>
                <p className={`font-mono ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Email: {selectedIssue.customerEmail}</p>
                <p className={`font-mono ${isDark ? 'text-[#B4B4B4]' : 'text-[#5A534E]'}`}>Phone: {selectedIssue.customerPhone}</p>
                <p className="text-[11px] text-[#B44220] dark:text-[#E07A5F] font-semibold pt-1">
                  Issue Category: {selectedIssue.category}
                </p>
              </div>

              {/* User Description */}
              <div className="space-y-1.5 text-xs">
                <span className={`font-bold uppercase tracking-wider text-[10px] ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                  User Statement
                </span>
                <p className={`p-3 rounded border leading-relaxed ${
                  isDark ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA]' : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#24211F]'
                }`}>
                  {selectedIssue.description}
                </p>
              </div>

              {/* Existing Resolution Note if any */}
              {selectedIssue.resolutionNote && (
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[#2E7D5A] dark:text-[#52B788]">
                    Resolution Action Logged
                  </span>
                  <p className="p-3 rounded border border-[#2E7D5A]/30 bg-[#2E7D5A]/10 leading-relaxed">
                    {selectedIssue.resolutionNote}
                  </p>
                </div>
              )}

              {/* Update Status Actions */}
              <div className="space-y-3 text-xs pt-2">
                <span className={`font-bold uppercase tracking-wider text-[10px] ${isDark ? 'text-[#8A837C]' : 'text-[#8C837A]'}`}>
                  Update Ticket Status
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(['Under Review', 'Replacement Sent', 'Refund Issued', 'Resolved'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedIssue.id, st)}
                      className={`p-2 rounded text-xs font-semibold border transition-all ${
                        selectedIssue.status === st
                          ? 'bg-[#B44220] text-[#F7F5F2] border-[#B44220] font-bold shadow-xs'
                          : isDark
                          ? 'bg-[#1E1C1A] border-[#36312C] text-[#B4B4B4] hover:border-[#B44220]'
                          : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#5A534E] hover:border-[#B44220]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-[10px] font-semibold mb-1">Add Resolution Note</label>
                  <textarea
                    rows={2}
                    value={newResolutionNote}
                    onChange={(e) => setNewResolutionNote(e.target.value)}
                    placeholder="e.g. Reverse pickup initiated via BlueDart AWB #..."
                    className={`w-full p-2.5 rounded border text-xs focus:outline-none focus:border-[#B44220] transition-colors ${
                      isDark
                        ? 'bg-[#1E1C1A] border-[#36312C] text-[#E8E1DA] placeholder-[#8A837C]'
                        : 'bg-[#FAF7F2] border-[#E5DFD7] text-[#24211F] placeholder-[#8C837A]'
                    }`}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedIssue(null)}
              className="mt-6 w-full py-2.5 rounded bg-[#B44220] hover:bg-[#9B381B] text-[#F7F5F2] font-semibold text-xs shadow-xs transition-colors"
            >
              Done & Close Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
