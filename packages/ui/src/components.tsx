// =====================================================
// @scango/ui — Button Component
// =====================================================

import React from 'react';

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
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontFamily: 'var(--font-family)',
    fontWeight: 'var(--font-weight-semibold)' as unknown as number,
    borderRadius: 'var(--radius-lg)',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all var(--transition-fast)',
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    minHeight: '48px', // WCAG touch target
    ...(size === 'sm' && { padding: '0.5rem 1rem', fontSize: 'var(--font-size-sm)' }),
    ...(size === 'md' && { padding: '0.75rem 1.5rem', fontSize: 'var(--font-size-base)' }),
    ...(size === 'lg' && { padding: '1rem 2rem', fontSize: 'var(--font-size-lg)' }),
    ...(variant === 'primary' && {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-text-inverse)',
    }),
    ...(variant === 'secondary' && {
      backgroundColor: 'var(--color-secondary)',
      color: 'var(--color-text-inverse)',
    }),
    ...(variant === 'outline' && {
      backgroundColor: 'transparent',
      color: 'var(--color-primary)',
      border: '2px solid var(--color-primary)',
    }),
    ...(variant === 'ghost' && {
      backgroundColor: 'transparent',
      color: 'var(--color-text)',
    }),
    ...(variant === 'danger' && {
      backgroundColor: 'var(--color-danger)',
      color: 'var(--color-text-inverse)',
    }),
  };

  return (
    <button style={baseStyles} className={className} disabled={disabled || loading} {...props}>
      {loading && <span className="scango-spinner" aria-hidden="true" />}
      {children}
    </button>
  );
};

// =====================================================
// Card Component
// =====================================================

export interface CardProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  glass?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  glass = false,
  className = '',
  style,
  onClick,
}) => {
  const paddings = { sm: 'var(--space-3)', md: 'var(--space-4)', lg: 'var(--space-6)' };

  const cardStyles: React.CSSProperties = {
    backgroundColor: glass ? 'rgba(255, 255, 255, 0.7)' : 'var(--color-bg-card)',
    backdropFilter: glass ? 'blur(12px)' : undefined,
    borderRadius: 'var(--radius-xl)',
    padding: paddings[padding],
    boxShadow: glass ? 'var(--shadow-glass)' : 'var(--shadow-md)',
    border: `1px solid ${glass ? 'rgba(255, 255, 255, 0.3)' : 'var(--color-border)'}`,
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
// Spinner Component
// =====================================================

export interface SpinnerProps {
  size?: number;
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 24, color = 'var(--color-primary)' }) => {
  const spinnerStyles: React.CSSProperties = {
    width: size,
    height: size,
    border: `3px solid var(--color-border)`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'scango-spin 0.6s linear infinite',
    display: 'inline-block',
  };

  return <span style={spinnerStyles} role="status" aria-label="Loading" />;
};

// =====================================================
// Toast Component
// =====================================================

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', visible, onClose }) => {
  const bgColors = {
    success: 'var(--color-success-bg)',
    error: 'var(--color-danger-bg)',
    warning: 'var(--color-warning-bg)',
    info: 'var(--color-primary-50)',
  };

  const textColors = {
    success: 'var(--color-success)',
    error: 'var(--color-danger)',
    warning: 'var(--color-accent)',
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
        padding: 'var(--space-3) var(--space-5)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 'var(--z-toast)' as unknown as number,
        fontWeight: 'var(--font-weight-medium)' as unknown as number,
        fontSize: 'var(--font-size-sm)',
        animation: 'scango-slide-up 0.3s ease-out',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        maxWidth: '90vw',
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '1.2rem' }} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
};

// =====================================================
// Badge Component
// =====================================================

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default' }) => {
  const colors = {
    default: { bg: 'var(--color-primary-light)', text: 'var(--color-primary)' },
    success: { bg: 'var(--color-success-light)', text: 'var(--color-success)' },
    warning: { bg: 'var(--color-warning-light)', text: '#92400e' },
    danger: { bg: 'var(--color-danger-light)', text: 'var(--color-danger)' },
    info: { bg: 'var(--color-info-light)', text: 'var(--color-info)' },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.125rem 0.625rem',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-semibold)' as unknown as number,
        backgroundColor: colors[variant].bg,
        color: colors[variant].text,
      }}
    >
      {children}
    </span>
  );
};
