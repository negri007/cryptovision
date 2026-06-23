'use client';

import { useState } from 'react';
import { IconArrowLeft, IconScale, IconCheck, IconAlertTriangle } from '@tabler/icons-react';
import Link from 'next/link';

export default function EntryTargetStopPage() {
  const [balance, setBalance] = useState<number>(10000);
  const [riskPct, setRiskPct] = useState<number>(2); // 2% account risk
  const [entryPrice, setEntryPrice] = useState<number>(100);
  const [stopPrice, setStopPrice] = useState<number>(90);
  const [targetPrice, setTargetPrice] = useState<number>(130);

  // Calculations
  const riskAmount = balance * (riskPct / 100);
  const stopLossPct = ((entryPrice - stopPrice) / entryPrice) * 100;
  const targetPct = ((targetPrice - entryPrice) / entryPrice) * 100;
  
  // Prevent division by zero
  const stopDistance = entryPrice - stopPrice;
  const positionSizeUnits = stopDistance > 0 ? riskAmount / stopDistance : 0;
  const positionSizeCash = positionSizeUnits * entryPrice;
  
  const potentialReward = positionSizeUnits * (targetPrice - entryPrice);
  const riskRewardRatio = riskAmount > 0 ? potentialReward / riskAmount : 0;

  const leverage = balance > 0 ? positionSizeCash / balance : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-4">
        <Link href="/planning" className="p-2 rounded-xl transition-colors hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
          <IconArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Entrada, Alvo & Stop</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Gerencie seu risco calculando o tamanho exato da posição</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Inputs */}
        <div className="md:col-span-1 rounded-2xl border p-5 space-y-4" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Parâmetros</h3>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Saldo da Conta ($)</label>
            <input
              type="number"
              value={balance}
              onChange={e => setBalance(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl text-sm outline-none border"
              style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Risco por Operação (%)</label>
            <input
              type="number"
              step="0.1"
              value={riskPct}
              onChange={e => setRiskPct(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl text-sm outline-none border"
              style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <hr style={{ borderColor: 'var(--border)' }} />

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Preço de Entrada ($)</label>
            <input
              type="number"
              value={entryPrice}
              onChange={e => setEntryPrice(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl text-sm outline-none border"
              style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Preço de Stop Loss ($)</label>
            <input
              type="number"
              value={stopPrice}
              onChange={e => setStopPrice(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl text-sm outline-none border"
              style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Preço Alvo ($)</label>
            <input
              type="number"
              value={targetPrice}
              onChange={e => setTargetPrice(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl text-sm outline-none border"
              style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* Results */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border p-4" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Tamanho da Posição Sugerido</p>
              <p className="text-2xl font-bold font-mono text-blue-400">
                {positionSizeCash.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Comprar {positionSizeUnits.toFixed(4)} unidades
              </p>
            </div>

            <div className="rounded-xl border p-4" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Relação Risco / Retorno</p>
              <p className="text-2xl font-bold font-mono text-green-400">
                1 : {riskRewardRatio.toFixed(2)}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {riskRewardRatio >= 2 ? 'Relação favorável' : 'Relação baixa (R:R < 2)'}
              </p>
            </div>

            <div className="rounded-xl border p-4" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Perda Máxima (Risco de Conta)</p>
              <p className="text-xl font-bold font-mono text-red">
                -{riskAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Stop Loss a {stopLossPct.toFixed(1)}% do preço de entrada
              </p>
            </div>

            <div className="rounded-xl border p-4" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Ganho Potencial</p>
              <p className="text-xl font-bold font-mono text-green">
                +{potentialReward.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Alvo a {targetPct.toFixed(1)}% do preço de entrada
              </p>
            </div>
          </div>

          {/* Validation indicators */}
          <div className="rounded-2xl border p-5 space-y-3" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
            <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Status de Risco da Operação</h4>
            
            {leverage > 1 ? (
              <div className="p-3 rounded-lg text-xs flex gap-2 border" style={{ background: 'var(--red-dim)', borderColor: 'var(--red)', color: 'var(--red)' }}>
                <IconAlertTriangle size={16} />
                <span>
                  **Alavancagem Necessária:** Para abrir esta posição, você precisa de alavancagem de **{leverage.toFixed(2)}x** pois o tamanho da posição (${positionSizeCash.toFixed(0)}) excede seu saldo (${balance}). Reduza o risco ou amplie o stop.
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-lg text-xs flex gap-2 border" style={{ background: 'var(--green-dim)', borderColor: 'var(--green)', color: 'var(--green)' }}>
                <IconCheck size={16} />
                <span>
                  **Margem Saudável:** O tamanho da posição representa apenas **{(leverage * 100).toFixed(1)}%** do saldo da sua conta. Nenhuma alavancagem é necessária.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
