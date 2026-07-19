// services/api.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import type { Category } from '../types/index';
// ─── Base configuration ───────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7227/v1.0';
const TOKEN_KEY = 'sn_admin_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── Axios instance ──────────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 20000,
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message = (error.response?.data as any)?.message || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'superadmin';
  permissions: string[];
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface AuthTokens {
  access: { token: string; expires: string };
  refresh: { token: string; expires: string };
}

export interface LoginResponse {
  admin: AdminUser;
  tokens: AuthTokens;
}

export async function loginAdmin(email: string, password: string): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/admins/login', { email, password });
  return response.data;
}

export async function getMe(): Promise<{ admin: AdminUser }> {
  const response = await apiClient.get<{ admin: AdminUser }>('/admins/me');
  return response.data;
}

export async function updateMe(data: { fullName?: string; email?: string; phone?: string }): Promise<{ admin: AdminUser }> {
  const response = await apiClient.put<{ admin: AdminUser }>('/admins/me', data);
  return response.data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  const response = await apiClient.put<{ message: string }>('/admins/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
}

// ─── Admin Team (superadmin) ──────────────────────────────────────────────────

export async function listAdmins(): Promise<{ admins: AdminUser[] }> {
  const response = await apiClient.get<{ admins: AdminUser[] }>('/admins/team');
  return response.data;
}

export async function createAdmin(data: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'admin' | 'superadmin';
}): Promise<{ admin: AdminUser }> {
  const response = await apiClient.post<{ admin: AdminUser }>('/admins/create', data);
  return response.data;
}

export async function updateAdminPermissions(
  id: string,
  data: { permissions?: string[]; role?: string }
): Promise<{ admin: AdminUser }> {
  const response = await apiClient.put<{ admin: AdminUser }>(`/admins/team/${id}/permissions`, data);
  return response.data;
}

export async function toggleAdminActive(id: string): Promise<{ message: string }> {
  const response = await apiClient.put<{ message: string }>(`/admins/team/${id}/toggle-active`);
  return response.data;
}

export async function getAllPermissions(): Promise<{ permissions: string[] }> {
  const response = await apiClient.get<{ permissions: string[] }>('/admins/permissions/all');
  return response.data;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardData {
  totalProviders: number;
  activeProviders: number;
  pendingKYC: number;
  totalCustomers: number;
  activeCustomers: number;
  totalBookings: number;
  pendingBookings: number;
  disputedBookings: number;
  completedBookings: number;
  totalRevenue: number;
  todayRevenue: number;
  platformFees: number;
  totalOrders: number;
  todayBookings: number;
  revenueChart: { month: string; revenue: number; bookings: number }[];
  bookingStatusChart: { name: string; value: number }[];
  userGrowthChart: { month: string; providers: number; customers: number }[];
}

export async function getDashboard(): Promise<DashboardData> {
  const response = await apiClient.get<DashboardData>('/admins/dashboard');
  return response.data;
}

// ─── Customers ────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function listCustomers(params: {
  search?: string;
  filter?: string;
  page?: number;
  limit?: number;
}): Promise<{ customers: unknown[]; total: number; page: number; limit: number; totalPages: number }> {
  const response = await apiClient.get('/admins/customers', { params });
  return response.data;
}

export async function getCustomer(id: string): Promise<{ customer: unknown }> {
  const response = await apiClient.get<{ customer: unknown }>(`/admins/customers/${id}`);
  return response.data;
}

export async function banCustomer(id: string): Promise<{ isBanned: boolean; message: string }> {
  const response = await apiClient.put<{ isBanned: boolean; message: string }>(`/admins/customers/${id}/ban`);
  return response.data;
}

export async function getCustomerBookings(id: string, params: { page?: number; limit?: number } = {}): Promise<{ bookings: unknown[]; total: number }> {
  const response = await apiClient.get<{ bookings: unknown[]; total: number }>(`/admins/customers/${id}/bookings`, { params });
  return response.data;
}

export async function getCustomerOrders(id: string, params: { page?: number; limit?: number } = {}): Promise<{ orders: unknown[]; total: number }> {
  const response = await apiClient.get<{ orders: unknown[]; total: number }>(`/admins/customers/${id}/orders`, { params });
  return response.data;
}

export async function getCustomerTransactions(id: string, params: { page?: number; limit?: number } = {}): Promise<{ transactions: unknown[]; total: number }> {
  const response = await apiClient.get<{ transactions: unknown[]; total: number }>(`/admins/customers/${id}/transactions`, { params });
  return response.data;
}

// ─── Providers ────────────────────────────────────────────────────────────────

export async function listProviders(params: {
  search?: string;
  filter?: string;
  page?: number;
  limit?: number;
}): Promise<{ providers: unknown[]; total: number; page: number; limit: number; totalPages: number }> {
  const response = await apiClient.get('/admins/providers', { params });
  return response.data;
}

export async function getProvider(id: string): Promise<{ provider: unknown }> {
  const response = await apiClient.get<{ provider: unknown }>(`/admins/providers/${id}`);
  return response.data;
}

export async function banProvider(id: string): Promise<{ isBanned: boolean; message: string }> {
  const response = await apiClient.put<{ isBanned: boolean; message: string }>(`/admins/providers/${id}/ban`);
  return response.data;
}

export async function getProviderBookings(id: string, params: { page?: number; limit?: number } = {}): Promise<{ bookings: unknown[]; total: number }> {
  const response = await apiClient.get<{ bookings: unknown[]; total: number }>(`/admins/providers/${id}/bookings`, { params });
  return response.data;
}

export async function getProviderServices(id: string): Promise<{ services: unknown[] }> {
  const response = await apiClient.get<{ services: unknown[] }>(`/admins/providers/${id}/services`);
  return response.data;
}

export async function getProviderTransactions(id: string, params: { page?: number; limit?: number } = {}): Promise<{ transactions: unknown[]; total: number }> {
  const response = await apiClient.get<{ transactions: unknown[]; total: number }>(`/admins/providers/${id}/transactions`, { params });
  return response.data;
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function listBookings(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ bookings: unknown[]; total: number; page: number; limit: number; totalPages: number }> {
  const response = await apiClient.get('/admins/bookings', { params });
  return response.data;
}

export async function getBooking(id: string): Promise<{ booking: unknown }> {
  const response = await apiClient.get<{ booking: unknown }>(`/admins/bookings/${id}`);
  return response.data;
}

// ─── KYC ─────────────────────────────────────────────────────────────────────

export async function listKYC(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ records: unknown[]; total: number; page: number; limit: number; totalPages: number }> {
  const response = await apiClient.get('/admins/kyc', { params });
  return response.data;
}

export async function approveKYC(id: string): Promise<{ message: string; kyc: unknown }> {
  const response = await apiClient.put<{ message: string; kyc: unknown }>(`/admins/kyc/${id}/approve`);
  return response.data;
}

export async function rejectKYC(id: string, reason: string): Promise<{ message: string; kyc: unknown }> {
  const response = await apiClient.put<{ message: string; kyc: unknown }>(`/admins/kyc/${id}/reject`, { reason });
  return response.data;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function listTransactions(params: {
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
}): Promise<{ transactions: unknown[]; total: number; page: number; limit: number; totalPages: number }> {
  const response = await apiClient.get('/admins/transactions', { params });
  return response.data;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function listNotifications(params: {
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
}): Promise<{ notifications: unknown[]; total: number; page: number; limit: number; totalPages: number }> {
  const response = await apiClient.get('/admins/notifications', { params });
  return response.data;
}

export async function broadcastNotification(data: {
  title: string;
  body: string;
  type?: string;
  target: 'all' | 'providers' | 'customers';
}): Promise<{ message: string; count: number }> {
  const response = await apiClient.post<{ message: string; count: number }>('/admins/notifications/broadcast', data);
  return response.data;
}

// ─── Agents ───────────────────────────────────────────────────────────────────

export async function listAgents(params: { page?: number; limit?: number } = {}): Promise<{ agents: unknown[]; total: number }> {
  const response = await apiClient.get<{ agents: unknown[]; total: number }>('/admins/agents', { params });
  return response.data;
}

// ─── Services ─────────────────────────────────────────────────────────────────

export async function listServices(params: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ services: unknown[]; total: number }> {
  const response = await apiClient.get<{ services: unknown[]; total: number }>('/admins/services', { params });
  return response.data;
}

// ─── Marketplace ──────────────────────────────────────────────────────────────

export async function listOrders(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ orders: unknown[]; total: number }> {
  const response = await apiClient.get<{ orders: unknown[]; total: number }>('/admins/marketplace/orders', { params });
  return response.data;
}

export async function listStores(params: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ stores: unknown[]; total: number }> {
  const response = await apiClient.get<{ stores: unknown[]; total: number }>('/admins/marketplace/stores', { params });
  return response.data;
}

export async function listProducts(params: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ products: unknown[]; total: number }> {
  const response = await apiClient.get<{ products: unknown[]; total: number }>('/admins/marketplace/products', { params });
  return response.data;
}

// ─── Calls ───────────────────────────────────────────────────────────────────

export interface CallLog {
  _id: string;
  initiator: string;
  initiatorType: 'customer' | 'provider';
  initiatorName: string;
  initiatorPhone: string;
  recipient: string;
  recipientType: 'customer' | 'provider';
  recipientName: string;
  recipientPhone: string;
  type: 'voice' | 'video';
  status: 'ringing' | 'accepted' | 'rejected' | 'ended' | 'missed' | 'busy';
  duration: number;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
}

export async function listCalls(params: {
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}): Promise<{ calls: CallLog[]; total: number }> {
  const response = await apiClient.get<{ calls: CallLog[]; total: number }>('/admins/calls', { params });
  return response.data;
}

// ─── Chat ──────────────────────────────────────────────────────────────────────

export async function listConversations(): Promise<{ conversations: unknown[] }> {
  const response = await apiClient.get<{ conversations: unknown[] }>('/chat/conversations');
  return response.data;
}

export async function createOrGetConversation(
  targetUserId: string,
  targetActorType: 'customer' | 'provider'
): Promise<{ conversation: unknown }> {
  const response = await apiClient.post<{ conversation: unknown }>('/chat/conversations', {
    targetUserId,
    targetActorType,
  });
  return response.data;
}

export async function listMessages(
  conversationId: string,
  params: { page?: number; limit?: number } = {}
): Promise<{ messages: unknown[] }> {
  const response = await apiClient.get<{ messages: unknown[] }>(`/chat/conversations/${conversationId}/messages`, { params });
  return response.data;
}

export async function sendChatMessage(
  conversationId: string,
  payload: { text?: string; imageUrl?: string; type?: string }
): Promise<{ message: unknown }> {
  const response = await apiClient.post<{ message: unknown }>(`/chat/conversations/${conversationId}/messages`, payload);
  return response.data;
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function listCategories(params?: { activeOnly?: boolean }): Promise<{ categories: Category[] }> {
  const response = await apiClient.get<{ categories: Category[] }>('/admins/categories', { params });
  return response.data;
}

export async function createCategory(data: {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}): Promise<{ category: Category }> {
  const response = await apiClient.post<{ category: Category }>('/admins/categories', data);
  return response.data;
}

export async function getCategory(id: string): Promise<{ category: Category }> {
  const response = await apiClient.get<{ category: Category }>(`/admins/categories/${id}`);
  return response.data;
}

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    isActive?: boolean;
  }
): Promise<{ category: Category }> {
  const response = await apiClient.put<{ category: Category }>(`/admins/categories/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: string): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(`/admins/categories/${id}`);
  return response.data;
}

// ─── Promotions ──────────────────────────────────────────────────────────────

export async function listPromotions(params: {
  status?: string;
  plan?: string;
  page?: number;
  limit?: number;
}): Promise<{ promotions: unknown[]; total: number; page: number; limit: number }> {
  const response = await apiClient.get('/admins/promotions', { params });
  return response.data;
}

export async function cancelPromotion(id: string): Promise<{ message: string; promotion: unknown }> {
  const response = await apiClient.put<{ message: string; promotion: unknown }>(`/admins/promotions/${id}/cancel`);
  return response.data;
}