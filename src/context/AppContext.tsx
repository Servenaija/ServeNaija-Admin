import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Category, Conversation, Message } from '../types';
import { mockCategories, mockConversations, mockMessages } from '../data/mock';
import type { Provider, Customer, KYCRecord, Notification } from '../types';
import { listProviders, listCustomers, listKYC, listNotifications, getToken } from '../services/api';

interface AppContextValue {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  messages: Record<string, Message[]>;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>;
  providers: Provider[];
  setProviders: React.Dispatch<React.SetStateAction<Provider[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  kycRecords: KYCRecord[];
  setKycRecords: React.Dispatch<React.SetStateAction<KYCRecord[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  adminName: string;
  adminEmail: string;
  loading: boolean;
  refreshProviders: () => void;
  refreshCustomers: () => void;
  refreshKYC: () => void;
  refreshNotifications: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// Normalize _id → id for MongoDB documents
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeId<T>(obj: any): T {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(normalizeId) as unknown as T;
  const { _id, __v, ...rest } = obj;
  return { id: _id ?? rest.id, ...rest } as T;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [kycRecords, setKycRecords] = useState<KYCRecord[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  const fetchProviders = useCallback(async () => {
    try {
      const res = await listProviders({ limit: 100 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setProviders((res.providers as any[]).map(normalizeId<Provider>));
    } catch { /* silently ignore — use empty array */ }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await listCustomers({ limit: 100 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setCustomers((res.customers as any[]).map(normalizeId<Customer>));
    } catch { /* silently ignore */ }
  }, []);

  const fetchKYC = useCallback(async () => {
    try {
      const res = await listKYC({ limit: 100 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setKycRecords((res.records as any[]).map(normalizeId<KYCRecord>));
    } catch { /* silently ignore */ }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await listNotifications({ limit: 100 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setNotifications((res.notifications as any[]).map(normalizeId<Notification>));
    } catch { /* silently ignore */ }
  }, []);

  // Fetch all data once we have a token
  useEffect(() => {
    if (!getToken()) return;
    setLoading(true);
    Promise.all([fetchProviders(), fetchCustomers(), fetchKYC(), fetchNotifications()]).finally(() =>
      setLoading(false)
    );
  }, [fetchProviders, fetchCustomers, fetchKYC, fetchNotifications]);

  return (
    <AppContext.Provider value={{
      categories, setCategories,
      conversations, setConversations,
      messages, setMessages,
      providers, setProviders,
      customers, setCustomers,
      kycRecords, setKycRecords,
      notifications, setNotifications,
      adminName, adminEmail,
      loading,
      refreshProviders: fetchProviders,
      refreshCustomers: fetchCustomers,
      refreshKYC: fetchKYC,
      refreshNotifications: fetchNotifications,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// Expose setAdminName/setAdminEmail so SettingsPage can update them after API save
export { type AppContextValue };

