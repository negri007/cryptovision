'use client';

import { useState } from 'react';
import {
  IconAlertTriangle, IconTrendingUp, IconTrendingDown,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/Badge';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { ScoreBreakdown } from '@/components/recommendations/ScoreBreakdown';
import { formatMarketCap } from '@/lib/utils/formatters';

const LABELS = ['Todos', 'Compra Forte', 'Compra', 'Neutro', 'Venda', 'Venda Forte'];
const TYPES = ['Todos', 'Cripto', 'Ação'];

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

const MOCK_RECS = [
  { symbol: 'BTC', name: 'Bitcoin', type: 'Cripto', score: 82, label: 'Compra Forte', price: 66842, change24h: 2.41, volume: 42e9, breakdown: [{ name: 'RSI', weight: '20%', value: 78 }, { name: 'MACD', weight: '20%', value: 85 }, { name: 'MA', weight: '20%', value: 80 }, { name: 'Volume', weight: '15%', value: 75 }, { name: 'Sentimento', weight: '15%', value: 88 }, { name: 'On-chain', weight: '10%', value: 82 }], accuracy: [{ horizon: '24h', rate: 68 }, { horizon: '7d', rate: 62 }, { horizon: '30d', rate: 71 }] },
  { symbol: 'ETH', name: 'Ethereum', type: 'Cripto', score: 71, label: 'Compra', price: 3521, change24h: 1.62, volume: 18e9, breakdown: [{ name: 'RSI', weight: '20%', value: 65 }, { name: 'MACD', weight: '20%', value: 72 }, { name: 'MA', weight: '20%', value: 78 }, { name: 'Volume', weight: '15%', value: 68 }, { name: 'Sentimento', weight: '15%', value: 74 }, { name: 'On-chain', weight: '10%', value: 66 }], accuracy: [{ horizon: '24h', rate: 64 }, { horizon: '7d', rate: 58 }, { horizon: '30d', rate: 66 }] },
  { symbol: 'SOL', name: 'Solana', type: 'Cripto', score: 68, label: 'Compra', price: 178.5, change24h: 7.21, volume: 5.6e9, breakdown: [{ name: 'RSI', weight: '20%', value: 70 }, { name: 'MACD', weight: '20%', value: 62 }, { name: 'MA', weight: '20%', value: 74 }, { name: 'Volume', weight: '15%', value: 66 }, { name: 'Sentimento', weight: '15%', value: 64 }, { name: 'On-chain', weight: '10%', value: 60 }], accuracy: [{ horizon: '24h', rate: 61 }, { horizon: '7d', rate: 55 }, { horizon: '30d', rate: 59 }] },
  { symbol: 'XRP', name: 'XRP', type: 'Cripto', score: 45, label: 'Neutro', price: 0.632, change24h: -1.14, volume: 2.8e9, breakdown: [{ name: 'RSI', weight: '20%', value: 48 }, { name: 'MACD', weight: '20%', value: 42 }, { name: 'MA', weight: '20%', value: 50 }, { name: 'Volume', weight: '15%', value: 40 }, { name: 'Sentimento', weight: '15%', value: 44 }, { name: 'On-chain', weight: '10%', value: 38 }], accuracy: [{ horizon: '24h', rate: 52 }, { horizon: '7d', rate: 48 }, { horizon: '30d', rate: 51 }] },
  { symbol: 'AVAX', name: 'Avalanche', type: 'Cripto', score: 74, label: 'Compra', price: 42.18, change24h: 5.87, volume: 1.2e9, breakdown: [{ name: 'RSI', weight: '20%', value: 72 }, { name: 'MACD', weight: '20%', value: 78 }, { name: 'MA', weight: '20%', value: 76 }, { name: 'Volume', weight: '15%', value: 70 }, { name: 'Sentimento', weight: '15%', value: 72 }, { name: 'On-chain', weight: '10%', value: 68 }], accuracy: [] },
  { symbol: 'PETR4', name: 'Petrobras', type: 'Ação', score: 65, label: 'Compra', price: 38.42, change24h: 1.82, volume: 2.1e9, breakdown: [{ name: 'RSI', weight: '20%', value: 60 }, { name: 'MACD', weight: '20%', value: 68 }, { name: 'MA', weight: '20%', value: 72 }, { name: 'Volume', weight: '15%', value: 58 }, { name: 'Sentimento', weight: '15%', value: 62 }, { name: 'On-chain', weight: '10%', value: 55 }], accuracy: [{ horizon: '24h', rate: 58 }, { horizon: '7d', rate: 54 }, { horizon: '30d', rate: 60 }] },
  { symbol: 'ADA', name: 'Cardano', type: 'Cripto', score: 35, label: 'Venda', price: 0.481, change24h: 3.42, volume: 890e6, breakdown: [{ name: 'RSI', weight: '20%', value: 32 }, { name: 'MACD', weight: '20%', value: 28 }, { name: 'MA', weight: '20%', value: 42 }, { name: 'Volume', weight: '15%', value: 35 }, { name: 'Sentimento', weight: '15%', value: 38 }, { name: 'On-chain', weight: '10%', value: 30 }], accuracy: [{ horizon: '24h', rate: 45 }, { horizon: '7d', rate: 42 }, { horizon: '30d', rate: 48 }] },
];

export default function RecommendationsPage() {
  const [labelFilter, setLabelFilter] = useState('Todos');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [selectedRec, setSelectedRec] = useState<typeof MOCK_RECS[number] | null>(null);

  const filtered = MOCK_RECS.filter(r =>
    (labelFilter === 'Todos' || r.label === labelFilter) &&
    (typeFilter === 'Todos' || r.type === typeFilter)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Recomendações</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sinais automatizados baseados em indicadores técnicos e sentimento</p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 px-3 py-2 rounded-lg border" style={{ background: 'rgba(245,200,66,0.08)', borderColor: 'rgba(245,200,66,0.15)' }}>
        <IconAlertTriangle size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'rgba(245,200,66,0.7)' }} />
        <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(245,200,66,0.7)' }}>
          Os sinais desta plataforma são informativos e não constituem recomendação de investimento.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-1.5">
          {TYPES.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: typeFilter === t ? 'var(--blue)' : 'var(--black4)',
                color: typeFilter === t ? '#fff' : 'var(--text-secondary)',
              }}
            >{t}</button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {LABELS.map(l => (
            <button key={l} onClick={() => setLabelFilter(l)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: labelFilter === l ? 'var(--blue)' : 'var(--black4)',
                color: labelFilter === l ? '#fff' : 'var(--text-secondary)',
              }}
            >{l}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                <th className="px-4 py-3 text-xs font-semibold">Ativo</th>
                <th className="px-4 py-3 text-xs font-semibold">Score</th>
                <th className="px-4 py-3 text-xs font-semibold">Sinal</th>
                <th className="px-4 py-3 text-xs font-semibold">Preço</th>
                <th className="px-4 py-3 text-xs font-semibold">24h</th>
                <th className="px-4 py-3 text-xs font-semibold">Volume</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.symbol}
                  onClick={() => setSelectedRec(r)}
                  className="border-b transition-colors hover:bg-white/[0.03] cursor-pointer"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: 'var(--black4)', color: 'var(--text-secondary)' }}>
                        {r.symbol.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-sm block" style={{ color: 'var(--text-primary)' }}>{r.name}</span>
                        <span className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{r.symbol}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5" style={{ minWidth: 140 }}>
                    <ScoreBar value={r.score} height={6} />
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={getLabelVariant(r.label)} size="sm">{r.label}</Badge>
                  </td>
                  <td className="px-4 py-3.5 font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                    ${r.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-semibold flex items-center gap-0.5" style={{ color: r.change24h >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {r.change24h >= 0 ? <IconTrendingUp size={12} /> : <IconTrendingDown size={12} />}
                      {r.change24h >= 0 ? '+' : ''}{r.change24h.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {formatMarketCap(r.volume)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Breakdown modal */}
      {selectedRec && (
        <ScoreBreakdown
          isOpen={!!selectedRec}
          onClose={() => setSelectedRec(null)}
          symbol={selectedRec.symbol}
          name={selectedRec.name}
          score={selectedRec.score}
          label={selectedRec.label}
          breakdown={selectedRec.breakdown}
          accuracy={selectedRec.accuracy.length > 0 ? selectedRec.accuracy : undefined}
        />
      )}
    </div>
  );
}
