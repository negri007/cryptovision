'use client';

import Link from 'next/link';
import { IconCalculator, IconCoins, IconScale, IconTrendingUp, IconChartPie } from '@tabler/icons-react';

const CALCULATORS = [
  {
    id: 'juros-compostos',
    name: 'Juros Compostos',
    desc: 'Simule o crescimento do seu capital no longo prazo com aportes recorrentes e juros compostos.',
    icon: <IconTrendingUp size={24} className="text-blue-400" />,
    color: 'var(--blue)'
  },
  {
    id: 'dca',
    name: 'Simulador DCA',
    desc: 'Calcule o preço médio e simule compras recorrentes (Dollar Cost Averaging) em ativos voláteis.',
    icon: <IconCoins size={24} className="text-green-400" />,
    color: 'var(--green)'
  },
  {
    id: 'entry-target-stop',
    name: 'Entrada, Alvo & Stop',
    desc: 'Calcule a relação risco/retorno, tamanho da posição ideal e os níveis de entrada, stop e saídas.',
    icon: <IconScale size={24} className="text-red-400" />,
    color: 'var(--red)'
  },
  {
    id: 'cagr',
    name: 'Calculadora CAGR',
    desc: 'Encontre a taxa de crescimento anual composta (Compound Annual Growth Rate) histórica dos seus investimentos.',
    icon: <IconCalculator size={24} className="text-purple-400" />,
    color: 'var(--blue-bright)'
  },
  {
    id: 'staking',
    name: 'Projeção de Staking',
    desc: 'Estime seus dividendos e rendimentos passivos gerados por staking ou provisão de liquidez.',
    icon: <IconChartPie size={24} className="text-yellow-400" />,
    color: 'var(--yellow)'
  }
];

export default function PlanningPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Planejador Financeiro</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Utilize nossas calculadoras inteligentes para planejar suas metas, gerenciar riscos e projetar ganhos</p>
      </div>

      {/* Grid of calculators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CALCULATORS.map(calc => (
          <Link
            key={calc.id}
            href={`/planning/${calc.id}`}
            id={`calc-card-${calc.id}`}
            className="block rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:border-blue-bright duration-200 cursor-pointer flex flex-col justify-between h-56"
            style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}
          >
            <div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-black/40" style={{ background: 'var(--black3)' }}>
                {calc.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{calc.name}</h3>
              <p className="text-xs line-clamp-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{calc.desc}</p>
            </div>
            
            <div className="text-xs font-semibold flex items-center gap-1 mt-4" style={{ color: 'var(--blue-bright)' }}>
              Acessar calculadora →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
