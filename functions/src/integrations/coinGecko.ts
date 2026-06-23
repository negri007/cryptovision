import axios from 'axios';
import * as logger from 'firebase-functions/logger';

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || '';
const BASE_URL = COINGECKO_API_KEY 
  ? 'https://pro-api.coingecko.com/api/v3' 
  : 'https://api.coingecko.com/api/v3';

// Helper to determine if we should use mock data
const isMockMode = () => !COINGECKO_API_KEY && process.env.FUNCTIONS_EMULATOR === 'true';

export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d?: number;
  last_updated: string;
}

export async function getMarkets(page = 1, perPage = 100, currency = 'usd'): Promise<CoinMarketData[]> {
  if (isMockMode()) {
    logger.info('CoinGecko: Running in Mock Mode for getMarkets');
    return [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 64250.50 + Math.random() * 100 - 50,
        market_cap: 1260000000000,
        total_volume: 28000000000,
        price_change_percentage_24h: 1.5 - Math.random() * 3,
        last_updated: new Date().toISOString()
      },
      {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        current_price: 3450.20 + Math.random() * 10 - 5,
        market_cap: 414000000000,
        total_volume: 15000000000,
        price_change_percentage_24h: 0.8 - Math.random() * 2,
        last_updated: new Date().toISOString()
      },
      {
        id: 'solana',
        symbol: 'sol',
        name: 'Solana',
        current_price: 142.75 + Math.random() * 4 - 2,
        market_cap: 66000000000,
        total_volume: 3200000000,
        price_change_percentage_24h: 4.2 - Math.random() * 5,
        last_updated: new Date().toISOString()
      }
    ];
  }

  try {
    const headers = COINGECKO_API_KEY ? { 'x-cg-pro-api-key': COINGECKO_API_KEY } : {};
    const response = await axios.get(`${BASE_URL}/coins/markets`, {
      params: {
        vs_currency: currency,
        order: 'market_cap_desc',
        per_page: perPage,
        page: page,
        sparkline: false,
        price_change_percentage: '24h,7d'
      },
      headers
    });
    return response.data;
  } catch (error: any) {
    logger.error('CoinGecko: Error in getMarkets', { error: error.message });
    throw error;
  }
}

export async function getCoinDetail(coinId: string): Promise<any> {
  if (isMockMode()) {
    logger.info(`CoinGecko: Running in Mock Mode for getCoinDetail (${coinId})`);
    return {
      id: coinId,
      symbol: coinId === 'bitcoin' ? 'btc' : 'eth',
      name: coinId === 'bitcoin' ? 'Bitcoin' : 'Ethereum',
      description: { en: 'Mock description for development.' },
      links: { homepage: ['https://example.com'] },
      market_data: {
        current_price: { usd: coinId === 'bitcoin' ? 64000 : 3400 },
        market_cap: { usd: coinId === 'bitcoin' ? 1200000000000 : 400000000000 }
      },
      tickers: [
        { market: { name: 'Binance' }, base: 'BTC', target: 'USDT', last: 64010 }
      ]
    };
  }

  try {
    const headers = COINGECKO_API_KEY ? { 'x-cg-pro-api-key': COINGECKO_API_KEY } : {};
    const response = await axios.get(`${BASE_URL}/coins/${coinId}`, {
      params: {
        localization: false,
        tickers: true,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false
      },
      headers
    });
    return response.data;
  } catch (error: any) {
    logger.error(`CoinGecko: Error in getCoinDetail for ${coinId}`, { error: error.message });
    throw error;
  }
}

export async function getMarketChart(coinId: string, days = 30, currency = 'usd'): Promise<{ prices: [number, number][]; total_volumes: [number, number][] }> {
  if (isMockMode()) {
    logger.info(`CoinGecko: Running in Mock Mode for getMarketChart (${coinId})`);
    const prices: [number, number][] = [];
    const total_volumes: [number, number][] = [];
    const now = Date.now();
    let basePrice = coinId === 'bitcoin' ? 64000 : 3400;
    
    for (let i = days; i >= 0; i--) {
      const timestamp = now - i * 24 * 60 * 60 * 1000;
      basePrice += (Math.random() - 0.5) * (basePrice * 0.03);
      prices.push([timestamp, basePrice]);
      total_volumes.push([timestamp, basePrice * 1000]);
    }
    
    return { prices, total_volumes };
  }

  try {
    const headers = COINGECKO_API_KEY ? { 'x-cg-pro-api-key': COINGECKO_API_KEY } : {};
    const response = await axios.get(`${BASE_URL}/coins/${coinId}/market_chart`, {
      params: {
        vs_currency: currency,
        days: days
      },
      headers
    });
    return response.data;
  } catch (error: any) {
    logger.error(`CoinGecko: Error in getMarketChart for ${coinId}`, { error: error.message });
    throw error;
  }
}

export async function getGlobalData(): Promise<any> {
  if (isMockMode()) {
    logger.info('CoinGecko: Running in Mock Mode for getGlobalData');
    return {
      active_cryptocurrencies: 12000,
      upcoming_icos: 0,
      ongoing_icos: 5,
      ended_icos: 1100,
      markets: 1000,
      total_market_cap: { usd: 2400000000000 },
      total_volume: { usd: 90000000000 },
      market_cap_percentage: { btc: 52.4, eth: 17.2 },
      market_cap_change_percentage_24h_usd: 1.2
    };
  }

  try {
    const headers = COINGECKO_API_KEY ? { 'x-cg-pro-api-key': COINGECKO_API_KEY } : {};
    const response = await axios.get(`${BASE_URL}/global`, { headers });
    return response.data.data;
  } catch (error: any) {
    logger.error('CoinGecko: Error in getGlobalData', { error: error.message });
    throw error;
  }
}

export async function getTrending(): Promise<any> {
  if (isMockMode()) {
    logger.info('CoinGecko: Running in Mock Mode for getTrending');
    return {
      coins: [
        { item: { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', market_cap_rank: 1, thumb: '' } },
        { item: { id: 'solana', name: 'Solana', symbol: 'SOL', market_cap_rank: 5, thumb: '' } }
      ]
    };
  }

  try {
    const headers = COINGECKO_API_KEY ? { 'x-cg-pro-api-key': COINGECKO_API_KEY } : {};
    const response = await axios.get(`${BASE_URL}/search/trending`, { headers });
    return response.data;
  } catch (error: any) {
    logger.error('CoinGecko: Error in getTrending', { error: error.message });
    throw error;
  }
}
