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
Object.defineProperty(exports, "__esModule", { value: true });
exports.onTransactionWrite = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_1 = require("../firebase");
const fifo_1 = require("../utils/fifo");
exports.onTransactionWrite = (0, firestore_1.onDocumentWritten)({
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
    const txCollectionRef = firebase_1.db.collection(`users/${uid}/portfolios/${pid}/transactions`);
    const txSnapshot = await txCollectionRef.where('symbol', '==', symbol).get();
    const transactions = txSnapshot.docs.map(doc => {
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
        const result = (0, fifo_1.calculateFIFO)(transactions);
        // 3. Update asset aggregate document
        const assetRef = firebase_1.db.collection(`users/${uid}/portfolios/${pid}/assets`).doc(symbol);
        if (result.remainingQuantity === 0) {
            // If quantity is zero, we can delete the asset node or write zeroed stats
            await assetRef.delete();
            logger.info(`onTransactionWrite: Asset ${symbol} balance reached 0. Doc deleted.`);
        }
        else {
            await assetRef.set({
                symbol,
                averagePrice: result.averagePrice,
                quantity: result.remainingQuantity,
                realizedPnL: result.realizedPnL,
                lastUpdated: new Date().toISOString()
            }, { merge: true });
            logger.info(`onTransactionWrite: Updated portfolio stats for ${symbol}. Qty: ${result.remainingQuantity}, AvgPrice: ${result.averagePrice}`);
        }
    }
    catch (error) {
        logger.error(`onTransactionWrite: FIFO calculation failed or quantity went negative: ${error.message}`);
        // 4. Revert write if calculation failed (e.g., negative balance / insufficient inventory)
        const txDocRef = firebase_1.db.doc(`users/${uid}/portfolios/${pid}/transactions/${txId}`);
        if (!dataBefore) {
            // Transaction was newly created -> Delete it
            logger.info(`onTransactionWrite: Reverting new transaction ${txId} (Deleting)`);
            await txDocRef.delete();
        }
        else {
            // Transaction was updated -> Restore old data
            logger.info(`onTransactionWrite: Reverting transaction update ${txId} (Restoring previous values)`);
            await txDocRef.set(dataBefore);
        }
    }
});
//# sourceMappingURL=onTransactionWrite.js.map