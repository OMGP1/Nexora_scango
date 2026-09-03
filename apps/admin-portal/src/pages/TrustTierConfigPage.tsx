import React, { useState } from 'react';
import { Card, Button, Input, PageHeader, Toast } from '@scango/ui';

interface TrustTierSettings {
  bronze: { cleanExits: number; multiplier: number; auditRate: number };
  silver: { cleanExits: number; multiplier: number; auditRate: number };
  gold: { cleanExits: number; multiplier: number; auditRate: number };
}

export const TrustTierConfigPage: React.FC = () => {
  const [settings, setSettings] = useState<TrustTierSettings>({
    bronze: { cleanExits: 0, multiplier: 1.0, auditRate: 0.1 },
    silver: { cleanExits: 5, multiplier: 1.2, auditRate: 0.05 },
    gold: { cleanExits: 20, multiplier: 1.5, auditRate: 0.01 },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });

  const handleSave = async () => {
    setIsSaving(true);
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
    setToast({ visible: true, message: 'Settings saved successfully!', type: 'success' });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  const handleChange = (tier: keyof TrustTierSettings, field: keyof TrustTierSettings['bronze'], value: number) => {
    setSettings(prev => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [field]: value
      }
    }));
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <PageHeader title="Trust Tier Configuration" subtitle="Manage dynamic risk scoring based on customer history" />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {(['bronze', 'silver', 'gold'] as Array<keyof TrustTierSettings>).map((tier) => (
          <Card key={tier} style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, textTransform: 'capitalize', marginBottom: '20px', color: 'var(--color-text)' }}>{tier} Tier</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input 
                label="Clean Exits Required"
                type="number" 
                value={settings[tier].cleanExits}
                onChange={(e) => handleChange(tier, 'cleanExits', parseInt(e.target.value))}
              />
              
              <Input 
                label="Reward Multiplier"
                type="number" 
                step="0.1"
                value={settings[tier].multiplier}
                onChange={(e) => handleChange(tier, 'multiplier', parseFloat(e.target.value))}
              />
              
              <Input 
                label="Audit Rate (%)"
                type="number" 
                step="0.01"
                value={settings[tier].auditRate}
                onChange={(e) => handleChange(tier, 'auditRate', parseFloat(e.target.value))}
              />
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Button 
          variant="primary"
          onClick={handleSave}
          disabled={isSaving}
          loading={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>

      <Toast 
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(t => ({ ...t, visible: false }))}
      />
    </div>
  );
};
