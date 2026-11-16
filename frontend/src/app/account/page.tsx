'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, MapPin, Edit3, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';

export default function AccountPage() {
  const { user, orders, updateProfile } = useAuth();
  const { wishlistCount } = useWishlist();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [designation, setDesignation] = useState(user.designation || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, phone, designation });
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="bg-canvas min-h-screen py-10 sm:py-16 border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-[11px] text-ink-muted uppercase tracking-wider flex items-center gap-2 mb-6">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <span className="text-ink font-semibold">Customer Account</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-line pb-6 mb-8 gap-4">
          <div>
            <h1 className="font-primary text-[32px] sm:text-[42px] font-normal text-ink tracking-tight">
              My Profile & Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary mt-1">
              Manage your personal information, saved addresses, and active orders.
            </p>
          </div>

          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 bg-ink hover:bg-ink-secondary text-white font-primary text-sm font-medium tracking-normal py-3 px-6 rounded transition-colors self-start sm:self-auto"
          >
            <Package className="w-4 h-4" />
            <span>View All Orders ({orders.length})</span>
          </Link>
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
              <div className="relative w-16 h-16 rounded-full overflow-hidden border border-line shrink-0 bg-canvas-alt">
                <Image src={user.avatar} alt={user.name} fill loading="lazy" decoding="async" className="object-cover" />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink">{user.name}</h2>
                <p className="text-xs text-[#555555] font-medium">{user.designation}</p>
                <p className="text-xs text-ink-muted">{user.city}, India</p>
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
                    className="w-full p-2 bg-canvas border border-line rounded focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink mb-1">Designation / Role</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
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
                  <span className="font-medium text-ink">{user.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-line/50">
                  <span className="text-ink-muted">Phone:</span>
                  <span className="font-medium text-ink">{user.phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-line/50">
                  <span className="text-ink-muted">Profession:</span>
                  <span className="font-medium text-ink">{user.designation}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-black hover:text-[#b4b4b4] font-semibold pt-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Personal Details</span>
                </button>
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
                <span className="text-xs text-ink-muted">{user.addresses.length} saved</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-4 rounded border text-xs space-y-1 relative ${addr.isDefault
                      ? 'border-black bg-neutral-50 ring-1 ring-black'
                      : 'border-line bg-canvas'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-ink">{addr.label}</span>
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
            </div>

            {/* Most Recent Order Sneak Peek */}
            {orders.length > 0 && (
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
                      src={orders[0].items[0]?.image || '/products/delo-1.jpg'}
                      alt={orders[0].items[0]?.name || 'Bag'}
                      fill
                      loading="lazy"
                      decoding="async"
                      className="object-cover"
                    />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-ink">{orders[0].items[0]?.name}</p>
                    <p className="text-ink-muted text-[11px]">
                      {orders[0].items[0]?.color} • Total: ₹{orders[0].total.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <Link
                  href="/account/orders"
                  className="block text-center bg-canvas hover:bg-canvas-alt border border-line py-2.5 rounded text-xs font-semibold text-ink transition-colors"
                >
                  Track Package Delivery ({orders[0].courierName}: {orders[0].trackingNumber})
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

