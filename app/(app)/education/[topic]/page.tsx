'use client';

import { use } from 'react';
import Link from 'next/link';
import { IconArrowLeft, IconPlayerPlay, IconExternalLink } from '@tabler/icons-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const TOPICS: Record<string, { title: string; sections: { heading: string; content: string }[]; glossary: { term: string; def: string }[]; relatedLink: string }> = {
  'fundamentos-cripto': {
    title: 'Fundamentos de Cripto',
    sections: [
      { heading: 'O que é Blockchain?', content: 'Blockchain é uma tecnologia de registro distribuído (DLT) que permite manter um histórico imutável de transações sem a necessidade de um intermediário centralizado. Cada bloco contém um hash do bloco anterior, criando uma cadeia segura e verificável.' },
      { heading: 'Como funciona o Bitcoin?', content: 'O Bitcoin é a primeira criptomoeda, criada em 2009 por Satoshi Nakamoto. Utiliza o mecanismo de consenso Proof-of-Work (PoW) onde mineradores competem para resolver problemas criptográficos e validar transações. A oferta máxima é de 21 milhões de unidades.' },
      { heading: 'O que é DeFi?', content: 'Finanças Descentralizadas (DeFi) são protocolos financeiros construídos em blockchains que oferecem serviços como empréstimos, trocas e rendimentos sem intermediários tradicionais. Exemplos incluem Uniswap, Aave e Compound.' },
    ],
    glossary: [
      { term: 'Hash', def: 'Função criptográfica que transforma dados em uma string de tamanho fixo' },
      { term: 'Wallet', def: 'Software ou hardware para armazenar chaves privadas de criptomoedas' },
      { term: 'Gas', def: 'Taxa paga para executar transações na rede Ethereum' },
      { term: 'Smart Contract', def: 'Programa auto-executável armazenado na blockchain' },
    ],
    relatedLink: '/market/crypto',
  },
  'analise-tecnica': {
    title: 'Análise Técnica',
    sections: [
      { heading: 'Introdução à Análise Técnica', content: 'A análise técnica estuda padrões de preço e volume para prever movimentos futuros. Baseia-se na premissa de que toda informação disponível já está refletida no preço e que padrões históricos tendem a se repetir.' },
      { heading: 'RSI — Índice de Força Relativa', content: 'O RSI é um oscilador que mede a velocidade e magnitude das mudanças de preço. Varia de 0 a 100 — valores acima de 70 indicam sobrecompra, abaixo de 30 indicam sobrevenda. Período padrão: 14 candles.' },
      { heading: 'MACD', content: 'O MACD (Moving Average Convergence Divergence) mostra a relação entre duas médias móveis exponenciais (12 e 26 períodos). A linha de sinal (EMA 9 do MACD) gera sinais de compra quando o MACD cruza acima dela.' },
    ],
    glossary: [
      { term: 'Suporte', def: 'Nível de preço onde a demanda tende a impedir quedas adicionais' },
      { term: 'Resistência', def: 'Nível de preço onde a oferta tende a impedir altas adicionais' },
      { term: 'Candlestick', def: 'Representação gráfica que mostra abertura, fechamento, máxima e mínima' },
    ],
    relatedLink: '/analysis/technical',
  },
};

const DEFAULT_TOPIC = {
  title: 'Conteúdo Educativo',
  sections: [{ heading: 'Em breve', content: 'Este conteúdo está sendo preparado por nossa equipe editorial. Volte em breve para acessar o material completo.' }],
  glossary: [],
  relatedLink: '/education',
};

export default function EducationTopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = use(params);
  const data = TOPICS[topic] || DEFAULT_TOPIC;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/education" className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <IconArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{data.title}</h1>
      </div>

      {/* Article sections */}
      <div className="space-y-6">
        {data.sections.map((s, i) => (
          <section key={i}>
            <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{s.heading}</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.content}</p>
          </section>
        ))}
      </div>

      {/* Video embed placeholder */}
      <Card>
        <div className="flex items-center gap-3 py-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--red-dim)', color: 'var(--red)' }}>
            <IconPlayerPlay size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Vídeo explicativo</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Assista o tutorial em vídeo sobre este tema</p>
          </div>
        </div>
      </Card>

      {/* Glossary */}
      {data.glossary.length > 0 && (
        <div>
          <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Glossário</h2>
          <div className="space-y-2">
            {data.glossary.map(g => (
              <div key={g.term} className="rounded-xl p-3" style={{ background: 'var(--black3)' }}>
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{g.term}: </span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{g.def}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related link */}
      <Link href={data.relatedLink}
        className="inline-flex items-center gap-1.5 text-sm font-medium hover:text-blue-bright transition-colors"
        style={{ color: 'var(--blue)' }}>
        Ir para seção relacionada <IconExternalLink size={14} />
      </Link>
    </div>
  );
}
