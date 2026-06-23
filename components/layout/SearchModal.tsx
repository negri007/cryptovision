'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { IconSearch, IconX, IconChartCandle, IconBuildingBank, IconTrendingUp } from '@tabler/icons-react';

interface SearchResult {
  symbol: string;
  name: string;
  type: 'crypto' | 'stock';
  href: string;
}

const ASSETS: SearchResult[] = [
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', href: '/market/crypto/btc' },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto', href: '/market/crypto/eth' },
  { symbol: 'SOL', name: 'Solana', type: 'crypto', href: '/market/crypto/sol' },
  { symbol: 'BNB', name: 'BNB', type: 'crypto', href: '/market/crypto/bnb' },
  { symbol: 'XRP', name: 'XRP', type: 'crypto', href: '/market/crypto/xrp' },
  { symbol: 'ADA', name: 'Cardano', type: 'crypto', href: '/market/crypto/ada' },
  { symbol: 'AVAX', name: 'Avalanche', type: 'crypto', href: '/market/crypto/avax' },
  { symbol: 'DOT', name: 'Polkadot', type: 'crypto', href: '/market/crypto/dot' },
  { symbol: 'LINK', name: 'Chainlink', type: 'crypto', href: '/market/crypto/link' },
  { symbol: 'MATIC', name: 'Polygon', type: 'crypto', href: '/market/crypto/matic' },
  { symbol: 'UNI', name: 'Uniswap', type: 'crypto', href: '/market/crypto/uni' },
  { symbol: 'ATOM', name: 'Cosmos', type: 'crypto', href: '/market/crypto/atom' },
  { symbol: 'LTC', name: 'Litecoin', type: 'crypto', href: '/market/crypto/ltc' },
  { symbol: 'RENDER', name: 'Render', type: 'crypto', href: '/market/crypto/render' },
  { symbol: 'INJ', name: 'Injective', type: 'crypto', href: '/market/crypto/inj' },
  { symbol: 'FET', name: 'Fetch.ai', type: 'crypto', href: '/market/crypto/fet' },
  { symbol: 'PETR4', name: 'Petrobras', type: 'stock', href: '/market/stocks/petr4' },
  { symbol: 'VALE3', name: 'Vale', type: 'stock', href: '/market/stocks/vale3' },
  { symbol: 'ITUB4', name: 'Itaú Unibanco', type: 'stock', href: '/market/stocks/itub4' },
  { symbol: 'BBDC4', name: 'Bradesco', type: 'stock', href: '/market/stocks/bbdc4' },
  { symbol: 'ABEV3', name: 'Ambev', type: 'stock', href: '/market/stocks/abev3' },
  { symbol: 'WEGE3', name: 'WEG', type: 'stock', href: '/market/stocks/wege3' },
];

const QUICK_LINKS: SearchResult[] = [
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', href: '/market/crypto/btc' },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto', href: '/market/crypto/eth' },
  { symbol: 'SOL', name: 'Solana', type: 'crypto', href: '/market/crypto/sol' },
  { symbol: 'PETR4', name: 'Petrobras', type: 'stock', href: '/market/stocks/petr4' },
  { symbol: 'VALE3', name: 'Vale', type: 'stock', href: '/market/stocks/vale3' },
];

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results = query.length > 0
    ? ASSETS.filter(a =>
        a.symbol.toLowerCase().includes(query.toLowerCase()) ||
        a.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : QUICK_LINKS;

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const navigate = useCallback((href: string) => {
    onClose();
    router.push(href);
  }, [onClose, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) onClose();
        else onClose();
      }
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        navigate(results[selectedIndex].href);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, results, selectedIndex, navigate]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg mx-4 rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: 'var(--black2)', borderColor: 'var(--border-bright)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <IconSearch size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar ativo, moeda ou ação..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-primary)' }}
          />
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5">
            <IconX size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {query.length === 0 && (
            <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Acessos rápidos
            </p>
          )}
          {results.length === 0 && (
            <p className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Nenhum resultado para &quot;{query}&quot;
            </p>
          )}
          {results.map((r, i) => (
            <button
              key={r.symbol}
              onClick={() => navigate(r.href)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
              style={{
                background: i === selectedIndex ? 'var(--blue-glow)' : 'transparent',
              }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: 'var(--black4)', color: 'var(--text-secondary)' }}>
                {r.symbol.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.symbol}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {r.type === 'crypto'
                  ? <IconChartCandle size={14} style={{ color: 'var(--text-muted)' }} />
                  : <IconBuildingBank size={14} style={{ color: 'var(--text-muted)' }} />
                }
                <span className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>{r.type}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 border-t text-[10px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <div className="flex gap-3">
            <span><kbd className="px-1 rounded" style={{ background: 'var(--black4)' }}>↑↓</kbd> navegar</span>
            <span><kbd className="px-1 rounded" style={{ background: 'var(--black4)' }}>Enter</kbd> abrir</span>
            <span><kbd className="px-1 rounded" style={{ background: 'var(--black4)' }}>Esc</kbd> fechar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
