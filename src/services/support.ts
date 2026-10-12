import axios, { AxiosInstance, AxiosError } from 'axios';
import { getToken } from './api'; // Import getToken from api.ts

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7227';

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 20000,
});

// Request interceptor to add token (same as in api.ts)
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken(); // Use the same token function
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

export const getAdminTickets = async (params?: { status?: string; limit?: number; page?: number }) => {
  const response = await apiClient.get('/support/admin/tickets', { params });
  return response.data;
};

export const getAdminTicket = async (ticketId: string) => {
  const response = await apiClient.get(`/support/admin/tickets/${ticketId}`);
  return response.data;
};

export const sendAdminMessage = async (ticketId: string, data: { message: string }) => {
  const response = await apiClient.post(`/support/admin/tickets/${ticketId}/messages`, data);
  return response.data;
};

export const assignTicket = async (ticketId: string) => {
  const response = await apiClient.post(`/support/admin/tickets/${ticketId}/assign`);
  return response.data;
};

export const resolveTicket = async (ticketId: string) => {
  const response = await apiClient.post(`/support/admin/tickets/${ticketId}/resolve`);
  return response.data;
};

export const adminCloseTicket = async (ticketId: string) => {
  const response = await apiClient.post(`/support/admin/tickets/${ticketId}/close`);
  return response.data;
};

export const createSupportTicket = async (data: { subject?: string; message: string }) => {
  const response = await apiClient.post('/support/tickets', data);
  return response.data;
};

export const getUserTickets = async () => {
  const response = await apiClient.get('/support/tickets');
  return response.data;
};

export const getUserTicket = async (ticketId: string) => {
  const response = await apiClient.get(`/support/tickets/${ticketId}`);
  return response.data;
};

export const addUserMessage = async (ticketId: string, data: { message: string }) => {
  const response = await apiClient.post(`/support/tickets/${ticketId}/messages`, data);
  return response.data;
};

export const closeTicket = async (ticketId: string) => {
  const response = await apiClient.post(`/support/tickets/${ticketId}/close`);
  return response.data;
};