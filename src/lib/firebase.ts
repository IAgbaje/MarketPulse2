/// <reference types="vite/client" />
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, type Firestore } from 'firebase/firestore';

interface FirebaseAppletConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  measurementId?: string;
}

// Load local firebase-applet-config.json when present (in AI Studio), without failing build if gitignored in external repos
const localConfigs = import.meta.glob<{ default: FirebaseAppletConfig }>('../../firebase-applet-config.json', {
  eager: true,
});
const localConfig = localConfigs['../../firebase-applet-config.json']?.default;

const firebaseConfig: FirebaseAppletConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || localConfig?.apiKey || '').trim(),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || localConfig?.projectId || '').trim(),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID || localConfig?.appId || '').trim(),
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localConfig?.authDomain || '').trim(),
  firestoreDatabaseId:
    (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || localConfig?.firestoreDatabaseId || '(default)').trim(),
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || localConfig?.storageBucket || '').trim(),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localConfig?.messagingSenderId || '').trim(),
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;
let googleProviderInstance: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    appInstance = initializeApp(firebaseConfig);
    dbInstance = getFirestore(appInstance, firebaseConfig.firestoreDatabaseId);
    authInstance = getAuth(appInstance);
    googleProviderInstance = new GoogleAuthProvider();
  } catch (error) {
    console.warn('Firebase initialization skipped; running in offline-first local mode.', error);
    appInstance = null;
    dbInstance = null;
    authInstance = null;
    googleProviderInstance = null;
  }
}

export const db: Firestore | null = dbInstance;
export const auth: Auth | null = authInstance;
export const googleProvider: GoogleAuthProvider | null = googleProviderInstance;

// Verbatim blueprint constraints for validation synchronicity
export const BLUEPRINT_CONSTRAINTS = {
  ID_PATTERN: /^[a-zA-Z0-9_\-]+$/,
  ID_MAX_LEN: 128,
  NAME_MAX_LEN: 100,
  HOUSEHOLD_MAX_LEN: 100,
  LOCATION_MAX_LEN: 100,
  REGION_ID_MAX_LEN: 50,
  AVATAR_INITIALS_MAX_LEN: 10,
  SYNC_STATE_MAX_LEN: 20,
  EMAIL_MAX_LEN: 150,
  PHONE_MAX_LEN: 50,
  CONTACT_MAX_LEN: 150,
  MARKET_MAX_LEN: 100,
  DATE_MAX_LEN: 50,
  ITEM_NAME_MAX_LEN: 120,
  CATEGORY_MAX_LEN: 40,
  UNIT_MAX_LEN: 30,
  UNIT_DETAIL_MAX_LEN: 60,
  ANNOTATION_TYPE_MAX_LEN: 20,
  ANNOTATION_TEXT_MAX_LEN: 200,
} as const;

export function sanitizeString(val: string | undefined | null, maxLen: number, fallback = ''): string {
  const trimmed = (val ?? '').trim();
  const safe = trimmed.length > 0 ? trimmed : fallback;
  return safe.slice(0, maxLen);
}

export function sanitizeId(val: string): string {
  const cleaned = val.replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, BLUEPRINT_CONSTRAINTS.ID_MAX_LEN);
  return cleaned || `id-${Date.now()}`;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentUser = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

if (db) {
  testConnection();
}
