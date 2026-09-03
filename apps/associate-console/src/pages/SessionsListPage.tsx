import React, { useEffect, useState } from 'react';
import { Card, Badge } from '@scango/ui';
import { adminApi } from '../services/api/admin';

export const SessionsListPage: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    adminApi.fetchActiveSessions().then(setSessions);
    const interval = setInterval(() => adminApi.fetchActiveSessions().then(setSessions), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: 'var(--letter-spacing-tight)' }}>Live Sessions</h1>
      <p style={{ margin: '0 0 32px', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>{sessions.length} active sessions</p>

      <Card padding="none">
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Session ID</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Verification</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Items</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Value</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border-light)', transition: 'background var(--transition-fast)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{s.id?.substring(0, 8)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge variant={s.status === 'ACTIVE' ? 'success' : 'warning'}>{s.status}</Badge>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge variant={s.verification_status === 'HELD' ? 'danger' : 'default'}>{s.verification_status || 'N/A'}</Badge>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-text)' }}>{s.item_count || 0}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text)' }}>\u20B9{s.total_value || 0}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    {s.status === 'ACTIVE' && (
                      <button 
                        onClick={() => adminApi.pauseSession(s.id).then(() => adminApi.fetchActiveSessions().then(setSessions))}
                        style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-bg)', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
                      >
                        Pause
                      </button>
                    )}
                    {s.status === 'PAUSED' && (
                      <button 
                        onClick={() => adminApi.resumeSession(s.id).then(() => adminApi.fetchActiveSessions().then(setSessions))}
                        style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)', border: '1px solid var(--color-primary)', borderRadius: '4px', background: 'var(--color-primary-light)', cursor: 'pointer', color: 'var(--color-primary)' }}
                      >
                        Resume
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
