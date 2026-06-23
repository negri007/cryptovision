'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { IconArrowLeft, IconDeviceFloppy, IconChevronRight, IconChevronLeft } from '@tabler/icons-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { PriceChart } from '@/components/charts/PriceChart';

const TIMEFRAMES = [
  { label: '1min', pro: true }, { label: '5min', pro: true },
  { label: '15min', pro: false }, { label: '1h', pro: false },
  { label: '4h', pro: false }, { label: '1D', pro: false },
  { label: '1W', pro: false }, { label: '1M', pro: false },
];

const INDICATORS_DATA = [
  { name: 'RSI (14)', value: 62.4, signal: 'Compra', score: 68 },
  { name: 'MACD', value: 245.3, signal: 'Compra', score: 72 },
  { name: 'SMA (20)', value: 64200, signal: 'Compra', score: 78 },
  { name: 'SMA (50)', value: 61800, signal: 'Compra', score: 74 },
  { name: 'SMA (200)', value: 52400, signal: 'Compra Forte', score: 88 },
  { name: 'EMA (20)', value: 64500, signal: 'Compra', score: 76 },
  { name: 'Bollinger Bands', value: 0, signal: 'Neutro', score: 50 },
  { name: 'ATR (14)', value: 1842, signal: 'Alta Volat.', score: 45 },
  { name: 'OBV', value: 0, signal: 'Compra', score: 65 },
  { name: 'VWAP', value: 65100, signal: 'Compra', score: 70 },
];

export default function TechnicalAnalysisPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = use(params);
  const [timeframe, setTimeframe] = useState('1D');
  const [panelOpen, setPanelOpen] = useState(true);
  const upper = symbol.toUpperCase();

  const overallScore = Math.round(INDICATORS_DATA.reduce((s, i) => s + i.score, 0) / INDICATORS_DATA.length);

  return (
    <div className="space-y-4">
      {/* Compact header */}
      <div className="flex items-center gap-3">
        <Link href="/analysis/technical" className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <IconArrowLeft size={18} />
        </Link>
        <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Análise Técnica — {upper}</h1>
        <div className="ml-auto flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors hover:border-blue-bright"
            style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            <IconDeviceFloppy size={14} /> Salvar análise
          </button>
        </div>
      </div>

      {/* Timeframe selector */}
      <div className="flex gap-1.5">
        {TIMEFRAMES.map(tf => (
          <button
            key={tf.label}
            onClick={() => !tf.pro && setTimeframe(tf.label)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative"
            style={{
              background: timeframe === tf.label ? 'var(--blue)' : 'var(--black4)',
              color: timeframe === tf.label ? '#fff' : tf.pro ? 'var(--text-muted)' : 'var(--text-secondary)',
              opacity: tf.pro ? 0.5 : 1,
              cursor: tf.pro ? 'not-allowed' : 'pointer',
            }}
          >
            {tf.label}
            {tf.pro && <span className="absolute -top-1.5 -right-1.5 text-[8px] px-1 rounded-full font-bold" style={{ background: 'var(--yellow)', color: 'var(--black)' }}>PRO</span>}
          </button>
        ))}
      </div>

      {/* Chart + Side Panel */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Card>
            <PriceChart symbol={upper} interval={timeframe} candleType="candle" height={500} showToolbar={false} showVolume />
          </Card>
        </div>

        {/* Side panel */}
        {panelOpen && (
          <div className="w-72 flex-shrink-0 space-y-3">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Score Geral</h3>
                <Badge variant={overallScore >= 60 ? 'green' : overallScore >= 40 ? 'yellow' : 'red'}>
                  {overallScore >= 70 ? 'Compra' : overallScore >= 40 ? 'Neutro' : 'Venda'}
                </Badge>
              </div>
              <ScoreBar value={overallScore} height={10} />
            </Card>

            <Card>
              <h3 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Indicadores</h3>
              <div className="space-y-2.5">
                {INDICATORS_DATA.map(ind => (
                  <div key={ind.name}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span style={{ color: 'var(--text-secondary)' }}>{ind.name}</span>
                      <span className="font-semibold" style={{
                        color: ind.signal.includes('Compra') ? 'var(--green)' : ind.signal.includes('Venda') ? 'var(--red)' : 'var(--text-secondary)'
                      }}>
                        {ind.signal}
                      </span>
                    </div>
                    <ScoreBar value={ind.score} showLabel={false} height={4} />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="self-start p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          {panelOpen ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
        </button>
      </div>
    </div>
  );
}
