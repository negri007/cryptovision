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
exports.getHistoricalDaily = getHistoricalDaily;
exports.getHistoricalHourly = getHistoricalHourly;
exports.getHistoricalMinute = getHistoricalMinute;
const axios_1 = __importDefault(require("axios"));
const logger = __importStar(require("firebase-functions/logger"));
const CRYPTOCOMPARE_API_KEY = process.env.CRYPTOCOMPARE_API_KEY || '';
const BASE_URL = 'https://min-api.cryptocompare.com/data/v2';
const isMockMode = () => !CRYPTOCOMPARE_API_KEY && process.env.FUNCTIONS_EMULATOR === 'true';
function generateMockHistory(limit, intervalMinutes, basePrice) {
    const data = [];
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
async function getHistoricalDaily(symbol, currency = 'USD', limit = 30) {
    const normSymbol = symbol.toUpperCase();
    if (isMockMode()) {
        logger.info(`CryptoCompare: Running in Mock Mode for getHistoricalDaily (${normSymbol})`);
        return generateMockHistory(limit, 1440, normSymbol === 'BTC' ? 64000 : 3400);
    }
    try {
        const response = await axios_1.default.get(`${BASE_URL}/histo/day`, {
            params: {
                fsym: normSymbol,
                tsym: currency.toUpperCase(),
                limit,
                api_key: CRYPTOCOMPARE_API_KEY
            }
        });
        return response.data.Data.Data;
    }
    catch (error) {
        logger.error(`CryptoCompare: Error in getHistoricalDaily for ${normSymbol}`, { error: error.message });
        throw error;
    }
}
async function getHistoricalHourly(symbol, currency = 'USD', limit = 24) {
    const normSymbol = symbol.toUpperCase();
    if (isMockMode()) {
        logger.info(`CryptoCompare: Running in Mock Mode for getHistoricalHourly (${normSymbol})`);
        return generateMockHistory(limit, 60, normSymbol === 'BTC' ? 64000 : 3400);
    }
    try {
        const response = await axios_1.default.get(`${BASE_URL}/histo/hour`, {
            params: {
                fsym: normSymbol,
                tsym: currency.toUpperCase(),
                limit,
                api_key: CRYPTOCOMPARE_API_KEY
            }
        });
        return response.data.Data.Data;
    }
    catch (error) {
        logger.error(`CryptoCompare: Error in getHistoricalHourly for ${normSymbol}`, { error: error.message });
        throw error;
    }
}
async function getHistoricalMinute(symbol, currency = 'USD', limit = 60) {
    const normSymbol = symbol.toUpperCase();
    if (isMockMode()) {
        logger.info(`CryptoCompare: Running in Mock Mode for getHistoricalMinute (${normSymbol})`);
        return generateMockHistory(limit, 1, normSymbol === 'BTC' ? 64000 : 3400);
    }
    try {
        const response = await axios_1.default.get(`${BASE_URL}/histo/minute`, {
            params: {
                fsym: normSymbol,
                tsym: currency.toUpperCase(),
                limit,
                api_key: CRYPTOCOMPARE_API_KEY
            }
        });
        return response.data.Data.Data;
    }
    catch (error) {
        logger.error(`CryptoCompare: Error in getHistoricalMinute for ${normSymbol}`, { error: error.message });
        throw error;
    }
}
//# sourceMappingURL=cryptoCompare.js.map