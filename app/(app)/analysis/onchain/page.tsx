'use client';

import { useRouter } from 'next/navigation';
import { IconActivity, IconSearch } from '@tabler/icons-react';
import { useState } from 'react';

const SUPPORTED = ['BTC', 'ETH'];

export default function OnChainIndexPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Análise On-Chain</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Métricas de rede blockchain em tempo real</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
        {SUPPORTED.map(sym => (
          <button
            key={sym}
            onClick={() => router.push(`/analysis/onchain/${sym.toLowerCase()}`)}
            className="rounded-2xl border p-6 text-center transition-all hover:border-blue-bright/30 hover:-translate-y-0.5"
            style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}
          >
            <div className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'var(--blue-glow)' }}>
              <IconActivity size={28} style={{ color: 'var(--blue-bright)' }} />
            </div>
            <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{sym}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {sym === 'BTC' ? '7 métricas disponíveis' : '3 métricas disponíveis'}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
