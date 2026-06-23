'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  IconBell, IconTrendingUp, IconTrendingDown, IconAlertTriangle,
  IconCheck, IconX, IconExternalLink,
} from '@tabler/icons-react';

interface Notification {
  id: string;
  type: 'price_alert' | 'system' | 'news';
  title: string;
  message: string;
  time: string;
  read: boolean;
  href?: string;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'price_alert',
    title: 'BTC atingiu $67.000',
    message: 'Bitcoin cruzou acima do seu alerta de preço.',
    time: '5 min atrás',
    read: false,
    href: '/market/crypto/btc',
  },
  {
    id: '2',
    type: 'news',
    title: 'Nova notícia sobre ETH',
    message: 'Ethereum completa atualização Dencun com sucesso.',
    time: '1h atrás',
    read: false,
    href: '/news',
  },
  {
    id: '3',
    type: 'system',
    title: 'Bem-vindo ao CryptoVision!',
    message: 'Configure seus alertas e portfólio para começar.',
    time: '2h atrás',
    read: false,
    href: '/alerts',
  },
  {
    id: '4',
    type: 'price_alert',
    title: 'SOL variou +7%',
    message: 'Solana subiu mais de 7% nas últimas 24 horas.',
    time: '3h atrás',
    read: true,
    href: '/market/crypto/sol',
  },
];

const ICON_MAP = {
  price_alert: <IconTrendingUp size={16} />,
  system: <IconAlertTriangle size={16} />,
  news: <IconBell size={16} />,
};

const COLOR_MAP = {
  price_alert: 'var(--green)',
  system: 'var(--yellow)',
  news: 'var(--blue-bright)',
};

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute right-0 top-full mt-2 w-96 rounded-2xl border shadow-2xl overflow-hidden z-50"
        style={{ background: 'var(--black2)', borderColor: 'var(--border-bright)' }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Notificações</h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'var(--blue)', color: '#fff' }}>
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1 text-xs transition-colors hover:opacity-80" style={{ color: 'var(--blue-bright)' }}>
              <IconCheck size={12} />
              Marcar todas como lidas
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <IconBell size={32} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhuma notificação</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className="flex gap-3 px-4 py-3 border-b transition-colors hover:bg-white/5 group"
                style={{
                  borderColor: 'var(--border)',
                  background: n.read ? 'transparent' : 'rgba(26,111,232,0.04)',
                }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'var(--black4)', color: COLOR_MAP[n.type] }}>
                  {ICON_MAP[n.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
                      {n.title}
                    </p>
                    <button
                      onClick={() => dismiss(n.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity"
                    >
                      <IconX size={12} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{n.time}</span>
                    {n.href && (
                      <Link
                        href={n.href}
                        onClick={() => { markRead(n.id); onClose(); }}
                        className="flex items-center gap-0.5 text-[10px] font-medium transition-colors hover:opacity-80"
                        style={{ color: 'var(--blue-bright)' }}
                      >
                        Ver <IconExternalLink size={10} />
                      </Link>
                    )}
                  </div>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: 'var(--blue)' }} />
                )}
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-2.5 border-t" style={{ borderColor: 'var(--border)' }}>
          <Link
            href="/alerts"
            onClick={onClose}
            className="flex items-center justify-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--blue-bright)' }}
          >
            Ver todos os alertas <IconExternalLink size={10} />
          </Link>
        </div>
      </div>
    </>
  );
}

export function useNotificationCount() {
  return INITIAL_NOTIFICATIONS.filter(n => !n.read).length;
}
