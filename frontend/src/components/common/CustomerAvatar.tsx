'use client';

import React, { useState, useEffect, useMemo } from 'react';

export interface CustomerAvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  alt?: string;
}

/**
 * Extracts a clean 1-2 character uppercase initials representation
 * from customer name or email, falling back to 'ZU' (ZIMOR User).
 */
export function extractInitials(name?: string | null, email?: string | null): string {
  if (name && typeof name === 'string') {
    const trimmed = name.trim();
    if (trimmed) {
      const parts = trimmed.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        const first = parts[0][0] || '';
        const last = parts[parts.length - 1][0] || '';
        const initials = `${first}${last}`.toUpperCase();
        if (initials) return initials;
      } else if (parts.length === 1) {
        const single = parts[0].replace(/[^a-zA-Z0-9]/g, '');
        if (single.length >= 2) {
          return single.slice(0, 2).toUpperCase();
        } else if (single.length === 1) {
          return single.toUpperCase();
        }
      }
    }
  }

  if (email && typeof email === 'string') {
    const trimmed = email.trim();
    if (trimmed) {
      const local = trimmed.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      if (local.length >= 2) {
        return local.slice(0, 2).toUpperCase();
      } else if (local.length === 1) {
        return local.toUpperCase();
      }
    }
  }

  return 'ZU';
}

/**
 * Returns dimensions and typography classes based on requested size
 */
function getSizeStyles(size: 'sm' | 'md' | 'lg' | 'xl' | number = 'lg') {
  if (typeof size === 'number') {
    return {
      container: '',
      inlineStyle: { width: `${size}px`, height: `${size}px` },
      text: 'text-sm',
    };
  }

  switch (size) {
    case 'sm':
      return {
        container: 'w-8 h-8',
        text: 'text-[11px]',
      };
    case 'md':
      return {
        container: 'w-10 h-10',
        text: 'text-xs',
      };
    case 'xl':
      // 72px mobile / 80px desktop - for Profile Tab hero
      return {
        container: 'w-18 h-18 sm:w-20 sm:h-20',
        text: 'text-xl sm:text-2xl',
      };
    case 'lg':
    default:
      // 56px mobile / 64px desktop - for Account Header
      return {
        container: 'w-14 h-14 sm:w-16 sm:h-16',
        text: 'text-base sm:text-lg',
      };
  }
}

/**
 * Production-ready customer avatar component with:
 * - Google OAuth picture support (`referrerPolicy="no-referrer"` to prevent 403 Forbidden)
 * - Immediate, resilient fallback to ZIMOR brand circular initials on error, missing, or blocked image
 * - Zero layout shifts, zero broken image icons, zero broken alt text, zero infinite retries
 */
export const CustomerAvatar: React.FC<CustomerAvatarProps> = ({
  src,
  name,
  email,
  size = 'lg',
  className = '',
  alt,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const cleanSrc = useMemo(() => {
    if (!src || typeof src !== 'string') return '';
    const trimmed = src.trim();
    // Validate that it looks like an actual http(s) URL or absolute path
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
      return trimmed;
    }
    return '';
  }, [src]);

  // Reset error state if the src prop changes
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [cleanSrc]);

  const initials = useMemo(() => extractInitials(name, email), [name, email]);
  const sizeStyles = useMemo(() => getSizeStyles(size), [size]);

  const shouldRenderImage = Boolean(cleanSrc && !hasError);

  return (
    <div
      style={sizeStyles.inlineStyle}
      className={`relative rounded-full overflow-hidden bg-[#FAF8F5] border border-[#B4B4B4]/40 shrink-0 flex items-center justify-center select-none shadow-xs ${sizeStyles.container} ${className}`}
    >
      {/* Background Initials Fallback: always mounted so there is zero layout jump */}
      <span
        aria-hidden={shouldRenderImage && isLoaded}
        className={`font-primary font-medium text-[#1A1A1A] tracking-wider select-none ${sizeStyles.text}`}
      >
        {initials}
      </span>

      {/* Profile Image: only mounted when src is valid and no load error occurred */}
      {shouldRenderImage && (
        <img
          src={cleanSrc}
          alt={alt || name || 'Customer avatar'}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          loading="eager"
          decoding="async"
          onError={() => {
            // Unmount image immediately on error; never retry infinitely
            setHasError(true);
          }}
          onLoad={() => {
            setIsLoaded(true);
          }}
          className={`absolute inset-0 w-full h-full object-cover rounded-full transition-opacity duration-200 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};

export default CustomerAvatar;
