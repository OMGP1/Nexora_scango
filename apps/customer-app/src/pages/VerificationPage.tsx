import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { useVerificationStatus } from '../hooks/useVerificationStatus';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Card, Spinner } from '@scango/ui';

export const VerificationPage: React.FC = () => {
  const { sessionId } = useSession();
  const navigate = useNavigate();
  const { status } = useVerificationStatus(sessionId);

  useEffect(() => {
    if (status === 'CLEARED') {
      const timer = setTimeout(() => navigate('/checkout'), 2000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  if (!sessionId) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        padding: '24px',
      }}
    >
      {status === 'PENDING' && (
        <Card padding="lg" style={{ textAlign: 'center', maxWidth: '380px', width: '100%', animation: 'scango-scale-in 0.3s ease-out' }}>
          <div style={{ margin: '0 auto 24px auto', display: 'flex', justifyContent: 'center' }}>
            <Spinner size={56} color="var(--color-warning)" />
          </div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text)' }}>
            Quick check in progress
          </h2>
          <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
            Please wait a moment while we verify your cart. This usually takes just a few seconds.
          </p>
        </Card>
      )}

      {status === 'CLEARED' && (
        <Card padding="lg" style={{ textAlign: 'center', maxWidth: '380px', width: '100%', animation: 'scango-scale-in 0.3s ease-out' }}>
          <div style={{ margin: '0 auto 24px auto', display: 'flex', justifyContent: 'center', color: 'var(--color-success)' }}>
            <CheckCircle size={56} />
          </div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text)' }}>
            All good!
          </h2>
          <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
            Your cart is verified. Taking you to payment...
          </p>
        </Card>
      )}

      {status === 'HELD' && (
        <Card padding="lg" style={{ textAlign: 'center', maxWidth: '380px', width: '100%', animation: 'scango-scale-in 0.3s ease-out' }}>
          <div style={{ margin: '0 auto 24px auto', display: 'flex', justifyContent: 'center', color: 'var(--color-warning)' }}>
            <AlertCircle size={56} />
          </div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text)' }}>
            Associate assistance needed
          </h2>
          <p style={{ color: 'var(--color-text-muted)', margin: '0 0 20px 0', fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
            An associate will be with you shortly to help verify your items.
          </p>
          <div
            style={{
              padding: '14px',
              backgroundColor: 'var(--color-bg-warm-accent)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-family-mono)',
              fontSize: 'var(--font-size-lg)',
              fontWeight: 600,
              color: 'var(--color-text)',
              letterSpacing: '0.1em',
            }}
          >
            {sessionId.substring(0, 8).toUpperCase()}
          </div>
        </Card>
      )}
    </div>
  );
};
