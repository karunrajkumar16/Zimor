'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { orders } = useAuth();

  const currentOrder = orders.find((o) => o.orderNumber === orderId || o.id === orderId) || orders[0];

  return (
    <div className="bg-canvas min-h-screen py-12 sm:py-20 border-b border-line">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Success Card */}
        <div className="bg-canvas-card border border-line rounded-lg p-6 sm:p-10 text-center space-y-4 shadow-subtle">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 stroke-2" />
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-black font-bold">
              Order Confirmed
            </span>
            <h1 className="font-primary text-[28px] sm:text-[36px] font-normal text-ink tracking-tight">
              Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary max-w-md mx-auto">
              We have received your order <strong>#{currentOrder?.orderNumber || orderId || 'CONFIRMED'}</strong>. A confirmation email and SMS with live tracking updates have been sent to your contact details.
            </p>
          </div>

          {/* Tracking Stepper */}
          <div className="pt-6 border-t border-line text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-ink mb-4">
              Estimated Delivery & Progress:
            </p>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="space-y-1">
                <div className="w-6 h-6 mx-auto rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <p className="font-semibold text-ink text-[11px]">Confirmed</p>
                <p className="text-[10px] text-ink-muted">Today</p>
              </div>

              <div className="space-y-1">
                <div className="w-6 h-6 mx-auto rounded-full bg-neutral-100 border border-[#b4b4b4] text-black flex items-center justify-center text-[10px] font-bold">
                  2
                </div>
                <p className="font-medium text-ink text-[11px]">Handcraft Check</p>
                <p className="text-[10px] text-ink-muted">Next 24h</p>
              </div>

              <div className="space-y-1">
                <div className="w-6 h-6 mx-auto rounded-full bg-canvas-alt border border-line text-ink-muted flex items-center justify-center text-[10px] font-bold">
                  3
                </div>
                <p className="text-ink-muted text-[11px]">In Transit</p>
                <p className="text-[10px] text-ink-muted">BlueDart</p>
              </div>

              <div className="space-y-1">
                <div className="w-6 h-6 mx-auto rounded-full bg-canvas-alt border border-line text-ink-muted flex items-center justify-center text-[10px] font-bold">
                  4
                </div>
                <p className="text-ink-muted text-[11px]">Delivered</p>
                <p className="text-[10px] text-ink-muted">5–7 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Card */}
        {currentOrder && (
          <div className="bg-canvas-card border border-line rounded-lg p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-line pb-4 gap-2">
              <div>
                <p className="text-xs text-ink-muted">Order Number</p>
                <p className="text-sm font-bold text-ink">{currentOrder.orderNumber}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted">Courier Tracking</p>
                <p className="text-sm font-bold text-black">
                  {currentOrder.courierName}: {currentOrder.trackingNumber}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-muted">Payment Mode</p>
                <p className="text-sm font-bold text-ink">{currentOrder.paymentMethod}</p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-ink">
                Ordered Items:
              </p>
              <div className="divide-y divide-line">
                {currentOrder.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 bg-canvas-alt rounded border border-line overflow-hidden shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-ink">{item.name}</p>
                        <p className="text-ink-muted text-[11px]">
                          Color: {item.color} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-ink">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total breakdown */}
            <div className="border-t border-line pt-3 space-y-1 text-xs text-ink-secondary">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{currentOrder.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {currentOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span>-₹{currentOrder.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-emerald-700 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-base font-bold text-ink border-t border-line pt-2">
                <span>Total Paid</span>
                <span>₹{currentOrder.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="pt-2 border-t border-line text-xs text-ink-secondary">
              <p className="font-bold text-ink mb-1">Delivering To:</p>
              <p>{currentOrder.shippingAddress.fullName}</p>
              <p>{currentOrder.shippingAddress.addressLine1}</p>
              {currentOrder.shippingAddress.addressLine2 && <p>{currentOrder.shippingAddress.addressLine2}</p>}
              <p>{currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} - {currentOrder.shippingAddress.pincode}</p>
              <p className="text-ink-muted">Phone: {currentOrder.shippingAddress.phone}</p>
            </div>
          </div>
        )}

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/account/orders"
            className="w-full sm:w-auto bg-ink hover:bg-ink-secondary text-white text-xs font-semibold uppercase tracking-luxury py-3.5 px-8 rounded flex items-center justify-center gap-2 transition-colors"
          >
            <span>View All My Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto bg-canvas-card border border-ink text-ink hover:bg-ink hover:text-white text-xs font-semibold uppercase tracking-luxury py-3.5 px-8 rounded flex items-center justify-center transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading order confirmation...</div>}>
      <SuccessContent />
    </Suspense>
  );
}

