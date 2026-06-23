'use client';

import { useState } from 'react';
import { IconArrowLeft, IconCoins, IconTrendingUp } from '@tabler/icons-react';
import Link from 'next/link';

export default function StakingPage() {
  const [amount, setAmount] = useState<number>(1000);
  const [apy, setApy] = useState<number>(8); // APY in %
  const [period, setPeriod] = useState<number>(12); // Period in months
  const [reinvest, setReinvest] = useState<boolean>(true); // Compound compounding staking reward

  // Calculations
  const calculateStaking = () => {
    const monthlyRate = apy / 100 / 12;
    let balance = amount;
    let totalEarned = 0;
    const logs: { month: number; initial: number; reward: number; ending: number }[] = [];

    for (let month = 1; month <= period; month++) {
      const initial = balance;
      const reward = balance * monthlyRate;
      totalEarned += reward;
      if (reinvest) {
        balance += reward;
      }
      logs.push({
        month,
        initial,
        reward,
        ending: reinvest ? balance : amount + totalEarned,
      });
    }

    return {
      endingBalance: reinvest ? balance : amount + totalEarned,
      totalEarned,
      logs
    };
  };

  const { endingBalance, totalEarned, logs } = calculateStaking();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-4">
        <Link href="/planning" className="p-2 rounded-xl transition-colors hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
          <IconArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Projeção de Staking</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Simule seus ganhos passivos com staking de criptoativos e dividendos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Inputs */}
        <div className="md:col-span-1 rounded-2xl border p-5 space-y-4" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Parâmetros</h3>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Quantidade de Ativos</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl text-sm outline-none border"
              style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>APY (%)</label>
            <input
              type="number"
              step="0.1"
              value={apy}
              onChange={e => setApy(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl text-sm outline-none border"
              style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Período (Meses)</label>
            <input
              type="number"
              value={period}
              onChange={e => setPeriod(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl text-sm outline-none border"
              style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={reinvest}
              onChange={e => setReinvest(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                reinvest ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  reinvest ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Reinvestir recompensas (Juros Compostos)</span>
          </label>
        </div>

        {/* Results */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Saldo Final Estimado</p>
              <p className="text-lg font-bold font-mono text-blue-400">
                {endingBalance.toLocaleString('en-US', { maximumFractionDigits: 4 })}
              </p>
            </div>
            <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Recompensas Recebidas</p>
              <p className="text-lg font-bold font-mono text-green-400">
                +{totalEarned.toLocaleString('en-US', { maximumFractionDigits: 4 })}
              </p>
            </div>
            <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Crescimento do Saldo</p>
              <p className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                +{((totalEarned / amount) * 100).toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Projection Table */}
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
            <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
              <IconCoins size={16} className="text-blue-400" />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Projeção de Rendimento Mensal</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                    <th className="px-4 py-3 text-xs font-semibold">Mês</th>
                    <th className="px-4 py-3 text-xs font-semibold">Saldo Inicial</th>
                    <th className="px-4 py-3 text-xs font-semibold">Recompensa Recebida</th>
                    <th className="px-4 py-3 text-xs font-semibold">Saldo Final</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.month} className="border-b transition-colors hover:bg-white/5" style={{ borderColor: 'var(--border)' }}>
                      <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Mês {log.month}</td>
                      <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-secondary)' }}>
                        {log.initial.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                      </td>
                      <td className="px-4 py-3 font-mono text-green-400">
                        +{log.reward.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {log.ending.toLocaleString('en-US', { maximumFractionDigits: 4 })}
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
