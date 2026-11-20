'use client';

import React, { useState, useEffect } from 'react';
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
  const { user, isAuthenticated, loginWithGoogle } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Address State
  const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const [formData, setFormData] = useState({
    fullName: user?.name || defaultAddr?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || defaultAddr?.phone || '',
    addressLine1: defaultAddr?.addressLine1 || '',
    addressLine2: defaultAddr?.addressLine2 || '',
    city: defaultAddr?.city || '',
    state: defaultAddr?.state || 'Maharashtra',
    pincode: defaultAddr?.pincode || '',
  });

  useEffect(() => {
    if (user) {
      const def = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
      setFormData((prev) => ({
        fullName: prev.fullName || user.name || def?.fullName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || def?.phone || '',
        addressLine1: prev.addressLine1 || def?.addressLine1 || '',
        addressLine2: prev.addressLine2 || def?.addressLine2 || '',
        city: prev.city || def?.city || '',
        state: prev.state || def?.state || 'Maharashtra',
        pincode: prev.pincode || def?.pincode || '',
      }));
    }
  }, [user]);

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

  // Helper to load Razorpay Checkout script dynamically
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlacingOrder(true);
    setOrderError(null);

    const paymentLabel =
      paymentMethod === 'upi'
        ? 'UPI (Razorpay Test Mode)'
        : paymentMethod === 'card'
          ? 'Credit / Debit Card (Razorpay Test Mode)'
          : paymentMethod === 'netbanking'
            ? 'Net Banking (Razorpay Test Mode)'
            : 'Cash on Delivery';

    try {
      // 1. CASH ON DELIVERY FLOW
      if (paymentMethod === 'cod') {
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
              id: user?.id,
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
            paymentStatus: 'Pending',
          }),
        });

        const orderData = await orderRes.json();
        const createdOrder = orderData.order || (orderData.success ? orderData.order : null);
        if (!createdOrder) {
          throw new Error(orderData.error || 'Failed to place Cash on Delivery order');
        }

        clearCart();
        router.push(`/checkout/success?orderId=${createdOrder.orderNumber}`);
        return;
      }

      // 2. RAZORPAY TEST MODE FLOW
      // Request server-side calculated Razorpay order
      const payRes = await apiFetch('/api/checkout/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.product.name,
            slug: i.product.slug,
            image: i.product.images[0]?.url,
            selectedColor: i.selectedColor,
            selectedSize: i.selectedSize,
            quantity: i.quantity,
          })),
          shippingMethod,
          promoCode: appliedPromo,
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
        }),
      });

      const payData = await payRes.json();
      if (!payRes.ok || !payData.success || !payData.razorpayOrderId) {
        throw new Error(payData.error || 'Failed to initialize Razorpay checkout session.');
      }

      // Ensure Razorpay SDK is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || typeof (window as any).Razorpay === 'undefined') {
        throw new Error('Unable to load Razorpay secure checkout script. Please check your network connection.');
      }

      const rzpOptions = {
        key: payData.keyId,
        amount: payData.amount, // in paise, calculated strictly by backend
        currency: payData.currency || 'INR',
        name: 'ZIMOR India',
        description: 'Luxury Leather Atelier',
        image: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp',
        order_id: payData.razorpayOrderId,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#B44220', // ZIMOR's signature executive terracotta
        },
        modal: {
          ondismiss: () => {
            setIsPlacingOrder(false);
            setOrderError('Payment checkout window was closed before completion. You can retry at your convenience.');
          },
        },
        handler: async (response: any) => {
          try {
            // Cryptographic server-side verification and order finalization
            const verifyRes = await apiFetch('/api/checkout/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                items: items.map((i) => ({
                  productId: i.productId,
                  productName: i.product.name,
                  slug: i.product.slug,
                  image: i.product.images[0]?.url,
                  selectedColor: i.selectedColor,
                  selectedSize: i.selectedSize,
                  quantity: i.quantity,
                })),
                customer: {
                  name: formData.fullName,
                  email: formData.email,
                  phone: formData.phone,
                  id: user?.id,
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
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success || !verifyData.order) {
              throw new Error(verifyData.error || 'Server-side payment verification failed.');
            }

            clearCart();
            router.push(`/checkout/success?orderId=${verifyData.order.orderNumber}`);
          } catch (verifyErr: any) {
            console.error('Payment verification failed:', verifyErr);
            setOrderError(
              verifyErr.message ||
                `Payment verification could not be finalized. Please contact concierge with reference: ${response.razorpay_payment_id}`
            );
            setIsPlacingOrder(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.on('payment.failed', (failResponse: any) => {
        console.error('Razorpay payment failed:', failResponse.error);
        setOrderError(
          `Payment transaction failed: ${failResponse.error?.description || 'Your payment was declined by the test gateway.'}`
        );
        setIsPlacingOrder(false);
      });
      rzp.open();
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

                {!isAuthenticated ? (
                  <div className="p-3 bg-neutral-50 border border-line rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-ink">Have a ZIMOR account?</p>
                      <p className="text-[11px] text-ink-muted">Sign in with Google to auto-fill delivery details and track this order.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => loginWithGoogle('/checkout')}
                      className="inline-flex items-center gap-2 bg-white hover:bg-neutral-100 text-ink border border-line px-3 py-1.5 rounded font-medium shadow-2xs shrink-0 cursor-pointer text-xs"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span>Sign in with Google</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 bg-neutral-50 border border-line rounded flex items-center justify-between text-xs">
                    <span className="text-ink-secondary">
                      Signed in as <strong className="text-ink">{user?.name}</strong> ({user?.email})
                    </span>
                    <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-mono font-semibold">
                      User Verified
                    </span>
                  </div>
                )}

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

