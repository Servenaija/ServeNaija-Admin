// src/context/SocketContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getToken } from '../services/api';

// Define Vite environment variables
interface ImportMetaEnv {
  readonly VITE_SOCKET_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface AdminUser {
  _id: string;
  id?: string;
  fullName?: string;
  name?: string;
  email?: string;
  token?: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { admin } = useAuth();

  useEffect(() => {
    if (!admin) return;

    // Use VITE_SOCKET_URL from import.meta.env
    const apiBase = (import.meta.env.VITE_API_URL as string) || 'http://localhost:7227/v1.0';
    const socketUrl = (import.meta.env.VITE_SOCKET_URL as string) || apiBase.split('/v1.0')[0];
    const adminId = (admin as AdminUser)?._id || (admin as AdminUser)?.id || '';
    const adminToken = (admin as AdminUser)?.token || getToken() || '';

    console.log('Connecting to socket:', socketUrl);

    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      auth: {
        token: adminToken,
        userId: adminId,
        userType: 'admin',
      },
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      // Register as admin + join realtime rooms used by admin-ops
      newSocket.emit('register_admin', { adminId });
      newSocket.emit('join_admin_support');
      if (adminId) newSocket.emit('join_user', { userId: adminId });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [admin]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};