'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Check,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    discount,
    total,
    appliedPromo,
    promoError,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const [promoCodeInput, setPromoCodeInput] = useState('');

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCodeInput.trim()) {
      applyPromoCode(promoCodeInput);
      setPromoCodeInput('');
    }
  };

  return (
    <div className="bg-canvas min-h-screen py-10 sm:py-16 border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-[11px] text-ink-muted uppercase tracking-wider flex items-center gap-2 mb-6">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <span className="text-ink font-semibold">Shopping Bag</span>
        </nav>

        <h1 className="font-primary text-[32px] sm:text-[42px] font-normal text-ink tracking-tight mb-8">
          Shopping Bag ({items.reduce((sum, i) => sum + i.quantity, 0)})
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-canvas-card rounded-lg border border-line space-y-4 max-w-xl mx-auto p-8 shadow-subtle">
            <div className="w-16 h-16 mx-auto rounded-full bg-canvas-alt flex items-center justify-center text-ink-muted">
              <ShoppingBag className="w-8 h-8 stroke-1" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-ink">Your bag is currently empty</h2>
              <p className="text-xs text-ink-secondary">
                Explore our collection of structured workbags and discover your daily carry companion.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-ink hover:bg-ink-secondary text-white font-primary text-sm font-medium tracking-normal py-3.5 px-8 rounded transition-colors shadow-sm"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Items Column */}
            <div className="lg:col-span-8 space-y-4">
              {/* Shipping Highlight */}
              <div className="p-3.5 bg-brand-50 border border-brand-200/60 rounded flex items-center gap-3 text-xs text-brand-950 font-medium">
                <Truck className="w-4 h-4 text-brand-700 shrink-0" />
                <span>You qualify for <strong>FREE Express Shipping</strong> across India!</span>
              </div>

              {/* Items List */}
              <div className="bg-canvas-card border border-line rounded-lg overflow-hidden divide-y divide-line shadow-xs">
                {items.map((item) => (
                  <div key={item.id} className="p-4 sm:p-6 space-y-4">
                    <div className="flex gap-4 sm:gap-6">
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-canvas-alt rounded border border-line overflow-hidden shrink-0">
                        <Image
                          src={item.product.images[0]?.url || '/products/delo-1.jpg'}
                          alt={item.product.name}
                          fill
                          loading="lazy"
                          decoding="async"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] uppercase tracking-widest text-brand-700 font-bold">
                                {item.product.categoryLabel}
                              </span>
                              <Link
                                href={`/product/${item.product.slug}`}
                                className="block text-sm sm:text-base font-bold text-ink hover:text-brand-700 transition-colors"
                              >
                                {item.product.name}
                              </Link>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-ink-muted hover:text-red-600 p-1"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-xs text-ink-muted space-y-0.5 mt-1">
                            <p>
                              Color: <strong className="text-ink font-semibold">{item.selectedColor}</strong>
                            </p>
                            <p>Size: {item.selectedSize}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          {/* Quantity stepper */}
                          <div className="flex items-center border border-line bg-canvas rounded">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 text-ink-secondary hover:text-ink"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-semibold text-ink">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 text-ink-secondary hover:text-ink"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Unit / Total Price */}
                          <div className="text-right">
                            <p className="text-sm sm:text-base font-bold text-ink">
                              ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-[11px] text-ink-muted">
                                ₹{item.product.price.toLocaleString('en-IN')} each
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-4 bg-canvas-card border border-line rounded-lg p-5 sm:p-6 space-y-5 shadow-xs sticky top-28">
              <h2 className="text-base font-primary font-semibold text-ink border-b border-line pb-3">
                Order Summary
              </h2>

              {/* Coupon Code Section */}
              <div className="space-y-2">
                {appliedPromo ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Code <strong>{appliedPromo}</strong> applied!
                    </span>
                    <button
                      type="button"
                      onClick={removePromoCode}
                      className="text-[11px] text-red-600 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      className="flex-1 bg-canvas border border-line px-3 py-2 text-xs rounded uppercase focus:outline-none focus:border-ink placeholder:normal-case"
                    />
                    <button
                      type="submit"
                      className="bg-ink hover:bg-ink-secondary text-white text-xs font-semibold px-4 py-2 rounded uppercase tracking-wider transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {promoError && <p className="text-[11px] text-red-600">{promoError}</p>}
                <p className="text-[10px] text-ink-muted">
                  Tip: Use code <strong>WELCOME10</strong> for 10% off your order.
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs text-ink-secondary border-t border-line pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount ({appliedPromo})</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="text-emerald-700 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-base font-bold text-ink border-t border-line pt-3">
                  <span>Total Amount</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-[10px] text-ink-muted pt-1">
                  Inclusive of GST & All Taxes
                </p>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="w-full bg-ink hover:bg-ink-secondary text-white py-4 px-6 rounded font-primary font-medium text-sm tracking-normal flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Trust Features */}
              <div className="space-y-2 pt-2 border-t border-line text-[11px] text-ink-muted">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-700" />
                  <span>100% Secure Checkout & SSL Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-brand-700" />
                  <span>7-Day Return Policy with Doorstep Pickup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-brand-700" />
                  <span>Cash on Delivery Available</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

