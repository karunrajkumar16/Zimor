'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, MapPin, Edit3, Check, LogOut, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';

export default function AccountPage() {
  const {
    user,
    isAuthenticated,
    isLoading,
    orders,
    authError,
    loginWithGoogle,
    logout,
    updateProfile,
    clearAuthError,
  } = useAuth();
  const { wishlistCount } = useWishlist();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setDesignation(user.designation || 'Atelier Patron');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile({ name, phone, designation });
    if (success) {
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoggingIn(true);
    loginWithGoogle('/account');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-canvas min-h-screen py-24 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-mono text-xs text-ink-muted uppercase tracking-widest">
            Authenticating Atelier Session...
          </p>
        </div>
      </div>
    );
  }

  // Unauthenticated Patron Sign-In View
  if (!isAuthenticated || !user) {
    return (
      <div className="bg-canvas min-h-screen py-12 sm:py-20 border-b border-line">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="text-[11px] text-ink-muted uppercase tracking-wider flex items-center justify-center gap-2 mb-8">
            <Link href="/" className="hover:text-ink">Home</Link>
            <span>/</span>
            <span className="text-ink font-semibold">Account Sign In</span>
          </nav>

          {/* Auth Card */}
          <div className="bg-canvas-card border border-line rounded-xl p-8 sm:p-10 shadow-sm space-y-6 text-center">
            <div className="w-12 h-12 rounded-full bg-ink text-white font-mono font-bold text-lg flex items-center justify-center mx-auto tracking-wider shadow-inner">
              Z
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#B44220] font-bold">
                ZIMOR Atelier Concierge
              </span>
              <h1 className="font-primary text-2xl sm:text-3xl font-normal text-ink tracking-tight mt-1">
                Patron Sign In
              </h1>
              <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
                Sign in to manage your luxury orders, shipment dispatches, saved delivery addresses, and personal concierge.
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2 text-left">
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

            {/* Google Sign In Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-[#1f1f1f] border border-[#747775]/40 hover:border-[#747775] rounded-lg py-3 px-4 font-sans text-sm font-medium shadow-xs transition-all duration-150 disabled:opacity-60 cursor-pointer"
              >
                {/* Official Google G Logo */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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

            <div className="pt-4 border-t border-line/60 flex items-center justify-center gap-1.5 text-[11px] text-ink-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified TLS 1.3 end-to-end encrypted session</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Patron Dashboard View
  return (
    <div className="bg-canvas min-h-screen py-10 sm:py-16 border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-[11px] text-ink-muted uppercase tracking-wider flex items-center gap-2 mb-6">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <span className="text-ink font-semibold">Patron Account</span>
        </nav>

        {/* Header with Title and Sign Out */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-line pb-6 mb-8 gap-4">
          <div>
            <h1 className="font-primary text-[32px] sm:text-[42px] font-normal text-ink tracking-tight">
              My Profile & Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary mt-1">
              Welcome back, {user.name}. Manage your delivery preferences and active orders.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-2 bg-ink hover:bg-ink-secondary text-white font-primary text-sm font-medium tracking-normal py-2.5 px-5 rounded transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>All Orders ({orders.length})</span>
            </Link>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 border border-line hover:border-red-300 hover:text-red-700 bg-canvas text-ink-secondary text-xs font-semibold py-2.5 px-4 rounded transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-5 bg-canvas-card border border-line rounded-lg p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border border-line shrink-0 bg-neutral-100 flex items-center justify-center font-bold text-lg text-ink">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    fill
                    unoptimized
                    loading="lazy"
                    decoding="async"
                    className="object-cover"
                  />
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h2 className="text-base font-bold text-ink">{user.name}</h2>
                <p className="text-xs text-[#555555] font-medium">{user.designation || 'Atelier Patron'}</p>
                <p className="text-xs text-ink-muted">{user.city || 'India'}</p>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-3 pt-3 border-t border-line text-xs">
                <div>
                  <label className="block font-semibold text-ink mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 bg-canvas border border-line rounded focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-2 bg-canvas border border-line rounded focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Designation / Role</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Architect, Creative Director"
                    className="w-full p-2 bg-canvas border border-line rounded focus:outline-none focus:border-black"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 border border-line rounded text-ink-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-ink hover:bg-ink-secondary text-white rounded font-medium transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 pt-3 border-t border-line text-xs text-ink-secondary">
                <div className="flex justify-between py-1 border-b border-line/50">
                  <span className="text-ink-muted">Email:</span>
                  <span className="font-medium text-ink truncate max-w-[200px]">{user.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-line/50">
                  <span className="text-ink-muted">Phone:</span>
                  <span className="font-medium text-ink">{user.phone || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-line/50">
                  <span className="text-ink-muted">Profession:</span>
                  <span className="font-medium text-ink">{user.designation || 'Atelier Patron'}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-black hover:text-[#b4b4b4] font-semibold"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Personal Details</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-line text-center">
              <Link
                href="/account/orders"
                className="p-3 bg-canvas rounded border border-line hover:border-black transition-colors"
              >
                <p className="text-xl font-bold text-ink">{orders.length}</p>
                <p className="text-[11px] text-ink-muted">Past Orders</p>
              </Link>
              <Link
                href="/wishlist"
                className="p-3 bg-canvas rounded border border-line hover:border-black transition-colors"
              >
                <p className="text-xl font-bold text-ink">{wishlistCount}</p>
                <p className="text-[11px] text-ink-muted">Wishlist Items</p>
              </Link>
            </div>
          </div>

          {/* Right Column: Saved Delivery Addresses & Recent Order Peek */}
          <div className="lg:col-span-7 space-y-6">
            {/* Saved Addresses */}
            <div className="bg-canvas-card border border-line rounded-lg p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-black" />
                  Saved Delivery Addresses
                </h3>
                <span className="text-xs text-ink-muted">
                  {user.addresses?.length || 0} saved
                </span>
              </div>

              {(!user.addresses || user.addresses.length === 0) ? (
                <div className="py-8 text-center text-xs text-ink-muted">
                  No saved addresses. Your delivery addresses will be saved automatically upon checkout.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded border text-xs space-y-1 relative ${
                        addr.isDefault
                          ? 'border-black bg-neutral-50 ring-1 ring-black'
                          : 'border-line bg-canvas'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-ink">{addr.label || 'Delivery Address'}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-black text-white font-semibold px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-ink">{addr.fullName}</p>
                      <p className="text-ink-secondary">{addr.addressLine1}</p>
                      {addr.addressLine2 && <p className="text-ink-secondary">{addr.addressLine2}</p>}
                      <p className="text-ink-secondary">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-ink-muted pt-1">Phone: {addr.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Most Recent Order Sneak Peek */}
            {orders.length > 0 ? (
              <div className="bg-canvas-card border border-line rounded-lg p-6 sm:p-8 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                    <Package className="w-4 h-4 text-black" />
                    Latest Active Order
                  </h3>
                  <Link
                    href="/account/orders"
                    className="text-xs font-semibold text-black hover:underline"
                  >
                    View All →
                  </Link>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-ink">Order #{orders[0].orderNumber}</p>
                    <p className="text-ink-muted">Placed on {orders[0].date}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-neutral-100 text-black font-semibold rounded text-xs">
                    {orders[0].status}
                  </span>
                </div>

                <div className="py-2 flex items-center gap-3">
                  <div className="relative w-14 h-14 bg-canvas-alt rounded border border-line overflow-hidden shrink-0">
                    <Image
                      src={orders[0].items?.[0]?.image || 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp'}
                      alt={orders[0].items?.[0]?.name || 'Bag'}
                      fill
                      loading="lazy"
                      decoding="async"
                      className="object-cover"
                    />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-ink">{orders[0].items?.[0]?.name}</p>
                    <p className="text-ink-muted text-[11px]">
                      {orders[0].items?.[0]?.color} • Total: ₹{orders[0].total?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {orders[0].trackingNumber && (
                  <Link
                    href="/account/orders"
                    className="block text-center bg-canvas hover:bg-canvas-alt border border-line py-2.5 rounded text-xs font-semibold text-ink transition-colors"
                  >
                    Track Package Delivery ({orders[0].courierName || 'Courier'}: {orders[0].trackingNumber})
                  </Link>
                )}
              </div>
            ) : (
              <div className="bg-canvas-card border border-line rounded-lg p-6 sm:p-8 text-center space-y-3 shadow-xs">
                <Package className="w-8 h-8 text-ink-muted mx-auto" />
                <h3 className="text-sm font-bold text-ink">No Orders Placed Yet</h3>
                <p className="text-xs text-ink-secondary max-w-sm mx-auto">
                  Explore the ZIMOR collection to experience handcrafted luxury silhouettes.
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-1.5 bg-ink text-white text-xs font-semibold px-4 py-2 rounded hover:bg-ink-secondary transition-colors"
                >
                  <span>Explore Silhouettes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
