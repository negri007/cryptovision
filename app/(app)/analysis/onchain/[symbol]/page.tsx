'use client';

import { use } from 'react';
import Link from 'next/link';
import { IconArrowLeft, IconLock, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Sparkline } from '@/components/ui/Sparkline';

function randomSpark(): number[] {
  const d: number[] = [];
  let v = 50;
  for (let i = 0; i < 20; i++) { v += (Math.random() - 0.48) * 5; d.push(v); }
  return d;
}

const BTC_METRICS = [
  { name: 'Active Addresses', value: '1.24M', change: 5.2, free: true, spark: randomSpark() },
  { name: 'Exchange Net Flow', value: '-2,340 BTC', change: -12.1, free: true, spark: randomSpark() },
  { name: 'Miner Outflow', value: '420 BTC', change: 3.4, free: false, spark: randomSpark() },
  { name: 'NUPL', value: '0.58', change: 1.8, free: false, spark: randomSpark() },
  { name: 'SOPR', value: '1.02', change: 0.5, free: false, spark: randomSpark() },
  { name: 'Reserve Risk', value: '0.0041', change: -2.1, free: false, spark: randomSpark() },
  { name: 'Stock-to-Flow', value: '56.2', change: 0.0, free: false, spark: randomSpark() },
];

const ETH_METRICS = [
  { name: 'Active Addresses', value: '584K', change: 3.1, free: true, spark: randomSpark() },
  { name: 'Exchange Net Flow', value: '-18,200 ETH', change: -8.4, free: true, spark: randomSpark() },
  { name: 'Gas Price', value: '24 Gwei', change: -15.2, free: false, spark: randomSpark() },
];

const WHALE_ALERTS = [
  { time: '14:32', from: 'Unknown', to: 'Binance', amount: '1,200 BTC', usd: '$80.1M' },
  { time: '13:15', from: 'Coinbase', to: 'Unknown', amount: '850 BTC', usd: '$56.8M' },
  { time: '12:01', from: 'Unknown', to: 'Unknown', amount: '2,000 BTC', usd: '$133.6M' },
  { time: '10:44', from: 'Kraken', to: 'Unknown', amount: '420 BTC', usd: '$28.1M' },
];

export default function OnChainPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = use(params);
  const upper = symbol.toUpperCase();
  const metrics = upper === 'BTC' ? BTC_METRICS : ETH_METRICS;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/analysis/onchain" className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <IconArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>On-Chain — {upper}</h1>
        <Badge variant="blue">Pro+</Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map(m => (
          <Card key={m.name} className="relative">
            {!m.free && (
              <div className="absolute inset-0 rounded-2xl flex items-center justify-center z-10"
                style={{ background: 'rgba(8,10,15,0.8)', backdropFilter: 'blur(4px)' }}>
                <div className="text-center">
                  <IconLock size={24} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-1" />
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Pro+</p>
                </div>
              </div>
            )}
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{m.name}</p>
              <span className="text-xs font-semibold flex items-center gap-0.5" style={{ color: m.change >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {m.change >= 0 ? <IconTrendingUp size={11} /> : <IconTrendingDown size={11} />}
                {m.change >= 0 ? '+' : ''}{m.change.toFixed(1)}%
              </span>
            </div>
            <p className="text-xl font-bold font-mono mb-3" style={{ color: 'var(--text-primary)' }}>{m.value}</p>
            <Sparkline data={m.spark} color="var(--blue)" width={200} height={40} />
          </Card>
        ))}
      </div>

      {/* Whale Alerts */}
      {upper === 'BTC' && (
        <div>
          <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Whale Alerts</h2>
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Hora</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>De</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Para</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Quantidade</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Valor USD</th>
                </tr>
              </thead>
              <tbody>
                {WHALE_ALERTS.map((w, i) => (
                  <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{w.time}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{w.from}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{w.to}</td>
                    <td className="px-4 py-3 font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{w.amount}</td>
                    <td className="px-4 py-3 font-mono font-medium" style={{ color: 'var(--yellow)' }}>{w.usd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
