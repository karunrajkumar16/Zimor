'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order } from '@/types';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  designation?: string;
  city: string;
  avatar: string;
  addresses: {
    id: string;
    label: string;
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    isDefault: boolean;
  }[];
}

interface AuthContextType {
  user: UserProfile;
  orders: Order[];
  updateProfile: (updates: Partial<UserProfile>) => void;
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'date' | 'status' | 'trackingNumber' | 'courierName' | 'estimatedDelivery'>) => Order;
  getOrderById: (id: string) => Order | undefined;
}

const DEFAULT_USER: UserProfile = {
  name: 'Ananya Sharma',
  email: 'ananya.sharma@example.com',
  phone: '+91 98765 43210',
  designation: 'Senior Strategy Consultant',
  city: 'Bengaluru',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
  addresses: [
    {
      id: 'addr-1',
      label: 'Office (Indiranagar)',
      fullName: 'Ananya Sharma',
      addressLine1: 'Tower B, 4th Floor, Tech Hub',
      addressLine2: '100ft Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      phone: '+91 98765 43210',
      isDefault: true,
    },
    {
      id: 'addr-2',
      label: 'Home (Koramangala)',
      fullName: 'Ananya Sharma',
      addressLine1: 'Villa 14, Palm Meadows',
      addressLine2: '4th Block, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
      phone: '+91 98765 43210',
      isDefault: false,
    },
  ],
};

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1082',
    orderNumber: 'ZMR-2026-8941',
    date: 'October 28, 2026',
    items: [
      {
        productId: 'zimor-delo-tote-rust',
        name: 'ZIMOR DELO TOTE',
        slug: 'zimor-delo-tote',
        image: '/products/delo-1.jpg',
        color: 'Rust Caramel',
        size: 'Medium (15.6" Laptop)',
        price: 2999,
        quantity: 1,
      },
    ],
    shippingAddress: {
      fullName: 'Ananya Sharma',
      addressLine1: 'Tower B, 4th Floor, Tech Hub, 100ft Road',
      addressLine2: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      phone: '+91 98765 43210',
    },
    shippingMethod: 'Express Air Shipping',
    paymentMethod: 'UPI (Google Pay)',
    subtotal: 2999,
    discount: 300,
    shippingFee: 0,
    giftWrapFee: 0,
    total: 2699,
    status: 'Delivered',
    trackingNumber: 'BLR-EXP-9920194',
    courierName: 'BlueDart Express',
    estimatedDelivery: 'November 2, 2026',
  },
  {
    id: 'ord-1083',
    orderNumber: 'ZMR-2026-9182',
    date: 'November 08, 2026',
    items: [
      {
        productId: 'zimor-classic-shoulder-bag-cream',
        name: 'ZIMOR CLASSIC SHOULDER BAG',
        slug: 'zimor-classic-shoulder-bag',
        image: '/products/classic-1.jpg',
        color: 'Cream Canvas',
        size: 'Small (Everyday Carry)',
        price: 1699,
        quantity: 1,
      },
    ],
    shippingAddress: {
      fullName: 'Ananya Sharma',
      addressLine1: 'Villa 14, Palm Meadows, 4th Block',
      addressLine2: 'Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
      phone: '+91 98765 43210',
    },
    shippingMethod: 'Standard Courier Delivery',
    paymentMethod: 'Credit Card (HDFC Visa)',
    subtotal: 1699,
    discount: 0,
    shippingFee: 0,
    giftWrapFee: 149,
    total: 1848,
    status: 'Dispatched',
    trackingNumber: 'DEL-XPR-8492011',
    courierName: 'Delhivery Surface',
    estimatedDelivery: 'November 14, 2026',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE = 'zimor_user_v1';
const ORDERS_STORAGE = 'zimor_orders_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE);
      if (savedUser) setUser(JSON.parse(savedUser));
      const savedOrders = localStorage.getItem(ORDERS_STORAGE);
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch (e) {
      console.error('Failed reading user from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(USER_STORAGE, JSON.stringify(user));
      localStorage.setItem(ORDERS_STORAGE, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed saving user to storage', e);
    }
  }, [user, orders, isLoaded]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const createOrder = (
    orderData: Omit<
      Order,
      'id' | 'orderNumber' | 'date' | 'status' | 'trackingNumber' | 'courierName' | 'estimatedDelivery'
    >
  ): Order => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ZMR-2026-${randomSuffix}`;
    const trackingNumber = `IND-EXP-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      date: new Date().toLocaleDateString('en-IN', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      status: 'Confirmed',
      trackingNumber,
      courierName: 'BlueDart Express',
      estimatedDelivery: 'In 4–6 business days',
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const getOrderById = (id: string): Order | undefined => {
    return orders.find((o) => o.id === id || o.orderNumber === id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        orders,
        updateProfile,
        createOrder,
        getOrderById,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

