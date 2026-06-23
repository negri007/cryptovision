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
exports.onExchangeConnect = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_1 = require("../firebase");
const exchangeFactory_1 = require("../integrations/exchangeFactory");
// Secret Manager Client (lazy initialized to prevent crashes in environments where it's not configured)
let secretClient = null;
async function getSecret(secretRef) {
    // If running in emulator or ref is a mock path, return mocks
    if (process.env.FUNCTIONS_EMULATOR === 'true' || secretRef.includes('mock') || !secretRef.startsWith('projects/')) {
        logger.info('SecretManager: Running in Mock Mode or ref is local. Returning mock credentials.');
        return {
            apiKey: 'mock-api-key',
            apiSecret: 'mock-api-secret'
        };
    }
    try {
        const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
        if (!secretClient) {
            secretClient = new SecretManagerServiceClient();
        }
        const [version] = await secretClient.accessSecretVersion({ name: secretRef });
        const payload = version.payload?.data?.toString();
        if (!payload)
            throw new Error('Secret payload is empty');
        // Expecting JSON string: { "apiKey": "...", "apiSecret": "..." }
        return JSON.parse(payload);
    }
    catch (err) {
        logger.error(`SecretManager: Failed to access secret version: ${secretRef}`, { error: err.message });
        throw err;
    }
}
exports.onExchangeConnect = (0, firestore_1.onDocumentCreated)({
    document: 'users/{uid}/exchangeConnections/{connId}',
    timeoutSeconds: 120
}, async (event) => {
    const params = event.params;
    const uid = params.uid;
    const connId = params.connId;
    logger.info(`onExchangeConnect: Processing connection ${connId} for user ${uid}`);
    const snap = event.data;
    if (!snap)
        return;
    const connData = snap.data();
    const exchangeName = connData.exchange;
    const secretRef = connData.secretManagerRef;
    const portfolioId = connData.portfolioId || 'default';
    if (!exchangeName || !secretRef) {
        logger.error('onExchangeConnect: Missing exchange name or secret reference');
        await snap.ref.set({
            status: 'error',
            errorMessage: 'Missing exchange name or secret reference'
        }, { merge: true });
        return;
    }
    try {
        // 1 & 2. Get API credentials from Secret Manager
        const { apiKey, apiSecret } = await getSecret(secretRef);
        // 3. Instantiate exchange client
        const client = (0, exchangeFactory_1.makeExchangeClient)(exchangeName, apiKey, apiSecret);
        // 4. Validate that the API key is valid (and ideally read-only)
        const isValid = await client.validateApiKey();
        if (!isValid) {
            // 5. If invalid: update status to error
            await snap.ref.set({
                status: 'error',
                errorMessage: 'Invalid API Key or insufficient permissions (must be Read-Only, no withdrawal or trade allowed).'
            }, { merge: true });
            return;
        }
        // 6. If valid: fetch transaction history and populate portfolio
        logger.info(`onExchangeConnect: API Key verified. Fetching transaction history for ${exchangeName}`);
        const transactions = await client.getTransactionHistory();
        const batch = firebase_1.db.batch();
        for (const tx of transactions) {
            const txDocRef = firebase_1.db.collection(`users/${uid}/portfolios/${portfolioId}/transactions`).doc();
            batch.set(txDocRef, {
                symbol: tx.id ? 'BTC' : 'BTC', // For mock integrations it defaults to BTC
                type: tx.type,
                quantity: tx.quantity,
                price: tx.price,
                executedAt: tx.executedAt,
                source: `exchange_sync_${exchangeName}`,
                createdAt: new Date().toISOString()
            });
        }
        // Update connection status
        batch.set(snap.ref, {
            status: 'active',
            lastSyncAt: new Date().toISOString(),
            errorMessage: null
        }, { merge: true });
        await batch.commit();
        logger.info(`onExchangeConnect: Successfully connected ${exchangeName} and synced ${transactions.length} orders`);
    }
    catch (error) {
        logger.error(`onExchangeConnect: Failed to sync connection ${connId}`, { error: error.message });
        await snap.ref.set({
            status: 'error',
            errorMessage: `Sync failed: ${error.message}`
        }, { merge: true });
    }
});
//# sourceMappingURL=onExchangeConnect.js.map