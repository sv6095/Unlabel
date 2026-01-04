import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  requireAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token } = response.data;

      localStorage.setItem('token', access_token);

      // Decode token properly or fetch profile
      // For now, we'll manually payload decode to get basic info, 
      // but ideally we should hit /profile
      const payload = JSON.parse(atob(access_token.split('.')[1]));

      setUser({
        id: payload.sub, // 'sub' is the user ID in our backend
        email: email,
        name: email.split('@')[0], // Placeholder until we fetch profile
      });

      // Optional: Fetch full profile
      // const profile = await api.get('/profile');
      // setUser(profile.data);

    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      const response = await api.post('/auth/register', { email, password, name });
      const { access_token } = response.data;

      localStorage.setItem('token', access_token);

      // Basic state set
      setUser({
        id: 'new-id', // We'll update this on next refresh or profile fetch
        email,
        name,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const requireAuth = useCallback(() => {
    return user !== null;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
