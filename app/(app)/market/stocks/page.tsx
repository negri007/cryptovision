'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { Sparkline } from '@/components/ui/Sparkline';
import { formatMarketCap } from '@/lib/utils/formatters';

const SECTORS = ['Todos', 'Tecnologia', 'Financeiro', 'Energia', 'Saúde', 'Consumo', 'Industrial'];
const EXCHANGES = ['Todos', 'B3', 'NYSE', 'NASDAQ'];

function randomSparkline(): number[] {
  const d: number[] = [];
  let v = 40 + Math.random() * 40;
  for (let i = 0; i < 20; i++) { v += (Math.random() - 0.48) * 3; d.push(v); }
  return d;
}

const MOCK_STOCKS = [
  { ticker: 'PETR4', name: 'Petrobras PN', exchange: 'B3', sector: 'Energia', price: 38.42, change: 1.82, pe: 4.2, dy: 12.5, volume: 2.1e9, marketCap: 498e9, sparkline: randomSparkline() },
  { ticker: 'VALE3', name: 'Vale ON', exchange: 'B3', sector: 'Industrial', price: 62.15, change: -0.74, pe: 5.8, dy: 8.9, volume: 1.8e9, marketCap: 283e9, sparkline: randomSparkline() },
  { ticker: 'ITUB4', name: 'Itaú Unibanco PN', exchange: 'B3', sector: 'Financeiro', price: 32.87, change: 0.55, pe: 8.4, dy: 5.2, volume: 1.2e9, marketCap: 319e9, sparkline: randomSparkline() },
  { ticker: 'BBDC4', name: 'Bradesco PN', exchange: 'B3', sector: 'Financeiro', price: 15.21, change: -1.23, pe: 9.1, dy: 6.8, volume: 980e6, marketCap: 161e9, sparkline: randomSparkline() },
  { ticker: 'WEGE3', name: 'WEG ON', exchange: 'B3', sector: 'Industrial', price: 38.94, change: 2.11, pe: 32.5, dy: 1.4, volume: 650e6, marketCap: 164e9, sparkline: randomSparkline() },
  { ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Tecnologia', price: 189.84, change: 0.92, pe: 29.4, dy: 0.55, volume: 58e9, marketCap: 2.95e12, sparkline: randomSparkline() },
  { ticker: 'MSFT', name: 'Microsoft Corp.', exchange: 'NASDAQ', sector: 'Tecnologia', price: 415.26, change: 1.44, pe: 35.2, dy: 0.72, volume: 22e9, marketCap: 3.08e12, sparkline: randomSparkline() },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', sector: 'Tecnologia', price: 174.52, change: -0.31, pe: 24.8, dy: 0, volume: 21e9, marketCap: 2.15e12, sparkline: randomSparkline() },
  { ticker: 'JPM', name: 'JPMorgan Chase', exchange: 'NYSE', sector: 'Financeiro', price: 198.45, change: 0.68, pe: 11.2, dy: 2.3, volume: 9.2e9, marketCap: 571e9, sparkline: randomSparkline() },
  { ticker: 'MGLU3', name: 'Magazine Luiza ON', exchange: 'B3', sector: 'Consumo', price: 2.14, change: -3.21, pe: -8.4, dy: 0, volume: 420e6, marketCap: 14.5e9, sparkline: randomSparkline() },
];

export default function StocksPage() {
  const [sector, setSector] = useState('Todos');
  const [exchange, setExchange] = useState('Todos');
  const router = useRouter();

  const filtered = MOCK_STOCKS.filter(s =>
    (sector === 'Todos' || s.sector === sector) &&
    (exchange === 'Todos' || s.exchange === exchange)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Mercado de Ações</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Cotações B3, NYSE e NASDAQ</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          {SECTORS.map(s => (
            <button key={s} onClick={() => setSector(s)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border"
              style={{
                background: sector === s ? 'var(--blue)' : 'var(--black3)',
                color: sector === s ? '#fff' : 'var(--text-secondary)',
                borderColor: sector === s ? 'var(--blue)' : 'var(--border)',
              }}
            >{s}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {EXCHANGES.map(e => (
            <button key={e} onClick={() => setExchange(e)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border"
              style={{
                background: exchange === e ? 'var(--green)' : 'var(--black3)',
                color: exchange === e ? '#fff' : 'var(--text-secondary)',
                borderColor: exchange === e ? 'var(--green)' : 'var(--border)',
              }}
            >{e}</button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                <th className="px-4 py-3 text-xs font-semibold">Ticker</th>
                <th className="px-4 py-3 text-xs font-semibold">Nome</th>
                <th className="px-4 py-3 text-xs font-semibold">Preço</th>
                <th className="px-4 py-3 text-xs font-semibold">Variação</th>
                <th className="px-4 py-3 text-xs font-semibold">P/L</th>
                <th className="px-4 py-3 text-xs font-semibold">Div. Yield</th>
                <th className="px-4 py-3 text-xs font-semibold">Setor</th>
                <th className="px-4 py-3 text-xs font-semibold">Volume</th>
                <th className="px-4 py-3 text-xs font-semibold">7d</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(stock => (
                <tr
                  key={stock.ticker}
                  onClick={() => router.push(`/market/stocks/${stock.ticker.toLowerCase()}`)}
                  className="border-b transition-colors hover:bg-white/[0.03] cursor-pointer"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{stock.ticker}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stock.name}</span>
                  </td>
                  <td className="px-4 py-3.5 font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                    {stock.exchange === 'B3' ? `R$ ${stock.price.toFixed(2)}` : `$${stock.price.toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-0.5 text-xs font-semibold" style={{ color: stock.change >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {stock.change >= 0 ? <IconTrendingUp size={12} /> : <IconTrendingDown size={12} />}
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs" style={{ color: stock.pe < 0 ? 'var(--red)' : 'var(--text-secondary)' }}>
                    {stock.pe.toFixed(1)}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs" style={{ color: stock.dy > 5 ? 'var(--green)' : 'var(--text-secondary)' }}>
                    {stock.dy > 0 ? `${stock.dy.toFixed(1)}%` : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-xs" style={{ color: 'var(--text-muted)' }}>{stock.sector}</td>
                  <td className="px-4 py-3.5 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {formatMarketCap(stock.volume)}
                  </td>
                  <td className="px-3 py-3.5">
                    <Sparkline data={stock.sparkline} color="auto" width={80} height={28} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
