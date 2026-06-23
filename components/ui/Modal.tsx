'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { IconX } from '@tabler/icons-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
  id?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = '480px', id }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
    >
      <div
        ref={contentRef}
        id={id}
        className="relative w-full rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{
          maxWidth,
          background: 'var(--black2)',
          borderColor: 'var(--border-bright)',
        }}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-muted)' }}
            >
              <IconX size={18} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">
          {children}
        </div>

        {/* Close button when no title */}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}
          >
            <IconX size={18} />
          </button>
        )}
      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
