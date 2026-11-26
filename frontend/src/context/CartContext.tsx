'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CartItem, Product } from '@/types';
import { apiFetch } from '@/lib/api';

interface PromoDetails {
  code: string;
  description: string;
  discountPercent: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, size?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  appliedPromo: string | null;
  promoError: string | null;
  applyPromoCode: (code: string) => Promise<boolean> | boolean;
  removePromoCode: () => void;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'zimor_cart_v1';
const PROMO_KEY = 'zimor_promo_v1';
const PROMO_DETAILS_KEY = 'zimor_promo_details_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoDetails, setPromoDetails] = useState<PromoDetails | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
      const savedPromo = localStorage.getItem(PROMO_KEY);
      const savedDetails = localStorage.getItem(PROMO_DETAILS_KEY);
      if (savedPromo) {
        setAppliedPromo(savedPromo);
      }
      if (savedDetails) {
        setPromoDetails(JSON.parse(savedDetails));
      }
    } catch (e) {
      console.error('Failed reading cart from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      if (appliedPromo && promoDetails) {
        localStorage.setItem(PROMO_KEY, appliedPromo);
        localStorage.setItem(PROMO_DETAILS_KEY, JSON.stringify(promoDetails));
      } else {
        localStorage.removeItem(PROMO_KEY);
        localStorage.removeItem(PROMO_DETAILS_KEY);
      }
    } catch (e) {
      console.error('Failed saving cart to localStorage', e);
    }
  }, [items, appliedPromo, promoDetails, isLoaded]);

  const addItem = useCallback((product: Product, quantity = 1, size?: string) => {
    const selectedSize = size || product.sizes?.[0] || 'Standard';

    setItems((prev) => {
      const idx = prev.findIndex(
        (item) =>
          item.productId === product.id &&
          item.selectedSize === selectedSize
      );
      if (idx > -1) {
        return prev.map((item, i) =>
          i === idx ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: `${product.id}-${selectedSize}-${Date.now()}`,
          productId: product.id,
          product,
          quantity,
          selectedSize,
        },
      ];
    });
    setIsCartDrawerOpen(true);
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedPromo(null);
    setPromoDetails(null);
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  const applyPromoCode = useCallback(async (code: string): Promise<boolean> => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setPromoError('Please enter a coupon code.');
      return false;
    }

    try {
      const res = await apiFetch('/api/checkout/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean, subtotal }),
      });

      const data = await res.json();
      if (res.ok && data.valid && data.promo) {
        setAppliedPromo(data.promo.code);
        setPromoDetails({
          code: data.promo.code,
          description: data.promo.description,
          discountPercent: Number(data.promo.discountPercent || 0),
        });
        setPromoError(null);
        return true;
      } else {
        setPromoError(data.error || 'Invalid coupon code. Try WELCOME10 for 10% off.');
        return false;
      }
    } catch {
      setPromoError('Unable to validate promotion right now. Please try again.');
      return false;
    }
  }, [subtotal]);

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null);
    setPromoDetails(null);
    setPromoError(null);
  }, []);

  const openCartDrawer = useCallback(() => setIsCartDrawerOpen(true), []);
  const closeCartDrawer = useCallback(() => setIsCartDrawerOpen(false), []);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const discountPercent = promoDetails?.discountPercent || 0;
  const discount = useMemo(() => Math.round((subtotal * discountPercent) / 100), [subtotal, discountPercent]);

  const shippingFee = 0; // Free express shipping across India
  const total = useMemo(
    () => Math.max(0, subtotal - discount + shippingFee),
    [subtotal, discount, shippingFee]
  );

  const contextValue = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      discount,
      shippingFee,
      total,
      appliedPromo,
      promoError,
      applyPromoCode,
      removePromoCode,
      isCartDrawerOpen,
      openCartDrawer,
      closeCartDrawer,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      discount,
      shippingFee,
      total,
      appliedPromo,
      promoError,
      applyPromoCode,
      removePromoCode,
      isCartDrawerOpen,
      openCartDrawer,
      closeCartDrawer,
    ]
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
