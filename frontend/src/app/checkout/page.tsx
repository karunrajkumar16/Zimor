'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  Banknote,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const INDIAN_STATES = [
  'Karnataka',
  'Maharashtra',
  'Delhi NCR',
  'Telangana',
  'Tamil Nadu',
  'Gujarat',
  'Haryana',
  'Uttar Pradesh',
  'West Bengal',
  'Kerala',
  'Rajasthan',
  'Punjab',
  'Madhya Pradesh',
  'Goa',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, total, clearCart, appliedPromo } = useCart();
  const { user, createOrder } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Address State
  const [formData, setFormData] = useState({
    fullName: user.name || 'Ananya Sharma',
    email: user.email || 'ananya.sharma@example.com',
    phone: user.phone || '9876543210',
    addressLine1: 'Tower B, 4th Floor, Tech Hub',
    addressLine2: '100ft Road, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
  });

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'priority'>('standard');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Calculate actual total based on shipping method
  const shippingCharge = shippingMethod === 'priority' ? 199 : 0;
  const finalTotal = total + shippingCharge;

  const [orderError, setOrderError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlacingOrder(true);
    setOrderError(null);

    const paymentLabel =
      paymentMethod === 'upi'
        ? 'UPI (Google Pay / PhonePe)'
        : paymentMethod === 'card'
          ? 'Credit / Debit Card'
          : paymentMethod === 'netbanking'
            ? 'Net Banking'
            : 'Cash on Delivery';

    try {
      let paymentId = 'pay_offline';

      // If online payment, initialize payment with backend provider
      if (paymentMethod !== 'cod') {
        const payRes = await apiFetch('/api/checkout/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalTotal,
            currency: 'INR',
            notes: {
              customerEmail: formData.email,
              customerName: formData.fullName,
            },
          }),
        });

        const payData = await payRes.json();
        const pOrder = payData.paymentOrder || payData.order;
        if (pOrder) {
          paymentId = pOrder.providerOrderId || pOrder.id || `pay_${Date.now()}`;
          // Verify payment (Mock verification in dev)
          await apiFetch('/api/checkout/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayOrderId: paymentId,
              razorpayPaymentId: `pay_${Date.now()}`,
              razorpaySignature: 'sig_dev_verified',
            }),
          });
        }
      }

      // Submit validated order to backend database
      const orderRes = await apiFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.product.name,
            slug: i.product.slug,
            image: i.product.images[0]?.url || 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp',
            selectedColor: i.selectedColor,
            selectedSize: i.selectedSize,
            quantity: i.quantity,
          })),
          customer: {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
          },
          shippingAddress: {
            fullName: formData.fullName,
            line1: formData.addressLine1,
            line2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            phone: formData.phone,
          },
          shippingMethod,
          promoCode: appliedPromo,
          paymentMethod: paymentLabel,
          paymentId,
        }),
      });

      const orderData = await orderRes.json();
      const createdOrder = orderData.order || (orderData.success ? orderData.order : null);
      if (!createdOrder) {
        throw new Error(orderData.error || 'Failed to place order');
      }

      createOrder(createdOrder);
      clearCart();
      router.push(`/checkout/success?orderId=${createdOrder.orderNumber}`);
    } catch (err: any) {
      console.error('Order placement failed:', err);
      setOrderError(err.message || 'Something went wrong while placing your order. Please try again.');
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-canvas min-h-screen py-20 text-center">
        <div className="max-w-md mx-auto p-8 bg-canvas-card border border-line rounded space-y-4">
          <h2 className="text-lg font-bold text-ink">No items in your checkout bag</h2>
          <p className="text-xs text-ink-muted">Please add a handbag before proceeding to checkout.</p>
          <Link
            href="/shop"
            className="inline-block bg-ink hover:bg-ink-secondary text-white text-xs font-semibold uppercase tracking-wider py-3 px-6 rounded transition-colors"
          >
            Explore Bags
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas min-h-screen py-10 sm:py-14 border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step Indicator */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex items-center justify-between text-xs font-semibold">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex items-center gap-2 ${step >= 1 ? 'text-black' : 'text-ink-muted'}`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-black text-white' : 'bg-canvas-alt text-ink-muted'
                }`}>
                1
              </span>
              <span>Shipping Address</span>
            </button>

            <span className="w-12 h-px bg-line" />

            <button
              type="button"
              onClick={() => setStep(2)}
              className={`flex items-center gap-2 ${step >= 2 ? 'text-black' : 'text-ink-muted'}`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-black text-white' : 'bg-canvas-alt text-ink-muted'
                }`}>
                2
              </span>
              <span>Delivery Method</span>
            </button>

            <span className="w-12 h-px bg-line" />

            <button
              type="button"
              onClick={() => setStep(3)}
              className={`flex items-center gap-2 ${step === 3 ? 'text-black' : 'text-ink-muted'}`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 3 ? 'bg-black text-white' : 'bg-canvas-alt text-ink-muted'
                }`}>
                3
              </span>
              <span>Payment & Review</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Form Step Area */}
          <div className="lg:col-span-7 bg-canvas-card border border-line rounded-lg p-6 sm:p-8 shadow-xs space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="border-b border-line pb-3">
                  <h2 className="text-base font-primary font-semibold text-ink">
                    1. Contact & Delivery Address
                  </h2>
                  <p className="text-xs text-ink-muted">
                    We deliver across 19,000+ pin codes in India via BlueDart and Delhivery.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-ink mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-canvas border border-line rounded focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-ink mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-canvas border border-line rounded focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-ink mb-1">Phone Number (10 digits) *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-canvas border border-line rounded focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-ink mb-1">Address Line 1 (Flat, House no., Building) *</label>
                    <input
                      type="text"
                      name="addressLine1"
                      required
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-canvas border border-line rounded focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-ink mb-1">Address Line 2 (Area, Street, Landmark)</label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-canvas border border-line rounded focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-ink mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-canvas border border-line rounded focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-ink mb-1">State *</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-canvas border border-line rounded focus:outline-none focus:border-black"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-ink mb-1">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full p-2.5 bg-canvas border border-line rounded focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-ink hover:bg-ink-secondary text-white font-primary font-medium text-sm tracking-normal py-3 px-8 rounded flex items-center gap-2 transition-colors"
                  >
                    <span>Continue to Shipping Method</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="border-b border-line pb-3">
                  <h2 className="text-base font-primary font-semibold text-ink">
                    2. Choose Delivery Method
                  </h2>
                  <p className="text-xs text-ink-muted">
                    Delivering to {formData.city}, {formData.state} ({formData.pincode})
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    className={`block p-4 border rounded cursor-pointer transition-all ${shippingMethod === 'standard'
                      ? 'border-black bg-neutral-50 ring-1 ring-black'
                      : 'border-line hover:border-ink/30'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingMethod"
                          checked={shippingMethod === 'standard'}
                          onChange={() => setShippingMethod('standard')}
                          className="accent-black"
                        />
                        <div>
                          <p className="text-xs font-bold text-ink">Standard Express Air Delivery</p>
                          <p className="text-[11px] text-ink-muted">Estimated delivery in 5–7 business days</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700">FREE</span>
                    </div>
                  </label>

                  <label
                    className={`block p-4 border rounded cursor-pointer transition-all ${shippingMethod === 'priority'
                      ? 'border-black bg-neutral-50 ring-1 ring-black'
                      : 'border-line hover:border-ink/30'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingMethod"
                          checked={shippingMethod === 'priority'}
                          onChange={() => setShippingMethod('priority')}
                          className="accent-black"
                        />
                        <div>
                          <p className="text-xs font-bold text-ink">Priority Expedited Transit</p>
                          <p className="text-[11px] text-ink-muted">Express 2–3 business days priority dispatch</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-ink">₹199</span>
                    </div>
                  </label>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-ink-secondary hover:text-ink underline"
                  >
                    ← Back to Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="bg-ink hover:bg-ink-secondary text-white font-primary font-medium text-sm tracking-normal py-3 px-8 rounded flex items-center gap-2 transition-colors"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handlePlaceOrder} className="space-y-5">
                <div className="border-b border-line pb-3">
                  <h2 className="text-base font-primary font-semibold text-ink">
                    3. Payment Selection & Review
                  </h2>
                  <p className="text-xs text-ink-muted">
                    All transactions are 100% secure and encrypted with Razorpay SSL.
                  </p>
                </div>

                {/* Payment Options Radio List */}
                <div className="space-y-3">
                  {/* UPI */}
                  <label
                    className={`block p-4 border rounded cursor-pointer transition-all ${paymentMethod === 'upi'
                      ? 'border-black bg-neutral-50 ring-1 ring-black'
                      : 'border-line hover:border-ink/30'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'upi'}
                          onChange={() => setPaymentMethod('upi')}
                          className="accent-black"
                        />
                        <div className="flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-black" />
                          <span className="text-xs font-bold text-ink">UPI / QR Code</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                        Fastest Checkout
                      </span>
                    </div>
                    {paymentMethod === 'upi' && (
                      <p className="text-[11px] text-ink-secondary mt-2 pl-7">
                        Pay instantly via Google Pay, PhonePe, Paytm, or any BHIM UPI app.
                      </p>
                    )}
                  </label>

                  {/* Cards */}
                  <label
                    className={`block p-4 border rounded cursor-pointer transition-all ${paymentMethod === 'card'
                      ? 'border-black bg-neutral-50 ring-1 ring-black'
                      : 'border-line hover:border-ink/30'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="accent-black"
                      />
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-black" />
                        <span className="text-xs font-bold text-ink">Credit & Debit Cards</span>
                      </div>
                    </div>
                    {paymentMethod === 'card' && (
                      <p className="text-[11px] text-ink-secondary mt-2 pl-7">
                        All major Indian and international cards accepted (Visa, Mastercard, RuPay, Amex).
                      </p>
                    )}
                  </label>

                  {/* Net Banking */}
                  <label
                    className={`block p-4 border rounded cursor-pointer transition-all ${paymentMethod === 'netbanking'
                      ? 'border-black bg-neutral-50 ring-1 ring-black'
                      : 'border-line hover:border-ink/30'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'netbanking'}
                        onChange={() => setPaymentMethod('netbanking')}
                        className="accent-black"
                      />
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-black" />
                        <span className="text-xs font-bold text-ink">Net Banking</span>
                      </div>
                    </div>
                    {paymentMethod === 'netbanking' && (
                      <p className="text-[11px] text-ink-secondary mt-2 pl-7">
                        HDFC, ICICI, SBI, Axis, Kotak, and 50+ other Indian banks.
                      </p>
                    )}
                  </label>

                  {/* Cash on Delivery */}
                  <label
                    className={`block p-4 border rounded cursor-pointer transition-all ${paymentMethod === 'cod'
                      ? 'border-black bg-neutral-50 ring-1 ring-black'
                      : 'border-line hover:border-ink/30'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="accent-black"
                      />
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-black" />
                        <span className="text-xs font-bold text-ink">Cash on Delivery (COD)</span>
                      </div>
                    </div>
                    {paymentMethod === 'cod' && (
                      <p className="text-[11px] text-ink-secondary mt-2 pl-7">
                        Pay cash or scan courier QR upon arrival at your doorstep.
                      </p>
                    )}
                  </label>
                </div>

                {orderError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                    {orderError}
                  </div>
                )}

                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs text-ink-secondary hover:text-ink underline"
                  >
                    ← Back to Shipping
                  </button>

                  <button
                    type="submit"
                    disabled={isPlacingOrder}
                    className="bg-ink hover:bg-ink-secondary text-white font-primary font-medium text-sm tracking-normal py-4 px-8 rounded flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isPlacingOrder ? (
                      <span>Placing Your Order...</span>
                    ) : (
                      <>
                        <span>Place Order • ₹{finalTotal.toLocaleString('en-IN')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-5 bg-canvas-card border border-line rounded-lg p-5 sm:p-6 space-y-4 shadow-xs sticky top-28">
            <h3 className="text-sm font-primary font-semibold text-ink border-b border-line pb-3">
              Items in Your Order ({items.length})
            </h3>

            <div className="divide-y divide-line max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded bg-canvas-alt border border-line overflow-hidden shrink-0">
                    <Image
                      src={item.product.images[0]?.url || 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp'}
                      alt={item.product.name}
                      fill
                      loading="lazy"
                      decoding="async"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-ink line-clamp-1">{item.product.name}</p>
                    <p className="text-ink-muted text-[11px]">
                      {item.selectedColor} • Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-ink">
                    ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-line pt-3 space-y-1.5 text-xs text-ink-secondary">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Promo Discount ({appliedPromo})</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingCharge === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${shippingCharge}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-ink border-t border-line pt-2">
                <span>Total Due</span>
                <span>₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-3 bg-canvas rounded border border-line text-[11px] text-ink-muted space-y-1">
              <p className="flex items-center gap-1.5 text-black font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-black" />
                7-Day Easy Return Guarantee
              </p>
              <p>Doorstep pickup available if you wish to return your bag.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

