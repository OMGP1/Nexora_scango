// =====================================================
// @scango/ui — Component Library
// ScanGo Luxury Minimal Design System
// =====================================================

import React from 'react';

// =====================================================
// Button
// =====================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  style,
  ...props
}) => {
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '8px 16px', fontSize: 'var(--font-size-sm)' },
    md: { padding: '12px 24px', fontSize: 'var(--font-size-base)' },
    lg: { padding: '16px 32px', fontSize: 'var(--font-size-lg)' },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-text-inverse)',
      border: 'none',
    },
    secondary: {
      backgroundColor: 'var(--color-bg-warm-accent)',
      color: 'var(--color-text)',
      border: 'none',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-text)',
      border: '1.5px solid var(--color-border)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-text)',
      border: 'none',
    },
    danger: {
      backgroundColor: 'var(--color-danger)',
      color: 'var(--color-text-inverse)',
      border: 'none',
    },
  };

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-family)',
    fontWeight: 600,
    borderRadius: 'var(--radius-full)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all var(--transition-base)',
    opacity: disabled || loading ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    minHeight: '44px',
    letterSpacing: 'var(--letter-spacing-wide)',
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button style={baseStyles} disabled={disabled || loading} {...props}>
      {loading && <Spinner size={16} color="currentColor" />}
      {children}
    </button>
  );
};

// =====================================================
// Card
// =====================================================

export interface CardProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  className = '',
  style,
  onClick,
}) => {
  const paddings: Record<string, string> = {
    none: '0',
    sm: 'var(--space-3)',
    md: 'var(--space-5)',
    lg: 'var(--space-8)',
  };

  const cardStyles: React.CSSProperties = {
    backgroundColor: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-xl)',
    padding: paddings[padding],
    boxShadow: 'var(--shadow-card)',
    transition: 'all var(--transition-base)',
    cursor: onClick ? 'pointer' : undefined,
    ...style,
  };

  return (
    <div style={cardStyles} className={className} onClick={onClick} role={onClick ? 'button' : undefined}>
      {children}
    </div>
  );
};

// =====================================================
// Spinner
// =====================================================

export interface SpinnerProps {
  size?: number;
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 24, color = 'var(--color-primary)' }) => {
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{
        width: size,
        height: size,
        border: '2.5px solid var(--color-border-light)',
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'scango-spin 0.6s linear infinite',
        display: 'inline-block',
      }}
    />
  );
};

// =====================================================
// Badge
// =====================================================

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default' }) => {
  const colors: Record<string, { bg: string; text: string }> = {
    default: { bg: 'var(--color-primary-light)', text: 'var(--color-primary)' },
    success: { bg: 'var(--color-success-light)', text: 'var(--color-success)' },
    warning: { bg: 'var(--color-warning-light)', text: 'var(--color-warning)' },
    danger: { bg: 'var(--color-danger-light)', text: 'var(--color-danger)' },
    info: { bg: 'var(--color-info-light)', text: 'var(--color-info)' },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 600,
        backgroundColor: colors[variant].bg,
        color: colors[variant].text,
        letterSpacing: 'var(--letter-spacing-wide)',
      }}
    >
      {children}
    </span>
  );
};

// =====================================================
// Toast
// =====================================================

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', visible, onClose }) => {
  const bgColors: Record<string, string> = {
    success: 'var(--color-success-bg)',
    error: 'var(--color-danger-bg)',
    warning: 'var(--color-warning-bg)',
    info: 'var(--color-primary-50)',
  };
  const textColors: Record<string, string> = {
    success: 'var(--color-success)',
    error: 'var(--color-danger)',
    warning: 'var(--color-warning)',
    info: 'var(--color-primary)',
  };

  if (!visible) return null;

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        bottom: '5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: bgColors[type],
        color: textColors[type],
        padding: '12px 20px',
        borderRadius: 'var(--radius-full)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 500,
        fontWeight: 500,
        fontSize: 'var(--font-size-sm)',
        animation: 'scango-slide-up 0.3s ease-out',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        maxWidth: '90vw',
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '1.2rem', padding: '0 0 0 4px' }}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
};

// =====================================================
// PageHeader
// =====================================================

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, onBack, actions }) => {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        backgroundColor: 'var(--color-bg-card)',
        borderBottom: '1px solid var(--color-border-light)',
        position: 'sticky',
        top: 0,
        zIndex: 200,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-text)',
            }}
            aria-label="Go back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        )}
        <div>
          <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: 'var(--letter-spacing-tight)', lineHeight: 1.2 }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{actions}</div>}
    </header>
  );
};

// =====================================================
// BottomBar (Mobile)
// =====================================================

export interface BottomBarProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const BottomBar: React.FC<BottomBarProps> = ({ children, style }) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '12px 20px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        backgroundColor: 'var(--color-bg-card)',
        borderTop: '1px solid var(--color-border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 200,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// =====================================================
// Input
// =====================================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, error, fullWidth = true, style, ...props }) => {
  return (
    <div style={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            marginBottom: '6px',
          }}
        >
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: 'var(--font-size-base)',
          fontFamily: 'var(--font-family)',
          border: `1.5px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-bg-card)',
          color: 'var(--color-text)',
          transition: 'border-color var(--transition-fast)',
          outline: 'none',
          ...style,
        }}
        {...props}
      />
      {error && (
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)', marginTop: '4px' }}>
          {error}
        </p>
      )}
    </div>
  );
};

// =====================================================
// StatusDot
// =====================================================

export interface StatusDotProps {
  status: 'online' | 'offline' | 'warning';
  label?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({ status, label }) => {
  const colors: Record<string, string> = {
    online: 'var(--color-success)',
    offline: 'var(--color-danger)',
    warning: 'var(--color-warning)',
  };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: colors[status],
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {label && <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{label}</span>}
    </span>
  );
};

// =====================================================
// EmptyState
// =====================================================

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-16) var(--space-8)',
        textAlign: 'center',
      }}
    >
      {icon && <div style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-muted)', opacity: 0.6 }}>{icon}</div>}
      <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px' }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', maxWidth: '320px', lineHeight: 1.5 }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: 'var(--space-6)' }}>{action}</div>}
    </div>
  );
};
