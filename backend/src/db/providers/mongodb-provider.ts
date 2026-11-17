// /src/lib/db/providers/mongodb-provider.ts
// Production MongoDB Database Provider using Mongoose
// Active when USE_MOCK_DB=false and MONGODB_URI is provided

import mongoose from 'mongoose';
import { connectToDatabase } from '../mongodb';
import { ProductModel } from '../models/Product';
import { CategoryModel } from '../models/Category';
import { OrderModel } from '../models/Order';
import { CustomerModel } from '../models/Customer';
import { SiteContentModel } from '../models/SiteContent';
import { MediaItemModel } from '../models/MediaItem';
import { AdminUserModel } from '../models/AdminUser';
import { Product, Order, CustomerReview } from '../../types/index.js';
import {
  DatabaseProvider,
  AdminUser,
  Customer,
  Category,
  MediaItem,
  SiteContent,
  CreateOrderInput,
} from './interface';

export class MongoDatabaseProvider implements DatabaseProvider {
  // PRODUCTS
  async getProducts(filters?: {
    category?: string;
    isFeatured?: boolean;
    isPublished?: boolean;
    search?: string;
  }): Promise<Product[]> {
    await connectToDatabase();
    const query: Record<string, unknown> = {};

    if (filters?.category && filters.category !== 'all') {
      query.category = filters.category;
    }
    if (filters?.isFeatured !== undefined) {
      query.isFeatured = filters.isFeatured;
    }
    if (filters?.search) {
      const regex = new RegExp(filters.search, 'i');
      query.$or = [{ name: regex }, { description: regex }, { tagline: regex }, { slug: regex }];
    }

    const docs = await ProductModel.find(query).lean();
    return docs.map((d: any) => ({
      ...d,
      id: d._id ? d._id.toString() : d.id,
    })) as Product[];
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    await connectToDatabase();
    const doc = await ProductModel.findOne({ slug }).lean();
    if (!doc) return null;
    return { ...doc, id: (doc as any)._id?.toString() || (doc as any).id } as Product;
  }

  async getProductById(id: string): Promise<Product | null> {
    await connectToDatabase();
    let doc = null;
    if (mongoose.isValidObjectId(id)) {
      doc = await ProductModel.findById(id).lean();
    }
    if (!doc) {
      doc = await ProductModel.findOne({ $or: [{ slug: id }, { id }] }).lean();
    }
    if (!doc) return null;
    return { ...doc, id: (doc as any)._id?.toString() || (doc as any).id } as Product;
  }

  async createProduct(data: Omit<Product, 'id'>): Promise<Product> {
    await connectToDatabase();
    const created = await ProductModel.create(data);
    const json = created.toJSON();
    return json as Product;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
    await connectToDatabase();
    const updated = await ProductModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!updated) return null;
    return { ...updated, id: (updated as any)._id?.toString() || (updated as any).id } as Product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    await connectToDatabase();
    const res = await ProductModel.findByIdAndDelete(id);
    return !!res;
  }

  // ORDERS
  async getOrders(filters?: { status?: string; customerId?: string }): Promise<Order[]> {
    await connectToDatabase();
    const query: Record<string, unknown> = {};
    if (filters?.status && filters.status !== 'all') {
      query.status = filters.status;
    }
    const docs = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
    return docs.map((d: any) => ({
      ...d,
      id: d._id ? d._id.toString() : d.id,
    })) as Order[];
  }

  async getOrderById(id: string): Promise<Order | null> {
    await connectToDatabase();
    const doc = await OrderModel.findById(id).lean();
    if (!doc) return null;
    return { ...doc, id: (doc as any)._id?.toString() || (doc as any).id } as Order;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    await connectToDatabase();
    const doc = await OrderModel.findOne({ orderNumber }).lean();
    if (!doc) return null;
    return { ...doc, id: (doc as any)._id?.toString() || (doc as any).id } as Order;
  }

  async createOrder(data: CreateOrderInput): Promise<Order> {
    await connectToDatabase();
    const orderNumber = `ZMR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = await OrderModel.create({
      orderNumber,
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      items: data.items.map((i) => ({
        productId: i.productId,
        name: i.productName,
        slug: i.slug,
        image: i.image || '/products/delo-1.webp',
        color: i.selectedColor,
        size: 'Standard',
        price: i.price,
        quantity: i.quantity,
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
    });

    return newOrder.toJSON() as Order;
  }

  async updateOrderStatus(
    id: string,
    status: Order['status'],
    tracking?: { trackingNumber?: string; courierName?: string }
  ): Promise<Order | null> {
    await connectToDatabase();
    const updateData: Record<string, unknown> = { status };
    if (tracking?.trackingNumber) updateData.trackingNumber = tracking.trackingNumber;
    if (tracking?.courierName) updateData.courierName = tracking.courierName;

    const doc = await OrderModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!doc) return null;
    return { ...doc, id: (doc as any)._id?.toString() || (doc as any).id } as Order;
  }

  // CUSTOMERS
  async getCustomers(): Promise<Customer[]> {
    await connectToDatabase();
    const docs = await CustomerModel.find().lean();
    return docs.map((d: any) => ({
      ...d,
      id: d._id ? d._id.toString() : d.id,
    })) as Customer[];
  }

  async getCustomerByEmail(email: string): Promise<Customer | null> {
    await connectToDatabase();
    const doc = await CustomerModel.findOne({ email }).lean();
    if (!doc) return null;
    return { ...doc, id: (doc as any)._id?.toString() || (doc as any).id } as Customer;
  }

  async createOrUpdateCustomer(data: Partial<Customer> & { email: string }): Promise<Customer> {
    await connectToDatabase();
    const existing = await CustomerModel.findOne({ email: data.email });
    if (existing) {
      if (data.name) existing.name = data.name;
      if (data.phone) existing.phone = data.phone;
      if (data.orders) {
        existing.orders = Array.from(new Set([...existing.orders, ...data.orders]));
      }
      await existing.save();
      return existing.toJSON() as Customer;
    }

    const created = await CustomerModel.create(data);
    return created.toJSON() as Customer;
  }

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    await connectToDatabase();
    const docs = await CategoryModel.find().lean();
    return docs.map((d: any) => ({
      ...d,
      id: d._id ? d._id.toString() : d.id,
    })) as Category[];
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    await connectToDatabase();
    const doc = await CategoryModel.findOne({ slug }).lean();
    if (!doc) return null;
    return { ...doc, id: (doc as any)._id?.toString() || (doc as any).id } as Category;
  }

  async createCategory(data: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    await connectToDatabase();
    const created = await CategoryModel.create(data);
    return created.toJSON() as Category;
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category | null> {
    await connectToDatabase();
    const doc = await CategoryModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!doc) return null;
    return { ...doc, id: (doc as any)._id?.toString() || (doc as any).id } as Category;
  }

  async deleteCategory(id: string): Promise<boolean> {
    await connectToDatabase();
    const res = await CategoryModel.findByIdAndDelete(id);
    return !!res;
  }

  // ADMIN
  async getAdminByEmail(email: string): Promise<AdminUser | null> {
    await connectToDatabase();
    const doc = await AdminUserModel.findOne({ email }).lean();
    if (!doc) return null;
    return { ...doc, id: (doc as any)._id?.toString() || (doc as any).id } as AdminUser;
  }

  // REVIEWS (Mock/Empty for now in Mongo)
  async getReviewsBySlug(_slug: string): Promise<CustomerReview[]> {
    return [];
  }

  async createReview(data: Omit<CustomerReview, 'id'>): Promise<CustomerReview> {
    return { ...data, id: `rev-${Date.now()}` };
  }

  // MEDIA
  async getMediaItems(folder?: string): Promise<MediaItem[]> {
    await connectToDatabase();
    const query = folder ? { folder: new RegExp(`^${folder}`) } : {};
    const docs = await MediaItemModel.find(query).sort({ createdAt: -1 }).lean();
    return docs.map((d: any) => ({
      ...d,
      id: d._id ? d._id.toString() : d.id,
    })) as MediaItem[];
  }

  async createMediaItem(data: Omit<MediaItem, 'id' | 'createdAt'>): Promise<MediaItem> {
    await connectToDatabase();
    const created = await MediaItemModel.create(data);
    return created.toJSON() as MediaItem;
  }

  async deleteMediaItem(id: string): Promise<boolean> {
    await connectToDatabase();
    const res = await MediaItemModel.findByIdAndDelete(id);
    return !!res;
  }

  // CONTENT
  async getContent(page: string, section?: string): Promise<SiteContent[]> {
    await connectToDatabase();
    const query: Record<string, unknown> = { page };
    if (section) query.section = section;
    const docs = await SiteContentModel.find(query).lean();
    return docs.map((d: any) => ({
      page: d.page,
      section: d.section,
      data: d.data,
      updatedAt: d.updatedAt,
    })) as SiteContent[];
  }

  async upsertContent(
    page: string,
    section: string,
    data: Record<string, unknown>
  ): Promise<SiteContent> {
    await connectToDatabase();
    const doc = await SiteContentModel.findOneAndUpdate(
      { page, section },
      { data, updatedAt: new Date().toISOString() },
      { upsert: true, new: true }
    ).lean();

    return {
      page: doc.page,
      section: doc.section,
      data: doc.data,
      updatedAt: doc.updatedAt,
    };
  }
}
