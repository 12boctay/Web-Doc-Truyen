import admin from 'firebase-admin';
import { config } from '../config.js';

let firebaseApp: admin.app.App | null = null;

function initFirebase(): void {
  if (firebaseApp) return;

  if (!config.FIREBASE_PROJECT_ID || !config.FIREBASE_CLIENT_EMAIL || !config.FIREBASE_PRIVATE_KEY) {
    console.warn('Firebase credentials not configured — image upload disabled');
    return;
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.FIREBASE_PROJECT_ID,
      clientEmail: config.FIREBASE_CLIENT_EMAIL,
      privateKey: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    storageBucket: config.FIREBASE_STORAGE_BUCKET,
  });

  console.log('Firebase initialized for crawler');
}

export async function uploadImage(buffer: Buffer, path: string): Promise<string> {
  initFirebase();

  if (!firebaseApp) {
    throw new Error('Firebase not initialized');
  }

  const bucket = admin.storage().bucket();
  const file = bucket.file(path);

  await file.save(buffer, {
    metadata: {
      contentType: 'image/jpeg',
      cacheControl: 'public, max-age=31536000',
    },
  });

  await file.makePublic();

  return `https://storage.googleapis.com/${bucket.name}/${path}`;
}
