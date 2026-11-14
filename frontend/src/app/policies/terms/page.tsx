import React from 'react';
import Link from 'next/link';

export default function TermsConditionsPage() {
  return (
    <div className="bg-canvas min-h-screen py-10 sm:py-16 border-b border-line">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <nav className="text-[11px] text-ink-muted uppercase tracking-wider flex items-center gap-2">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <span className="text-ink font-semibold">Terms & Conditions</span>
        </nav>

        <div className="space-y-2 border-b border-line pb-6">
          <span className="text-xs uppercase tracking-widest text-brand-700 font-bold">
            Legal Terms
          </span>
          <h1 className="font-primary text-[30px] sm:text-[42px] font-normal text-ink tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary">
            Please read these terms carefully before accessing or using the Zimor India website.
          </p>
        </div>

        <div className="bg-canvas-card border border-line rounded-lg p-6 sm:p-8 space-y-6 text-xs text-ink-secondary leading-relaxed shadow-xs">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              1. Agreement to Terms
            </h2>
            <p>
              By accessing and placing orders through the Zimor India website, you agree to comply with and be bound by these Terms & Conditions, our Shipping Policy, and our Privacy Policy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              2. Product Descriptions & Accuracy
            </h2>
            <p>
              We endeavor to display colors, dimensions, and specifications as accurately as possible. However, slight variations in color calibration may occur across different computer displays and mobile screens.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              3. Pricing & Taxes
            </h2>
            <p>
              All prices stated on our website are in Indian Rupees (INR) and are inclusive of Goods and Services Tax (GST). We reserve the right to revise product prices, promotional discounts, and availability without prior notification.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              4. Orders & Fulfillment
            </h2>
            <p>
              Placing an order constitutes an offer to purchase. Zimor reserves the right to cancel or decline any order in the event of suspected fraud, pricing errors, or logistics unserviceability. In such instances, full refunds will be credited immediately.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              5. Intellectual Property
            </h2>
            <p>
              All content on this website — including brand logos, designs, photographs, copy, graphics, and trademarks — is the exclusive property of Zimor India and protected under Indian and international intellectual property laws.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              6. Governing Law
            </h2>
            <p>
              These Terms and any contractual disputes arising hereunder shall be governed by and construed in accordance with the laws of the Republic of India, subject to the jurisdiction of the courts in Bengaluru / New Delhi.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

