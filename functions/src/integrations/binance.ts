import axios from 'axios';
import WebSocket from 'ws';
import * as logger from 'firebase-functions/logger';

const BINANCE_API_URL = 'https://api.binance.com/api/v3';
const BINANCE_WS_URL = 'wss://stream.binance.com:9443';

// Helper to determine if we should run in mock mode
const isMockMode = () => process.env.FUNCTIONS_EMULATOR === 'true' && !process.env.BINANCE_LIVE;

export interface Kline {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function getTickerPrice(symbol: string): Promise<number> {
  const normSymbol = symbol.toUpperCase().replace('/', '');
  
  if (isMockMode()) {
    logger.info(`Binance: Running in Mock Mode for getTickerPrice (${normSymbol})`);
    if (normSymbol.startsWith('BTC')) return 64000 + Math.random() * 200 - 100;
    if (normSymbol.startsWith('ETH')) return 3400 + Math.random() * 20 - 10;
    return 1.0;
  }

  try {
    const response = await axios.get(`${BINANCE_API_URL}/ticker/price`, {
      params: { symbol: normSymbol }
    });
    return parseFloat(response.data.price);
  } catch (error: any) {
    logger.error(`Binance: Error in getTickerPrice for ${normSymbol}`, { error: error.message });
    throw error;
  }
}

export async function getKlines(symbol: string, interval = '1d', limit = 100): Promise<Kline[]> {
  const normSymbol = symbol.toUpperCase().replace('/', '');

  if (isMockMode()) {
    logger.info(`Binance: Running in Mock Mode for getKlines (${normSymbol})`);
    const klines: Kline[] = [];
    const now = Date.now();
    let basePrice = normSymbol.startsWith('BTC') ? 64000 : normSymbol.startsWith('ETH') ? 3400 : 100;
    let intervalMs = 24 * 60 * 60 * 1000;
    if (interval === '1h') intervalMs = 60 * 60 * 1000;
    if (interval === '15m') intervalMs = 15 * 60 * 1000;
    if (interval === '1m') intervalMs = 60 * 1000;

    for (let i = limit; i >= 0; i--) {
      const time = now - i * intervalMs;
      const open = basePrice + (Math.random() - 0.5) * (basePrice * 0.02);
      const close = open + (Math.random() - 0.5) * (basePrice * 0.02);
      const high = Math.max(open, close) + Math.random() * (basePrice * 0.01);
      const low = Math.min(open, close) - Math.random() * (basePrice * 0.01);
      const volume = Math.random() * 5000;
      basePrice = close;
      klines.push({ time, open, high, low, close, volume });
    }
    return klines;
  }

  try {
    const response = await axios.get(`${BINANCE_API_URL}/klines`, {
      params: {
        symbol: normSymbol,
        interval,
        limit
      }
    });

    return response.data.map((item: any) => ({
      time: item[0],
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
      volume: parseFloat(item[5])
    }));
  } catch (error: any) {
    logger.error(`Binance: Error in getKlines for ${normSymbol}`, { error: error.message });
    throw error;
  }
}

export function connectWebSocket(
  symbols: string[], 
  onMessage: (symbol: string, price: number, timestamp: number) => void
): { close: () => void } {
  const normSymbols = symbols.map(s => s.toLowerCase().replace('/', ''));

  if (isMockMode()) {
    logger.info('Binance: Running WebSocket in Mock Mode');
    const intervalId = setInterval(() => {
      for (const symbol of symbols) {
        const normSymbol = symbol.toUpperCase().replace('/', '');
        let price = 1.0;
        if (normSymbol.startsWith('BTC')) price = 64000 + Math.random() * 300 - 150;
        else if (normSymbol.startsWith('ETH')) price = 3400 + Math.random() * 30 - 15;
        else if (normSymbol.startsWith('SOL')) price = 140 + Math.random() * 2 - 1;
        onMessage(symbol, price, Date.now());
      }
    }, 5000); // Send updates every 5 seconds in mock

    return {
      close: () => {
        logger.info('Binance: Closing Mock WebSocket interval');
        clearInterval(intervalId);
      }
    };
  }

  // Real Binance WS Client
  const streams = normSymbols.map(s => `${s}@ticker`).join('/');
  const wsUrl = `${BINANCE_WS_URL}/stream?streams=${streams}`;
  
  logger.info(`Binance: Connecting to WebSocket streams: ${streams}`);
  const ws = new WebSocket(wsUrl);

  ws.on('message', (data: WebSocket.Data) => {
    try {
      const payload = JSON.parse(data.toString());
      const stream = payload.stream;
      const coinData = payload.data;
      
      if (stream && coinData) {
        // Ticker payload details: s = Symbol, c = Last price, E = Event time
        const symbol = coinData.s; // e.g., BTCUSDT
        const price = parseFloat(coinData.c);
        const timestamp = coinData.E;
        onMessage(symbol, price, timestamp);
      }
    } catch (err: any) {
      logger.error('Binance: WebSocket message parsing error', { error: err.message });
    }
  });

  ws.on('error', (err) => {
    logger.error('Binance: WebSocket error occurred', { error: err.message });
  });

  ws.on('close', () => {
    logger.info('Binance: WebSocket connection closed');
  });

  return {
    close: () => {
      logger.info('Binance: Closing active WebSocket connection');
      ws.close();
    }
  };
}
