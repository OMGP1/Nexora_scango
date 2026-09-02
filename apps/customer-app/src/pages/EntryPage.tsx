import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSession } from '../contexts/SessionContext';
import { Button } from '../components/ui/Button';
import { QrCode } from 'lucide-react';

export const EntryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginGuest } = useAuth();
  const { createSession } = useSession();
  
  const [loading, setLoading] = useState(false);
  const [storeId, setStoreId] = useState<string>('STORE_001');

  useEffect(() => {
    const storeIdParam = searchParams.get('store_id');
    if (storeIdParam) setStoreId(storeIdParam);
  }, [searchParams]);

  const handleStart = async () => {
    setLoading(true);
    try {
      await loginGuest(storeId);
      await createSession(storeId);
      navigate('/scan');
    } catch (e) {
      console.error('Failed to start session', e);
      alert('Could not start session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #4f46e5 0%, #10b981 100%)', color: 'white', padding: '24px' }}>
      <div style={{ marginBottom: '48px', textAlign: 'center' }}>
        <QrCode size={80} style={{ marginBottom: '24px', opacity: 0.9 }} />
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 8px 0' }}>ScanGo</h1>
        <p style={{ fontSize: '1.125rem', opacity: 0.8, margin: 0 }}>Skip the line. Scan and go.</p>
      </div>

      <div style={{ width: '100%', maxWidth: '320px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '24px', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
        <p style={{ textAlign: 'center', marginBottom: '24px', fontSize: '0.875rem' }}>
          Welcome to {storeId === 'STORE_001' ? 'SuperMart' : 'Store'}
        </p>
        
        <Button onClick={handleStart} disabled={loading} style={{ backgroundColor: '#fff', color: '#4f46e5' }}>
          {loading ? 'Starting...' : 'Start Shopping'}
        </Button>
      </div>
    </div>
  );
};
