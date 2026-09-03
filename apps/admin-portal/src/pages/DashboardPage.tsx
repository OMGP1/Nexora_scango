import React from 'react';
import { Card } from '@scango/ui';

const metrics = [
  { label: 'Total Stores', value: '4' },
  { label: 'Active Sessions', value: '23' },
  { label: 'Revenue Today', value: '\u20B91.2M' },
  { label: 'Exception Rate', value: '3.2%' },
];

export const DashboardPage: React.FC = () => {
  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: 'var(--letter-spacing-tight)' }}>Dashboard</h1>
      <p style={{ margin: '0 0 32px', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>Enterprise overview</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {metrics.map(m => (
          <Card key={m.label} padding="lg">
            <p style={{ margin: '0 0 8px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)', fontWeight: 500 }}>{m.label}</p>
            <p style={{ margin: 0, fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: 'var(--letter-spacing-tight)' }}>{m.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
