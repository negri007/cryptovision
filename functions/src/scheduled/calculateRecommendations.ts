import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as logger from 'firebase-functions/logger';
import { db } from '../firebase';
import { calculateRSI, calculateSMA, calculateMACD } from '../utils/indicators';

export const calculateRecommendations = onSchedule({
  schedule: '0 * * * *', // Every hour
  timeoutSeconds: 300,
  retryCount: 1
}, async (event) => {
  logger.info('calculateRecommendations: Starting recommendations calculator job');

  const timestamp = Date.now();
  const dateStr = new Date(timestamp).toISOString();

  try {
    // 1. Fetch active crypto symbols
    const priceSnapshots = await db.collection('market/crypto/prices').get();
    const symbols = priceSnapshots.docs.map(doc => doc.id);

    if (symbols.length === 0) {
      logger.info('calculateRecommendations: No active crypto assets found in prices collection');
      return;
    }

    for (const symbol of symbols) {
      try {
        // 2. Fetch last 200 candles
        const candlesSnap = await db
          .collection('market/crypto/history')
          .doc(symbol)
          .collection('candles')
          .orderBy('timestamp', 'desc')
          .limit(200)
          .get();

        // If not enough candles, simulate/generate mock ones for dev to prevent blocking
        let candles = candlesSnap.docs.map(doc => doc.data()).reverse();
        if (candles.length < 50 && process.env.FUNCTIONS_EMULATOR === 'true') {
          logger.info(`calculateRecommendations: Generating mock history for ${symbol} to execute technical calculation`);
          const now = Date.now();
          const basePrice = symbol === 'BTC' ? 64000 : symbol === 'ETH' ? 3400 : 100;
          for (let i = 200; i >= 0; i--) {
            candles.push({
              timestamp: now - i * 60 * 1000,
              close: basePrice + (Math.random() - 0.5) * (basePrice * 0.05),
              volume: Math.random() * 5000 + 1000
            });
          }
        } else if (candles.length < 20) {
          logger.warn(`calculateRecommendations: Insufficient data for ${symbol} (${candles.length} candles). Skipping.`);
          continue;
        }

        const prices = candles.map(c => c.close);
        const volumes = candles.map(c => c.volume || 0);

        // SMA 20, 50, 200
        const currentPrice = prices[prices.length - 1];
        const sma20 = calculateSMA(prices, 20);
        const sma50 = calculateSMA(prices, 50);
        const sma200 = calculateSMA(prices, 200);

        // RSI 14
        const rsi = calculateRSI(prices, 14);

        // MACD
        const macd = calculateMACD(prices);

        // Relative Volume
        const recentVol = volumes[volumes.length - 1];
        const avgVol = calculateSMA(volumes, 20);
        const relativeVolume = avgVol > 0 ? recentVol / avgVol : 1;

        // 3. Fetch sentiment (recent 24h news)
        const oneDayAgo = new Date(timestamp - 24 * 60 * 60 * 1000).toISOString();
        const newsSnap = await db
          .collection('news')
          .where('publishedAt', '>=', oneDayAgo)
          .get();

        let totalSentiment = 0;
        let countSentiment = 0;
        const symLower = symbol.toLowerCase();

        newsSnap.docs.forEach(doc => {
          const art = doc.data();
          const text = `${art.title} ${art.description}`.toLowerCase();
          if (text.includes(symLower) || text.includes('crypto')) {
            totalSentiment += art.sentimentScore || 0;
            countSentiment++;
          }
        });

        const avgSentiment = countSentiment > 0 ? totalSentiment / countSentiment : 0; // -X to +X scale

        // 4. Fetch on-chain (Glassnode metrics if available)
        let activeAddressesChange = 0; // percent change
        try {
          const onchainSnap = await db
            .collection('market')
            .doc('onchain')
            .collection(symbol.toLowerCase())
            .doc('active_addresses')
            .collection('history')
            .orderBy('timestamp', 'desc')
            .limit(2)
            .get();

          if (onchainSnap.docs.length >= 2) {
            const vals = onchainSnap.docs.map(d => d.data().value);
            activeAddressesChange = ((vals[0] - vals[1]) / vals[1]) * 100;
          }
        } catch (onchainErr) {
          // Silent: on-chain data might not exist for non-BTC/ETH assets
        }

        // 5. Calculate Score (0 to 100)
        // Normalize each factor to a 0-100 scale where 50 is neutral
        
        // RSI Score: oversold (<30) is bullish (high score), overbought (>70) is bearish (low score)
        let rsiScore = 50;
        if (rsi < 30) rsiScore = 50 + (30 - rsi) * 1.66; // Oversold -> bullish (up to 100)
        else if (rsi > 70) rsiScore = 50 - (rsi - 70) * 1.66; // Overbought -> bearish (down to 0)
        else rsiScore = 50 + (50 - rsi) * 0.5; // Linear mid-scale

        // MACD Score: histogram > 0 is bullish, < 0 is bearish
        let macdScore = 50;
        if (macd.histogram > 0) macdScore = Math.min(100, 50 + (macd.histogram / currentPrice) * 1000);
        else macdScore = Math.max(0, 50 + (macd.histogram / currentPrice) * 1000);

        // SMA Score: price above SMAs is bullish
        let smaScore = 50;
        let smaCount = 0;
        if (currentPrice > sma20) smaCount++;
        if (currentPrice > sma50) smaCount++;
        if (currentPrice > sma200) smaCount++;
        smaScore = smaCount === 3 ? 85 : smaCount === 2 ? 65 : smaCount === 1 ? 40 : 15;

        // Volume Score: high volume on up-days is bullish
        const priceChange = prices[prices.length - 1] - prices[prices.length - 2];
        let volumeScore = 50;
        if (relativeVolume > 1.2) {
          volumeScore = priceChange > 0 ? 80 : 20; // High volume up is bullish, down is bearish
        }

        // Sentiment Score: -5 to +5 maps to 0 to 100
        const sentimentScore = Math.min(100, Math.max(0, 50 + avgSentiment * 10));

        // Weights
        // RSI: 20%, MACD: 20%, SMA: 20%, Volume: 15%, Sentiment: 15%, On-chain: 10%
        let finalScore = 0;
        if (activeAddressesChange !== 0) {
          const onchainScore = Math.min(100, Math.max(0, 50 + activeAddressesChange * 2));
          finalScore = (rsiScore * 0.20) + (macdScore * 0.20) + (smaScore * 0.20) + (volumeScore * 0.15) + (sentimentScore * 0.15) + (onchainScore * 0.10);
        } else {
          // Redistribute on-chain weight (10%) to technicals (RSI/MACD/SMA +3.33% each)
          finalScore = (rsiScore * 0.233) + (macdScore * 0.233) + (smaScore * 0.234) + (volumeScore * 0.15) + (sentimentScore * 0.15);
        }

        finalScore = Math.round(finalScore);

        // Determine Label
        let label = 'neutral';
        if (finalScore >= 80) label = 'strong_buy';
        else if (finalScore >= 60) label = 'buy';
        else if (finalScore <= 20) label = 'strong_sell';
        else if (finalScore <= 40) label = 'sell';

        // 7. Save to Firestore recommendations/{symbol}
        await db.collection('recommendations').doc(symbol.toUpperCase()).set({
          symbol: symbol.toUpperCase(),
          score: finalScore,
          label,
          indicators: {
            rsi,
            macdHistogram: macd.histogram,
            sma20,
            sma50,
            sma200,
            relativeVolume
          },
          sentimentScore: avgSentiment,
          lastUpdated: dateStr
        });

        // 8. Save to history
        await db
          .collection('recommendations')
          .doc(symbol.toUpperCase())
          .collection('history')
          .doc(timestamp.toString())
          .set({
            timestamp,
            score: finalScore,
            label,
            price: currentPrice
          });

        logger.info(`calculateRecommendations: Calculated score ${finalScore} (${label}) for ${symbol}`);
      } catch (err: any) {
        logger.error(`calculateRecommendations: Failed calculation for ${symbol}`, { error: err.message });
      }
    }

    logger.info('calculateRecommendations: Completed recommendations calculations successfully');
  } catch (error: any) {
    logger.error('calculateRecommendations: General failure in calculator job', { error: error.message });
  }
});
