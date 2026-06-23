import crypto from 'crypto';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as logger from 'firebase-functions/logger';
import { db } from '../firebase';
import * as newsApi from '../integrations/newsApi';
import { analyzeSentiment } from '../utils/sentiment';

export const fetchNews = onSchedule({
  schedule: '*/5 * * * *',
  timeoutSeconds: 240,
  retryCount: 2
}, async (event) => {
  logger.info('fetchNews: Starting news fetch and sentiment analysis job');

  try {
    // 1. Fetch from NewsAPI
    const newsArticles = await newsApi.getEverything('crypto OR bitcoin OR ethereum OR finanças', 'pt', 15);
    
    // 2. Fetch configured RSS feeds from Firestore config/rssFeeds
    const rssSnapshot = await db.collection('config/rssFeeds').get();
    let feeds = rssSnapshot.docs.map(doc => doc.data().url);
    
    // Defaults if empty
    if (feeds.length === 0) {
      feeds = ['https://br.cointelegraph.com/rss', 'mock-feed-rss'];
      for (const f of feeds) {
        await db.collection('config/rssFeeds').add({ url: f, active: true });
      }
    }

    // Collect RSS articles
    let rssArticles: newsApi.Article[] = [];
    for (const feedUrl of feeds) {
      try {
        const feedArt = await newsApi.parseRssFeed(feedUrl);
        rssArticles = [...rssArticles, ...feedArt];
      } catch (err: any) {
        logger.error(`fetchNews: Error parsing RSS feed ${feedUrl}`, { error: err.message });
      }
    }

    const allArticles = [...newsArticles, ...rssArticles];
    logger.info(`fetchNews: Collected ${allArticles.length} total articles to analyze`);

    for (const article of allArticles) {
      // 3. Deduplicate by generating a unique doc ID from the article URL
      const articleId = crypto.createHash('md5').update(article.url).digest('hex');
      const docRef = db.collection('news').doc(articleId);
      
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        // Skip if already in database
        continue;
      }

      // 4. Analyze sentiment
      const textToAnalyze = `${article.title}. ${article.description}`;
      const sentiment = analyzeSentiment(textToAnalyze);

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
  } catch (error: any) {
    logger.error('fetchNews: Error in news aggregation job', { error: error.message });
  }
});
