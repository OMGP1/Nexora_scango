import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export const NotificationBanner: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      width: '90%',
      maxWidth: '400px'
    }}>
      {notifications.map((notif) => {
        let bgColor = '#3b82f6';
        let icon = <Info size={20} color="white" />;
        
        if (notif.type === 'success') {
          bgColor = '#10b981';
          icon = <CheckCircle size={20} color="white" />;
        } else if (notif.type === 'warning' || notif.type === 'error') {
          bgColor = notif.type === 'error' ? '#ef4444' : '#f59e0b';
          icon = <AlertCircle size={20} color="white" />;
        }

        return (
          <div key={notif.id} style={{
            backgroundColor: bgColor,
            color: 'white',
            padding: '16px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'slideDown 0.3s ease-out forwards'
          }}>
            <div style={{ marginTop: '2px' }}>{icon}</div>
            <div style={{ flex: 1, fontSize: '0.95rem', lineHeight: 1.4 }}>
              {notif.message}
            </div>
            <button 
              onClick={() => removeNotification(notif.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
            >
              <X size={16} color="white" style={{ opacity: 0.8 }} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
