'use client';

import Link from 'next/link';
import { useState } from 'react';
import { IconPlus, IconBriefcase, IconTrendingUp, IconTrendingDown, IconLink } from '@tabler/icons-react';

const MOCK_PORTFOLIOS = [
  {
    id: 'default',
    name: 'Carteira Principal',
    totalBRL: 45320.50,
    dayChangePct: 2.14,
    dayChangeVal: 948.12,
    assets: [
      { symbol: 'BTC', pct: 55 },
      { symbol: 'ETH', pct: 28 },
      { symbol: 'SOL', pct: 10 },
      { symbol: 'USDT', pct: 7 },
    ]
  },
  {
    id: 'longo-prazo',
    name: 'Longo Prazo',
    totalBRL: 12450.00,
    dayChangePct: -0.87,
    dayChangeVal: -109.14,
    assets: [
      { symbol: 'BTC', pct: 80 },
      { symbol: 'ETH', pct: 20 },
    ]
  }
];

const ASSET_COLORS: Record<string, string> = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  SOL: '#9945FF',
  USDT: '#26A17B',
  BNB: '#F3BA2F',
};

function MiniPieChart({ assets }: { assets: { symbol: string; pct: number }[] }) {
  let currentAngle = -90;
  const cx = 30, cy = 30, r = 25;

  const slices = assets.map(a => {
    const angle = (a.pct / 100) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return { ...a, startAngle, endAngle: currentAngle };
  });

  const toXY = (angle: number) => ({
    x: cx + r * Math.cos((angle * Math.PI) / 180),
    y: cy + r * Math.sin((angle * Math.PI) / 180),
  });

  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      {slices.map((s, i) => {
        const start = toXY(s.startAngle);
        const end = toXY(s.endAngle);
        const largeArc = s.endAngle - s.startAngle > 180 ? 1 : 0;
        const path = `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
        return <path key={i} d={path} fill={ASSET_COLORS[s.symbol] || 'var(--blue)'} />;
      })}
    </svg>
  );
}

export default function PortfolioPage() {
  const [portfolios] = useState(MOCK_PORTFOLIOS);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Meus Portfólios</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Gerencie seus investimentos em um só lugar</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/portfolio/exchanges" id="portfolio-connect-exchange"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-all hover:bg-white/5"
            style={{ borderColor: 'var(--border-bright)', color: 'var(--text-secondary)' }}>
            <IconLink size={16} />
            Conectar Exchange
          </Link>
          <button id="portfolio-new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--blue)', color: '#fff' }}>
            <IconPlus size={16} />
            Novo Portfólio
          </button>
        </div>
      </div>

      {/* Portfolio cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {portfolios.map(portfolio => (
          <Link key={portfolio.id} href={`/portfolio/${portfolio.id}`} id={`portfolio-card-${portfolio.id}`}
            className="block rounded-2xl border p-5 transition-all hover:border-blue-bright cursor-pointer group"
            style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--blue-glow)' }}>
                  <IconBriefcase size={20} style={{ color: 'var(--blue-bright)' }} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{portfolio.name}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{portfolio.assets.length} ativos</p>
                </div>
              </div>
              <MiniPieChart assets={portfolio.assets} />
            </div>

            <div className="mb-4">
              <p className="text-2xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                {portfolio.totalBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <div className="flex items-center gap-1 mt-0.5" style={{ color: portfolio.dayChangePct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {portfolio.dayChangePct >= 0 ? <IconTrendingUp size={14} /> : <IconTrendingDown size={14} />}
                <span className="text-sm font-medium">
                  {portfolio.dayChangePct >= 0 ? '+' : ''}{portfolio.dayChangePct.toFixed(2)}%
                </span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  ({portfolio.dayChangeVal >= 0 ? '+' : ''}{portfolio.dayChangeVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) hoje
                </span>
              </div>
            </div>

            {/* Asset breakdown */}
            <div className="flex flex-wrap gap-1.5">
              {portfolio.assets.map(a => (
                <span key={a.symbol} className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'var(--black3)', color: 'var(--text-secondary)' }}>
                  {a.symbol} {a.pct}%
                </span>
              ))}
            </div>
          </Link>
        ))}

        {/* Add new portfolio card */}
        <button id="portfolio-add-card"
          className="h-full min-h-40 rounded-2xl border border-dashed p-5 flex flex-col items-center justify-center gap-2 transition-all hover:border-blue-bright hover:bg-white/2"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <div className="w-10 h-10 rounded-xl border border-dashed flex items-center justify-center" style={{ borderColor: 'var(--border-bright)' }}>
            <IconPlus size={20} />
          </div>
          <span className="text-sm">Criar novo portfólio</span>
        </button>
      </div>
    </div>
  );
}
