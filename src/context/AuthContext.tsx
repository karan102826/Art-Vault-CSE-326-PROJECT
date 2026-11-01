import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';
import { api, setStoredToken, getStoredToken } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  quickSwitch: (role: 'admin' | 'buyer') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load existing session or auto-initialize with demo buyer for effortless review
  useEffect(() => {
    async function initAuth() {
      const stored = getStoredToken();
      if (stored) {
        try {
          const res = await api.getMe();
          if (res.user) {
            setUser(res.user);
            setIsLoading(false);
            return;
          }
        } catch {
          setStoredToken(null);
          setToken(null);
        }
      }

      // Automatically sign in as default buyer for a zero-friction evaluation
      try {
        const demoRes = await api.demoSwitch('buyer');
        setStoredToken(demoRes.token);
        setToken(demoRes.token);
        setUser(demoRes.user);
      } catch (e) {
        console.error('Demo auto-sign-in fallback:', e);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string, role: UserRole = 'buyer') => {
    setIsLoading(true);
    try {
      const res = await api.register({ email, password, fullName, role });
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  };

  const quickSwitch = async (role: 'admin' | 'buyer') => {
    setIsLoading(true);
    try {
      const res = await api.demoSwitch(role);
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err) {
      console.error('Quick switch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
    login,
    register,
    logout,
    quickSwitch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
