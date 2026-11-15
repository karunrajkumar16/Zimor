'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CartItem, Product } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, color?: string, size?: string) => void;
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
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'zimor_cart_v1';
const PROMO_KEY = 'zimor_promo_v1';

const VALID_PROMOS: Record<string, { discountPercent: number; description: string }> = {
  WELCOME10: { discountPercent: 10, description: '10% Welcome Discount applied' },
  ZIMOR15: { discountPercent: 15, description: '15% Seasonal Discount applied' },
  FIRSTBUY: { discountPercent: 10, description: '10% First Order Discount applied' },
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
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
      if (savedPromo && VALID_PROMOS[savedPromo]) {
        setAppliedPromo(savedPromo);
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
      if (appliedPromo) {
        localStorage.setItem(PROMO_KEY, appliedPromo);
      } else {
        localStorage.removeItem(PROMO_KEY);
      }
    } catch (e) {
      console.error('Failed saving cart to localStorage', e);
    }
  }, [items, appliedPromo, isLoaded]);

  const addItem = useCallback((product: Product, quantity = 1, color?: string, size?: string) => {
    const selectedColor = color || product.defaultColor || product.colors[0]?.name || 'Standard';
    const selectedSize = size || product.sizes[0] || 'Standard';

    setItems((prev) => {
      const idx = prev.findIndex(
        (item) =>
          item.productId === product.id &&
          item.selectedColor === selectedColor &&
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
          id: `${product.id}-${selectedColor}-${Date.now()}`,
          productId: product.id,
          product,
          quantity,
          selectedColor,
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
  }, []);

  const applyPromoCode = useCallback((code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (VALID_PROMOS[clean]) {
      setAppliedPromo(clean);
      setPromoError(null);
      return true;
    } else {
      setPromoError('Invalid coupon code. Try WELCOME10 for 10% off.');
      return false;
    }
  }, []);

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null);
    setPromoError(null);
  }, []);

  const openCartDrawer = useCallback(() => setIsCartDrawerOpen(true), []);
  const closeCartDrawer = useCallback(() => setIsCartDrawerOpen(false), []);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  const discountPercent = appliedPromo ? VALID_PROMOS[appliedPromo]?.discountPercent || 0 : 0;
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
