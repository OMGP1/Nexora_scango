import React, { useEffect, useState } from 'react';
import { adminApi, Session } from '../services/api/admin';
import { Check, X } from 'lucide-react';

export const VerificationQueuePage: React.FC = () => {
  const [queue, setQueue] = useState<Session[]>([]);

  const fetchQueue = () => {
    adminApi.fetchVerificationQueue().then(setQueue);
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleClear = async (id: string) => {
    const success = await adminApi.clearSession(id, 'Visual check passed');
    if (success) {
      fetchQueue();
    }
  };

  return (
    <div>
      <h1 style={{ margin: '0 0 24px 0', fontSize: '1.875rem' }}>Verification Queue (LP)</h1>
      
      {queue.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280', backgroundColor: 'white', borderRadius: '12px' }}>
          No sessions currently held.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {queue.map(s => (
            <div key={s.id} style={{ 
              backgroundColor: 'white', 
              padding: '24px', 
              borderRadius: '12px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontFamily: 'monospace', fontSize: '1.25rem' }}>{s.id}</h3>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '0.75rem', fontWeight: 600 }}>HELD</span>
                </div>
                <div style={{ color: '#4b5563', fontSize: '0.875rem' }}>
                  Customer: {s.customer_id} | Items: {s.item_count} | Value: ₹{s.total_value}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => handleClear(s.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
                  }}
                >
                  <Check size={18} /> Clear
                </button>
                <button 
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
                  }}
                >
                  <X size={18} /> Escalate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
