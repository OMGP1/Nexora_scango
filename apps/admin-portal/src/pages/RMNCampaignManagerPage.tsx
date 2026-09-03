import React, { useState } from 'react';
import { Card, Button, Input, PageHeader, Toast } from '@scango/ui';

interface Campaign {
  id: string;
  name: string;
  targetSku: string;
  adText: string;
  budget: number;
  status: 'active' | 'paused';
}

export const RMNCampaignManagerPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    { id: '1', name: 'Summer Soda Promo', targetSku: 'SKU-SODA-01', adText: 'Refresh your summer with 20% off!', budget: 5000, status: 'active' },
    { id: '2', name: 'Chips Multipack Launch', targetSku: 'SKU-CHIPS-MP', adText: 'New multipack available now.', budget: 2500, status: 'paused' },
  ]);

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    targetSku: '',
    adText: '',
    budget: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });

  const handleAddCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setCampaigns([...campaigns, { ...newCampaign, id: Math.random().toString(), status: 'active' }]);
    setNewCampaign({ name: '', targetSku: '', adText: '', budget: 0 });
    setIsSubmitting(false);
    setToast({ visible: true, message: 'Campaign created successfully', type: 'success' });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  const toggleStatus = (id: string) => {
    setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'paused' : 'active' } : c));
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <PageHeader title="Retail Media Network (RMN) Campaigns" subtitle="Manage targeted advertisements and promotions" />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        <Card style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>Active Campaigns</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Campaign</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Target SKU</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Budget</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ divideY: '1px solid var(--color-border)' }}>
                {campaigns.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 500 }}>{c.name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{c.adText}</div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--color-text-muted)' }}>{c.targetSku}</td>
                    <td style={{ padding: '16px', fontWeight: 500 }}>$</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '999px', 
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        backgroundColor: c.status === 'active' ? '#dcfce7' : '#f3f4f6',
                        color: c.status === 'active' ? '#166534' : '#4b5563'
                      }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <Button variant="outline" size="sm" onClick={() => toggleStatus(c.id)}>
                        {c.status === 'active' ? 'Pause' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>Create New Campaign</h2>
          <form onSubmit={handleAddCampaign} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <Input 
                label="Campaign Name" 
                value={newCampaign.name} 
                onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})} 
                required 
              />
              <Input 
                label="Target SKU / Category" 
                value={newCampaign.targetSku} 
                onChange={(e) => setNewCampaign({...newCampaign, targetSku: e.target.value})} 
                required 
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Ad Text</label>
              <textarea 
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '6px', 
                  border: '1px solid var(--color-border)',
                  minHeight: '100px',
                  fontFamily: 'inherit'
                }}
                value={newCampaign.adText} 
                onChange={(e) => setNewCampaign({...newCampaign, adText: e.target.value})} 
                required
              />
            </div>

            <div style={{ maxWidth: '300px' }}>
              <Input 
                label="Budget ($)" 
                type="number" 
                value={newCampaign.budget} 
                onChange={(e) => setNewCampaign({...newCampaign, budget: parseInt(e.target.value)})} 
                required 
              />
            </div>
            
            <div style={{ marginTop: '8px' }}>
              <Button type="submit" variant="primary" disabled={isSubmitting} loading={isSubmitting}>
                Create Campaign
              </Button>
            </div>
          </form>
        </Card>
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
