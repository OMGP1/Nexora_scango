import React, { useEffect, useState } from 'react';
import { adminApi, Session } from '../services/api/admin';

export const SessionsListPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    adminApi.fetchActiveSessions().then(setSessions);
  }, []);

  return (
    <div>
      <h1 style={{ margin: '0 0 24px 0', fontSize: '1.875rem' }}>Live Sessions</h1>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '16px', fontWeight: 600, color: '#4b5563' }}>Session ID</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#4b5563' }}>Customer ID</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#4b5563' }}>Status</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#4b5563' }}>Verification</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#4b5563' }}>Items</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#4b5563' }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '16px', color: '#111827', fontFamily: 'monospace' }}>{s.id}</td>
                <td style={{ padding: '16px', color: '#6b7280' }}>{s.customer_id}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '9999px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    backgroundColor: s.status === 'ACTIVE' ? '#d1fae5' : '#fef3c7',
                    color: s.status === 'ACTIVE' ? '#065f46' : '#92400e'
                  }}>
                    {s.status}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '9999px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    backgroundColor: s.verification_status === 'HELD' ? '#fee2e2' : '#f3f4f6',
                    color: s.verification_status === 'HELD' ? '#991b1b' : '#374151'
                  }}>
                    {s.verification_status}
                  </span>
                </td>
                <td style={{ padding: '16px', color: '#374151' }}>{s.item_count}</td>
                <td style={{ padding: '16px', color: '#374151' }}>₹{s.total_value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
