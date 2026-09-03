import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useSession } from '../contexts/SessionContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button, Card, PageHeader, EmptyState, Spinner } from '@scango/ui';
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <PageHeader title="My Cart" onBack={() => navigate('/scan')} />

      <main style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', paddingBottom: '24px' }}>
        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={48} />}
            title="Your cart is empty"
            description="Start scanning products to add them to your cart."
            action={<Button onClick={() => navigate('/scan')}>Start Scanning</Button>}
          />
        ) : (
          <>
            {/* Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {items.map(item => (
                <Card key={item.cart_item_id} padding="md">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {/* Product info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Product circle avatar */}
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--color-bg-warm-accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            fontSize: 'var(--font-size-xl)',
                          }}
                        >
                          {item.name?.charAt(0) || '?'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: 'var(--font-size-base)', margin: 0, color: 'var(--color-text)' }}>
                            {item.name}
                          </p>
                          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                            ₹{item.unit_price} {item.weight ? 'per kg' : 'each'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <p style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', margin: 0, color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
                      ₹{item.line_total}
                    </p>
                  </div>

                  {/* Actions row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border-light)' }}>
                    <button
                      onClick={() => removeItem(item.cart_item_id)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-xs)' }}
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>

                    {/* Quantity controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <button
                        onClick={() => updateItem(item.cart_item_id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        style={{ background: 'none', border: 'none', padding: '6px 12px', cursor: 'pointer', color: 'var(--color-text)', opacity: item.quantity <= 1 ? 0.3 : 1 }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItem(item.cart_item_id, item.quantity + 1)}
                        style={{ background: 'none', border: 'none', padding: '6px 12px', cursor: 'pointer', color: 'var(--color-text)' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            {billSummary && (
              <Card padding="lg">
                <h2 style={{ margin: '0 0 16px 0', fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-text)' }}>
                  Order Summary
                </h2>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>Subtotal</span>
                  <span style={{ color: 'var(--color-text)', fontSize: 'var(--font-size-sm)' }}>₹{billSummary.subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>Taxes</span>
                  <span style={{ color: 'var(--color-text)', fontSize: 'var(--font-size-sm)' }}>₹{billSummary.tax_total}</span>
                </div>
                {billSummary.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-sm)' }}>Promo discount</span>
                    <span style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-sm)' }}>-₹{billSummary.discount}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                  <span style={{ fontWeight: 700, fontSize: 'var(--font-size-xl)', color: 'var(--color-text)' }}>Total</span>
                  <span style={{ fontWeight: 700, fontSize: 'var(--font-size-xl)', color: 'var(--color-text)' }}>₹{billSummary.grand_total}</span>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <Button
                    onClick={handleCheckout}
                    disabled={items.length === 0 || loadingCheckout}
                    fullWidth
                    size="lg"
                  >
                    {loadingCheckout ? (
                      <><Spinner size={18} color="var(--color-text-inverse)" /> Verifying...</>
                    ) : (
                      'Checkout'
                    )}
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
};
