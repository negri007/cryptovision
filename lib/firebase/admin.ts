import { initializeApp, cert, getApps, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

if (!getApps().length) {
  try {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
    const credentialOpt = serviceAccountStr
      ? cert(JSON.parse(serviceAccountStr))
      : applicationDefault();

    initializeApp({
      credential: credentialOpt,
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

const adminAuth = getAuth();
const adminDb = getFirestore();
const adminStorage = getStorage();

export { adminAuth, adminDb, adminStorage };
