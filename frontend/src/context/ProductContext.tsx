'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '@/types';
import { PRODUCTS } from '@/data/products';
import { apiFetch } from '@/lib/api';

interface ProductContextType {
  products: Product[]; // Published live products from MongoDB Atlas
  allProducts: Product[]; // All products including unpublished
  isLoading: boolean;
  error: string | null;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allProducts, setAllProducts] = useState<Product[]>(PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await apiFetch('/api/products', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.products)) {
          // Normalize IDs, booleans, and image fallbacks if missing
          const normalized: Product[] = data.products.map((p: any) => ({
            ...p,
            id: p.id || p._id?.toString() || p.slug,
            categoryLabel: p.categoryLabel || (p.category === 'tote-bags' ? 'Tote Bags' : p.category === 'laptop-bags' ? 'Laptop Bags' : 'Shoulder Bags'),
            images: p.images && p.images.length > 0 ? p.images : [{ url: 'https://res.cloudinary.com/kbeyfu3d/image/upload/v1794917827/zimor/products/delo-1.webp', alt: p.name }],
            suitableProfessions: p.suitableProfessions || [],
            isPublished: p.isPublished !== false,
            isFeatured: Boolean(p.isFeatured),
          }));
          setAllProducts(normalized);
          setError(null);
          return;
        }
      }
      throw new Error(`Failed to load product catalog (HTTP ${res.status})`);
    } catch (err: any) {
      console.error('[ProductContext] Live product fetch error:', err);
      setError(err.message || 'Unable to connect to product database');
      setAllProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Storefront products: strictly visible and published (isPublished !== false)
  const products = useMemo(() => {
    return allProducts.filter((p) => p.isPublished !== false);
  }, [allProducts]);

  const getProductBySlug = useCallback(
    (slug: string): Product | undefined => {
      return (
        products.find((p) => p.slug === slug) ||
        allProducts.find((p) => p.slug === slug)
      );
    },
    [products, allProducts]
  );

  const getProductById = useCallback(
    (id: string): Product | undefined => {
      return (
        products.find((p) => p.id === id || p.slug === id) ||
        allProducts.find((p) => p.id === id || p.slug === id)
      );
    },
    [products, allProducts]
  );

  const value = useMemo(
    () => ({
      products,
      allProducts,
      isLoading,
      error,
      getProductBySlug,
      getProductById,
      refreshProducts: fetchProducts,
    }),
    [products, allProducts, isLoading, error, getProductBySlug, getProductById, fetchProducts]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
