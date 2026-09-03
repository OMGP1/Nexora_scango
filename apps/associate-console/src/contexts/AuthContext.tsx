import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (false) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          const accessToken = await currentUser.getIdToken(true);
          setToken(accessToken);
          localStorage.setItem('token', accessToken);
        } else {
          setToken(null);
          localStorage.removeItem('token');
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      if (localStorage.getItem('token')) {
        setToken(localStorage.getItem('token'));
        setUser({ uid: 'mock-admin-456' } as any);
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    if (false) {
      const credential = await signInWithEmailAndPassword(auth, email, pass);
      const accessToken = await credential.user.getIdToken(true);
      setToken(accessToken);
      localStorage.setItem('token', accessToken);
    } else {
      const mockToken = 'mock-token-123';
      setToken(mockToken);
      setUser({ uid: 'mock-admin-456' } as any);
      localStorage.setItem('token', mockToken);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, loading, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

