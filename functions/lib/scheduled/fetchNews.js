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
exports.fetchNews = void 0;
const crypto_1 = __importDefault(require("crypto"));
const scheduler_1 = require("firebase-functions/v2/scheduler");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_1 = require("../firebase");
const newsApi = __importStar(require("../integrations/newsApi"));
const sentiment_1 = require("../utils/sentiment");
exports.fetchNews = (0, scheduler_1.onSchedule)({
    schedule: '*/5 * * * *',
    timeoutSeconds: 240,
    retryCount: 2
}, async (event) => {
    logger.info('fetchNews: Starting news fetch and sentiment analysis job');
    try {
        // 1. Fetch from NewsAPI
        const newsArticles = await newsApi.getEverything('crypto OR bitcoin OR ethereum OR finanças', 'pt', 15);
        // 2. Fetch configured RSS feeds from Firestore config/rssFeeds
        const rssSnapshot = await firebase_1.db.collection('config/rssFeeds').get();
        let feeds = rssSnapshot.docs.map(doc => doc.data().url);
        // Defaults if empty
        if (feeds.length === 0) {
            feeds = ['https://br.cointelegraph.com/rss', 'mock-feed-rss'];
            for (const f of feeds) {
                await firebase_1.db.collection('config/rssFeeds').add({ url: f, active: true });
            }
        }
        // Collect RSS articles
        let rssArticles = [];
        for (const feedUrl of feeds) {
            try {
                const feedArt = await newsApi.parseRssFeed(feedUrl);
                rssArticles = [...rssArticles, ...feedArt];
            }
            catch (err) {
                logger.error(`fetchNews: Error parsing RSS feed ${feedUrl}`, { error: err.message });
            }
        }
        const allArticles = [...newsArticles, ...rssArticles];
        logger.info(`fetchNews: Collected ${allArticles.length} total articles to analyze`);
        for (const article of allArticles) {
            // 3. Deduplicate by generating a unique doc ID from the article URL
            const articleId = crypto_1.default.createHash('md5').update(article.url).digest('hex');
            const docRef = firebase_1.db.collection('news').doc(articleId);
            const docSnap = await docRef.get();
            if (docSnap.exists) {
                // Skip if already in database
                continue;
            }
            // 4. Analyze sentiment
            const textToAnalyze = `${article.title}. ${article.description}`;
            const sentiment = (0, sentiment_1.analyzeSentiment)(textToAnalyze);
            // 5. Save to Firestore news/{articleId}
            await docRef.set({
                title: article.title,
                description: article.description,
                url: article.url,
                source: article.source,
                publishedAt: article.publishedAt,
                sentimentScore: sentiment.score,
                sentimentLabel: sentiment.label,
                createdAt: new Date().toISOString()
            });
            logger.info(`fetchNews: Imported new article: "${article.title}" with sentiment: ${sentiment.label}`);
        }
        logger.info('fetchNews: Completed news aggregation job successfully');
    }
    catch (error) {
        logger.error('fetchNews: Error in news aggregation job', { error: error.message });
    }
});
//# sourceMappingURL=fetchNews.js.map