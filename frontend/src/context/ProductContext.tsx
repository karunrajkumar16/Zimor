'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product, Category } from '@/types';
import { apiFetch } from '@/lib/api';

interface ProductContextType {
  products: Product[]; // Published live products from MongoDB Atlas
  allProducts: Product[]; // All products including unpublished
  categories: Category[]; // Dynamic categories from MongoDB Atlas
  isLoading: boolean;
  error: string | null;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = useCallback(async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.allSettled([
        apiFetch('/api/products', { cache: 'no-store' }),
        apiFetch('/api/categories', { cache: 'no-store' }),
      ]);

      if (prodRes.status === 'fulfilled' && prodRes.value.ok) {
        const data = await prodRes.value.json();
        if (Array.isArray(data.products)) {
          // Normalize IDs, booleans, and image structure
          const normalized: Product[] = data.products.map((p: any) => ({
            ...p,
            id: p.id || p._id?.toString() || p.slug,
            categoryLabel: p.categoryLabel || (p.category === 'tote-bags' ? 'Tote Bags' : p.category === 'laptop-bags' ? 'Laptop Bags' : 'Shoulder Bags'),
            images: Array.isArray(p.images) ? p.images : [],
            suitableProfessions: p.suitableProfessions || [],
            isPublished: p.isPublished !== false,
            isFeatured: Boolean(p.isFeatured),
          }));
          setAllProducts(normalized);
          setError(null);
        }
      } else {
        throw new Error('Failed to load product catalog');
      }

      if (catRes.status === 'fulfilled' && catRes.value.ok) {
        const catData = await catRes.value.json();
        if (Array.isArray(catData.categories)) {
          setCategories(catData.categories);
        }
      }
    } catch (err: any) {
      console.error('[ProductContext] Live catalog fetch error:', err);
      setError(err.message || 'Unable to connect to database');
      setAllProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

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
      categories,
      isLoading,
      error,
      getProductBySlug,
      getProductById,
      refreshProducts: fetchCatalog,
    }),
    [products, allProducts, categories, isLoading, error, getProductBySlug, getProductById, fetchCatalog]
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
