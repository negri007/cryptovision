'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { IconShieldLock, IconChartLine } from '@tabler/icons-react';

const TIMEOUT_SECONDS = 10 * 60; // 10 minutes

export default function TwoFactorPage() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_SECONDS);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleInput = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    if (pasted.length === 6) {
      setCode(pasted);
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('Por favor, insira o código completo de 6 dígitos.');
      return;
    }
    setLoading(true);
    setError('');
    // In production, this integrates with Firebase MFA resolver
    // For now we simulate the check and redirect on success
    try {
      await new Promise(r => setTimeout(r, 800));
      // Placeholder: integrate with Firebase MFA resolver stored in sessionStorage
      router.push('/dashboard');
    } catch {
      setError('Código inválido. Verifique e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--black) 0%, var(--black2) 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: 'var(--blue)' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--blue)' }}>
              <IconChartLine size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>CryptoVision</span>
          </div>
        </div>

        <div className="rounded-2xl p-8 border text-center" style={{ background: 'var(--black2)', borderColor: 'var(--border-bright)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--blue-glow)' }}>
            <IconShieldLock size={28} style={{ color: 'var(--blue-bright)' }} />
          </div>

          <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Verificação de dois fatores</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Insira o código de 6 dígitos do seu aplicativo autenticador.
          </p>

          {/* Countdown */}
          <div className="mb-6">
            <div className="text-2xl font-mono font-bold mb-1" style={{ color: timeLeft < 60 ? 'var(--red)' : 'var(--blue-bright)' }}>
              {formatTime(timeLeft)}
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>tempo restante</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm border" style={{ background: 'var(--red-dim)', borderColor: 'var(--red)', color: 'var(--red)' }}>
              {error}
            </div>
          )}

          {/* 6-digit input grid */}
          <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                id={`2fa-digit-${i}`}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleInput(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-11 h-14 text-center text-xl font-bold rounded-xl border outline-none transition-all"
                style={{
                  background: 'var(--black3)',
                  borderColor: digit ? 'var(--blue-bright)' : 'var(--border-bright)',
                  color: 'var(--text-primary)'
                }}
                autoFocus={i === 0}
              />
            ))}
          </div>

          <button
            id="2fa-verify"
            onClick={handleVerify}
            disabled={loading || code.join('').length < 6}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
            style={{ background: 'var(--blue)', color: '#fff' }}
          >
            {loading ? 'Verificando...' : 'Verificar código'}
          </button>

          <button
            type="button"
            className="w-full mt-3 text-sm py-2 transition-colors hover:text-blue-bright"
            style={{ color: 'var(--text-secondary)' }}
          >
            Usar código de backup
          </button>
        </div>
      </div>
    </div>
  );
}
