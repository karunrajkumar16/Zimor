'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrdersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/account?tab=orders');
  }, [router]);

  return (
    <div className="bg-[#FFFFFF] min-h-[70vh] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#000000] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-secondary text-xs text-[#888888] uppercase tracking-[0.2em]">
          Loading Your Orders...
        </p>
      </div>
    </div>
  );
}
