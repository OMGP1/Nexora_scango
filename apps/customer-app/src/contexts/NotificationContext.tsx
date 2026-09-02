import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from './SessionContext';

interface NotificationContextType {
  notifications: any[];
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sessionId } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!sessionId) return;

    const token = localStorage.getItem('token') || '';
    const eventSourceUrl = `http://localhost:3000/api/v1/sessions/${sessionId}/notifications/stream?token=${token}`;
    const eventSource = new EventSource(eventSourceUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const newNotification = {
          id: Math.random().toString(36).substring(7),
          ...data,
        };
        
        setNotifications((prev) => [...prev, newNotification]);

        // Auto remove after 5 seconds
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id));
        }, 5000);
      } catch (err) {
        console.error('Failed to parse SSE message', err);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId]);

  const addNotification = (notification: any) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications((prev) => [...prev, { id, ...notification }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
