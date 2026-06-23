'use client';

import { useState } from 'react';
import { IconLink, IconTrash, IconPlus, IconBuildingBank, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import Link from 'next/link';

interface ExchangeConnection {
  id: string;
  name: string;
  type: 'binance' | 'coinbase' | 'kucoin';
  apiKey: string;
  status: 'connected' | 'error';
  lastSynced: string;
}

const EXCHANGE_METADATA = {
  binance: { name: 'Binance', logo: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png' },
  coinbase: { name: 'Coinbase', logo: 'https://cryptologos.cc/logos/coinbase-stock-coin-logo.png' },
  kucoin: { name: 'KuCoin', logo: 'https://cryptologos.cc/logos/kucoin-token-kcs-logo.png' },
};

export default function ExchangesPage() {
  const [connections, setConnections] = useState<ExchangeConnection[]>([
    {
      id: 'conn-1',
      name: 'Binance Principal',
      type: 'binance',
      apiKey: 'h3k8...j2n9',
      status: 'connected',
      lastSynced: 'Há 5 minutos',
    },
    {
      id: 'conn-2',
      name: 'KuCoin Holding',
      type: 'kucoin',
      apiKey: 'k8d2...a9x0',
      status: 'error',
      lastSynced: 'Há 2 dias',
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newConn, setNewConn] = useState({ name: '', type: 'binance' as const, apiKey: '', apiSecret: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConn.name || !newConn.apiKey || !newConn.apiSecret) return;
    
    const created: ExchangeConnection = {
      id: `conn-${Date.now()}`,
      name: newConn.name,
      type: newConn.type,
      apiKey: `${newConn.apiKey.slice(0, 4)}...${newConn.apiKey.slice(-4)}`,
      status: 'connected',
      lastSynced: 'Agora',
    };

    setConnections(prev => [...prev, created]);
    setShowAddForm(false);
    setNewConn({ name: '', type: 'binance', apiKey: '', apiSecret: '' });
  };

  const handleRemove = (id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Conexões de Exchanges</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Sincronize seus saldos e transações automaticamente via API read-only</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: 'var(--blue)', color: '#fff' }}
        >
          <IconPlus size={16} />
          Nova Conexão
        </button>
      </div>

      {/* Connection cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {connections.map(conn => {
          const meta = EXCHANGE_METADATA[conn.type];
          return (
            <div
              key={conn.id}
              className="rounded-2xl border p-5 relative flex flex-col justify-between"
              style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/40" style={{ background: 'var(--black3)' }}>
                      <IconBuildingBank size={20} style={{ color: 'var(--text-secondary)' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{conn.name}</h3>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{meta.name} • API: {conn.apiKey}</p>
                    </div>
                  </div>
                  
                  <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                    conn.status === 'connected' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {conn.status === 'connected' ? <IconCheck size={12} /> : <IconAlertCircle size={12} />}
                    {conn.status === 'connected' ? 'Sincronizado' : 'Erro de Chave'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Última sincronização: {conn.lastSynced}</span>
                <button
                  onClick={() => handleRemove(conn.id)}
                  className="p-2 rounded-lg text-red hover:bg-red-500/10 transition-colors"
                  title="Excluir Conexão"
                >
                  <IconTrash size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Connection Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 p-6 rounded-2xl border" style={{ background: 'var(--black2)', borderColor: 'var(--border-bright)' }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Conectar Exchange</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              Insira chaves API com permissão exclusiva de **leitura (read-only)**. Nunca compartilhe permissões de saque ou trading.
            </p>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Nome da Conexão</label>
                <input
                  type="text"
                  required
                  placeholder="Minha conta spot"
                  value={newConn.name}
                  onChange={e => setNewConn(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                  style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Exchange</label>
                <select
                  value={newConn.type}
                  onChange={e => setNewConn(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border cursor-pointer"
                  style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  <option value="binance">Binance</option>
                  <option value="kucoin">KuCoin</option>
                  <option value="coinbase">Coinbase</option>
                </select>
              </div>

              <div>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>API Key</label>
                <input
                  type="text"
                  required
                  placeholder="Insira a API Key"
                  value={newConn.apiKey}
                  onChange={e => setNewConn(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                  style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Secret Key</label>
                <input
                  type="password"
                  required
                  placeholder="Insira a Secret Key"
                  value={newConn.apiSecret}
                  onChange={e => setNewConn(prev => ({ ...prev, apiSecret: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
                  style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors hover:bg-white/5"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: 'var(--blue)', color: '#fff' }}
                >
                  Conectar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
