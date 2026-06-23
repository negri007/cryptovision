'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  IconCurrencyBitcoin, IconVolume, IconBriefcase, IconChartPie,
  IconTrendingUp, IconTrendingDown, IconCalendarEvent, IconExternalLink,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PriceChart } from '@/components/charts/PriceChart';
import { FearGreedGauge } from '@/components/charts/FearGreedGauge';
import { ScoreCard } from '@/components/recommendations/ScoreCard';

const METRICS = [
  { label: 'CAP TOTAL', value: '$2.14T', change: 1.2, accent: 'blue' as const, icon: <IconCurrencyBitcoin size={18} /> },
  { label: 'VOLUME 24H', value: '$148.2B', change: -0.8, accent: 'green' as const, icon: <IconVolume size={18} /> },
  { label: 'PORTFÓLIO', value: 'R$ 45.320', change: 2.1, accent: 'yellow' as const, icon: <IconBriefcase size={18} /> },
  { label: 'DOMINÂNCIA BTC', value: '52.3%', change: 0.4, accent: 'blue' as const, icon: <IconChartPie size={18} /> },
];

const TOP_GAINERS = [
  { symbol: 'RENDER', name: 'Render', price: 11.42, change: 18.7 },
  { symbol: 'INJ', name: 'Injective', price: 28.95, change: 12.4 },
  { symbol: 'FET', name: 'Fetch.ai', price: 2.31, change: 9.8 },
  { symbol: 'SOL', name: 'Solana', price: 178.55, change: 7.2 },
  { symbol: 'AVAX', name: 'Avalanche', price: 42.18, change: 5.9 },
];

const RECOMMENDATIONS = [
  { symbol: 'BTC', name: 'Bitcoin', score: 82, label: 'Compra Forte', indicators: [{ name: 'RSI', value: 78 }, { name: 'MACD', value: 85 }, { name: 'MA', value: 80 }, { name: 'Volume', value: 75 }] },
  { symbol: 'ETH', name: 'Ethereum', score: 71, label: 'Compra', indicators: [{ name: 'RSI', value: 65 }, { name: 'MACD', value: 72 }, { name: 'MA', value: 78 }, { name: 'Volume', value: 68 }] },
  { symbol: 'SOL', name: 'Solana', score: 68, label: 'Compra', indicators: [{ name: 'RSI', value: 70 }, { name: 'MACD', value: 62 }, { name: 'MA', value: 74 }, { name: 'Volume', value: 66 }] },
];

const NEWS = [
  { id: '1', title: 'Bitcoin atinge nova alta após decisão do Fed', source: 'CoinDesk', time: '2h', sentiment: 'positivo' as const },
  { id: '2', title: 'Ethereum finaliza atualização Dencun com sucesso', source: 'The Block', time: '4h', sentiment: 'positivo' as const },
  { id: '3', title: 'SEC adia decisão sobre ETF de Solana', source: 'Reuters', time: '5h', sentiment: 'negativo' as const },
  { id: '4', title: 'Banco Central do Brasil avança com piloto do Drex', source: 'InfoMoney', time: '6h', sentiment: 'neutro' as const },
  { id: '5', title: 'Mercado de NFTs mostra sinais de recuperação', source: 'Decrypt', time: '8h', sentiment: 'positivo' as const },
];

const EVENTS = [
  { id: '1', title: 'FOMC Meeting', date: '26 Jun', impact: 'high' as const },
  { id: '2', title: 'ETH Staking Reward Update', date: '28 Jun', impact: 'medium' as const },
  { id: '3', title: 'COPOM Decisão Taxa Selic', date: '30 Jun', impact: 'high' as const },
  { id: '4', title: 'Binance Launchpool Novo Token', date: '01 Jul', impact: 'low' as const },
  { id: '5', title: 'Bitcoin Difficulty Adjustment', date: '03 Jul', impact: 'medium' as const },
];

const SENTIMENT_MAP = { positivo: 'green', negativo: 'red', neutro: 'gray' } as const;
const IMPACT_MAP = { high: 'red', medium: 'yellow', low: 'blue' } as const;

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Row 1 - Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {METRICS.map(m => (
          <Card key={m.label} accent={m.accent}>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg" style={{ background: 'var(--black4)', color: 'var(--text-muted)' }}>
                {m.icon}
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                {m.label}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{m.value}</span>
              <span className="text-xs font-semibold flex items-center gap-0.5" style={{ color: m.change >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {m.change >= 0 ? <IconTrendingUp size={12} /> : <IconTrendingDown size={12} />}
                {m.change >= 0 ? '▲' : '▼'} {Math.abs(m.change).toFixed(1)}%
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Row 2 - Chart + Right Column */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Bitcoin (BTC)</h2>
            <div className="flex items-center gap-2">
              <Badge variant="blue">RSI 62</Badge>
              <Badge variant="green">MACD ↑</Badge>
            </div>
          </div>
          <PriceChart symbol="BTC" candleType="line" height={320} showToolbar />
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
              Maiores Altas 24h
            </h3>
            <div className="space-y-2.5">
              {TOP_GAINERS.map(g => (
                <Link key={g.symbol} href={`/market/crypto/${g.symbol.toLowerCase()}`} className="flex items-center gap-2.5 group">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'var(--black4)', color: 'var(--text-secondary)' }}>
                    {g.symbol.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-blue-bright transition-colors" style={{ color: 'var(--text-primary)' }}>{g.name}</p>
                    <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>${g.price.toLocaleString()}</p>
                  </div>
                  <span className="text-xs font-bold" style={{ color: 'var(--green)' }}>+{g.change}%</span>
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
              Fear & Greed Index
            </h3>
            <FearGreedGauge value={72} />
          </Card>
        </div>
      </div>

      {/* Row 3 - Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Top Recomendações</h2>
          <Link href="/recommendations" className="text-xs font-medium flex items-center gap-1 hover:text-blue-bright transition-colors" style={{ color: 'var(--text-secondary)' }}>
            Ver todas <IconExternalLink size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RECOMMENDATIONS.map(r => (
            <ScoreCard key={r.symbol} {...r} />
          ))}
        </div>
      </div>

      {/* Row 4 - News + Events */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Notícias Recentes</h3>
            <Link href="/news" className="text-xs hover:text-blue-bright transition-colors" style={{ color: 'var(--text-secondary)' }}>
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {NEWS.map(n => (
              <div key={n.id} className="flex items-start gap-3 py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug hover:text-blue-bright cursor-pointer transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {n.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{n.source}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>·</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{n.time}</span>
                  </div>
                </div>
                <Badge variant={SENTIMENT_MAP[n.sentiment]} size="sm">{n.sentiment}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              <IconCalendarEvent size={14} className="inline mr-1" />
              Próximos Eventos
            </h3>
          </div>
          <div className="space-y-3">
            {EVENTS.map(ev => (
              <div key={ev.id} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                <div className="text-center flex-shrink-0" style={{ minWidth: 44 }}>
                  <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{ev.date.split(' ')[0]}</p>
                  <p className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>{ev.date.split(' ')[1]}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{ev.title}</p>
                </div>
                <Badge variant={IMPACT_MAP[ev.impact]} size="sm">{ev.impact}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
