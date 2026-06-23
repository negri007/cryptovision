'use client';

import { useState } from 'react';
import { IconArrowLeft, IconCalculator, IconTrendingUp } from '@tabler/icons-react';
import Link from 'next/link';

export default function CagrPage() {
  const [startVal, setStartVal] = useState<number>(1000);
  const [endVal, setEndVal] = useState<number>(5000);
  const [years, setYears] = useState<number>(5);

  const totalGrowthPct = startVal > 0 ? ((endVal - startVal) / startVal) * 100 : 0;
  const cagr = startVal > 0 && endVal > 0 && years > 0 ? (Math.pow(endVal / startVal, 1 / years) - 1) * 100 : 0;
  const absoluteGain = endVal - startVal;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-4">
        <Link href="/planning" className="p-2 rounded-xl transition-colors hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
          <IconArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Calculadora CAGR</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Taxa de Crescimento Anual Composta de um investimento</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Inputs */}
        <div className="md:col-span-1 rounded-2xl border p-5 space-y-4" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Parâmetros</h3>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Valor Inicial (R$)</label>
            <input
              type="number"
              value={startVal}
              onChange={e => setStartVal(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl text-sm outline-none border"
              style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Valor Final (R$)</label>
            <input
              type="number"
              value={endVal}
              onChange={e => setEndVal(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl text-sm outline-none border"
              style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Período (Anos)</label>
            <input
              type="number"
              value={years}
              onChange={e => setYears(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl text-sm outline-none border"
              style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* Results */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>CAGR Anual</p>
              <p className="text-2xl font-bold font-mono text-blue-400">
                {cagr.toFixed(2)}%
              </p>
            </div>
            <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Retorno Total (%)</p>
              <p className="text-lg font-bold font-mono text-green-400">
                +{totalGrowthPct.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Ganho Absoluto</p>
              <p className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                {absoluteGain.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {/* Simple simulated path table */}
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
            <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
              <IconTrendingUp size={16} className="text-blue-400" />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Evolução Anualizada Teórica (Base CAGR)</span>
            </div>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  <th className="px-4 py-3 text-xs font-semibold">Ano</th>
                  <th className="px-4 py-3 text-xs font-semibold">Crescimento Acumulado (%)</th>
                  <th className="px-4 py-3 text-xs font-semibold">Valor Estimado</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: years + 1 }).map((_, i) => {
                  const estValue = startVal * Math.pow(1 + cagr / 100, i);
                  const growthPct = startVal > 0 ? ((estValue - startVal) / startVal) * 100 : 0;
                  return (
                    <tr key={i} className="border-b transition-colors hover:bg-white/5" style={{ borderColor: 'var(--border)' }}>
                      <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{i === 0 ? 'Início' : `Ano ${i}`}</td>
                      <td className="px-4 py-3 font-mono text-green-400">+{growthPct.toFixed(1)}%</td>
                      <td className="px-4 py-3 font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {estValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
