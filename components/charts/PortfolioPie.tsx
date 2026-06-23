'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatUSD } from '@/lib/utils/formatters';

interface PieAsset {
  symbol: string;
  value: number;
  color: string;
}

interface PortfolioPieProps {
  assets: PieAsset[];
  className?: string;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border px-3 py-2 text-xs" style={{ background: 'var(--black3)', borderColor: 'var(--border-bright)' }}>
      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{d.symbol}</p>
      <p style={{ color: 'var(--text-secondary)' }}>{formatUSD(d.value)}</p>
    </div>
  );
}

export function PortfolioPie({ assets, className = '' }: PortfolioPieProps) {
  const total = assets.reduce((s, a) => s + a.value, 0);

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div style={{ width: 140, height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={assets}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {assets.map((a, i) => (
                <Cell key={i} fill={a.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-1.5">
        {assets.map(a => (
          <div key={a.symbol} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: a.color }} />
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{a.symbol}</span>
            <span className="ml-auto tabular-nums" style={{ color: 'var(--text-secondary)' }}>
              {total > 0 ? ((a.value / total) * 100).toFixed(1) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
