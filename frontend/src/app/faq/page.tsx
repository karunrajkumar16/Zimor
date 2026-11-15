import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, ShieldCheck, Sparkles, Package, Mail } from 'lucide-react';
import { FAQAccordion } from '@/components/faq/FAQAccordion';
import { FAQ_TITLE, FAQS } from '@/data/faqs';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) — Zimor India',
  description:
    'Find answers to frequently asked questions about ZIMOR orders, shipping, returns, refunds, warranty, and bag care.',
};

export default function FAQPage() {
  return (
    <div className="bg-white min-h-screen py-8 sm:py-14 border-b border-line/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Breadcrumb Navigation */}
        <nav
          className="text-[11px] uppercase tracking-[0.2em] text-ink-muted flex items-center gap-2 font-secondary"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-ink transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-ink font-semibold">FAQs</span>
        </nav>

        {/* Main FAQ Accordion Component */}
        <section aria-labelledby="faq-page-heading">
          <FAQAccordion
            items={FAQS}
            title={FAQ_TITLE}
            subtitle="Find answers to common questions regarding your order, shipping timelines, returns, warranty coverage, and product care."
            defaultOpenId="shipping"
          />
        </section>

        {/* Dedicated Product Care Section (Destination for 'Discover Product Care') */}
        <section
          id="product-care"
          className="scroll-mt-24 pt-8 border-t border-line/60"
          aria-labelledby="product-care-heading"
        >
          <div className="mb-6">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-zimor-orange font-medium font-primary mb-1.5">
              CARE INSTRUCTIONS
            </p>
            <h2
              id="product-care-heading"
              className="font-primary text-xl sm:text-2xl lg:text-3xl font-normal text-zimor-black tracking-tight"
            >
              How to Care for Your ZIMOR Piece
            </h2>
            <p className="font-secondary text-xs sm:text-sm text-zimor-brown mt-1.5 leading-relaxed">
              Crafted to accompany you through daily commutes and elevated moments, our bags require minimal yet intentional maintenance to preserve their silhouette and finish over years.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-5 border border-line/60 bg-white space-y-2">
              <div className="w-8 h-8 rounded-full bg-canvas-soft/30 flex items-center justify-center text-zimor-orange mb-3">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-primary text-sm sm:text-base font-medium text-zimor-black">
                Routine Cleaning
              </h3>
              <p className="font-secondary text-xs text-zimor-brown leading-relaxed">
                Wipe gently with a clean, soft, slightly damp microfiber cloth. Allow the piece to air-dry naturally at room temperature. Avoid machine washing or harsh chemical solvents.
              </p>
            </div>

            <div className="p-5 border border-line/60 bg-white space-y-2">
              <div className="w-8 h-8 rounded-full bg-canvas-soft/30 flex items-center justify-center text-zimor-orange mb-3">
                <Package className="w-4 h-4" />
              </div>
              <h3 className="font-primary text-sm sm:text-base font-medium text-zimor-black">
                Storage &amp; Structure
              </h3>
              <p className="font-secondary text-xs text-zimor-brown leading-relaxed">
                When not in use, lightly stuff the bag with acid-free tissue paper to retain its architectural structure. Store inside the complimentary breathable Zimor dust bag.
              </p>
            </div>

            <div className="p-5 border border-line/60 bg-white space-y-2">
              <div className="w-8 h-8 rounded-full bg-canvas-soft/30 flex items-center justify-center text-zimor-orange mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-primary text-sm sm:text-base font-medium text-zimor-black">
                Heat &amp; Moisture
              </h3>
              <p className="font-secondary text-xs text-zimor-brown leading-relaxed">
                While our superior faux leather is water-resistant, promptly wipe away standing droplets. Keep your bag away from direct heat sources, radiators, or prolonged direct midday sun.
              </p>
            </div>
          </div>
        </section>

        {/* Concierge Assistance Card */}
        <section
          className="p-6 sm:p-8 border border-line/60 bg-[#faf9f6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          aria-label="Contact Concierge"
        >
          <div className="space-y-1.5 max-w-lg">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zimor-orange font-primary font-medium">
              CLIENT SERVICES
            </p>
            <h3 className="font-primary text-lg sm:text-xl font-medium text-zimor-black">
              Still Have Questions?
            </h3>
            <p className="font-secondary text-xs sm:text-sm text-zimor-brown leading-relaxed">
              Our customer concierge is available Monday to Saturday, 9:30 AM to 6:00 PM IST, to assist you with order inquiries, product sizing, or personal styling advice.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-black text-white hover:bg-ink-secondary transition-colors font-primary text-xs font-medium uppercase tracking-[0.14em]"
            >
              <span>Contact Us</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href="mailto:care@zimorindia.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-line text-zimor-black hover:border-black transition-colors font-primary text-xs font-medium uppercase tracking-[0.14em]"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Support</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
