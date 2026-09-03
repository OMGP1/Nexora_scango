import React, { useEffect, useState } from 'react';
import { Card, Button, Badge, EmptyState } from '@scango/ui';
import { ShieldCheck } from 'lucide-react';
import { adminApi } from '../services/api/admin';

export const VerificationQueuePage: React.FC = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [clearingId, setClearingId] = useState<string | null>(null);

  const loadQueue = () => adminApi.fetchVerificationQueue().then(setQueue);

  useEffect(() => {
    loadQueue();
    const interval = setInterval(loadQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleClear = async (id: string) => {
    setClearingId(id);
    try {
      await adminApi.clearSession(id, 'Visual check passed');
      await loadQueue();
    } catch (e) {
      console.error('Failed to clear', e);
    } finally {
      setClearingId(null);
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: 'var(--letter-spacing-tight)' }}>Verification Queue</h1>
      <p style={{ margin: '0 0 32px', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>{queue.length} sessions held for review</p>

      {queue.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck size={48} />}
          title="All clear"
          description="No sessions are currently held for verification."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {queue.map(s => (
            <Card key={s.id} padding="lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{s.id?.substring(0, 8).toUpperCase()}</p>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Customer: {s.customer_id?.substring(0, 8) || 'Guest'}</p>
                </div>
                <Badge variant="danger">HELD</Badge>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border-light)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{s.item_count || 0} items \u2022 \u20B9{s.total_value || 0}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <Button variant="outline" size="sm" onClick={() => handleClear(s.id)} disabled={clearingId === s.id}>
                    {clearingId === s.id ? 'Clearing...' : 'Clear'}
                  </Button>
                  <Button variant="danger" size="sm">Escalate</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
