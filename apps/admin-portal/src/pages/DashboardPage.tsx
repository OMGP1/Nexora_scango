import React from 'react';

export const DashboardPage: React.FC = () => {
  return (
    <div>
      <h1 style={{ margin: '0 0 24px 0', fontSize: '1.875rem' }}>Enterprise Dashboard</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Overview of global metrics across all stores.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Stores</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 700, marginTop: '8px' }}>14</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Active Sessions</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 700, marginTop: '8px' }}>284</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Revenue (Today)</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 700, marginTop: '8px', color: '#10b981' }}>₹1.2M</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Exception Rate</div>
          <div style={{ fontSize: '2.25rem', fontWeight: 700, marginTop: '8px', color: '#f59e0b' }}>3.2%</div>
        </div>
      </div>
    </div>
  );
};
