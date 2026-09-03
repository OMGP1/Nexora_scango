import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginGuest: (storeId: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (false) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          const accessToken = await currentUser.getIdToken();
          setToken(accessToken);
          localStorage.setItem('token', accessToken);
          localStorage.setItem('customer_id', currentUser.uid);
          setUserProfile({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            isAnonymous: currentUser.isAnonymous,
          });
        } else {
          setToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('customer_id');
          setUserProfile(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Mock auth flow
      const mockToken = localStorage.getItem('token') || 'mock-token-123';
      const mockUid = localStorage.getItem('customer_id') || 'mock-user-456';
      
      // If we have a token (even mock), pretend we are logged in
      if (localStorage.getItem('token')) {
        setToken(mockToken);
        setUser({ uid: mockUid } as any);
        setUserProfile({
          uid: mockUid,
          email: 'guest@mock.local',
          displayName: 'Mock Guest',
          photoURL: null,
          isAnonymous: true,
        });
      }
      setLoading(false);
    }
  }, []);

  const loginGuest = async (storeId: string) => {
    if (false) {
      try {
        const credential = await signInAnonymously(auth);
        const accessToken = await credential.user.getIdToken();
        setToken(accessToken);
        localStorage.setItem('token', accessToken);
        localStorage.setItem('store_id', storeId);
      } catch (error) {
        console.error('Guest login failed', error);
        throw error;
      }
    } else {
      const mockToken = 'mock-token-123';
      const mockUid = 'mock-user-456';
      setToken(mockToken);
      setUser({ uid: mockUid } as any);
      setUserProfile({
        uid: mockUid,
        email: 'guest@mock.local',
        displayName: 'Mock Guest',
        photoURL: null,
        isAnonymous: true,
      });
      localStorage.setItem('token', mockToken);
      localStorage.setItem('customer_id', mockUid);
      localStorage.setItem('store_id', storeId);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    if (false) {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const accessToken = await credential.user.getIdToken();
      setToken(accessToken);
      localStorage.setItem('token', accessToken);
    } else {
      const mockToken = 'mock-token-123';
      const mockUid = 'mock-user-456';
      setToken(mockToken);
      setUser({ uid: mockUid } as any);
      setUserProfile({
        uid: mockUid,
        email: email,
        displayName: 'Mock User',
        photoURL: null,
        isAnonymous: false,
      });
      localStorage.setItem('token', mockToken);
      localStorage.setItem('customer_id', mockUid);
    }
  };

  const signupWithEmail = async (email: string, password: string, name: string) => {
    if (false) {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });
      const accessToken = await credential.user.getIdToken();
      setToken(accessToken);
      localStorage.setItem('token', accessToken);
    } else {
      const mockToken = 'mock-token-123';
      const mockUid = 'mock-user-456';
      setToken(mockToken);
      setUser({ uid: mockUid } as any);
      setUserProfile({
        uid: mockUid,
        email: email,
        displayName: name,
        photoURL: null,
        isAnonymous: false,
      });
      localStorage.setItem('token', mockToken);
      localStorage.setItem('customer_id', mockUid);
    }
  };

  const loginWithGoogle = async () => {
    if (false) {
      const credential = await signInWithPopup(auth, googleProvider);
      const accessToken = await credential.user.getIdToken();
      setToken(accessToken);
      localStorage.setItem('token', accessToken);
    } else {
      const mockToken = 'mock-token-123';
      const mockUid = 'mock-user-456';
      setToken(mockToken);
      setUser({ uid: mockUid } as any);
      setUserProfile({
        uid: mockUid,
        email: 'google@mock.local',
        displayName: 'Mock Google User',
        photoURL: null,
        isAnonymous: false,
      });
      localStorage.setItem('token', mockToken);
      localStorage.setItem('customer_id', mockUid);
    }
  };

  const logout = async () => {
    try {
      if (false) {
        await signOut(auth);
      }
      setToken(null);
      setUser(null);
      setUserProfile(null);
      localStorage.removeItem('token');
      localStorage.removeItem('customer_id');
      localStorage.removeItem('session_id');
      localStorage.removeItem('join_code');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        user,
        userProfile,
        loading,
        loginGuest,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};



