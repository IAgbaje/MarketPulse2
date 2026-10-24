import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
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
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

testConnection();
