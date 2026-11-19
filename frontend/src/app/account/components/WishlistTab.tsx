'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, ArrowRight, Check } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext';
import { Product } from '@/types';

export const WishlistTab: React.FC = () => {
  const { wishlistIds, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const { products } = useProducts();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Match products by id or slug
  const savedProducts = products.filter(
    (p) => wishlistIds.includes(p.id) || (p.slug && wishlistIds.includes(p.slug))
  );

  const handleMoveToBag = (product: Product) => {
    addItem(product, 1);
    removeFromWishlist(product.id);
    setToastMessage(`Moved "${product.name}" to your shopping bag.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRemove = (product: Product) => {
    removeFromWishlist(product.id);
    if (product.slug) {
      removeFromWishlist(product.slug);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <Link href="/cart" className="font-semibold underline ml-2">
            View Bag →
          </Link>
        </div>
      )}

      {/* Header bar */}
      <div className="border-b border-[#000000]/10 pb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-primary text-xl sm:text-2xl font-normal text-[#000000]">
            Saved Wishlist
          </h2>
          <p className="font-secondary text-xs text-[#777777] mt-0.5">
            {savedProducts.length} silhouette{savedProducts.length === 1 ? '' : 's'} saved to your private curation
          </p>
        </div>

        {savedProducts.length > 0 && (
          <button
            type="button"
            onClick={clearWishlist}
            className="text-xs text-[#888888] hover:text-[#B44220] underline transition-colors cursor-pointer"
          >
            Clear all items
          </button>
        )}
      </div>

      {/* Wishlist Grid or Empty State */}
      {savedProducts.length === 0 ? (
        <div className="bg-white border border-[#B4B4B4]/30 p-10 sm:p-16 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#B4B4B4]/40 flex items-center justify-center mx-auto text-[#000000]">
            <Heart className="w-6 h-6 stroke-1 text-[#888888]" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="font-primary text-lg sm:text-xl font-normal text-[#000000]">
              Your Wishlist is Empty
            </h3>
            <p className="font-secondary text-xs text-[#777777] leading-relaxed">
              Explore our architectural handbags and tap the heart icon on any silhouette to curate your private collection.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#000000] hover:bg-[#333333] text-white text-xs font-medium uppercase tracking-[0.14em] transition-colors"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {savedProducts.map((product) => {
            const primaryImage = product.images?.[0]?.url || 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp';

            return (
              <div
                key={product.id}
                className="bg-white border border-[#B4B4B4]/30 hover:border-[#000000] flex flex-col justify-between transition-all group"
              >
                {/* Product Image & Link */}
                <div className="relative aspect-3/4 w-full bg-[#FAF8F5] overflow-hidden">
                  <Link href={`/product/${product.slug}`}>
                    <Image
                      src={primaryImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleRemove(product)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 text-[#000000] hover:text-[#B44220] flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                    aria-label={`Remove ${product.name} from wishlist`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <Link
                      href={`/product/${product.slug}`}
                      className="font-medium text-xs sm:text-sm text-[#000000] hover:underline block"
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-[#000000]">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-[#888888] line-through text-[11px]">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Move to Bag Action */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleMoveToBag(product)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#000000] hover:bg-[#333333] text-white text-xs font-medium uppercase tracking-[0.12em] transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Bag</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
