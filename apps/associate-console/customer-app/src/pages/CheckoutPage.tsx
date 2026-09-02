import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { useCart } from '../contexts/CartContext';
import { createPaymentIntent, simulateWebhook } from '../services/api/payment';
import { CreditCard, ArrowLeft, Loader2 } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { sessionId } = useSession();
  const { billSummary } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [intent, setIntent] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId || !billSummary || billSummary.grand_total === 0) {
      navigate('/cart');
      return;
    }
    
    // Create intent on mount
    createPaymentIntent(sessionId)
      .then((res: any) => {
        setIntent(res.data);
      })
      .catch((_err: any) => {
        setError('Failed to initialize payment.');
      });
  }, [sessionId, billSummary, navigate]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intent) return;

    setLoading(true);
    setError('');
    
    try {
      // Simulate webhook firing after successful gateway capture
      await simulateWebhook(intent.gateway_ref || intent.payment_id);
      navigate('/receipt');
    } catch (err) {
      setError('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  if (!intent && !error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f9fafb' }}>
        <Loader2 className="animate-spin" size={32} color="#3b82f6" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingBottom: '80px' }}>
      <header style={{ backgroundColor: '#fff', padding: '16px', display: 'flex', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <button onClick={() => navigate('/cart')} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '16px' }}>
          <ArrowLeft size={24} color="#1f2937" />
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>Checkout</h1>
      </header>

      <main style={{ padding: '24px' }}>
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', marginBottom: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#6b7280', margin: '0 0 8px 0' }}>Amount to Pay</p>
          <h2 style={{ fontSize: '2rem', margin: 0, color: '#1f2937' }}>₹{billSummary?.grand_total}</h2>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={20} />
            Payment Details
          </h3>
          
          <form onSubmit={handlePay}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#4b5563' }}>Card Number</label>
              <input 
                type="text" 
                placeholder="0000 0000 0000 0000" 
                defaultValue="4242 4242 4242 4242"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', boxSizing: 'border-box' }}
                readOnly
              />
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#4b5563' }}>Expiry</label>
                <input 
                  type="text" 
                  placeholder="MM/YY" 
                  defaultValue="12/26"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', boxSizing: 'border-box' }}
                  readOnly
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#4b5563' }}>CVC</label>
                <input 
                  type="text" 
                  placeholder="123" 
                  defaultValue="123"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', boxSizing: 'border-box' }}
                  readOnly
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '1.125rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                `Pay ₹${billSummary?.grand_total}`
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
