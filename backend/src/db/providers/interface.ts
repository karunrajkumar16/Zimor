// /src/lib/db/providers/interface.ts
// Provider interface for database operations — swap JSON ↔ MongoDB via config

import { 
  Product, Order, CustomerReview 
} from '../../types/index.js';

export type { Product, Order, CustomerReview };

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'superadmin';
  createdAt: string;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  addresses: Address[];
  orders: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  publicId?: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  folder: string;
  productId?: string;
  createdAt: string;
}

export interface SiteContent {
  page: string;
  section: string;
  data: Record<string, unknown>;
  updatedAt: string;
}

export interface CreateOrderInput {
  items: Array<{
    productId: string;
    productName: string;
    slug: string;
    selectedColor: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: Address;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentProvider?: string;
  razorpayOrderId?: string;
}

export interface DatabaseProvider {
  // Products
  getProducts(filters?: {
    category?: string;
    isFeatured?: boolean;
    isPublished?: boolean;
    search?: string;
  }): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductById(id: string): Promise<Product | null>;
  createProduct(data: Omit<Product, 'id'>): Promise<Product>;
  updateProduct(id: string, data: Partial<Product>): Promise<Product | null>;
  deleteProduct(id: string): Promise<boolean>;

  // Orders
  getOrders(filters?: { status?: string; customerId?: string }): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  getOrderByNumber(orderNumber: string): Promise<Order | null>;
  createOrder(data: CreateOrderInput): Promise<Order>;
  updateOrderStatus(id: string, status: Order['status'], tracking?: { trackingNumber?: string; courierName?: string }): Promise<Order | null>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomerByEmail(email: string): Promise<Customer | null>;
  createOrUpdateCustomer(data: Partial<Customer> & { email: string }): Promise<Customer>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  createCategory(data: Omit<Category, 'id' | 'createdAt'>): Promise<Category>;
  updateCategory(id: string, data: Partial<Category>): Promise<Category | null>;
  deleteCategory(id: string): Promise<boolean>;

  // Admin users
  getAdminByEmail(email: string): Promise<AdminUser | null>;

  // Reviews
  getReviewsBySlug(slug: string): Promise<CustomerReview[]>;
  createReview(data: Omit<CustomerReview, 'id'>): Promise<CustomerReview>;

  // Media
  getMediaItems(folder?: string): Promise<MediaItem[]>;
  createMediaItem(data: Omit<MediaItem, 'id' | 'createdAt'>): Promise<MediaItem>;
  deleteMediaItem(id: string): Promise<boolean>;

  // Content
  getContent(page: string, section?: string): Promise<SiteContent[]>;
  upsertContent(page: string, section: string, data: Record<string, unknown>): Promise<SiteContent>;
}
