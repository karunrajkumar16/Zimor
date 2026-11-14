import React from 'react';
import Link from 'next/link';

export default function ShippingPolicyPage() {
  return (
    <div className="bg-canvas min-h-screen py-10 sm:py-16 border-b border-line">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="text-[11px] text-ink-muted uppercase tracking-wider flex items-center gap-2">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <span className="text-ink font-semibold">Shipping Policy</span>
        </nav>

        <div className="space-y-2 border-b border-line pb-6">
          <span className="text-xs uppercase tracking-widest text-brand-700 font-bold">
            Customer Information
          </span>
          <h1 className="font-primary text-[30px] sm:text-[42px] font-normal text-ink tracking-tight">
            Shipping & Delivery Policy
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary">
            Last updated: October 2026 • Free express delivery across 19,000+ pin codes in India.
          </p>
        </div>

        <div className="bg-canvas-card border border-line rounded-lg p-6 sm:p-8 space-y-6 text-xs text-ink-secondary leading-relaxed shadow-xs">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              1. Free Shipping Across India
            </h2>
            <p>
              We ship across India within 5–7 business days from the date of order confirmation. We are pleased to offer <strong>100% Free Shipping</strong> on all prepaid and Cash on Delivery orders, with zero hidden handling fees at checkout.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              2. Order Processing & Dispatch Timelines
            </h2>
            <p>
              Orders placed before 2:00 PM IST on business days are dispatched within 24 to 48 hours following a mandatory quality check. Orders placed on Sundays or public holidays are processed on the subsequent working day.
            </p>
            <p>
              During peak festive seasons, seasonal sales, or regional weather advisories, order fulfillment may experience a slight buffer of 1–2 business days.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              3. Courier Partners & Live Shipment Tracking
            </h2>
            <p>
              We partner exclusively with tier-1 logistics providers — including <strong>BlueDart Express, Delhivery, and DTDC</strong> — to ensure your Zimor handbag arrives in pristine condition.
            </p>
            <p>
              Once your order is handed over to the courier, an email and SMS containing your live AWB Tracking Number and courier tracking link will be dispatched immediately. You can also view real-time tracking in your <Link href="/account/orders" className="text-brand-700 underline font-semibold">Orders Dashboard</Link>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              4. Cash on Delivery (COD) Terms
            </h2>
            <p>
              Cash on Delivery is available across most serviceable pin codes. Upon parcel arrival, customers may settle the order total using cash or via digital UPI QR code presented on the delivery executive's terminal.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              5. Packaging & Gift Orders
            </h2>
            <p>
              Every Zimor bag is wrapped in protective tissue and nestled inside our signature breathable dust bag. For orders marked as gifts, an exterior embossed rigid luxury gift box tied with an espresso grosgrain ribbon is provided, and pricing details are omitted from the shipping label.
            </p>
          </section>

          <div className="pt-4 border-t border-line text-[11px] text-ink-muted">
            For shipping queries or address adjustments, please contact us at{' '}
            <strong className="text-ink">zimorindia@gmail.com</strong> within 6 hours of placing your order.
          </div>
        </div>
      </div>
    </div>
  );
}

