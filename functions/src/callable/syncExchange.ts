import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db } from '../firebase';
import { makeExchangeClient } from '../integrations/exchangeFactory';

// Reuse local secret resolver from connection trigger
async function getSecret(secretRef: string): Promise<{ apiKey: string; apiSecret: string }> {
  if (process.env.FUNCTIONS_EMULATOR === 'true' || secretRef.includes('mock') || !secretRef.startsWith('projects/')) {
    return {
      apiKey: 'mock-api-key',
      apiSecret: 'mock-api-secret'
    };
  }
  const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
  const client = new SecretManagerServiceClient();
  const [version] = await client.accessSecretVersion({ name: secretRef });
  const payload = version.payload?.data?.toString();
  if (!payload) throw new Error('Secret payload is empty');
  return JSON.parse(payload);
}

export const syncExchange = onCall({
  timeoutSeconds: 120
}, async (request) => {
  // 1. Verify authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const uid = request.auth.uid;
  const connectionId = request.data.connectionId;
  const portfolioId = request.data.portfolioId || 'default';

  if (!connectionId) {
    throw new HttpsError('invalid-argument', 'The function must be called with a connectionId.');
  }

  logger.info(`syncExchange: Starting sync for connection ${connectionId} for user ${uid}`);

  try {
    // Verify ownership of the connection
    const connRef = db.doc(`users/${uid}/exchangeConnections/${connectionId}`);
    const connSnap = await connRef.get();

    if (!connSnap.exists) {
      throw new HttpsError('not-found', 'Exchange connection not found or user does not own it.');
    }

    const connData = connSnap.data()!;
    const exchangeName = connData.exchange;
    const secretRef = connData.secretManagerRef;
    const lastSyncAt = connData.lastSyncAt ? new Date(connData.lastSyncAt).getTime() : undefined;

    if (!exchangeName || !secretRef) {
      throw new HttpsError('failed-precondition', 'Exchange details or secret manager references are missing.');
    }

    // 2. Retrieve credentials
    const { apiKey, apiSecret } = await getSecret(secretRef);

    // 3. Instantiate client
    const client = makeExchangeClient(exchangeName, apiKey, apiSecret);

    // 4. Fetch transactions since lastSyncAt
    logger.info(`syncExchange: Fetching transactions for ${exchangeName} since ${lastSyncAt || 'beginning'}`);
    const transactions = await client.getTransactionHistory(undefined, lastSyncAt);

    // 5. Insert new transactions (recalculates FIFO automatically in Firestore trigger)
    const batch = db.batch();
    for (const tx of transactions) {
      const txDocRef = db.collection(`users/${uid}/portfolios/${portfolioId}/transactions`).doc();
      batch.set(txDocRef, {
        symbol: 'BTC',
        type: tx.type,
        quantity: tx.quantity,
        price: tx.price,
        executedAt: tx.executedAt,
        source: `exchange_manual_sync_${exchangeName}`,
        createdAt: new Date().toISOString()
      });
    }

    // Update lastSyncAt on connection node
    batch.set(connRef, {
      lastSyncAt: new Date().toISOString(),
      status: 'active',
      errorMessage: null
    }, { merge: true });

    await batch.commit();
    logger.info(`syncExchange: Manual sync completed successfully. Synced ${transactions.length} transactions`);

    return {
      success: true,
      syncedCount: transactions.length,
      lastSyncAt: new Date().toISOString()
    };
  } catch (error: any) {
    logger.error(`syncExchange: Manual sync failed for connection ${connectionId}`, { error: error.message });
    throw new HttpsError('internal', error.message || 'An error occurred during synchronization.');
  }
});
