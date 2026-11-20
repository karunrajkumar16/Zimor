export interface ProductColor {
  name: string;
  hex: string;
  imageUrl?: string;
}

export interface ProductImage {
  url: string;
  publicId?: string;
  alt: string;
}

export interface CustomerReview {
  id: string;
  userName: string;
  userCity?: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  date: string;
  productSlug: string;
  productName: string;
  media?: {
    type: 'photo' | 'video';
    url: string;
    thumbnailUrl?: string;
    caption?: string;
  }[];
  helpfulCount?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  price: number;
  compareAtPrice: number;
  category: 'tote-bags' | 'laptop-bags' | 'shoulder-bags';
  categoryLabel: string;
  colors: ProductColor[];
  defaultColor: string;
  sizes: string[];
  stock: number;
  isPublished?: boolean;
  isFeatured: boolean;
  isComingSoon?: boolean;
  averageRating: number;
  numReviews: number;
  images: ProductImage[];
  features: string[];
  material: string[];
  careInstructions: string[];
  dimensions: {
    length: string;
    height: string;
    width: string;
    strapDrop: string;
    weight?: string;
  };
  suitableProfessions: string[];
  laptopCompatibility: string;
  whyYoullLoveIt?: string;
  strap?: string;
  netQuantity?: string;
  shippingPolicy?: string[];
  returnPolicy?: string[];
  moreInformation?: {
    importedAndMarketedBy?: string;
    customerCare?: string;
    countryOfOrigin?: string;
  };
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: {
    productId: string;
    name: string;
    slug: string;
    image: string;
    color: string;
    size: string;
    price: number;
    quantity: number;
  }[];
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  shippingMethod: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  status: 'Pending' | 'Paid' | 'Processing' | 'Confirmed' | 'Dispatched' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Failed';
  paymentStatus?: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  paymentMode?: 'test' | 'live';
  amountPaid?: number;
  amountRefunded?: number;
  refundId?: string;
  webhookEventsProcessed?: string[];
  inventoryDeducted?: boolean;
  inventoryRestored?: boolean;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  promoCode?: string;
  trackingNumber: string;
  courierName: string;
  estimatedDelivery: string;
  customerId?: string;
  customerEmail?: string;
  isDemo?: boolean;
  demoExpiresAt?: Date;
}

