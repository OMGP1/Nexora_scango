import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { useAuth } from '../contexts/AuthContext';
import { getReceipt, getCustomerReceiptById } from '../services/api/payment';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle, Home, ArrowLeft } from 'lucide-react';
import { Button, Card, Spinner } from '@scango/ui';

export const ReceiptPage: React.FC = () => {
  const { id: receiptId } = useParams<{ id: string }>();
  const { sessionId } = useSession();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (receiptId && userProfile?.uid) {
      getCustomerReceiptById(userProfile.uid, receiptId)
        .then((res: any) => { setReceipt(res.data); setLoading(false); })
        .catch(() => { setError('Failed to load receipt.'); setLoading(false); });
    } else if (sessionId) {
      getReceipt(sessionId)
        .then((res: any) => { setReceipt(res.data); setLoading(false); })
        .catch(() => { setError('Failed to load receipt.'); setLoading(false); });
    } else {
      navigate('/');
    }
  }, [receiptId, sessionId, userProfile, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--color-bg)' }}>
        <Spinner size={32} />
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-danger)' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {receiptId && (
        <div style={{ width: '100%', padding: '16px 20px', position: 'absolute', top: 0, left: 0 }}>
          <button onClick={() => navigate('/history')} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)', cursor: 'pointer', fontWeight: 500 }}>
            <ArrowLeft size={20} />
            Back to History
          </button>
        </div>
      )}
      {/* Success header */}
      <div
        style={{
          width: '100%',
          padding: receiptId ? '64px 20px 48px' : '40px 20px 48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'var(--color-bg)',
          animation: 'scango-fade-in 0.5s ease-out',
        }}
      >
        <div style={{ color: 'var(--color-success)', marginBottom: '16px' }}>
          <CheckCircle size={56} />
        </div>
        <h1 style={{ margin: 0, fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text)' }}>
          Payment Successful
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
          Receipt #{receipt.receipt_no}
        </p>
      </div>

      <main style={{ padding: '0 20px 40px', width: '100%', maxWidth: '480px', marginTop: '-20px' }}>
        {/* QR Code */}
        <Card padding="lg" style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: '0 0 4px 0', fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-text)' }}>
            Exit Pass
          </h2>
          <p style={{ color: 'var(--color-text-muted)', margin: '0 0 20px 0', fontSize: 'var(--font-size-xs)' }}>
            Show this QR code at the exit gate
          </p>
          <div style={{ display: 'inline-block', padding: '16px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-lg)' }}>
            <QRCodeSVG value={receipt.exit_pass_hint} size={180} level="H" />
          </div>
        </Card>

        {/* Bill details */}
        <Card padding="lg" style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text)' }}>
            Bill Details
          </h3>

          <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border-light)' }}>
            {receipt.items.map((item: any) => (
              <div key={item.cart_item_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{item.quantity}x</span> {item.sku}
                </span>
                <span style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>₹{item.line_total}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>Subtotal</span>
            <span style={{ fontSize: 'var(--font-size-sm)' }}>₹{receipt.bill_summary.subtotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>Taxes</span>
            <span style={{ fontSize: 'var(--font-size-sm)' }}>₹{receipt.bill_summary.tax_total}</span>
          </div>
          {receipt.bill_summary.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-sm)' }}>Discount</span>
              <span style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-sm)' }}>-₹{receipt.bill_summary.discount}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
            <span style={{ fontWeight: 700, fontSize: 'var(--font-size-xl)' }}>Total Paid</span>
            <span style={{ fontWeight: 700, fontSize: 'var(--font-size-xl)' }}>₹{receipt.bill_summary.grand_total}</span>
          </div>
        </Card>

        <Button
          onClick={() => navigate('/')}
          variant="secondary"
          fullWidth
          size="lg"
          style={{ marginBottom: '12px' }}
        >
          <Home size={18} />
          Shop Again
        </Button>
        <Button
          onClick={() => navigate('/history')}
          variant="ghost"
          fullWidth
          size="lg"
        >
          View Purchase History
        </Button>
      </main>
    </div>
  );
};
