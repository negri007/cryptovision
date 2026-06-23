'use client';

interface ScoreBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  height?: number;
  className?: string;
}

function getColor(value: number): string {
  if (value < 40) return 'var(--red)';
  if (value < 60) return 'var(--yellow)';
  if (value < 80) return 'var(--blue)';
  return 'var(--green)';
}

function getBg(value: number): string {
  if (value < 40) return 'var(--red-dim)';
  if (value < 60) return 'var(--yellow-dim)';
  if (value < 80) return 'var(--blue-glow)';
  return 'var(--green-dim)';
}

export function ScoreBar({ value, max = 100, showLabel = true, height = 8, className = '' }: ScoreBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const color = getColor(value);
  const bg = getBg(value);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 rounded-full overflow-hidden" style={{ height, background: bg }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-bold tabular-nums min-w-[32px] text-right" style={{ color }}>
          {Math.round(value)}
        </span>
      )}
    </div>
  );
}
