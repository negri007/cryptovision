import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as logger from 'firebase-functions/logger';
import { db } from '../firebase';
import * as alphaVantage from '../integrations/alphaVantage';

export const fetchStockPrices = onSchedule({
  schedule: '*/15 9-18 * * 1-5',
  timeZone: 'America/Sao_Paulo',
  timeoutSeconds: 300,
  retryCount: 3
}, async (event) => {
  logger.info('fetchStockPrices: Starting stock price update job');

  try {
    const assetsSnapshot = await db.collection('market/stocks/assets').get();
    let tickers = assetsSnapshot.docs.map(doc => doc.id.toUpperCase());

    // Defaults if empty
    if (tickers.length === 0) {
      tickers = ['AAPL', 'TSLA', 'MSFT'];
      for (const t of tickers) {
        await db.collection('market/stocks/assets').doc(t).set({
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

        const batch = db.batch();

        // 3. Upsert to market/stocks/prices/{ticker}
        const priceRef = db.collection('market/stocks/prices').doc(ticker);
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
        const historyRef = db
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
      } catch (err: any) {
        logger.error(`fetchStockPrices: Failed to update stock ${ticker}`, { error: err.message });
      }
    }

    logger.info('fetchStockPrices: Completed stock price update job successfully');
  } catch (error: any) {
    logger.error('fetchStockPrices: Error in stock price updater', { error: error.message });
  }
});
