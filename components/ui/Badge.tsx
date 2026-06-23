'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

const VARIANT_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  blue:   { bg: 'var(--blue-glow)',       color: 'var(--blue-bright)', border: 'rgba(45,136,255,0.25)' },
  green:  { bg: 'var(--green-dim)',       color: 'var(--green)',       border: 'rgba(0,217,126,0.25)' },
  yellow: { bg: 'var(--yellow-dim)',      color: 'var(--yellow)',      border: 'rgba(245,200,66,0.25)' },
  red:    { bg: 'var(--red-dim)',         color: 'var(--red)',         border: 'rgba(255,91,91,0.25)' },
  gray:   { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: 'rgba(255,255,255,0.1)' },
};

export function Badge({ children, variant = 'blue', size = 'sm', className = '' }: BadgeProps) {
  const s = VARIANT_STYLES[variant] || VARIANT_STYLES.blue;
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border ${
        size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1'
      } ${className}`}
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {children}
    </span>
  );
}
