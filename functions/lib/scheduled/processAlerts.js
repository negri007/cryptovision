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
exports.processAlerts = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_1 = require("../firebase");
const sendGrid = __importStar(require("../integrations/sendGrid"));
const telegram = __importStar(require("../integrations/telegram"));
const messaging_1 = require("firebase-admin/messaging");
exports.processAlerts = (0, scheduler_1.onSchedule)({
    schedule: 'every 1 mins',
    timeoutSeconds: 300,
    retryCount: 1
}, async (event) => {
    logger.info('processAlerts: Starting alert checking job');
    const timestamp = Date.now();
    const dateStr = new Date(timestamp).toISOString();
    // Price cache to prevent multiple reads of the same token in this run
    const priceCache = {};
    const getAssetPrice = async (type, symbol) => {
        const cacheKey = `${type}_${symbol.toUpperCase()}`;
        if (priceCache[cacheKey] !== undefined) {
            return priceCache[cacheKey];
        }
        try {
            if (type === 'crypto') {
                const snap = await firebase_1.db.collection('market/crypto/prices').doc(symbol.toUpperCase()).get();
                if (snap.exists) {
                    const val = snap.data()?.price || null;
                    if (val)
                        priceCache[cacheKey] = val;
                    return val;
                }
            }
            else {
                const snap = await firebase_1.db.collection('market/stocks/prices').doc(symbol.toUpperCase()).get();
                if (snap.exists) {
                    const val = snap.data()?.price || null;
                    if (val)
                        priceCache[cacheKey] = val;
                    return val;
                }
            }
        }
        catch (err) {
            logger.error(`processAlerts: Failed to fetch price for ${type} ${symbol}`, { error: err.message });
        }
        return null;
    };
    try {
        // 1. Fetch active alerts across all users
        const alertsSnapshot = await firebase_1.db.collectionGroup('alerts').where('status', '==', 'active').get();
        logger.info(`processAlerts: Found ${alertsSnapshot.docs.length} active alerts`);
        for (const doc of alertsSnapshot.docs) {
            const alert = doc.data();
            const alertId = doc.id;
            // Get UID from document path: users/{uid}/alerts/{alertId}
            const pathParts = doc.ref.path.split('/');
            const uid = pathParts[1];
            const assetType = alert.type || 'crypto'; // 'crypto' | 'stock'
            const symbol = alert.symbol || alert.ticker;
            const targetValue = alert.value || alert.targetPrice;
            const condition = alert.condition; // 'above' | 'below'
            const channels = alert.channels || ['email']; // 'email', 'telegram', 'push'
            if (!symbol || !targetValue || !condition) {
                continue;
            }
            // 2. Fetch current price (never from external API, only Firestore)
            const currentPrice = await getAssetPrice(assetType, symbol);
            if (currentPrice === null)
                continue;
            // 3. Evaluate alert trigger condition
            let isTriggered = false;
            if (condition === 'above' && currentPrice >= targetValue) {
                isTriggered = true;
            }
            else if (condition === 'below' && currentPrice <= targetValue) {
                isTriggered = true;
            }
            if (isTriggered) {
                logger.info(`processAlerts: Alert ${alertId} triggered for user ${uid}. Current price ${currentPrice} is ${condition} target ${targetValue}`);
                // Fetch User profile to get contact details (email, telegram chatId, FCM tokens)
                const userRef = firebase_1.db.collection('users').doc(uid);
                const userSnap = await userRef.get();
                const userData = userSnap.exists ? userSnap.data() : null;
                const userEmail = userData?.email || '';
                const telegramChatId = userData?.preferences?.telegramChatId || userData?.telegramChatId || '';
                const fcmTokens = userData?.fcmTokens || [];
                const notificationResults = {};
                // 4. Dispatch alert through configured channels
                for (const channel of channels) {
                    if (channel === 'email' && userEmail) {
                        const emailSuccess = await sendGrid.sendEmail(userEmail, `Alerta de Preço: ${symbol.toUpperCase()}`, 'd-alert-template-id', // dynamic template id placeholder
                        {
                            symbol: symbol.toUpperCase(),
                            condition: condition === 'above' ? 'subiu acima de' : 'caiu abaixo de',
                            targetValue,
                            currentValue: currentPrice,
                            name: userData?.name || 'Investidor'
                        });
                        notificationResults['email'] = emailSuccess ? 'success' : 'failed';
                    }
                    if (channel === 'telegram' && telegramChatId) {
                        const tgSuccess = await telegram.sendAlertNotification(telegramChatId, alert, currentPrice);
                        notificationResults['telegram'] = tgSuccess ? 'success' : 'failed';
                    }
                    if (channel === 'push' && fcmTokens.length > 0) {
                        try {
                            const message = {
                                notification: {
                                    title: `Alerta de Preço: ${symbol.toUpperCase()}`,
                                    body: `O preço do ${symbol.toUpperCase()} atingiu ${currentPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                                },
                                tokens: fcmTokens
                            };
                            const fcmRes = await (0, messaging_1.getMessaging)().sendEachForMulticast(message);
                            notificationResults['push'] = `success (${fcmRes.successCount} sent, ${fcmRes.failureCount} failed)`;
                        }
                        catch (fcmErr) {
                            logger.error(`processAlerts: Failed to send push for user ${uid}`, { error: fcmErr.message });
                            notificationResults['push'] = `failed: ${fcmErr.message}`;
                        }
                    }
                }
                // 4.1 Update alert status to 'paused' and set lastTriggeredAt
                await doc.ref.set({
                    status: 'paused',
                    lastTriggeredAt: dateStr
                }, { merge: true });
                // 4.2 Create document in users/{uid}/alerts/{alertId}/logs/{logId}
                const logRef = doc.ref.collection('logs').doc();
                await logRef.set({
                    triggeredAt: dateStr,
                    priceAtTrigger: currentPrice,
                    targetValue,
                    condition,
                    notificationResults,
                    createdAt: dateStr
                });
            }
        }
        // 5. Check paused alerts with expired lastTriggeredAt to autoReactivate
        // Let's reactivate alerts that have autoReactivate = true AND lastTriggeredAt older than cooldown (e.g. 1 hour)
        const cooldownPeriod = 1 * 60 * 60 * 1000; // 1 hour cooldown for re-activation
        const cutoffTime = new Date(timestamp - cooldownPeriod).toISOString();
        const pausedAlerts = await firebase_1.db
            .collectionGroup('alerts')
            .where('status', '==', 'paused')
            .where('autoReactivate', '==', true)
            .get();
        logger.info(`processAlerts: Checking ${pausedAlerts.docs.length} paused alerts for re-activation`);
        for (const doc of pausedAlerts.docs) {
            const alert = doc.data();
            if (alert.lastTriggeredAt && alert.lastTriggeredAt < cutoffTime) {
                await doc.ref.set({
                    status: 'active',
                    reactivatedAt: dateStr
                }, { merge: true });
                logger.info(`processAlerts: Reactivated alert ${doc.id} after cooldown elapsed`);
            }
        }
        logger.info('processAlerts: Completed alert checking job successfully');
    }
    catch (error) {
        logger.error('processAlerts: Error processing active user alerts', { error: error.message });
    }
});
//# sourceMappingURL=processAlerts.js.map