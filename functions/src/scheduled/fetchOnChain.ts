import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as logger from 'firebase-functions/logger';
import { db } from '../firebase';
import * as glassnode from '../integrations/glassnode';

export const fetchOnChain = onSchedule({
  schedule: '*/10 * * * *',
  timeoutSeconds: 240,
  retryCount: 2
}, async (event) => {
  logger.info('fetchOnChain: Starting on-chain metrics sync job');

  const btcMetrics = [
    { name: 'active_addresses', path: 'addresses/active_count' },
    { name: 'exchange_net_flow', path: 'transactions/exchanges_netflow' },
    { name: 'miner_outflow', path: 'distribution/miner_outflow' },
    { name: 'nupl', path: 'indicators/nupl' },
    { name: 'sopr', path: 'indicators/sopr' }
  ];

  const ethMetrics = [
    { name: 'active_addresses', path: 'addresses/active_count' },
    { name: 'exchange_net_flow', path: 'transactions/exchanges_netflow' },
    { name: 'gas_price_mean', path: 'ethereum/gas_price' } // Gas price mean
  ];

  const timestamp = Date.now();
  const dateStr = new Date(timestamp).toISOString();

  // Helper to fetch and write metric to Firestore
  const syncMetric = async (asset: string, metricName: string, path: string) => {
    try {
      const dataPoints = await glassnode.getMetric(asset, path);
      
      const batch = db.batch();
      for (const dp of dataPoints) {
        // Data timestamp is in seconds, convert to ms
        const msTimestamp = dp.t * 1000;
        
        const docRef = db
          .collection('market')
          .doc('onchain')
          .collection(asset.toLowerCase())
          .doc(metricName)
          .collection('history')
          .doc(msTimestamp.toString());
          
        batch.set(docRef, {
          timestamp: msTimestamp,
          value: dp.v,
          lastUpdated: dateStr
        });
      }
      
      await batch.commit();
    } catch (err: any) {
      logger.error(`fetchOnChain: Failed to sync ${asset} metric ${metricName}`, { error: err.message });
    }
  };

  // Sync BTC Metrics
  for (const metric of btcMetrics) {
    await syncMetric('BTC', metric.name, metric.path);
    await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit buffer
  }

  // Sync ETH Metrics
  for (const metric of ethMetrics) {
    await syncMetric('ETH', metric.name, metric.path);
    await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit buffer
  }

  logger.info('fetchOnChain: Completed on-chain metrics sync job');
});
