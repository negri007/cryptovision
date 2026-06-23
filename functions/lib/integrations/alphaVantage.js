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
exports.getQuote = getQuote;
exports.getDailyHistory = getDailyHistory;
exports.getCompanyOverview = getCompanyOverview;
exports.getTopGainersLosers = getTopGainersLosers;
exports.searchTicker = searchTicker;
const axios_1 = __importDefault(require("axios"));
const logger = __importStar(require("firebase-functions/logger"));
const ALPHAVANTAGE_API_KEY = process.env.ALPHAVANTAGE_API_KEY || '';
const BASE_URL = 'https://www.alphavantage.co/query';
const isMockMode = () => !ALPHAVANTAGE_API_KEY && process.env.FUNCTIONS_EMULATOR === 'true';
async function getQuote(ticker) {
    const normTicker = ticker.toUpperCase();
    if (isMockMode()) {
        logger.info(`AlphaVantage: Running in Mock Mode for getQuote (${normTicker})`);
        const price = normTicker === 'AAPL' ? 180.50 : normTicker === 'TSLA' ? 175.20 : 100.00;
        return {
            symbol: normTicker,
            price: price + (Math.random() - 0.5) * 5,
            change: (Math.random() - 0.5) * 4,
            changePercent: `${(Math.random() - 0.5) * 2}%`,
            latestTradingDay: new Date().toISOString().split('T')[0],
            volume: 50000000
        };
    }
    try {
        const response = await axios_1.default.get(BASE_URL, {
            params: {
                function: 'GLOBAL_QUOTE',
                symbol: normTicker,
                apikey: ALPHAVANTAGE_API_KEY
            }
        });
        const quote = response.data['Global Quote'];
        if (!quote)
            throw new Error('No quote data found');
        return {
            symbol: quote['01. symbol'],
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: quote['10. change percent'],
            latestTradingDay: quote['07. latest trading day'],
            volume: parseInt(quote['06. volume'])
        };
    }
    catch (error) {
        logger.error(`AlphaVantage: Error in getQuote for ${normTicker}`, { error: error.message });
        throw error;
    }
}
async function getDailyHistory(ticker, full = false) {
    const normTicker = ticker.toUpperCase();
    if (isMockMode()) {
        logger.info(`AlphaVantage: Running in Mock Mode for getDailyHistory (${normTicker})`);
        const timeSeries = {};
        const now = new Date();
        let basePrice = normTicker === 'AAPL' ? 180.50 : 100.00;
        const limit = full ? 100 : 30;
        for (let i = 0; i < limit; i++) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            // Skip weekends for stock market
            if (d.getDay() === 0 || d.getDay() === 6)
                continue;
            const dateStr = d.toISOString().split('T')[0];
            basePrice += (Math.random() - 0.5) * 4;
            timeSeries[dateStr] = {
                '1. open': (basePrice - 1).toFixed(2),
                '2. high': (basePrice + 2).toFixed(2),
                '3. low': (basePrice - 2).toFixed(2),
                '4. close': basePrice.toFixed(2),
                '5. volume': '5000000'
            };
        }
        return {
            'Meta Data': { '2. Symbol': normTicker },
            'Time Series (Daily)': timeSeries
        };
    }
    try {
        const response = await axios_1.default.get(BASE_URL, {
            params: {
                function: 'TIME_SERIES_DAILY',
                symbol: normTicker,
                outputsize: full ? 'full' : 'compact',
                apikey: ALPHAVANTAGE_API_KEY
            }
        });
        return response.data;
    }
    catch (error) {
        logger.error(`AlphaVantage: Error in getDailyHistory for ${normTicker}`, { error: error.message });
        throw error;
    }
}
async function getCompanyOverview(ticker) {
    const normTicker = ticker.toUpperCase();
    if (isMockMode()) {
        logger.info(`AlphaVantage: Running in Mock Mode for getCompanyOverview (${normTicker})`);
        return {
            Symbol: normTicker,
            AssetType: 'Common Stock',
            Name: `${normTicker} Inc.`,
            Description: `Mock description for ${normTicker} stock overview.`,
            PERatio: '28.5',
            PEGRatio: '1.45',
            BookValue: '4.50',
            DividendShare: '0.96',
            DividendYield: '0.0055',
            EPS: '6.45',
            RevenuePerShareTTM: '23.40',
            ProfitMargin: '0.22',
            OperatingMarginTTM: '0.30',
            ReturnOnAssetsTTM: '0.12',
            ReturnOnEquityTTM: '0.45',
            RevenueTTM: '380000000000',
            GrossProfitTTM: '170000000000',
            DilutedEPSTTM: '6.45',
            QuarterlyEarningsGrowthYOY: '0.08',
            QuarterlyRevenueGrowthYOY: '0.05',
            AnalystTargetPrice: '195.00',
            TrailingPE: '28.1',
            ForwardPE: '26.2',
            PriceToSalesRatioTTM: '6.2',
            PriceToBookRatio: '40.0',
            EVToRevenue: '6.5',
            EVToEBITDA: '20.4',
            Beta: '1.2'
        };
    }
    try {
        const response = await axios_1.default.get(BASE_URL, {
            params: {
                function: 'OVERVIEW',
                symbol: normTicker,
                apikey: ALPHAVANTAGE_API_KEY
            }
        });
        return response.data;
    }
    catch (error) {
        logger.error(`AlphaVantage: Error in getCompanyOverview for ${normTicker}`, { error: error.message });
        throw error;
    }
}
async function getTopGainersLosers() {
    if (isMockMode()) {
        logger.info('AlphaVantage: Running in Mock Mode for getTopGainersLosers');
        return {
            top_gainers: [
                { ticker: 'TSLA', price: '175.20', change_amount: '12.5', change_percentage: '7.68%' }
            ],
            top_losers: [
                { ticker: 'AAPL', price: '180.50', change_amount: '-5.2', change_percentage: '-2.8%' }
            ],
            most_actively_traded: [
                { ticker: 'MSFT', price: '420.10', volume: '30000000', change_percentage: '0.4%' }
            ]
        };
    }
    try {
        const response = await axios_1.default.get(BASE_URL, {
            params: {
                function: 'TOP_GAINERS_LOSERS',
                apikey: ALPHAVANTAGE_API_KEY
            }
        });
        return response.data;
    }
    catch (error) {
        logger.error('AlphaVantage: Error in getTopGainersLosers', { error: error.message });
        throw error;
    }
}
async function searchTicker(keywords) {
    if (isMockMode()) {
        logger.info(`AlphaVantage: Running in Mock Mode for searchTicker (${keywords})`);
        return {
            bestMatches: [
                { '1. symbol': 'AAPL', '2. name': 'Apple Inc', '3. type': 'Equity', '4. region': 'United States' }
            ]
        };
    }
    try {
        const response = await axios_1.default.get(BASE_URL, {
            params: {
                function: 'SYMBOL_SEARCH',
                keywords,
                apikey: ALPHAVANTAGE_API_KEY
            }
        });
        return response.data;
    }
    catch (error) {
        logger.error(`AlphaVantage: Error in searchTicker for ${keywords}`, { error: error.message });
        throw error;
    }
}
//# sourceMappingURL=alphaVantage.js.map