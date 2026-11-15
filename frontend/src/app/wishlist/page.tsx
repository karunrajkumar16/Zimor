'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { PRODUCTS } from '@/data/products';
import { Product } from '@/types';

export default function WishlistPage() {
  const { wishlistIds, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  const savedProducts = PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  const handleMoveToCart = (product: Product) => {
    addItem(product, 1);
    removeFromWishlist(product.id);
  };

  return (
    <div className="bg-canvas min-h-screen py-10 sm:py-16 border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-[11px] text-ink-muted uppercase tracking-wider flex items-center gap-2 mb-6">
          <Link href="/" className="hover:text-ink">Home</Link>
          <span>/</span>
          <span className="text-ink font-semibold">My Saved Items</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-line pb-6 mb-8 gap-4">
          <div>
            <h1 className="font-primary text-[32px] sm:text-[42px] font-normal text-ink tracking-tight">
              Your Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary mt-1">
              {savedProducts.length} silhouette{savedProducts.length === 1 ? '' : 's'} saved to your personal collection.
            </p>
          </div>

          {savedProducts.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="text-xs text-red-600 hover:text-red-700 underline font-medium self-start sm:self-auto"
            >
              Clear all saved items
            </button>
          )}
        </div>

        {savedProducts.length === 0 ? (
          <div className="text-center py-20 bg-canvas-card rounded-lg border border-line space-y-4 max-w-xl mx-auto p-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-canvas-alt flex items-center justify-center text-ink-muted">
              <Heart className="w-8 h-8 stroke-1" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-ink">Your wishlist is currently empty</h2>
              <p className="text-xs text-ink-secondary">
                Tap the heart icon on any workbag to save it for later or compare features.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-ink hover:bg-ink-secondary text-white font-primary text-sm font-medium tracking-normal py-3.5 px-8 rounded transition-colors shadow-sm"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {savedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-canvas-card border border-line rounded-lg overflow-hidden flex flex-col justify-between shadow-xs group"
              >
                <div className="relative aspect-3/4 w-full bg-canvas-alt overflow-hidden">
                  <Link href={`/product/${product.slug}`}>
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      loading="lazy"
                      decoding="async"
                      className="object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-ink hover:text-red-600 flex items-center justify-center shadow-sm"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-brand-700 font-bold">
                      {product.categoryLabel}
                    </span>
                    <Link
                      href={`/product/${product.slug}`}
                      className="block text-sm font-bold text-ink hover:text-brand-700 transition-colors line-clamp-1 mt-0.5"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-ink-muted line-clamp-1 mt-0.5">
                      {product.laptopCompatibility}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-2 pt-1 border-t border-line/60">
                    <span className="text-base font-bold text-ink">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-ink-muted line-through">
                      ₹{product.compareAtPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleMoveToCart(product)}
                    className="w-full bg-ink hover:bg-ink-secondary text-white font-primary font-medium text-sm tracking-normal py-3 rounded flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

