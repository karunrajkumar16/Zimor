import React from 'react';
import Link from 'next/link';

export default function ReturnsPolicyPage() {
  return (
    <div className="bg-canvas min-h-screen py-10 sm:py-16 border-b border-line">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="text-[11px] text-ink-muted uppercase tracking-wider flex items-center gap-2">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <span className="text-ink font-semibold">Returns & Refunds</span>
        </nav>

        <div className="space-y-2 border-b border-line pb-6">
          <span className="text-xs uppercase tracking-widest text-brand-700 font-bold">
            Customer Guarantee
          </span>
          <h1 className="font-serif text-[30px] sm:text-[42px] font-normal text-ink tracking-tight">
            7-Day Easy Return Policy
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary">
            Shop with total peace of mind. Doorstep reverse pickup available across India.
          </p>
        </div>

        <div className="bg-canvas-card border border-line rounded-lg p-6 sm:p-8 space-y-6 text-xs text-ink-secondary leading-relaxed shadow-xs">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              1. 7-Day Return Window
            </h2>
            <p>
              We offer a straightforward <strong>7-day return window</strong> starting from the day your package is marked delivered by the courier partner. If the size, color, or silhouette does not suit your workday routine, you may request a return or store credit without friction.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              2. Return Eligibility Criteria
            </h2>
            <p>To qualify for a full refund, items must fulfill the following conditions:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The bag must be completely unused, undamaged, and unworn.</li>
              <li>Original brand tags, zipper protective peels, and packaging must remain attached.</li>
              <li>The complementary dust bag and any bundled accessories (e.g. wristlet pouch, detachable crossbody sling) must be returned together.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              3. How to Initiate a Return
            </h2>
            <p>
              You can initiate a return in two easy ways:
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                <strong>From Your Account:</strong> Navigate to your <Link href="/account/orders" className="text-brand-700 underline font-semibold">Orders Page</Link> and click "Request Return" on the delivered order.
              </li>
              <li>
                <strong>Via Email:</strong> Email us at <strong>zimorindia@gmail.com</strong> with your Order Number (e.g. ZMR-2026-8941) and reason for return.
              </li>
            </ol>
            <p>
              Our reverse logistics team will schedule a doorstep pickup within 24 to 48 hours.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              4. Refund Timelines
            </h2>
            <p>
              Once the returned product arrives at our facility and passes the quality check, your refund will be processed within <strong>48 hours</strong>.
            </p>
            <p>
              - <strong>Prepaid Orders (Cards/NetBanking/UPI):</strong> Refunded directly to the source account within 5–7 banking days.
            </p>
            <p>
              - <strong>Cash on Delivery (COD):</strong> Refunded via bank transfer (NEFT/IMPS) or UPI payment link after collecting beneficiary account details.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              5. Exchanges
            </h2>
            <p>
              We currently do not offer direct cross-color or cross-model automated exchanges. Please initiate a return for your existing order and place a new order for the desired silhouette or colorway.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

