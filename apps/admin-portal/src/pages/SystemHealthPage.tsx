import { useEffect, useState } from 'react';

const SERVICES = [
  { name: 'API Gateway', url: 'http://localhost:3000/health' },
  { name: 'Auth / Identity', url: 'http://localhost:3001/health' },
  { name: 'Session', url: 'http://localhost:3003/health' },
  { name: 'Catalog', url: 'http://localhost:3004/health' },
  { name: 'Cart', url: 'http://localhost:3005/health' },
  { name: 'Pricing', url: 'http://localhost:3006/health' },
  { name: 'Inventory', url: 'http://localhost:3007/health' },
  { name: 'Promo', url: 'http://localhost:3008/health' },
  { name: 'Payment', url: 'http://localhost:3009/health' },
  { name: 'Audit', url: 'http://localhost:3010/health' },
  { name: 'Notification', url: 'http://localhost:3011/health' },
  { name: 'Verification', url: 'http://localhost:3012/health' },
];

export function SystemHealthPage() {
  const [statuses, setStatuses] = useState<Record<string, 'up' | 'down' | 'loading'>>({});

  const checkHealth = async () => {
    const newStatuses: Record<string, 'up' | 'down' | 'loading'> = {};
    for (const service of SERVICES) {
      newStatuses[service.name] = 'loading';
    }
    setStatuses({ ...newStatuses });

    await Promise.all(
      SERVICES.map(async (service) => {
        try {
          // Add a timestamp to bypass fetch caching
          const res = await fetch(`${service.url}?t=${Date.now()}`);
          if (res.ok) {
            newStatuses[service.name] = 'up';
          } else {
            newStatuses[service.name] = 'down';
          }
        } catch (e) {
          newStatuses[service.name] = 'down';
        }
      })
    );
    setStatuses({ ...newStatuses });
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>System Health Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {SERVICES.map((svc) => (
          <div key={svc.name} style={{
            padding: '16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>{svc.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: statuses[svc.name] === 'up' ? '#10b981' : statuses[svc.name] === 'down' ? '#ef4444' : '#f59e0b',
                marginRight: '8px'
              }} />
              <span style={{ textTransform: 'capitalize', color: '#374151' }}>{statuses[svc.name] || 'loading'}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Infrastructure Dependencies</h2>
        <p style={{ color: '#6b7280' }}>
          *See <a href="http://localhost:3000" target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>Grafana Dashboards</a> for detailed infrastructure metrics (Postgres, Redis, Kafka, Elasticsearch).
        </p>
      </div>
    </div>
  );
}
