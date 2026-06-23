'use client';

import React, { useState, useMemo } from 'react';
import { IconArrowUp, IconArrowDown, IconMoodSad } from '@tabler/icons-react';

// ---------- Types ----------
export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  rowKey: (row: T) => string;
  id?: string;
}

// ---------- Skeleton ----------
function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div
            className="h-4 rounded-md animate-pulse"
            style={{ background: 'var(--black4)', width: `${60 + Math.random() * 40}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

// ---------- Component ----------
export function DataTable<T>({ columns, data, loading, emptyMessage = 'Nenhum dado encontrado', onRowClick, rowKey, id }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = (a as any)[sortKey];
      const bv = (b as any)[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [data, sortKey, sortDir]);

  return (
    <div
      id={id}
      className="rounded-2xl border overflow-hidden"
      style={{ background: 'var(--black2)', borderColor: 'var(--border)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-semibold select-none ${col.sortable ? 'cursor-pointer hover:text-blue-bright' : ''}`}
                  style={{ color: 'var(--text-muted)', width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc'
                        ? <IconArrowUp size={12} />
                        : <IconArrowDown size={12} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={columns.length} />)
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <IconMoodSad size={32} style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row, idx) => (
                <tr
                  key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b transition-colors hover:bg-white/[0.03] ${onRowClick ? 'cursor-pointer' : ''}`}
                  style={{ borderColor: 'var(--border)' }}
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3.5" style={{ color: 'var(--text-primary)' }}>
                      {col.render ? col.render(row, idx) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
