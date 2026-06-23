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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportUserData = void 0;
const zlib_1 = __importDefault(require("zlib"));
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_1 = require("../firebase");
const sendGrid = __importStar(require("../integrations/sendGrid"));
exports.exportUserData = (0, https_1.onCall)({
    timeoutSeconds: 240
}, async (request) => {
    // Verify authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = request.auth.uid;
    logger.info(`exportUserData: Starting LGPD data export for user ${uid}`);
    try {
        // 1. Gather User profile data
        const userRef = firebase_1.db.collection('users').doc(uid);
        const userSnap = await userRef.get();
        if (!userSnap.exists) {
            throw new https_1.HttpsError('not-found', 'User record not found.');
        }
        const userData = userSnap.data();
        // 2. Gather Preferences
        const prefSnap = await firebase_1.db.collection(`users/${uid}/preferences`).get();
        const preferences = prefSnap.docs.map(d => d.data());
        // 3. Gather Portfolios & Transactions
        const portfoliosSnap = await firebase_1.db.collection(`users/${uid}/portfolios`).get();
        const portfolios = [];
        for (const portDoc of portfoliosSnap.docs) {
            const portData = portDoc.data();
            const txSnap = await firebase_1.db.collection(`users/${uid}/portfolios/${portDoc.id}/transactions`).get();
            const transactions = txSnap.docs.map(d => d.data());
            portfolios.push({
                id: portDoc.id,
                ...portData,
                transactions
            });
        }
        // 4. Gather Alerts
        const alertsSnap = await firebase_1.db.collection(`users/${uid}/alerts`).get();
        const alerts = alertsSnap.docs.map(d => d.data());
        // Compile LGPD payload
        const exportPayload = {
            uid,
            profile: userData,
            preferences,
            portfolios,
            alerts,
            exportedAt: new Date().toISOString()
        };
        // Compress using built-in zlib to create a gzip archive
        const payloadStr = JSON.stringify(exportPayload, null, 2);
        const compressedBuffer = zlib_1.default.gzipSync(Buffer.from(payloadStr));
        // 5. Save to Firebase Storage exports/{uid}/data_{timestamp}.zip
        const timestamp = Date.now();
        const filename = `exports/${uid}/data_${timestamp}.zip`;
        const bucket = firebase_1.storage.bucket();
        const file = bucket.file(filename);
        await file.save(compressedBuffer, {
            contentType: 'application/zip', // Using zip content type as required
            metadata: {
                metadata: {
                    owner: uid
                }
            }
        });
        // 6. Create signed URL valid for 48h
        let downloadUrl = '';
        if (process.env.FUNCTIONS_EMULATOR === 'true') {
            downloadUrl = `http://localhost:9199/download/${filename}`;
        }
        else {
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + 48 * 60 * 60 * 1000
            });
            downloadUrl = url;
        }
        // 7. Send email with download URL
        const userEmail = userData?.email || '';
        if (userEmail) {
            await sendGrid.sendEmail(userEmail, 'Sua exportacao de dados pessoais esta pronta (LGPD)', 'd-data-export-template-id', // template id placeholder
            {
                name: userData?.name || 'Investidor',
                downloadUrl
            });
        }
        logger.info(`exportUserData: Successfully compiled and exported user data. URL: ${downloadUrl}`);
        return {
            success: true,
            downloadUrl
        };
    }
    catch (error) {
        logger.error(`exportUserData: Failed to compile LGPD data package for ${uid}`, { error: error.message });
        throw new https_1.HttpsError('internal', error.message || 'An error occurred during data export.');
    }
});
//# sourceMappingURL=exportUserData.js.map