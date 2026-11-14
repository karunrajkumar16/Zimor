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
  isFeatured: boolean;
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
    weight: string;
  };
  suitableProfessions: string[];
  giftingOccasions: string[];
  laptopCompatibility: string;
}

export interface GiftingOccasion {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  recommendedSlugs: string[];
  image: string;
  giftBoxIncluded: boolean;
  idealFor: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  isGiftWrapped?: boolean;
  giftMessage?: string;
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
  giftWrapFee: number;
  total: number;
  status: 'Processing' | 'Confirmed' | 'Dispatched' | 'Out for Delivery' | 'Delivered';
  trackingNumber: string;
  courierName: string;
  estimatedDelivery: string;
}

