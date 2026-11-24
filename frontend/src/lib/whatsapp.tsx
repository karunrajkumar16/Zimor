'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useProducts } from '@/context/ProductContext';

/**
 * ZIMOR WhatsApp Click to Chat Configuration and Utilities
 */
export const DEFAULT_WHATSAPP_PHONE = '918604647888';
export const SUPPORT_WHATSAPP_PHONE = '918953696928';

export const DEFAULT_ENQUIRY_MESSAGE =
  'Hello ZIMOR Team, I’m interested in your products and would like to know more. Could you please assist me with my enquiry?';

export interface WhatsAppProductContext {
  name?: string;
  slug?: string;
  url?: string;
}

/**
 * Strips all non-digit characters to comply strictly with https://wa.me/PHONE_NUMBER format
 */
export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Builds the pre-written enquiry message.
 * If a product is provided, dynamically includes the product name and URL.
 */
export function buildWhatsAppMessage(
  product?: WhatsAppProductContext | null,
  customMessage?: string
): string {
  if (customMessage) {
    return customMessage;
  }

  if (product && product.name) {
    let productUrl = product.url;
    if (!productUrl && product.slug) {
      if (typeof window !== 'undefined' && window.location?.origin) {
        productUrl = `${window.location.origin}/product/${product.slug}`;
      } else {
        productUrl = `https://www.zimorindia.com/product/${product.slug}`;
      }
    }

    if (productUrl) {
      return `Hello ZIMOR Team, I’m interested in the ${product.name} (${productUrl}) and would like to know more. Could you please assist me with my enquiry?`;
    }
    return `Hello ZIMOR Team, I’m interested in the ${product.name} and would like to know more. Could you please assist me with my enquiry?`;
  }

  return DEFAULT_ENQUIRY_MESSAGE;
}

/**
 * Constructs a valid WhatsApp Click to Chat URL:
 * https://wa.me/PHONE_NUMBER?text=ENCODED_MESSAGE
 */
export function getWhatsAppUrl({
  phone = DEFAULT_WHATSAPP_PHONE,
  product,
  message,
}: {
  phone?: string;
  product?: WhatsAppProductContext | null;
  message?: string;
} = {}): string {
  const cleanPhone = sanitizePhoneNumber(phone || DEFAULT_WHATSAPP_PHONE);
  const text = message || buildWhatsAppMessage(product);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * React hook that returns a context-aware WhatsApp enquiry URL.
 * Automatically detects if the current page is a product detail route (/product/[slug]),
 * and includes that product's name and URL in the pre-written message.
 */
export function useWhatsAppUrl(options?: {
  phone?: string;
  product?: WhatsAppProductContext | null;
  message?: string;
}): string {
  const pathname = usePathname();
  const productContext = useProducts();
  const phone = options?.phone || DEFAULT_WHATSAPP_PHONE;

  // If explicit product or message passed in options, use it
  if (options?.message) {
    return getWhatsAppUrl({ phone, message: options.message });
  }

  if (options?.product) {
    return getWhatsAppUrl({ phone, product: options.product });
  }

  // Otherwise, inspect current route to see if customer is viewing a product page
  if (pathname && pathname.startsWith('/product/')) {
    const slug = pathname.replace('/product/', '').split('/')[0]?.split('?')[0]?.split('#')[0];
    if (slug) {
      const foundProduct = productContext?.getProductBySlug?.(slug);
      const productName =
        foundProduct?.name ||
        slug
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

      const productUrl =
        typeof window !== 'undefined' && window.location?.href
          ? window.location.href
          : `https://www.zimorindia.com/product/${slug}`;

      return getWhatsAppUrl({
        phone,
        product: {
          name: productName,
          slug,
          url: productUrl,
        },
      });
    }
  }

  // Default fallback enquiry
  return getWhatsAppUrl({ phone });
}

/**
 * Reusable official WhatsApp SVG Icon
 */
export function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.585 1.77.896 2.79.896 3.183 0 5.769-2.587 5.769-5.766.001-3.182-2.585-5.782-5.769-5.782zm0 10.364c-.886 0-1.62-.247-2.316-.68l-.165-.103-1.724.452.46-1.68-.108-.172c-.477-.759-.729-1.503-.729-2.415 0-2.536 2.063-4.6 4.6-4.6 2.535 0 4.598 2.064 4.598 4.6 0 2.535-2.063 4.598-4.598 4.598zm2.52-3.447c-.138-.07-.817-.404-.944-.467-.127-.063-.22-.095-.314.047-.094.142-.363.467-.446.562-.083.094-.166.11-.304.047-.138-.07-.584-.215-1.113-.686-.411-.366-.688-.818-.769-.957-.08-.139-.009-.214.061-.283.063-.062.138-.162.207-.243.069-.082.092-.139.138-.232.046-.094.023-.176-.011-.247-.035-.07-.314-.757-.431-1.037-.114-.273-.23-.236-.316-.24l-.27-.005c-.094 0-.247.035-.376.176-.129.141-.493.482-.493 1.176 0 .694.505 1.364.576 1.458.07.094 1.002 1.53 2.427 2.146.339.147.604.234.81.3.34.108.65.093.895.056.273-.041.839-.343.957-.674.118-.331.118-.615.083-.674-.035-.059-.129-.094-.267-.164z" />
    </svg>
  );
}
