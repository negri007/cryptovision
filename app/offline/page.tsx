"use client";

import { IconWifiOff } from '@tabler/icons-react';

export default function OfflinePage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-black2 px-4 text-center">
      <div className="mb-6 rounded-full bg-border-bright p-4">
        <IconWifiOff className="h-12 w-12 text-text-secondary" stroke={1.5} />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-text-primary">Sem Conexão</h1>
      <p className="mb-8 max-w-md text-text-secondary">
        Você está offline no momento. Os dados exibidos podem não estar atualizados e algumas funcionalidades podem estar indisponíveis.
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="rounded-lg bg-blue px-6 py-2.5 font-semibold text-white transition-colors hover:bg-blue-bright"
      >
        Tentar Novamente
      </button>
    </div>
  );
}
