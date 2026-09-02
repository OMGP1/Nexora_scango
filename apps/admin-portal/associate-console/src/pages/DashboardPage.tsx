import React, { useEffect, useState } from 'react';
import { adminApi, Session } from '../services/api/admin';

export const DashboardPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    adminApi.fetchActiveSessions().then(setSessions);
  }, []);

  const activeCount = sessions.filter(s => s.status === 'ACTIVE' || s.status === 'CHECKOUT').length;
  const exceptionCount = sessions.filter(s => s.verification_status === 'HELD').length;
  const totalValue = sessions.reduce((sum, s) => sum + s.total_value, 0);

  return (
    <div>
      <h1 style={{ margin: '0 0 24px 0', fontSize: '1.875rem' }}>Store Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Active Sessions</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 700, marginTop: '8px' }}>{activeCount}</div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Exceptions (Held)</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 700, marginTop: '8px', color: exceptionCount > 0 ? '#ef4444' : 'inherit' }}>{exceptionCount}</div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Active Cart Value</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 700, marginTop: '8px', color: '#10b981' }}>₹{totalValue}</div>
        </div>

      </div>
    </div>
  );
};
