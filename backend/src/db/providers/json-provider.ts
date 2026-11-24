// /src/lib/db/providers/json-provider.ts
// Development Data Provider: JSON storage for local development
// Note: This is strictly for development and local testing.
// In production, MongoDB with Mongoose is used when USE_MOCK_DB=false.

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import {
  DatabaseProvider,
  Product,
  Order,
  CustomerReview,
  AdminUser,
  Customer,
  Category,
  MediaItem,
  SiteContent,
  CreateOrderInput,
} from './interface.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = fs.existsSync(path.resolve(__dirname, '../seed'))
  ? path.resolve(__dirname, '../seed')
  : path.resolve(process.cwd(), 'src/db/seed');

function readJsonFile<T>(filename: string, defaultValue: T): T {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return defaultValue;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error(`[JSON DB] Error reading ${filename}:`, error);
    return defaultValue;
  }
}

function writeJsonFile<T>(filename: string, data: T): void {
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`[JSON DB] Error writing ${filename}:`, error);
  }
}

export class JsonDatabaseProvider implements DatabaseProvider {
  // ==========================================
  // PRODUCTS
  // ==========================================
  async getProducts(filters?: {
    category?: string;
    isFeatured?: boolean;
    isPublished?: boolean;
    search?: string;
  }): Promise<Product[]> {
    let products = readJsonFile<Product[]>('products.json', []);

    if (filters?.category && filters.category !== 'all') {
      products = products.filter((p) => p.category === filters.category);
    }
    if (filters?.isFeatured !== undefined) {
      products = products.filter((p) => (filters.isFeatured ? p.isFeatured === true : p.isFeatured !== true));
    }
    if (filters?.isPublished !== undefined) {
      products = products.filter((p) => (filters.isPublished ? p.isPublished !== false : p.isPublished === false));
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q))
      );
    }

    return products;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((p) => p.slug === slug) || null;
  }

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((p) => p.id === id || p.slug === id) || null;
  }

  async createProduct(data: Omit<Product, 'id'>): Promise<Product> {
    const products = await this.getProducts();
    if (data.sku) {
      const sanitizedSku = data.sku.trim().toUpperCase();
      data.sku = sanitizedSku;
      const existing = products.find((p) => p.sku && p.sku.toUpperCase() === sanitizedSku);
      if (existing) {
        throw new Error(`Product Code (SKU) "${sanitizedSku}" is already assigned to another product.`);
      }
    }
    const newProduct: Product = {
      ...data,
      id: `zimor-${data.slug || crypto.randomUUID()}`,
    };
    products.push(newProduct);
    writeJsonFile('products.json', products);
    return newProduct;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
    const products = await this.getProducts();
    const idx = products.findIndex((p) => p.id === id || p.slug === id);
    if (idx === -1) return null;

    if (data.sku) {
      const sanitizedSku = data.sku.trim().toUpperCase();
      data.sku = sanitizedSku;
      const existing = products.find(
        (p) => (p.id !== id && p.slug !== id) && p.sku && p.sku.toUpperCase() === sanitizedSku
      );
      if (existing) {
        throw new Error(`Product Code (SKU) "${sanitizedSku}" is already assigned to another product.`);
      }
    }

    products[idx] = { ...products[idx], ...data };
    writeJsonFile('products.json', products);
    return products[idx];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const products = await this.getProducts();
    const filtered = products.filter((p) => p.id !== id && p.slug !== id);
    if (filtered.length === products.length) return false;
    writeJsonFile('products.json', filtered);
    return true;
  }

  // ==========================================
  // ORDERS
  // ==========================================
  async getOrders(filters?: { status?: string; customerId?: string }): Promise<Order[]> {
    let orders = readJsonFile<Order[]>('orders.json', []);
    if (filters?.status && filters.status !== 'all') {
      orders = orders.filter((o) => o.status.toLowerCase() === filters.status!.toLowerCase());
    }
    return orders;
  }

  async getOrderById(id: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find((o) => o.id === id || o.orderNumber === id) || null;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find((o) => o.orderNumber === orderNumber) || null;
  }

  async createOrder(data: CreateOrderInput): Promise<Order> {
    const orders = await this.getOrders();
    const orderNumber = `ZMR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      items: data.items.map((item) => ({
        productId: item.productId,
        name: item.productName,
        slug: item.slug,
        image: item.image || '/products/delo-1.webp',
        size: 'Standard',
        price: item.price,
        quantity: item.quantity,
      })),
      shippingAddress: {
        fullName: data.shippingAddress.fullName || data.customer.name,
        addressLine1: data.shippingAddress.line1,
        addressLine2: data.shippingAddress.line2,
        city: data.shippingAddress.city,
        state: data.shippingAddress.state,
        pincode: data.shippingAddress.pincode,
        phone: data.shippingAddress.phone || data.customer.phone,
      },
      shippingMethod: data.shipping > 0 ? 'Priority Express' : 'Complimentary Air Express',
      paymentMethod: data.paymentMethod || 'Online (Razorpay / Mock)',
      subtotal: data.subtotal,
      discount: data.discount,
      shippingFee: data.shipping,
      total: data.total,
      status: 'Confirmed',
      trackingNumber: `ZMR-EXP-${Math.floor(1000000 + Math.random() * 9000000)}`,
      courierName: 'BlueDart Express',
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    orders.unshift(newOrder);
    writeJsonFile('orders.json', orders);

    // Also update or register customer
    if (data.customer.email) {
      await this.createOrUpdateCustomer({
        email: data.customer.email,
        name: data.customer.name,
        phone: data.customer.phone,
        orders: [newOrder.id],
      });
    }

    return newOrder;
  }

  async updateOrderStatus(
    id: string,
    status: Order['status'],
    tracking?: { trackingNumber?: string; courierName?: string }
  ): Promise<Order | null> {
    const orders = await this.getOrders();
    const idx = orders.findIndex((o) => o.id === id || o.orderNumber === id);
    if (idx === -1) return null;

    orders[idx].status = status;
    if (tracking?.trackingNumber) orders[idx].trackingNumber = tracking.trackingNumber;
    if (tracking?.courierName) orders[idx].courierName = tracking.courierName;

    writeJsonFile('orders.json', orders);
    return orders[idx];
  }

  // ==========================================
  // CUSTOMERS
  // ==========================================
  async getCustomers(): Promise<Customer[]> {
    return readJsonFile<Customer[]>('customers.json', []);
  }

  async getCustomerByEmail(email: string): Promise<Customer | null> {
    const customers = await this.getCustomers();
    return customers.find((c) => c.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async getCustomerByGoogleId(googleId: string): Promise<Customer | null> {
    const customers = await this.getCustomers();
    return customers.find((c) => c.googleId === googleId) || null;
  }

  async createOrUpdateCustomer(data: Partial<Customer> & { email: string }): Promise<Customer> {
    const customers = await this.getCustomers();
    const idx = customers.findIndex((c) => c.email.toLowerCase() === data.email.toLowerCase());
    const now = new Date().toISOString();

    if (idx !== -1) {
      const existing = customers[idx];
      const updated: Customer = {
        ...existing,
        ...data,
        name: data.name || existing.name,
        phone: data.phone || existing.phone,
        orders: Array.from(new Set([...existing.orders, ...(data.orders || [])])),
        updatedAt: now,
      };
      customers[idx] = updated;
      writeJsonFile('customers.json', customers);
      return updated;
    }

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      email: data.email,
      name: data.name || 'Valued Client',
      phone: data.phone,
      addresses: data.addresses || [],
      orders: data.orders || [],
      createdAt: now,
      updatedAt: now,
    };
    customers.push(newCust);
    writeJsonFile('customers.json', customers);
    return newCust;
  }

  // ==========================================
  // CATEGORIES
  // ==========================================
  async getCategories(): Promise<Category[]> {
    return readJsonFile<Category[]>('categories.json', []);
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const categories = await this.getCategories();
    return categories.find((c) => c.slug === slug) || null;
  }

  async createCategory(data: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    const categories = await this.getCategories();
    const newCat: Category = {
      ...data,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    categories.push(newCat);
    writeJsonFile('categories.json', categories);
    return newCat;
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category | null> {
    const categories = await this.getCategories();
    const idx = categories.findIndex((c) => c.id === id || c.slug === id);
    if (idx === -1) return null;

    categories[idx] = { ...categories[idx], ...data };
    writeJsonFile('categories.json', categories);
    return categories[idx];
  }

  async deleteCategory(id: string): Promise<boolean> {
    const categories = await this.getCategories();
    const filtered = categories.filter((c) => c.id !== id && c.slug !== id);
    if (filtered.length === categories.length) return false;
    writeJsonFile('categories.json', filtered);
    return true;
  }

  // ==========================================
  // ADMIN USERS
  // ==========================================
  async getAdminByEmail(email: string): Promise<AdminUser | null> {
    const admins = readJsonFile<AdminUser[]>('admins.json', []);
    return admins.find((a) => a.email.toLowerCase() === email.toLowerCase()) || null;
  }

  // ==========================================
  // REVIEWS
  // ==========================================
  async getReviewsBySlug(slug: string): Promise<CustomerReview[]> {
    const reviews = readJsonFile<CustomerReview[]>('reviews.json', []);
    return reviews.filter((r) => r.productSlug === slug);
  }

  async createReview(data: Omit<CustomerReview, 'id'>): Promise<CustomerReview> {
    const reviews = readJsonFile<CustomerReview[]>('reviews.json', []);
    const newReview: CustomerReview = {
      ...data,
      id: `rev-${Date.now()}`,
    };
    reviews.push(newReview);
    writeJsonFile('reviews.json', reviews);
    return newReview;
  }

  // ==========================================
  // MEDIA ITEMS
  // ==========================================
  async getMediaItems(folder?: string): Promise<MediaItem[]> {
    const items = readJsonFile<MediaItem[]>('media.json', []);
    if (folder) {
      return items.filter((i) => i.folder.startsWith(folder));
    }
    return items;
  }

  async createMediaItem(data: Omit<MediaItem, 'id' | 'createdAt'>): Promise<MediaItem> {
    const items = await this.getMediaItems();
    const newItem: MediaItem = {
      ...data,
      id: `med-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    items.unshift(newItem);
    writeJsonFile('media.json', items);
    return newItem;
  }

  async deleteMediaItem(id: string): Promise<boolean> {
    const items = await this.getMediaItems();
    const filtered = items.filter((i) => i.id !== id && i.publicId !== id);
    if (filtered.length === items.length) return false;
    writeJsonFile('media.json', filtered);
    return true;
  }

  // ==========================================
  // CONTENT MANAGEMENT
  // ==========================================
  async getContent(page: string, section?: string): Promise<SiteContent[]> {
    const all = readJsonFile<SiteContent[]>('content.json', []);
    return all.filter((c) => c.page === page && (!section || c.section === section));
  }

  async upsertContent(
    page: string,
    section: string,
    data: Record<string, unknown>
  ): Promise<SiteContent> {
    const all = readJsonFile<SiteContent[]>('content.json', []);
    const idx = all.findIndex((c) => c.page === page && c.section === section);
    const updated: SiteContent = {
      page,
      section,
      data,
      updatedAt: new Date().toISOString(),
    };

    if (idx !== -1) {
      all[idx] = updated;
    } else {
      all.push(updated);
    }

    writeJsonFile('content.json', all);
    return updated;
  }
}
