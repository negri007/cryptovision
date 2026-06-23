'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconBrandGoogle, IconLock, IconMail, IconEye, IconEyeOff, IconChartLine } from '@tabler/icons-react';
import { signInWithEmail, signInWithGoogle, sendPasswordReset } from '@/lib/firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/multi-factor-auth-required') {
        router.push('/two-factor');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos.');
      } else {
        setError('Falha ao entrar. Verifique suas credenciais.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch {
      setError('Falha ao entrar com Google. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!resetEmail) return;
    try {
      await sendPasswordReset(resetEmail);
      setResetSent(true);
    } catch {
      setError('Falha ao enviar e-mail de recuperação.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--black) 0%, var(--black2) 100%)' }}>
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'var(--blue)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--blue)' }}>
              <IconChartLine size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>CryptoVision</span>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Análise de mercado em tempo real</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 border" style={{ background: 'var(--black2)', borderColor: 'var(--border-bright)' }}>
          <h1 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Entrar na sua conta</h1>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm border" style={{ background: 'var(--red-dim)', borderColor: 'var(--red)', color: 'var(--red)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>E-mail</label>
              <div className="relative">
                <IconMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all border focus:border-blue-bright"
                  style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Senha</label>
              <div className="relative">
                <IconLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all border focus:border-blue-bright"
                  style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPassword ? <IconEyeOff size={16} style={{ color: 'var(--text-muted)' }} /> : <IconEye size={16} style={{ color: 'var(--text-muted)' }} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={() => setShowResetModal(true)} className="text-sm transition-colors hover:text-blue-bright" style={{ color: 'var(--blue-bright)' }}>
                Esqueci minha senha
              </button>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{ background: 'var(--blue)', color: '#fff' }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--border)' }} />
            </div>
            <div className="relative flex justify-center text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="px-2" style={{ background: 'var(--black2)' }}>ou continue com</span>
            </div>
          </div>

          <button
            id="login-google"
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/10 border disabled:opacity-50"
            style={{ borderColor: 'var(--border-bright)', color: 'var(--text-primary)' }}
          >
            <IconBrandGoogle size={18} />
            Entrar com Google
          </button>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
            Não tem uma conta?{' '}
            <Link href="/register" className="font-medium transition-colors hover:opacity-80" style={{ color: 'var(--blue-bright)' }}>
              Criar conta
            </Link>
          </p>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 p-6 rounded-2xl border" style={{ background: 'var(--black2)', borderColor: 'var(--border-bright)' }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Recuperar senha</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Informe seu e-mail para receber as instruções de recuperação.
            </p>
            {resetSent ? (
              <div className="p-3 rounded-lg text-sm" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
                E-mail enviado! Verifique sua caixa de entrada.
              </div>
            ) : (
              <>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border mb-3"
                  style={{ background: 'var(--black3)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
                <button onClick={handleReset} className="w-full py-3 rounded-xl text-sm font-semibold" style={{ background: 'var(--blue)', color: '#fff' }}>
                  Enviar e-mail
                </button>
              </>
            )}
            <button onClick={() => { setShowResetModal(false); setResetSent(false); }} className="w-full mt-3 py-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
