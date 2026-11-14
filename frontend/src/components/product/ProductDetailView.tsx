'use client';

import React, { useState } from 'react';
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
  const [activeAccordion, setActiveAccordion] = useState<string | null>('features');
  const [reviewsList, setReviewsList] = useState<CustomerReview[]>(getReviewsForProduct(product.slug));
  const [selectedReview, setSelectedReview] = useState<CustomerReview | null>(null);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const relatedProducts = getRelatedProducts(product, 3);

  const discountPercent = Math.round(
    ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
  );

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

  return (
    <div className="bg-canvas min-h-screen py-8 sm:py-12 border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="text-[11px] text-ink-muted uppercase tracking-wider flex items-center gap-2 mb-6">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-ink">Shop Bags</Link>
          <span>/</span>
          <Link href={`/shop?category=${product.category}`} className="hover:text-ink">
            {product.categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-ink font-semibold truncate">{product.name}</span>
        </nav>

        {/* Top Product Hero Layout: Gallery Left, Purchase Form Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Gallery Column */}
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Right: Product Actions & Specs Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header / Titles */}
            <div className="space-y-2 border-b border-line pb-5">
              <div className="flex items-center justify-between text-xs text-ink-muted">
                <span className="text-xs uppercase tracking-widest text-brand-700 font-bold">
                  {product.categoryLabel}
                </span>
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(product.averageRating)
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-neutral-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-ink">{product.averageRating.toFixed(1)}</span>
                  <a href="#reviews" className="text-brand-700 hover:underline">
                    ({reviewsList.length} reviews)
                  </a>
                </div>
              </div>

              <h1 className="font-serif text-[28px] sm:text-[34px] lg:text-[38px] font-normal text-ink tracking-tight leading-tight">
                {product.name}
              </h1>

              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                {product.tagline}
              </p>

              {/* Price & Savings */}
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-2xl sm:text-3xl font-bold text-ink">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-base text-ink-faint line-through">
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Save {discountPercent}% (₹{(product.compareAtPrice - product.price).toLocaleString('en-IN')})
                </span>
              </div>
              <p className="text-[11px] text-ink-muted">
                Inclusive of all taxes. Free express shipping across India.
              </p>
            </div>

            {/* Laptop Fit & Capacity Callout */}
            <div className="p-3 bg-brand-50 border border-brand-200/60 rounded flex items-center gap-2.5 text-xs text-brand-950 font-medium">
              <CheckCircle className="w-4 h-4 text-brand-700 shrink-0" />
              <span>{product.laptopCompatibility}</span>
            </div>

            {/* Color Swatch Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink">
                  Selected Color:{' '}
                  <span className="font-normal text-ink-secondary">{selectedColor}</span>
                </span>
                <span className="text-ink-muted text-[11px]">
                  {product.colors.length} Available Tone{product.colors.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.name)}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-xs border transition-all ${
                      selectedColor === color.name
                        ? 'border-brand-700 bg-brand-50 text-brand-900 font-semibold ring-1 ring-brand-700'
                        : 'border-line text-ink hover:border-ink/40'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span>{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper & Stock Urgency */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-ink">Quantity:</span>
                <div className="flex items-center border border-line bg-canvas-card rounded">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-ink-secondary hover:text-ink"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-semibold text-ink">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-ink-secondary hover:text-ink"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-amber-800 font-medium">
                  • Only {product.stock} pieces left in stock
                </span>
              </div>
            </div>

            {/* Action Buttons: Add to Bag, Buy Now, Wishlist */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs uppercase tracking-luxury py-4 px-6 rounded flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-4 rounded border transition-colors ${
                    inWishlist
                      ? 'border-brand-700 text-brand-700 bg-brand-50'
                      : 'border-line text-ink hover:border-ink'
                  }`}
                  aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full bg-ink hover:bg-brand-950 text-white font-semibold text-xs uppercase tracking-luxury py-3.5 px-6 rounded flex items-center justify-center transition-colors"
              >
                Instant Buy Now
              </button>
            </div>

            {/* Trust & Guarantee Badges */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-line text-xs text-ink-secondary">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-700 shrink-0" />
                <span>Free Express Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-brand-700 shrink-0" />
                <span>7-Day Easy Returns</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-700 shrink-0" />
                <span>Cash on Delivery Available</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-brand-700 shrink-0" />
                <span>Complimentary Gift Box</span>
              </div>
            </div>

            {/* Share link button */}
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

        {/* Detailed Accordion Section */}
        <div className="mt-16 max-w-4xl mx-auto space-y-3">
          <h2 className="font-serif text-[26px] sm:text-[32px] font-normal text-ink tracking-tight mb-6 text-center">
            Craftsmanship & Specifications
          </h2>

          {/* Accordion 1: Features & Organization */}
          <div className="bg-canvas-card border border-line rounded overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion('features')}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-semibold text-sm text-ink hover:bg-canvas-alt/50 transition-colors"
            >
              <span>Features & Daily Organization</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  activeAccordion === 'features' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {activeAccordion === 'features' && (
              <div className="p-4 sm:p-5 pt-0 border-t border-line/50 space-y-2 text-xs text-ink-secondary leading-relaxed">
                <ul className="space-y-2 list-disc pl-5">
                  {product.features.map((feat, idx) => (
                    <li key={idx}>{feat}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Accordion 2: Materials & Craftsmanship */}
          <div className="bg-canvas-card border border-line rounded overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion('materials')}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-semibold text-sm text-ink hover:bg-canvas-alt/50 transition-colors"
            >
              <span>Materials & Hardware</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  activeAccordion === 'materials' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {activeAccordion === 'materials' && (
              <div className="p-4 sm:p-5 pt-0 border-t border-line/50 space-y-2 text-xs text-ink-secondary leading-relaxed">
                <ul className="space-y-2 list-disc pl-5">
                  {product.material.map((mat, idx) => (
                    <li key={idx}>{mat}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Accordion 3: Dimensions & Weight */}
          <div className="bg-canvas-card border border-line rounded overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion('dimensions')}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-semibold text-sm text-ink hover:bg-canvas-alt/50 transition-colors"
            >
              <span>Exact Dimensions & Weight</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  activeAccordion === 'dimensions' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {activeAccordion === 'dimensions' && (
              <div className="p-4 sm:p-5 pt-0 border-t border-line/50 text-xs text-ink-secondary">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
                  <div className="p-3 bg-canvas rounded border border-line">
                    <p className="text-[10px] uppercase tracking-wider text-ink-muted">Length</p>
                    <p className="text-sm font-bold text-ink mt-0.5">{product.dimensions.length}</p>
                  </div>
                  <div className="p-3 bg-canvas rounded border border-line">
                    <p className="text-[10px] uppercase tracking-wider text-ink-muted">Height</p>
                    <p className="text-sm font-bold text-ink mt-0.5">{product.dimensions.height}</p>
                  </div>
                  <div className="p-3 bg-canvas rounded border border-line">
                    <p className="text-[10px] uppercase tracking-wider text-ink-muted">Base Width</p>
                    <p className="text-sm font-bold text-ink mt-0.5">{product.dimensions.width}</p>
                  </div>
                  <div className="p-3 bg-canvas rounded border border-line">
                    <p className="text-[10px] uppercase tracking-wider text-ink-muted">Empty Weight</p>
                    <p className="text-sm font-bold text-ink mt-0.5">{product.dimensions.weight}</p>
                  </div>
                </div>
                <p className="mt-2 text-ink-muted text-[11px]">
                  Strap Drop: {product.dimensions.strapDrop} (Engineered for fatigue-free shoulder carry).
                </p>
              </div>
            )}
          </div>

          {/* Accordion 4: Care Guide */}
          <div className="bg-canvas-card border border-line rounded overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion('care')}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-semibold text-sm text-ink hover:bg-canvas-alt/50 transition-colors"
            >
              <span>Care & Longevity Instructions</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  activeAccordion === 'care' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {activeAccordion === 'care' && (
              <div className="p-4 sm:p-5 pt-0 border-t border-line/50 space-y-2 text-xs text-ink-secondary leading-relaxed">
                <ul className="space-y-2 list-disc pl-5">
                  {product.careInstructions.map((inst, idx) => (
                    <li key={idx}>{inst}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section id="reviews" className="mt-20 pt-12 border-t border-line scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-brand-700 font-bold mb-1">
                Verified Customer Feedback
              </p>
              <h2 className="font-serif text-[26px] sm:text-[32px] font-normal text-ink tracking-tight">
                Reviews for {product.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsWriteReviewOpen(true)}
              className="inline-flex items-center gap-2 bg-ink hover:bg-brand-800 text-white px-4 py-2.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Write a Review</span>
            </button>
          </div>

          {/* Rating Summary Bar */}
          <div className="bg-canvas-card border border-line rounded-lg p-6 mb-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 text-center md:text-left border-b md:border-b-0 md:border-r border-line pb-4 md:pb-0 md:pr-6">
              <p className="text-4xl sm:text-5xl font-serif font-bold text-ink">
                {product.averageRating.toFixed(1)}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-1 text-amber-500 my-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(product.averageRating)
                        ? 'fill-amber-500 text-amber-500'
                        : 'text-neutral-300'
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
                <div className="flex-1 bg-canvas-alt h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[85%]" />
                </div>
                <span className="w-8 text-right text-ink-muted">85%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-12 text-ink-secondary">4 Stars</span>
                <div className="flex-1 bg-canvas-alt h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[15%]" />
                </div>
                <span className="w-8 text-right text-ink-muted">15%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-12 text-ink-secondary">3 Stars</span>
                <div className="flex-1 bg-canvas-alt h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-0" />
                </div>
                <span className="w-8 text-right text-ink-muted">0%</span>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviewsList.map((rev) => (
              <div
                key={rev.id}
                className="bg-canvas-card border border-line rounded p-5 sm:p-6 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-amber-500 text-amber-500' : 'text-neutral-300'
                          }`}
                        />
                      ))}
                    </div>
                    <h4 className="text-sm font-bold text-ink">{rev.title}</h4>
                  </div>
                  <span className="text-[11px] text-ink-muted">{rev.date}</span>
                </div>

                <p className="text-xs text-ink-secondary leading-relaxed">
                  "{rev.comment}"
                </p>

                <div className="pt-2 border-t border-line/60 flex items-center justify-between text-xs text-ink-muted">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink">{rev.userName}</span>
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

        {/* Product Recommendations: You May Also Like */}
        <section className="mt-20 pt-12 border-t border-line">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-brand-700 font-bold mb-1">
                Curated Recommendations
              </p>
              <h2 className="font-serif text-[26px] sm:text-[32px] font-normal text-ink tracking-tight">
                Complete Your Workday Look
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-semibold uppercase tracking-wider text-ink hover:text-brand-700 underline"
            >
              View All Bags →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
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

