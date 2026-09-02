import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, AlertTriangle } from 'lucide-react';

export const Layout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/sessions', label: 'Live Sessions', icon: <Users size={20} /> },
    { path: '/verification-queue', label: 'Verification Queue', icon: <AlertTriangle size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: '#1f2937', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', fontSize: '1.5rem', fontWeight: 'bold', borderBottom: '1px solid #374151' }}>
          Associate Console
        </div>
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 24px',
                  color: isActive ? 'white' : '#9ca3af',
                  textDecoration: 'none',
                  backgroundColor: isActive ? '#374151' : 'transparent',
                  borderLeft: isActive ? '4px solid #3b82f6' : '4px solid transparent'
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};
