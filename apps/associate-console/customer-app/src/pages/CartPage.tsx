import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useSession } from '../contexts/SessionContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, Plus, Minus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { computeVerificationTier } from '../services/api/verification';

export const CartPage: React.FC = () => {
  const { sessionId } = useSession();
  const { items, billSummary, updateItem, removeItem, fetchCart } = useCart();
  const navigate = useNavigate();
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleCheckout = async () => {
    if (!sessionId) return;
    setLoadingCheckout(true);
    try {
      const res = await computeVerificationTier(sessionId);
      const data = res.data.data;
      if (data.tier === 'GREEN' && data.status === 'CLEARED') {
        navigate('/checkout');
      } else {
        navigate('/verification');
      }
    } catch (e) {
      console.error('Verification failed', e);
      navigate('/checkout');
    } finally {
      setLoadingCheckout(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f3f4f6' }}>
      <header style={{ padding: '16px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>My Cart</h1>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '64px', color: '#6b7280' }}>
            <p>Your cart is empty.</p>
            <Button onClick={() => navigate('/scan')} style={{ marginTop: '16px', width: 'auto' }}>Start Scanning</Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map(item => (
              <div key={item.cart_item_id} style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>₹{item.unit_price} {item.weight ? 'per kg' : 'each'}</div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '4px' }}>
                    <button onClick={() => updateItem(item.cart_item_id, item.quantity - 1)} disabled={item.quantity <= 1} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}><Minus size={16} /></button>
                    <span style={{ minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateItem(item.cart_item_id, item.quantity + 1)} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}><Plus size={16} /></button>
                  </div>
                  <div style={{ fontWeight: 600, minWidth: '60px', textAlign: 'right' }}>₹{item.line_total}</div>
                  <button onClick={() => removeItem(item.cart_item_id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}>
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && billSummary && (
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', marginTop: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.125rem' }}>Bill Summary</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#4b5563' }}>
              <span>Subtotal</span>
              <span>₹{billSummary.subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#4b5563' }}>
              <span>Taxes</span>
              <span>₹{billSummary.tax_total}</span>
            </div>
            {billSummary.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#10b981' }}>
                <span>Discount</span>
                <span>-₹{billSummary.discount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #e5e7eb', fontWeight: 700, fontSize: '1.25rem' }}>
              <span>Grand Total</span>
              <span>₹{billSummary.grand_total}</span>
            </div>
            
            <div style={{ marginTop: '24px' }}>
              <Button 
                onClick={handleCheckout} 
                disabled={items.length === 0 || loadingCheckout} 
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '1.125rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: (items.length === 0 || loadingCheckout) ? 0.7 : 1
                }}
              >
                {loadingCheckout ? 'Verifying...' : 'Proceed to Checkout'}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
