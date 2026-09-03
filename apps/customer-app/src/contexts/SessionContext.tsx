import { createContext, useContext, useState, ReactNode } from 'react';
import api from '../services/api';
import { v4 as uuidv4 } from 'uuid';

interface SessionContextType {
  sessionId: string | null;
  joinCode: string | null;
  createSession: (storeId: string) => Promise<void>;
  abandonSession: () => Promise<void>;
  clearLocalSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('session_id'));
  const [joinCode, setJoinCode] = useState<string | null>(localStorage.getItem('join_code'));

  const getDeviceFingerprint = () => {
    let fp = localStorage.getItem('device_fingerprint');
    if (!fp) {
      fp = uuidv4();
      localStorage.setItem('device_fingerprint', fp);
    }
    return fp;
  };

  const createSession = async (storeId: string) => {
    const response = await api.post('/sessions', {
      store_id: storeId,
      device_fingerprint: getDeviceFingerprint(),
    });
    const data = response.data.data;
    setSessionId(data.session_id);
    setJoinCode(data.join_code);
    localStorage.setItem('session_id', data.session_id);
    localStorage.setItem('join_code', data.join_code);
  };

  const clearLocalSession = () => {
    setSessionId(null);
    setJoinCode(null);
    localStorage.removeItem('session_id');
    localStorage.removeItem('join_code');
  };

  const abandonSession = async () => {
    if (sessionId) {
      await api.delete(`/sessions/${sessionId}`);
      clearLocalSession();
    }
  };

  return (
    <SessionContext.Provider value={{ sessionId, joinCode, createSession, abandonSession, clearLocalSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
};
