import React, { useState, useEffect } from 'react';
import { Card, StatusDot, Button } from '@scango/ui';
import { ExternalLink, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

const SERVICE_HEALTH_ENDPOINTS = [
  { name: 'API Gateway', path: '/health' },
  { name: 'Identity Service', path: `${API_BASE}/identity-service/health` },
  { name: 'Session Service', path: `${API_BASE}/session-service/health` },
  { name: 'Cart Service', path: `${API_BASE}/cart-service/health` },
  { name: 'Catalog Service', path: `${API_BASE}/catalog-service/health` },
  { name: 'Payment Service', path: `${API_BASE}/payment-service/health` },
  { name: 'Inventory Service', path: `${API_BASE}/inventory-service/health` },
  { name: 'Verification Service', path: `${API_BASE}/verification-service/health` },
  { name: 'Notification Service', path: `${API_BASE}/notification-service/health` },
  { name: 'Audit Service', path: `${API_BASE}/audit-service/health` },
  { name: 'Analytics Service', path: `${API_BASE}/analytics-service/health` },
];

export const SystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = async () => {
    setRefreshing(true);
    try {
      const results = await Promise.all(
        SERVICE_HEALTH_ENDPOINTS.map(async (svc) => {
          const start = Date.now();
          try {
            await axios.get(svc.path, { timeout: 5000 });
            return { name: svc.name, status: 'healthy', latency: `${Date.now() - start}ms` };
          } catch {
            return { name: svc.name, status: 'unhealthy', latency: `${Date.now() - start}ms` };
          }
        })
      );
      const allHealthy = results.every(r => r.status === 'healthy');
      setHealth({ status: allHealthy ? 'healthy' : 'degraded', services: results });
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Health check failed', e);
    } finally {
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
