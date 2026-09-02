import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { useVerificationStatus } from '../hooks/useVerificationStatus';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const { sessionId } = useSession();
  const navigate = useNavigate();
  const { status } = useVerificationStatus(sessionId);

  useEffect(() => {
    if (status === 'CLEARED') {
      const timer = setTimeout(() => {
        navigate('/checkout');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  if (!sessionId) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f9fafb', padding: '24px', textAlign: 'center' }}>
      
      {status === 'PENDING' && (
        <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%' }}>
          <Loader2 className="animate-spin" size={64} color="#f59e0b" style={{ margin: '0 auto 24px auto' }} />
          <h2 style={{ margin: '0 0 12px 0', fontSize: '1.5rem', color: '#1f2937' }}>Quick check in progress</h2>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '1rem', lineHeight: '1.5' }}>Please wait a moment while we verify your cart. This usually takes just a few seconds.</p>
        </div>
      )}

      {status === 'CLEARED' && (
        <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%' }}>
          <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 24px auto' }} />
          <h2 style={{ margin: '0 0 12px 0', fontSize: '1.5rem', color: '#1f2937' }}>All good!</h2>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '1rem', lineHeight: '1.5' }}>Your cart is verified. Taking you to payment...</p>
        </div>
      )}

      {status === 'HELD' && (
        <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%' }}>
          <AlertCircle size={64} color="#f97316" style={{ margin: '0 auto 24px auto' }} />
          <h2 style={{ margin: '0 0 12px 0', fontSize: '1.5rem', color: '#1f2937' }}>Associate assistance needed</h2>
          <p style={{ color: '#6b7280', margin: '0 0 24px 0', fontSize: '1rem', lineHeight: '1.5' }}>An associate will be with you shortly to help verify your items.</p>
          <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '12px', color: '#4b5563', fontSize: '0.875rem' }}>
            Session ID: {sessionId.substring(0, 8).toUpperCase()}
          </div>
        </div>
      )}

    </div>
  );
};
