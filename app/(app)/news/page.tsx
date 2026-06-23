'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IconFilter, IconTrendingUp, IconHash } from '@tabler/icons-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const SENTIMENTS = ['Todos', 'Positivo', 'Negativo', 'Neutro'];
const SOURCES = ['Todos', 'CoinDesk', 'The Block', 'Reuters', 'InfoMoney', 'Decrypt', 'CryptoSlate'];

const MOCK_NEWS = [
  { id: '1', title: 'Bitcoin supera $67.000 com aumento de fluxo em ETFs spot', source: 'CoinDesk', time: '45min', sentiment: 'positivo' as const, tags: ['BTC', 'ETF'], hasImage: true },
  { id: '2', title: 'Ethereum completa atualização Dencun com sucesso — fees L2 caem 90%', source: 'The Block', time: '2h', sentiment: 'positivo' as const, tags: ['ETH', 'L2'] },
  { id: '3', title: 'SEC adia decisão sobre ETF de Solana para setembro', source: 'Reuters', time: '3h', sentiment: 'negativo' as const, tags: ['SOL', 'ETF'] },
  { id: '4', title: 'Banco Central anuncia fase 3 do piloto do Drex com 12 instituições', source: 'InfoMoney', time: '4h', sentiment: 'neutro' as const, tags: ['DREX', 'CBDC'] },
  { id: '5', title: 'Volume de NFTs dispara 200% em maio — Blur e OpenSea lideram', source: 'Decrypt', time: '5h', sentiment: 'positivo' as const, tags: ['NFT'] },
  { id: '6', title: 'Avalanche fecha parceria com Amazon Web Services para infraestrutura', source: 'CryptoSlate', time: '6h', sentiment: 'positivo' as const, tags: ['AVAX'] },
  { id: '7', title: 'Relatório: 40% dos fundos hedge planejam investir em cripto em 2024', source: 'Reuters', time: '8h', sentiment: 'positivo' as const, tags: ['Institucional'] },
  { id: '8', title: 'MicroStrategy compra mais 12.000 BTC por $780M', source: 'CoinDesk', time: '10h', sentiment: 'positivo' as const, tags: ['BTC', 'Institucional'] },
  { id: '9', title: 'Regulação MiCA entra em vigor na Europa — impacto no mercado', source: 'The Block', time: '12h', sentiment: 'neutro' as const, tags: ['Regulação'] },
  { id: '10', title: 'Binance anuncia delisting de 4 tokens de baixa liquidez', source: 'CryptoSlate', time: '14h', sentiment: 'negativo' as const, tags: ['Binance'] },
];

const TRENDING = ['Bitcoin ETF', 'Dencun', 'Drex', 'Halving', 'Layer 2', 'Solana ETF', 'NFT Rally', 'Fed Rate'];

const SENTIMENT_CHART = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  score: 45 + Math.sin(i / 4) * 15 + (Math.random() - 0.5) * 10,
}));

const SENTIMENT_VARIANTS = { positivo: 'green', negativo: 'red', neutro: 'gray' } as const;

export default function NewsPage() {
  const [sentimentFilter, setSentimentFilter] = useState('Todos');
  const [sourceFilter, setSourceFilter] = useState('Todos');

  const filtered = MOCK_NEWS.filter(n =>
    (sentimentFilter === 'Todos' || n.sentiment === sentimentFilter.toLowerCase()) &&
    (sourceFilter === 'Todos' || n.source === sourceFilter)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Notícias e Sentimento</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Feed em tempo real com análise de sentimento</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main feed */}
        <div className="xl:col-span-3 space-y-4">
          {/* Trending */}
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
              <IconTrendingUp size={14} className="inline mr-1" /> Trending Agora
            </h3>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map(t => (
                <span key={t} className="px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors hover:bg-white/5 border"
                  style={{ background: 'var(--black4)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  <IconHash size={10} className="inline mr-0.5" />{t}
                </span>
              ))}
            </div>
          </Card>

          {/* News cards */}
          <div className="space-y-3">
            {filtered.map(n => (
              <Card key={n.id}>
                <div className="flex gap-4">
                  {n.hasImage && (
                    <div className="w-24 h-24 rounded-xl flex-shrink-0 flex items-center justify-center text-xs"
                      style={{ background: 'var(--black4)', color: 'var(--text-muted)' }}>
                      IMG
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <p className="text-sm font-semibold leading-snug flex-1 hover:text-blue-bright cursor-pointer transition-colors"
                        style={{ color: 'var(--text-primary)' }}>
                        {n.title}
                      </p>
                      <Badge variant={SENTIMENT_VARIANTS[n.sentiment]} size="sm">{n.sentiment}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{n.source}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {n.time}</span>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      {n.tags.map(tag => (
                        <Link key={tag} href={`/market/crypto/${tag.toLowerCase()}`}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold transition-colors hover:bg-white/10"
                          style={{ background: 'var(--black4)', color: 'var(--text-muted)' }}>
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Sentiment filter */}
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
              <IconFilter size={12} className="inline mr-1" /> Filtros
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>Sentimento</p>
                <div className="flex flex-wrap gap-1.5">
                  {SENTIMENTS.map(s => (
                    <button key={s} onClick={() => setSentimentFilter(s)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: sentimentFilter === s ? 'var(--blue)' : 'var(--black4)',
                        color: sentimentFilter === s ? '#fff' : 'var(--text-secondary)',
                      }}
                    >{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>Fonte</p>
                <div className="flex flex-wrap gap-1.5">
                  {SOURCES.map(s => (
                    <button key={s} onClick={() => setSourceFilter(s)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: sourceFilter === s ? 'var(--blue)' : 'var(--black4)',
                        color: sourceFilter === s ? '#fff' : 'var(--text-secondary)',
                      }}
                    >{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Sentiment chart */}
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
              Sentimento 30 dias
            </h3>
            <div style={{ height: 150 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SENTIMENT_CHART}>
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#7B8FA8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[20, 80]} tick={{ fontSize: 9, fill: '#7B8FA8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--black3)', border: '1px solid var(--border-bright)', borderRadius: 8, fontSize: 11 }}
                    formatter={(value) => [`${Number(value).toFixed(0)}`, 'Score']}
                  />
                  <Line type="monotone" dataKey="score" stroke="var(--blue)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
