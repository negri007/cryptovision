import axios from 'axios';
import * as logger from 'firebase-functions/logger';

const CRYPTOCOMPARE_API_KEY = process.env.CRYPTOCOMPARE_API_KEY || '';
const BASE_URL = 'https://min-api.cryptocompare.com/data/v2';

const isMockMode = () => !CRYPTOCOMPARE_API_KEY && process.env.FUNCTIONS_EMULATOR === 'true';

export interface CryptoCompareCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volumefrom: number;
  volumeto: number;
}

function generateMockHistory(limit: number, intervalMinutes: number, basePrice: number): CryptoCompareCandle[] {
  const data: CryptoCompareCandle[] = [];
  const now = Math.floor(Date.now() / 1000);
  let currentPrice = basePrice;
  
  for (let i = limit; i >= 0; i--) {
    const time = now - i * intervalMinutes * 60;
    const open = currentPrice;
    const close = open + (Math.random() - 0.5) * (open * 0.02);
    const high = Math.max(open, close) + Math.random() * (open * 0.01);
    const low = Math.min(open, close) - Math.random() * (open * 0.01);
    const volumefrom = Math.random() * 1000;
    const volumeto = volumefrom * open;
    currentPrice = close;
    data.push({ time, open, high, low, close, volumefrom, volumeto });
  }
  return data;
}

export async function getHistoricalDaily(symbol: string, currency = 'USD', limit = 30): Promise<CryptoCompareCandle[]> {
  const normSymbol = symbol.toUpperCase();
  if (isMockMode()) {
    logger.info(`CryptoCompare: Running in Mock Mode for getHistoricalDaily (${normSymbol})`);
    return generateMockHistory(limit, 1440, normSymbol === 'BTC' ? 64000 : 3400);
  }

  try {
    const response = await axios.get(`${BASE_URL}/histo/day`, {
      params: {
        fsym: normSymbol,
        tsym: currency.toUpperCase(),
        limit,
        api_key: CRYPTOCOMPARE_API_KEY
      }
    });
    return response.data.Data.Data;
  } catch (error: any) {
    logger.error(`CryptoCompare: Error in getHistoricalDaily for ${normSymbol}`, { error: error.message });
    throw error;
  }
}

export async function getHistoricalHourly(symbol: string, currency = 'USD', limit = 24): Promise<CryptoCompareCandle[]> {
  const normSymbol = symbol.toUpperCase();
  if (isMockMode()) {
    logger.info(`CryptoCompare: Running in Mock Mode for getHistoricalHourly (${normSymbol})`);
    return generateMockHistory(limit, 60, normSymbol === 'BTC' ? 64000 : 3400);
  }

  try {
    const response = await axios.get(`${BASE_URL}/histo/hour`, {
      params: {
        fsym: normSymbol,
        tsym: currency.toUpperCase(),
        limit,
        api_key: CRYPTOCOMPARE_API_KEY
      }
    });
    return response.data.Data.Data;
  } catch (error: any) {
    logger.error(`CryptoCompare: Error in getHistoricalHourly for ${normSymbol}`, { error: error.message });
    throw error;
  }
}

export async function getHistoricalMinute(symbol: string, currency = 'USD', limit = 60): Promise<CryptoCompareCandle[]> {
  const normSymbol = symbol.toUpperCase();
  if (isMockMode()) {
    logger.info(`CryptoCompare: Running in Mock Mode for getHistoricalMinute (${normSymbol})`);
    return generateMockHistory(limit, 1, normSymbol === 'BTC' ? 64000 : 3400);
  }

  try {
    const response = await axios.get(`${BASE_URL}/histo/minute`, {
      params: {
        fsym: normSymbol,
        tsym: currency.toUpperCase(),
        limit,
        api_key: CRYPTOCOMPARE_API_KEY
      }
    });
    return response.data.Data.Data;
  } catch (error: any) {
    logger.error(`CryptoCompare: Error in getHistoricalMinute for ${normSymbol}`, { error: error.message });
    throw error;
  }
}
