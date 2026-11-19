'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { EXACT_PRIVACY_POLICY_TEXT } from '@/data/legalPolicies';

export default function PrivacyPolicyPage() {
  const [content, setContent] = useState<string>(EXACT_PRIVACY_POLICY_TEXT);

  useEffect(() => {
    let isMounted = true;
    apiFetch('/api/content/privacy-policy')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch policy from database');
        return res.json();
      })
      .then((json) => {
        if (isMounted && json.content?.data?.markdown) {
          setContent(json.content.data.markdown);
        }
      })
      .catch((err) => {
        console.warn('[Privacy Policy] Using authentic built-in legal archive:', err);
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
          <span className="text-ink font-semibold">Privacy Policy</span>
        </nav>

        {/* Header Masthead */}
        <div className="space-y-3 pb-6 border-b border-line">
          <h1 className="font-primary text-3xl sm:text-5xl font-normal text-black tracking-tight leading-[1.12]">
            Privacy Policy
          </h1>

          <p className="text-xs sm:text-sm text-[#777777] font-medium">
            Last Updated: 17 November 2026
          </p>

          <p className="font-secondary text-xs sm:text-sm text-[#555555] leading-relaxed max-w-2xl">
            This Privacy Policy explains how ZIMOR collects, uses, stores and discloses your personal information when you visit our website, browse our products, or interact with our atelier services.
          </p>
        </div>

        {/* Legal Document Render */}
        <article className="prose prose-neutral max-w-none font-secondary text-[#222222] text-xs sm:text-[14px] leading-[1.8] space-y-6">
          <div className="bg-[#FAF8F5] p-5 sm:p-6 rounded border border-line/60 text-[#333333] space-y-3">
            <p className="font-medium text-black">
              At ZIMOR, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store and disclose your personal information when you visit our website, browse our products, place an order, contact us or otherwise interact with our services.
            </p>
            <p className="text-xs sm:text-[13px] text-[#555555]">
              By accessing or using the ZIMOR website and services, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </div>

          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              PERSONAL INFORMATION
            </h2>
            <p className="mb-3">
              For the purposes of this Privacy Policy, &quot;Personal Information&quot; means information that identifies you or can reasonably be used to identify you as an individual.
            </p>
            <p className="mb-2 font-medium text-black">This may include:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#333333]">
              <li>Full name</li>
              <li>Billing and shipping address</li>
              <li>Mobile number and telephone number</li>
              <li>Email address</li>
              <li>Payment and transaction details</li>
              <li>Order history and purchase preferences</li>
              <li>Social media account information, where applicable</li>
              <li>Any other information voluntarily provided by you.</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              HOW WE COLLECT PERSONAL INFORMATION
            </h2>
            <p className="mb-3">ZIMOR may collect personal information in the following ways:</p>
            <div className="space-y-2.5">
              <p>
                <strong className="text-black font-medium">Through Our Website:</strong> When you create an account, place an order, subscribe to our newsletter, contact customer support or interact with our website.
              </p>
              <p>
                <strong className="text-black font-medium">Through Direct Communication:</strong> When you contact us through email, telephone, WhatsApp, social media or other communication channels.
              </p>
              <p>
                <strong className="text-black font-medium">From Third Parties:</strong> We may receive relevant information from payment providers, delivery partners, advertising partners, social media platforms and other service providers.
              </p>
              <p>
                <strong className="text-black font-medium">Through Transactions:</strong> When you purchase products from ZIMOR, certain information is required to process payments, confirm orders and deliver your purchases.
              </p>
              <p className="text-[#555555] text-xs sm:text-[13px]">
                Payment information may be processed directly by third-party payment service providers and will be subject to their respective privacy policies.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              HOW WE USE YOUR PERSONAL INFORMATION
            </h2>
            <p className="mb-2">We may use your personal information for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#333333]">
              <li>To process, confirm and deliver your orders.</li>
              <li>To provide order updates, shipping notifications and customer support.</li>
              <li>To respond to your questions, requests and complaints.</li>
              <li>To process returns, exchanges and refunds.</li>
              <li>To send order-related and administrative communications.</li>
              <li>To share updates about new collections, launches, offers and promotions, where permitted.</li>
              <li>To personalize your shopping experience.</li>
              <li>To improve our website, products and customer experience.</li>
              <li>To prevent fraudulent transactions and maintain website security.</li>
              <li>To comply with applicable laws and regulations.</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              DISCLOSURE OF PERSONAL INFORMATION
            </h2>
            <p className="mb-2">ZIMOR does not sell your personal information.</p>
            <p className="mb-3">
              However, we may share relevant information with trusted third parties when necessary to operate our business and provide our services, including:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#333333]">
              <li><strong className="text-black font-medium">Payment Providers:</strong> To securely process transactions.</li>
              <li><strong className="text-black font-medium">Delivery Partners:</strong> To ship and deliver your purchases.</li>
              <li><strong className="text-black font-medium">Technology Providers:</strong> To maintain our website, hosting, security and technical infrastructure.</li>
              <li><strong className="text-black font-medium">Marketing Partners:</strong> To manage advertising, promotional campaigns and customer communications, subject to applicable laws and your preferences.</li>
              <li><strong className="text-black font-medium">Customer Support Providers:</strong> To help manage customer enquiries and service requests.</li>
              <li><strong className="text-black font-medium">Legal Authorities:</strong> When disclosure is required by law or necessary to protect our legal rights.</li>
            </ul>
            <p className="mt-3 text-[#555555] text-xs sm:text-[13px]">
              These third parties are expected to handle your information responsibly and in accordance with applicable privacy requirements.
            </p>
          </div>

          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              COOKIES AND TRACKING TECHNOLOGIES
            </h2>
            <p className="mb-2">
              Our website may use cookies, pixels and similar technologies to improve your browsing and shopping experience.
            </p>
            <p className="mb-2 font-medium text-black">Cookies may help us:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#333333]">
              <li>Remember your shopping cart and preferences.</li>
              <li>Understand how visitors use our website.</li>
              <li>Improve website functionality and performance.</li>
              <li>Provide personalized product recommendations.</li>
              <li>Measure advertising and marketing effectiveness.</li>
              <li>Improve our overall customer experience.</li>
            </ul>
            <p className="mt-3 text-[#555555] text-xs sm:text-[13px]">
              You can manage or disable cookies through your browser settings. Please note that disabling certain cookies may affect some website features and functionality.
            </p>
          </div>

          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              THIRD-PARTY SERVICES
            </h2>
            <p className="mb-2">
              Our website may contain links to third-party websites, payment gateways, social media platforms and other external services.
            </p>
            <p className="mb-2">
              ZIMOR is not responsible for the privacy practices, policies or content of these third-party services.
            </p>
            <p>
              We encourage you to review their respective privacy policies before sharing personal information with them.
            </p>
          </div>

          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              THIRD-PARTY ADVERTISING
            </h2>
            <p className="mb-2">
              We may work with third-party advertising and analytics providers to display relevant advertisements and understand customer interactions with our website.
            </p>
            <p className="mb-2">
              These providers may use cookies, pixels and similar technologies to collect information about browsing activity and interactions with advertisements.
            </p>
            <p>
              You may manage certain advertising preferences through your browser, device settings or the relevant advertising platforms.
            </p>
          </div>

          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              DATA SECURITY
            </h2>
            <p className="mb-2">
              ZIMOR takes reasonable technical, organizational and administrative measures to protect your personal information against unauthorized access, misuse, loss, alteration or disclosure.
            </p>
            <p>
              Although we make reasonable efforts to safeguard your information, no method of electronic transmission or storage is completely secure. Therefore, we cannot guarantee absolute security.
            </p>
          </div>

          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              YOUR PRIVACY RIGHTS AND CHOICES
            </h2>
            <p className="mb-2 font-medium text-black">You may have the right, subject to applicable laws, to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#333333]">
              <li>Request access to your personal information.</li>
              <li>Request correction of inaccurate or incomplete information.</li>
              <li>Request deletion of your personal information.</li>
              <li>Withdraw consent where processing is based on consent.</li>
              <li>Opt out of promotional emails and marketing communications.</li>
              <li>Raise concerns regarding the processing of your personal information.</li>
            </ul>
            <p className="mt-3">
              To stop receiving promotional emails, you may use the unsubscribe link provided in our marketing emails.
            </p>
            <p className="mt-2 text-[#555555] text-xs sm:text-[13px]">
              Please note that we may continue sending essential communications relating to your orders, transactions, account security and customer service.
            </p>
            <p className="mt-2">
              To exercise your privacy rights, please contact us using the details provided below.
            </p>
          </div>

          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              DATA RETENTION
            </h2>
            <p className="mb-2">
              We retain personal information only for as long as reasonably necessary to fulfil the purposes described in this Privacy Policy, including order processing, customer service, legal compliance, accounting and dispute resolution.
            </p>
            <p>
              When personal information is no longer required, we will take reasonable steps to securely delete or anonymize it, subject to applicable legal requirements.
            </p>
          </div>

          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              CHILDREN&apos;S PRIVACY
            </h2>
            <p className="mb-2">
              Our website and services are not intended for individuals under the age of 18.
            </p>
            <p className="mb-2">
              ZIMOR does not knowingly collect personal information from children under 18 without appropriate consent where required by applicable law.
            </p>
            <p>
              If we become aware that such information has been collected improperly, we will take reasonable steps to address the matter.
            </p>
          </div>

          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              INTERNATIONAL DATA TRANSFERS
            </h2>
            <p className="mb-2">
              Your personal information may be processed or stored by our service providers in locations outside your state or country of residence.
            </p>
            <p>
              Where such transfers occur, ZIMOR will take reasonable steps to ensure that your personal information receives appropriate protection in accordance with applicable data protection laws.
            </p>
          </div>

          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              SENSITIVE PERSONAL INFORMATION
            </h2>
            <p>
              We request that you do not share sensitive personal information, such as financial account passwords, government identification details, health information or other highly sensitive data, through our website or communication channels unless specifically required for a legitimate purpose and through an appropriate secure process.
            </p>
          </div>

          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              UPDATES TO THIS PRIVACY POLICY
            </h2>
            <p className="mb-2">
              ZIMOR reserves the right to modify or update this Privacy Policy from time to time to reflect changes in our business practices, website functionality or applicable laws.
            </p>
            <p className="mb-2">
              Any updates will be published on this page along with the revised &quot;Last Updated&quot; date.
            </p>
            <p>
              We encourage you to review this page periodically to stay informed about how we protect your information.
            </p>
          </div>

          <div className="pt-4 border-t border-line/60">
            <h2 className="font-primary text-lg sm:text-xl font-medium text-black tracking-tight mb-2">
              CONTACT US
            </h2>
            <p className="mb-3">
              If you have any questions, concerns or requests regarding this Privacy Policy or the handling of your personal information, please contact us:
            </p>
            <div className="bg-[#FAF8F5] p-5 rounded border border-line/80 space-y-1.5 text-xs sm:text-[13.5px]">
              <p><strong className="text-black font-medium">Brand:</strong> ZIMOR</p>
              <p><strong className="text-black font-medium">Email:</strong> [Your official customer support email]</p>
              <p><strong className="text-black font-medium">Phone:</strong> [Your official contact number]</p>
              <p><strong className="text-black font-medium">Business Address:</strong> [Your registered business address]</p>
              <p><strong className="text-black font-medium">Privacy Contact:</strong> ZIMOR Customer Support</p>
            </div>
            <p className="mt-3 text-xs text-[#555555]">
              We will make reasonable efforts to respond to your requests within the timeframes required by applicable law.
            </p>
          </div>

          {/* Closing Gratitude */}
          <div className="pt-8 border-t border-line/80 text-center space-y-2">
            <p className="font-primary text-base sm:text-lg text-black font-medium">
              Thank you for trusting ZIMOR.
            </p>
            <p className="text-xs sm:text-sm text-[#555555] max-w-md mx-auto">
              Your privacy matters to us, and we are committed to providing you with a safe and secure shopping experience.
            </p>
          </div>
        </article>

        {/* Footer Navigation Pill Strip */}
        <div className="pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/terms-of-service"
              className="inline-flex items-center gap-1.5 text-black hover:text-[#B44220] font-medium transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Read Terms of Service</span>
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
