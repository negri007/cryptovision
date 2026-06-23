'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconLayoutDashboard, IconUsers, IconPlug, IconArrowLeft,
  IconShieldCheck,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/Badge';

const NAV_ITEMS = [
  { href: '/admin', icon: <IconLayoutDashboard size={18} />, label: 'Dashboard' },
  { href: '/admin/users', icon: <IconUsers size={18} />, label: 'Usuários' },
  { href: '/admin/integrations', icon: <IconPlug size={18} />, label: 'Integrações' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--black)' }}>
      {/* Admin sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col border-r" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
        {/* Header */}
        <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <IconShieldCheck size={20} style={{ color: 'var(--blue-bright)' }} />
            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Admin</span>
            <Badge variant="red" size="sm">Admin</Badge>
          </div>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: active ? 'var(--blue-glow)' : 'transparent',
                  color: active ? 'var(--blue-bright)' : 'var(--text-secondary)',
                }}
              >
                <span style={{ color: active ? 'var(--blue-bright)' : 'var(--text-muted)' }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-secondary)' }}>
            <IconArrowLeft size={16} /> Voltar ao app
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Painel Administrativo</h1>
            <Badge variant="red" size="sm">Administração</Badge>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
