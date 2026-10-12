// services/adminOps.ts — NEW isolated client for /admin-ops/* endpoints.
// Does NOT modify services/api.ts. Uses the same token + base URL.
import axios from 'axios';
import { getToken } from './api';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7227/v1.0';

const opsClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 25000,
});

opsClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

opsClient.interceptors.response.use(
  (r) => r,
  (error) => {
    const message = (error.response?.data as any)?.message || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export async function getDashboardV2(): Promise<Any> {
  const { data } = await opsClient.get('/admin-ops/dashboard-v2');
  return data;
}

export async function getFinanceOverview(): Promise<Any> {
  const { data } = await opsClient.get('/admin-ops/finance/overview');
  return data;
}

export async function adminCancelBooking(id: string, reason?: string): Promise<Any> {
  const { data } = await opsClient.put(`/admin-ops/bookings/${id}/cancel`, { reason });
  return data;
}

export async function adminCancelOrder(id: string, reason?: string): Promise<Any> {
  const { data } = await opsClient.put(`/admin-ops/orders/${id}/cancel`, { reason });
  return data;
}

export async function getPayoutQueue(limit = 50): Promise<Any> {
  const { data } = await opsClient.get('/admin-ops/payouts/queue', { params: { limit } });
  return data;
}

export async function releaseSinglePayout(targetType: 'booking' | 'order' | 'provider_payout', targetId: string, note?: string): Promise<Any> {
  const { data } = await opsClient.post('/admin-ops/payouts/release', { targetType, targetId, note });
  return data;
}

export async function releaseBulkPayouts(items: { targetType: string; targetId: string }[], note?: string): Promise<Any> {
  const { data } = await opsClient.post('/admin-ops/payouts/release-bulk', { items, note });
  return data;
}

export async function releaseAllPayouts(note?: string): Promise<Any> {
  const { data } = await opsClient.post('/admin-ops/payouts/release-bulk', { releaseAll: true, note });
  return data;
}

export async function getUnreadCounts(): Promise<{ conversationsUnread: number; ticketsUnread: number; adminNotificationsUnread: number; total: number }> {
  const { data } = await opsClient.get('/admin-ops/chat/unread-counts');
  return data;
}

export async function getMarketplaceOverview(params: { page?: number; limit?: number } = {}): Promise<Any> {
  const { data } = await opsClient.get('/admin-ops/marketplace/overview', { params });
  return data;
}

export async function getMarketplaceOrderDetail(id: string): Promise<{ order: Any; reviews: Any[] }> {
  const { data } = await opsClient.get(`/admin-ops/marketplace/orders/${id}`);
  return data;
}

export async function getProviderJobs(id: string, params: { page?: number; limit?: number } = {}): Promise<Any> {
  const { data } = await opsClient.get(`/admin-ops/providers/${id}/jobs`, { params });
  return data;
}

export async function broadcastOps(payload: { title: string; body: string; type?: string; target: 'all' | 'providers' | 'customers' }): Promise<Any> {
  const { data } = await opsClient.post('/admin-ops/notifications/broadcast', payload);
  return data;
}

export async function targetedPush(payload: { userId: string; actorType: 'customer' | 'provider'; title: string; body: string; type?: string; data?: Any }): Promise<Any> {
  const { data } = await opsClient.post('/admin-ops/notifications/targeted', payload);
  return data;
}

export async function getOnlinePresence(params: { type?: 'provider' | 'customer'; page?: number; limit?: number } = {}): Promise<Any> {
  const { data } = await opsClient.get('/admin-ops/presence/online', { params });
  return data;
}

export async function getUserActivity(params: { days?: number; type?: 'provider' | 'customer'; status?: 'active' | 'dormant'; page?: number; limit?: number } = {}): Promise<Any> {
  const { data } = await opsClient.get('/admin-ops/users/activity', { params });
  return data;
}

export async function getUserContact(actor: 'customer' | 'provider', id: string): Promise<Any> {
  const { data } = await opsClient.get(`/admin-ops/users/${actor}/${id}/contact`);
  return data;
}

export async function sendDirectMessage(targetUserId: string, targetActorType: 'customer' | 'provider', text: string): Promise<Any> {
  const { data } = await opsClient.post('/admin-ops/messages/direct', { targetUserId, targetActorType, text });
  return data;
}

export default opsClient;
