'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  ShoppingBag,
  Star,
  CheckCircle,
  Truck,
  RefreshCw,
  ShieldCheck,
  ChevronDown,
  Gift,
  Share2,
  Plus,
  Minus,
  Check,
} from 'lucide-react';
import { Product, CustomerReview } from '@/types';
import { getRelatedProducts } from '@/data/products';
import { getReviewsForProduct } from '@/data/reviews';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductCard } from '@/components/product/ProductCard';
import { ReviewModal } from '@/components/product/ReviewModal';

export function ProductDetailView({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedColor, setSelectedColor] = useState<string>(product.defaultColor);
  const selectedSize = product.sizes[0];
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('love');
  const [reviewsList, setReviewsList] = useState<CustomerReview[]>(getReviewsForProduct(product.slug));
  const [selectedReview, setSelectedReview] = useState<CustomerReview | null>(null);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showStickyBottomBar, setShowStickyBottomBar] = useState(false);

  // Delivery pincode checker state
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  const buyBoxRef = useRef<HTMLDivElement | null>(null);

  const inWishlist = isInWishlist(product.id);
  const relatedProducts = useMemo(() => getRelatedProducts(product, 3), [product]);

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
    addItem(product, quantity, selectedColor, selectedSize);
  };

  const handleBuyNow = () => {
    addItem(product, quantity, selectedColor, selectedSize);
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
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{6}$/.test(pincode.trim())) {
      setPincodeStatus('valid');
    } else {
      setPincodeStatus('invalid');
    }
  };

  const handleAddReview = (newRev: Partial<CustomerReview>) => {
    const created: CustomerReview = {
      id: `rev-${Date.now()}`,
      userName: newRev.userName || 'Verified Customer',
      userCity: newRev.userCity || 'India',
      rating: newRev.rating || 5,
      title: newRev.title || 'Exceptional Bag',
      comment: newRev.comment || '',
      verifiedPurchase: true,
      date: 'Just now',
      productSlug: product.slug,
      productName: product.name,
      media: newRev.media,
      helpfulCount: 1,
    };
    setReviewsList([created, ...reviewsList]);
  };

  // Helper to find representative image for a color swatch
  const getColorSwatchImage = (colorIndex: number) => {
    if (product.images[colorIndex]) {
      return product.images[colorIndex].url;
    }
    return product.images[0]?.url || '/products/delo-1.jpg';
  };

  return (
    <div className="bg-white min-h-screen py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ============================================================ */}
        {/* Breadcrumb Navigation                                       */}
        {/* ============================================================ */}
        <nav className="text-[11px] text-neutral-400 uppercase tracking-wider flex items-center gap-2 mb-4 sm:mb-6 overflow-x-auto scrollbar-none whitespace-nowrap">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-black transition-colors">Shop Bags</Link>
          <span>/</span>
          <Link href={`/shop?category=${product.category}`} className="hover:text-black transition-colors">
            {product.categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium truncate">{product.name}</span>
        </nav>

        {/* ============================================================ */}
        {/* Main Two-Column Layout (Clean, Borderless Benchmark)         */}
        {/* Left: 2-Column Multi-Image Grid                              */}
        {/* Right: Sticky Buy Box, Features & Line Accordions            */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column: Seamless 2-Column Product Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Right Column: Sticky Product Information & Actions */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
            {/* Header: Title, Rating & Pricing */}
            <div className="space-y-1.5 pb-2">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="text-[11px] uppercase tracking-widest text-neutral-800 font-semibold font-sans">
                  {product.categoryLabel}
                </span>
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="flex items-center gap-0.5 text-neutral-900">
                    <Star className="w-3.5 h-3.5 fill-black text-black" />
                    <span className="font-semibold text-neutral-900">{product.averageRating.toFixed(1)}</span>
                  </div>
                  <a href="#reviews" className="text-neutral-500 hover:text-black transition-colors">
                    ({reviewsList.length} reviews)
                  </a>
                </div>
              </div>

              {/* Product Title */}
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-normal text-neutral-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Tagline / Subtitle */}
              <p className="text-xs sm:text-[13px] text-neutral-600 leading-relaxed">
                {product.tagline}
              </p>

              {/* Price & Savings */}
              <div className="flex items-baseline gap-2.5 pt-1.5">
                <span className="text-xl sm:text-2xl font-bold text-neutral-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-neutral-400 line-through">
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-semibold text-[#BA3C3C]">
                  ({discountPercent}% OFF)
                </span>
              </div>
              <p className="text-[11px] text-neutral-500">
                Inclusive of all taxes. Free express shipping across India.
              </p>
            </div>

            {/* Laptop Compatibility Callout (Clean borderless line) */}
            <div className="py-2.5 border-y border-neutral-100 flex items-center gap-2 text-xs text-neutral-800 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-black shrink-0" />
              <span>{product.laptopCompatibility}</span>
            </div>

            {/* Color Swatch Selector (Benchmark Screenshot 1 Style: Image Tiles) */}
            <div className="space-y-2 pt-1">
              <div className="text-xs sm:text-[13px] text-neutral-800">
                <span className="text-neutral-500">Color: </span>
                <span className="font-semibold text-neutral-900">{selectedColor}</span>
              </div>

              {/* Mini Photo Thumbnail Swatches */}
              <div className="flex items-center gap-2.5">
                {product.colors.map((color, idx) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.name)}
                    className={`relative w-12 h-14 sm:w-14 sm:h-16 overflow-hidden bg-[#F5F5F5] transition-all ${
                      selectedColor === color.name
                        ? 'border-2 border-black ring-offset-1'
                        : 'border border-transparent hover:border-neutral-300'
                    }`}
                    title={color.name}
                    aria-label={`Select color ${color.name}`}
                  >
                    <Image
                      src={getColorSwatchImage(idx)}
                      alt={color.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Row: Wishlist Heart + ADD TO CART Button (Benchmark Screenshot 1) */}
            <div ref={buyBoxRef} className="pt-2 space-y-2.5">
              <div className="flex items-center gap-2.5">
                {/* Wishlist Button: Clean square border with heart */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={`w-12 h-12 shrink-0 border flex items-center justify-center transition-colors ${
                    inWishlist
                      ? 'border-black text-[#BA3C3C]'
                      : 'border-neutral-300 text-neutral-800 hover:border-black'
                  }`}
                  aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-[#BA3C3C]' : ''}`} />
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
                className="w-full h-11 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-medium text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center transition-colors"
              >
                Instant Buy Now
              </button>

              <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
                <span>Quantity: {quantity}</span>
                <span className="text-[#BA3C3C] font-medium">• Only {product.stock} pieces left in stock</span>
              </div>
            </div>

            {/* Delivery Details with Pincode Check (Benchmark Screenshot 1) */}
            <div className="pt-3 border-t border-neutral-100">
              <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 mb-2 font-sans">
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
                  className="flex-1 border border-neutral-300 px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-colors"
                />
                <button
                  type="submit"
                  className="bg-black text-white text-xs font-bold tracking-wider px-5 sm:px-6 py-2.5 hover:bg-neutral-800 uppercase transition-colors"
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
                <p className="mt-2 text-xs text-[#BA3C3C]">
                  Please enter a valid 6-digit Indian pincode.
                </p>
              )}
            </div>

            {/* Key Features (Benchmark Screenshot 1: Clean 2-Column Bullets) */}
            <div className="pt-3 border-t border-neutral-100">
              <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 mb-2.5 font-sans">
                Key Features
              </h3>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-[13px] text-neutral-700">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-neutral-900 mt-1.5 w-1 h-1 rounded-full bg-neutral-900 shrink-0" />
                    <span className="leading-snug">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Accordions (Benchmark Screenshot 1: Hairline Dividers, Zero Container Box) */}
            <div className="pt-2 border-t border-neutral-200">
              {/* Accordion 1: Why You'll Love It? */}
              <div className="border-b border-neutral-200">
                <button
                  type="button"
                  onClick={() => toggleAccordion('love')}
                  className="w-full py-4 flex items-center justify-between text-left text-xs sm:text-sm font-normal text-neutral-900 hover:text-neutral-600 transition-colors"
                >
                  <span className="font-medium">Why You'll Love It?</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
                      activeAccordion === 'love' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {activeAccordion === 'love' && (
                  <div className="pb-4 text-xs sm:text-[13px] text-neutral-600 leading-relaxed space-y-2">
                    <p>{product.description}</p>
                    <p className="font-medium text-neutral-800 pt-1">
                      Ideal for: {product.suitableProfessions.join(', ').replace(/-/g, ' ')}.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 2: Details & Dimensions */}
              <div className="border-b border-neutral-200">
                <button
                  type="button"
                  onClick={() => toggleAccordion('dimensions')}
                  className="w-full py-4 flex items-center justify-between text-left text-xs sm:text-sm font-normal text-neutral-900 hover:text-neutral-600 transition-colors"
                >
                  <span className="font-medium">Details & Dimensions</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
                      activeAccordion === 'dimensions' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {activeAccordion === 'dimensions' && (
                  <div className="pb-4 text-xs sm:text-[13px] text-neutral-600 leading-relaxed space-y-3">
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                      <div>
                        <span className="text-neutral-400">Length: </span>
                        <span className="font-medium text-neutral-800">{product.dimensions.length}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400">Height: </span>
                        <span className="font-medium text-neutral-800">{product.dimensions.height}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400">Base Width: </span>
                        <span className="font-medium text-neutral-800">{product.dimensions.width}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400">Empty Weight: </span>
                        <span className="font-medium text-neutral-800">{product.dimensions.weight}</span>
                      </div>
                    </div>
                    <p className="text-neutral-600 text-xs">
                      Strap Drop: {product.dimensions.strapDrop} (Engineered for fatigue-free shoulder carry).
                    </p>
                    <div className="pt-2 border-t border-neutral-100">
                      <p className="font-medium text-neutral-800 mb-1">Materials & Hardware:</p>
                      <ul className="list-disc pl-4 space-y-1 text-xs">
                        {product.material.map((mat, idx) => (
                          <li key={idx}>{mat}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 3: Shipping & Returns */}
              <div className="border-b border-neutral-200">
                <button
                  type="button"
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full py-4 flex items-center justify-between text-left text-xs sm:text-sm font-normal text-neutral-900 hover:text-neutral-600 transition-colors"
                >
                  <span className="font-medium">Shipping & Returns</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
                      activeAccordion === 'shipping' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {activeAccordion === 'shipping' && (
                  <div className="pb-4 text-xs sm:text-[13px] text-neutral-600 leading-relaxed space-y-2">
                    <p>• <strong>Free Express Shipping:</strong> Dispatched within 24 hours. Delivered in 2–4 business days across India.</p>
                    <p>• <strong>7-Day Easy Returns:</strong> Hassle-free exchanges and returns if unworn and in original condition.</p>
                    <p>• <strong>Cash on Delivery (COD):</strong> Available across 19,000+ Indian pincodes.</p>
                    <p>• <strong>Complimentary Packaging:</strong> Ships in a signature dust bag with protective gift box.</p>
                  </div>
                )}
              </div>

              {/* Accordion 4: More Information & Care */}
              <div className="border-b border-neutral-200">
                <button
                  type="button"
                  onClick={() => toggleAccordion('more')}
                  className="w-full py-4 flex items-center justify-between text-left text-xs sm:text-sm font-normal text-neutral-900 hover:text-neutral-600 transition-colors"
                >
                  <span className="font-medium">More Information & Care</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
                      activeAccordion === 'more' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {activeAccordion === 'more' && (
                  <div className="pb-4 text-xs sm:text-[13px] text-neutral-600 leading-relaxed space-y-2">
                    <p className="font-medium text-neutral-800">Care Instructions:</p>
                    <ul className="list-disc pl-4 space-y-1 text-xs">
                      {product.careInstructions.map((inst, idx) => (
                        <li key={idx}>{inst}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Share link */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black transition-colors"
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
        <section id="reviews" className="mt-16 pt-10 border-t border-neutral-200 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold mb-1">
                Verified Customer Feedback
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-neutral-900 tracking-tight">
                Reviews for {product.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsWriteReviewOpen(true)}
              className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Write a Review</span>
            </button>
          </div>

          {/* Rating Summary Bar */}
          <div className="border-y border-neutral-200 py-6 mb-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 text-center md:text-left border-b md:border-b-0 md:border-r border-neutral-200 pb-4 md:pb-0 md:pr-6">
              <p className="text-4xl sm:text-5xl font-serif font-bold text-neutral-900">
                {product.averageRating.toFixed(1)}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-1 text-black my-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(product.averageRating)
                        ? 'fill-black text-black'
                        : 'text-neutral-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-neutral-500">
                Based on {reviewsList.length} verified customer reviews
              </p>
            </div>

            <div className="md:col-span-8 space-y-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-12 text-neutral-600">5 Stars</span>
                <div className="flex-1 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-black h-full w-[85%]" />
                </div>
                <span className="w-8 text-right text-neutral-400">85%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-12 text-neutral-600">4 Stars</span>
                <div className="flex-1 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-black h-full w-[15%]" />
                </div>
                <span className="w-8 text-right text-neutral-400">15%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-12 text-neutral-600">3 Stars</span>
                <div className="flex-1 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-black h-full w-0" />
                </div>
                <span className="w-8 text-right text-neutral-400">0%</span>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {reviewsList.map((rev) => (
              <div
                key={rev.id}
                className="border-b border-neutral-100 pb-5 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-black mb-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-black text-black' : 'text-neutral-300'
                          }`}
                        />
                      ))}
                    </div>
                    <h4 className="text-sm font-semibold text-neutral-900">{rev.title}</h4>
                  </div>
                  <span className="text-[11px] text-neutral-400">{rev.date}</span>
                </div>

                <p className="text-xs sm:text-[13px] text-neutral-600 leading-relaxed">
                  "{rev.comment}"
                </p>

                <div className="pt-1 flex items-center justify-between text-xs text-neutral-500">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-900">{rev.userName}</span>
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
        </section>

        {/* ============================================================ */}
        {/* Curated Recommendations ("Complete Your Workday Look")      */}
        {/* ============================================================ */}
        <section className="mt-16 pt-10 border-t border-neutral-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold mb-1">
                Curated Recommendations
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-neutral-900 tracking-tight">
                Complete Your Workday Look
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-900 hover:text-black underline underline-offset-4"
            >
              View All Bags →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      </div>

      {/* ============================================================ */}
      {/* Mobile Sticky Bottom "ADD TO CART" Bar (Proportionate)       */}
      {/* ============================================================ */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-4 py-2.5 lg:hidden transition-transform duration-300 shadow-md ${
          showStickyBottomBar ? 'translate-y-0' : 'translate-y-full pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-10 h-10 overflow-hidden bg-[#F5F5F5] shrink-0 border border-neutral-200">
              <Image
                src={product.images[0]?.url || '/products/delo-1.jpg'}
                alt={product.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-neutral-900 truncate">{product.name}</p>
              <p className="text-xs font-bold text-neutral-900">₹{product.price.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className="bg-black hover:bg-neutral-800 text-white font-medium text-xs tracking-wider uppercase py-2.5 px-4 flex items-center gap-1.5 shrink-0 transition-colors"
          >
            ADD TO CART
          </button>
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
