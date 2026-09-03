import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@scango/ui';
import { ArrowRight } from 'lucide-react';

export const EntryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [storeId, setStoreId] = useState<string>('STORE_001');

  useEffect(() => {
    const storeIdParam = searchParams.get('store_id');
    if (storeIdParam) setStoreId(storeIdParam);
  }, [searchParams]);

  const handleStart = () => {
    localStorage.setItem('store_id', storeId);
    if (isAuthenticated) {
      navigate('/scan');
    } else {
      navigate('/login');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg)',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
          animation: 'scango-fade-in 0.5s ease-out',
        }}
      >
        {/* Wordmark */}
        <h1
          style={{
            fontSize: 'var(--font-size-4xl)',
            fontWeight: 700,
            color: 'var(--color-text)',
            letterSpacing: 'var(--letter-spacing-tight)',
            margin: '0 0 8px 0',
          }}
        >
          ScanGo
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-muted)',
            margin: '0 0 48px 0',
            fontWeight: 400,
          }}
        >
          Skip the line. Scan and go.
        </p>

        {/* Store info card */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px 24px',
            boxShadow: 'var(--shadow-card)',
            marginBottom: '32px',
          }}
        >
          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-muted)',
              margin: '0 0 4px 0',
              textTransform: 'uppercase',
              letterSpacing: 'var(--letter-spacing-wide)',
              fontWeight: 500,
            }}
          >
            Welcome to
          </p>
          <p
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 700,
              color: 'var(--color-text)',
              margin: '0 0 24px 0',
            }}
          >
            {storeId === 'STORE_001' ? 'SuperMart' : 'Store'}
          </p>

          <Button
            onClick={handleStart}
            fullWidth
            size="lg"
          >
            Start Shopping
            <ArrowRight size={18} />
          </Button>
        </div>

        <p
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            margin: 0,
          }}
        >
          Scan products • Pay in-app • Walk out
        </p>
      </div>
    </div>
  );
};
