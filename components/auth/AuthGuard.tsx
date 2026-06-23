'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { IconLoader2, IconMail, IconChartLine } from '@tabler/icons-react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [resentEmail, setResentEmail] = useState(false);
  const lastResentRef = useRef<number>(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--black)' }}>
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--blue)' }}>
              <IconChartLine size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>CryptoVision</span>
          </div>
          <IconLoader2 size={24} className="animate-spin mx-auto" style={{ color: 'var(--blue-bright)' }} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Email not verified banner
  if (!user.emailVerified) {
    const handleResend = async () => {
      const now = Date.now();
      if (now - lastResentRef.current < 5 * 60 * 1000) {
        return; // Rate limit: max 1 resend per 5 min
      }
      lastResentRef.current = now;
      const currentUser = auth.currentUser;
      if (currentUser) {
        await sendEmailVerification(currentUser);
        setResentEmail(true);
        setTimeout(() => setResentEmail(false), 5000);
      }
    };

    return (
      <div className="min-h-screen" style={{ background: 'var(--black)' }}>
        {/* Email verification banner */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 text-sm" style={{ background: 'var(--yellow-dim)', borderBottom: '1px solid var(--yellow)' }}>
          <IconMail size={16} style={{ color: 'var(--yellow)', flexShrink: 0 }} />
          <span style={{ color: 'var(--yellow)' }}>
            Por favor, verifique seu e-mail para acessar todos os recursos.
          </span>
          <button
            onClick={handleResend}
            className="ml-auto text-xs px-3 py-1 rounded-lg font-medium transition-opacity hover:opacity-80"
            style={{ background: 'var(--yellow)', color: '#000' }}
          >
            {resentEmail ? 'Reenviado!' : 'Reenviar e-mail'}
          </button>
        </div>
        <div className="pt-12">{children}</div>
      </div>
    );
  }

  return <>{children}</>;
}
