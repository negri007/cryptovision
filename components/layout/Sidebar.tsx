'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconLayoutDashboard, IconChartCandle, IconBuildingBank,
  IconChartBar, IconActivity, IconBriefcase, IconBell, IconCalculator,
  IconNews, IconStar, IconBook, IconSettings, IconChartLine,
  IconChevronRight, IconX
} from '@tabler/icons-react';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}

const navGroups: { items: NavItem[] }[] = [
  {
    items: [
      { href: '/dashboard', icon: <IconLayoutDashboard size={20} />, label: 'Dashboard' },
    ]
  },
  {
    items: [
      { href: '/market/crypto', icon: <IconChartCandle size={20} />, label: 'Mercado Crypto' },
      { href: '/market/stocks', icon: <IconBuildingBank size={20} />, label: 'Ações' },
    ]
  },
  {
    items: [
      { href: '/analysis/technical', icon: <IconChartBar size={20} />, label: 'Análise Técnica' },
      { href: '/analysis/onchain', icon: <IconActivity size={20} />, label: 'On-Chain' },
    ]
  },
  {
    items: [
      { href: '/portfolio', icon: <IconBriefcase size={20} />, label: 'Portfólio' },
      { href: '/alerts', icon: <IconBell size={20} />, label: 'Alertas' },
      { href: '/planning', icon: <IconCalculator size={20} />, label: 'Planejamento' },
    ]
  },
  {
    items: [
      { href: '/news', icon: <IconNews size={20} />, label: 'Notícias' },
      { href: '/recommendations', icon: <IconStar size={20} />, label: 'Recomendações' },
      { href: '/education', icon: <IconBook size={20} />, label: 'Educação' },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore(s => s.user);
  const sidebarOpen = useUiStore(s => s.sidebarOpen);
  const setSidebarOpen = useUiStore(s => s.setSidebarOpen);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const handleNavClick = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col border-r flex-shrink-0
          transform transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          width: 220,
          background: 'var(--black2)',
          borderColor: 'var(--border)'
        }}
      >
        {/* Logo + close button on mobile */}
        <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--blue)' }}>
              <IconChartLine size={18} className="text-white" />
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>CryptoVision</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg hover:bg-white/5 lg:hidden"
          >
            <IconX size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {gi > 0 && <div className="my-2 mx-2" style={{ height: 1, background: 'var(--border)' }} />}
              {group.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  id={`nav-${item.href.replace(/\//g, '-').slice(1)}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all group"
                  style={{
                    background: isActive(item.href) ? 'var(--blue-glow)' : 'transparent',
                    color: isActive(item.href) ? 'var(--blue-bright)' : 'var(--text-secondary)',
                    borderLeft: isActive(item.href) ? '2px solid var(--blue-bright)' : '2px solid transparent'
                  }}
                >
                  <span className="flex-shrink-0 transition-colors"
                    style={{ color: isActive(item.href) ? 'var(--blue-bright)' : 'var(--text-muted)' }}>
                    {item.icon}
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'var(--yellow-dim)', color: 'var(--yellow)' }}>
                      {item.badge}
                    </span>
                  )}
                  {isActive(item.href) && <IconChevronRight size={14} style={{ color: 'var(--blue-bright)' }} />}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer: user avatar + settings */}
        <div className="border-t p-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 px-2 py-2 rounded-xl group" style={{ cursor: 'pointer' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'var(--blue)', color: '#fff' }}>
              {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.displayName || 'Usuário'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {user?.email}
              </p>
            </div>
            <Link href="/profile" id="sidebar-settings" onClick={handleNavClick}>
              <IconSettings size={16} style={{ color: 'var(--text-muted)' }} />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
