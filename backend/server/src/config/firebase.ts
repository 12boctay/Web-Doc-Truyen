import admin from 'firebase-admin';
import { env } from './env';

let firebaseApp: admin.app.App | null = null;

export function initFirebase(): void {
  if (firebaseApp) return;

  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
    console.warn('Firebase credentials not configured — image upload disabled');
    return;
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
  });

  console.log('Firebase initialized successfully');
}

export function getFirebaseBucket(): any {
  if (!firebaseApp) return null;
  return admin.storage().bucket();
}
