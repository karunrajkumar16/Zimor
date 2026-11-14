'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, Gift, ArrowRight, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartDrawerOpen,
    closeCartDrawer,
    removeItem,
    updateQuantity,
    toggleGiftWrap,
    subtotal,
    discount,
    giftWrapFee,
    total,
    appliedPromo,
    promoError,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [editingGiftId, setEditingGiftId] = useState<string | null>(null);
  const [giftNoteInput, setGiftNoteInput] = useState('');

  if (!isCartDrawerOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoInput.trim()) {
      applyPromoCode(promoInput);
      setPromoInput('');
    }
  };

  const handleSaveGiftMessage = (itemId: string) => {
    toggleGiftWrap(itemId, giftNoteInput);
    setEditingGiftId(null);
    setGiftNoteInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeCartDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-canvas-card shadow-drawer flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between bg-canvas">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-ink" />
              <h2 className="text-sm font-semibold uppercase tracking-luxury text-ink">
                Your Shopping Bag ({items.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              type="button"
              onClick={closeCartDrawer}
              className="p-1 text-ink-muted hover:text-ink transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Shipping Benefit Banner */}
          <div className="bg-brand-50 border-b border-brand-200/50 px-4 py-2.5 text-center text-xs text-brand-900 font-medium flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>You've unlocked <strong>FREE Express Shipping</strong> across India!</span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-canvas-alt flex items-center justify-center text-ink-muted">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-ink">Your bag is empty</h3>
                  <p className="text-xs text-ink-muted">
                    Explore our structured handbags and find your daily work essential.
                  </p>
                </div>
                <Link
                  href="/shop"
                  onClick={closeCartDrawer}
                  className="inline-block bg-ink hover:bg-brand-800 text-white text-xs font-semibold uppercase tracking-wider py-3 px-6 rounded transition-colors"
                >
                  Explore Workbags
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-canvas rounded border border-line flex flex-col gap-2 relative group"
                >
                  <div className="flex gap-3">
                    <div className="relative w-20 h-20 bg-canvas-alt shrink-0 border border-line rounded overflow-hidden">
                      <Image
                        src={item.product.images[0]?.url || '/products/delo-1.jpg'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/product/${item.product.slug}`}
                            onClick={closeCartDrawer}
                            className="text-xs font-semibold text-ink hover:text-brand-700 transition-colors line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-ink-muted hover:text-red-600 transition-colors p-1"
                            aria-label={`Remove ${item.product.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-ink-muted">
                          Color: <span className="font-medium text-ink">{item.selectedColor}</span>
                        </p>
                        <p className="text-[11px] text-ink-muted">
                          Size: {item.selectedSize}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-line bg-canvas-card rounded">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-ink-secondary hover:text-ink"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-medium text-ink">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-ink-secondary hover:text-ink"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="text-xs font-bold text-ink">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gift Wrap Option */}
                  <div className="pt-2 border-t border-line/60 flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        if (item.isGiftWrapped) {
                          toggleGiftWrap(item.id);
                        } else {
                          setEditingGiftId(item.id);
                          setGiftNoteInput(item.giftMessage || '');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 text-brand-700 hover:text-brand-900 font-medium"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>{item.isGiftWrapped ? '✓ Gift Box Added (₹149)' : '+ Add Signature Gift Box'}</span>
                    </button>

                    {item.isGiftWrapped && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingGiftId(item.id);
                          setGiftNoteInput(item.giftMessage || '');
                        }}
                        className="text-[10px] text-ink-muted underline"
                      >
                        {item.giftMessage ? 'Edit Note' : '+ Add Note'}
                      </button>
                    )}
                  </div>

                  {/* Gift Message Input modal/form */}
                  {editingGiftId === item.id && (
                    <div className="mt-2 p-2 bg-canvas-card border border-brand-200 rounded space-y-2">
                      <p className="text-[11px] font-medium text-brand-900">
                        Include a handwritten gift card message:
                      </p>
                      <textarea
                        rows={2}
                        value={giftNoteInput}
                        onChange={(e) => setGiftNoteInput(e.target.value)}
                        placeholder="e.g. Happy Promotion Ananya! Proud of you, love Rohan."
                        className="w-full text-xs p-2 border border-line bg-canvas rounded focus:outline-none focus:border-brand-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingGiftId(null)}
                          className="text-[10px] text-ink-muted px-2 py-1"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveGiftMessage(item.id)}
                          className="text-[10px] bg-brand-600 text-white font-medium px-3 py-1 rounded"
                        >
                          Save Gift Box
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-line bg-canvas space-y-3">
              {/* Promo Code Input */}
              <div className="space-y-1">
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Promo code <strong>{appliedPromo}</strong> applied
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
                      placeholder="Coupon code (try WELCOME10)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 bg-canvas-card border border-line px-3 py-2 text-xs rounded focus:outline-none focus:border-ink uppercase placeholder:normal-case"
                    />
                    <button
                      type="submit"
                      className="bg-canvas-card border border-ink text-ink hover:bg-ink hover:text-white px-3 py-2 text-xs font-semibold rounded uppercase tracking-wider transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {promoError && <p className="text-[11px] text-red-600">{promoError}</p>}
              </div>

              {/* Breakdown */}
              <div className="space-y-1.5 text-xs text-ink-secondary border-t border-line pt-2">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount ({appliedPromo})</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {giftWrapFee > 0 && (
                  <div className="flex justify-between text-brand-800">
                    <span>Luxury Gift Packaging</span>
                    <span>₹{giftWrapFee.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Express Shipping</span>
                  <span className="text-emerald-700 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-ink border-t border-line pt-2">
                  <span>Total Amount</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <Link
                  href="/checkout"
                  onClick={closeCartDrawer}
                  className="w-full bg-brand-700 hover:bg-brand-800 text-white py-3.5 px-4 rounded font-semibold text-xs uppercase tracking-luxury flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/cart"
                  onClick={closeCartDrawer}
                  className="block text-center text-xs text-ink-muted hover:text-ink py-1.5 transition-colors"
                >
                  View Full Cart Details
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

