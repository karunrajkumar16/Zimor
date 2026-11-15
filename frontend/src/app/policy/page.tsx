'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Truck,
  RotateCcw,
  CreditCard,
  XCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Mail,
  HelpCircle,
  CheckCircle2,
  Clock,
  PackageCheck,
} from 'lucide-react';

interface PolicySection {
  id: string;
  title: string;
  quickHighlight: string;
  Component: React.ComponentType;
}

function PolicyIcon({ id, className }: { id: string; className?: string }) {
  switch (id) {
    case 'shipping':
      return <Truck className={className} />;
    case 'cancellation':
      return <XCircle className={className} />;
    case 'returns':
      return <RotateCcw className={className} />;
    case 'refund':
      return <CreditCard className={className} />;
    case 'warranty':
      return <ShieldCheck className={className} />;
    case 'care':
      return <Sparkles className={className} />;
    default:
      return null;
  }
}

// 1. Shipping & Delivery Policy Content
function ShippingPolicyContent() {
  return (
    <div className="space-y-4 pt-2">
      {/* Key Quick Facts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 py-1">
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            Processing Time
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            24–48 Hours
          </p>
        </div>
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            Delivery Timeline
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            3–7 Working Days
          </p>
        </div>
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            Order Tracking
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            Email &amp; WhatsApp
          </p>
        </div>
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            Support Channel
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            WhatsApp &amp; Email
          </p>
        </div>
      </div>

      {/* Introductory Narrative */}
      <div className="space-y-2 text-xs sm:text-[13.5px] text-zimor-brown leading-[1.65]">
        <p>
          At ZIMOR, we believe that every order deserves a seamless experience, right from the moment you place it to the moment it reaches your doorstep. We take care to ensure that your purchases are processed and delivered with attention and care.
        </p>
        <p className="font-medium text-zimor-black">
          Please review our shipping and delivery guidelines below:
        </p>
      </div>

      {/* Bullet Points */}
      <div className="space-y-3 text-xs sm:text-[13.5px] text-zimor-brown leading-[1.65]">
        <div>
          <h4 className="font-primary text-[13px] sm:text-[14.5px] font-medium text-zimor-black mb-0.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zimor-orange shrink-0" />
            <span>Order Processing</span>
          </h4>
          <p className="pl-5 text-zimor-brown/90">
            Orders are typically processed and dispatched within 24–48 hours of being placed.
          </p>
        </div>

        <div>
          <h4 className="font-primary text-[13px] sm:text-[14.5px] font-medium text-zimor-black mb-0.5 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-zimor-orange shrink-0" />
            <span>Delivery Timeline</span>
          </h4>
          <p className="pl-5 text-zimor-brown/90">
            Once dispatched, orders generally take 3–7 working days to reach you, depending on your delivery location.
          </p>
        </div>

        <div>
          <h4 className="font-primary text-[13px] sm:text-[14.5px] font-medium text-zimor-black mb-0.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zimor-orange shrink-0" />
            <span>Delivery Delays</span>
          </h4>
          <p className="pl-5 text-zimor-brown/90">
            While we strive to deliver within the estimated timeframe, unforeseen circumstances such as courier delays, weather conditions, operational issues or public holidays may occasionally affect delivery schedules.
          </p>
        </div>

        <div>
          <h4 className="font-primary text-[13px] sm:text-[14.5px] font-medium text-zimor-black mb-0.5 flex items-center gap-1.5">
            <PackageCheck className="w-3.5 h-3.5 text-zimor-orange shrink-0" />
            <span>Order Tracking</span>
          </h4>
          <p className="pl-5 text-zimor-brown/90">
            Once your order has been shipped, a tracking link will be shared with you via email or WhatsApp, allowing you to conveniently track your shipment.
          </p>
        </div>

        <div>
          <h4 className="font-primary text-[13px] sm:text-[14.5px] font-medium text-zimor-black mb-0.5 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-zimor-orange shrink-0" />
            <span>Need Assistance?</span>
          </h4>
          <p className="pl-5 text-zimor-brown/90">
            If you have any questions or concerns regarding your shipment, our team will be happy to assist you.
          </p>
        </div>
      </div>

      {/* Contact Details & Closing Statement */}
      <div className="bg-[#faf9f6] p-3.5 sm:p-4 border-l-2 border-zimor-orange rounded-r space-y-2 text-xs sm:text-[13px]">
        <p className="font-medium text-zimor-black">
          For shipping-related queries, please reach out to us:
        </p>
        <div className="space-y-1 text-zimor-brown">
          <p>
            <strong>Email:</strong>{' '}
            <a
              href="mailto:care@zimorindia.com"
              className="text-zimor-orange font-medium underline underline-offset-4 hover:text-black transition-colors"
            >
              care@zimorindia.com
            </a>
          </p>
          <p>
            <strong>WhatsApp:</strong>{' '}
            <a
              href="https://wa.me/918953696928"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zimor-orange font-medium underline underline-offset-4 hover:text-black transition-colors"
            >
              91 89536 96928
            </a>
          </p>
        </div>
        <p className="pt-1.5 text-zimor-brown/90 italic border-t border-line/40">
          Thank you for choosing ZIMOR. We appreciate your trust and look forward to delivering a little something special to you.
        </p>
      </div>
    </div>
  );
}

// 2. Cancellation Policy Content
function CancellationPolicyContent() {
  return (
    <div className="space-y-4 pt-2">
      {/* Key Quick Facts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 py-1">
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            Time Window
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            Within 24 Hours
          </p>
        </div>
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            Condition
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            Pre-Packing
          </p>
        </div>
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            Support Channels
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            Email &amp; WhatsApp
          </p>
        </div>
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            Refused Refund
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            5–7 Working Days
          </p>
        </div>
      </div>

      {/* Introductory Narrative */}
      <div className="space-y-2 text-xs sm:text-[13.5px] text-zimor-brown leading-[1.65]">
        <p>
          At ZIMOR, we understand that plans can change and you may occasionally need to cancel an order. To ensure a smooth and transparent shopping experience, we have outlined our cancellation policy below.
        </p>
      </div>

      {/* ORDER CANCELLATION */}
      <div className="space-y-1.5 text-xs sm:text-[13.5px] text-zimor-brown leading-[1.65]">
        <h4 className="font-primary text-[13px] sm:text-[14.5px] font-medium text-zimor-black flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-zimor-orange shrink-0" />
          <span>ORDER CANCELLATION</span>
        </h4>
        <ul className="pl-5 space-y-1 list-disc text-zimor-brown/90 text-xs sm:text-[13px]">
          <li>Orders that have been placed but have not yet been packed can be cancelled upon request.</li>
          <li>Cancellation requests must be raised within 24 hours of placing the order.</li>
          <li>Once an order has been packed or processed for dispatch, cancellation may no longer be possible.</li>
        </ul>
      </div>

      {/* HOW TO CANCEL */}
      <div className="bg-[#faf9f6] p-3.5 sm:p-4 border-l-2 border-zimor-orange rounded-r space-y-2 text-xs sm:text-[13px]">
        <h4 className="font-primary text-[13px] sm:text-[14px] font-semibold text-zimor-black uppercase tracking-wider flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-zimor-orange" />
          <span>HOW TO CANCEL</span>
        </h4>
        <p className="text-zimor-brown/90">
          To request an order cancellation, please contact our customer support team through the following channels:
        </p>
        <ul className="pl-5 space-y-1 list-disc text-zimor-brown">
          <li>
            <strong>Email:</strong>{' '}
            <a
              href="mailto:care@zimorindia.com"
              className="text-zimor-orange font-medium underline underline-offset-4 hover:text-black transition-colors"
            >
              care@zimorindia.com
            </a>
          </li>
          <li>
            <strong>WhatsApp:</strong>{' '}
            <a
              href="https://wa.me/918953696928"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zimor-orange font-medium underline underline-offset-4 hover:text-black transition-colors"
            >
              91 8953696928
            </a>
          </li>
        </ul>
        <p className="text-zimor-brown/90 pt-1">
          Please share your order ID and registered contact details to help us process your request promptly.
        </p>
      </div>

      {/* DISPATCHED ORDERS */}
      <div className="space-y-1.5 text-xs sm:text-[13.5px] text-zimor-brown leading-[1.65]">
        <h4 className="font-primary text-[13px] sm:text-[14.5px] font-medium text-zimor-black flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-zimor-orange shrink-0" />
          <span>DISPATCHED ORDERS</span>
        </h4>
        <ul className="pl-5 space-y-1 list-disc text-zimor-brown/90 text-xs sm:text-[13px]">
          <li>Once an order has been dispatched, cancellation is no longer possible.</li>
          <li>However, you may refuse to accept the delivery when the order arrives.</li>
          <li>Once the refused shipment is returned to us and received at our facility, the eligible refund will be processed within 5–7 working days, excluding weekends and bank holidays.</li>
          <li>For further information regarding refunds, please refer to our Refund Policy.</li>
        </ul>
      </div>

      {/* NEED HELP? */}
      <div className="p-3.5 sm:p-4 bg-[#faf9f6] border border-line/40 rounded space-y-1.5 text-xs sm:text-[13px]">
        <h4 className="font-primary text-[12.5px] sm:text-[13.5px] font-semibold text-zimor-black uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-zimor-orange" />
          <span>NEED HELP?</span>
        </h4>
        <p className="text-zimor-brown/90">
          For any further assistance or clarification regarding cancellations, please feel free to contact our customer support team through the channels mentioned above.
        </p>
        <p className="pt-1.5 text-zimor-brown/90 italic font-medium border-t border-line/40">
          Thank you for shopping with ZIMOR.
        </p>
      </div>
    </div>
  );
}

// 3. Return & Exchange Policy Content
function ReturnsPolicyContent() {
  return (
    <div className="space-y-4 pt-2">
      {/* Key Quick Facts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 py-1">
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            Notice Window
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            Within 24 Hours
          </p>
        </div>
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            Defect Proof
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            Photos Mandatory
          </p>
        </div>
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            Return Scope
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            Defects &amp; Damage
          </p>
        </div>
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            Exchange Shipping
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            Two-Way Customer Fee
          </p>
        </div>
      </div>

      {/* Introductory Narrative */}
      <div className="space-y-2 text-xs sm:text-[13.5px] text-zimor-brown leading-[1.65]">
        <p>
          At ZIMOR, we are committed to delivering every product in brand-new condition and ensuring a satisfying shopping experience. We encourage customers to review product descriptions, dimensions, colours, and specifications carefully before placing an order.
        </p>
      </div>

      {/* 1. Return Policy */}
      <div className="space-y-2.5 text-xs sm:text-[13.5px] text-zimor-brown leading-[1.65]">
        <h4 className="font-primary text-[13.5px] sm:text-[15px] font-semibold text-zimor-black flex items-center gap-1.5">
          <PackageCheck className="w-3.5 h-3.5 text-zimor-orange shrink-0" />
          <span>1. Return Policy</span>
        </h4>
        <p className="text-zimor-brown/90 pl-5">
          We follow a quality-first approach to ensure that every customer receives a product in excellent condition.
        </p>

        <div className="pl-5 space-y-2">
          <h5 className="font-primary text-xs font-semibold text-zimor-black uppercase tracking-wider">
            Damaged, Defective or Incorrect Products
          </h5>
          <p className="text-zimor-brown/90">
            If you receive a product that is damaged, defective, or different from the item ordered, please notify us within 24 hours of delivery.
          </p>
          <p className="text-zimor-brown/90 font-medium">
            To help us assess your concern, please share:
          </p>
          <ul className="pl-4 space-y-1 list-disc text-zimor-brown/90 text-xs sm:text-[13px]">
            <li>Clear photographs of the product showing the reported defect, damage, or discrepancy. Photographs are mandatory for claim verification.</li>
            <li>Your order number and registered contact details.</li>
            <li>A brief description of the issue.</li>
            <li>An unboxing video, if available (optional).</li>
          </ul>
          <div className="bg-[#faf9f6] p-3 border-l-2 border-zimor-orange rounded-r space-y-1 text-xs">
            <p>
              Please email these details to{' '}
              <a
                href="mailto:zimorindia@gmail.com"
                className="text-zimor-orange font-medium underline underline-offset-4 hover:text-black transition-colors"
              >
                zimorindia@gmail.com
              </a>{' '}
              within 24 hours of delivery.
            </p>
            <p className="text-zimor-brown/80 pt-1">
              Once the submitted details and photographs have been reviewed, our team will assess the issue and determine the appropriate resolution in accordance with our policy and applicable consumer protection laws.
            </p>
            <p className="text-zimor-brown/80">
              Customers are requested to retain the original packaging, tags, and accessories until the claim has been resolved.
            </p>
          </div>
        </div>

        <div className="pl-5 pt-1 space-y-1">
          <h5 className="font-primary text-xs font-semibold text-zimor-black uppercase tracking-wider">
            Return Eligibility
          </h5>
          <p className="text-zimor-brown/90">
            Returns are considered primarily in cases involving verified product defects, transit damage, or incorrect items supplied by ZIMOR. Each request is subject to inspection and verification.
          </p>
        </div>
      </div>

      {/* 2. Exchange Policy */}
      <div className="space-y-2.5 text-xs sm:text-[13.5px] text-zimor-brown leading-[1.65]">
        <h4 className="font-primary text-[13.5px] sm:text-[15px] font-semibold text-zimor-black flex items-center gap-1.5">
          <RotateCcw className="w-3.5 h-3.5 text-zimor-orange shrink-0" />
          <span>2. Exchange Policy</span>
        </h4>
        <p className="text-zimor-brown/90 pl-5">
          We understand that customers may occasionally wish to choose a different colour, size, or style after receiving their order.
        </p>
        <p className="text-zimor-brown/90 pl-5 font-medium">
          ZIMOR may consider exchange requests under the following conditions:
        </p>
        <ul className="pl-9 space-y-1 list-disc text-zimor-brown/90 text-xs sm:text-[13px]">
          <li>Exchange requests must be submitted within 24 hours of delivery.</li>
          <li>Exchanges are subject to product availability and approval by our team.</li>
          <li>The product must be unused, unwashed, undamaged, and in its original condition.</li>
          <li>Original packaging, tags, labels, and accessories must be intact.</li>
          <li>The product must not show signs of use, carrying, wear, or customer-caused damage.</li>
        </ul>

        <div className="pl-5 pt-1 space-y-2">
          <h5 className="font-primary text-xs font-semibold text-zimor-black uppercase tracking-wider">
            Customer-Requested Exchanges
          </h5>
          <p className="text-zimor-brown/90">
            If a customer wishes to exchange a product because of a colour preference, size selection, or style preference, the request will be treated as a customer-requested exchange.
          </p>
          <p className="text-zimor-brown/90">
            In such cases, the customer will be responsible for the shipping charges associated with both the return of the original product to our warehouse and the delivery of the replacement product.
          </p>
          <p className="text-zimor-brown/90 font-medium">
            All exchanges remain subject to product availability and approval.
          </p>
          <div className="bg-[#faf9f6] p-3 border-l-2 border-zimor-brown rounded-r space-y-1 text-xs">
            <span className="font-semibold text-zimor-black block uppercase tracking-wider text-[11px]">
              Example:
            </span>
            <p className="text-zimor-brown/90">
              If you purchase a tote bag designed to accommodate a 14-inch laptop but later require a bag suitable for a 16-inch laptop, the exchange will be treated as a customer-requested exchange, provided the original product meets the exchange eligibility conditions.
            </p>
            <p className="text-zimor-black font-medium pt-0.5">
              The applicable two-way shipping charges will be borne by the customer.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Product Selection & Important Information */}
      <div className="space-y-2 text-xs sm:text-[13.5px] text-zimor-brown leading-[1.65]">
        <h4 className="font-primary text-[13.5px] sm:text-[15px] font-semibold text-zimor-black flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-zimor-orange shrink-0" />
          <span>3. Product Selection &amp; Important Information</span>
        </h4>
        <p className="text-zimor-brown/90 pl-5">
          We provide product photographs, videos, descriptions, and specifications to help customers make informed purchasing decisions.
        </p>
        <p className="text-zimor-brown/90 pl-5 font-medium">
          Before placing an order, we recommend carefully checking:
        </p>
        <ul className="pl-9 space-y-1 list-disc text-zimor-brown/90 text-xs sm:text-[13px]">
          <li>Product dimensions and measurements.</li>
          <li>Laptop compatibility and compartment specifications.</li>
          <li>Colour and design details.</li>
          <li>Material and other product specifications.</li>
        </ul>
        <div className="pl-5 pt-1 space-y-1 text-zimor-brown/90">
          <p>
            Please note that slight variations in colour may occur due to screen resolution, device settings, and lighting conditions.
          </p>
          <p className="text-zimor-black font-medium">
            Selecting the correct product according to your requirements is the customer&apos;s responsibility.
          </p>
        </div>
      </div>
    </div>
  );
}

// 4. Refund Policy Content
function RefundPolicyContent() {
  return (
    <div className="space-y-4 pt-2">
      {/* Key Quick Facts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 py-1">
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            Initiation
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            48–72 Hours
          </p>
        </div>
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            Processing Time
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            5–7 Working Days
          </p>
        </div>
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            Prepaid Refund
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            Original Payment Source
          </p>
        </div>
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            COD Refund
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            Secure UPI / Bank Link
          </p>
        </div>
      </div>

      {/* Introductory Narrative */}
      <div className="space-y-2 text-xs sm:text-[13.5px] text-zimor-brown leading-[1.65]">
        <p>
          At ZIMOR, your satisfaction means everything to us. Every piece is thoughtfully designed and carefully crafted with love, attention, and detail. We want you to feel just as happy with your purchase as we do creating it.
        </p>
        <p>
          However, if your purchase doesn&apos;t quite meet your expectations, we&apos;re happy to assist you with a refund, subject to our return conditions.
        </p>
      </div>

      {/* REFUND PROCESS */}
      <div className="space-y-1.5 text-xs sm:text-[13.5px] text-zimor-brown leading-[1.65]">
        <h4 className="font-primary text-[13px] sm:text-[14.5px] font-medium text-zimor-black flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-zimor-orange shrink-0" />
          <span>REFUND PROCESS</span>
        </h4>
        <ul className="pl-5 space-y-1 list-disc text-zimor-brown/90 text-xs sm:text-[13px]">
          <li>Refund requests must be raised within the applicable return period from the date of delivery.</li>
          <li>Once your return request is approved, our team will arrange a pickup or guide you through the return process.</li>
          <li>Refunds will be initiated within 48–72 hours after the returned product has been successfully received and passed our quality inspection.</li>
          <li>Please return the product in its original packaging, including all tags, accessories, dust bags, and boxes.</li>
        </ul>
        <p className="pl-5 pt-1 text-zimor-black font-medium text-xs sm:text-[13px]">
          You will be notified via email or WhatsApp once your refund has been initiated.
        </p>
      </div>

      {/* REFUND TIMELINES */}
      <div className="space-y-2 text-xs sm:text-[13.5px] text-zimor-brown leading-[1.65]">
        <h4 className="font-primary text-[13px] sm:text-[14.5px] font-medium text-zimor-black flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-zimor-orange shrink-0" />
          <span>REFUND TIMELINES</span>
        </h4>
        <div className="pl-5 space-y-2">
          <div className="bg-[#faf9f6] p-3 border-l-2 border-zimor-orange rounded-r space-y-1 text-xs">
            <h5 className="font-primary font-semibold text-zimor-black uppercase tracking-wider text-[11.5px]">
              For Prepaid Orders (Credit/Debit Cards, UPI &amp; Net Banking)
            </h5>
            <ul className="space-y-0.5 list-disc pl-4 text-zimor-brown/90">
              <li>Refunds will be credited to your original payment method.</li>
              <li>Processing time: 5–7 working days, excluding weekends and bank holidays.</li>
            </ul>
          </div>

          <div className="bg-[#faf9f6] p-3 border-l-2 border-zimor-brown rounded-r space-y-1 text-xs">
            <h5 className="font-primary font-semibold text-zimor-black uppercase tracking-wider text-[11.5px]">
              For Cash on Delivery (COD) Orders
            </h5>
            <ul className="space-y-0.5 list-disc pl-4 text-zimor-brown/90">
              <li>You will receive a secure refund link via WhatsApp or email.</li>
              <li>You can choose to receive your refund through UPI or bank transfer by submitting the required details.</li>
              <li>Processing time: 5–7 working days after submitting your details.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* IMPORTANT NOTES */}
      <div className="bg-[#faf9f6] p-3.5 sm:p-4 border-l-2 border-zimor-orange rounded-r space-y-1.5 text-xs sm:text-[13px]">
        <h4 className="font-primary text-[12.5px] sm:text-[13.5px] font-semibold text-zimor-black uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-zimor-orange" />
          <span>IMPORTANT NOTES</span>
        </h4>
        <ul className="pl-5 space-y-1 list-disc text-zimor-brown/90 text-xs sm:text-[13px]">
          <li>Refunds will only be processed once the returned product passes our quality inspection.</li>
          <li>Products must be unused, unworn, undamaged, and returned in their original packaging.</li>
          <li>All original tags, accessories, dust bags, and boxes must be included.</li>
          <li>Products showing signs of use, damage, or alteration may not qualify for a refund.</li>
          <li>Please ensure your bank or UPI details are entered correctly to avoid refund delays.</li>
        </ul>
      </div>
    </div>
  );
}

// 5. Warranty Policy Content
function WarrantyPolicyContent() {
  return (
    <div className="space-y-4 pt-2">
      {/* Key Quick Facts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 py-1">
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            Warranty Term
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            6 Months
          </p>
        </div>
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            Coverage
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            Hardware Components
          </p>
        </div>
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            Start Date
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            Date of Purchase
          </p>
        </div>
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            Resolution
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            Repair or Replace
          </p>
        </div>
      </div>

      {/* Introductory Narrative & Scope */}
      <div className="space-y-2 text-xs sm:text-[13.5px] text-zimor-brown leading-[1.65]">
        <p>
          At Zimor, we believe that every detail matters. We want you to cherish your Zimor bag for a long time. That is why we offer a 6-month warranty on hardware components against manufacturing defects, starting from the date of purchase.
        </p>
        <div className="p-3 bg-[#faf9f6] border-l-2 border-zimor-orange rounded-r">
          <h4 className="font-primary text-xs font-semibold text-zimor-black uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-zimor-orange" />
            <span>Covered Hardware Elements</span>
          </h4>
          <p className="text-zimor-brown/90 text-xs sm:text-[13px]">
            This warranty covers hardware elements such as zippers, clasps, buckles, locks, hooks, rings and other metallic fittings attached to the bag.
          </p>
        </div>
      </div>

      {/* Conditions & Exclusions */}
      <div className="space-y-2 text-xs sm:text-[13.5px] text-zimor-brown leading-[1.65]">
        <h4 className="font-primary text-[13px] sm:text-[14.5px] font-medium text-zimor-black flex items-center gap-1.5">
          <XCircle className="w-3.5 h-3.5 text-zimor-brown shrink-0" />
          <span>CONDITIONS &amp; EXCLUSIONS</span>
        </h4>
        <p className="text-zimor-brown/90 pl-5">
          The warranty will not be applicable in the following cases:
        </p>
        <ul className="pl-5 space-y-1.5 list-disc text-zimor-brown/90 text-xs sm:text-[13px]">
          <li>Normal wear and tear resulting from regular usage.</li>
          <li>Damage caused by mishandling, negligence or improper use.</li>
          <li>Damage resulting from accidental drops, impacts or excessive force.</li>
          <li>Damage caused by unauthorised repairs or servicing by external parties.</li>
          <li>Damage caused by contact with fire, excessive heat or hot surfaces.</li>
          <li>Damage caused by exposure to chemicals, solvents, sanitizers, perfumes or moisture.</li>
          <li>Scratches, dents, tarnishing or plating deterioration resulting from regular use, friction or impact.</li>
          <li>Damage caused by improper storage or failure to follow care instructions.</li>
          <li>Any intentional damage or damage resulting from misuse of the product.</li>
          <li>Issues related to the bag&apos;s fabric, lining, stitching, shape or other non-hardware components, as these are not covered under this hardware warranty.</li>
        </ul>
      </div>

      {/* How to Claim Your Warranty & Inspection Notice */}
      <div className="bg-[#faf9f6] p-3.5 sm:p-4 border-l-2 border-zimor-orange rounded-r space-y-2 text-xs sm:text-[13px]">
        <h4 className="font-primary text-[13px] sm:text-[14px] font-semibold text-zimor-black uppercase tracking-wider flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-zimor-orange" />
          <span>HOW TO CLAIM YOUR WARRANTY</span>
        </h4>
        <p className="text-zimor-brown/90">
          To claim your warranty, please contact our customer support team with your proof of purchase and clear photographs or videos showing the issue. Our team will review your claim and guide you through the process.
        </p>
        <p className="text-zimor-brown/90 pt-1 border-t border-line/40">
          <strong>Please note:</strong> All warranty claims are subject to inspection and approval by Zimor. Depending on the nature of the defect, the affected hardware component may be repaired or replaced at the discretion of Zimor.
        </p>
        <p className="pt-1.5 text-zimor-brown/90 italic font-medium">
          We are committed to making your Zimor experience a lasting one.
        </p>
      </div>
    </div>
  );
}

// 6. Bag Care Guide Content
function CarePolicyContent() {
  return (
    <div className="space-y-4 pt-2">
      {/* Key Quick Facts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 py-1">
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            Hardware
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            Soft, Dry Cloth
          </p>
        </div>
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            Faux Leather
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            Soft, Damp Cloth
          </p>
        </div>
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            Protection
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            Avoid Harsh Chemicals
          </p>
        </div>
        <div className="bg-[#faf9f6] p-2.5 sm:p-3 rounded border border-line/40">
          <span className="text-[10px] uppercase tracking-wider text-zimor-orange font-primary font-medium block mb-0.5">
            Interior
          </span>
          <p className="font-primary text-xs sm:text-[13px] font-medium text-zimor-black">
            Pouches &amp; Immediate Care
          </p>
        </div>
      </div>

      {/* Introductory Tagline */}
      <div className="space-y-1 text-xs sm:text-[13.5px] text-zimor-brown leading-[1.65]">
        <p className="italic font-medium text-zimor-black">
          A little care goes a long way.
        </p>
      </div>

      {/* 01. HARDWARE CARE */}
      <div className="space-y-2 text-xs sm:text-[13.5px] text-zimor-brown leading-[1.65]">
        <h4 className="font-primary text-[13px] sm:text-[14.5px] font-medium text-zimor-black flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-zimor-orange shrink-0" />
          <span>01. HARDWARE CARE</span>
        </h4>
        <ul className="pl-5 space-y-1.5 list-disc text-zimor-brown/90 text-xs sm:text-[13px]">
          <li>Wipe metal hardware gently with a soft, dry cloth.</li>
          <li>Avoid harsh chemicals and abrasive materials.</li>
          <li>Keep buckles and metal fittings dry to maintain their finish.</li>
        </ul>
      </div>

      {/* 02. FAUX LEATHER CARE */}
      <div className="space-y-2 text-xs sm:text-[13.5px] text-zimor-brown leading-[1.65]">
        <h4 className="font-primary text-[13px] sm:text-[14.5px] font-medium text-zimor-black flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-zimor-orange shrink-0" />
          <span>02. FAUX LEATHER CARE</span>
        </h4>
        <ul className="pl-5 space-y-1.5 list-disc text-zimor-brown/90 text-xs sm:text-[13px]">
          <li>Clean gently with a soft, slightly damp cloth.</li>
          <li>Avoid direct sunlight and excessive heat.</li>
          <li>Do not use alcohol-based cleaners or harsh chemicals.</li>
        </ul>
      </div>

      {/* 03. BAG INTERIOR CARE */}
      <div className="space-y-2 text-xs sm:text-[13.5px] text-zimor-brown leading-[1.65]">
        <h4 className="font-primary text-[13px] sm:text-[14.5px] font-medium text-zimor-black flex items-center gap-1.5">
          <PackageCheck className="w-3.5 h-3.5 text-zimor-orange shrink-0" />
          <span>03. BAG INTERIOR CARE</span>
        </h4>
        <ul className="pl-5 space-y-1.5 list-disc text-zimor-brown/90 text-xs sm:text-[13px]">
          <li>Keep the inside of your bag clean and organised.</li>
          <li>Clean spills immediately with a soft cloth.</li>
          <li>Use small pouches for cosmetics and other essentials.</li>
          <li>Avoid carrying sharp or excessively heavy objects.</li>
        </ul>
      </div>
    </div>
  );
}

const POLICIES: PolicySection[] = [
  {
    id: 'shipping',
    title: 'Shipping & Delivery Policy',
    quickHighlight: 'Dispatched in 24–48 Hours · 3–7 Working Days Delivery',
    Component: ShippingPolicyContent,
  },
  {
    id: 'cancellation',
    title: 'Cancellation Policy',
    quickHighlight: 'Cancel Within 24 Hours (Pre-Packed) · Easy Refusal at Doorstep',
    Component: CancellationPolicyContent,
  },
  {
    id: 'returns',
    title: 'Return & Exchange Policy',
    quickHighlight: 'Notify Within 24h · Verified Defects & Approved Exchanges',
    Component: ReturnsPolicyContent,
  },
  {
    id: 'refund',
    title: 'Refund Policy',
    quickHighlight: 'Initiated in 48–72h Post-Inspection · 5–7 Working Days Payout',
    Component: RefundPolicyContent,
  },
  {
    id: 'warranty',
    title: 'Warranty Policy',
    quickHighlight: '6-Month Hardware Warranty Against Manufacturing Defects',
    Component: WarrantyPolicyContent,
  },
  {
    id: 'care',
    title: 'Bag Care Guide',
    quickHighlight: 'A Little Care Goes a Long Way · Hardware, Faux Leather & Interior',
    Component: CarePolicyContent,
  },
];

const POLICY_ALIASES: Record<string, string> = {
  refunds: 'refund',
  return: 'returns',
  cancellations: 'cancellation',
  warranties: 'warranty',
  'bag-care': 'care',
  bagcare: 'care',
  'shipping-delivery': 'shipping',
};

export default function PolicyPage() {
  // Allow toggling each policy independently. Default open: Shipping & Delivery.
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    shipping: true,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Automatically expand and scroll to policy section when arriving with URL hash (e.g. from FAQ #refund)
  useEffect(() => {
    const handleHashNavigation = () => {
      if (typeof window === 'undefined') return;

      const rawHash = window.location.hash.replace(/^#/, '').toLowerCase().trim();
      const params = new URLSearchParams(window.location.search);
      const rawSection = (params.get('section') || '').toLowerCase().trim();

      const candidate = rawHash || rawSection;
      if (!candidate) return;

      // Resolve direct match or alias (e.g. #refunds -> refund)
      const targetId = POLICY_ALIASES[candidate] || candidate;
      const validPolicy = POLICIES.find((p) => p.id === targetId);

      if (validPolicy) {
        // Expand the target policy section automatically
        setOpenSections((prev) => ({
          ...prev,
          [validPolicy.id]: true,
        }));

        // Smooth scroll to the target policy element
        const timer = setTimeout(() => {
          const el = document.getElementById(validPolicy.id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 120);

        return () => clearTimeout(timer);
      }
    };

    handleHashNavigation();

    window.addEventListener('hashchange', handleHashNavigation);
    window.addEventListener('popstate', handleHashNavigation);

    return () => {
      window.removeEventListener('hashchange', handleHashNavigation);
      window.removeEventListener('popstate', handleHashNavigation);
    };
  }, []);

  return (
    <div className="bg-white min-h-screen py-6 sm:py-12 border-b border-line/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        {/* Breadcrumb Navigation */}
        <nav
          className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-ink-muted flex items-center gap-2 font-secondary"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-ink transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-ink font-semibold">Policy</span>
        </nav>

        {/* Header Masthead */}
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <h1 className="font-primary text-2xl sm:text-4xl lg:text-5xl font-normal text-zimor-black tracking-tight leading-[1.12]">
            Zimor Policies &amp; Care
          </h1>
          <p className="font-secondary text-xs sm:text-sm text-zimor-brown leading-relaxed max-w-xl mx-auto">
            Essential guidelines governing shipping across India, cancellations, 7-day returns, warranty protection, and product care.
          </p>
        </div>

        {/* Six Policies Accordion Container */}
        <div className="border-t border-line/70 divide-y divide-line/70" role="region" aria-label="Policy Accordions">
          {POLICIES.map((policy) => {
            const isOpen = !!openSections[policy.id];
            const PolicyContentComponent = policy.Component;

            return (
              <div
                key={policy.id}
                id={policy.id}
                className="group scroll-mt-24 transition-colors duration-200 hover:bg-[#faf9f6]/80 -mx-2 sm:-mx-4 px-2 sm:px-4"
              >
                {/* Accordion Header Button */}
                <button
                  type="button"
                  onClick={() => toggleSection(policy.id)}
                  aria-expanded={isOpen}
                  aria-controls={`policy-content-${policy.id}`}
                  className="w-full py-4 sm:py-5 flex items-center justify-between text-left gap-3 focus:outline-none focus-visible:ring-1 focus-visible:ring-zimor-orange"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-canvas-soft/30 flex items-center justify-center text-zimor-orange shrink-0">
                      <PolicyIcon id={policy.id} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-primary text-[15px] sm:text-[18px] lg:text-[20px] font-medium text-zimor-black tracking-tight group-hover:text-zimor-orange transition-colors truncate">
                        {policy.title}
                      </h2>
                      <span className="font-secondary text-[11px] text-zimor-orange font-medium block sm:hidden mt-0.5">
                        {policy.quickHighlight}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 ml-2">
                    <span className="font-secondary text-[11.5px] text-zimor-brown/80 hidden sm:inline-block">
                      {policy.quickHighlight}
                    </span>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-line/60 flex items-center justify-center text-zimor-brown/70 group-hover:border-zimor-orange group-hover:text-zimor-orange transition-colors">
                      <ChevronDown
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-zimor-orange' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </button>

                {/* Collapsible Content */}
                {isOpen && (
                  <div
                    id={`policy-content-${policy.id}`}
                    className="pt-1 pb-6 pl-6 sm:pl-14 pr-1 sm:pr-4 animate-in fade-in duration-200"
                  >
                    <PolicyContentComponent />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Concierge Assistance Footer Block */}
        <section
          className="p-5 sm:p-7 border border-line/60 bg-[#faf9f6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 rounded"
          aria-label="Client Services Support"
        >
          <div className="space-y-1 max-w-lg">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zimor-orange font-primary font-medium flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>NEED FURTHER CLARIFICATION?</span>
            </p>
            <h3 className="font-primary text-base sm:text-lg font-medium text-zimor-black">
              Our Concierge is Here to Help
            </h3>
            <p className="font-secondary text-xs sm:text-[13px] text-zimor-brown leading-relaxed">
              Have questions about your order, delivery timeline, or warranty assistance? Our team is available Mon–Sat, 9:30 AM – 6:00 PM IST.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-black text-white hover:bg-ink-secondary transition-colors font-primary text-xs font-medium uppercase tracking-[0.14em]"
            >
              <span>Contact Concierge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href="mailto:care@zimorindia.com"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-line text-zimor-black hover:border-black transition-colors font-primary text-xs font-medium uppercase tracking-[0.14em]"
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
