import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Input } from '@scango/ui';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      const code = err.code;
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') setError('Invalid email or password.');
      else if (code === 'auth/user-not-found') setError('No account found with this email.');
      else if (code === 'auth/too-many-requests') setError('Too many attempts. Please try later.');
      else setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px', animation: 'scango-fade-in 0.4s ease-out' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 4px', letterSpacing: 'var(--letter-spacing-tight)' }}>ScanGo</h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 0 }}>Associate Console</p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: 'var(--font-size-sm)' }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: '16px' }}>
              <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="associate@store.com" required />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
            </div>
            <Button type="submit" disabled={loading} fullWidth size="lg">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
