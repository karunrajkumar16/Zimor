'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { SmoothScroll } from '@/components/layout/SmoothScroll';

export function StorefrontLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin =
    pathname?.startsWith('/admin') ||
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'));

  if (isAdmin) {
    // Admin routes render in their own dedicated portal layout without customer storefront chrome
    return <>{children}</>;
  }

  return (
    <SmoothScroll>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <AnnouncementBar />
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </SmoothScroll>
  );
}
