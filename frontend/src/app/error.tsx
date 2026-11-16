'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('App runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h2 className="font-primary text-xl sm:text-2xl font-medium text-black mb-3">
        Something went wrong
      </h2>
      <p className="font-secondary text-xs sm:text-sm text-[#333333] max-w-md mb-6 leading-relaxed">
        We encountered an unexpected error while loading this page. Please try refreshing or return to the homepage.
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 font-primary text-xs uppercase tracking-wider transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-full border border-line text-black hover:border-zimor-black font-primary text-xs uppercase tracking-wider transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
