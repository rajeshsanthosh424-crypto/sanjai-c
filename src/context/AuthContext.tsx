import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  demoUsers: { id: string; name: string; role: string; email: string }[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const demoUsersList = [
  { id: 'usr_rajesh', name: 'Rajesh Santhosh (Reporter - Wallet, Keys)', role: 'user', email: 'rajeshsanthosh424@gmail.com' },
  { id: 'usr_alex', name: 'Alex Rivera (Finder - Wallet, Keys)', role: 'user', email: 'alex.rivera@example.com' },
  { id: 'usr_sarah', name: 'Sarah Chen (Reporter - Phone, Finder - Bag)', role: 'user', email: 'sarah.chen@example.com' },
  { id: 'usr_admin', name: 'Admin Supervisor (System Moderator)', role: 'admin', email: 'admin@lostandfound.local' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await api.getCurrentUser();
      setUser(res.user);
    } catch (err) {
      console.warn('Auth fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password?: string) => {
    const res = await api.login(email, password);
    setUser(res.user);
  };

  const register = async (name: string, email: string, phone?: string) => {
    const res = await api.register(name, email, phone);
    setUser(res.user);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const switchUser = async (userId: string) => {
    const res = await api.switchUser(userId);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        switchUser,
        demoUsers: demoUsersList,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
