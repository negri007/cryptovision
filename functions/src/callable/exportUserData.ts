import zlib from 'zlib';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db, storage } from '../firebase';
import * as sendGrid from '../integrations/sendGrid';

export const exportUserData = onCall({
  timeoutSeconds: 240
}, async (request) => {
  // Verify authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const uid = request.auth.uid;
  logger.info(`exportUserData: Starting LGPD data export for user ${uid}`);

  try {
    // 1. Gather User profile data
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      throw new HttpsError('not-found', 'User record not found.');
    }
    const userData = userSnap.data();

    // 2. Gather Preferences
    const prefSnap = await db.collection(`users/${uid}/preferences`).get();
    const preferences = prefSnap.docs.map(d => d.data());

    // 3. Gather Portfolios & Transactions
    const portfoliosSnap = await db.collection(`users/${uid}/portfolios`).get();
    const portfolios: Record<string, any>[] = [];

    for (const portDoc of portfoliosSnap.docs) {
      const portData = portDoc.data();
      const txSnap = await db.collection(`users/${uid}/portfolios/${portDoc.id}/transactions`).get();
      const transactions = txSnap.docs.map(d => d.data());
      
      portfolios.push({
        id: portDoc.id,
        ...portData,
        transactions
      });
    }

    // 4. Gather Alerts
    const alertsSnap = await db.collection(`users/${uid}/alerts`).get();
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
    const compressedBuffer = zlib.gzipSync(Buffer.from(payloadStr));

    // 5. Save to Firebase Storage exports/{uid}/data_{timestamp}.zip
    const timestamp = Date.now();
    const filename = `exports/${uid}/data_${timestamp}.zip`;
    const bucket = storage.bucket();
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
    } else {
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 48 * 60 * 60 * 1000
      });
      downloadUrl = url;
    }

    // 7. Send email with download URL
    const userEmail = userData?.email || '';
    if (userEmail) {
      await sendGrid.sendEmail(
        userEmail,
        'Sua exportacao de dados pessoais esta pronta (LGPD)',
        'd-data-export-template-id', // template id placeholder
        {
          name: userData?.name || 'Investidor',
          downloadUrl
        }
      );
    }

    logger.info(`exportUserData: Successfully compiled and exported user data. URL: ${downloadUrl}`);
    return {
      success: true,
      downloadUrl
    };
  } catch (error: any) {
    logger.error(`exportUserData: Failed to compile LGPD data package for ${uid}`, { error: error.message });
    throw new HttpsError('internal', error.message || 'An error occurred during data export.');
  }
});
