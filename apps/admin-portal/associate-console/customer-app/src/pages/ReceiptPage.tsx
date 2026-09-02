import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { getReceipt } from '../services/api/payment';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle, Home, FileText } from 'lucide-react';

export const ReceiptPage: React.FC = () => {
  const { sessionId } = useSession();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }

    getReceipt(sessionId)
      .then((res: any) => {
        setReceipt(res.data);
        setLoading(false);
      })
      .catch((_err: any) => {
        setError('Failed to load receipt.');
        setLoading(false);
      });
  }, [sessionId, navigate]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f9fafb' }}>Loading...</div>;
  }

  if (error || !receipt) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f9fafb', color: '#ef4444' }}>{error}</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingBottom: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <div style={{ backgroundColor: '#10b981', width: '100%', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'white' }}>
        <CheckCircle size={64} style={{ marginBottom: '16px' }} />
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Payment Successful</h1>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>Receipt No: {receipt.receipt_no}</p>
      </div>

      <main style={{ padding: '24px', width: '100%', maxWidth: '600px', marginTop: '-20px' }}>
        
        {/* QR Code Section */}
        <div style={{ backgroundColor: '#fff', padding: '32px 24px', borderRadius: '16px', marginBottom: '24px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', color: '#1f2937' }}>Exit QR Pass</h2>
          <p style={{ color: '#6b7280', margin: '0 0 24px 0', textAlign: 'center', fontSize: '0.875rem' }}>Scan this code at the exit gates. Valid for 30 minutes.</p>
          
          <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '12px' }}>
            {/* The exit_pass logic in backend creates a UUID and stores it in Redis. For the customer app, we just encode the token string or JSON. */}
            <QRCodeSVG value={receipt.exit_pass_hint} size={200} level="H" />
          </div>
        </div>

        {/* Receipt Details */}
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', marginBottom: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#1f2937' }}>
            <FileText size={20} />
            Bill Details
          </h3>
          
          <div style={{ marginBottom: '16px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
            {receipt.items.map((item: any) => (
              <div key={item.cart_item_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontWeight: 500 }}>{item.quantity}x </span>
                  <span style={{ color: '#4b5563' }}>SKU: {item.sku}</span>
                </div>
                <span style={{ fontWeight: 500 }}>₹{item.line_total}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#4b5563' }}>
            <span>Subtotal</span>
            <span>₹{receipt.bill_summary.subtotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#4b5563' }}>
            <span>Taxes</span>
            <span>₹{receipt.bill_summary.tax_total}</span>
          </div>
          {receipt.bill_summary.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#10b981' }}>
              <span>Discount</span>
              <span>-₹{receipt.bill_summary.discount}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #e5e7eb', fontWeight: 700, fontSize: '1.25rem', color: '#1f2937' }}>
            <span>Total Paid</span>
            <span>₹{receipt.bill_summary.grand_total}</span>
          </div>
        </div>

        <button
          onClick={() => {
            // In a real app we'd clear session and start over. Let's just navigate to Entry
            navigate('/');
          }}
          style={{
            width: '100%',
            backgroundColor: '#f3f4f6',
            color: '#1f2937',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '1.125rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Home size={20} />
          Return to Home
        </button>
      </main>
    </div>
  );
};
