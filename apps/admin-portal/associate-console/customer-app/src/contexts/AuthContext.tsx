import { createContext, useContext, useState, ReactNode } from 'react';
import api from '../services/api';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  loginGuest: (storeId: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const loginGuest = async (storeId: string) => {
    try {
      const response = await api.post('/auth/guest', { store_id: storeId });
      const { access_token } = response.data.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, loginGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
