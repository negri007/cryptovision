'use client';

import { useState } from 'react';
import { IconArrowLeft, IconCoins, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import Link from 'next/link';

type Trend = 'bullish' | 'bearish' | 'sideways';

export default function DcaPage() {
  const [amount, setAmount] = useState<number>(200); // investment per period
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('monthly');
  const [periods, setPeriods] = useState<number>(12); // number of periods
  const [trend, setTrend] = useState<Trend>('bullish');
  const [startPrice, setStartPrice] = useState<number>(50000); // start price of asset

  // Calculate DCA path and results
  const calculateDca = () => {
    let currentPrice = startPrice;
    let totalInvested = 0;
    let totalCoins = 0;
    const history: { period: number; price: number; invested: number; coinsBought: number; totalCoins: number; avgPrice: number; equity: number }[] = [];

    for (let i = 1; i <= periods; i++) {
      // Simulate price movement based on trend
      let variance = (Math.random() - 0.5) * 0.1; // +/- 5% random walk
      if (trend === 'bullish') {
        variance += 0.03; // upward bias
      } else if (trend === 'bearish') {
        variance -= 0.03; // downward bias
      }
      
      currentPrice = Math.max(100, currentPrice * (1 + variance));
      totalInvested += amount;
      const coinsBought = amount / currentPrice;
      totalCoins += coinsBought;
      const avgPrice = totalInvested / totalCoins;
      const equity = totalCoins * currentPrice;

      history.push({
        period: i,
        price: currentPrice,
        invested: totalInvested,
        coinsBought,
        totalCoins,
        avgPrice,
        equity
      });
    }

    const finalPrice = currentPrice;
    const totalEquity = totalCoins * finalPrice;
    const pnl = totalEquity - totalInvested;
    const pnlPct = (pnl / totalInvested) * 100;
    const averagePrice = totalInvested / totalCoins;

    return {
      totalInvested,
      totalCoins,
      averagePrice,
      finalPrice,
      totalEquity,
      pnl,
      pnlPct,
      history
    };
  };

  const {
    totalInvested,
    totalCoins,
    averagePrice,
    finalPrice,
    totalEquity,
    pnl,
    pnlPct,
    history
  } = calculateDca();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-4">
        <Link href="/planning" className="p-2 rounded-xl transition-colors hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
          <IconArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Simulador DCA</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Dollar Cost Averaging — reduza o impacto da volatilidade do mercado</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Parameters */}
        <div className="md:col-span-1 rounded-2xl border p-5 space-y-4" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Parâmetros</h3>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Aporte por Período ($)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl text-sm outline-none border"
              style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Frequência</label>
            <div className="flex gap-2">
              {(['weekly', 'monthly'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold border transition-all"
                  style={{
                    background: frequency === f ? 'var(--blue)' : 'var(--black3)',
                    color: frequency === f ? '#fff' : 'var(--text-secondary)',
                    borderColor: 'var(--border)'
                  }}
                >
                  {f === 'weekly' ? 'Semanal' : 'Mensal'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Quantidade de Aportes</label>
            <input
              type="number"
              value={periods}
              onChange={e => setPeriods(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl text-sm outline-none border"
              style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Preço Inicial do Ativo ($)</label>
            <input
              type="number"
              value={startPrice}
              onChange={e => setStartPrice(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl text-sm outline-none border"
              style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Tendência do Mercado</label>
            <select
              value={trend}
              onChange={e => setTrend(e.target.value as Trend)}
              className="w-full px-4 py-2 rounded-xl text-sm outline-none border cursor-pointer"
              style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              <option value="bullish">Alta (Bullish)</option>
              <option value="bearish">Baixa (Bearish)</option>
              <option value="sideways">Lateral (Sideways)</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Total Investido</p>
              <p className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                {totalInvested.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
              </p>
            </div>
            
            <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Preço Médio</p>
              <p className="text-lg font-bold font-mono text-blue-400">
                {averagePrice.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Acumulado</p>
              <p className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                {totalCoins.toFixed(4)}
              </p>
            </div>

            <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>P&L Total</p>
              <p className={`text-lg font-bold font-mono flex items-center justify-center gap-1 ${pnl >= 0 ? 'text-green' : 'text-red'}`}>
                {pnl >= 0 ? <IconTrendingUp size={16} /> : <IconTrendingDown size={16} />}
                {pnlPct.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
            <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
              <IconCoins size={16} className="text-blue-400" />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Histórico de Aportes</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                    <th className="px-4 py-3 text-xs font-semibold">Período</th>
                    <th className="px-4 py-3 text-xs font-semibold">Preço do Ativo</th>
                    <th className="px-4 py-3 text-xs font-semibold">Preço Médio</th>
                    <th className="px-4 py-3 text-xs font-semibold">Moedas Adquiridas</th>
                    <th className="px-4 py-3 text-xs font-semibold">Total Moedas</th>
                    <th className="px-4 py-3 text-xs font-semibold">Patrimônio</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(row => (
                    <tr key={row.period} className="border-b transition-colors hover:bg-white/5" style={{ borderColor: 'var(--border)' }}>
                      <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>#{row.period}</td>
                      <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-secondary)' }}>
                        {row.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 font-mono" style={{ color: 'var(--blue-bright)' }}>
                        {row.avgPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-secondary)' }}>
                        {row.coinsBought.toFixed(6)}
                      </td>
                      <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-primary)' }}>
                        {row.totalCoins.toFixed(6)}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {row.equity.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
