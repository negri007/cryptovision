import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import { db } from '../firebase';
import { calculateFIFO, Transaction } from '../utils/fifo';

export const onTransactionWrite = onDocumentWritten({
  document: 'users/{uid}/portfolios/{pid}/transactions/{txId}',
  timeoutSeconds: 60
}, async (event) => {
  const params = event.params;
  const uid = params.uid;
  const pid = params.pid;
  const txId = params.txId;

  logger.info(`onTransactionWrite: Triggered for user ${uid}, portfolio ${pid}, tx ${txId}`);

  // Get symbol of transaction (need to check both before and after to know which symbol was affected)
  const dataBefore = event.data?.before.data();
  const dataAfter = event.data?.after.data();
  
  const symbol = (dataAfter?.symbol || dataBefore?.symbol || '').toUpperCase();
  if (!symbol) {
    logger.warn('onTransactionWrite: No symbol found in transaction');
    return;
  }

  // 1. Fetch all transactions for the same symbol in the same portfolio
  const txCollectionRef = db.collection(`users/${uid}/portfolios/${pid}/transactions`);
  const txSnapshot = await txCollectionRef.where('symbol', '==', symbol).get();

  const transactions: Transaction[] = txSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      type: data.type,
      quantity: parseFloat(data.quantity),
      price: parseFloat(data.price),
      executedAt: data.executedAt || Date.now()
    };
  });

  try {
    // 2. Execute FIFO calculation
    const result = calculateFIFO(transactions);

    // 3. Update asset aggregate document
    const assetRef = db.collection(`users/${uid}/portfolios/${pid}/assets`).doc(symbol);
    
    if (result.remainingQuantity === 0) {
      // If quantity is zero, we can delete the asset node or write zeroed stats
      await assetRef.delete();
      logger.info(`onTransactionWrite: Asset ${symbol} balance reached 0. Doc deleted.`);
    } else {
      await assetRef.set({
        symbol,
        averagePrice: result.averagePrice,
        quantity: result.remainingQuantity,
        realizedPnL: result.realizedPnL,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      
      logger.info(`onTransactionWrite: Updated portfolio stats for ${symbol}. Qty: ${result.remainingQuantity}, AvgPrice: ${result.averagePrice}`);
    }
  } catch (error: any) {
    logger.error(`onTransactionWrite: FIFO calculation failed or quantity went negative: ${error.message}`);

    // 4. Revert write if calculation failed (e.g., negative balance / insufficient inventory)
    const txDocRef = db.doc(`users/${uid}/portfolios/${pid}/transactions/${txId}`);
    
    if (!dataBefore) {
      // Transaction was newly created -> Delete it
      logger.info(`onTransactionWrite: Reverting new transaction ${txId} (Deleting)`);
      await txDocRef.delete();
    } else {
      // Transaction was updated -> Restore old data
      logger.info(`onTransactionWrite: Reverting transaction update ${txId} (Restoring previous values)`);
      await txDocRef.set(dataBefore);
    }
  }
});
