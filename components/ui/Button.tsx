'use client';

import React from 'react';
import { IconLoader2 } from '@tabler/icons-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const VARIANT_MAP: Record<string, { bg: string; color: string; border?: string; hover: string }> = {
  primary:   { bg: 'var(--blue)',   color: '#fff',                    hover: 'opacity-90' },
  secondary: { bg: 'var(--black3)', color: 'var(--text-secondary)',   border: 'var(--border-bright)', hover: 'bg-white/5' },
  ghost:     { bg: 'transparent',   color: 'var(--text-secondary)',   hover: 'bg-white/5' },
  danger:    { bg: 'var(--red-dim)', color: 'var(--red)',             border: 'rgba(255,91,91,0.25)', hover: 'bg-red-500/20' },
};

const SIZE_MAP: Record<string, string> = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2.5',
  lg: 'text-sm px-6 py-3',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const v = VARIANT_MAP[variant] || VARIANT_MAP.primary;

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none ${SIZE_MAP[size]} ${className}`}
      style={{
        background: v.bg,
        color: v.color,
        border: v.border ? `1px solid ${v.border}` : 'none',
      }}
      {...props}
    >
      {loading ? (
        <IconLoader2 size={16} className="animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
