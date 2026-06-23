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
exports.fetchOnChain = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_1 = require("../firebase");
const glassnode = __importStar(require("../integrations/glassnode"));
exports.fetchOnChain = (0, scheduler_1.onSchedule)({
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
    const syncMetric = async (asset, metricName, path) => {
        try {
            const dataPoints = await glassnode.getMetric(asset, path);
            const batch = firebase_1.db.batch();
            for (const dp of dataPoints) {
                // Data timestamp is in seconds, convert to ms
                const msTimestamp = dp.t * 1000;
                const docRef = firebase_1.db
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
        }
        catch (err) {
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
//# sourceMappingURL=fetchOnChain.js.map