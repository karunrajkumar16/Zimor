'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Order } from '@/types';
import { apiFetch, apiUrl, BACKEND_URL } from '@/lib/api';

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
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  addAddress: (address: Omit<UserAddress, 'id'>) => Promise<boolean>;
  updateAddress: (id: string, updates: Partial<UserAddress>) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  setDefaultAddress: (id: string) => Promise<boolean>;
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
            designation: data.user.designation || 'Atelier User',
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
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams({ redirect: target });
    if (origin) {
      params.set('origin', origin);
    }
    const authUrl = apiUrl(`/api/auth/google?${params.toString()}`);
    window.location.href = authUrl;
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthError(null);
      const res = await apiFetch('/api/auth/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const errorMsg = data.error || 'Login failed. Please check your credentials.';
        setAuthError(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (data.token && typeof window !== 'undefined') {
        sessionStorage.setItem('zimor_customer_token', data.token);
        localStorage.setItem('zimor_customer_token', data.token);
      }

      await fetchSession();
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.message || 'An unexpected error occurred during login.';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [fetchSession]);

  const registerWithEmail = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthError(null);
      const res = await apiFetch('/api/auth/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const errorMsg = data.error || 'Registration failed. Please check your information.';
        setAuthError(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (data.token && typeof window !== 'undefined') {
        sessionStorage.setItem('zimor_customer_token', data.token);
        localStorage.setItem('zimor_customer_token', data.token);
      }

      await fetchSession();
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.message || 'An unexpected error occurred during registration.';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [fetchSession]);

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
      console.error('[AuthContext] Failed updating user profile:', err);
      return false;
    }
  }, []);

  const addAddress = useCallback(
    async (address: Omit<UserAddress, 'id'>): Promise<boolean> => {
      if (!user) return false;
      const newAddress: UserAddress = {
        ...address,
        id: `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        isDefault: address.isDefault || !user.addresses || user.addresses.length === 0,
      };
      let updatedList = user.addresses ? [...user.addresses] : [];
      if (newAddress.isDefault) {
        updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
      }
      updatedList.push(newAddress);
      return await updateProfile({ addresses: updatedList });
    },
    [user, updateProfile]
  );

  const updateAddress = useCallback(
    async (id: string, updates: Partial<UserAddress>): Promise<boolean> => {
      if (!user || !user.addresses) return false;
      let updatedList = user.addresses.map((a) => (a.id === id ? { ...a, ...updates } : a));
      if (updates.isDefault) {
        updatedList = updatedList.map((a) => (a.id === id ? { ...a, isDefault: true } : { ...a, isDefault: false }));
      }
      return await updateProfile({ addresses: updatedList });
    },
    [user, updateProfile]
  );

  const deleteAddress = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user || !user.addresses) return false;
      let updatedList = user.addresses.filter((a) => a.id !== id);
      if (updatedList.length > 0 && !updatedList.some((a) => a.isDefault)) {
        updatedList[0] = { ...updatedList[0], isDefault: true };
      }
      return await updateProfile({ addresses: updatedList });
    },
    [user, updateProfile]
  );

  const setDefaultAddress = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user || !user.addresses) return false;
      const updatedList = user.addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }));
      return await updateProfile({ addresses: updatedList });
    },
    [user, updateProfile]
  );

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
      loginWithEmail,
      registerWithEmail,
      logout,
      updateProfile,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
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
      loginWithEmail,
      registerWithEmail,
      logout,
      updateProfile,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
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
