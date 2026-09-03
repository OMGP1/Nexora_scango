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
  }, []);

  const loginGuest = async (storeId: string) => {
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
  };

  const loginWithEmail = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const accessToken = await credential.user.getIdToken();
    setToken(accessToken);
    localStorage.setItem('token', accessToken);
  };

  const signupWithEmail = async (email: string, password: string, name: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    const accessToken = await credential.user.getIdToken();
    setToken(accessToken);
    localStorage.setItem('token', accessToken);
  };

  const loginWithGoogle = async () => {
    const credential = await signInWithPopup(auth, googleProvider);
    const accessToken = await credential.user.getIdToken();
    setToken(accessToken);
    localStorage.setItem('token', accessToken);
  };

  const logout = async () => {
    try {
      await signOut(auth);
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
