'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useMarketStore } from '@/store/marketStore';
import { auth } from '@/lib/firebase/client';
import { onAuthStateChanged } from 'firebase/auth';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Ticker } from '@/components/layout/Ticker';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore(s => s.setUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      setUser(user);
    });
    return () => unsub();
  }, [setUser]);

  return (
    <AuthGuard>
      <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--black)' }}>
        {/* Price ticker strip at top */}
        <Ticker />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar navigation */}
          <Sidebar />

          {/* Main content area */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
