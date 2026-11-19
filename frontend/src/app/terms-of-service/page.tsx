'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { EXACT_TERMS_OF_SERVICE_TEXT } from '@/data/legalPolicies';

export default function TermsOfServicePage() {
  const [content, setContent] = useState<string>(EXACT_TERMS_OF_SERVICE_TEXT);

  useEffect(() => {
    let isMounted = true;
    apiFetch('/api/content/terms-of-service')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch terms from database');
        return res.json();
      })
      .then((json) => {
        if (isMounted && json.content?.data?.markdown) {
          setContent(json.content.data.markdown);
        }
      })
      .catch((err) => {
        console.warn('[Terms of Service] Using authentic built-in legal archive:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-white min-h-screen py-8 sm:py-16 border-b border-line/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Breadcrumb Navigation */}
        <nav
          className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-ink-muted flex items-center gap-2 font-secondary"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-ink transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/policy" className="hover:text-ink transition-colors">
            Policy
          </Link>
          <span>/</span>
          <span className="text-ink font-semibold">Terms of Service</span>
        </nav>

        {/* Header Masthead */}
        <div className="space-y-3 pb-6 border-b border-line">
          <h1 className="font-primary text-3xl sm:text-5xl font-normal text-black tracking-tight leading-[1.12]">
            Terms of Service
          </h1>

          <p className="font-secondary text-xs sm:text-sm text-[#555555] leading-relaxed max-w-2xl">
            Please read these Terms of Service carefully before accessing or using our website and atelier services.
          </p>
        </div>

        {/* Legal Document Render */}
        <article className="prose prose-neutral max-w-none font-secondary text-[#222222] text-xs sm:text-[14px] leading-[1.8] space-y-6">
          {/* OVERVIEW */}
          <div className="bg-[#FAF8F5] p-5 sm:p-6 rounded border border-line/60 space-y-3">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight">
              OVERVIEW
            </h2>
            <p className="text-[#333333]">
              This website is operated by ZIMOR. Throughout the site, the terms “we”, “us” and “our” refer to ZIMOR. ZIMOR offers this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.
            </p>
            <p className="text-[#333333]">
              By visiting our website and/or purchasing something from us, you engage in our “Service” and agree to be bound by the following Terms of Service (“Terms”), including any additional terms and conditions and policies referenced herein or available by hyperlink. These Terms apply to all users of the website, including browsers, vendors, customers, merchants and contributors of content.
            </p>
            <p className="text-[#333333]">
              Please read these Terms carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these Terms. If you do not agree to all the terms and conditions of this agreement, you may not access the website or use our services.
            </p>
            <p className="text-[#333333]">
              Any new features or tools added to our store will also be subject to these Terms. We reserve the right to update, change or replace any part of these Terms by posting updates on our website. It is your responsibility to check this page periodically for changes. Your continued use of the website following any changes constitutes acceptance of those changes.
            </p>
            <p className="text-[#333333] font-medium">
              Our store is hosted on Shopify Inc., which provides us with the online e-commerce platform that allows us to sell our products and services.
            </p>
          </div>

          {/* ONLINE STORE TERMS */}
          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              ONLINE STORE TERMS
            </h2>
            <div className="space-y-3">
              <p>
                By agreeing to these Terms, you confirm that you are at least the age of majority in your state or country of residence, or that you have obtained the necessary consent from a parent or legal guardian.
              </p>
              <p>
                You may not use our products for any illegal or unauthorized purpose, nor may you violate any applicable laws while using our services, including copyright laws.
              </p>
              <p>
                You must not transmit any viruses, malware, worms or any code of a destructive nature.
              </p>
              <p>
                Any breach or violation of these Terms may result in the immediate termination of your access to our services.
              </p>
            </div>
          </div>

          {/* GENERAL CONDITIONS */}
          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              GENERAL CONDITIONS
            </h2>
            <div className="space-y-3">
              <p>
                We reserve the right to refuse service to anyone for any reason at any time, subject to applicable laws.
              </p>
              <p>
                You understand that your content (excluding payment information) may be transferred unencrypted over various networks and may undergo changes to meet technical requirements. Payment information is encrypted during transfer over networks.
              </p>
              <p>
                You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of our website, services or content without our express written permission.
              </p>
              <p>
                The headings used in this agreement are included for convenience only and do not affect the interpretation of these Terms.
              </p>
            </div>
          </div>

          {/* ACCURACY, COMPLETENESS AND TIMELINESS OF INFORMATION */}
          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              ACCURACY, COMPLETENESS AND TIMELINESS OF INFORMATION
            </h2>
            <div className="space-y-3">
              <p>
                We are not responsible if information available on this website is inaccurate, incomplete or outdated.
              </p>
              <p>
                The material on this website is provided for general information and should not be relied upon as the sole basis for making purchasing decisions.
              </p>
              <p>
                Product images, descriptions, specifications and other information are provided as accurately as possible. However, slight variations in colour, texture, appearance or finish may occur due to lighting, photography, screen settings or manufacturing differences.
              </p>
              <p>
                We reserve the right to modify website content at any time without an obligation to update previously published information.
              </p>
            </div>
          </div>

          {/* MODIFICATIONS TO THE SERVICE AND PRICES */}
          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              MODIFICATIONS TO THE SERVICE AND PRICES
            </h2>
            <div className="space-y-3">
              <p>
                Prices of our products are subject to change without prior notice.
              </p>
              <p>
                We reserve the right to modify, suspend or discontinue any part of our website or services at any time without notice.
              </p>
              <p>
                ZIMOR shall not be liable to you or any third party for any modification, price change, suspension or discontinuation of services, except as required by applicable law.
              </p>
            </div>
          </div>

          {/* PRODUCTS OR SERVICES */}
          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              PRODUCTS OR SERVICES
            </h2>
            <div className="space-y-3">
              <p>
                Certain products may be available exclusively online through our website. These products may have limited quantities and are subject to returns or exchanges only in accordance with our Refund and Return Policy.
              </p>
              <p>
                We make every effort to display our products as accurately as possible, including colours, designs, materials and details. However, actual product colours may vary depending on your screen and device settings.
              </p>
              <p>
                ZIMOR reserves the right to limit product sales to any person, geographic region or jurisdiction, subject to applicable laws.
              </p>
              <p>
                We also reserve the right to limit quantities, discontinue products or modify product descriptions and pricing at any time without prior notice.
              </p>
              <p>
                All product offers are subject to availability.
              </p>
            </div>
          </div>

          {/* ACCURACY OF BILLING AND ACCOUNT INFORMATION */}
          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              ACCURACY OF BILLING AND ACCOUNT INFORMATION
            </h2>
            <div className="space-y-3">
              <p>
                We reserve the right to refuse or cancel any order placed with us.
              </p>
              <p>
                We may, at our discretion, limit or cancel quantities purchased per person, household or order. These restrictions may apply to orders placed using the same customer account, payment method, billing address or shipping address.
              </p>
              <p>
                If we make changes to or cancel an order, we may attempt to notify you using the email address or phone number provided at checkout.
              </p>
              <p>
                You agree to provide accurate, complete and current purchase and account information for all transactions made through our store.
              </p>
              <p>
                You are responsible for ensuring that your contact, billing and shipping information is correct to avoid delivery delays or failed transactions.
              </p>
              <p>
                For further details, please review our Refund and Return Policy.
              </p>
            </div>
          </div>

          {/* OPTIONAL TOOLS */}
          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              OPTIONAL TOOLS
            </h2>
            <div className="space-y-3">
              <p>
                We may provide access to third-party tools or services over which we have no control or involvement.
              </p>
              <p>
                You acknowledge that these tools are provided on an “as is” and “as available” basis without warranties or guarantees of any kind.
              </p>
              <p>
                Your use of optional third-party tools is entirely at your own risk, and you should review the terms and conditions of the relevant third-party providers before using them.
              </p>
              <p>
                Any new features or services introduced on our website will also be subject to these Terms.
              </p>
            </div>
          </div>

          {/* THIRD-PARTY LINKS */}
          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              THIRD-PARTY LINKS
            </h2>
            <div className="space-y-3">
              <p>
                Our website may contain links to third-party websites, products or services.
              </p>
              <p>
                These links may direct you to websites that are not affiliated with ZIMOR. We are not responsible for examining or evaluating the content, accuracy or policies of these third-party websites.
              </p>
              <p>
                ZIMOR shall not be responsible for any damages, losses or issues arising from transactions or interactions with third-party websites.
              </p>
              <p>
                We encourage you to review the policies and terms of any third-party website before engaging in transactions with them.
              </p>
            </div>
          </div>

          {/* USER COMMENTS, FEEDBACK AND SUBMISSIONS */}
          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              USER COMMENTS, FEEDBACK AND SUBMISSIONS
            </h2>
            <div className="space-y-3">
              <p>
                If you submit comments, suggestions, ideas, reviews, feedback or other materials to us, you grant ZIMOR permission to use, reproduce, edit, publish and distribute such submissions for business and promotional purposes, subject to applicable law.
              </p>
              <p>
                We are not obligated to maintain comments in confidence, provide compensation or respond to submissions unless otherwise agreed.
              </p>
              <p>
                You agree that your submissions will not violate the rights of any third party, including intellectual property, privacy or other proprietary rights.
              </p>
              <p>
                You must not submit unlawful, offensive, abusive, misleading or harmful content or upload any viruses or malicious code.
              </p>
              <p>
                You remain responsible for the content and accuracy of any comments or submissions you provide.
              </p>
            </div>
          </div>

          {/* PERSONAL INFORMATION */}
          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              PERSONAL INFORMATION
            </h2>
            <div className="space-y-3">
              <p>
                Your submission of personal information through our store is governed by our Privacy Policy.
              </p>
              <p>
                Please review our Privacy Policy to understand how we collect, use, store and protect your personal information.
              </p>
            </div>
          </div>

          {/* ERRORS, INACCURACIES AND OMISSIONS */}
          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              ERRORS, INACCURACIES AND OMISSIONS
            </h2>
            <div className="space-y-3">
              <p>
                Occasionally, information on our website may contain typographical errors, inaccuracies or omissions relating to product descriptions, pricing, promotions, shipping charges, delivery timelines or product availability.
              </p>
              <p>
                We reserve the right to correct such errors, update information or cancel orders if any information is inaccurate, even after an order has been placed, subject to applicable consumer protection laws.
              </p>
              <p>
                We are not obligated to update or clarify information on our website unless required by law.
              </p>
            </div>
          </div>

          {/* PROHIBITED USES */}
          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              PROHIBITED USES
            </h2>
            <p className="mb-2">You are prohibited from using our website or its content:</p>
            <div className="space-y-2">
              <p>(a) For any unlawful purpose.</p>
              <p>(b) To solicit others to participate in unlawful activities.</p>
              <p>(c) To violate any applicable laws or regulations.</p>
              <p>(d) To infringe upon our intellectual property rights or those of others.</p>
              <p>(e) To harass, abuse, insult, harm, defame or discriminate against others.</p>
              <p>(f) To submit false or misleading information.</p>
              <p>(g) To upload or transmit viruses or malicious code.</p>
              <p>(h) To collect or track the personal information of others without authorization.</p>
              <p>(i) To spam, phish, scrape or collect website information without permission.</p>
              <p>(j) For any obscene or unlawful purpose.</p>
              <p>(k) To interfere with or bypass the security features of our website.</p>
            </div>
            <p className="mt-3">
              We reserve the right to suspend or terminate access to our services if these prohibited activities are identified, subject to applicable law.
            </p>
          </div>

          {/* DISCLAIMER OF WARRANTIES; LIMITATION OF LIABILITY */}
          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              DISCLAIMER OF WARRANTIES; LIMITATION OF LIABILITY
            </h2>
            <div className="space-y-3">
              <p>
                We do not guarantee that your use of our website or services will be uninterrupted, timely, secure or error-free.
              </p>
              <p>
                All products and services are provided on an “as is” and “as available” basis, except where warranties or guarantees are expressly provided by us or required by applicable law.
              </p>
              <p>
                To the maximum extent permitted by applicable law, ZIMOR and its representatives shall not be liable for indirect, incidental, special or consequential damages arising from the use of our website or products.
              </p>
              <p>
                Nothing in these Terms shall exclude or limit any rights or remedies available to consumers under applicable Indian laws.
              </p>
            </div>
          </div>

          {/* INDEMNIFICATION */}
          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              INDEMNIFICATION
            </h2>
            <p>
              You agree to indemnify and hold harmless ZIMOR, its affiliates, employees, partners, service providers and representatives from claims, losses, liabilities and expenses arising from your violation of these Terms, applicable laws or the rights of any third party, to the extent permitted by applicable law.
            </p>
          </div>

          {/* SEVERABILITY */}
          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              SEVERABILITY
            </h2>
            <div className="space-y-3">
              <p>
                If any provision of these Terms is found to be unlawful, invalid or unenforceable, that provision shall be enforced to the maximum extent permitted by law.
              </p>
              <p>
                The remaining provisions shall continue to remain valid and enforceable.
              </p>
            </div>
          </div>

          {/* TERMINATION */}
          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              TERMINATION
            </h2>
            <div className="space-y-3">
              <p>
                These Terms remain effective unless terminated by either you or us.
              </p>
              <p>
                You may stop using our website at any time.
              </p>
              <p>
                We reserve the right to suspend or terminate your access to our services if we reasonably believe that you have violated these Terms or applicable laws.
              </p>
              <p>
                Any obligations or liabilities arising before termination shall continue to apply where required.
              </p>
            </div>
          </div>

          {/* ENTIRE AGREEMENT */}
          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              ENTIRE AGREEMENT
            </h2>
            <div className="space-y-3">
              <p>
                These Terms, together with our Privacy Policy, Refund and Return Policy, Shipping Policy and other policies published on our website, constitute the entire agreement between you and ZIMOR regarding your use of our website and services.
              </p>
              <p>
                Any failure by us to exercise or enforce any right under these Terms shall not constitute a waiver of that right.
              </p>
            </div>
          </div>

          {/* GOVERNING LAW */}
          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              GOVERNING LAW
            </h2>
            <div className="space-y-3">
              <p>
                These Terms of Service and any separate agreements through which we provide services shall be governed by and interpreted in accordance with the laws of India.
              </p>
              <p>
                Any disputes arising in connection with these Terms shall be subject to the jurisdiction of competent courts in India, subject to applicable consumer protection laws.
              </p>
            </div>
          </div>

          {/* CHANGES TO TERMS OF SERVICE */}
          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              CHANGES TO TERMS OF SERVICE
            </h2>
            <div className="space-y-3">
              <p>
                You can review the latest version of our Terms of Service at any time on this page.
              </p>
              <p>
                ZIMOR reserves the right to update, modify or replace any part of these Terms by publishing changes on our website.
              </p>
              <p>
                It is your responsibility to review this page periodically.
              </p>
              <p>
                Your continued use of our website or services after any changes have been published constitutes acceptance of the revised Terms.
              </p>
            </div>
          </div>

          {/* CONTACT INFORMATION */}
          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              CONTACT INFORMATION
            </h2>
            <p className="mb-3">
              If you have any questions regarding these Terms of Service, please contact us through the contact details provided on our website.
            </p>
            <div className="bg-[#FAF8F5] p-5 rounded border border-line/80 space-y-1.5 text-xs sm:text-[13.5px]">
              <p><strong className="text-black font-medium">Brand:</strong> ZIMOR</p>
            </div>
          </div>
        </article>

        {/* Footer Navigation Pill Strip */}
        <div className="pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/privacy-policy"
              className="inline-flex items-center gap-1.5 text-black hover:text-[#B44220] font-medium transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Read Privacy Policy</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex items-center gap-4 text-ink-muted">
            <Link href="/policy" className="hover:text-black transition-colors">
              Customer Care Policies
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-black transition-colors">
              Contact Concierge
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
