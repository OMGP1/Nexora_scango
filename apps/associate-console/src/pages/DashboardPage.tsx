import React, { useEffect, useState } from 'react';
import { Card } from '@scango/ui';
import { adminApi } from '../services/api/admin';

export const DashboardPage: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    adminApi.fetchActiveSessions().then(setSessions);
  }, []);

  const activeSessions = sessions.filter(s => s.status === 'ACTIVE' || s.status === 'CHECKOUT');
  const heldSessions = sessions.filter(s => s.verification_status === 'HELD');
  const totalValue = activeSessions.reduce((sum: number, s: any) => sum + (s.total_value || 0), 0);

  const metrics = [
    { label: 'Active Sessions', value: activeSessions.length, color: 'var(--color-text)' },
    { label: 'Exceptions (Held)', value: heldSessions.length, color: heldSessions.length > 0 ? 'var(--color-danger)' : 'var(--color-text)' },
    { label: 'Active Cart Value', value: `\u20B9${totalValue.toLocaleString()}`, color: 'var(--color-text)' },
  ];

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: 'var(--letter-spacing-tight)' }}>Dashboard</h1>
      <p style={{ margin: '0 0 32px', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>Real-time store overview</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {metrics.map(m => (
          <Card key={m.label} padding="lg">
            <p style={{ margin: '0 0 8px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)', fontWeight: 500 }}>{m.label}</p>
            <p style={{ margin: 0, fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: m.color, letterSpacing: 'var(--letter-spacing-tight)' }}>{m.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
