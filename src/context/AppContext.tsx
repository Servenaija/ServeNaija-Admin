import React, { createContext, useContext, useState } from 'react';
import type { Category, Conversation, Message } from '../types';
import {
  mockCategories, mockConversations, mockMessages,
  mockProviders, mockCustomers, mockKYCRecords, mockNotifications,
} from '../data/mock';
import type { Provider, Customer, KYCRecord, Notification } from '../types';

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
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const [providers, setProviders] = useState<Provider[]>(mockProviders);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [kycRecords, setKycRecords] = useState<KYCRecord[]>(mockKYCRecords);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  return (
    <AppContext.Provider value={{
      categories, setCategories,
      conversations, setConversations,
      messages, setMessages,
      providers, setProviders,
      customers, setCustomers,
      kycRecords, setKycRecords,
      notifications, setNotifications,
      adminName: 'Super Admin',
      adminEmail: 'admin@servenaija.ng',
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
