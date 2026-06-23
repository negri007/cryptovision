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
exports.fetchCryptoPrices = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_1 = require("../firebase");
const coinGecko = __importStar(require("../integrations/coinGecko"));
exports.fetchCryptoPrices = (0, scheduler_1.onSchedule)({
    schedule: 'every 1 mins',
    timeoutSeconds: 60,
    retryCount: 3
}, async (event) => {
    logger.info('fetchCryptoPrices: Starting crypto price update job');
    try {
        // 1. Fetch active assets from Firestore market/crypto/assets
        const assetsSnapshot = await firebase_1.db.collection('market/crypto/assets').get();
        // Fallback/Default assets if empty
        let activeAssets = assetsSnapshot.docs.map(doc => doc.id.toLowerCase());
        if (activeAssets.length === 0) {
            activeAssets = ['bitcoin', 'ethereum', 'solana'];
            // Populate defaults in Firestore for future runs
            for (const id of activeAssets) {
                await firebase_1.db.collection('market/crypto/assets').doc(id).set({
                    symbol: id === 'bitcoin' ? 'btc' : id === 'ethereum' ? 'eth' : 'sol',
                    name: id.toUpperCase(),
                    active: true
                });
            }
        }
        // 2. Fetch prices from CoinGecko
        const marketsData = await coinGecko.getMarkets(1, 250, 'usd');
        const batch = firebase_1.db.batch();
        const timestamp = Date.now();
        const dateStr = new Date(timestamp).toISOString();
        for (const coin of marketsData) {
            if (!activeAssets.includes(coin.id.toLowerCase()))
                continue;
            const symbol = coin.symbol.toUpperCase();
            // 3. Upsert to market/crypto/prices/{symbol}
            const priceRef = firebase_1.db.collection('market/crypto/prices').doc(symbol);
            batch.set(priceRef, {
                id: coin.id,
                symbol: symbol,
                name: coin.name,
                price: coin.current_price,
                marketCap: coin.market_cap,
                volume24h: coin.total_volume,
                change24h: coin.price_change_percentage_24h,
                lastUpdated: dateStr
            }, { merge: true });
            // 4. Insert candle history in market/crypto/history/{symbol}/candles/{timestamp}
            // Round to start of minute for indexing
            const roundedTimestamp = Math.floor(timestamp / 60000) * 60000;
            const historyRef = firebase_1.db
                .collection('market/crypto/history')
                .doc(symbol)
                .collection('candles')
                .doc(roundedTimestamp.toString());
            batch.set(historyRef, {
                timestamp: roundedTimestamp,
                open: coin.current_price, // Simplifying: using current price for open/high/low/close since it is a 1m snapshot
                high: coin.current_price,
                low: coin.current_price,
                close: coin.current_price,
                volume: coin.total_volume / 1440 // Average minute volume
            });
        }
        // 5. Update global data in market/global
        const globalData = await coinGecko.getGlobalData();
        const globalRef = firebase_1.db.collection('market').doc('global');
        batch.set(globalRef, {
            totalMarketCap: globalData.total_market_cap?.usd || 0,
            totalVolume24h: globalData.total_volume?.usd || 0,
            btcDominance: globalData.market_cap_percentage?.btc || 0,
            ethDominance: globalData.market_cap_percentage?.eth || 0,
            marketCapChange24h: globalData.market_cap_change_percentage_24h_usd || 0,
            lastUpdated: dateStr
        }, { merge: true });
        await batch.commit();
        logger.info('fetchCryptoPrices: Completed crypto price update successfully');
    }
    catch (error) {
        logger.error('fetchCryptoPrices: Error updating crypto prices', { error: error.message });
    }
});
//# sourceMappingURL=fetchCryptoPrices.js.map