'use client';

import { useState } from 'react';
import { IconBell, IconPlus, IconTrash, IconBellRinging, IconTrendingUp, IconTrendingDown, IconVolume } from '@tabler/icons-react';

interface CryptoAlert {
  id: string;
  symbol: string;
  type: 'price_above' | 'price_below' | 'volume_above';
  target: number;
  isActive: boolean;
  createdAt: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<CryptoAlert[]>([
    {
      id: 'alert-1',
      symbol: 'BTC',
      type: 'price_above',
      target: 65000,
      isActive: true,
      createdAt: '2026-06-22',
    },
    {
      id: 'alert-2',
      symbol: 'ETH',
      type: 'price_below',
      target: 3200,
      isActive: false,
      createdAt: '2026-06-21',
    },
    {
      id: 'alert-3',
      symbol: 'SOL',
      type: 'volume_above',
      target: 500000000,
      isActive: true,
      createdAt: '2026-06-20',
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlert, setNewAlert] = useState({ symbol: 'BTC', type: 'price_above' as const, target: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.target) return;
    
    const created: CryptoAlert = {
      id: `alert-${Date.now()}`,
      symbol: newAlert.symbol.toUpperCase(),
      type: newAlert.type,
      target: Number(newAlert.target),
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setAlerts(prev => [...prev, created]);
    setShowAddForm(false);
    setNewAlert({ symbol: 'BTC', type: 'price_above', target: '' });
  };

  const handleToggle = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

  const handleRemove = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Alertas de Preço</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Receba notificações instantâneas no seu celular ou e-mail quando o mercado se mover</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: 'var(--blue)', color: '#fff' }}
        >
          <IconPlus size={16} />
          Criar Alerta
        </button>
      </div>

      {/* Alert list */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Seus Alertas Ativos</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{alerts.filter(a => a.isActive).length} ativos</span>
        </div>

        {alerts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <IconBellRinging size={40} style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Você não possui nenhum alerta configurado</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                <th className="px-5 py-3 text-xs font-semibold">Ativo</th>
                <th className="px-5 py-3 text-xs font-semibold">Condição</th>
                <th className="px-5 py-3 text-xs font-semibold">Alvo</th>
                <th className="px-5 py-3 text-xs font-semibold">Criado em</th>
                <th className="px-5 py-3 text-xs font-semibold">Status</th>
                <th className="px-5 py-3 text-xs font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(alert => (
                <tr key={alert.id} className="border-b transition-colors hover:bg-white/5" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-5 py-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{alert.symbol}</td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-xs">
                      {alert.type === 'price_above' && <IconTrendingUp size={14} className="text-green" />}
                      {alert.type === 'price_below' && <IconTrendingDown size={14} className="text-red" />}
                      {alert.type === 'volume_above' && <IconVolume size={14} className="text-blue" />}
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {alert.type === 'price_above' && 'Preço acima de'}
                        {alert.type === 'price_below' && 'Preço abaixo de'}
                        {alert.type === 'volume_above' && 'Volume 24h acima de'}
                      </span>
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                    {alert.type === 'volume_above'
                      ? alert.target.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
                      : alert.target.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </td>
                  <td className="px-5 py-4 text-xs" style={{ color: 'var(--text-muted)' }}>{alert.createdAt}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleToggle(alert.id)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                        alert.isActive ? 'bg-blue-600' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          alert.isActive ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleRemove(alert.id)}
                      className="p-1 rounded text-red hover:bg-red-500/10 transition-colors"
                    >
                      <IconTrash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Alert Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 p-6 rounded-2xl border" style={{ background: 'var(--black2)', borderColor: 'var(--border-bright)' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Novo Alerta</h2>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Ativo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: BTC, ETH, SOL"
                  value={newAlert.symbol}
                  onChange={e => setNewAlert(prev => ({ ...prev, symbol: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm uppercase outline-none border"
                  style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Condição</label>
                <select
                  value={newAlert.type}
                  onChange={e => setNewAlert(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border cursor-pointer"
                  style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  <option value="price_above">Preço cruza acima de</option>
                  <option value="price_below">Preço cruza abaixo de</option>
                  <option value="volume_above">Volume 24h acima de</option>
                </select>
              </div>

              <div>
                <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Valor Alvo (USD)</label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 65000"
                  value={newAlert.target}
                  onChange={e => setNewAlert(prev => ({ ...prev, target: e.target.value }))}
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
                  Criar Alerta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
