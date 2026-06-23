'use client';

import { useState } from 'react';
import { IconX, IconCheck, IconArrowUpRight, IconArrowDownLeft } from '@tabler/icons-react';

interface TransactionFormProps {
  portfolioId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function TransactionForm({ portfolioId, onClose, onSuccess }: TransactionFormProps) {
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!symbol || !quantity || !price) {
      setError('Preencha todos os campos.');
      return;
    }
    setSubmitting(true);
    try {
      // TODO: call Firebase callable to persist transaction
      await new Promise(r => setTimeout(r, 800));
      onSuccess();
    } catch (err) {
      setError('Erro ao registrar transação.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" id="transaction-form-modal">
      <div className="relative w-full max-w-md mx-4 p-6 rounded-2xl border" style={{ background: 'var(--black2)', borderColor: 'var(--border-bright)' }}>
        <button id="transaction-form-close" className="absolute top-3 right-3" onClick={onClose}>
          <IconX size={20} style={{ color: 'var(--text-muted)' }} />
        </button>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Nova Transação</h2>
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'var(--red-dim)', color: 'var(--red)' }}>{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div className="flex gap-2">
            <button type="button" id="transaction-type-buy" onClick={() => setType('buy')} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${type === 'buy' ? 'bg-var(--green-dim) text-var(--green)' : 'bg-var(--black3) text-var(--text-secondary)'}
            `} style={{ background: type === 'buy' ? 'var(--green-dim)' : 'var(--black3)', color: type === 'buy' ? 'var(--green)' : 'var(--text-secondary)' }}>
              <IconArrowUpRight size={14} className="inline-block mr-1" /> Comprar
            </button>
            <button type="button" id="transaction-type-sell" onClick={() => setType('sell')} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ background: type === 'sell' ? 'var(--red-dim)' : 'var(--black3)', color: type === 'sell' ? 'var(--red)' : 'var(--text-secondary)' }}>
              <IconArrowDownLeft size={14} className="inline-block mr-1" /> Vender
            </button>
          </div>

          {/* Symbol */}
          <div>
            <label className="text-sm mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Ativo (ticker)</label>
            <input id="transaction-symbol" type="text" value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} placeholder="BTC, ETH..."
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
              style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              required />
          </div>

          {/* Quantity & Price */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-sm mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Quantidade</label>
              <input id="transaction-quantity" type="number" min="0" step="any" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0.0"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} required />
            </div>
            <div className="flex-1">
              <label className="text-sm mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Preço (BRL)</label>
              <input id="transaction-price" type="number" min="0" step="any" value={price} onChange={e => setPrice(e.target.value)} placeholder="0,00"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} required />
            </div>
          </div>

          <button id="transaction-submit" type="submit" disabled={submitting}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            style={{ background: 'var(--blue)', color: '#fff' }}>
            {submitting ? <IconCheck size={16} className="animate-spin" /> : <IconCheck size={16} />}
            {submitting ? 'Registrando...' : 'Registrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
