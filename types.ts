
export enum ListingType {
  REGULAR = 'REGULAR',
  EMERGENCY = 'EMERGENCY'
}

export enum ListingStatus {
  ACTIVE = 'ACTIVE',
  PENDING_REVIEW = 'PENDING_REVIEW',
  OFFER_MADE = 'OFFER_MADE',
  SOLD = 'SOLD',
  REJECTED = 'REJECTED'
}

export type Gender = 'male' | 'female' | 'other' | 'none';

export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  SYSTEM = 'system',
  WARNING = 'warning',
  OFFER = 'offer',
  ORDER = 'order'
}

export enum NotificationPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  relatedContent?: {
    type: 'listing' | 'order' | 'message';
    id: string;
    preview?: string;
  };
  read: boolean;
  pinned: boolean;
  timestamp: number;
}

export interface VisualAnalysis {
  brand?: string;
  detectedCondition: 'new' | 'like_new' | 'used' | 'worn';
  authenticityConfidence: number;
  visualRedFlags: string[];
  descriptionMatch: boolean;
}

// Added missing MarketAnalysis type used by geminiService for pricing recommendations
export interface MarketAnalysis {
  suggestedPrice: number;
  confidence: number;
  reasoning: string;
  competitorPrices: {
    source: string;
    price: number;
  }[];
}

// Added missing BoostTier type used by pricingService for promotion tiers
export interface BoostTier {
  id: string;
  name: string;
  minPriceUSD: number;
  maxPriceUSD: number;
  percent: number;
  minUSD: number;
  maxUSD: number | null;
  durationDays: number;
  features: string[];
}

// Added missing CalculatedFee type used by pricingService and PromoteModal
export interface CalculatedFee {
  feeTRY: number;
  feeUSD: number;
  tier: BoostTier;
  exchangeRate: number;
  isLuxury: boolean;
  isEmergency: boolean;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  brand?: string;
  condition: 'new' | 'like_new' | 'used' | 'worn';
  type: ListingType;
  status: ListingStatus;
  imageUrls: string[];
  sellerId: string;
  createdAt: number;
  updatedAt: number;
  visualAnalysis?: VisualAnalysis;
  boostedUntil?: number;
  offerAmount?: number;
}

export interface Review {
  id: string;
  sellerId: string;
  buyerId: string;
  rating: number;
  comment: string;
  reviewerName: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  balance: number;
  joinDate: number;
  bio?: string;
  gender?: Gender;
  birthDate?: string;
  reviews?: Review[];
  totalSales?: number;
  followersCount?: number;
}

export enum OrderStatus {
  PREPARING = 'PREPARING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface Order {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  price: number;
  shippingInfo?: {
    carrier: string;
    trackingCode: string;
  };
  isSystemCancelled?: boolean;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  listingId: string;
  text: string;
  timestamp: number;
}
