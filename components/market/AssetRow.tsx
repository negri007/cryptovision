'use client';

import { IconStar, IconStarFilled, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { Sparkline } from '@/components/ui/Sparkline';
import { formatMarketCap } from '@/lib/utils/formatters';

export interface AssetRowData {
  rank: number;
  symbol: string;
  name: string;
  logo?: string;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  volume24h: number;
  marketCap: number;
  sparkline: number[];
}

interface AssetRowProps {
  asset: AssetRowData;
  onWatchlist?: () => void;
  isInWatchlist?: boolean;
  onClick?: () => void;
}

function ChangeCell({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 font-mono text-xs ${positive ? 'text-green' : 'text-red'}`}>
      {positive ? <IconTrendingUp size={11} /> : <IconTrendingDown size={11} />}
      {positive ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}

export function AssetRow({ asset, onWatchlist, isInWatchlist, onClick }: AssetRowProps) {
  return (
    <tr
      onClick={onClick}
      className="border-b transition-colors hover:bg-white/[0.03] cursor-pointer"
      style={{ borderColor: 'var(--border)' }}
    >
      <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
        {asset.rank}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          {asset.logo ? (
            <img src={asset.logo} alt={asset.name} className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'var(--black4)', color: 'var(--text-secondary)' }}>
              {asset.symbol.charAt(0)}
            </div>
          )}
          <div>
            <span className="font-semibold text-sm block" style={{ color: 'var(--text-primary)' }}>{asset.name}</span>
            <span className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>{asset.symbol}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 font-mono font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
        ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      <td className="px-4 py-3"><ChangeCell value={asset.change1h} /></td>
      <td className="px-4 py-3"><ChangeCell value={asset.change24h} /></td>
      <td className="px-4 py-3"><ChangeCell value={asset.change7d} /></td>
      <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
        {formatMarketCap(asset.volume24h)}
      </td>
      <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
        {formatMarketCap(asset.marketCap)}
      </td>
      <td className="px-3 py-3">
        <Sparkline data={asset.sparkline} color="auto" width={80} height={28} />
      </td>
      <td className="px-3 py-3">
        <button
          onClick={e => { e.stopPropagation(); onWatchlist?.(); }}
          className="p-1 rounded-lg transition-colors hover:bg-white/5"
        >
          {isInWatchlist
            ? <IconStarFilled size={16} style={{ color: 'var(--yellow)' }} />
            : <IconStar size={16} style={{ color: 'var(--text-muted)' }} />
          }
        </button>
      </td>
    </tr>
  );
}
