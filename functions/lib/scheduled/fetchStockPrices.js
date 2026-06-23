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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchStockPrices = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_1 = require("../firebase");
const alphaVantage = __importStar(require("../integrations/alphaVantage"));
exports.fetchStockPrices = (0, scheduler_1.onSchedule)({
    schedule: '*/15 9-18 * * 1-5',
    timeZone: 'America/Sao_Paulo',
    timeoutSeconds: 300,
    retryCount: 3
}, async (event) => {
    logger.info('fetchStockPrices: Starting stock price update job');
    try {
        const assetsSnapshot = await firebase_1.db.collection('market/stocks/assets').get();
        let tickers = assetsSnapshot.docs.map(doc => doc.id.toUpperCase());
        // Defaults if empty
        if (tickers.length === 0) {
            tickers = ['AAPL', 'TSLA', 'MSFT'];
            for (const t of tickers) {
                await firebase_1.db.collection('market/stocks/assets').doc(t).set({
                    name: t === 'AAPL' ? 'Apple Inc.' : t === 'TSLA' ? 'Tesla Inc.' : 'Microsoft Corp.',
                    active: true
                });
            }
        }
        const timestamp = Date.now();
        const dateStr = new Date(timestamp).toISOString();
        for (const ticker of tickers) {
            try {
                // Fetch quote from AlphaVantage
                const quote = await alphaVantage.getQuote(ticker);
                const batch = firebase_1.db.batch();
                // 3. Upsert to market/stocks/prices/{ticker}
                const priceRef = firebase_1.db.collection('market/stocks/prices').doc(ticker);
                batch.set(priceRef, {
                    symbol: ticker,
                    price: quote.price,
                    change: quote.change,
                    changePercent: quote.changePercent,
                    volume: quote.volume,
                    lastUpdated: dateStr
                }, { merge: true });
                // 4. Insert candle history in market/stocks/history/{ticker}/candles/{timestamp}
                const roundedTimestamp = Math.floor(timestamp / 900000) * 900000; // Round to 15m
                const historyRef = firebase_1.db
                    .collection('market/stocks/history')
                    .doc(ticker)
                    .collection('candles')
                    .doc(roundedTimestamp.toString());
                batch.set(historyRef, {
                    timestamp: roundedTimestamp,
                    open: quote.price,
                    high: quote.price,
                    low: quote.price,
                    close: quote.price,
                    volume: quote.volume / 26 // Average 15m volume
                });
                await batch.commit();
                // Wait 1.5 seconds between stocks to respect AlphaVantage standard rates (5 requests/min standard)
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
            catch (err) {
                logger.error(`fetchStockPrices: Failed to update stock ${ticker}`, { error: err.message });
            }
        }
        logger.info('fetchStockPrices: Completed stock price update job successfully');
    }
    catch (error) {
        logger.error('fetchStockPrices: Error in stock price updater', { error: error.message });
    }
});
//# sourceMappingURL=fetchStockPrices.js.map