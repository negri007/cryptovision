export function calculateSMA(prices: number[], period: number): number[] {
  const sma = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(NaN);
      continue;
    }
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
}

export function calculateEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema = [];
  let prevEma = 0;
  
  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      ema.push(prices[i]);
      prevEma = prices[i];
    } else {
      const currentEma = (prices[i] * k) + (prevEma * (1 - k));
      ema.push(currentEma);
      prevEma = currentEma;
    }
  }
  return ema;
}

// Stubs for other indicators to be implemented fully later
export function calculateRSI(prices: number[], period = 14): number[] { return []; }
export function calculateMACD(prices: number[], fast = 12, slow = 26, signal = 9): any[] { return []; }
export function calculateBollingerBands(prices: number[], period = 20, stdDev = 2): any[] { return []; }
export function calculateATR(highs: number[], lows: number[], closes: number[], period = 14): number[] { return []; }
export function calculateOBV(closes: number[], volumes: number[]): number[] { return []; }
export function detectPatterns(candles: any[]): any[] { return []; }
