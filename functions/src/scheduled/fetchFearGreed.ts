import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as logger from 'firebase-functions/logger';
import { db } from '../firebase';
import * as fearGreed from '../integrations/fearGreed';

export const fetchFearGreed = onSchedule({
  schedule: '0 0 * * *', // Daily at 00:00 UTC
  timeoutSeconds: 60,
  retryCount: 2
}, async (event) => {
  logger.info('fetchFearGreed: Starting fear & greed update job');

  try {
    const fngData = await fearGreed.getCurrent();
    
    await db.collection('market').doc('global').set({
      fearGreedValue: fngData.value,
      fearGreedLabel: fngData.label,
      fearGreedTimestamp: fngData.timestamp,
      lastUpdated: new Date().toISOString()
    }, { merge: true });

    logger.info(`fetchFearGreed: Updated Fear & Greed index to ${fngData.value} (${fngData.label})`);
  } catch (error: any) {
    logger.error('fetchFearGreed: Error updating fear & greed index', { error: error.message });
  }
});
