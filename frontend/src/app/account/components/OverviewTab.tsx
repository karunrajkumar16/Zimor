'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Heart,
  MapPin,
  ArrowRight,
  Truck,
  ShieldCheck,
  ChevronRight,
  User,
} from 'lucide-react';
import { UserProfile } from '@/context/AuthContext';
import { Order } from '@/types';
import { AccountTab } from './AccountNav';

interface OverviewTabProps {
  user: UserProfile;
  orders: Order[];
  wishlistCount: number;
  onNavigateTab: (tab: AccountTab) => void;
  onViewOrderDetails: (order: Order) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  user,
  orders,
  wishlistCount,
  onNavigateTab,
  onViewOrderDetails,
}) => {
  const latestOrder = orders.length > 0 ? orders[0] : null;
  const defaultAddress = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Metric Tiles (Zara / LV minimal aesthetic) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {/* Total Orders */}
        <button
          type="button"
          onClick={() => onNavigateTab('orders')}
          className="bg-white border border-[#B4B4B4]/30 hover:border-[#000000] p-4 sm:p-5 text-left transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-[#888888] mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] font-medium group-hover:text-[#000000] transition-colors">
              Orders
            </span>
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#888888] group-hover:text-[#000000] transition-colors" />
          </div>
          <p className="font-primary text-xl sm:text-3xl font-normal text-[#000000]">
            {orders.length}
          </p>
          <span className="text-[10px] sm:text-[11px] text-[#777777] mt-1 inline-flex items-center gap-1">
            <span>View all</span>
            <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* Wishlist Items */}
        <button
          type="button"
          onClick={() => onNavigateTab('wishlist')}
          className="bg-white border border-[#B4B4B4]/30 hover:border-[#000000] p-4 sm:p-5 text-left transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-[#888888] mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] font-medium group-hover:text-[#000000] transition-colors">
              Wishlist
            </span>
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#888888] group-hover:text-[#B44220] transition-colors" />
          </div>
          <p className="font-primary text-xl sm:text-3xl font-normal text-[#000000]">
            {wishlistCount}
          </p>
          <span className="text-[10px] sm:text-[11px] text-[#777777] mt-1 inline-flex items-center gap-1">
            <span>Saved items</span>
            <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>

        {/* Saved Addresses */}
        <button
          type="button"
          onClick={() => onNavigateTab('addresses')}
          className="bg-white border border-[#B4B4B4]/30 hover:border-[#000000] p-4 sm:p-5 text-left transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-[#888888] mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] font-medium group-hover:text-[#000000] transition-colors">
              Addresses
            </span>
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#888888] group-hover:text-[#000000] transition-colors" />
          </div>
          <p className="font-primary text-xl sm:text-3xl font-normal text-[#000000]">
            {user.addresses?.length || 0}
          </p>
          <span className="text-[10px] sm:text-[11px] text-[#777777] mt-1 inline-flex items-center gap-1">
            <span>Manage</span>
            <ChevronRight className="w-2.5 h-2.5" />
          </span>
        </button>
      </div>

      {/* 2. Recent Order Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#000000]/10 pb-2.5">
          <h2 className="font-primary text-base sm:text-lg font-medium text-[#000000] tracking-tight">
            Recent Orders
          </h2>
          {orders.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigateTab('orders')}
              className="text-xs uppercase tracking-wider font-semibold text-[#000000] hover:text-[#B44220] transition-colors"
            >
              View All ({orders.length}) →
            </button>
          )}
        </div>

        {latestOrder ? (
          <div className="bg-white border border-[#B4B4B4]/30 p-5 sm:p-6 space-y-4 transition-all hover:border-[#000000]">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#000000]/10 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#888888]">
                  Order Ref
                </span>
                <p className="font-medium text-sm text-[#000000]">#{latestOrder.orderNumber}</p>
                <p className="text-[11px] text-[#777777]">Placed on {latestOrder.date}</p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-block px-2.5 py-1 text-[10.5px] uppercase font-semibold tracking-wider ${
                    latestOrder.status === 'Delivered'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-[#FAF8F5] text-[#000000] border border-[#B4B4B4]/40'
                  }`}
                >
                  {latestOrder.status}
                </span>

                <button
                  type="button"
                  onClick={() => onViewOrderDetails(latestOrder)}
                  className="text-xs font-semibold uppercase tracking-wider text-[#000000] hover:text-[#B44220] underline transition-colors cursor-pointer"
                >
                  Details
                </button>
              </div>
            </div>

            {/* Product items peek */}
            <div className="space-y-3">
              {latestOrder.items.slice(0, 2).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-[#FAF8F5] border border-[#B4B4B4]/30 overflow-hidden shrink-0">
                      <Image
                        src={item.image || 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp'}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="text-xs space-y-0.5">
                      <p className="font-medium text-[#000000]">{item.name}</p>
                      <p className="text-[#777777] text-[11px]">
                        Qty: {item.quantity} {item.color ? `• ${item.color}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-[#000000]">
                    ₹{item.price.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Courier Ribbon */}
            {latestOrder.trackingNumber && (
              <div className="bg-[#FAF8F5] border border-[#B4B4B4]/20 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-[#333333]">
                  <Truck className="w-3.5 h-3.5 text-[#B44220] shrink-0" />
                  <span>
                    Carrier: <strong>{latestOrder.courierName || 'Express Courier'}</strong> • AWB:{' '}
                    <strong className="underline">{latestOrder.trackingNumber}</strong>
                  </span>
                </div>
                <span className="text-[11px] text-[#777777]">
                  Est. Delivery: {latestOrder.estimatedDelivery || 'In Transit'}
                </span>
              </div>
            )}
          </div>
        ) : (
          /* High-Fashion Empty Orders State */
          <div className="bg-white border border-[#B4B4B4]/30 p-8 sm:p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#B4B4B4]/40 flex items-center justify-center mx-auto text-[#000000]">
              <Package className="w-5 h-5 stroke-1" />
            </div>
            <div className="space-y-1.5 max-w-sm mx-auto">
              <h3 className="font-primary text-base sm:text-lg font-normal text-[#000000] tracking-tight">
                No Orders Placed Yet
              </h3>
              <p className="font-secondary text-xs text-[#777777] leading-relaxed">
                Discover our curated collection of architectural workbags, crafted in cruelty-free premium faux leather.
              </p>
            </div>
            <div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#000000] hover:bg-[#333333] text-white text-xs font-medium uppercase tracking-[0.14em] transition-colors"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 3. Side-by-side snapshot: Profile & Saved Delivery Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
        {/* Profile Snapshot */}
        <div className="bg-white border border-[#B4B4B4]/30 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#000000]/10 pb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#000000] flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              Personal Profile
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('profile')}
              className="text-xs text-[#000000] hover:text-[#B44220] font-medium underline"
            >
              Edit
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#000000]/5">
              <span className="text-[#888888]">Name</span>
              <span className="font-medium text-[#000000]">{user.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#000000]/5">
              <span className="text-[#888888]">Email</span>
              <span className="font-medium text-[#000000] truncate max-w-[180px]">
                {user.email}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#000000]/5">
              <span className="text-[#888888]">Phone</span>
              <span className="font-medium text-[#000000]">{user.phone || 'Not added'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#888888]">Profession</span>
              <span className="font-medium text-[#000000]">
                {user.designation || 'Atelier User'}
              </span>
            </div>
          </div>
        </div>

        {/* Default Delivery Address Snapshot */}
        <div className="bg-white border border-[#B4B4B4]/30 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#000000]/10 pb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#000000] flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              Primary Delivery
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('addresses')}
              className="text-xs text-[#000000] hover:text-[#B44220] font-medium underline"
            >
              {defaultAddress ? 'Manage' : 'Add'}
            </button>
          </div>

          {defaultAddress ? (
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#000000]">{defaultAddress.fullName}</span>
                <span className="text-[9.5px] uppercase tracking-wider font-semibold px-1.5 py-0.2 bg-[#FAF8F5] border border-[#B4B4B4]/40 text-[#000000]">
                  {defaultAddress.label || 'Default'}
                </span>
              </div>
              <p className="text-[#555555]">{defaultAddress.addressLine1}</p>
              {defaultAddress.addressLine2 && (
                <p className="text-[#555555]">{defaultAddress.addressLine2}</p>
              )}
              <p className="text-[#555555]">
                {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
              </p>
              <p className="text-[#888888] pt-1">Phone: {defaultAddress.phone}</p>
            </div>
          ) : (
            <div className="text-xs text-[#888888] space-y-2 py-2">
              <p>No delivery address saved yet.</p>
              <button
                type="button"
                onClick={() => onNavigateTab('addresses')}
                className="text-xs uppercase tracking-wider text-[#000000] hover:text-[#B44220] font-medium underline block"
              >
                + Add Delivery Address
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
