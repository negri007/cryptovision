'use client';

import {
  IconUsers, IconCrown, IconBuildingBank, IconBell,
  IconCheck, IconAlertCircle, IconClock,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const USER_STATS = [
  { label: 'Free', value: 12847, icon: <IconUsers size={18} />, accent: 'blue' as const },
  { label: 'Pro', value: 3241, icon: <IconCrown size={18} />, accent: 'green' as const },
  { label: 'Institutional', value: 89, icon: <IconBuildingBank size={18} />, accent: 'yellow' as const },
  { label: 'Alertas Ativos', value: 45892, icon: <IconBell size={18} />, accent: 'red' as const },
];

const API_STATUS = [
  { name: 'CoinGecko', status: 'active', lastCall: '2min', avgMs: 142 },
  { name: 'Binance WS', status: 'active', lastCall: '1s', avgMs: 23 },
  { name: 'CryptoCompare', status: 'active', lastCall: '5min', avgMs: 310 },
  { name: 'Glassnode', status: 'slow', lastCall: '8min', avgMs: 2100 },
  { name: 'Alpha Vantage', status: 'active', lastCall: '12min', avgMs: 450 },
  { name: 'NewsAPI', status: 'active', lastCall: '3min', avgMs: 280 },
  { name: 'Alternative.me', status: 'error', lastCall: '1h', avgMs: 0 },
  { name: 'Firebase FCM', status: 'active', lastCall: '30s', avgMs: 85 },
];

const SIGNUPS_30D = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  users: Math.round(80 + Math.sin(i / 3) * 30 + Math.random() * 20),
}));

const TOP_WATCHLIST = [
  { symbol: 'BTC', count: 8924 },
  { symbol: 'ETH', count: 7432 },
  { symbol: 'SOL', count: 5218 },
  { symbol: 'BNB', count: 3891 },
  { symbol: 'XRP', count: 3456 },
  { symbol: 'ADA', count: 2987 },
  { symbol: 'AVAX', count: 2654 },
  { symbol: 'DOT', count: 2123 },
  { symbol: 'LINK', count: 1987 },
  { symbol: 'MATIC', count: 1654 },
];

const STATUS_MAP = {
  active: { color: 'var(--green)', label: 'Ativo', variant: 'green' as const },
  slow: { color: 'var(--yellow)', label: 'Lento', variant: 'yellow' as const },
  error: { color: 'var(--red)', label: 'Erro', variant: 'red' as const },
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {USER_STATS.map(s => (
          <Card key={s.label} accent={s.accent}>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg" style={{ background: 'var(--black4)', color: 'var(--text-muted)' }}>
                {s.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
            </div>
            <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {s.value.toLocaleString()}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* API Status */}
        <Card className="xl:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
            Status das Integrações
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {API_STATUS.map(api => {
              const st = STATUS_MAP[api.status as keyof typeof STATUS_MAP];
              return (
                <div key={api.name} className="rounded-xl p-3 border" style={{ background: 'var(--black3)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: st.color }} />
                    <span className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{api.name}</span>
                  </div>
                  <Badge variant={st.variant} size="sm">{st.label}</Badge>
                  <div className="mt-2 space-y-0.5">
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      <IconClock size={10} className="inline mr-0.5" /> {api.lastCall}
                    </p>
                    {api.avgMs > 0 && (
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        Avg: {api.avgMs}ms
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top watchlist */}
        <Card>
          <h3 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
            Top 10 Watchlist
          </h3>
          <div className="space-y-2">
            {TOP_WATCHLIST.map((t, i) => (
              <div key={t.symbol} className="flex items-center gap-2">
                <span className="text-xs w-4 text-right font-mono" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                <span className="text-sm font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>{t.symbol}</span>
                <span className="text-xs font-mono tabular-nums" style={{ color: 'var(--text-secondary)' }}>{t.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Signups chart */}
      <Card>
        <h3 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
          Novos Cadastros — Últimos 30 dias
        </h3>
        <div style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={SIGNUPS_30D}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#7B8FA8' }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#7B8FA8' }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--black3)', border: '1px solid var(--border-bright)', borderRadius: 8, fontSize: 11 }}
                formatter={(value) => [String(value), 'Cadastros']}
              />
              <Line type="monotone" dataKey="users" stroke="var(--blue)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
