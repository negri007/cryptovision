'use client';

import { useEffect, useRef, useState } from 'react';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';

interface PriceTick {
  symbol: string;
  price: number;
  change24h: number;
}

const MOCK_TICKERS: PriceTick[] = [
  { symbol: 'BTC', price: 64250.5, change24h: 1.42 },
  { symbol: 'ETH', price: 3451.2, change24h: -0.87 },
  { symbol: 'SOL', price: 142.75, change24h: 4.22 },
  { symbol: 'BNB', price: 398.6, change24h: 0.33 },
  { symbol: 'ADA', price: 0.4521, change24h: -1.11 },
  { symbol: 'XRP', price: 0.5874, change24h: 2.01 },
  { symbol: 'DOT', price: 7.14, change24h: -0.54 },
  { symbol: 'AVAX', price: 38.92, change24h: 3.17 },
  { symbol: 'LINK', price: 15.44, change24h: 1.88 },
  { symbol: 'MATIC', price: 0.8921, change24h: -2.33 },
  { symbol: 'LTC', price: 82.4, change24h: 0.67 },
  { symbol: 'ATOM', price: 9.12, change24h: -0.98 },
];

function formatPrice(p: number) {
  if (p >= 1000) return `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (p >= 1) return `$${p.toFixed(2)}`;
  return `$${p.toFixed(4)}`;
}

export function Ticker() {
  const [tickers, setTickers] = useState<PriceTick[]>(MOCK_TICKERS);
  const [flashMap, setFlashMap] = useState<Record<string, 'up' | 'down'>>({});
  const prevRef = useRef<Record<string, number>>({});

  useEffect(() => {
    // Simulate live price updates
    const id = setInterval(() => {
      setTickers(prev => prev.map(t => {
        const delta = (Math.random() - 0.498) * t.price * 0.002;
        const newPrice = Math.max(0.001, t.price + delta);
        const direction = newPrice > t.price ? 'up' : 'down';

        if (Math.abs(delta) > t.price * 0.0005) {
          setFlashMap(f => ({ ...f, [t.symbol]: direction }));
          setTimeout(() => setFlashMap(f => { const n = { ...f }; delete n[t.symbol]; return n; }), 400);
        }
        prevRef.current[t.symbol] = t.price;
        return { ...t, price: newPrice };
      }));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center h-10 flex-shrink-0 border-b overflow-hidden" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
      {/* LIVE badge */}
      <div className="flex items-center gap-1.5 px-4 h-full flex-shrink-0 border-r" style={{ borderColor: 'var(--border)', background: 'var(--blue)', minWidth: 72 }}>
        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <span className="text-xs font-bold text-white tracking-wider">LIVE</span>
      </div>

      {/* Scrolling ticker */}
      <div className="flex-1 overflow-hidden relative">
        <div
          className="flex items-center gap-6 whitespace-nowrap"
          style={{ animation: 'ticker-scroll 40s linear infinite' }}
        >
          {[...tickers, ...tickers].map((t, i) => (
            <div key={`${t.symbol}-${i}`} className="flex items-center gap-2 text-xs transition-colors px-1 py-0.5 rounded"
              style={{
                background: flashMap[t.symbol] === 'up' ? 'var(--green-dim)' : flashMap[t.symbol] === 'down' ? 'var(--red-dim)' : 'transparent',
                transition: 'background 0.2s'
              }}>
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{t.symbol}</span>
              <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{formatPrice(t.price)}</span>
              <span className="flex items-center gap-0.5" style={{ color: t.change24h >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {t.change24h >= 0 ? <IconTrendingUp size={11} /> : <IconTrendingDown size={11} />}
                {Math.abs(t.change24h).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
