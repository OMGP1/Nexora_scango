import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', style, ...props }) => {
  const baseStyle: React.CSSProperties = {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    ...style,
  };

  const variants = {
    primary: { backgroundColor: '#4f46e5', color: '#fff' },
    secondary: { backgroundColor: '#e5e7eb', color: '#1f2937' },
    danger: { backgroundColor: '#ef4444', color: '#fff' },
  };

  return (
    <button style={{ ...baseStyle, ...variants[variant] }} {...props}>
      {children}
    </button>
  );
};
