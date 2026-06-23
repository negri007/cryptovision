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
exports.getEverything = getEverything;
exports.getTopHeadlines = getTopHeadlines;
exports.parseRssFeed = parseRssFeed;
const axios_1 = __importDefault(require("axios"));
const logger = __importStar(require("firebase-functions/logger"));
const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
const BASE_URL = 'https://newsapi.org/v2';
const isMockMode = () => !NEWS_API_KEY && process.env.FUNCTIONS_EMULATOR === 'true';
async function getEverything(keywords, language = 'pt', pageSize = 10) {
    if (isMockMode()) {
        logger.info(`NewsAPI: Running in Mock Mode for getEverything (${keywords})`);
        return [
            {
                title: 'Bitcoin atinge nova alta histórica com fluxo de ETFs',
                description: 'O preço do Bitcoin subiu acima de US$ 64.000, impulsionado pela forte demanda contínua por ETFs de Bitcoin à vista nos EUA.',
                url: 'https://example.com/btc-high',
                source: 'CryptoNews',
                publishedAt: new Date().toISOString()
            },
            {
                title: 'Ethereum enfrenta queda após taxas de gás subirem drasticamente',
                description: 'Analistas apontam preocupações de congestionamento na rede principal do Ethereum, forçando desenvolvedores a migrarem para soluções de segunda camada.',
                url: 'https://example.com/eth-fees',
                source: 'DefiNews',
                publishedAt: new Date().toISOString()
            }
        ];
    }
    try {
        const response = await axios_1.default.get(`${BASE_URL}/everything`, {
            params: {
                q: keywords,
                language,
                pageSize,
                apiKey: NEWS_API_KEY
            }
        });
        return (response.data.articles || []).map((art) => ({
            title: art.title || '',
            description: art.description || '',
            url: art.url || '',
            source: art.source?.name || 'Unknown',
            publishedAt: art.publishedAt || new Date().toISOString()
        }));
    }
    catch (error) {
        logger.error(`NewsAPI: Error in getEverything for ${keywords}`, { error: error.message });
        throw error;
    }
}
async function getTopHeadlines(category = 'business', country = 'br', pageSize = 10) {
    if (isMockMode()) {
        logger.info(`NewsAPI: Running in Mock Mode for getTopHeadlines (${category})`);
        return [
            {
                title: 'Mercados globais registram forte volatilidade no início da semana',
                description: 'Investidores aguardam novos dados da inflação americana e decisões sobre taxas de juros de bancos centrais.',
                url: 'https://example.com/global-markets',
                source: 'FinançaInfo',
                publishedAt: new Date().toISOString()
            }
        ];
    }
    try {
        const response = await axios_1.default.get(`${BASE_URL}/top-headlines`, {
            params: {
                category,
                country,
                pageSize,
                apiKey: NEWS_API_KEY
            }
        });
        return (response.data.articles || []).map((art) => ({
            title: art.title || '',
            description: art.description || '',
            url: art.url || '',
            source: art.source?.name || 'Unknown',
            publishedAt: art.publishedAt || new Date().toISOString()
        }));
    }
    catch (error) {
        logger.error(`NewsAPI: Error in getTopHeadlines for ${category}`, { error: error.message });
        throw error;
    }
}
// Regex-based RSS Feed XML Parser to avoid bloated dependencies
async function parseRssFeed(feedUrl) {
    try {
        // If running offline or in mock emulator mode without access to RSS
        if (process.env.FUNCTIONS_EMULATOR === 'true' && feedUrl.includes('mock')) {
            logger.info(`NewsAPI: Running in Mock Mode for parseRssFeed (${feedUrl})`);
            return [
                {
                    title: 'Notícia mockada do feed RSS',
                    description: 'Esta é uma descrição realista gerada pelo simulador para testar o parseamento de feeds RSS.',
                    url: 'https://example.com/rss-mock',
                    source: 'RSS Feed Mock',
                    publishedAt: new Date().toISOString()
                }
            ];
        }
        const response = await axios_1.default.get(feedUrl, { timeout: 10000 });
        const xml = response.data;
        const articles = [];
        // Split by <item>
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        while ((match = itemRegex.exec(xml)) !== null) {
            const itemContent = match[1];
            const titleMatch = itemContent.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || itemContent.match(/<title>([\s\S]*?)<\/title>/);
            const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
            const descMatch = itemContent.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || itemContent.match(/<description>([\s\S]*?)<\/description>/);
            const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
            const title = titleMatch ? titleMatch[1].trim() : '';
            const url = linkMatch ? linkMatch[1].trim() : '';
            const description = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : '';
            const publishedAt = pubDateMatch ? new Date(pubDateMatch[1].trim()).toISOString() : new Date().toISOString();
            if (title && url) {
                articles.push({
                    title,
                    description,
                    url,
                    source: new URL(feedUrl).hostname,
                    publishedAt
                });
            }
        }
        return articles;
    }
    catch (error) {
        logger.error(`NewsAPI: Error in parseRssFeed for ${feedUrl}`, { error: error.message });
        // In emulator, fall back to mock data if actual fetch fails
        if (process.env.FUNCTIONS_EMULATOR === 'true') {
            return [
                {
                    title: `Fallback Feed RSS: Falha ao carregar ${new URL(feedUrl).hostname}`,
                    description: 'Retornando este mock de fallback devido a falha na requisição externa em ambiente local.',
                    url: feedUrl,
                    source: 'RSS Fallback',
                    publishedAt: new Date().toISOString()
                }
            ];
        }
        throw error;
    }
}
//# sourceMappingURL=newsApi.js.map