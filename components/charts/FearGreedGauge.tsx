'use client';

interface FearGreedGaugeProps {
  value: number;
  className?: string;
}

function getLabel(value: number): string {
  if (value <= 20) return 'Medo Extremo';
  if (value <= 40) return 'Medo';
  if (value <= 60) return 'Neutro';
  if (value <= 80) return 'Ganância';
  return 'Ganância Extrema';
}

function getLabelColor(value: number): string {
  if (value <= 20) return 'var(--red)';
  if (value <= 40) return 'var(--yellow)';
  if (value <= 60) return 'var(--text-secondary)';
  if (value <= 80) return 'var(--green)';
  return 'var(--green)';
}

export function FearGreedGauge({ value, className = '' }: FearGreedGaugeProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const angle = -90 + (clampedValue / 100) * 180;
  const label = getLabel(clampedValue);
  const labelColor = getLabelColor(clampedValue);

  const size = 200;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const r = 75;
  const strokeWidth = 12;

  const startAngle = Math.PI;
  const endAngle = 0;

  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);

  const arcPath = `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;

  const needleAngle = Math.PI - (clampedValue / 100) * Math.PI;
  const needleLen = r - 15;
  const nx = cx + needleLen * Math.cos(needleAngle);
  const ny = cy - needleLen * Math.sin(needleAngle);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--red)" />
            <stop offset="35%" stopColor="var(--yellow)" />
            <stop offset="65%" stopColor="var(--green)" />
            <stop offset="100%" stopColor="var(--green)" />
          </linearGradient>
        </defs>

        <path
          d={arcPath}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
        />
        <path
          d={arcPath}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke="var(--text-primary)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={5} fill="var(--text-primary)" />

        <text x={cx} y={cy - 20} textAnchor="middle" fontSize="28" fontWeight="700" fill="var(--text-primary)">
          {clampedValue}
        </text>
      </svg>
      <span className="text-sm font-semibold -mt-2" style={{ color: labelColor }}>
        {label}
      </span>
    </div>
  );
}
