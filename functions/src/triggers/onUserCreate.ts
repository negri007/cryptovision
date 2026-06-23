import * as functions from 'firebase-functions/v1';
import * as logger from 'firebase-functions/logger';
import { db, auth } from '../firebase';
import * as sendGrid from '../integrations/sendGrid';

export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const uid = user.uid;
  const email = user.email || '';
  const displayName = user.displayName || 'Investidor';

  logger.info(`onUserCreate: Triggered for user ${uid} (${email})`);

  try {
    const batch = db.batch();

    // 1. Create document users/{uid} in Firestore
    const userRef = db.collection('users').doc(uid);
    batch.set(userRef, {
      uid,
      email,
      name: displayName,
      plan: 'free',
      createdAt: new Date().toISOString()
    });

    // 2. Create preferences in users/{uid}/preferences
    const prefRef = db.collection(`users/${uid}/preferences`).doc('settings');
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
    const portfolioRef = db.collection(`users/${uid}/portfolios`).doc('default');
    batch.set(portfolioRef, {
      name: 'Carteira Principal',
      description: 'Portfólio padrão criado automaticamente.',
      createdAt: new Date().toISOString()
    });

    await batch.commit();
    logger.info(`onUserCreate: Created Firestore collections structure for user ${uid}`);

    // 4. Set custom claims in Auth token
    await auth.setCustomUserClaims(uid, { plan: 'free', role: 'user' });
    logger.info(`onUserCreate: Custom claims { plan: 'free', role: 'user' } set for user ${uid}`);

    // 5. Send welcome email via SendGrid
    if (email) {
      await sendGrid.sendEmail(
        email,
        'Bem-vindo ao CryptoVision!',
        'd-welcome-template-id', // template id placeholder
        {
          name: displayName
        }
      );
    }
  } catch (error: any) {
    logger.error(`onUserCreate: Error during user initialization for ${uid}`, { error: error.message });
  }
});
