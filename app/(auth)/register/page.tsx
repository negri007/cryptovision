'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconChartLine, IconMail, IconLock, IconUser, IconEye, IconEyeOff, IconCheck } from '@tabler/icons-react';
import { signUpWithEmail } from '@/lib/firebase/auth';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, { message: 'Você precisa aceitar os termos' }),
}).refine(d => d.password === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const parsed = registerSchema.safeParse({ ...form, terms });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(form.email, form.password, form.name);
      setRegistered(true);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--black)' }}>
        <div className="text-center max-w-sm px-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--green-dim)' }}>
            <IconCheck size={32} style={{ color: 'var(--green)' }} />
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Confirme seu e-mail</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Enviamos um link de verificação para <strong className="text-white">{form.email}</strong>. Acesse seu e-mail e clique no link para ativar sua conta.
          </p>
          <Link href="/login" className="inline-block px-6 py-3 rounded-xl text-sm font-semibold" style={{ background: 'var(--blue)', color: '#fff' }}>
            Ir para o Login
          </Link>
        </div>
      </div>
    );
  }

  const passwordStrength = (() => {
    const p = form.password;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();

  return (
    <div className="min-h-screen flex items-center justify-center py-12" style={{ background: 'linear-gradient(135deg, var(--black) 0%, var(--black2) 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: 'var(--blue)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--blue)' }}>
              <IconChartLine size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>CryptoVision</span>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Crie sua conta gratuita</p>
        </div>

        <div className="rounded-2xl p-8 border" style={{ background: 'var(--black2)', borderColor: 'var(--border-bright)' }}>
          <h1 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Criar conta</h1>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm border" style={{ background: 'var(--red-dim)', borderColor: 'var(--red)', color: 'var(--red)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-sm mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Nome completo</label>
              <div className="relative">
                <IconUser size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input id="register-name" type="text" value={form.name} onChange={set('name')} placeholder="Seu nome"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border"
                  style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>E-mail</label>
              <div className="relative">
                <IconMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input id="register-email" type="email" value={form.email} onChange={set('email')} placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border"
                  style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Senha</label>
              <div className="relative">
                <IconLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input id="register-password" type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Mínimo 8 caracteres"
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none border"
                  style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPass ? <IconEyeOff size={16} style={{ color: 'var(--text-muted)' }} /> : <IconEye size={16} style={{ color: 'var(--text-muted)' }} />}
                </button>
              </div>
              {/* Strength indicator */}
              {form.password && (
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{
                      background: i <= passwordStrength
                        ? passwordStrength <= 1 ? 'var(--red)' : passwordStrength <= 2 ? 'var(--yellow)' : 'var(--green)'
                        : 'var(--border-bright)'
                    }} />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Confirmar senha</label>
              <div className="relative">
                <IconLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input id="register-confirm-password" type={showPass ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repita a senha"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border"
                  style={{
                    background: 'var(--black3)',
                    borderColor: form.confirmPassword && form.confirmPassword !== form.password ? 'var(--red)' : 'var(--border)',
                    color: 'var(--text-primary)'
                  }} required />
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <div className="relative mt-0.5 flex-shrink-0">
                <input id="register-terms" type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} className="sr-only" />
                <div className="w-5 h-5 rounded border flex items-center justify-center transition-all"
                  style={{ background: terms ? 'var(--blue)' : 'transparent', borderColor: terms ? 'var(--blue)' : 'var(--border-bright)' }}>
                  {terms && <IconCheck size={12} className="text-white" />}
                </div>
              </div>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Concordo com os{' '}
                <a href="#" className="underline" style={{ color: 'var(--blue-bright)' }}>Termos de Uso</a>{' '}
                e{' '}
                <a href="#" className="underline" style={{ color: 'var(--blue-bright)' }}>Política de Privacidade</a>
              </span>
            </label>

            <button id="register-submit" type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{ background: 'var(--blue)', color: '#fff' }}>
              {loading ? 'Criando conta...' : 'Criar conta gratuita'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
            Já tem uma conta?{' '}
            <Link href="/login" className="font-medium" style={{ color: 'var(--blue-bright)' }}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
