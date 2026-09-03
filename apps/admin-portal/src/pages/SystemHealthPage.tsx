import React, { useState, useEffect } from 'react';
import { Card, StatusDot, Button } from '@scango/ui';
import { ExternalLink, RefreshCw } from 'lucide-react';

export const SystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = async () => {
    setRefreshing(true);
    try {
      // Mock health check since we don't have a real aggregated health endpoint yet
      setTimeout(() => {
        setHealth({
          status: 'healthy',
          services: [
            { name: 'API Gateway', status: 'healthy', latency: '12ms' },
            { name: 'Auth Service', status: 'healthy', latency: '24ms' },
            { name: 'Cart Service', status: 'healthy', latency: '18ms' },
            { name: 'Catalog Service', status: 'healthy', latency: '35ms' },
            { name: 'Payment Service', status: 'healthy', latency: '42ms' },
            { name: 'Verification Service', status: 'healthy', latency: '15ms' },
            { name: 'MongoDB Atlas', status: 'healthy', latency: '58ms' },
            { name: 'PostgreSQL', status: 'healthy', latency: '8ms' },
            { name: 'Redis Cache', status: 'healthy', latency: '2ms' },
          ]
        });
        setLastUpdated(new Date());
        setRefreshing(false);
      }, 800);
    } catch (e) {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px', fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: 'var(--letter-spacing-tight)' }}>System Health</h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="outline" size="sm" onClick={fetchHealth} disabled={refreshing}>
            <RefreshCw size={16} style={{ animation: refreshing ? 'scango-spin 1s linear infinite' : 'none' }} />
            Refresh
          </Button>
          <Button variant="secondary" size="sm">
            <ExternalLink size={16} />
            Grafana
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {health?.services.map((svc: any) => (
          <Card key={svc.name} padding="md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: 600 }}>{svc.name}</p>
              <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)' }}>{svc.latency}</p>
            </div>
            <StatusDot status={svc.status === 'healthy' ? 'online' : 'offline'} label={svc.status === 'healthy' ? 'Healthy' : 'Down'} />
          </Card>
        ))}
      </div>
    </div>
  );
};
