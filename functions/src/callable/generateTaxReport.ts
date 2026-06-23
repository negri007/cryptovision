import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db, storage } from '../firebase';
import * as sendGrid from '../integrations/sendGrid';

export const generateTaxReport = onCall({
  timeoutSeconds: 240
}, async (request) => {
  // Verify authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const uid = request.auth.uid;
  const portfolioId = request.data.portfolioId || 'default';
  const year = request.data.year;

  if (!year) {
    throw new HttpsError('invalid-argument', 'The function must be called with a target year.');
  }

  logger.info(`generateTaxReport: Generating report for user ${uid}, year ${year}`);

  try {
    // 1. Verify subscription tier (Requires Pro or Premium plan)
    // We check custom claims plan or Firestore users/{uid} node
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    const plan = userSnap.data()?.plan || 'free';

    if (plan === 'free') {
      throw new HttpsError(
        'permission-denied', 
        'PLAN_LIMIT_REACHED: Tax reports are only available for Pro and Premium plans.'
      );
    }

    // 2. Fetch all sell transactions of the target year
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`).getTime();
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`).getTime();

    const txSnap = await db
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
      throw new HttpsError('not-found', `No sales transactions found for the year ${year}.`);
    }

    // 3. Apply Receita Federal rules (Section 4 from REFERENCIA.md)
    // Check monthly sales limits (35.000 BRL limit for tax exemption on assets)
    const monthlySalesBRL: Record<number, number> = {};
    for (let m = 0; m < 12; m++) monthlySalesBRL[m] = 0;

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
    const reportId = db.collection('dummy').doc().id; // generate unique ID
    const filename = `tax-reports/${uid}/${year}_${Date.now()}.csv`;
    const bucket = storage.bucket();
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
    } else {
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 48 * 60 * 60 * 1000 // 48 hours
      });
      downloadUrl = url;
    }

    // 7. Save report metadata to users/{uid}/taxReports/{reportId}
    const reportRef = db.collection(`users/${uid}/taxReports`).doc(reportId);
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
      await sendGrid.sendEmail(
        userEmail,
        `Seu Relatorio de Impostos de ${year} esta pronto!`,
        'd-tax-report-ready-template-id', // template id placeholder
        {
          year,
          downloadUrl,
          name: userSnap.data()?.name || 'Investidor'
        }
      );
    }

    logger.info(`generateTaxReport: Completed report generation successfully. URL: ${downloadUrl}`);
    return {
      success: true,
      reportId,
      downloadUrl
    };
  } catch (error: any) {
    logger.error('generateTaxReport: General failure generating tax report', { error: error.message });
    throw new HttpsError('internal', error.message || 'Error occurred generating report.');
  }
});
