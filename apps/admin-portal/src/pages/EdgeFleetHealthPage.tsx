import React, { useState } from 'react';
import { Server, CheckCircle, XCircle, Activity } from 'lucide-react';
import { Card, PageHeader, Badge } from '@scango/ui';

interface EdgeAgent {
  id: string;
  type: 'Scale Daemon' | 'Tally Agent' | 'Marg Agent';
  storeId: string;
  lastHeartbeat: string;
  syncSuccessRate: number;
  status: 'Online' | 'Offline' | 'Degraded';
}

const mockAgents: EdgeAgent[] = [
  {
    id: 'agt-scl-001',
    type: 'Scale Daemon',
    storeId: 'store-101',
    lastHeartbeat: '2 mins ago',
    syncSuccessRate: 99.9,
    status: 'Online',
  },
  {
    id: 'agt-tal-042',
    type: 'Tally Agent',
    storeId: 'store-101',
    lastHeartbeat: '1 min ago',
    syncSuccessRate: 100,
    status: 'Online',
  },
  {
    id: 'agt-mrg-087',
    type: 'Marg Agent',
    storeId: 'store-205',
    lastHeartbeat: '45 mins ago',
    syncSuccessRate: 82.5,
    status: 'Degraded',
  },
  {
    id: 'agt-scl-002',
    type: 'Scale Daemon',
    storeId: 'store-304',
    lastHeartbeat: '2 hours ago',
    syncSuccessRate: 0,
    status: 'Offline',
  },
];

export const EdgeFleetHealthPage: React.FC = () => {
  const [agents] = useState<EdgeAgent[]>(mockAgents);

  const getStatusIcon = (status: EdgeAgent['status']) => {
    switch (status) {
      case 'Online': return <CheckCircle size={18} style={{ color: '#16a34a' }} />;
      case 'Offline': return <XCircle size={18} style={{ color: '#dc2626' }} />;
      case 'Degraded': return <Activity size={18} style={{ color: '#d97706' }} />;
    }
  };

  const getStatusBadge = (status: EdgeAgent['status']) => {
    switch (status) {
      case 'Online': return <Badge variant="success">Online</Badge>;
      case 'Offline': return <Badge variant="danger">Offline</Badge>;
      case 'Degraded': return <Badge variant="warning">Degraded</Badge>;
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <PageHeader title="Edge Fleet Health" subtitle="Monitor the status of all deployed edge agents across stores." />
      
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Agent ID</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Type</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Store ID</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Status</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Last Heartbeat</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Sync Success</th>
              </tr>
            </thead>
            <tbody style={{ divideY: '1px solid var(--color-border)' }}>
              {agents.map((agent) => (
                <tr key={agent.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Server size={16} style={{ color: 'var(--color-text-muted)' }} />
                      {agent.id}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--color-text-muted)' }}>{agent.type}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ fontFamily: 'monospace', backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>
                      {agent.storeId}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getStatusIcon(agent.status)}
                      {getStatusBadge(agent.status)}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--color-text-muted)' }}>{agent.lastHeartbeat}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 500, color: agent.syncSuccessRate < 90 ? (agent.syncSuccessRate === 0 ? '#dc2626' : '#d97706') : '#16a34a' }}>
                        {agent.syncSuccessRate}%
                      </span>
                    </div>
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
