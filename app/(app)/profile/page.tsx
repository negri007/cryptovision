'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import {
  IconUser, IconShieldLock, IconSettings, IconCrown, IconDatabase,
  IconCheck, IconCamera, IconLoader2
} from '@tabler/icons-react';

type Tab = 'pessoal' | 'seguranca' | 'preferencias' | 'plano' | 'privacidade';

export default function ProfilePage() {
  const user = useAuthStore(s => s.user);
  const [activeTab, setActiveTab] = useState<Tab>('pessoal');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user?.displayName || '');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'pessoal', label: 'Dados Pessoais', icon: <IconUser size={16} /> },
    { id: 'seguranca', label: 'Segurança', icon: <IconShieldLock size={16} /> },
    { id: 'preferencias', label: 'Preferências', icon: <IconSettings size={16} /> },
    { id: 'plano', label: 'Meu Plano', icon: <IconCrown size={16} /> },
    { id: 'privacidade', label: 'Dados & Privacidade', icon: <IconDatabase size={16} /> },
  ];

  const handleSavePersonal = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Configurações da Conta</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Gerencie suas preferências e informações pessoais</p>
      </div>

      <div className="flex gap-6">
        {/* Tab list */}
        <div className="flex flex-col gap-1 w-52 flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              id={`profile-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all"
              style={{
                background: activeTab === tab.id ? 'var(--blue-glow)' : 'transparent',
                color: activeTab === tab.id ? 'var(--blue-bright)' : 'var(--text-secondary)',
                borderLeft: activeTab === tab.id ? '2px solid var(--blue-bright)' : '2px solid transparent'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 rounded-2xl border p-6" style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}>

          {/* === DADOS PESSOAIS === */}
          {activeTab === 'pessoal' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Dados Pessoais</h3>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold" style={{ background: 'var(--blue)', color: '#fff' }}>
                    {name.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center border-2" style={{ background: 'var(--black3)', borderColor: 'var(--black2)' }}>
                    <IconCamera size={13} style={{ color: 'var(--text-secondary)' }} />
                  </button>
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{user?.displayName || 'Usuário'}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                </div>
              </div>

              {/* Name field */}
              <div>
                <label className="text-sm mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Nome completo</label>
                <input id="profile-name" type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                  style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              </div>

              {/* Risk profile */}
              <div>
                <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Perfil de investimento</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Conservador', 'Moderado', 'Agressivo'] as const).map(p => (
                    <button key={p}
                      className="py-3 px-4 rounded-xl text-sm font-medium border transition-all"
                      style={{ background: p === 'Moderado' ? 'var(--blue-glow)' : 'var(--black3)', borderColor: p === 'Moderado' ? 'var(--blue-bright)' : 'var(--border)', color: p === 'Moderado' ? 'var(--blue-bright)' : 'var(--text-secondary)' }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button id="profile-save-personal" onClick={handleSavePersonal} disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ background: saved ? 'var(--green)' : 'var(--blue)', color: '#fff' }}>
                {saving ? <IconLoader2 size={16} className="animate-spin" /> : saved ? <IconCheck size={16} /> : null}
                {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar alterações'}
              </button>
            </div>
          )}

          {/* === SEGURANÇA === */}
          {activeTab === 'seguranca' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Segurança da Conta</h3>

              {/* Change password */}
              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--black3)' }}>
                <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Alterar senha</h4>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Recomendamos uma senha com no mínimo 8 caracteres com letras e números.</p>
                <button id="profile-change-password" className="text-sm px-4 py-2 rounded-lg transition-colors" style={{ background: 'var(--blue)', color: '#fff' }}>
                  Alterar senha
                </button>
              </div>

              {/* 2FA */}
              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--black3)' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Autenticação de dois fatores (2FA)</h4>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Adicione uma camada extra de segurança com um app autenticador.</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--yellow-dim)', color: 'var(--yellow)' }}>Desativado</span>
                </div>
                <button id="profile-enable-2fa" className="mt-3 text-sm px-4 py-2 rounded-lg transition-colors" style={{ background: 'var(--black4)', color: 'var(--text-primary)', border: '1px solid var(--border-bright)' }}>
                  Ativar 2FA
                </button>
              </div>
            </div>
          )}

          {/* === PREFERÊNCIAS === */}
          {activeTab === 'preferencias' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Preferências</h3>

              <div>
                <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Moeda de referência</label>
                <select className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                  style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  <option value="BRL">BRL — Real Brasileiro</option>
                  <option value="USD">USD — Dólar Americano</option>
                  <option value="EUR">EUR — Euro</option>
                </select>
              </div>

              <div>
                <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Notificações</label>
                <div className="space-y-3">
                  {['E-mail', 'Push (navegador)', 'Telegram'].map(channel => (
                    <label key={channel} className="flex items-center justify-between p-3 rounded-xl border cursor-pointer" style={{ borderColor: 'var(--border)', background: 'var(--black3)' }}>
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{channel}</span>
                      <div className="w-10 h-6 rounded-full relative cursor-pointer transition-all" style={{ background: 'var(--blue)' }}>
                        <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow" />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* === MEU PLANO === */}
          {activeTab === 'plano' && (
            <div className="space-y-6" id="plano">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Meu Plano</h3>

              <div className="p-5 rounded-2xl border" style={{ background: 'linear-gradient(135deg, var(--blue-glow) 0%, transparent 100%)', borderColor: 'var(--blue-bright)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Plano Free</span>
                  <span className="text-sm px-3 py-1 rounded-full font-medium" style={{ background: 'var(--blue)', color: '#fff' }}>Ativo</span>
                </div>
                <ul className="space-y-2">
                  {['Até 1 portfólio', '5 alertas de preço', 'Dados com 15min de atraso', '1 exchange conectada'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <IconCheck size={14} style={{ color: 'var(--green)' }} />{f}
                    </li>
                  ))}
                </ul>
              </div>

              <button id="profile-upgrade" className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90" style={{ background: 'linear-gradient(90deg, var(--yellow) 0%, var(--blue-bright) 100%)', color: '#000' }}>
                <IconCrown size={18} />
                Fazer Upgrade para Pro
              </button>
            </div>
          )}

          {/* === PRIVACIDADE === */}
          {activeTab === 'privacidade' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Dados & Privacidade (LGPD)</h3>

              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--black3)' }}>
                <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Exportar meus dados</h4>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Baixe todos os seus dados (perfil, transações, alertas) em um arquivo JSON/CSV de acordo com a LGPD.
                </p>
                <button id="profile-export-data" className="text-sm px-4 py-2 rounded-lg transition-colors" style={{ background: 'var(--blue)', color: '#fff' }}>
                  Solicitar exportação
                </button>
              </div>

              <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--red)', background: 'var(--red-dim)' }}>
                <h4 className="font-medium mb-1" style={{ color: 'var(--red)' }}>Excluir conta</h4>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Esta ação é irreversível. Todos os seus dados serão apagados permanentemente.
                </p>
                <button id="profile-delete-account" className="text-sm px-4 py-2 rounded-lg border transition-colors" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
                  Excluir minha conta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
