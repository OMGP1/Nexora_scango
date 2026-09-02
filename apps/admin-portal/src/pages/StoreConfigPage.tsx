import React, { useEffect, useState } from 'react';
import { adminApi, StoreConfig } from '../services/api/admin';
import { Save } from 'lucide-react';

export const StoreConfigPage: React.FC = () => {
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.fetchStoreConfig('store_1').then(setConfig);
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    await adminApi.updateStoreConfig(config.id, config);
    setSaving(false);
  };

  if (!config) return <div>Loading config...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.875rem' }}>Store Configuration: {config.name}</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, opacity: saving ? 0.7 : 1
          }}
        >
          <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px', maxWidth: '600px' }}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>Feature Flags</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Enable Self-Scan</div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Allow customers to use the self-scan mobile app.</div>
          </div>
          <input 
            type="checkbox" 
            checked={config.self_scan_enabled}
            onChange={(e) => setConfig({ ...config, self_scan_enabled: e.target.checked })}
            style={{ width: '24px', height: '24px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Verification Threshold (Risk %)</div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Baseline probability of random checks.</div>
          </div>
          <input 
            type="number" 
            step="0.01"
            value={config.verification_threshold}
            onChange={(e) => setConfig({ ...config, verification_threshold: parseFloat(e.target.value) })}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', width: '100px' }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Operating Hours</div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Store open/close schedule.</div>
          </div>
          <input 
            type="text" 
            value={config.operating_hours}
            onChange={(e) => setConfig({ ...config, operating_hours: e.target.value })}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', width: '150px' }}
          />
        </div>
      </div>
    </div>
  );
};
