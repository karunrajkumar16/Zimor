'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';

export default function AdminErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin Portal runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#B44220]/15 text-[#B44220] flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
      </div>
      <h2 className="text-lg font-bold text-[#24211F] dark:text-[#E8E1DA] mb-1.5">
        Admin Portal Synchronizing
      </h2>
      <p className="text-xs text-[#6E6760] dark:text-[#8A837C] max-w-md mb-6 leading-relaxed">
        The atelier control portal encountered an unexpected runtime state. Click below to reload the dashboard or return to the executive overview.
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B44220] hover:bg-[#9B381B] text-[#FFFFFF] text-xs font-semibold shadow-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Dashboard</span>
        </button>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E8E2D9] dark:border-[#36312C] text-[#24211F] dark:text-[#E8E1DA] hover:bg-[#FAF8F5] dark:hover:bg-[#24211F] text-xs font-semibold transition-colors"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Admin Home</span>
        </Link>
      </div>
      {error?.message && (
        <pre className="mt-6 p-3 rounded-lg bg-black/5 dark:bg-white/5 text-[10px] text-[#8C837A] dark:text-[#8A837C] max-w-lg overflow-x-auto">
          {error.message}
        </pre>
      )}
    </div>
  );
}
