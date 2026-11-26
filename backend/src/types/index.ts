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
  sku?: string;
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

export interface TrackingScan {
  date: string;
  status: string;
  activity: string;
  location: string;
}

export interface OrderAuditLog {
  timestamp: string;
  actor: string;
  action: string;
  message: string;
  metadata?: any;
}

export interface OrderReturnItem {
  productId: string;
  name: string;
  slug?: string;
  color?: string;
  size?: string;
  quantityOrdered: number;
  quantityRequested: number;
  quantityReceived: number;
  quantityApproved: number;
  quantityRejected: number;
  inspectionStatus: 'pending' | 'passed' | 'failed' | 'partially_passed';
  inspectionNotes?: string;
  rejectionReason?: string;
  inventoryRestocked: boolean;
  restockedQuantity: number;
  restockedAt?: string | Date;
  quarantined: boolean;
  quarantinedQuantity: number;
  quarantinedAt?: string | Date;
  quarantineReason?: string;
  quarantineReleasedQuantity?: number;
}

export interface OrderReturnRequest {
  status: 'none' | 'requested' | 'approved' | 'rejected' | 'completed';
  type?: 'return' | 'exchange';
  reason?: string;
  details?: string;
  imageUrls?: string[];
  requestedAt?: string | Date;
  adminNotes?: string;
  adminDecidedAt?: string | Date;
  adminDecidedBy?: string;
  refundInitiated?: boolean;
  refundId?: string;
  refundAmount?: number;
  physicalItemReceived?: boolean;
  physicalItemReceivedAt?: string | Date;
  inspectionStatus?: 'pending' | 'passed' | 'failed' | 'partially_passed' | 'not_applicable';
  inspectedAt?: string | Date;
  inspectedBy?: string;
  inspectionNotes?: string;
  inventoryRestocked?: boolean;
  inventoryRestockedAt?: string | Date;
  items?: OrderReturnItem[];
  totalRequestedQuantity?: number;
  totalRestockedQuantity?: number;
  totalQuarantinedQuantity?: number;
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
    color?: string;
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
  status: 'Pending' | 'Paid' | 'Processing' | 'Confirmed' | 'Dispatched' | 'In Transit' | 'Shipped' | 'Picked Up' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Failed' | 'Delayed' | 'RTO' | 'Returned';
  paymentStatus?: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  paymentMode?: 'test' | 'live';
  fulfillmentStatus?: 'pending_payment' | 'eligible' | 'processing' | 'fulfilled' | 'partially_fulfilled' | 'failed' | 'held' | 'cancelled';
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
  isDemoLogistics?: boolean;
  demoExpiresAt?: Date;
  returnRequest?: OrderReturnRequest;
  // Shiprocket Logistics Integration Fields
  shiprocketOrderId?: string;
  shiprocketShipmentId?: number;
  shiprocketStatus?: string;
  shiprocketStatusCode?: number;
  awbCode?: string;
  courierPartner?: string;
  courierCompanyId?: number;
  shippingCharges?: number;
  shippingLabelUrl?: string;
  pickupLocation?: string;
  trackingHistory?: TrackingScan[];
  lastSyncedAt?: Date | string;
  shiprocketError?: string;
  auditLogs?: OrderAuditLog[];
  shiprocketWebhookEventsProcessed?: string[];
}

export interface AboutMediaSection {
  id: string; // 'brandOverview' | 'brandStory' | 'brandVision' | 'brandMission' | 'brandValues'
  title: string;
  subtitle: string;
  description: string;
  recommendedAspect: string;
  recommendedResolution: string;
  url: string;
  publicId?: string;
  alt: string;
  width?: number;
  height?: number;
  updatedAt?: string;
  updatedBy?: string;
}

export type AboutMediaMapping = Record<string, AboutMediaSection>;

export interface VisualMediaItem {
  id: string;
  scope: 'homepage' | 'about';
  sectionGroup: string;
  title: string;
  label: string;
  description: string;
  recommendedAspect: string;
  recommendedResolution: string;
  url: string;
  publicId?: string;
  alt: string;
  cloudinaryFolder: string;
  mediaType?: 'image' | 'video';
  width?: number;
  height?: number;
  updatedAt?: string;
  updatedBy?: string;
}

export type VisualMediaMapping = Record<string, VisualMediaItem>;

