import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Toast } from '@scango/ui';
import { adminApi } from '../services/api/admin';

export const StoreConfigPage: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });

  useEffect(() => {
    adminApi.fetchStoreConfig('STORE_001').then(setConfig);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateStoreConfig('STORE_001', config);
      setToast({ visible: true, message: 'Configuration saved successfully', type: 'success' });
      setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
    } catch (e) {
      setToast({ visible: true, message: 'Failed to save configuration', type: 'error' });
      setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (!config) return null;

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: 'var(--letter-spacing-tight)' }}>Store Configuration</h1>
      <p style={{ margin: '0 0 32px', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>Manage settings for STORE_001</p>

      <form onSubmit={handleSave} style={{ maxWidth: '600px' }}>
        <Card padding="lg" style={{ marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>Feature Flags</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: 500 }}>Self-Scan Checkout</p>
              <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Enable self-scan for this store</p>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '28px' }}>
              <input 
                type="checkbox" 
                checked={config.features?.self_scan_enabled || false}
                onChange={e => setConfig({ ...config, features: { ...config.features, self_scan_enabled: e.target.checked } })}
                style={{ opacity: 0, width: 0, height: 0 }} 
              />
              <span style={{ 
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                backgroundColor: config.features?.self_scan_enabled ? 'var(--color-primary)' : 'var(--color-border)', 
                transition: '.4s', borderRadius: '34px' 
              }}>
                <span style={{
                  position: 'absolute', content: '""', height: '20px', width: '20px', left: '4px', bottom: '4px',
                  backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                  transform: config.features?.self_scan_enabled ? 'translateX(20px)' : 'translateX(0)'
                }}/>
              </span>
            </label>
          </div>
        </Card>

        <Card padding="lg" style={{ marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>Verification Settings</h2>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>Base Risk Threshold (%)</label>
            <Input 
              type="number" 
              value={config.verification_rules?.base_risk_threshold || 0}
              onChange={e => setConfig({ ...config, verification_rules: { ...config.verification_rules, base_risk_threshold: parseInt(e.target.value) } })}
              min="0" max="100"
            />
            <p style={{ margin: '8px 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Carts above this risk score will be held for review.</p>
          </div>
        </Card>

        <Button type="submit" disabled={saving} size="lg">
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </form>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast(t => ({ ...t, visible: false }))} />
    </div>
  );
};
