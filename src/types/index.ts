// ─── Shared ──────────────────────────────────────────────────────────────────

export type UserType = 'provider' | 'customer' | 'admin';

export interface Location {
  state: string;
  city: string;
  address: string;
  landmark?: string;
  area?: string;
  coordinates?: { latitude: number; longitude: number };
}

// ─── Category (Admin-managed) ─────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  icon: string;         // icon name key
  color: string;
  description: string;
  isActive: boolean;
  providerCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export type AccountType = 'provider' | 'business';
export type KYCStatus = 'not_started' | 'submitted' | 'pending' | 'approved' | 'rejected';

export interface Provider {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  accountType: AccountType;
  profilePhoto: string | null;
  service: {
    category: string;
    experience: string;
    businessName: string;
    description: string;
  };
  location: Location & { radius: string; travelOutsideArea: boolean };
  profile: { photo: string | null; bio: string };
  business: {
    registrationNumber: string;
    ownerFullName: string;
    businessEmail: string;
    contactPhone: string;
    businessDescription: string;
    staffSize: string;
    landmark: string;
  };
  bankDetails: {
    accountName: string;
    bankName: string;
    accountNumber: string;
    isVerified: boolean;
  };
  kyc: {
    status: KYCStatus;
    documentUrl: string | null;
    selfieUrl: string | null;
    reviewedAt: string | null;
    rejectionReason: string | null;
  };
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isBanned: boolean;
  isAvailable: boolean;
  referralCode: string | null;
  rating: number;
  reviewCount: number;
  totalJobs: number;
  walletBalance: number;
  expoPushToken: string | null;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Customer ─────────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  birthday: string | null;
  profilePhoto: string | null;
  referralCode: string | null;
  agentCode: string | null;
  location: Location;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isAgent: boolean;
  isBanned: boolean;
  walletBalance: number;
  totalBookings: number;
  totalOrders: number;
  expoPushToken: string | null;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Service (Provider offering) ─────────────────────────────────────────────

export interface Service {
  id: string;
  providerId: string;
  providerName: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  duration: string;
  isActive: boolean;
  createdAt: string;
}

// ─── Booking ─────────────────────────────────────────────────────────────────

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'on-the-way'
  | 'arrived'
  | 'assessment'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type PaymentStatus = 'pending' | 'held' | 'released' | 'refunded';

export interface Booking {
  id: string;
  customer: { id: string; name: string; phone: string; avatar: string | null };
  provider: { id: string; name: string; phone: string; avatar: string | null };
  service: { name: string; price: number; category: string };
  description: string;
  scheduledDate: string;
  timeSlot: string;
  address: Location & { full: string };
  status: BookingStatus;
  serviceFee: number;
  platformFee: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paystackReference: string;
  cancelledBy?: 'customer' | 'provider' | 'admin';
  cancellationReason?: string;
  declineReason?: string;
  rating?: {
    overall: number;
    quality: number;
    punctuality: number;
    professionalism: number;
    communication: number;
    review: string;
  };
  timeline: { status: string; note: string; timestamp: string }[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── KYC ─────────────────────────────────────────────────────────────────────

export type DocumentType = 'nin' | 'bvn' | 'drivers_license' | 'international_passport' | 'voters_card';

export interface KYCRecord {
  id: string;
  userId: string;
  userName: string;
  userType: 'provider' | 'customer';
  documentType: DocumentType | null;
  documentNumber: string | null;
  documentImageUrl: string | null;
  selfieImageUrl: string | null;
  dojahJobId: string | null;
  dojahRequestId: string | null;
  livenessScore: number | null;
  faceMatchScore: number | null;
  faceMatchPassed: boolean | null;
  status: KYCStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Wallet & Transaction ─────────────────────────────────────────────────────

export interface Wallet {
  id: string;
  owner: string;
  ownerName: string;
  ownerType: 'customer' | 'provider';
  balance: number;
  escrowBalance: number;
  currency: string;
  isActive: boolean;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    isVerified: boolean;
  };
  createdAt: string;
}

export type TransactionType = 'credit' | 'debit' | 'escrow_hold' | 'escrow_release' | 'refund' | 'withdrawal';

export interface Transaction {
  id: string;
  walletId: string;
  owner: string;
  ownerName: string;
  ownerType: 'customer' | 'provider';
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  currency: string;
  description: string;
  reference: string;
  status: 'pending' | 'success' | 'failed';
  bookingId?: string;
  orderId?: string;
  createdAt: string;
}

// ─── Conversation & Message ───────────────────────────────────────────────────

export interface Participant {
  userId: string;
  actorType: UserType;
  name: string;
  avatar: string | null;
}

export interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage: {
    text: string;
    imageUrl: string | null;
    senderId: string;
    senderType: UserType;
    timestamp: string;
  } | null;
  unreadCounts: Record<string, number>;
  bookingId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MessageType = 'text' | 'image' | 'call_log' | 'system';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: UserType;
  senderName: string;
  senderAvatar: string | null;
  text: string;
  imageUrl: string | null;
  type: MessageType;
  readBy: string[];
  deletedAt: string | null;
  createdAt: string;
}

// ─── Call ─────────────────────────────────────────────────────────────────────

export type CallType = 'voice' | 'video';
export type CallStatus = 'ringing' | 'accepted' | 'rejected' | 'ended' | 'missed' | 'busy';

export interface CallLog {
  id: string;
  initiator: string;
  initiatorName: string;
  initiatorType: 'customer' | 'provider';
  recipient: string;
  recipientName: string;
  recipientType: 'customer' | 'provider';
  recipientPhone: string;
  type: CallType;
  status: CallStatus;
  conversationId: string | null;
  duration: number;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export type NotificationType = 'booking' | 'payment' | 'kyc' | 'chat' | 'call' | 'system' | 'promotion';

export interface Notification {
  id: string;
  recipient: string;
  recipientName: string;
  recipientType: UserType;
  title: string;
  body: string;
  type: NotificationType;
  data: Record<string, unknown>;
  isRead: boolean;
  readAt: string | null;
  pushStatus: 'pending' | 'sent' | 'failed' | 'not_applicable';
  pushError: string | null;
  createdAt: string;
}

// ─── Agent ───────────────────────────────────────────────────────────────────

export interface Agent {
  id: string;
  userId: string;
  userName: string;
  userType: 'customer' | 'provider';
  referralCode: string;
  registrationFee: number;
  isActive: boolean;
  earnings: number;
  pendingEarnings: number;
  totalCustomerReferrals: number;
  totalProviderReferrals: number;
  createdAt: string;
}

// ─── Marketplace ─────────────────────────────────────────────────────────────

export interface Store {
  id: string;
  providerId: string;
  providerName: string;
  name: string;
  description: string;
  category: string;
  coverImage: string | null;
  logo: string | null;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  totalOrders: number;
  createdAt: string;
}

export interface Product {
  id: string;
  storeId: string;
  storeName: string;
  providerId: string;
  providerName: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  category: string;
  images: string[];
  isActive: boolean;
  rating: number;
  reviewCount: number;
  soldCount: number;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  buyer: { id: string; name: string; phone: string };
  store: { id: string; name: string };
  items: { productId: string; name: string; price: number; quantity: number; image: string }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  deliveryAddress: { street: string; landmark: string; phone: string; state: string; city: string };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paystackReference: string;
  estimatedDelivery: string | null;
  createdAt: string;
}

// ─── Review ───────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  reviewer: string;
  reviewerName: string;
  reviewerAvatar: string | null;
  target: string;
  targetName: string;
  targetType: 'provider' | 'product' | 'store';
  bookingId: string | null;
  orderId: string | null;
  overall: number;
  categories: {
    quality: number;
    punctuality: number;
    professionalism: number;
    communication: number;
  };
  text: string;
  images: string[];
  isVerified: boolean;
  createdAt: string;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalProviders: number;
  activeProviders: number;
  bannedProviders: number;
  pendingKYC: number;
  totalCustomers: number;
  activeCustomers: number;
  bannedCustomers: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  disputedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  platformFees: number;
  todayRevenue: number;
  totalTransactions: number;
  totalOrders: number;
  totalAgents: number;
  revenueChart: { month: string; revenue: number; bookings: number }[];
  bookingStatusChart: { name: string; value: number }[];
  userGrowthChart: { month: string; providers: number; customers: number }[];
}
