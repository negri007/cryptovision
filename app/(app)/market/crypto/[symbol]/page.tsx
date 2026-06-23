'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  IconTrendingUp, IconTrendingDown, IconStar, IconChartBar,
  IconActivity, IconNews, IconArrowLeft,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { PriceChart } from '@/components/charts/PriceChart';

const TABS = ['Visão Geral', 'Análise Técnica', 'On-Chain', 'Notícias'] as const;

const MOCK_STATS = {
  high24h: 68450, low24h: 65120, ath: 73750, atl: 67.81,
  maxSupply: 21000000, circulatingSupply: 19700000,
  high52w: 73750, low52w: 24800,
};

const MOCK_INDICATORS = [
  { name: 'RSI (14)', value: '62.4', signal: 'Compra', direction: 'up' },
  { name: 'MACD', value: '245.3', signal: 'Compra', direction: 'up' },
  { name: 'SMA (20)', value: '$64,200', signal: 'Compra', direction: 'up' },
  { name: 'SMA (50)', value: '$61,800', signal: 'Compra', direction: 'up' },
  { name: 'SMA (200)', value: '$52,400', signal: 'Compra Forte', direction: 'up' },
  { name: 'Bollinger', value: 'Banda Superior', signal: 'Neutro', direction: 'neutral' },
  { name: 'EMA (20)', value: '$64,500', signal: 'Compra', direction: 'up' },
  { name: 'ATR (14)', value: '1,842', signal: 'Alta Volat.', direction: 'neutral' },
];

const MOCK_ONCHAIN = [
  { name: 'Active Addresses', value: '1.2M', change: 5.2 },
  { name: 'Exchange Net Flow', value: '-2,340 BTC', change: -12.1 },
  { name: 'Miner Outflow', value: '420 BTC', change: 3.4 },
  { name: 'NUPL', value: '0.58', change: 1.8 },
  { name: 'SOPR', value: '1.02', change: 0.5 },
  { name: 'Reserve Risk', value: '0.004', change: -2.1 },
];

const MOCK_NEWS = [
  { title: 'Bitcoin supera $67k com fluxo de ETFs', source: 'CoinDesk', time: '1h', sentiment: 'positivo' },
  { title: 'Hashrate do BTC atinge novo recorde', source: 'The Block', time: '3h', sentiment: 'positivo' },
  { title: 'Análise: Resistência em $70k pode limitar alta', source: 'CryptoSlate', time: '5h', sentiment: 'neutro' },
];

export default function CryptoDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = use(params);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Visão Geral');
  const [candleType, setCandleType] = useState<'candle' | 'line'>('candle');
  const upper = symbol.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/market/crypto" className="p-2 rounded-xl hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <IconArrowLeft size={20} />
        </Link>
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: 'var(--blue-glow)', color: 'var(--blue-bright)' }}>
          {upper.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{upper}</h1>
            <Badge variant="blue">#1</Badge>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>$66,842</span>
            <span className="text-sm font-semibold flex items-center gap-0.5" style={{ color: 'var(--green)' }}>
              <IconTrendingUp size={14} /> ▲ 2.4%
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Cap: $1.31T</span>
          </div>
        </div>
        <button className="p-2 rounded-xl hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <IconStar size={20} />
        </button>
      </div>

      {/* Chart */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2">
            {(['candle', 'line'] as const).map(t => (
              <button
                key={t}
                onClick={() => setCandleType(t)}
                className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: candleType === t ? 'var(--blue)' : 'var(--black4)',
                  color: candleType === t ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {t === 'candle' ? 'Candles' : 'Linha'}
              </button>
            ))}
          </div>
        </div>
        <PriceChart symbol={upper} candleType={candleType} height={380} showVolume />
      </Card>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2.5 text-sm font-medium transition-colors relative"
            style={{ color: activeTab === tab ? 'var(--blue-bright)' : 'var(--text-secondary)' }}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--blue)' }} />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Visão Geral' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Máx 24h', value: `$${MOCK_STATS.high24h.toLocaleString()}` },
            { label: 'Mín 24h', value: `$${MOCK_STATS.low24h.toLocaleString()}` },
            { label: 'ATH', value: `$${MOCK_STATS.ath.toLocaleString()}` },
            { label: 'ATL', value: `$${MOCK_STATS.atl.toLocaleString()}` },
            { label: 'Máx 52 semanas', value: `$${MOCK_STATS.high52w.toLocaleString()}` },
            { label: 'Mín 52 semanas', value: `$${MOCK_STATS.low52w.toLocaleString()}` },
            { label: 'Supply Circulante', value: `${(MOCK_STATS.circulatingSupply / 1e6).toFixed(1)}M` },
            { label: 'Supply Máximo', value: `${(MOCK_STATS.maxSupply / 1e6).toFixed(0)}M` },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3" style={{ background: 'var(--black3)' }}>
              <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-sm font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Análise Técnica' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Score Geral</h3>
            <ScoreBar value={74} height={10} />
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Recomendação: <strong style={{ color: 'var(--green)' }}>Compra</strong></p>
          </Card>
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Indicador</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Valor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Sinal</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_INDICATORS.map(ind => (
                  <tr key={ind.name} className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{ind.name}</td>
                    <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-secondary)' }}>{ind.value}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{
                        color: ind.direction === 'up' ? 'var(--green)' : ind.direction === 'down' ? 'var(--red)' : 'var(--text-secondary)'
                      }}>
                        {ind.direction === 'up' ? '↑' : ind.direction === 'down' ? '↓' : '→'} {ind.signal}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'On-Chain' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_ONCHAIN.map(m => (
            <Card key={m.name}>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>{m.name}</p>
              <p className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{m.value}</p>
              <span className="text-xs font-semibold" style={{ color: m.change >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {m.change >= 0 ? '▲' : '▼'} {Math.abs(m.change).toFixed(1)}%
              </span>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'Notícias' && (
        <div className="space-y-3">
          {MOCK_NEWS.map(n => (
            <Card key={n.title}>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{n.source}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {n.time}</span>
                  </div>
                </div>
                <Badge variant={n.sentiment === 'positivo' ? 'green' : n.sentiment === 'negativo' ? 'red' : 'gray'} size="sm">
                  {n.sentiment}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
