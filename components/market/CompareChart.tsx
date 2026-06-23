'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#1A6FE8', '#00D97E', '#F5C842', '#FF5B5B', '#2D88FF'];

const AVAILABLE_ASSETS = ['BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'XRP', 'DOT', 'AVAX', 'LINK', 'MATIC'];

function generateNormalized(days: number): number[] {
  const vals = [100];
  for (let i = 1; i < days; i++) {
    vals.push(vals[i - 1] + (Math.random() - 0.48) * 4);
  }
  return vals;
}

interface CompareChartProps {
  className?: string;
}

export function CompareChart({ className = '' }: CompareChartProps) {
  const [selected, setSelected] = useState<string[]>(['BTC', 'ETH']);

  const days = 30;
  const data = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    const entry: Record<string, any> = { date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) };
    return entry;
  });

  const seriesCache: Record<string, number[]> = {};
  selected.forEach(sym => {
    seriesCache[sym] = generateNormalized(days);
    data.forEach((d, i) => { d[sym] = seriesCache[sym][i]; });
  });

  const toggleAsset = (sym: string) => {
    if (selected.includes(sym)) {
      if (selected.length > 1) setSelected(selected.filter(s => s !== sym));
    } else if (selected.length < 5) {
      setSelected([...selected, sym]);
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 mb-4">
        {AVAILABLE_ASSETS.map(sym => (
          <button
            key={sym}
            onClick={() => toggleAsset(sym)}
            className="px-3 py-1 rounded-lg text-xs font-semibold transition-all border"
            style={{
              background: selected.includes(sym) ? 'var(--blue-glow)' : 'var(--black4)',
              color: selected.includes(sym) ? 'var(--blue-bright)' : 'var(--text-secondary)',
              borderColor: selected.includes(sym) ? 'var(--blue)' : 'var(--border)',
            }}
          >
            {sym}
          </button>
        ))}
      </div>
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#7B8FA8' }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#7B8FA8' }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'var(--black3)', border: '1px solid var(--border-bright)', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: 'var(--text-secondary)' }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {selected.map((sym, i) => (
              <Line key={sym} type="monotone" dataKey={sym} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
