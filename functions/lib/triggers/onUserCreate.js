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
exports.onUserCreate = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const logger = __importStar(require("firebase-functions/logger"));
const firebase_1 = require("../firebase");
const sendGrid = __importStar(require("../integrations/sendGrid"));
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
    const uid = user.uid;
    const email = user.email || '';
    const displayName = user.displayName || 'Investidor';
    logger.info(`onUserCreate: Triggered for user ${uid} (${email})`);
    try {
        const batch = firebase_1.db.batch();
        // 1. Create document users/{uid} in Firestore
        const userRef = firebase_1.db.collection('users').doc(uid);
        batch.set(userRef, {
            uid,
            email,
            name: displayName,
            plan: 'free',
            createdAt: new Date().toISOString()
        });
        // 2. Create preferences in users/{uid}/preferences
        const prefRef = firebase_1.db.collection(`users/${uid}/preferences`).doc('settings');
        batch.set(prefRef, {
            currency: 'BRL',
            timezone: 'America/Sao_Paulo',
            theme: 'dark',
            telegramChatId: '',
            notifications: {
                email: true,
                push: true,
                telegram: false
            },
            updatedAt: new Date().toISOString()
        });
        // 3. Create default portfolio in users/{uid}/portfolios/default
        const portfolioRef = firebase_1.db.collection(`users/${uid}/portfolios`).doc('default');
        batch.set(portfolioRef, {
            name: 'Carteira Principal',
            description: 'Portfólio padrão criado automaticamente.',
            createdAt: new Date().toISOString()
        });
        await batch.commit();
        logger.info(`onUserCreate: Created Firestore collections structure for user ${uid}`);
        // 4. Set custom claims in Auth token
        await firebase_1.auth.setCustomUserClaims(uid, { plan: 'free', role: 'user' });
        logger.info(`onUserCreate: Custom claims { plan: 'free', role: 'user' } set for user ${uid}`);
        // 5. Send welcome email via SendGrid
        if (email) {
            await sendGrid.sendEmail(email, 'Bem-vindo ao CryptoVision!', 'd-welcome-template-id', // template id placeholder
            {
                name: displayName
            });
        }
    }
    catch (error) {
        logger.error(`onUserCreate: Error during user initialization for ${uid}`, { error: error.message });
    }
});
//# sourceMappingURL=onUserCreate.js.map