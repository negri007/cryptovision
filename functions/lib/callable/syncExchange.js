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
exports.syncExchange = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_1 = require("../firebase");
const exchangeFactory_1 = require("../integrations/exchangeFactory");
// Reuse local secret resolver from connection trigger
async function getSecret(secretRef) {
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
    if (!payload)
        throw new Error('Secret payload is empty');
    return JSON.parse(payload);
}
exports.syncExchange = (0, https_1.onCall)({
    timeoutSeconds: 120
}, async (request) => {
    // 1. Verify authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = request.auth.uid;
    const connectionId = request.data.connectionId;
    const portfolioId = request.data.portfolioId || 'default';
    if (!connectionId) {
        throw new https_1.HttpsError('invalid-argument', 'The function must be called with a connectionId.');
    }
    logger.info(`syncExchange: Starting sync for connection ${connectionId} for user ${uid}`);
    try {
        // Verify ownership of the connection
        const connRef = firebase_1.db.doc(`users/${uid}/exchangeConnections/${connectionId}`);
        const connSnap = await connRef.get();
        if (!connSnap.exists) {
            throw new https_1.HttpsError('not-found', 'Exchange connection not found or user does not own it.');
        }
        const connData = connSnap.data();
        const exchangeName = connData.exchange;
        const secretRef = connData.secretManagerRef;
        const lastSyncAt = connData.lastSyncAt ? new Date(connData.lastSyncAt).getTime() : undefined;
        if (!exchangeName || !secretRef) {
            throw new https_1.HttpsError('failed-precondition', 'Exchange details or secret manager references are missing.');
        }
        // 2. Retrieve credentials
        const { apiKey, apiSecret } = await getSecret(secretRef);
        // 3. Instantiate client
        const client = (0, exchangeFactory_1.makeExchangeClient)(exchangeName, apiKey, apiSecret);
        // 4. Fetch transactions since lastSyncAt
        logger.info(`syncExchange: Fetching transactions for ${exchangeName} since ${lastSyncAt || 'beginning'}`);
        const transactions = await client.getTransactionHistory(undefined, lastSyncAt);
        // 5. Insert new transactions (recalculates FIFO automatically in Firestore trigger)
        const batch = firebase_1.db.batch();
        for (const tx of transactions) {
            const txDocRef = firebase_1.db.collection(`users/${uid}/portfolios/${portfolioId}/transactions`).doc();
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
    }
    catch (error) {
        logger.error(`syncExchange: Manual sync failed for connection ${connectionId}`, { error: error.message });
        throw new https_1.HttpsError('internal', error.message || 'An error occurred during synchronization.');
    }
});
//# sourceMappingURL=syncExchange.js.map