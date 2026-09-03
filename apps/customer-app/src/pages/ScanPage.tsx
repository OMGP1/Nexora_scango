import React, { useState } from 'react';
import { Scanner } from '../components/Scanner';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useSession } from '../contexts/SessionContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, LogOut, FileText, HelpCircle } from 'lucide-react';
import { Button, PageHeader, BottomBar, Card, Input } from '@scango/ui';
import api from '../services/api';

export const ScanPage: React.FC = () => {
  const { addItem, billSummary } = useCart();
  const { logout } = useAuth();
  const { sessionId } = useSession();
  const navigate = useNavigate();
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [helpRequested, setHelpRequested] = useState(false);

  const requestHelp = async () => {
    if (!sessionId || helpRequested) return;
    try {
      setHelpRequested(true);
      await api.post(`/sessions/${sessionId}/help`);
      setTimeout(() => setHelpRequested(false), 60000); // disable for 1 min
    } catch (e) {
      console.error('Failed to request help', e);
      setHelpRequested(false);
    }
  };

  const handleScan = async (barcode: string) => {
    try {
      try { navigator.vibrate?.(100); } catch (_) {}
      await addItem(barcode);
      setLastScanned(barcode);
      setTimeout(() => setLastScanned(null), 2000);
    } catch (e: any) {
      console.error('Scan error or duplicate', e);
      alert(e.response?.data?.message || 'Failed to add item. Product may not exist.');
    }
  };

  const handleManualAdd = () => {
    if (manualBarcode.trim()) {
      handleScan(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)', paddingBottom: 'var(--bottom-bar-height)' }}>
      <PageHeader 
        title="Scan Items" 
        actions={
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => navigate('/history')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}>
              <FileText size={20} />
            </button>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
              <LogOut size={20} />
            </button>
          </div>
        }
      />

      {/* Scanner */}
      <Scanner onScan={handleScan} />

      {/* Success flash */}
      {lastScanned && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            fontWeight: 600,
            fontSize: 'var(--font-size-sm)',
            animation: 'scango-fade-in 0.2s ease-out',
          }}
        >
          <Check size={16} />
          Item added to cart
        </div>
      )}

      {/* Manual entry */}
      <div style={{ padding: '16px 20px' }}>
        <Card padding="md">
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: '0 0 12px 0' }}>
            Or enter barcode manually
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Input
              placeholder="e.g. 8901030875021"
              value={manualBarcode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManualBarcode(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleManualAdd()}
              style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-sm)' }}
            />
            <Button variant="primary" size="sm" onClick={handleManualAdd} style={{ flexShrink: 0 }}>
              Add
            </Button>
          </div>
        </Card>
      </div>

      {/* Help Button */}
      <div style={{ position: 'fixed', bottom: 'var(--bottom-bar-height)', right: '16px', transform: 'translateY(-16px)', zIndex: 100 }}>
        <button 
          onClick={requestHelp}
          disabled={helpRequested}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: helpRequested ? 'var(--color-success)' : 'var(--color-bg-card)',
            color: helpRequested ? 'white' : 'var(--color-primary)',
            padding: '12px 16px', borderRadius: '30px', border: helpRequested ? 'none' : '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)', fontWeight: 600, fontSize: 'var(--font-size-sm)', cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {helpRequested ? <Check size={18} /> : <HelpCircle size={18} />}
          {helpRequested ? 'Help on the way' : 'Need Help?'}
        </button>
      </div>

      {/* Bottom bar */}
      <BottomBar>
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            {billSummary?.item_count || 0} items
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.2 }}>
            ₹{billSummary?.grand_total || 0}
          </div>
        </div>
        <Button onClick={() => navigate('/cart')} size="md">
          <ShoppingCart size={18} />
          View Cart
        </Button>
      </BottomBar>
    </div>
  );
};
