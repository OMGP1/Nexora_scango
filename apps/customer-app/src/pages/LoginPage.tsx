import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSession } from '../contexts/SessionContext';
import { Button, Spinner } from '@scango/ui';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithEmail, signupWithEmail, loginWithGoogle, isAuthenticated } = useAuth();
  const { createSession } = useSession();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      handlePostAuth();
    }
  }, []);

  const handlePostAuth = async () => {
    try {
      const storeId = localStorage.getItem('store_id') || 'STORE_001';
      const existingSessionId = localStorage.getItem('session_id');
      if (!existingSessionId) {
        await createSession(storeId);
      }
      navigate('/scan');
    } catch (e: any) {
      if (e.response?.status === 409) {
        navigate('/scan');
      } else {
        console.error('Failed to create session', e);
        setError('Could not start session. Please try again.');
      }
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        await signupWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      await handlePostAuth();
    } catch (err: any) {
      const code = err.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (code === 'auth/email-already-in-use') {
        setError('Email already registered. Please sign in.');
      } else if (code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      await handlePostAuth();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg)',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          animation: 'scango-fade-in 0.5s ease-out',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: 'var(--font-size-4xl)',
              fontWeight: 700,
              color: 'var(--color-text)',
              letterSpacing: 'var(--letter-spacing-tight)',
              margin: '0 0 8px 0',
            }}
          >
            ScanGo
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-text-muted)',
              margin: 0,
            }}
          >
            {mode === 'signin' ? 'Sign in to start shopping' : 'Create your account'}
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px 24px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Google Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '12px 24px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 500,
              color: 'var(--color-text)',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {googleLoading ? (
              <Spinner size={18} />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              margin: '24px 0',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border-light)' }} />
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border-light)' }} />
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                backgroundColor: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

          {/* Email Form */}
          <form onSubmit={handleEmailSubmit}>
            {mode === 'signup' && (
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                    marginBottom: '6px',
                  }}
                >
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 16px 10px 38px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      fontSize: 'var(--font-size-sm)',
                      boxSizing: 'border-box',
                      outline: 'none',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 500,
                  color: 'var(--color-text-secondary)',
                  marginBottom: '6px',
                }}
              >
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 16px 10px 38px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--font-size-sm)',
                    boxSizing: 'border-box',
                    outline: 'none',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 500,
                  color: 'var(--color-text-secondary)',
                  marginBottom: '6px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '10px 16px 10px 38px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--font-size-sm)',
                    boxSizing: 'border-box',
                    outline: 'none',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} fullWidth size="lg">
              {loading ? (
                <><Spinner size={18} color="var(--color-text-inverse)" /> {mode === 'signin' ? 'Signing in...' : 'Creating account...'}</>
              ) : (
                <>{mode === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight size={18} /></>
              )}
            </Button>
          </form>

          {/* Toggle mode */}
          <p
            style={{
              textAlign: 'center',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-muted)',
              marginTop: '20px',
              marginBottom: 0,
            }}
          >
            {mode === 'signin' ? (
              <>Don't have an account?{' '}
                <span
                  onClick={() => { setMode('signup'); setError(''); }}
                  style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Sign Up
                </span>
              </>
            ) : (
              <>Already have an account?{' '}
                <span
                  onClick={() => { setMode('signin'); setError(''); }}
                  style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Sign In
                </span>
              </>
            )}
          </p>
        </div>

        {/* Footer */}
        <p
          style={{
            textAlign: 'center',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            marginTop: '24px',
          }}
        >
          Scan products • Pay in-app • Walk out
        </p>
      </div>
    </div>
  );
};
