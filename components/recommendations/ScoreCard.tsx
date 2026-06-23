'use client';

import { ScoreBar } from '@/components/ui/ScoreBar';
import { Badge } from '@/components/ui/Badge';

interface ScoreCardProps {
  symbol: string;
  name: string;
  logo?: string;
  score: number;
  label: string;
  indicators: { name: string; value: number }[];
  onClick?: () => void;
  className?: string;
}

function getLabelVariant(label: string): 'green' | 'blue' | 'yellow' | 'red' | 'gray' {
  switch (label) {
    case 'Compra Forte': return 'green';
    case 'Compra': return 'blue';
    case 'Neutro': return 'gray';
    case 'Venda': return 'yellow';
    case 'Venda Forte': return 'red';
    default: return 'gray';
  }
}

export function ScoreCard({ symbol, name, logo, score, label, indicators, onClick, className = '' }: ScoreCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border p-4 transition-all hover:border-blue-bright/30 ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''} ${className}`}
      style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-3 mb-3">
        {logo ? (
          <img src={logo} alt={name} className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--black4)', color: 'var(--text-secondary)' }}>
            {symbol.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{name}</p>
          <p className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{symbol}</p>
        </div>
        <Badge variant={getLabelVariant(label)} size="sm">{label}</Badge>
      </div>

      <ScoreBar value={score} className="mb-3" />

      <div className="grid grid-cols-2 gap-2">
        {indicators.slice(0, 4).map(ind => (
          <div key={ind.name} className="rounded-lg px-2.5 py-1.5" style={{ background: 'var(--black3)' }}>
            <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{ind.name}</p>
            <p className="text-xs font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{ind.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
