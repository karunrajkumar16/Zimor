'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Order } from '@/types';
import { apiFetch, BACKEND_URL } from '@/lib/api';

export interface UserAddress {
  id: string;
  label?: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  city?: string;
  avatar?: string;
  addresses: UserAddress[];
  orders?: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  orders: Order[];
  authError: string | null;
  loginWithGoogle: (redirectPath?: string) => void;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  createOrder: (
    orderData: Omit<
      Order,
      'id' | 'orderNumber' | 'date' | 'status' | 'trackingNumber' | 'courierName' | 'estimatedDelivery'
    >
  ) => Promise<Order>;
  getOrderById: (id: string) => Order | undefined;
  refreshSession: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchSession = useCallback(async () => {
    try {
      const res = await apiFetch('/api/auth/customer/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone || '',
            designation: data.user.designation || 'Atelier Patron',
            city: data.user.city || (data.user.addresses?.[0]?.city ?? ''),
            avatar: data.user.avatar || '',
            addresses: data.user.addresses || [],
            orders: data.user.orders || [],
          });
          if (Array.isArray(data.orders)) {
            setOrders(data.orders);
          }
          return;
        }
      }
      setUser(null);
      setOrders([]);
    } catch (err) {
      console.error('[AuthContext] Failed to retrieve customer session:', err);
      setUser(null);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check URL parameters for OAuth callback results
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const error = params.get('auth_error');

      if (token) {
        sessionStorage.setItem('zimor_customer_token', token);
        localStorage.setItem('zimor_customer_token', token);
      }

      if (error) {
        setAuthError(decodeURIComponent(error));
      }

      // Clean the query string without reloading the page
      if (token || error || params.get('auth')) {
        params.delete('token');
        params.delete('auth');
        params.delete('auth_error');
        const newSearch = params.toString();
        const newPath = window.location.pathname + (newSearch ? `?${newSearch}` : '');
        window.history.replaceState({}, document.title, newPath);
      }
    }

    fetchSession();
  }, [fetchSession]);

  const loginWithGoogle = useCallback((redirectPath?: string) => {
    const target = redirectPath || (typeof window !== 'undefined' ? window.location.pathname : '/account');
    const authUrl = `${BACKEND_URL}/api/auth/google?redirect=${encodeURIComponent(target)}`;
    window.location.href = authUrl;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/customer/logout', { method: 'POST' });
    } catch (e) {
      console.error('[AuthContext] Logout failed:', e);
    } finally {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('zimor_customer_token');
        localStorage.removeItem('zimor_customer_token');
      }
      setUser(null);
      setOrders([]);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/customers/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                ...data.user,
                addresses: data.user.addresses || prev.addresses,
              }
            : data.user
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('[AuthContext] Failed updating patron profile:', err);
      return false;
    }
  }, []);

  const createOrder = useCallback(
    async (
      orderData: Omit<
        Order,
        'id' | 'orderNumber' | 'date' | 'status' | 'trackingNumber' | 'courierName' | 'estimatedDelivery'
      >
    ): Promise<Order> => {
      try {
        const res = await apiFetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...orderData,
            customerId: user?.id,
            customerEmail: user?.email,
          }),
        });

        const data = await res.json();
        if (res.ok && data.order) {
          setOrders((prev) => [data.order, ...prev]);
          return data.order;
        }
        throw new Error(data.error || 'Failed to place order');
      } catch (e) {
        console.error('[AuthContext] Order creation failed:', e);
        throw e;
      }
    },
    [user]
  );

  const getOrderById = useCallback(
    (id: string): Order | undefined => {
      return orders.find((o) => o.id === id || o.orderNumber === id);
    },
    [orders]
  );

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      orders,
      authError,
      loginWithGoogle,
      logout,
      updateProfile,
      createOrder,
      getOrderById,
      refreshSession: fetchSession,
      clearAuthError,
    }),
    [
      user,
      isLoading,
      orders,
      authError,
      loginWithGoogle,
      logout,
      updateProfile,
      createOrder,
      getOrderById,
      fetchSession,
      clearAuthError,
    ]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
