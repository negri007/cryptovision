'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconChartBar, IconSearch } from '@tabler/icons-react';

const POPULAR = ['BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'XRP', 'AVAX', 'LINK', 'DOT', 'MATIC'];

export default function TechnicalAnalysisIndexPage() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const filtered = POPULAR.filter(s => s.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Análise Técnica</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Selecione um ativo para análise detalhada</p>
      </div>

      <div className="relative max-w-md">
        <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar símbolo..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border outline-none transition-colors focus:border-blue"
          style={{ background: 'var(--black4)', borderColor: 'var(--border-bright)', color: 'var(--text-primary)' }}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {filtered.map(sym => (
          <button
            key={sym}
            onClick={() => router.push(`/analysis/technical/${sym.toLowerCase()}`)}
            className="rounded-2xl border p-4 text-center transition-all hover:border-blue-bright/30 hover:-translate-y-0.5"
            style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}
          >
            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center" style={{ background: 'var(--blue-glow)' }}>
              <IconChartBar size={20} style={{ color: 'var(--blue-bright)' }} />
            </div>
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{sym}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
