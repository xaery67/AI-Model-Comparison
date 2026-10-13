import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  signInAnonymously
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

// Test connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Error handler adhering strictly to FirestoreErrorInfo requirement
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
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

// Data Interfaces
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'member' | 'admin';
  status: 'active' | 'suspended';
  evalCount?: number;
  createdAt?: any;
}

export interface UserEval {
  id: string;
  ownerId: string;
  modelName: string;
  benchmarkCategory: 'Coding' | 'Reasoning' | 'Agentic' | 'Multimodal' | 'General' | 'Custom';
  benchmarkName: string;
  score: number;
  promptSample?: string;
  responseSnippet?: string;
  latencyMs?: number;
  tokenCost?: number;
  privateNotes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface SystemContent {
  id: string;
  type: 'announcement' | 'featured_model' | 'category_spotlight';
  title: string;
  body: string;
  targetModel?: string;
  isPublished: boolean;
  updatedBy?: string;
  updatedAt?: any;
}

const BOOTSTRAP_ADMIN_EMAIL = 'adifery80@gmail.com';

// Auth Actions
export async function loginWithGoogle(): Promise<UserProfile | null> {
  const provider = new GoogleAuthProvider();
  try {
    const cred = await signInWithPopup(auth, provider);
    return await syncUserProfile(cred.user);
  } catch (err) {
    console.warn('Google Popup sign-in error or cancelled:', err);
    throw err;
  }
}

export async function loginAsGuestDemo(role: 'member' | 'admin' = 'member'): Promise<UserProfile> {
  // Useful for preview iframe environments where third party popups might be blocked
  const cred = await signInAnonymously(auth);
  const isTargetAdmin = role === 'admin';
  const profile: UserProfile = {
    uid: cred.user.uid,
    email: isTargetAdmin ? BOOTSTRAP_ADMIN_EMAIL : `guest_${cred.user.uid.slice(0, 5)}@benchpulse.ai`,
    displayName: isTargetAdmin ? 'Admin Lead (Demo)' : `Researcher_${cred.user.uid.slice(0, 4)}`,
    role: isTargetAdmin ? 'admin' : 'member',
    status: 'active',
    evalCount: 0,
    createdAt: serverTimestamp(),
  };

  const path = `users/${cred.user.uid}`;
  try {
    await setDoc(doc(db, 'users', cred.user.uid), profile, { merge: true });
    if (isTargetAdmin) {
      await setDoc(doc(db, 'admins', cred.user.uid), {
        uid: cred.user.uid,
        email: profile.email,
        assignedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
  return profile;
}

export async function logoutUser() {
  await fbSignOut(auth);
}

// Sync user profile in Firestore
export async function syncUserProfile(user: FirebaseUser): Promise<UserProfile> {
  const path = `users/${user.uid}`;
  const isAdminEmail = user.email === BOOTSTRAP_ADMIN_EMAIL;

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userDocRef);

    let profile: UserProfile;

    if (!snap.exists()) {
      profile = {
        uid: user.uid,
        email: user.email || 'user@benchpulse.ai',
        displayName: user.displayName || 'AI Researcher',
        photoURL: user.photoURL || '',
        role: isAdminEmail ? 'admin' : 'member',
        status: 'active',
        evalCount: 0,
        createdAt: serverTimestamp(),
      };
      await setDoc(userDocRef, profile);

      if (isAdminEmail) {
        await setDoc(doc(db, 'admins', user.uid), {
          uid: user.uid,
          email: user.email,
          assignedAt: serverTimestamp(),
        });
      }
    } else {
      profile = snap.data() as UserProfile;
      // Auto elevate bootstrap admin email if needed
      if (isAdminEmail && profile.role !== 'admin') {
        profile.role = 'admin';
        await updateDoc(userDocRef, { role: 'admin' });
        await setDoc(doc(db, 'admins', user.uid), {
          uid: user.uid,
          email: user.email,
          assignedAt: serverTimestamp(),
        });
      }
    }
    return profile;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    throw err;
  }
}
