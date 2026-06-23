'use client';

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({ data, color = 'var(--blue)', width = 100, height = 32, className = '' }: SparklineProps) {
  if (!data.length) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = padding + (1 - (v - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const isPositive = data[data.length - 1] >= data[0];
  const lineColor = color === 'auto' ? (isPositive ? 'var(--green)' : 'var(--red)') : color;

  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke={lineColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
