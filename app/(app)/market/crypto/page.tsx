'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconClock, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { Badge } from '@/components/ui/Badge';
import { AssetRow, type AssetRowData } from '@/components/market/AssetRow';

const CATEGORIES = ['Todos', 'DeFi', 'Layer1', 'Layer2', 'Stablecoins', 'NFT', 'Gaming', 'IA'];

function randomSparkline(): number[] {
  const data: number[] = [];
  let v = 50 + Math.random() * 50;
  for (let i = 0; i < 20; i++) {
    v += (Math.random() - 0.48) * 5;
    data.push(v);
  }
  return data;
}

const MOCK_ASSETS: AssetRowData[] = [
  { rank: 1, symbol: 'BTC', name: 'Bitcoin', price: 66842, change1h: 0.12, change24h: 2.41, change7d: 5.8, volume24h: 42e9, marketCap: 1.31e12, sparkline: randomSparkline() },
  { rank: 2, symbol: 'ETH', name: 'Ethereum', price: 3521, change1h: -0.08, change24h: 1.62, change7d: 3.2, volume24h: 18e9, marketCap: 423e9, sparkline: randomSparkline() },
  { rank: 3, symbol: 'BNB', name: 'BNB', price: 598, change1h: 0.34, change24h: 0.85, change7d: 1.4, volume24h: 2.1e9, marketCap: 92e9, sparkline: randomSparkline() },
  { rank: 4, symbol: 'SOL', name: 'Solana', price: 178.5, change1h: 0.88, change24h: 7.21, change7d: 12.5, volume24h: 5.6e9, marketCap: 78e9, sparkline: randomSparkline() },
  { rank: 5, symbol: 'XRP', name: 'XRP', price: 0.632, change1h: -0.22, change24h: -1.14, change7d: -0.8, volume24h: 2.8e9, marketCap: 35e9, sparkline: randomSparkline() },
  { rank: 6, symbol: 'ADA', name: 'Cardano', price: 0.481, change1h: 0.05, change24h: 3.42, change7d: 8.1, volume24h: 890e6, marketCap: 17e9, sparkline: randomSparkline() },
  { rank: 7, symbol: 'AVAX', name: 'Avalanche', price: 42.18, change1h: 1.21, change24h: 5.87, change7d: 9.3, volume24h: 1.2e9, marketCap: 15.8e9, sparkline: randomSparkline() },
  { rank: 8, symbol: 'DOT', name: 'Polkadot', price: 7.84, change1h: -0.42, change24h: -0.91, change7d: 2.1, volume24h: 420e6, marketCap: 10.5e9, sparkline: randomSparkline() },
  { rank: 9, symbol: 'LINK', name: 'Chainlink', price: 18.92, change1h: 0.67, change24h: 4.55, change7d: 11.2, volume24h: 950e6, marketCap: 11e9, sparkline: randomSparkline() },
  { rank: 10, symbol: 'MATIC', name: 'Polygon', price: 0.721, change1h: -0.15, change24h: -2.33, change7d: -4.1, volume24h: 380e6, marketCap: 7.1e9, sparkline: randomSparkline() },
  { rank: 11, symbol: 'UNI', name: 'Uniswap', price: 11.42, change1h: 0.33, change24h: 2.87, change7d: 6.4, volume24h: 320e6, marketCap: 6.8e9, sparkline: randomSparkline() },
  { rank: 12, symbol: 'ATOM', name: 'Cosmos', price: 9.56, change1h: -0.67, change24h: 1.23, change7d: 3.8, volume24h: 210e6, marketCap: 3.7e9, sparkline: randomSparkline() },
];

export default function CryptoMarketPage() {
  const [category, setCategory] = useState('Todos');
  const [watchlistSet, setWatchlistSet] = useState(new Set<string>());
  const router = useRouter();

  const toggleWatchlist = (symbol: string) => {
    setWatchlistSet(prev => {
      const next = new Set(prev);
      if (next.has(symbol)) next.delete(symbol);
      else next.add(symbol);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Mercado Crypto</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Preços de ativos digitais atualizados em tempo real</p>
      </div>

      {/* Delay badge for free users */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs" style={{ background: 'var(--yellow-dim)', color: 'var(--yellow)', border: '1px solid rgba(245,200,66,0.2)' }}>
        <IconClock size={14} />
        Dados com 15 minutos de atraso — <span className="font-semibold underline cursor-pointer">Upgrade para Pro</span> para tempo real
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all border"
            style={{
              background: category === cat ? 'var(--blue)' : 'var(--black3)',
              color: category === cat ? '#fff' : 'var(--text-secondary)',
              borderColor: category === cat ? 'var(--blue)' : 'var(--border)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                <th className="px-4 py-3 text-xs font-semibold">#</th>
                <th className="px-4 py-3 text-xs font-semibold">Ativo</th>
                <th className="px-4 py-3 text-xs font-semibold">Preço</th>
                <th className="px-4 py-3 text-xs font-semibold">1h</th>
                <th className="px-4 py-3 text-xs font-semibold">24h</th>
                <th className="px-4 py-3 text-xs font-semibold">7d</th>
                <th className="px-4 py-3 text-xs font-semibold">Volume 24h</th>
                <th className="px-4 py-3 text-xs font-semibold">Cap. Mercado</th>
                <th className="px-4 py-3 text-xs font-semibold">7d</th>
                <th className="px-3 py-3 text-xs font-semibold w-8"></th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ASSETS.map(asset => (
                <AssetRow
                  key={asset.symbol}
                  asset={asset}
                  isInWatchlist={watchlistSet.has(asset.symbol)}
                  onWatchlist={() => toggleWatchlist(asset.symbol)}
                  onClick={() => router.push(`/market/crypto/${asset.symbol.toLowerCase()}`)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
