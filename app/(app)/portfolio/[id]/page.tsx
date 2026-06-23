'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { IconPlus, IconTrendingUp, IconTrendingDown, IconArrowLeft, IconFileSpreadsheet, IconDownload } from '@tabler/icons-react';
import Link from 'next/link';
import { TransactionForm } from '@/components/portfolio/TransactionForm';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const MOCK_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', qty: 0.35, avgPrice: 58000, currentPrice: 64250, logo: '₿' },
  { symbol: 'ETH', name: 'Ethereum', qty: 2.8, avgPrice: 3000, currentPrice: 3451, logo: 'Ξ' },
  { symbol: 'SOL', name: 'Solana', qty: 15, avgPrice: 130, currentPrice: 142.75, logo: '◎' },
];

const MOCK_HISTORY = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
  value: 38000 + Math.random() * 10000
}));

const PIE_COLORS = ['#F7931A', '#627EEA', '#9945FF', '#26A17B'];

const MOCK_TRANSACTIONS = [
  { id: '1', symbol: 'BTC', type: 'buy', qty: 0.2, price: 60000, date: '2024-05-01', total: 12000 },
  { id: '2', symbol: 'ETH', type: 'buy', qty: 1.5, price: 2900, date: '2024-05-10', total: 4350 },
  { id: '3', symbol: 'BTC', type: 'buy', qty: 0.15, price: 55000, date: '2024-04-15', total: 8250 },
  { id: '4', symbol: 'SOL', type: 'buy', qty: 15, price: 130, date: '2024-04-20', total: 1950 },
];

export default function PortfolioDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'ir'>('overview');
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  const totalValue = MOCK_ASSETS.reduce((s, a) => s + a.qty * a.currentPrice, 0);

  const pieData = MOCK_ASSETS.map(a => ({
    name: a.symbol,
    value: a.qty * a.currentPrice,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <Link href="/portfolio" className="p-2 rounded-xl transition-colors hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
          <IconArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Carteira Principal</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>ID: {id}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border p-5" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Valor Total</p>
          <p className="text-2xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
            {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div className="rounded-2xl border p-5" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Variação Hoje</p>
          <p className="text-2xl font-bold text-green-400 flex items-center gap-1">
            <IconTrendingUp size={20} /> +2.14%
          </p>
        </div>
        <div className="rounded-2xl border p-5" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Lucro/Prejuízo Total</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--green)' }}>+R$ 8.240,00</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 rounded-2xl border p-5" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
          <p className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>Evolução do portfólio (30 dias)</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={MOCK_HISTORY}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} interval={4} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'var(--black3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Valor']} />
              <Line type="monotone" dataKey="value" stroke="var(--blue-bright)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border p-5 flex flex-col items-center" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
          <p className="text-sm font-medium mb-4 self-start" style={{ color: 'var(--text-secondary)' }}>Alocação</p>
          <PieChart width={140} height={140}>
            <Pie data={pieData} cx={65} cy={65} innerRadius={42} outerRadius={65} dataKey="value" strokeWidth={0}>
              {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
          </PieChart>
          <div className="flex flex-col gap-1 mt-2 w-full">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                <span>{d.name}</span>
                <span className="ml-auto font-medium" style={{ color: 'var(--text-primary)' }}>
                  {((d.value / totalValue) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b" style={{ borderColor: 'var(--border)' }}>
        {(['overview', 'transactions', 'ir'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px"
            style={{
              color: activeTab === tab ? 'var(--blue-bright)' : 'var(--text-secondary)',
              borderColor: activeTab === tab ? 'var(--blue-bright)' : 'transparent'
            }}>
            {tab === 'overview' ? 'Ativos' : tab === 'transactions' ? 'Histórico' : 'Relatório IR'}
          </button>
        ))}

        <div className="ml-auto mb-1">
          <button id="portfolio-add-transaction" onClick={() => setShowTransactionForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--blue)', color: '#fff' }}>
            <IconPlus size={14} />
            Transação
          </button>
        </div>
      </div>

      {/* Assets table */}
      {activeTab === 'overview' && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Ativo', 'Quantidade', 'Preço Médio', 'Preço Atual', 'Valor Total', 'P&L', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_ASSETS.map(asset => {
                const totalVal = asset.qty * asset.currentPrice;
                const pl = (asset.currentPrice - asset.avgPrice) * asset.qty;
                const plPct = ((asset.currentPrice - asset.avgPrice) / asset.avgPrice) * 100;
                return (
                  <tr key={asset.symbol} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'var(--black3)' }}>
                          {asset.logo}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{asset.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{asset.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono" style={{ color: 'var(--text-primary)' }}>{asset.qty}</td>
                    <td className="px-4 py-4 font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {asset.avgPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-4 py-4 font-mono" style={{ color: 'var(--text-primary)' }}>
                      {asset.currentPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-4 py-4 font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                      {totalVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm" style={{ color: pl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                          {pl >= 0 ? '+' : ''}{pl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <span className="text-xs" style={{ color: pl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                          {pl >= 0 ? '+' : ''}{plPct.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => setShowTransactionForm(true)} className="text-xs px-3 py-1.5 rounded-lg transition-colors" style={{ background: 'var(--black3)', color: 'var(--text-secondary)' }}>
                        <IconPlus size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Transactions history */}
      {activeTab === 'transactions' && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Data', 'Ativo', 'Tipo', 'Quantidade', 'Preço', 'Total'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_TRANSACTIONS.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{tx.date}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{tx.symbol}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full capitalize" style={{
                      background: tx.type === 'buy' ? 'var(--green-dim)' : 'var(--red-dim)',
                      color: tx.type === 'buy' ? 'var(--green)' : 'var(--red)'
                    }}>
                      {tx.type === 'buy' ? 'Compra' : 'Venda'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-secondary)' }}>{tx.qty}</td>
                  <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {tx.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-4 py-3 font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                    {tx.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* IR tab */}
      {activeTab === 'ir' && (
        <div className="rounded-2xl border p-6 text-center" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
          <IconFileSpreadsheet size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Relatório de Imposto de Renda</h3>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Gere um relatório detalhado das suas operações para declaração do Imposto de Renda. Disponível para os planos Pro e Premium.
          </p>
          <button id="portfolio-generate-ir"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
            style={{ background: 'var(--blue)', color: '#fff' }}>
            <IconDownload size={16} />
            Gerar Relatório de IR
          </button>
        </div>
      )}

      {/* Transaction form modal */}
      {showTransactionForm && (
        <TransactionForm
          portfolioId={id as string}
          onClose={() => setShowTransactionForm(false)}
          onSuccess={() => setShowTransactionForm(false)}
        />
      )}
    </div>
  );
}
