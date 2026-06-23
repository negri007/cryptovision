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
exports.generateTaxReport = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const firebase_1 = require("../firebase");
const sendGrid = __importStar(require("../integrations/sendGrid"));
exports.generateTaxReport = (0, https_1.onCall)({
    timeoutSeconds: 240
}, async (request) => {
    // Verify authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = request.auth.uid;
    const portfolioId = request.data.portfolioId || 'default';
    const year = request.data.year;
    if (!year) {
        throw new https_1.HttpsError('invalid-argument', 'The function must be called with a target year.');
    }
    logger.info(`generateTaxReport: Generating report for user ${uid}, year ${year}`);
    try {
        // 1. Verify subscription tier (Requires Pro or Premium plan)
        // We check custom claims plan or Firestore users/{uid} node
        const userRef = firebase_1.db.collection('users').doc(uid);
        const userSnap = await userRef.get();
        const plan = userSnap.data()?.plan || 'free';
        if (plan === 'free') {
            throw new https_1.HttpsError('permission-denied', 'PLAN_LIMIT_REACHED: Tax reports are only available for Pro and Premium plans.');
        }
        // 2. Fetch all sell transactions of the target year
        const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`).getTime();
        const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`).getTime();
        const txSnap = await firebase_1.db
            .collection(`users/${uid}/portfolios/${portfolioId}/transactions`)
            .where('executedAt', '>=', startOfYear)
            .where('executedAt', '<=', endOfYear)
            .get();
        const transactions = txSnap.docs.map(doc => {
            const d = doc.data();
            return {
                symbol: d.symbol || 'BTC',
                type: d.type,
                quantity: parseFloat(d.quantity),
                price: parseFloat(d.price),
                executedAt: d.executedAt
            };
        });
        const sells = transactions.filter(t => t.type === 'sell');
        if (sells.length === 0) {
            throw new https_1.HttpsError('not-found', `No sales transactions found for the year ${year}.`);
        }
        // 3. Apply Receita Federal rules (Section 4 from REFERENCIA.md)
        // Check monthly sales limits (35.000 BRL limit for tax exemption on assets)
        const monthlySalesBRL = {};
        for (let m = 0; m < 12; m++)
            monthlySalesBRL[m] = 0;
        sells.forEach(tx => {
            const date = new Date(tx.executedAt);
            const month = date.getMonth();
            const valueBRL = tx.quantity * tx.price; // assuming price is BRL
            monthlySalesBRL[month] += valueBRL;
        });
        // 4. Generate CSV file content
        let csvContent = 'Data,Ativo,Tipo,Quantidade,Preco Unitario,Valor Total BRL,Status Isencao (Limite 35k)\n';
        sells.forEach(tx => {
            const dateStr = new Date(tx.executedAt).toLocaleDateString('pt-BR');
            const valBRL = tx.quantity * tx.price;
            const month = new Date(tx.executedAt).getMonth();
            const isExempt = monthlySalesBRL[month] <= 35000 ? 'Isento' : 'Tributavel';
            csvContent += `${dateStr},${tx.symbol},${tx.type},${tx.quantity},${tx.price},${valBRL.toFixed(2)},${isExempt}\n`;
        });
        // Monthly summary section
        csvContent += '\nResumo Mensal de Vendas:\n';
        csvContent += 'Mes,Volume de Vendas BRL,Status de Tributacao\n';
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        for (let m = 0; m < 12; m++) {
            const totalVol = monthlySalesBRL[m];
            const status = totalVol > 35000 ? 'SUJEITO A DARF (15%)' : 'ISENTO';
            csvContent += `${monthNames[m]},${totalVol.toFixed(2)},${status}\n`;
        }
        // 5. Save to Firebase Storage tax-reports/{uid}/{year}_{timestamp}.csv
        const reportId = firebase_1.db.collection('dummy').doc().id; // generate unique ID
        const filename = `tax-reports/${uid}/${year}_${Date.now()}.csv`;
        const bucket = firebase_1.storage.bucket();
        const file = bucket.file(filename);
        await file.save(csvContent, {
            contentType: 'text/csv',
            metadata: {
                metadata: {
                    owner: uid,
                    reportId
                }
            }
        });
        // 6. Create signed URL valid for 48h
        let downloadUrl = '';
        if (process.env.FUNCTIONS_EMULATOR === 'true') {
            logger.info('generateTaxReport: Running in Emulator. Generating local download placeholder URL.');
            downloadUrl = `http://localhost:9199/download/${filename}`;
        }
        else {
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + 48 * 60 * 60 * 1000 // 48 hours
            });
            downloadUrl = url;
        }
        // 7. Save report metadata to users/{uid}/taxReports/{reportId}
        const reportRef = firebase_1.db.collection(`users/${uid}/taxReports`).doc(reportId);
        await reportRef.set({
            id: reportId,
            year,
            filename,
            storageUrl: downloadUrl,
            status: 'ready',
            createdAt: new Date().toISOString()
        });
        // 8. Send Email notification via SendGrid
        const userEmail = userSnap.data()?.email || '';
        if (userEmail) {
            await sendGrid.sendEmail(userEmail, `Seu Relatorio de Impostos de ${year} esta pronto!`, 'd-tax-report-ready-template-id', // template id placeholder
            {
                year,
                downloadUrl,
                name: userSnap.data()?.name || 'Investidor'
            });
        }
        logger.info(`generateTaxReport: Completed report generation successfully. URL: ${downloadUrl}`);
        return {
            success: true,
            reportId,
            downloadUrl
        };
    }
    catch (error) {
        logger.error('generateTaxReport: General failure generating tax report', { error: error.message });
        throw new https_1.HttpsError('internal', error.message || 'Error occurred generating report.');
    }
});
//# sourceMappingURL=generateTaxReport.js.map