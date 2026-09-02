import React from 'react';
import { Scanner } from '../components/Scanner';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const ScanPage: React.FC = () => {
  const { addItem, billSummary } = useCart();
  const navigate = useNavigate();

  const handleScan = async (barcode: string) => {
    try {
      if (navigator.vibrate) navigator.vibrate(100);
      await addItem(barcode);
    } catch (e) {
      console.error('Scan error or duplicate', e);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f3f4f6' }}>
      <header style={{ padding: '16px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Scan Items</h1>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Scanner onScan={handleScan} />
        
        <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ color: '#4b5563', textAlign: 'center' }}>
            Point your camera at a barcode to add it to your cart.
          </p>
        </div>
      </main>

      <div style={{ padding: '16px', backgroundColor: '#fff', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total ({billSummary?.item_count || 0} items)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹{billSummary?.grand_total || 0}</div>
        </div>
        <div style={{ width: '120px' }}>
          <Button onClick={() => navigate('/cart')} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={18} /> Cart
          </Button>
        </div>
      </div>
    </div>
  );
};
