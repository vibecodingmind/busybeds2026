export interface UserSession {
  userId: string;
  email: string;
  role: 'traveler' | 'owner' | 'manager' | 'admin' | 'corporate';
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  websiteUrl?: string;
  emailVerified: boolean;
  language: string;
  timezone: string;
  displayCurrency: string;
  referralCode?: string;
  createdAt: string;
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  category: string;
  descriptionShort: string;
  descriptionLong: string;
  starRating: number;
  amenities: string[];
  vibeTags: string[];
  discountRules: unknown[];
  websiteUrl?: string;
  phone?: string;
  address?: string;
  status: string;
  partnershipStatus: string;
  tier: string;
  isFeatured: boolean;
  featuredUntil?: string;
  coverImage?: string;
  images: string[];
  discountPercent: number;
  couponValidDays: number;
  geoLat?: number;
  geoLng?: number;
  lastCouponAt?: string;
  // Google Places import fields
  phone?: string;
  address?: string;
  googlePlaceId?: string;
  importSource?: string;
  isPartner: boolean;
  partnerDiscountPercent?: number;
  importedAt?: string;
  roomTypes?: RoomType[];
  reviews?: Review[];
  avgRating?: number;
  reviewCount?: number;
}

export interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  bedType: string;
  sizeSqm?: number;
  pricePerNight: number;
  maxGuests: number;
  description?: string;
  images: string[];
  isActive: boolean;
}

export interface Review {
  id: string;
  hotelId: string;
  userId?: string;
  rating: number;
  title: string;
  body: string;
  isVerified: boolean;
  isApproved: boolean;
  ownerReply?: string;
  repliedAt?: string;
  source: string;
  createdAt: string;
  user?: { fullName: string; avatar?: string };
}

export interface Coupon {
  id: string;
  code: string;
  qrDataUrl?: string;
  userId: string;
  hotelId: string;
  subscriptionId: string;
  discountPercent: number;
  discountRuleName?: string;
  guestName?: string;
  status: 'active' | 'redeemed' | 'expired' | 'cancelled';
  generatedAt: string;
  expiresAt: string;
  startTime?: string;
  endTime?: string;
  redeemedAt?: string;
  priceUsd?: number;
  priceTzs?: number;
  exchangeRate?: number;
  hotel?: { name: string; city: string; coverImage?: string; slug: string };
}

export interface SubscriptionPackage {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnual?: number;
  durationDays: number;
  couponLimitPerPeriod: number;
  tier: string;
  isActive: boolean;
  canBookStandard: boolean;
  canBookPremium: boolean;
  canBookLuxury: boolean;
  maxPremiumPerPeriod: number;
  maxLuxuryPerPeriod: number;
}

export interface Subscription {
  id: string;
  userId: string;
  packageId: string;
  status: string;
  billingCycle: string;
  startsAt: string;
  expiresAt: string;
  package?: SubscriptionPackage;
}

export interface FlashDeal {
  id: string;
  hotelId: string;
  title: string;
  discountPercent: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  hotel?: { name: string; city: string; coverImage?: string };
}

export interface StayRequest {
  id: string;
  travelerId: string;
  hotelId: string;
  roomTypeId: string;
  managerId?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  status: 'pending' | 'approved' | 'declined' | 'cancelled' | 'completed';
  depositAmount?: number;
  depositPaid: boolean;
  platformFee?: number;
  notes?: string;
  declineReason?: string;
  createdAt: string;
  hotel?: { name: string; city: string; coverImage?: string };
  roomType?: { name: string; pricePerNight: number };
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  hotelId?: string;
  stayRequestId?: string;
  content: string;
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: string;
  sender?: { fullName: string; avatar?: string };
  receiver?: { fullName: string; avatar?: string };
}

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface LoyaltyData {
  points: number;
  lifetime: number;
  transactions: PointTransaction[];
}

export interface PointTransaction {
  id: string;
  userId: string;
  points: number;
  type: string;
  description: string;
  createdAt: string;
}

export interface GiftCard {
  id: string;
  code: string;
  amount: number;
  balance: number;
  purchasedById?: string;
  redeemedById?: string;
  recipientEmail?: string;
  recipientName?: string;
  message?: string;
  isActive: boolean;
  expiresAt?: string;
  purchasedAt: string;
  redeemedAt?: string;
}

export interface Badge {
  id: string;
  userId: string;
  type: string;
  awardedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  description?: string;
  paidAt?: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  authorId: string;
  status: string;
  publishedAt?: string;
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalHotels: number;
  totalCoupons: number;
  totalRedemptions: number;
  monthlyRevenue: number;
}

export interface AdminAnalytics {
  totalUsers: number;
  activeSubscriptions: number;
  totalHotels: number;
  totalCoupons: number;
  totalRedemptions: number;
  monthlyRevenue: number;
  usersToday: number;
  couponsToday: number;
  redemptionsToday: number;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  category: string;
  isActive: boolean;
}

export interface CouponBlackout {
  id: string;
  hotelId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  createdAt: string;
}

export interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  pendingEarnings: number;
  confirmedEarnings: number;
  referrals: { id: string; referredId?: string; usedAt?: string; createdAt: string }[];
}

export interface Favorite {
  id: string;
  userId: string;
  hotelId: string;
  hotel?: Hotel;
  createdAt: string;
}
