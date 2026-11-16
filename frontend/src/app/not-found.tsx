import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center bg-white">
      <p className="text-[11px] uppercase tracking-[0.25em] text-black font-medium font-primary mb-3">
        404 · PAGE NOT FOUND
      </p>
      <h1 className="font-primary text-3xl sm:text-5xl font-normal text-black tracking-tight mb-4">
        Piece Not Found
      </h1>
      <p className="font-secondary text-sm sm:text-base text-[#333333] max-w-md mb-8 leading-relaxed">
        The page or silhouette you are looking for may have been moved, renamed, or is temporarily unavailable.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white hover:bg-ink-secondary transition-colors font-primary text-xs font-medium uppercase tracking-[0.14em]"
      >
        <span>Return to Home</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
