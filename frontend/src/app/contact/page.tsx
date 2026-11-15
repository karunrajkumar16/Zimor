'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, MapPin, Clock, CheckCircle, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderNumber: '',
    subject: 'Order & Shipping Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        orderNumber: '',
        subject: 'Order & Shipping Inquiry',
        message: '',
      });
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="bg-canvas min-h-screen py-10 sm:py-16 border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb */}
        <nav className="text-[11px] text-ink-muted uppercase tracking-wider flex items-center gap-2">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <span className="text-ink font-semibold">Contact & Client Support</span>
        </nav>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-widest text-brand-700 font-bold">
            We’re Here to Help
          </span>
          <h1 className="font-primary text-[34px] sm:text-[46px] lg:text-[52px] font-normal text-ink tracking-tight leading-tight">
            Get in Touch with Zimor
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
            Have questions about laptop compatibility, leather care, order status, or bulk orders? Our support team is at your service.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Info Column */}
          <div className="lg:col-span-5 bg-canvas-card border border-line rounded-lg p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-base font-semibold uppercase tracking-wider text-ink border-b border-line pb-3">
              Direct Contact Channels
            </h2>

            <div className="space-y-5 text-xs text-ink-secondary">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-ink">Email Support</p>
                  <p className="text-ink-secondary mt-0.5">zimorindia@gmail.com</p>
                  <p className="text-ink-muted text-[11px]">Responses within 12–24 business hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-ink">WhatsApp & Chat Assistance</p>
                  <p className="text-ink-secondary mt-0.5">+91 98765 43210</p>
                  <p className="text-ink-muted text-[11px]">Instant support during operating hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-ink">Operating Hours</p>
                  <p className="text-ink-secondary mt-0.5">Monday to Saturday</p>
                  <p className="text-ink-muted text-[11px]">10:00 AM – 7:00 PM IST (excluding national holidays)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-ink">Studio & Warehouse</p>
                  <p className="text-ink-secondary mt-0.5">Zimor India Design Studio</p>
                  <p className="text-ink-muted text-[11px]">Bengaluru & New Delhi, India</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-brand-50 border border-brand-200 rounded text-xs text-brand-900 space-y-1">
              <p className="font-bold">Need a Quick Answer?</p>
              <p className="text-[11px] text-brand-800">
                Check our Sizing Guide and FAQs for instant answers on laptop fits, shipping timelines, and returns.
              </p>
              <Link href="/faq" className="inline-block text-[11px] font-semibold text-brand-900 underline pt-1">
                View Frequently Asked Questions →
              </Link>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7 bg-canvas-card border border-line rounded-lg p-6 sm:p-8 shadow-xs">
            {submitted ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-ink">Message Sent Successfully!</h3>
                <p className="text-xs text-ink-secondary max-w-sm mx-auto">
                  Thank you for reaching out. A client support specialist will review your request and get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-b border-line pb-3">
                  <h2 className="text-base font-bold uppercase tracking-wider text-ink">
                    Send Us a Message
                  </h2>
                  <p className="text-xs text-ink-muted">
                    Fill in your details below and we will get back to you promptly.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-ink mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Radhika Sen"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2.5 bg-canvas border border-line rounded focus:outline-none focus:border-brand-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-ink mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. radhika@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2.5 bg-canvas border border-line rounded focus:outline-none focus:border-brand-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-ink mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="10 digit mobile"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2.5 bg-canvas border border-line rounded focus:outline-none focus:border-brand-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-ink mb-1">Order Number (if applicable)</label>
                    <input
                      type="text"
                      placeholder="e.g. ZMR-2026-8941"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                      className="w-full p-2.5 bg-canvas border border-line rounded focus:outline-none focus:border-brand-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-ink mb-1">Inquiry Topic</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full p-2.5 bg-canvas border border-line rounded focus:outline-none focus:border-brand-600"
                    >
                      <option value="Order & Shipping Inquiry">Order & Shipping Status</option>
                      <option value="Product Sizing & Laptop Fit">Product Sizing & Laptop Compatibility</option>
                      <option value="Returns & Exchange Request">7-Day Return / Exchange Request</option>
                      <option value="Corporate & Bulk Orders">Corporate & Bulk Orders</option>
                      <option value="Other Inquiries">Other Feedback / Questions</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-ink mb-1">Your Message *</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Please share how we can assist you..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full p-2.5 bg-canvas border border-line rounded focus:outline-none focus:border-brand-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-ink hover:bg-ink-secondary text-white font-primary font-medium text-sm tracking-normal py-3.5 rounded flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

