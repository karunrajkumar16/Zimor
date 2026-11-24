'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Star,
  CheckCircle,
  ChevronDown,
  Share2,
  Plus,
  Check,
} from 'lucide-react';
import { Product, CustomerReview } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useProducts } from '@/context/ProductContext';
import { apiFetch } from '@/lib/api';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductCard } from '@/components/product/ProductCard';
import { FAQAccordion } from '@/components/faq/FAQAccordion';
import ReviewModal from '@/components/product/ReviewModal';
import { getWhatsAppUrl, WhatsAppIcon } from '@/lib/whatsapp';

export function ProductDetailView({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const selectedSize = product.sizes[0];
  const quantity = 1;
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    love: true,
    dimensions: false,
    shipping: false,
    more: false,
    faq: false,
  });
  const [reviewsList, setReviewsList] = useState<CustomerReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<CustomerReview | null>(null);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showStickyBottomBar, setShowStickyBottomBar] = useState(false);

  useEffect(() => {
    let isMounted = true;
    apiFetch(`/api/reviews?slug=${encodeURIComponent(product.slug)}`)
      .then((res) => (res.ok ? res.json() : { reviews: [] }))
      .then((data) => {
        if (isMounted && Array.isArray(data.reviews)) {
          setReviewsList(data.reviews);
        }
      })
      .catch(() => { });
    return () => {
      isMounted = false;
    };
  }, [product.slug]);

  // Delivery pincode checker state
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  const buyBoxRef = useRef<HTMLDivElement | null>(null);

  const { products } = useProducts();
  const inWishlist = isInWishlist(product.id);
  const youMayAlsoLike = useMemo(
    () => products.filter((p) => p.slug !== product.slug && p.id !== product.id).slice(0, 3),
    [products, product]
  );
  const recentlyViewed = useMemo(
    () => products.filter((p) => p.slug !== product.slug && p.id !== product.id).slice(3, 6),
    [products, product]
  );

  const whatsappEnquiryUrl = useMemo(() => {
    const productUrl =
      typeof window !== 'undefined' && window.location?.href
        ? window.location.href
        : `https://www.zimorindia.com/product/${product.slug}`;
    return getWhatsAppUrl({
      product: {
        name: product.name,
        slug: product.slug,
        url: productUrl,
      },
    });
  }, [product.name, product.slug]);

  const discountPercent = Math.round(
    ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
  );

  // Monitor visibility of the primary CTA on mobile to trigger sticky bottom bar
  useEffect(() => {
    const target = buyBoxRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBottomBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const handleAddToCart = () => {
    addItem(product, quantity, selectedSize);
  };

  const handleBuyNow = () => {
    addItem(product, quantity, selectedSize);
    router.push('/checkout');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{6}$/.test(pincode.trim())) {
      setPincodeStatus('valid');
    } else {
      setPincodeStatus('invalid');
    }
  };

  const handleAddReview = async (newRev: Partial<CustomerReview>) => {
    try {
      const payload = {
        userName: newRev.userName || 'Verified User',
        userCity: newRev.userCity || 'India',
        rating: newRev.rating || 5,
        title: newRev.title || 'Exceptional Handbag',
        comment: newRev.comment || '',
        productSlug: product.slug,
        productName: product.name,
        media: newRev.media || [],
      };

      const res = await apiFetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.review) {
          setReviewsList((prev) => [data.review, ...prev]);
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to submit review to backend:', err);
    }
  };

  return (
    <div className="bg-white min-h-screen py-4 sm:py-8 pb-24 lg:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ============================================================ */}
        {/* Breadcrumb Navigation                                       */}
        {/* ============================================================ */}
        <nav className="text-[11px] text-ink-muted uppercase tracking-wider flex items-center gap-2 mb-4 sm:mb-6 overflow-x-auto scrollbar-none whitespace-nowrap">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-ink transition-colors">Shop Bags</Link>
          <span>/</span>
          <Link href={`/shop?category=${product.category}`} className="hover:text-ink transition-colors">
            {product.categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-ink font-medium truncate">{product.name}</span>
        </nav>

        {/* ============================================================ */}
        {/* Main Two-Column Layout (Clean, Borderless Benchmark)         */}
        {/* Left: 2-Column Multi-Image Grid                              */}
        {/* Right: Sticky Buy Box, Features & Line Accordions            */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start relative z-0">
          {/* Left Column: Seamless 2-Column Product Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} productName={product.name} isComingSoon={product.isComingSoon} />
          </div>

          {/* Right Column: Product Information & Accordions (Natural Crawl — Zero Clipping) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Header: Title, Rating & Pricing */}
            <div className="space-y-1.5 pb-2">
              <div className="flex items-center justify-between text-xs text-ink-muted">
                <span className="text-[11px] uppercase tracking-widest text-ink font-semibold font-primary">
                  {product.categoryLabel}
                </span>
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="flex items-center gap-0.5 text-ink">
                    <Star className="w-3.5 h-3.5 fill-black text-black" />
                    <span className="font-semibold text-ink">{product.averageRating.toFixed(1)}</span>
                  </div>
                  <a href="#reviews" className="text-ink-muted hover:text-ink transition-colors">
                    ({reviewsList.length} reviews)
                  </a>
                </div>
              </div>

              {/* Product Title */}
              <h1 className="font-primary text-2xl sm:text-3xl lg:text-[34px] font-normal text-ink tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Tagline / Subtitle */}
              <p className="text-xs sm:text-[13px] text-ink-secondary leading-relaxed">
                {product.tagline}
              </p>

              {/* Price & Savings */}
              <div className="flex items-baseline gap-2.5 pt-1.5">
                <span className="text-xl sm:text-2xl font-bold text-ink">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-ink-muted line-through">
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
                {product.isComingSoon ? (
                  <span className="text-xs font-semibold text-black uppercase tracking-wider">
                    (COMING SOON)
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-black">
                    ({discountPercent}% OFF)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-ink-muted">
                Inclusive of all taxes. Free express shipping across India.
              </p>
            </div>

            {/* Laptop Compatibility Callout (Clean borderless line) */}
            <div className="py-2.5 border-y border-line flex items-center gap-2 text-xs text-ink font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-black shrink-0" />
              <span>{product.laptopCompatibility}</span>
            </div>

            {/* Primary Action Row: Wishlist Heart + ADD TO CART / COMING SOON Button */}
            <div ref={buyBoxRef} className="pt-2 space-y-2.5">
              {product.isComingSoon ? (
                <>
                  <div className="flex items-center gap-2.5">
                    {/* Wishlist Button: Clean square border with heart */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      className={`w-12 h-12 shrink-0 border flex items-center justify-center transition-colors ${inWishlist
                        ? 'border-black text-black'
                        : 'border-line text-ink hover:border-black'
                        }`}
                      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart className={`w-5 h-5 ${inWishlist ? 'fill-black' : ''}`} />
                    </button>

                    <button
                      type="button"
                      disabled
                      className="flex-1 h-12 bg-[#b4b4b4]/20 text-ink-muted font-medium text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center cursor-not-allowed border border-line"
                    >
                      COMING SOON
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      toggleWishlist(product.id);
                    }}
                    className="w-full h-11 bg-black text-white hover:bg-neutral-800 font-medium text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center transition-colors"
                  >
                    {inWishlist ? 'Saved to Wishlist' : 'Notify Me When Available'}
                  </button>

                  <a
                    href={whatsappEnquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-11 border border-line hover:border-black bg-white hover:bg-[#25D366]/5 text-ink hover:text-[#25D366] font-medium text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-200"
                    aria-label={`Enquire about ${product.name} on WhatsApp`}
                  >
                    <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                    <span>Enquire on WhatsApp</span>
                  </a>

                  <div className="flex items-center justify-between text-xs text-ink-muted pt-1">
                    <span>Exclusive Silhouette</span>
                    <span className="text-black font-semibold">• Dropping Soon</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2.5">
                    {/* Wishlist Button: Clean square border with heart */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      className={`w-12 h-12 shrink-0 border flex items-center justify-center transition-colors ${inWishlist
                        ? 'border-black text-black'
                        : 'border-line text-ink hover:border-black'
                        }`}
                      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart className={`w-5 h-5 ${inWishlist ? 'fill-black' : ''}`} />
                    </button>

                    {/* Primary ADD TO CART Button: Full-width Solid Black */}
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="flex-1 h-12 bg-black hover:bg-neutral-800 text-white font-medium text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center transition-colors active:scale-[0.99]"
                    >
                      ADD TO CART
                    </button>
                  </div>

                  {/* Instant Buy Now Direct Button */}
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full h-11 bg-white border border-black hover:bg-neutral-100 text-black font-medium text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center transition-colors"
                  >
                    Instant Buy Now
                  </button>

                  {/* WhatsApp Enquiry Button */}
                  <a
                    href={whatsappEnquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-11 border border-line hover:border-black bg-white hover:bg-[#25D366]/5 text-ink hover:text-[#25D366] font-medium text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-200"
                    aria-label={`Enquire about ${product.name} on WhatsApp`}
                  >
                    <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                    <span>Enquire on WhatsApp</span>
                  </a>

                  <div className="flex items-center justify-between text-xs text-ink-muted pt-1">
                    <span>Quantity: {quantity}</span>
                    <span className="text-black font-semibold">• Only {product.stock} pieces left in stock</span>
                  </div>
                </>
              )}
            </div>

            {/* Delivery Details with Pincode Check (Benchmark Screenshot 1) */}
            <div className="pt-3 border-t border-line">
              <h3 className="text-xs sm:text-sm font-semibold text-ink mb-2 font-primary">
                Delivery Details
              </h3>
              <form onSubmit={handleCheckPincode} className="flex">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter your Pincode"
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value);
                    if (pincodeStatus !== 'idle') setPincodeStatus('idle');
                  }}
                  className="flex-1 border border-line px-3.5 py-2.5 text-xs sm:text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-black transition-colors"
                />
                <button
                  type="submit"
                  className="bg-black text-white text-xs font-bold tracking-wider px-5 sm:px-6 py-2.5 hover:bg-ink-secondary uppercase transition-colors"
                >
                  CHECK
                </button>
              </form>

              {pincodeStatus === 'valid' && (
                <p className="mt-2 text-xs text-emerald-700 flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  Free Express Delivery available in 2–4 business days
                </p>
              )}
              {pincodeStatus === 'invalid' && (
                <p className="mt-2 text-xs text-red-600">
                  Please enter a valid 6-digit Indian pincode.
                </p>
              )}
            </div>

            {/* Key Features (Benchmark Screenshot 1: Clean 2-Column Bullets) */}
            <div className="pt-3 border-t border-line">
              <h3 className="text-xs sm:text-sm font-semibold text-ink mb-2.5 font-primary">
                Key Features
              </h3>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-[13px] text-ink-secondary">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-ink mt-1.5 w-1 h-1 rounded-full bg-ink shrink-0" />
                    <span className="leading-snug">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Accordions (Benchmark Screenshot 1: Hairline Dividers, Zero Container Box) */}
            <div className="pt-2 border-t border-line">
              {/* Accordion 1: Why You'll Love It? */}
              <div className="border-b border-line">
                <button
                  type="button"
                  onClick={() => toggleAccordion('love')}
                  className="w-full py-4 flex items-center justify-between text-left text-xs sm:text-sm font-normal text-ink hover:text-ink-secondary transition-colors"
                >
                  <span className="font-medium">Why You'll Love It?</span>
                  <ChevronDown
                    className={`w-4 h-4 text-ink-muted transition-transform duration-200 ${openAccordions.love ? 'rotate-180' : ''
                      }`}
                  />
                </button>
                {openAccordions.love && (
                  <div className="pb-4 text-xs sm:text-[13px] text-ink-secondary leading-relaxed space-y-2">
                    <p>{product.whyYoullLoveIt || product.description}</p>
                    {product.suitableProfessions && product.suitableProfessions.length > 0 && (
                      <p className="font-medium text-ink pt-1">
                        Ideal for: {product.suitableProfessions.join(', ').replace(/-/g, ' ')}.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 2: Details & Dimensions */}
              <div className="border-b border-line">
                <button
                  type="button"
                  onClick={() => toggleAccordion('dimensions')}
                  className="w-full py-4 flex items-center justify-between text-left text-xs sm:text-sm font-normal text-ink hover:text-ink-secondary transition-colors"
                >
                  <span className="font-medium">Details & Dimensions</span>
                  <ChevronDown
                    className={`w-4 h-4 text-ink-muted transition-transform duration-200 ${openAccordions.dimensions ? 'rotate-180' : ''
                      }`}
                  />
                </button>
                {openAccordions.dimensions && (
                  <div className="pb-4 text-xs sm:text-[13px] text-ink-secondary leading-relaxed space-y-3">
                    <div>
                      <p className="font-medium text-ink mb-1.5 uppercase tracking-wider text-[11px]">
                        Measurements
                      </p>
                      <div className="space-y-1 text-xs sm:text-[13px]">
                        <div>
                          <span className="text-ink-muted">Length: </span>
                          <span className="font-medium text-ink">{product.dimensions.length}</span>
                        </div>
                        <div>
                          <span className="text-ink-muted">Height: </span>
                          <span className="font-medium text-ink">{product.dimensions.height}</span>
                        </div>
                        <div>
                          <span className="text-ink-muted">Width: </span>
                          <span className="font-medium text-ink">{product.dimensions.width}</span>
                        </div>
                        <div>
                          <span className="text-ink-muted">Shoulder Strap Drop Length: </span>
                          <span className="font-medium text-ink">{product.dimensions.strapDrop}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-line space-y-2">
                      <div>
                        <p className="font-medium text-ink uppercase tracking-wider text-[11px] mb-0.5">
                          Materials
                        </p>
                        <p className="text-xs sm:text-[13px] text-ink-secondary">
                          {Array.isArray(product.material) ? product.material.join(', ') : product.material}
                        </p>
                      </div>

                      <div>
                        <p className="font-medium text-ink uppercase tracking-wider text-[11px] mb-0.5">
                          Strap
                        </p>
                        <p className="text-xs sm:text-[13px] text-ink-secondary">
                          {product.strap || 'Shoulder Strap'}
                        </p>
                      </div>

                      <div>
                        <p className="font-medium text-ink uppercase tracking-wider text-[11px] mb-0.5">
                          Net Quantity
                        </p>
                        <p className="text-xs sm:text-[13px] text-ink-secondary">
                          {product.netQuantity || '1N Bag'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 3: Shipping & Returns */}
              <div className="border-b border-line">
                <button
                  type="button"
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full py-4 flex items-center justify-between text-left text-xs sm:text-sm font-normal text-ink hover:text-ink-secondary transition-colors"
                >
                  <span className="font-medium">Shipping & Returns</span>
                  <ChevronDown
                    className={`w-4 h-4 text-ink-muted transition-transform duration-200 ${openAccordions.shipping ? 'rotate-180' : ''
                      }`}
                  />
                </button>
                {openAccordions.shipping && (
                  <div className="pb-4 text-xs sm:text-[13px] text-ink-secondary leading-relaxed space-y-3">
                    <div>
                      <p className="font-medium text-ink uppercase tracking-wider text-[11px] mb-1">
                        Shipping Policy
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-xs">
                        {(product.shippingPolicy || [
                          'Orders are dispatched within 24–48 hours of confirmation.',
                          'Delivery takes 2–7 business days from the order date.',
                        ]).map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-line">
                      <p className="font-medium text-ink uppercase tracking-wider text-[11px] mb-1">
                        Return Policy
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-xs">
                        {(product.returnPolicy || [
                          'Returns, exchanges, or replacements are accepted for unused items within 7 days of delivery. (Items must have original tags, dust bags, and packaging intact.)',
                          'Customised or promotional items are not eligible for return/exchange.',
                          'In case of any damage, defective item, missing item, empty parcel, or any other issue, please contact us within 24 hours of delivery. Kindly share a proper unboxing video along with a few clear pictures of the bag and box from all sides.',
                          'For any assistance, write to us at Zimorindia@gmail.com or call us at +91 89536 96928 from Monday to Saturday 10:00 am to 7:00 pm',
                          'Pick-up and delivery will be handled by Zimor.',
                          'For returns on Cash on Delivery orders, the refund will be credited to your bank account within 5–7 working days, as per standard banking timelines.',
                        ]).map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 4: More Information */}
              <div className="border-b border-line">
                <button
                  type="button"
                  onClick={() => toggleAccordion('more')}
                  className="w-full py-4 flex items-center justify-between text-left text-xs sm:text-sm font-normal text-ink hover:text-ink-secondary transition-colors"
                >
                  <span className="font-medium">More Information</span>
                  <ChevronDown
                    className={`w-4 h-4 text-ink-muted transition-transform duration-200 ${openAccordions.more ? 'rotate-180' : ''
                      }`}
                  />
                </button>
                {openAccordions.more && (
                  <div className="pb-4 text-xs sm:text-[13px] text-ink-secondary leading-relaxed space-y-3">
                    <div>
                      <p className="font-medium text-ink uppercase tracking-wider text-[11px] mb-0.5">
                        Imported and Marketed by | Customer Care Address
                      </p>
                      <p className="text-xs text-ink-muted">
                        {product.moreInformation?.importedAndMarketedBy ||
                          'Miraggio Lifestyles Pvt. Ltd. Plot D6, Sushant Lok 2, Golf Course Road, Sector 56, Gurgaon, Haryana, 122001, India'}
                      </p>
                    </div>

                    <div>
                      <p className="font-medium text-ink uppercase tracking-wider text-[11px] mb-0.5">
                        Customer Care
                      </p>
                      <p className="text-xs text-ink-muted">
                        {product.moreInformation?.customerCare ||
                          'Reach out to us at support@miraggiolife.com or call us at +918377991911'}
                      </p>
                    </div>

                    <div>
                      <p className="font-medium text-ink uppercase tracking-wider text-[11px] mb-0.5">
                        Country of Origin
                      </p>
                      <p className="text-xs text-ink-muted">
                        {product.moreInformation?.countryOfOrigin || 'China'}
                      </p>
                    </div>

                    {product.careInstructions && product.careInstructions.length > 0 && (
                      <div className="pt-2 border-t border-line">
                        <p className="font-medium text-ink uppercase tracking-wider text-[11px] mb-1">
                          Care Instructions
                        </p>
                        <ul className="list-disc pl-4 space-y-1 text-xs">
                          {product.careInstructions.map((inst, idx) => (
                            <li key={idx}>{inst}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 5: Frequently Asked Questions */}
              <div className="border-b border-line">
                <button
                  type="button"
                  onClick={() => toggleAccordion('faq')}
                  className="w-full py-4 flex items-center justify-between text-left text-xs sm:text-sm font-normal text-ink hover:text-ink-secondary transition-colors"
                >
                  <span className="font-medium">Frequently Asked Questions</span>
                  <ChevronDown
                    className={`w-4 h-4 text-ink-muted transition-transform duration-200 ${openAccordions.faq ? 'rotate-180' : ''
                      }`}
                  />
                </button>
                {openAccordions.faq && (
                  <div className="pb-4 space-y-2">
                    <FAQAccordion
                      showHeading={false}
                      className="border-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Share link */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Share Product'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Customer Reviews Section (#reviews) — Clean White Aesthetic */}
        {/* ============================================================ */}
        <section id="reviews" className="mt-16 pt-10 border-t border-line scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-ink-muted font-semibold mb-1">
                Verified Customer Feedback
              </p>
              <h2 className="font-primary text-2xl sm:text-3xl font-normal text-ink tracking-tight">
                Reviews for {product.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsWriteReviewOpen(true)}
              className="inline-flex items-center gap-2 bg-black hover:bg-ink-secondary text-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Write a Review</span>
            </button>
          </div>

          {/* Rating Summary Bar */}
          <div className="border-y border-line py-6 mb-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 text-center md:text-left border-b md:border-b-0 md:border-r border-line pb-4 md:pb-0 md:pr-6">
              <p className="text-4xl sm:text-5xl font-primary font-semibold text-ink">
                {product.averageRating.toFixed(1)}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-1 text-black my-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= Math.round(product.averageRating)
                      ? 'fill-black text-black'
                      : 'text-line'
                      }`}
                  />
                ))}
              </div>
              <p className="text-xs text-ink-muted">
                Based on {reviewsList.length} verified customer reviews
              </p>
            </div>

            <div className="md:col-span-8 space-y-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-12 text-ink-secondary">5 Stars</span>
                <div className="flex-1 bg-line/25 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-black h-full w-[85%]" />
                </div>
                <span className="w-8 text-right text-ink-muted">85%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-12 text-ink-secondary">4 Stars</span>
                <div className="flex-1 bg-line/25 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-black h-full w-[15%]" />
                </div>
                <span className="w-8 text-right text-ink-muted">15%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-12 text-ink-secondary">3 Stars</span>
                <div className="flex-1 bg-line/25 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-black h-full w-0" />
                </div>
                <span className="w-8 text-right text-ink-muted">0%</span>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          {reviewsList.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-line bg-canvas/40 space-y-3">
              <p className="text-sm font-medium text-ink">No reviews yet</p>
              <p className="text-xs text-ink-muted max-w-md mx-auto">
                Be the first to share your experience with the {product.name}. Your verified feedback guides our atelier craftsmen.
              </p>
              <button
                type="button"
                onClick={() => setIsWriteReviewOpen(true)}
                className="mt-2 inline-flex items-center justify-center px-5 py-2 rounded-full bg-ink text-white text-xs font-medium hover:bg-ink/80 transition-colors cursor-pointer"
              >
                Write the First Review
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {reviewsList.map((rev) => (
                <div
                  key={rev.id}
                  className="border-b border-line/60 pb-5 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-black mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-black text-black' : 'text-line'
                              }`}
                          />
                        ))}
                      </div>
                      <h4 className="text-sm font-semibold text-ink">{rev.title}</h4>
                    </div>
                    <span className="text-[11px] text-ink-muted">{rev.date}</span>
                  </div>

                  <p className="text-xs sm:text-[13px] text-ink-secondary leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  <div className="pt-1 flex items-center justify-between text-xs text-ink-muted">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-ink">{rev.userName}</span>
                      {rev.userCity && <span>• {rev.userCity}</span>}
                      {rev.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* YOU MAY ALSO LIKE Section                                   */}
        {/* ============================================================ */}
        <section className="mt-16 pt-10 border-t border-line">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-ink-muted font-semibold mb-1">
                Tote Bags & Work Essentials
              </p>
              <h2 className="font-primary text-2xl sm:text-3xl font-normal text-ink tracking-tight uppercase">
                YOU MAY ALSO LIKE
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-semibold uppercase tracking-wider text-ink hover:text-[#b4b4b4] underline underline-offset-4"
            >
              View All Bags →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {youMayAlsoLike.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* RECENTLY VIEWED PRODUCTS / NEW ARRIVALS                     */}
        {/* ============================================================ */}
        {recentlyViewed.length > 0 && (
          <section className="mt-16 pt-10 border-t border-line">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-ink-muted font-semibold mb-1">
                  Recently Viewed & New Arrivals
                </p>
                <h2 className="font-primary text-2xl sm:text-3xl font-normal text-ink tracking-tight uppercase">
                  RECENTLY VIEWED PRODUCTS
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-xs font-semibold uppercase tracking-wider text-ink hover:text-[#b4b4b4] underline underline-offset-4"
              >
                Explore Shop →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
              {recentlyViewed.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* ZIMOR – FREQUENTLY ASKED QUESTIONS (LAST SECTION ABOVE FOOTER) */}
        {/* ============================================================ */}
        <section id="faq" className="mt-16 sm:mt-24 pt-10 sm:pt-16 border-t border-line scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <FAQAccordion
              title="ZIMOR – Frequently Asked Questions"
              subtitle="Everything you need to know about delivery timelines, returns, refunds, warranty, and product care."
            />
          </div>
        </section>
      </div>

      {/* ============================================================ */}
      {/* Mobile Sticky Bottom "ADD TO CART" Bar (Proportionate)       */}
      {/* ============================================================ */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-line px-4 py-2.5 lg:hidden transition-transform duration-300 shadow-md ${showStickyBottomBar ? 'translate-y-0' : 'translate-y-full pointer-events-none'
          }`}
      >
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-10 h-10 overflow-hidden bg-white shrink-0 border border-line">
              <Image
                src={product.images[0]?.url || 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp'}
                alt={product.name}
                fill
                loading="lazy"
                decoding="async"
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-ink truncate">{product.name}</p>
              <p className="text-xs font-bold text-ink">₹{product.price.toLocaleString('en-IN')}</p>
            </div>
          </div>
          {product.isComingSoon ? (
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className="bg-black hover:bg-ink-secondary text-white font-medium text-xs tracking-wider uppercase py-2.5 px-4 flex items-center gap-1.5 shrink-0 transition-colors"
            >
              {inWishlist ? 'WISHLISTED' : 'NOTIFY ME'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className="bg-black hover:bg-ink-secondary text-white font-medium text-xs tracking-wider uppercase py-2.5 px-4 flex items-center gap-1.5 shrink-0 transition-colors"
            >
              ADD TO CART
            </button>
          )}
        </div>
      </div>

      {/* Review Lightbox & Write Form Modal */}
      <ReviewModal
        selectedReview={selectedReview}
        onClose={() => setSelectedReview(null)}
        onWriteReview={isWriteReviewOpen}
        onCloseWriteReview={() => setIsWriteReviewOpen(false)}
        onSubmitReview={handleAddReview}
        productName={product.name}
      />
    </div>
  );
}
