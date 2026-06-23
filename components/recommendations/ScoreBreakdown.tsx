'use client';

import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { ScoreBar } from '@/components/ui/ScoreBar';

interface BreakdownItem {
  name: string;
  weight: string;
  value: number;
}

interface AccuracyItem {
  horizon: string;
  rate: number;
}

interface ScoreBreakdownProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  name: string;
  score: number;
  label: string;
  breakdown: BreakdownItem[];
  accuracy?: AccuracyItem[];
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

export function ScoreBreakdown({ isOpen, onClose, symbol, name, score, label, breakdown, accuracy }: ScoreBreakdownProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${name} (${symbol})`} maxWidth="520px">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{score}</span>
          <Badge variant={getLabelVariant(label)} size="md">{label}</Badge>
        </div>

        <ScoreBar value={score} height={10} />

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Breakdown
          </h3>
          {breakdown.map(b => (
            <div key={b.name}>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: 'var(--text-secondary)' }}>{b.name} ({b.weight})</span>
                <span className="font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{b.value}</span>
              </div>
              <ScoreBar value={b.value} showLabel={false} height={6} />
            </div>
          ))}
        </div>

        {accuracy && accuracy.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
              Taxa de Acerto
            </h3>
            <div className="flex gap-2">
              {accuracy.map(a => (
                <div key={a.horizon} className="flex-1 rounded-lg p-2.5 text-center" style={{ background: 'var(--black3)' }}>
                  <p className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>{a.horizon}</p>
                  <p className="text-sm font-bold" style={{ color: a.rate >= 60 ? 'var(--green)' : a.rate >= 50 ? 'var(--yellow)' : 'var(--red)' }}>
                    {a.rate}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
