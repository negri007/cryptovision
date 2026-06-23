'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { IconBell, IconSearch, IconChevronDown, IconUser, IconSettings, IconLogout, IconCrown } from '@tabler/icons-react';
import { useAuthStore } from '@/store/authStore';
import { signOut } from '@/lib/firebase/auth';

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Visão geral do mercado' },
  '/market/crypto': { title: 'Mercado Crypto', subtitle: 'Criptomoedas em tempo real' },
  '/market/stocks': { title: 'Ações', subtitle: 'Mercado de renda variável' },
  '/analysis/technical': { title: 'Análise Técnica', subtitle: 'Indicadores e padrões' },
  '/analysis/onchain': { title: 'Análise On-Chain', subtitle: 'Dados de rede blockchain' },
  '/portfolio': { title: 'Portfólio', subtitle: 'Seus investimentos' },
  '/alerts': { title: 'Alertas', subtitle: 'Monitoramento de preços' },
  '/planning': { title: 'Planejamento', subtitle: 'Calculadoras de retorno' },
  '/news': { title: 'Notícias', subtitle: 'Últimas do mercado' },
  '/recommendations': { title: 'Recomendações', subtitle: 'Análise automatizada de ativos' },
  '/education': { title: 'Educação', subtitle: 'Aprenda sobre mercados' },
  '/profile': { title: 'Perfil', subtitle: 'Configurações da conta' },
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications] = useState(3);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pageInfo = PAGE_TITLES[pathname] || { title: 'CryptoVision' };
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
      {/* Page title */}
      <div>
        <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{pageInfo.title}</h1>
        {pageInfo.subtitle && (
          <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{today}</p>
        )}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        {/* Live badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border" style={{ background: 'var(--green-dim)', borderColor: 'var(--green)', color: 'var(--green)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)', animation: 'pulse-live 1.5s infinite' }} />
          Tempo real
        </div>

        {/* Global search */}
        <button id="header-search" className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm transition-colors hover:border-blue-bright" style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          <IconSearch size={15} />
          <span className="hidden md:block">Buscar ativo...</span>
          <kbd className="hidden md:inline-flex items-center px-1.5 rounded text-xs" style={{ background: 'var(--black4)', color: 'var(--text-muted)' }}>⌘K</kbd>
        </button>

        {/* Notifications */}
        <button id="header-notifications" className="relative p-2 rounded-xl transition-colors hover:bg-white/5">
          <IconBell size={18} style={{ color: 'var(--text-secondary)' }} />
          {notifications > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold" style={{ background: 'var(--blue)', color: '#fff' }}>
              {notifications}
            </span>
          )}
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="header-user-menu"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl transition-colors hover:bg-white/5"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: 'var(--blue)', color: '#fff' }}>
              {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="hidden md:block text-sm max-w-24 truncate" style={{ color: 'var(--text-secondary)' }}>
              {user?.displayName || 'Usuário'}
            </span>
            <IconChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border shadow-2xl overflow-hidden z-50" style={{ background: 'var(--black2)', borderColor: 'var(--border-bright)' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.displayName || 'Usuário'}</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--blue-glow)', color: 'var(--blue-bright)' }}>
                  Plano Free
                </span>
              </div>

              <div className="py-1">
                <Link href="/profile" onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                  style={{ color: 'var(--text-secondary)' }}>
                  <IconUser size={16} />
                  Perfil
                </Link>
                <Link href="/profile#plano" onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                  style={{ color: 'var(--yellow)' }}>
                  <IconCrown size={16} />
                  Fazer upgrade
                </Link>
                <Link href="/profile" onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                  style={{ color: 'var(--text-secondary)' }}>
                  <IconSettings size={16} />
                  Configurações
                </Link>
              </div>

              <div className="border-t py-1" style={{ borderColor: 'var(--border)' }}>
                <button
                  id="header-logout"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                  style={{ color: 'var(--red)' }}
                >
                  <IconLogout size={16} />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
