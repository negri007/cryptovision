'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { IconArrowLeft, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { PriceChart } from '@/components/charts/PriceChart';

const TABS = ['Fundamentos', 'Dividendos', 'Análise Técnica', 'Notícias'] as const;

const FUNDAMENTALS = [
  { label: 'P/L', value: '8.4' },
  { label: 'P/VP', value: '1.6' },
  { label: 'ROE', value: '22.5%' },
  { label: 'Dividend Yield', value: '5.2%' },
  { label: 'EBITDA', value: 'R$ 42.8B' },
  { label: 'Dívida/EBITDA', value: '1.2x' },
  { label: 'Margem Líquida', value: '28.4%' },
  { label: 'Margem EBITDA', value: '35.1%' },
];

const DIVIDENDS = [
  { date: 'Mar 2024', type: 'JCP', value: 'R$ 0.42' },
  { date: 'Dez 2023', type: 'Dividendo', value: 'R$ 0.85' },
  { date: 'Set 2023', type: 'JCP', value: 'R$ 0.38' },
  { date: 'Jun 2023', type: 'Dividendo', value: 'R$ 1.12' },
  { date: 'Mar 2023', type: 'JCP', value: 'R$ 0.35' },
];

const INDICATORS = [
  { name: 'RSI (14)', value: '55.2', signal: 'Neutro', direction: 'neutral' },
  { name: 'MACD', value: '0.42', signal: 'Compra', direction: 'up' },
  { name: 'SMA (20)', value: 'R$ 31.80', signal: 'Compra', direction: 'up' },
  { name: 'SMA (50)', value: 'R$ 30.50', signal: 'Compra', direction: 'up' },
  { name: 'Bollinger', value: 'Média', signal: 'Neutro', direction: 'neutral' },
];

const NEWS = [
  { title: 'Resultado do 4T23 supera expectativas do mercado', source: 'InfoMoney', time: '2h', sentiment: 'positivo' },
  { title: 'Analistas elevam preço-alvo após balanço', source: 'Valor', time: '5h', sentiment: 'positivo' },
  { title: 'Setor bancário pressionado por inadimplência', source: 'Bloomberg', time: '1d', sentiment: 'negativo' },
];

export default function StockDetailPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = use(params);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Fundamentos');
  const upper = ticker.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/market/stocks" className="p-2 rounded-xl hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <IconArrowLeft size={20} />
        </Link>
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
          {upper.charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{upper}</h1>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>R$ 32.87</span>
            <span className="text-sm font-semibold flex items-center gap-0.5" style={{ color: 'var(--green)' }}>
              <IconTrendingUp size={14} /> ▲ 0.55%
            </span>
            <Badge variant="blue">B3</Badge>
          </div>
        </div>
      </div>

      {/* Chart */}
      <Card>
        <PriceChart symbol={upper} candleType="candle" height={350} showVolume />
      </Card>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-2.5 text-sm font-medium transition-colors relative"
            style={{ color: activeTab === tab ? 'var(--blue-bright)' : 'var(--text-secondary)' }}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--blue)' }} />}
          </button>
        ))}
      </div>

      {activeTab === 'Fundamentos' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FUNDAMENTALS.map(f => (
            <div key={f.label} className="rounded-xl p-3" style={{ background: 'var(--black3)' }}>
              <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
              <p className="text-sm font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{f.value}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Dividendos' && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Data</th>
                <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Valor/Ação</th>
              </tr>
            </thead>
            <tbody>
              {DIVIDENDS.map(d => (
                <tr key={d.date} className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{d.date}</td>
                  <td className="px-4 py-3"><Badge variant={d.type === 'Dividendo' ? 'green' : 'blue'} size="sm">{d.type}</Badge></td>
                  <td className="px-4 py-3 font-mono font-medium" style={{ color: 'var(--green)' }}>{d.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Análise Técnica' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Score Geral</h3>
            <ScoreBar value={62} height={10} />
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
                {INDICATORS.map(ind => (
                  <tr key={ind.name} className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{ind.name}</td>
                    <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-secondary)' }}>{ind.value}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold" style={{ color: ind.direction === 'up' ? 'var(--green)' : ind.direction === 'down' ? 'var(--red)' : 'var(--text-secondary)' }}>
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

      {activeTab === 'Notícias' && (
        <div className="space-y-3">
          {NEWS.map(n => (
            <Card key={n.title}>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{n.source} · {n.time}</span>
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
