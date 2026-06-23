'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode, CandlestickSeries, AreaSeries, HistogramSeries, type IChartApi } from 'lightweight-charts';

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface PriceChartProps {
  symbol: string;
  interval?: string;
  candleType?: 'candle' | 'line';
  height?: number;
  className?: string;
  showVolume?: boolean;
  showToolbar?: boolean;
}

const INTERVALS = ['1D', '1W', '1M', '3M', '1Y'];

function generateMockCandles(days: number): CandleData[] {
  const candles: CandleData[] = [];
  let price = 60000 + Math.random() * 10000;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const volatility = price * 0.03;
    const open = price;
    const close = open + (Math.random() - 0.48) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.random() * 50000000 + 10000000;

    candles.push({ time: dateStr, open, high, low, close, volume });
    price = close;
  }
  return candles;
}

export function PriceChart({
  symbol,
  interval: initialInterval = '1D',
  candleType = 'candle',
  height = 400,
  className = '',
  showVolume = true,
  showToolbar = true,
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [activeInterval, setActiveInterval] = useState(initialInterval);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#7B8FA8',
        fontFamily: 'Inter, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.04)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: 'rgba(45,136,255,0.3)', width: 1, style: 2 },
        horzLine: { color: 'rgba(45,136,255,0.3)', width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.06)',
        scaleMargins: { top: 0.1, bottom: showVolume ? 0.25 : 0.1 },
      },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.06)',
        timeVisible: true,
      },
    });

    chartRef.current = chart;

    const days = activeInterval === '1D' ? 30 : activeInterval === '1W' ? 90 : activeInterval === '1M' ? 180 : activeInterval === '3M' ? 365 : 730;
    const mockData = generateMockCandles(days);

    if (candleType === 'candle') {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#00D97E',
        downColor: '#FF5B5B',
        borderUpColor: '#00D97E',
        borderDownColor: '#FF5B5B',
        wickUpColor: '#00D97E',
        wickDownColor: '#FF5B5B',
      });
      series.setData(mockData as any);
    } else {
      const series = chart.addSeries(AreaSeries, {
        lineColor: '#1A6FE8',
        lineWidth: 2,
        topColor: 'rgba(26,111,232,0.3)',
        bottomColor: 'rgba(26,111,232,0)',
        crosshairMarkerRadius: 4,
      });
      series.setData(mockData.map(d => ({ time: d.time, value: d.close })) as any);
    }

    if (showVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
      });
      chart.priceScale('volume').applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });
      volumeSeries.setData(
        mockData.map(d => ({
          time: d.time,
          value: d.volume || 0,
          color: d.close >= d.open ? 'rgba(0,217,126,0.3)' : 'rgba(255,91,91,0.3)',
        })) as any
      );
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [symbol, activeInterval, candleType, height, showVolume]);

  return (
    <div className={className}>
      {showToolbar && (
        <div className="flex items-center gap-2 mb-3">
          {INTERVALS.map(iv => (
            <button
              key={iv}
              onClick={() => setActiveInterval(iv)}
              className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: activeInterval === iv ? 'var(--blue)' : 'var(--black4)',
                color: activeInterval === iv ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {iv}
            </button>
          ))}
        </div>
      )}
      <div ref={chartContainerRef} />
    </div>
  );
}
