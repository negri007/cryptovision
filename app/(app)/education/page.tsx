'use client';

import { useRouter } from 'next/navigation';
import {
  IconCurrencyBitcoin, IconChartBar, IconActivity, IconShieldCheck,
  IconBuildingBank, IconReceipt,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/Card';

const CATEGORIES = [
  { slug: 'fundamentos-cripto', title: 'Fundamentos de Cripto', desc: 'Blockchain, wallets, consenso, DeFi e mais', icon: <IconCurrencyBitcoin size={28} />, accent: 'blue' as const, articles: 12 },
  { slug: 'analise-tecnica', title: 'Análise Técnica', desc: 'Indicadores, padrões de candle, suportes e resistências', icon: <IconChartBar size={28} />, accent: 'green' as const, articles: 8 },
  { slug: 'analise-onchain', title: 'Análise On-Chain', desc: 'NUPL, SOPR, Exchange Flow e métricas de rede', icon: <IconActivity size={28} />, accent: 'yellow' as const, articles: 6 },
  { slug: 'gestao-risco', title: 'Gestão de Risco', desc: 'Position sizing, stop loss, diversificação e psicologia', icon: <IconShieldCheck size={28} />, accent: 'red' as const, articles: 5 },
  { slug: 'acoes-renda-variavel', title: 'Ações e Renda Variável', desc: 'Análise fundamentalista, P/L, dividendos, B3', icon: <IconBuildingBank size={28} />, accent: 'blue' as const, articles: 10 },
  { slug: 'fiscal-ir', title: 'Fiscal e IR', desc: 'Imposto de renda sobre cripto, ações e regras da Receita Federal', icon: <IconReceipt size={28} />, accent: 'yellow' as const, articles: 4 },
];

export default function EducationPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Educação</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Aprenda sobre mercado financeiro e criptomoedas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map(cat => (
          <Card
            key={cat.slug}
            accent={cat.accent}
            onClick={() => router.push(`/education/${cat.slug}`)}
            className="group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: 'var(--black4)', color: `var(--${cat.accent})` }}>
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1 group-hover:text-blue-bright transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {cat.title}
                </h3>
                <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {cat.desc}
                </p>
                <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  {cat.articles} artigos
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
