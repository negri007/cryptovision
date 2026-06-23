'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  accent?: 'blue' | 'green' | 'yellow' | 'red';
  className?: string;
  onClick?: () => void;
  id?: string;
}

export function Card({ children, accent, className = '', onClick, id }: CardProps) {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`rounded-2xl border p-5 transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-blue-bright hover:-translate-y-0.5' : ''} ${className}`}
      style={{
        background: 'var(--black2)',
        borderColor: 'var(--border)',
        borderTopColor: accent ? `var(--${accent})` : undefined,
        borderTopWidth: accent ? '2px' : undefined,
      }}
    >
      {children}
    </div>
  );
}
