import { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin, getMe, setToken, clearToken, getToken } from '../services/api';
import type { AdminUser } from '../services/api';

interface AuthContextValue {
  isAuthenticated: boolean;
  admin: AdminUser | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken());
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  // On mount, if there's already a token, fetch the admin profile
  useEffect(() => {
    if (getToken() && !admin) {
      getMe()
        .then(({ admin: a }) => {
          setAdmin(a);
          setIsAuthenticated(true);
        })
        .catch(() => {
          clearToken();
          setIsAuthenticated(false);
        });
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await loginAdmin(email, password);
      setToken(res.tokens.access.token);
      setAdmin(res.admin);
      setIsAuthenticated(true);
      return { ok: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed.';
      return { ok: false, error: message };
    }
  };

  const logout = () => {
    clearToken();
    setAdmin(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
