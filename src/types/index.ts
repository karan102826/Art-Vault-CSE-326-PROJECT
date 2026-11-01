export type UserRole = 'buyer' | 'admin';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  createdAt?: string;
}

export type LicenseTier = 'personal' | 'commercial';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  artworkCount?: number;
}

export interface Artwork {
  id: number;
  title: string;
  slug: string;
  description: string;
  artistName: string;
  artistBio?: string;
  artistAvatar?: string;
  categoryId: number;
  categoryName?: string;
  categorySlug?: string;
  thumbnailUrl: string;
  previewImages: string[];
  fileFormats: string;
  resolution: string;
  fileSizeMb: number;
  downloadUrl: string;
  basePricePersonal: number;
  priceCommercial: number;
  averageRating: number;
  reviewCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  id: number;
  userId: number;
  artworkId: number;
  licenseTier: LicenseTier;
  artwork: Artwork;
  createdAt: string;
}

export interface WishlistItem {
  id: number;
  userId: number;
  artworkId: number;
  artwork: Artwork;
  createdAt: string;
}

export interface Review {
  id: number;
  artworkId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  artworkId: number;
  licenseTier: LicenseTier;
  pricePaid: number;
  downloadToken: string;
  downloadCount: number;
  artwork: Artwork;
  createdAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  subtotal: number;
  tax: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  billingName: string;
  billingEmail: string;
  items: OrderItem[];
  createdAt: string;
}

export interface FilterOptions {
  searchQuery: string;
  categorySlug: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'top_rated';
  page: number;
  limit: number;
}
