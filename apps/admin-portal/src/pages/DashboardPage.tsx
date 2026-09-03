import React, { useState, useEffect } from 'react';
import { Card, Spinner } from '@scango/ui';
import { adminApi } from '../services/api/admin';

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    activeSessions: 0,
    totalProducts: 0,
    totalInventoryValue: 0,
    lowStockItems: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [sessions, catalog, inventory] = await Promise.all([
          adminApi.fetchActiveSessions().catch(() => []),
          adminApi.fetchCatalog().catch(() => []),
          adminApi.fetchInventory().catch(() => []),
        ]);

        const activeSessions = sessions.filter((s: any) => s.status === 'ACTIVE' || s.status === 'CHECKOUT').length;
        const totalProducts = catalog.length;
        const totalInventoryValue = inventory.reduce((sum: number, item: any) => {
          const product = catalog.find((p: any) => p.sku === item.sku);
          return sum + (item.available_qty * (product?.unit_price || 0));
        }, 0);
        const lowStockItems = inventory.filter((item: any) => item.available_qty < 10).length;

        setMetrics({ activeSessions, totalProducts, totalInventoryValue, lowStockItems });
      } catch (e) {
        console.error('Failed to load dashboard metrics', e);
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spinner size={32} />
      </div>
    );
  }

  const cards = [
    { label: 'Active Sessions', value: metrics.activeSessions, color: 'var(--color-primary)' },
    { label: 'Total Products', value: metrics.totalProducts, color: 'var(--color-text)' },
    { label: 'Inventory Value', value: `\u20B9${metrics.totalInventoryValue.toLocaleString('en-IN')}`, color: 'var(--color-success)' },
    { label: 'Low Stock Items', value: metrics.lowStockItems, color: metrics.lowStockItems > 0 ? 'var(--color-danger)' : 'var(--color-text)' },
  ];

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: 'var(--letter-spacing-tight)' }}>Dashboard</h1>
      <p style={{ margin: '0 0 32px', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>Live enterprise overview — refreshes every 15s</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {cards.map(m => (
          <Card key={m.label} padding="lg">
            <p style={{ margin: '0 0 8px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)', fontWeight: 500 }}>{m.label}</p>
            <p style={{ margin: 0, fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: m.color, letterSpacing: 'var(--letter-spacing-tight)' }}>{m.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
