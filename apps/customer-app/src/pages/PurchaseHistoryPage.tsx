import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Button, Card, Spinner, PageHeader } from '@scango/ui';
import { Receipt, ChevronRight, ShoppingBag } from 'lucide-react';

interface ReceiptSummary {
  receipt_id: string;
  receipt_no: string;
  store_id: string;
  total: number;
  item_count: number;
  payment_method: string;
  date: string;
}

export const PurchaseHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [receipts, setReceipts] = useState<ReceiptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userProfile?.uid) {
      navigate('/');
      return;
    }
    api.get(`/customers/${userProfile.uid}/receipts`)
      .then(res => {
        setReceipts(res.data.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load purchase history.');
        setLoading(false);
      });
  }, [userProfile, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--color-bg)' }}>
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <PageHeader title="Purchase History" onBack={() => navigate('/')} />

      <main style={{ padding: '20px', maxWidth: '480px', margin: '0 auto' }}>
        {error && (
          <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
            {error}
          </div>
        )}

        {receipts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <ShoppingBag size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px', fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text)' }}>No purchases yet</h3>
            <p style={{ margin: '0 0 24px', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>Your purchase history will appear here after your first transaction.</p>
            <Button onClick={() => navigate('/')} variant="secondary">Start Shopping</Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {receipts.map(receipt => (
              <Card
                key={receipt.receipt_id}
                padding="md"
                style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
                onClick={() => navigate(`/receipt/${receipt.receipt_id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Receipt size={20} style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>
                        {receipt.receipt_no}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        {new Date(receipt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' \u2022 '}
                        {receipt.item_count} item{receipt.item_count !== 1 ? 's' : ''}
                        {' \u2022 '}
                        {receipt.payment_method}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', color: 'var(--color-text)' }}>
                      ₹{receipt.total}
                    </span>
                    <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
