export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
}

export function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length === 0) return [];
  const k = 2 / (period + 1);
  const ema = [prices[0]];
  for (let i = 1; i < prices.length; i++) {
    ema.push(prices[i] * k + ema[i - 1] * (1 - k));
  }
  return ema;
}

export function calculateRSI(prices: number[], period = 14): number {
  if (prices.length <= period) return 50; // Neutral default
  
  let gains = 0;
  let losses = 0;
  
  // First average
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  // Wilder's smoothing
  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;
  }
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

export interface MACDResult {
  macdLine: number;
  signalLine: number;
  histogram: number;
}

export function calculateMACD(prices: number[], fast = 12, slow = 26, signal = 9): MACDResult {
  if (prices.length < slow + signal) {
    return { macdLine: 0, signalLine: 0, histogram: 0 };
  }
  const fastEma = calculateEMA(prices, fast);
  const slowEma = calculateEMA(prices, slow);
  
  const macdLine: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    macdLine.push(fastEma[i] - slowEma[i]);
  }
  
  // Signal line is the EMA of MACD Line
  const signalLine = calculateEMA(macdLine.slice(slow - 1), signal);
  
  const lastMacd = macdLine[macdLine.length - 1];
  const lastSignal = signalLine[signalLine.length - 1];
  
  return {
    macdLine: lastMacd,
    signalLine: lastSignal,
    histogram: lastMacd - lastSignal
  };
}
