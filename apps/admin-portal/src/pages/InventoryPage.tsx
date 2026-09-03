import React, { useState, useEffect } from 'react';
import { Card, Button, Toast, Spinner } from '@scango/ui';
import { Plus, Minus, Search, BarChart3, Scan } from 'lucide-react';
import { adminApi } from '../services/api/admin';
import { Scanner } from '../components/Scanner';

export const InventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });

  // Receive stock modal state
  const [showReceive, setShowReceive] = useState(false);
  const [receiveSku, setReceiveSku] = useState('');
  const [receiveQty, setReceiveQty] = useState(0);
  const [receiveLoading, setReceiveLoading] = useState(false);
  const [showScannerReceive, setShowScannerReceive] = useState(false);

  // Adjust stock modal state
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustSku, setAdjustSku] = useState('');
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [showScannerAdjust, setShowScannerAdjust] = useState(false);

  const storeId = 'STORE_001';

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await adminApi.fetchInventory(storeId);
      setInventory(data);
    } catch {
      setToast({ visible: true, message: 'Failed to load inventory', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveStock = async () => {
    if (!receiveSku || receiveQty <= 0) return;
    setReceiveLoading(true);
    try {
      await adminApi.receiveStock(storeId, receiveSku, receiveQty, 'admin');
      setToast({ visible: true, message: `Received ${receiveQty} units of ${receiveSku}`, type: 'success' });
      setShowReceive(false);
      setReceiveSku('');
      setReceiveQty(0);
      await loadInventory();
    } catch {
      setToast({ visible: true, message: 'Failed to receive stock', type: 'error' });
    } finally {
      setReceiveLoading(false);
      setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
    }
  };

  const handleAdjustStock = async () => {
    if (!adjustSku || adjustQty === 0 || !adjustReason) return;
    setAdjustLoading(true);
    try {
      await adminApi.adjustStock(storeId, adjustSku, adjustQty, adjustReason, 'admin');
      setToast({ visible: true, message: `Adjusted ${adjustSku} by ${adjustQty}`, type: 'success' });
      setShowAdjust(false);
      setAdjustSku('');
      setAdjustQty(0);
      setAdjustReason('');
      await loadInventory();
    } catch {
      setToast({ visible: true, message: 'Failed to adjust stock', type: 'error' });
    } finally {
      setAdjustLoading(false);
      setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.sku.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)', fontSize: 'var(--font-size-sm)',
    boxSizing: 'border-box' as any, outline: 'none', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)',
  };

  const modalOverlay: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  };

  const modalContent: React.CSSProperties = {
    backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-xl)',
    padding: '32px', width: '100%', maxWidth: '440px', boxShadow: 'var(--shadow-card)',
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px', fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-text)' }}>Inventory</h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>Manage stock levels for {storeId}</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Button variant="secondary" onClick={() => setShowReceive(true)}><Plus size={16} /> Receive Stock</Button>
          <Button variant="secondary" onClick={() => setShowAdjust(true)}><Minus size={16} /> Adjust</Button>
        </div>
      </div>

      <Card padding="lg">
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input type="text" placeholder="Search by SKU..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '40px' }} />
          </div>
          <Button variant="ghost" onClick={loadInventory}><BarChart3 size={16} /> Refresh</Button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner size={32} /></div>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase' }}>SKU</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase' }}>Available</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase' }}>Reserved</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase' }}>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No inventory records. Use "Receive Stock" to add.</td></tr>
                ) : filteredInventory.map(item => (
                  <tr key={`${item.store_id}-${item.sku}`} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-xs)' }}>{item.sku}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: item.available_qty < 10 ? 'var(--color-danger)' : 'var(--color-text)' }}>{item.available_qty}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-text-secondary)' }}>{item.reserved_qty}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>{item.last_updated ? new Date(item.last_updated).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Receive Stock Modal */}
      {showReceive && (
        <div style={modalOverlay} onClick={() => setShowReceive(false)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 24px', fontSize: 'var(--font-size-xl)', fontWeight: 600 }}>Receive Stock</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                <span>SKU</span>
                <Button variant="ghost" size="sm" onClick={() => setShowScannerReceive(!showScannerReceive)} style={{ padding: '2px 8px', height: 'auto', fontSize: '12px' }}>
                  <Scan size={14} style={{ marginRight: '4px' }} /> {showScannerReceive ? 'Close Scanner' : 'Scan'}
                </Button>
              </label>
              <input style={inputStyle} value={receiveSku} onChange={e => setReceiveSku(e.target.value)} placeholder="e.g. SKU1001" />
              {showScannerReceive && (
                <div style={{ marginTop: '12px' }}>
                  <Scanner onScan={(code) => { setReceiveSku(code); setShowScannerReceive(false); }} />
                </div>
              )}
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>Quantity</label>
              <input type="number" style={inputStyle} value={receiveQty} onChange={e => setReceiveQty(parseInt(e.target.value) || 0)} placeholder="0" min={1} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setShowReceive(false)}>Cancel</Button>
              <Button onClick={handleReceiveStock} disabled={receiveLoading || !receiveSku || receiveQty <= 0}>
                {receiveLoading ? <Spinner size={16} /> : <><Plus size={16} /> Receive</>}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjust && (
        <div style={modalOverlay} onClick={() => setShowAdjust(false)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 24px', fontSize: 'var(--font-size-xl)', fontWeight: 600 }}>Adjust Stock</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                <span>SKU</span>
                <Button variant="ghost" size="sm" onClick={() => setShowScannerAdjust(!showScannerAdjust)} style={{ padding: '2px 8px', height: 'auto', fontSize: '12px' }}>
                  <Scan size={14} style={{ marginRight: '4px' }} /> {showScannerAdjust ? 'Close Scanner' : 'Scan'}
                </Button>
              </label>
              <input style={inputStyle} value={adjustSku} onChange={e => setAdjustSku(e.target.value)} placeholder="e.g. SKU1001" />
              {showScannerAdjust && (
                <div style={{ marginTop: '12px' }}>
                  <Scanner onScan={(code) => { setAdjustSku(code); setShowScannerAdjust(false); }} />
                </div>
              )}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>Quantity (+/-)</label>
              <input type="number" style={inputStyle} value={adjustQty} onChange={e => setAdjustQty(parseInt(e.target.value) || 0)} placeholder="Use negative to reduce" />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>Reason</label>
              <input style={inputStyle} value={adjustReason} onChange={e => setAdjustReason(e.target.value)} placeholder="e.g. Damaged goods, Count correction" />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setShowAdjust(false)}>Cancel</Button>
              <Button onClick={handleAdjustStock} disabled={adjustLoading || !adjustSku || adjustQty === 0 || !adjustReason}>
                {adjustLoading ? <Spinner size={16} /> : 'Adjust'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast(t => ({ ...t, visible: false }))} />
    </div>
  );
};
