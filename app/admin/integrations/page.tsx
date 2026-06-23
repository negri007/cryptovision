'use client';

import { useState } from 'react';
import {
  IconRefresh, IconCheck, IconAlertCircle, IconClock,
  IconFilter,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Integration {
  name: string;
  status: 'active' | 'slow' | 'error';
  lastCheck: string;
  avgResponse: number;
  uptime: number;
}

interface LogEntry {
  timestamp: string;
  api: string;
  endpoint: string;
  statusCode: number;
  responseTime: number;
}

const INTEGRATIONS: Integration[] = [
  { name: 'CoinGecko API', status: 'active', lastCheck: '2 min atrás', avgResponse: 142, uptime: 99.8 },
  { name: 'Binance WebSocket', status: 'active', lastCheck: '1 seg atrás', avgResponse: 23, uptime: 99.99 },
  { name: 'CryptoCompare', status: 'active', lastCheck: '5 min atrás', avgResponse: 310, uptime: 99.5 },
  { name: 'Glassnode', status: 'slow', lastCheck: '8 min atrás', avgResponse: 2100, uptime: 97.2 },
  { name: 'Alpha Vantage', status: 'active', lastCheck: '12 min atrás', avgResponse: 450, uptime: 99.1 },
  { name: 'NewsAPI', status: 'active', lastCheck: '3 min atrás', avgResponse: 280, uptime: 99.6 },
  { name: 'Alternative.me', status: 'error', lastCheck: '1h atrás', avgResponse: 0, uptime: 92.1 },
  { name: 'Firebase FCM', status: 'active', lastCheck: '30 seg atrás', avgResponse: 85, uptime: 99.95 },
  { name: 'SendGrid', status: 'active', lastCheck: '15 min atrás', avgResponse: 340, uptime: 99.7 },
  { name: 'Telegram Bot API', status: 'active', lastCheck: '4 min atrás', avgResponse: 190, uptime: 99.4 },
];

const LOGS: LogEntry[] = [
  { timestamp: '14:32:15', api: 'CoinGecko', endpoint: '/coins/markets', statusCode: 200, responseTime: 138 },
  { timestamp: '14:32:10', api: 'Binance WS', endpoint: 'btcusdt@trade', statusCode: 200, responseTime: 18 },
  { timestamp: '14:31:55', api: 'NewsAPI', endpoint: '/everything', statusCode: 200, responseTime: 295 },
  { timestamp: '14:31:42', api: 'Glassnode', endpoint: '/v1/metrics/addresses', statusCode: 200, responseTime: 2340 },
  { timestamp: '14:31:30', api: 'Alternative.me', endpoint: '/fng/', statusCode: 503, responseTime: 5000 },
  { timestamp: '14:31:22', api: 'CryptoCompare', endpoint: '/data/v2/histoday', statusCode: 200, responseTime: 310 },
  { timestamp: '14:31:15', api: 'Alpha Vantage', endpoint: '/query?function=TIME_SERIES', statusCode: 200, responseTime: 420 },
  { timestamp: '14:31:05', api: 'Firebase FCM', endpoint: '/send', statusCode: 200, responseTime: 92 },
  { timestamp: '14:30:58', api: 'SendGrid', endpoint: '/v3/mail/send', statusCode: 202, responseTime: 360 },
  { timestamp: '14:30:45', api: 'CoinGecko', endpoint: '/simple/price', statusCode: 429, responseTime: 45 },
];

const STATUS_CONFIG = {
  active: { dot: 'var(--green)', label: 'Ativo', variant: 'green' as const },
  slow: { dot: 'var(--yellow)', label: 'Lento', variant: 'yellow' as const },
  error: { dot: 'var(--red)', label: 'Erro', variant: 'red' as const },
};

export default function AdminIntegrationsPage() {
  const [apiFilter, setApiFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [testing, setTesting] = useState<string | null>(null);

  const handleTest = (name: string) => {
    setTesting(name);
    setTimeout(() => setTesting(null), 2000);
  };

  const filteredLogs = LOGS.filter(l =>
    (apiFilter === 'Todos' || l.api === apiFilter) &&
    (statusFilter === 'Todos' ||
      (statusFilter === 'Success' && l.statusCode < 400) ||
      (statusFilter === 'Error' && l.statusCode >= 400))
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Integrações</h1>

      {/* Integration cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {INTEGRATIONS.map(int => {
          const st = STATUS_CONFIG[int.status];
          return (
            <Card key={int.name}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: st.dot }} />
                <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{int.name}</span>
              </div>
              <Badge variant={st.variant} size="sm">{st.label}</Badge>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span style={{ color: 'var(--text-muted)' }}>Última verificação</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{int.lastCheck}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span style={{ color: 'var(--text-muted)' }}>Tempo médio</span>
                  <span style={{ color: int.avgResponse > 1000 ? 'var(--yellow)' : 'var(--text-secondary)' }}>
                    {int.avgResponse > 0 ? `${int.avgResponse}ms` : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span style={{ color: 'var(--text-muted)' }}>Uptime 30d</span>
                  <span style={{ color: int.uptime >= 99 ? 'var(--green)' : int.uptime >= 95 ? 'var(--yellow)' : 'var(--red)' }}>
                    {int.uptime}%
                  </span>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                loading={testing === int.name}
                onClick={() => handleTest(int.name)}
                className="w-full mt-3"
                icon={<IconRefresh size={13} />}
              >
                Testar agora
              </Button>
            </Card>
          );
        })}
      </div>

      {/* API Logs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Logs de Chamadas</h2>
          <div className="flex gap-2">
            <select
              value={apiFilter}
              onChange={e => setApiFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs border outline-none"
              style={{ background: 'var(--black4)', borderColor: 'var(--border-bright)', color: 'var(--text-secondary)' }}
            >
              <option value="Todos">Todas APIs</option>
              {[...new Set(LOGS.map(l => l.api))].map(api => (
                <option key={api} value={api}>{api}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs border outline-none"
              style={{ background: 'var(--black4)', borderColor: 'var(--border-bright)', color: 'var(--text-secondary)' }}
            >
              <option value="Todos">Todos Status</option>
              <option value="Success">Success</option>
              <option value="Error">Error</option>
            </select>
          </div>
        </div>

        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  <th className="px-4 py-3 text-xs font-semibold">Timestamp</th>
                  <th className="px-4 py-3 text-xs font-semibold">API</th>
                  <th className="px-4 py-3 text-xs font-semibold">Endpoint</th>
                  <th className="px-4 py-3 text-xs font-semibold">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold">Tempo</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, i) => (
                  <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{log.timestamp}</td>
                    <td className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{log.api}</td>
                    <td className="px-4 py-3 font-mono text-xs truncate max-w-xs" style={{ color: 'var(--text-secondary)' }}>{log.endpoint}</td>
                    <td className="px-4 py-3">
                      <Badge variant={log.statusCode < 400 ? 'green' : log.statusCode === 429 ? 'yellow' : 'red'} size="sm">
                        {log.statusCode}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{
                      color: log.responseTime > 1000 ? 'var(--yellow)' : log.responseTime > 3000 ? 'var(--red)' : 'var(--text-secondary)'
                    }}>
                      {log.responseTime}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
