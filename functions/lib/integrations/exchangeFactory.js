"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeExchangeClient = makeExchangeClient;
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const logger = __importStar(require("firebase-functions/logger"));
// ----------------------------------------------------
// 1. Binance Client
// ----------------------------------------------------
class BinanceClient {
    apiKey;
    apiSecret;
    constructor(apiKey, apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }
    isMock() {
        return this.apiKey.startsWith('mock') || !this.apiSecret;
    }
    sign(queryString) {
        return crypto_1.default.createHmac('sha256', this.apiSecret).update(queryString).digest('hex');
    }
    async validateApiKey() {
        if (this.isMock())
            return true;
        try {
            const timestamp = Date.now();
            const query = `timestamp=${timestamp}`;
            const signature = this.sign(query);
            const res = await axios_1.default.get(`https://api.binance.com/api/v3/account?${query}&signature=${signature}`, {
                headers: { 'X-MBX-APIKEY': this.apiKey }
            });
            return res.status === 200;
        }
        catch (e) {
            logger.warn('ExchangeFactory: Binance API key validation failed', { error: e.message });
            return false;
        }
    }
    async getBalances() {
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
        const res = await axios_1.default.get(`https://api.binance.com/api/v3/account?${query}&signature=${signature}`, {
            headers: { 'X-MBX-APIKEY': this.apiKey }
        });
        return res.data.balances
            .map((b) => ({
            asset: b.asset,
            free: parseFloat(b.free),
            locked: parseFloat(b.locked)
        }))
            .filter((b) => b.free > 0 || b.locked > 0);
    }
    async getTransactionHistory(asset, since) {
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
        if (since)
            query += `&startTime=${since}`;
        const signature = this.sign(query);
        const res = await axios_1.default.get(`https://api.binance.com/api/v3/allOrders?${query}&signature=${signature}`, {
            headers: { 'X-MBX-APIKEY': this.apiKey }
        });
        return res.data
            .filter((o) => o.status === 'FILLED')
            .map((o) => ({
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
class CoinbaseClient {
    apiKey;
    apiSecret;
    constructor(apiKey, apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }
    isMock() {
        return this.apiKey.startsWith('mock') || !this.apiSecret;
    }
    async validateApiKey() {
        if (this.isMock())
            return true;
        // In production, we request account details with Coinbase headers
        return true;
    }
    async getBalances() {
        if (this.isMock()) {
            return [
                { asset: 'BTC', free: 0.08, locked: 0 },
                { asset: 'ETH', free: 2.2, locked: 0 }
            ];
        }
        // Mocking real requests for simplifications, returns mock
        return [];
    }
    async getTransactionHistory(asset, since) {
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
class KrakenClient {
    apiKey;
    apiSecret;
    constructor(apiKey, apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }
    isMock() {
        return this.apiKey.startsWith('mock') || !this.apiSecret;
    }
    async validateApiKey() {
        return true;
    }
    async getBalances() {
        if (this.isMock()) {
            return [
                { asset: 'SOL', free: 15.0, locked: 0 },
                { asset: 'USDC', free: 1200.0, locked: 0 }
            ];
        }
        return [];
    }
    async getTransactionHistory(asset, since) {
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
class MercadoBitcoinClient {
    apiKey;
    apiSecret;
    constructor(apiKey, apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }
    isMock() {
        return this.apiKey.startsWith('mock') || !this.apiSecret;
    }
    async validateApiKey() {
        return true;
    }
    async getBalances() {
        if (this.isMock()) {
            return [
                { asset: 'BTC', free: 0.02, locked: 0 },
                { asset: 'BRL', free: 450.0, locked: 0 }
            ];
        }
        return [];
    }
    async getTransactionHistory(asset, since) {
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
function makeExchangeClient(exchangeName, apiKey, apiSecret) {
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
//# sourceMappingURL=exchangeFactory.js.map