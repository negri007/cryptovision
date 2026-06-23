'use client';

import { useState } from 'react';
import { IconArrowLeft, IconCalculator, IconTrendingUp } from '@tabler/icons-react';
import Link from 'next/link';

export default function JurosCompostosPage() {
  const [initialAmount, setInitialAmount] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [rate, setRate] = useState<number>(12); // annual rate in %
  const [period, setPeriod] = useState<number>(10); // in years

  // Calculate compound interest year-by-year
  const calculateData = () => {
    let total = initialAmount;
    const monthlyRate = rate / 100 / 12;
    const monthlyContributionValue = monthlyContribution;
    const yearlyLogs: { year: number; invested: number; interest: number; total: number }[] = [];
    let totalInvested = initialAmount;
    let totalInterest = 0;

    for (let year = 1; year <= period; year++) {
      for (let month = 1; month <= 12; month++) {
        const interestThisMonth = total * monthlyRate;
        totalInterest += interestThisMonth;
        total = total + interestThisMonth + monthlyContributionValue;
        totalInvested += monthlyContributionValue;
      }
      yearlyLogs.push({
        year,
        invested: totalInvested,
        interest: totalInterest,
        total: total,
      });
    }

    return {
      total,
      totalInvested,
      totalInterest,
      yearlyLogs
    };
  };

  const { total, totalInvested, totalInterest, yearlyLogs } = calculateData();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-4">
        <Link href="/planning" className="p-2 rounded-xl transition-colors hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
          <IconArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Juros Compostos</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Simule o crescimento do seu patrimônio com o tempo</p>
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
              value={initialAmount}
              onChange={e => setInitialAmount(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl text-sm outline-none border"
              style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Aporte Mensal (R$)</label>
            <input
              type="number"
              value={monthlyContribution}
              onChange={e => setMonthlyContribution(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl text-sm outline-none border"
              style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Taxa de Juros Anual (%)</label>
            <input
              type="number"
              step="0.1"
              value={rate}
              onChange={e => setRate(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl text-sm outline-none border"
              style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Período (Anos)</label>
            <input
              type="number"
              value={period}
              onChange={e => setPeriod(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl text-sm outline-none border"
              style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* Results and Table */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Valor Total Acumulado</p>
              <p className="text-lg font-bold font-mono text-blue-400">
                {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Total Investido</p>
              <p className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                {totalInvested.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Total em Juros</p>
              <p className="text-lg font-bold font-mono text-green-400">
                {totalInterest.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {/* Projection Table */}
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
            <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
              <IconTrendingUp size={16} className="text-blue-400" />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Evolução Anual</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                    <th className="px-4 py-3 text-xs font-semibold">Ano</th>
                    <th className="px-4 py-3 text-xs font-semibold">Investido</th>
                    <th className="px-4 py-3 text-xs font-semibold">Juros acumulados</th>
                    <th className="px-4 py-3 text-xs font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyLogs.map(log => (
                    <tr key={log.year} className="border-b transition-colors hover:bg-white/5" style={{ borderColor: 'var(--border)' }}>
                      <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Ano {log.year}</td>
                      <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-secondary)' }}>
                        {log.invested.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-4 py-3 font-mono text-green-400">
                        {log.interest.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {log.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
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
