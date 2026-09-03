import React, { useState, useEffect } from 'react';
import { Card, Button, Toast, Spinner } from '@scango/ui';
import { CheckCircle, RefreshCw, ScanLine, Banknote, LogOut } from 'lucide-react';
import { adminApi, Session } from '../services/api/admin';
import { Scanner } from '../components/Scanner';

export const ScanAndVerifyPage: React.FC = () => {
  // Common State
  const [useScanner, setUseScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });
  const [passData, setPassData] = useState<any>(null); // For exit pass success display
  const [previewBill, setPreviewBill] = useState<{session_id: string, otp: string, bill: any} | null>(null);

  // Payment State
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [paySessionId, setPaySessionId] = useState('');
  const [payOtp, setPayOtp] = useState('');

  // Exit Pass State
  const [exitToken, setExitToken] = useState('');

  // UI Tabs for Manual Entry
  const [activeTab, setActiveTab] = useState<'payment' | 'exit'>('payment');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const data = await adminApi.fetchActiveSessions('STORE_001');
      setActiveSessions(data.filter(s => s.status === 'CHECKOUT' || s.status === 'ACTIVE'));
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const processPayment = async (sessionId: string, otp: string) => {
    setLoading(true);
    setPassData(null);
    try {
      await adminApi.verifyCounterPayment(sessionId, otp);
      setToast({ visible: true, message: 'Payment successfully verified!', type: 'success' });
      setPaySessionId('');
      setPayOtp('');
      setPreviewBill(null);
      fetchSessions();
      setUseScanner(false);
    } catch (err: any) {
      setToast({ visible: true, message: err.response?.data?.message || 'Verification failed. Invalid OTP.', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(t => ({ ...t, visible: false })), 5000);
    }
  };

  const processExitPass = async (token: string) => {
    setLoading(true);
    setPassData(null);
    try {
      const res = await adminApi.validateExitPass(token.trim());
      setPassData(res.data);
      setToast({ visible: true, message: 'Exit Pass Validated!', type: 'success' });
      setExitToken('');
      setUseScanner(false);
    } catch (err: any) {
      setToast({ visible: true, message: err.response?.data?.message || 'Invalid or already used exit pass.', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(t => ({ ...t, visible: false })), 5000);
    }
  };

  const fetchPreview = async (sessionId: string, otp: string) => {
    setLoading(true);
    try {
      const bill = await adminApi.getSessionBill(sessionId);
      setPreviewBill({ session_id: sessionId, otp, bill });
      setUseScanner(false);
    } catch (err: any) {
      setToast({ visible: true, message: err.response?.data?.message || 'Failed to fetch bill summary', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUniversalScan = (data: string) => {
    // 1. Check if it's a JSON payload (Counter Payment)
    try {
      const parsed = JSON.parse(data);
      if (parsed.session_id && parsed.otp) {
        fetchPreview(parsed.session_id, parsed.otp);
        return;
      }
    } catch (err) {
      // Not JSON, assume it's an Exit Pass token
    }

    // 2. Treat as Exit Pass Token
    processExitPass(data);
  };

  const handleManualPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paySessionId || !payOtp) return;
    fetchPreview(paySessionId, payOtp);
  };

  const handleManualExit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exitToken) return;
    processExitPass(exitToken);
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-text)' }}>Scan & Verify</h1>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>Process counter payments and validate exit passes in one place</p>
      </div>

      {previewBill && (
        <Card padding="lg" style={{ width: '100%', maxWidth: '480px', marginBottom: '24px', animation: 'scango-fade-in 0.2s' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 'var(--font-size-xl)' }}>Verify Customer Bill</h2>
          <div style={{ backgroundColor: 'var(--color-bg-warm)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
            <p style={{ margin: '0 0 8px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Session: <strong style={{color: 'var(--color-text)'}}>{previewBill.session_id.split('-')[0]}</strong></p>
            <p style={{ margin: '0', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Items Count: <strong style={{color: 'var(--color-text)'}}>{previewBill.bill?.bill_summary?.total_items || 0}</strong></p>
          </div>
          
          <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
            {previewBill.bill?.items?.map((item: any) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--color-border-light)' }}>
                <span>{item.quantity}x {item.name}</span>
                <span>₹{(item.unit_price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '24px' }}>
            <span>Total to Collect:</span>
            <span style={{ color: 'var(--color-primary)' }}>₹{previewBill.bill?.bill_summary?.grand_total || '0.00'}</span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button onClick={() => setPreviewBill(null)} variant="secondary" fullWidth disabled={loading}>Cancel</Button>
            <Button onClick={() => processPayment(previewBill.session_id, previewBill.otp)} fullWidth disabled={loading}>
              {loading ? <Spinner size={20} /> : <><CheckCircle size={20} /> Confirm Payment</>}
            </Button>
          </div>
        </Card>
      )}

      {/* Universal Scanner Toggle */}
      <div style={{ width: '100%', maxWidth: '480px', marginBottom: '24px' }}>
        <Button onClick={() => setUseScanner(!useScanner)} variant="secondary" fullWidth size="lg">
          <ScanLine size={18} style={{ marginRight: '8px' }} />
          {useScanner ? 'Close Scanner' : 'Open Universal Scanner'}
        </Button>
      </div>

      {/* Active Scanner */}
      {useScanner && (
        <Card padding="lg" style={{ width: '100%', maxWidth: '480px', marginBottom: '24px', backgroundColor: 'var(--color-bg-card)', border: '2px solid var(--color-primary)' }}>
          <p style={{ textAlign: 'center', margin: '0 0 16px', fontWeight: 600, color: 'var(--color-primary)' }}>
            Point at any Customer QR Code
          </p>
          <Scanner onScan={handleUniversalScan} />
          <p style={{ textAlign: 'center', margin: '16px 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            Automatically detects Payments vs Exit Passes
          </p>
        </Card>
      )}

      {/* Exit Pass Success Display (Populates when pass is approved) */}
      {passData && (
        <Card padding="lg" style={{ width: '100%', maxWidth: '480px', marginBottom: '24px', backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <CheckCircle size={32} color="var(--color-success)" />
            <div>
              <h2 style={{ margin: 0, fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-success)' }}>Pass Approved</h2>
              <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-success)' }}>Customer may exit</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--font-size-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Session:</span>
              <span style={{ fontWeight: 600 }}>{passData.session_id.split('-')[0]}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Generated:</span>
              <span style={{ fontWeight: 600 }}>{new Date(passData.generated_at).toLocaleTimeString()}</span>
            </div>
          </div>
          <Button onClick={() => setPassData(null)} style={{ marginTop: '16px' }} variant="secondary" fullWidth>Clear</Button>
        </Card>
      )}

      {/* Manual Entry Tabs */}
      <Card padding="none" style={{ width: '100%', maxWidth: '480px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
          <button
            onClick={() => setActiveTab('payment')}
            style={{
              flex: 1, padding: '16px', background: activeTab === 'payment' ? 'var(--color-bg-card)' : 'var(--color-bg)',
              border: 'none', borderBottom: activeTab === 'payment' ? '2px solid var(--color-primary)' : '2px solid transparent',
              cursor: 'pointer', fontWeight: activeTab === 'payment' ? 600 : 500,
              color: activeTab === 'payment' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <Banknote size={18} /> Manual Payment
          </button>
          <button
            onClick={() => setActiveTab('exit')}
            style={{
              flex: 1, padding: '16px', background: activeTab === 'exit' ? 'var(--color-bg-card)' : 'var(--color-bg)',
              border: 'none', borderBottom: activeTab === 'exit' ? '2px solid var(--color-primary)' : '2px solid transparent',
              cursor: 'pointer', fontWeight: activeTab === 'exit' ? 600 : 500,
              color: activeTab === 'exit' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <LogOut size={18} /> Manual Exit
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {activeTab === 'payment' ? (
            <form onSubmit={handleManualPayment}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Select Active Session</label>
                  <button type="button" onClick={fetchSessions} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-xs)' }}>
                    <RefreshCw size={12} className={loadingSessions ? 'spin' : ''} /> Refresh
                  </button>
                </div>
                <select
                  value={paySessionId}
                  onChange={e => setPaySessionId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-sm)', boxSizing: 'border-box', outline: 'none', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                >
                  <option value="" disabled>-- Select a customer session --</option>
                  {activeSessions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.id.split('-')[0]}... ({s.item_count} items, ₹{s.total_value})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: '8px', color: 'var(--color-text-secondary)' }}>6-Digit OTP</label>
                <input
                  type="text"
                  value={payOtp}
                  onChange={e => setPayOtp(e.target.value)}
                  placeholder="123456"
                  required
                  maxLength={6}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-2xl)', letterSpacing: '0.3em', textAlign: 'center', fontFamily: 'var(--font-family-mono)', boxSizing: 'border-box', outline: 'none', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                />
              </div>
              <Button type="submit" disabled={loading || !paySessionId || !payOtp} fullWidth size="lg">
                {loading ? <Spinner size={20} /> : <><CheckCircle size={20} /> Verify Payment</>}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleManualExit}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: '8px', color: 'var(--color-text-secondary)' }}>Exit Pass Token</label>
                <input
                  type="text"
                  value={exitToken}
                  onChange={(e) => setExitToken(e.target.value)}
                  placeholder="Scan physical barcode or paste token..."
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)', fontSize: 'var(--font-size-base)',
                    boxSizing: 'border-box', outline: 'none', backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                  }}
                  autoFocus
                />
                <p style={{ margin: '8px 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  Use this if your physical USB barcode scanner acts as a keyboard.
                </p>
              </div>
              <Button type="submit" disabled={loading || !exitToken} fullWidth size="lg">
                {loading ? <Spinner size={20} /> : <><CheckCircle size={20} /> Validate Pass</>}
              </Button>
            </form>
          )}
        </div>
      </Card>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast(t => ({ ...t, visible: false }))} />
    </div>
  );
};
