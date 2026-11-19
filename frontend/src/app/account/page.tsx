'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertCircle, ShieldCheck, ArrowRight, Sparkles, LogOut, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';

import { AccountHeader } from './components/AccountHeader';
import { AccountNav, AccountTab } from './components/AccountNav';
import { OverviewTab } from './components/OverviewTab';
import { OrdersTab } from './components/OrdersTab';
import { ProfileTab } from './components/ProfileTab';
import { AddressesTab } from './components/AddressesTab';
import { WishlistTab } from './components/WishlistTab';
import { Order } from '@/types';
import { OrderDetailsModal } from './components/OrderDetailsModal';

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as AccountTab) || 'overview';

  const {
    user,
    isAuthenticated,
    isLoading,
    orders,
    authError,
    loginWithGoogle,
    logout,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    clearAuthError,
  } = useAuth();

  const { wishlistCount } = useWishlist();

  const [activeTab, setActiveTab] = useState<AccountTab>(initialTab);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [downloadingNumber, setDownloadingNumber] = useState<string | null>(null);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  // Sync tab with URL search parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab') as AccountTab;
    if (tabParam && ['overview', 'orders', 'profile', 'addresses', 'wishlist'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleSelectTab = (tab: AccountTab) => {
    setActiveTab(tab);
    router.replace(`/account?tab=${tab}`, { scroll: false });
  };

  const handleGoogleSignIn = () => {
    setIsLoggingIn(true);
    loginWithGoogle('/account');
  };

  const handleConfirmSignOut = async () => {
    setShowSignOutModal(false);
    await logout();
  };

  const handleDownloadInvoice = (orderNumber: string) => {
    setDownloadingNumber(orderNumber);
    setTimeout(() => {
      setDownloadingNumber(null);
      alert(`Digital Tax Invoice for Order #${orderNumber} has been downloaded.`);
    }, 1000);
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="bg-[#FFFFFF] min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#000000] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-secondary text-xs text-[#888888] uppercase tracking-[0.2em]">
            Connecting to Atelier Session...
          </p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Patron Sign-In (Editorial Zara / Louis Vuitton styling)
  if (!isAuthenticated || !user) {
    return (
      <div className="bg-[#FAF8F5] min-h-screen py-12 sm:py-20 border-b border-[#000000]/10">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav
            className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#888888] flex items-center justify-center gap-2 mb-8 font-secondary"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-[#000000] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#000000] font-semibold">Account Sign In</span>
          </nav>

          {/* Editorial Sign-In Container */}
          <div className="bg-white border border-[#B4B4B4]/40 p-8 sm:p-10 space-y-6 text-center shadow-xs">
            <div className="w-12 h-12 bg-[#000000] text-white font-primary font-normal text-xl flex items-center justify-center mx-auto tracking-widest">
              Z
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B44220]">
                ZIMOR Atelier Concierge
              </span>
              <h1 className="font-primary text-2xl sm:text-3xl font-normal text-[#000000] tracking-tight">
                Patron Sign In
              </h1>
              <p className="font-secondary text-xs text-[#666666] leading-relaxed max-w-xs mx-auto">
                Sign in to manage your orders, track dispatches, update delivery destinations, and curate your personal wishlist.
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Authentication issue</p>
                  <p className="text-[11px] mt-0.5">{authError}</p>
                </div>
                <button
                  type="button"
                  onClick={clearAuthError}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Google OAuth Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-[#1f1f1f] border border-[#747775]/40 hover:border-[#747775] py-3 px-4 text-xs font-medium uppercase tracking-[0.1em] shadow-xs transition-all duration-150 disabled:opacity-60 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isLoggingIn ? 'Redirecting to Google...' : 'Continue with Google'}</span>
              </button>
            </div>

            {/* Atelier Member Benefits */}
            <div className="pt-4 border-t border-[#000000]/10 text-left space-y-2 text-xs text-[#555555]">
              <p className="text-[10px] uppercase font-bold tracking-[0.16em] text-[#000000]">
                Patron Privileges
              </p>
              <ul className="space-y-1.5 text-[11px] text-[#666666]">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#B44220] shrink-0" />
                  <span>Real-time express shipment tracking across India</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#B44220] shrink-0" />
                  <span>Private curated wishlist synced across devices</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#B44220] shrink-0" />
                  <span>1-Click express checkout with saved destinations</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-center gap-1.5 text-[10.5px] text-[#888888]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>TLS 1.3 256-Bit Encrypted Session</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated Patron Dashboard
  return (
    <div className="bg-[#FFFFFF] min-h-screen py-6 sm:py-12 border-b border-[#000000]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav
          className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#888888] flex items-center gap-2 mb-6 font-secondary"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-[#000000] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            href="/account"
            onClick={() => handleSelectTab('overview')}
            className="hover:text-[#000000] transition-colors"
          >
            Account
          </Link>
          <span>/</span>
          <span className="text-[#000000] font-semibold capitalize">
            {activeTab === 'overview'
              ? 'Overview'
              : activeTab === 'orders'
              ? 'My Orders'
              : activeTab === 'profile'
              ? 'My Profile'
              : activeTab === 'addresses'
              ? 'Saved Addresses'
              : 'Wishlist'}
          </span>
        </nav>

        {/* Account Header */}
        <AccountHeader
          user={user}
          ordersCount={orders.length}
          onNavigateToOrders={() => handleSelectTab('orders')}
          onSignOut={() => setShowSignOutModal(true)}
        />

        {/* Mobile Horizontal Tab Navigation */}
        <AccountNav
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onSignOut={() => setShowSignOutModal(true)}
          ordersCount={orders.length}
          addressesCount={user.addresses?.length || 0}
          wishlistCount={wishlistCount}
        />

        {/* Desktop Layout: Left Sidebar + Right Main Content Pane */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Content Area */}
          <main className="flex-1 w-full min-w-0">
            {activeTab === 'overview' && (
              <OverviewTab
                user={user}
                orders={orders}
                wishlistCount={wishlistCount}
                onNavigateTab={handleSelectTab}
                onViewOrderDetails={(order) => setSelectedOrder(order)}
              />
            )}

            {activeTab === 'orders' && <OrdersTab orders={orders} />}

            {activeTab === 'profile' && (
              <ProfileTab user={user} onUpdateProfile={updateProfile} />
            )}

            {activeTab === 'addresses' && (
              <AddressesTab
                addresses={user.addresses || []}
                onAddAddress={addAddress}
                onUpdateAddress={updateAddress}
                onDeleteAddress={deleteAddress}
                onSetDefaultAddress={setDefaultAddress}
              />
            )}

            {activeTab === 'wishlist' && <WishlistTab />}
          </main>
        </div>
      </div>

      {/* Global Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onDownloadInvoice={handleDownloadInvoice}
        isDownloading={Boolean(downloadingNumber)}
      />

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white max-w-sm w-full border border-[#000000]/10 p-6 space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#B4B4B4]/40 flex items-center justify-center text-[#B44220]">
              <LogOut className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="font-primary text-lg font-normal text-[#000000]">
                Sign Out of Account
              </h3>
              <p className="font-secondary text-xs text-[#777777] leading-relaxed">
                Are you sure you want to end your current session on this device?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                className="px-4 py-2 border border-[#B4B4B4]/40 hover:border-[#000000] text-xs font-medium uppercase tracking-wider text-[#555555] hover:text-[#000000] transition-colors cursor-pointer"
              >
                Stay Signed In
              </button>
              <button
                type="button"
                onClick={handleConfirmSignOut}
                className="px-4 py-2 bg-[#000000] hover:bg-[#B44220] text-white text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#FFFFFF] min-h-[70vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#000000] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
