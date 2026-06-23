'use client';

import { useState } from 'react';
import {
  IconSearch, IconFilter, IconEye, IconCrown,
  IconBan, IconTrash, IconChevronLeft, IconChevronRight,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

const PLAN_VARIANTS = { free: 'gray', pro: 'blue', institutional: 'green' } as const;
const STATUS_VARIANTS = { active: 'green', pending: 'yellow', suspended: 'red' } as const;

const MOCK_USERS = [
  { id: '1', name: 'João Silva', email: 'joao@email.com', plan: 'pro', status: 'active', createdAt: '2024-01-15', logins: 142, portfolios: 3, alerts: 12 },
  { id: '2', name: 'Maria Santos', email: 'maria@email.com', plan: 'free', status: 'active', createdAt: '2024-02-20', logins: 45, portfolios: 1, alerts: 3 },
  { id: '3', name: 'Carlos Oliveira', email: 'carlos@corp.com', plan: 'institutional', status: 'active', createdAt: '2023-11-05', logins: 312, portfolios: 8, alerts: 50 },
  { id: '4', name: 'Ana Costa', email: 'ana@email.com', plan: 'pro', status: 'suspended', createdAt: '2024-03-10', logins: 28, portfolios: 2, alerts: 8 },
  { id: '5', name: 'Pedro Lima', email: 'pedro@email.com', plan: 'free', status: 'pending', createdAt: '2024-06-01', logins: 3, portfolios: 0, alerts: 0 },
  { id: '6', name: 'Lucia Mendes', email: 'lucia@email.com', plan: 'pro', status: 'active', createdAt: '2024-04-22', logins: 89, portfolios: 4, alerts: 15 },
  { id: '7', name: 'Rafael Torres', email: 'rafael@corp.com', plan: 'institutional', status: 'active', createdAt: '2023-09-18', logins: 420, portfolios: 12, alerts: 100 },
  { id: '8', name: 'Fernanda Alves', email: 'fernanda@email.com', plan: 'free', status: 'active', createdAt: '2024-05-12', logins: 15, portfolios: 1, alerts: 2 },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [selectedUser, setSelectedUser] = useState<typeof MOCK_USERS[number] | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ userId: string; action: string } | null>(null);

  const filtered = MOCK_USERS.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === 'Todos' || u.plan === planFilter.toLowerCase();
    const matchStatus = statusFilter === 'Todos' || u.status === statusFilter.toLowerCase();
    return matchSearch && matchPlan && matchStatus;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Gestão de Usuários</h1>

      {/* Search and filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border outline-none focus:border-blue"
            style={{ background: 'var(--black4)', borderColor: 'var(--border-bright)', color: 'var(--text-primary)' }}
          />
        </div>
        <div className="flex gap-1.5">
          {['Todos', 'Free', 'Pro', 'Institutional'].map(p => (
            <button key={p} onClick={() => setPlanFilter(p)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: planFilter === p ? 'var(--blue)' : 'var(--black4)',
                color: planFilter === p ? '#fff' : 'var(--text-secondary)',
              }}
            >{p}</button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {['Todos', 'Active', 'Pending', 'Suspended'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: statusFilter === s ? 'var(--green)' : 'var(--black4)',
                color: statusFilter === s ? '#fff' : 'var(--text-secondary)',
              }}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                <th className="px-4 py-3 text-xs font-semibold">Usuário</th>
                <th className="px-4 py-3 text-xs font-semibold">Plano</th>
                <th className="px-4 py-3 text-xs font-semibold">Status</th>
                <th className="px-4 py-3 text-xs font-semibold">Cadastro</th>
                <th className="px-4 py-3 text-xs font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b transition-colors hover:bg-white/[0.03]" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: 'var(--blue)', color: '#fff' }}>
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={PLAN_VARIANTS[u.plan as keyof typeof PLAN_VARIANTS]} size="sm">
                      {u.plan}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={STATUS_VARIANTS[u.status as keyof typeof STATUS_VARIANTS]} size="sm">
                      {u.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {u.createdAt}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1">
                      <button onClick={() => setSelectedUser(u)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-white/5" title="Ver detalhes">
                        <IconEye size={15} style={{ color: 'var(--text-secondary)' }} />
                      </button>
                      <button onClick={() => setConfirmAction({ userId: u.id, action: 'upgrade' })}
                        className="p-1.5 rounded-lg transition-colors hover:bg-white/5" title="Alterar plano">
                        <IconCrown size={15} style={{ color: 'var(--yellow)' }} />
                      </button>
                      <button onClick={() => setConfirmAction({ userId: u.id, action: u.status === 'suspended' ? 'activate' : 'suspend' })}
                        className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                        title={u.status === 'suspended' ? 'Ativar' : 'Suspender'}>
                        <IconBan size={15} style={{ color: 'var(--red)' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Mostrando {filtered.length} de {MOCK_USERS.length} usuários
        </span>
        <div className="flex gap-1">
          <button className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }}>
            <IconChevronLeft size={16} />
          </button>
          <button className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ background: 'var(--blue)', color: '#fff' }}>1</button>
          <button className="px-3 py-1 rounded-lg text-xs font-semibold transition-colors hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>2</button>
          <button className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: 'var(--text-muted)' }}>
            <IconChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* User detail drawer (modal) */}
      {selectedUser && (
        <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title={`Detalhes — ${selectedUser.name}`} maxWidth="480px">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'E-mail', value: selectedUser.email },
                { label: 'Plano', value: selectedUser.plan },
                { label: 'Status', value: selectedUser.status },
                { label: 'Cadastro', value: selectedUser.createdAt },
                { label: 'Logins', value: selectedUser.logins.toString() },
                { label: 'Portfólios', value: selectedUser.portfolios.toString() },
                { label: 'Alertas', value: selectedUser.alerts.toString() },
              ].map(d => (
                <div key={d.label} className="rounded-lg p-2.5" style={{ background: 'var(--black3)' }}>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{d.label}</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{d.value}</p>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm destructive action */}
      {confirmAction && (
        <Modal isOpen={!!confirmAction} onClose={() => setConfirmAction(null)} title="Confirmar ação" maxWidth="400px">
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {confirmAction.action === 'suspend'
                ? 'Tem certeza que deseja suspender este usuário?'
                : confirmAction.action === 'activate'
                ? 'Deseja reativar este usuário?'
                : 'Selecione o novo plano para este usuário.'}
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setConfirmAction(null)}>Cancelar</Button>
              <Button variant={confirmAction.action === 'suspend' ? 'danger' : 'primary'} size="sm" onClick={() => setConfirmAction(null)}>
                Confirmar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
