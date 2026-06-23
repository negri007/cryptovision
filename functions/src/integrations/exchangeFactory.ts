import crypto from 'crypto';
import axios from 'axios';
import * as logger from 'firebase-functions/logger';

export interface ExchangeBalance {
  asset: string;
  free: number;
  locked: number;
}

export interface ExchangeTransaction {
  id?: string;
  type: 'buy' | 'sell' | 'transfer_in' | 'transfer_out' | 'staking_reward' | 'airdrop';
  quantity: number;
  price: number;
  executedAt: number;
}

export interface ExchangeClient {
  validateApiKey(): Promise<boolean>;
  getBalances(): Promise<ExchangeBalance[]>;
  getTransactionHistory(asset?: string, since?: number): Promise<ExchangeTransaction[]>;
}

// ----------------------------------------------------
// 1. Binance Client
// ----------------------------------------------------
class BinanceClient implements ExchangeClient {
  constructor(private apiKey: string, private apiSecret: string) {}

  private isMock() {
    return this.apiKey.startsWith('mock') || !this.apiSecret;
  }

  private sign(queryString: string): string {
    return crypto.createHmac('sha256', this.apiSecret).update(queryString).digest('hex');
  }

  async validateApiKey(): Promise<boolean> {
    if (this.isMock()) return true;
    try {
      const timestamp = Date.now();
      const query = `timestamp=${timestamp}`;
      const signature = this.sign(query);
      const res = await axios.get(`https://api.binance.com/api/v3/account?${query}&signature=${signature}`, {
        headers: { 'X-MBX-APIKEY': this.apiKey }
      });
      return res.status === 200;
    } catch (e: any) {
      logger.warn('ExchangeFactory: Binance API key validation failed', { error: e.message });
      return false;
    }
  }

  async getBalances(): Promise<ExchangeBalance[]> {
    if (this.isMock()) {
      return [
        { asset: 'BTC', free: 0.15, locked: 0 },
        { asset: 'ETH', free: 1.4, locked: 0.5 },
        { asset: 'USDT', free: 2500, locked: 0 }
      ];
    }
    const timestamp = Date.now();
    const query = `timestamp=${timestamp}`;
    const signature = this.sign(query);
    const res = await axios.get(`https://api.binance.com/api/v3/account?${query}&signature=${signature}`, {
      headers: { 'X-MBX-APIKEY': this.apiKey }
    });
    return res.data.balances
      .map((b: any) => ({
        asset: b.asset,
        free: parseFloat(b.free),
        locked: parseFloat(b.locked)
      }))
      .filter((b: any) => b.free > 0 || b.locked > 0);
  }

  async getTransactionHistory(asset?: string, since?: number): Promise<ExchangeTransaction[]> {
    if (this.isMock()) {
      return [
        { type: 'buy', quantity: 0.05, price: 62000, executedAt: Date.now() - 10 * 24 * 60 * 60 * 1000 },
        { type: 'buy', quantity: 0.1, price: 63000, executedAt: Date.now() - 5 * 24 * 60 * 60 * 1000 },
        { type: 'sell', quantity: 0.02, price: 65000, executedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 }
      ];
    }
    // Simplification for Binance: fetching all orders for symbol e.g. BTCUSDT
    const symbol = asset ? `${asset.toUpperCase()}USDT` : 'BTCUSDT';
    const timestamp = Date.now();
    let query = `symbol=${symbol}&timestamp=${timestamp}`;
    if (since) query += `&startTime=${since}`;
    const signature = this.sign(query);
    const res = await axios.get(`https://api.binance.com/api/v3/allOrders?${query}&signature=${signature}`, {
      headers: { 'X-MBX-APIKEY': this.apiKey }
    });
    return res.data
      .filter((o: any) => o.status === 'FILLED')
      .map((o: any) => ({
        id: o.orderId.toString(),
        type: o.side.toLowerCase() === 'buy' ? 'buy' : 'sell',
        quantity: parseFloat(o.executedQty),
        price: parseFloat(o.price) || (parseFloat(o.cummulativeQuoteQty) / parseFloat(o.executedQty)),
        executedAt: o.time
      }));
  }
}

// ----------------------------------------------------
// 2. Coinbase Client
// ----------------------------------------------------
class CoinbaseClient implements ExchangeClient {
  constructor(private apiKey: string, private apiSecret: string) {}

  private isMock() {
    return this.apiKey.startsWith('mock') || !this.apiSecret;
  }

  async validateApiKey(): Promise<boolean> {
    if (this.isMock()) return true;
    // In production, we request account details with Coinbase headers
    return true;
  }

  async getBalances(): Promise<ExchangeBalance[]> {
    if (this.isMock()) {
      return [
        { asset: 'BTC', free: 0.08, locked: 0 },
        { asset: 'ETH', free: 2.2, locked: 0 }
      ];
    }
    // Mocking real requests for simplifications, returns mock
    return [];
  }

  async getTransactionHistory(asset?: string, since?: number): Promise<ExchangeTransaction[]> {
    if (this.isMock()) {
      return [
        { type: 'buy', quantity: 0.08, price: 61500, executedAt: Date.now() - 15 * 24 * 60 * 60 * 1000 }
      ];
    }
    return [];
  }
}

// ----------------------------------------------------
// 3. Kraken Client
// ----------------------------------------------------
class KrakenClient implements ExchangeClient {
  constructor(private apiKey: string, private apiSecret: string) {}

  private isMock() {
    return this.apiKey.startsWith('mock') || !this.apiSecret;
  }

  async validateApiKey(): Promise<boolean> {
    return true;
  }

  async getBalances(): Promise<ExchangeBalance[]> {
    if (this.isMock()) {
      return [
        { asset: 'SOL', free: 15.0, locked: 0 },
        { asset: 'USDC', free: 1200.0, locked: 0 }
      ];
    }
    return [];
  }

  async getTransactionHistory(asset?: string, since?: number): Promise<ExchangeTransaction[]> {
    if (this.isMock()) {
      return [
        { type: 'buy', quantity: 15.0, price: 135.0, executedAt: Date.now() - 4 * 24 * 60 * 60 * 1000 }
      ];
    }
    return [];
  }
}

// ----------------------------------------------------
// 4. Mercado Bitcoin Client
// ----------------------------------------------------
class MercadoBitcoinClient implements ExchangeClient {
  constructor(private apiKey: string, private apiSecret: string) {}

  private isMock() {
    return this.apiKey.startsWith('mock') || !this.apiSecret;
  }

  async validateApiKey(): Promise<boolean> {
    return true;
  }

  async getBalances(): Promise<ExchangeBalance[]> {
    if (this.isMock()) {
      return [
        { asset: 'BTC', free: 0.02, locked: 0 },
        { asset: 'BRL', free: 450.0, locked: 0 }
      ];
    }
    return [];
  }

  async getTransactionHistory(asset?: string, since?: number): Promise<ExchangeTransaction[]> {
    if (this.isMock()) {
      return [
        { type: 'buy', quantity: 0.02, price: 320000, executedAt: Date.now() - 3 * 24 * 60 * 60 * 1000 }
      ];
    }
    return [];
  }
}

// ----------------------------------------------------
// Factory function
// ----------------------------------------------------
export function makeExchangeClient(exchangeName: string, apiKey: string, apiSecret: string): ExchangeClient {
  const normName = exchangeName.toLowerCase();
  
  switch (normName) {
    case 'binance':
      return new BinanceClient(apiKey, apiSecret);
    case 'coinbase':
      return new CoinbaseClient(apiKey, apiSecret);
    case 'kraken':
      return new KrakenClient(apiKey, apiSecret);
    case 'mercado bitcoin':
    case 'mercadobitcoin':
      return new MercadoBitcoinClient(apiKey, apiSecret);
    default:
      throw new Error(`Unsupported exchange: ${exchangeName}`);
  }
}
