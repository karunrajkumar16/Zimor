import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-canvas min-h-screen py-10 sm:py-16 border-b border-line">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <nav className="text-[11px] text-ink-muted uppercase tracking-wider flex items-center gap-2">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <span className="text-ink font-semibold">Privacy Policy</span>
        </nav>

        <div className="space-y-2 border-b border-line pb-6">
          <span className="text-xs uppercase tracking-widest text-brand-700 font-bold">
            Legal & Data Protection
          </span>
          <h1 className="font-primary text-[30px] sm:text-[42px] font-normal text-ink tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary">
            Your privacy is of paramount importance to Zimor India.
          </p>
        </div>

        <div className="bg-canvas-card border border-line rounded-lg p-6 sm:p-8 space-y-6 text-xs text-ink-secondary leading-relaxed shadow-xs">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              1. Information We Collect
            </h2>
            <p>
              We collect personal information that you voluntarily provide when registering an account, placing an order, submitting a customer review, or filling out our contact form. This includes your name, email address, shipping destination, billing address, telephone number, and payment preference.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              2. How Your Information is Used
            </h2>
            <p>
              Your personal data is utilized strictly to fulfill and deliver your handbag orders, communicate shipping notifications, process 7-day returns, manage customer support inquiries, and periodically share new collection updates if you have opted in.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              3. Payment Security & Encryption
            </h2>
            <p>
              We use industry-standard SSL encryption and partner with PCI-DSS compliant payment gateways (Razorpay). Zimor India never stores your complete credit/debit card numbers or CVV on our servers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              4. Cookies & Analytics
            </h2>
            <p>
              Our website uses essential cookies to remember your bag items, manage session authentication, and analyze site performance to deliver a smooth shopping experience. You may configure your browser to reject cookies if desired.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              5. Your Rights & Contact
            </h2>
            <p>
              You maintain the right to review, update, or request deletion of your personal account data at any time. For privacy inquiries, please contact our Data Protection Officer at <strong>zimorindia@gmail.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

