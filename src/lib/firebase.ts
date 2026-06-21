import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, User as FirebaseUser } from "firebase/auth";
import { 
  getFirestore,
  initializeFirestore,
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDocFromServer,
  query, 
  where, 
  orderBy, 
  addDoc,
  serverTimestamp,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import firebaseConfig from "../../firebase-applet-config.json";

// Operation types for the specific Firestore Error context formatting
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
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

// Check if actual configuration exists
export const isFirebaseEnabled = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

let app;
let db: any = null;
let auth: any = null;
let functions: any = null;

if (isFirebaseEnabled) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    try {
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
        experimentalLongPollingOptions: {
          useFetchStreams: false,
        } as any,
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      } as any, (firebaseConfig as any).firestoreDatabaseId || undefined);
    } catch (e: any) {
      db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || undefined);
    }
    auth = getAuth(app);
    functions = getFunctions(app);

    // Validate connection to Firestore as required by Skill
    const testConnection = async () => {
      try {
        // Querying a publicly readable collection path ensures valid connection detection without breaking security rules
        await getDocFromServer(doc(db, "reviews", "connection_test"));
      } catch (error) {
        console.warn("Firestore warm-up check: Backend connection is resolving. Operating resiliently in local offline-first/cache mode until sync succeeds.", error);
      }
    };
    testConnection();
  } catch (err) {
    console.error("Failed to initialize Firebase:", err);
  }
}

export { db, auth, functions };

// Structured Firestore error handler conforming to skill requirements
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuth = auth;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.currentUser?.uid || null,
      email: currentAuth?.currentUser?.email || null,
      emailVerified: currentAuth?.currentUser?.emailVerified || null,
      isAnonymous: currentAuth?.currentUser?.isAnonymous || null,
      tenantId: currentAuth?.currentUser?.tenantId || null,
      providerInfo: currentAuth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Auth operations
export async function signInWithGoogle() {
  if (!isFirebaseEnabled || !auth) {
    throw new Error("Firebase database auth features are currently in setup mode.");
  }
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google authentication error:", error);
    throw error;
  }
}

// Profile profile Sync
export async function saveUserProfile(user: FirebaseUser, preferences?: { favoriteCategory?: string; newsletterSubscribed?: boolean }) {
  if (!isFirebaseEnabled || !db) return;
  const path = `users/${user.uid}`;
  try {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      displayName: user.displayName || "Explorer",
      email: user.email,
      photoURL: user.photoURL || "",
      preferences: preferences || { favoriteCategory: "", newsletterSubscribed: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Ensure we register the client in the specified format
    const name = user.displayName || "Explorer";
    const email = user.email || "";
    const phone = user.phoneNumber || "";

    const clientRef = doc(db, "clients", user.uid);
    const clientSnap = await getDocFromServer(clientRef).catch(() => null);
    if (!clientSnap || !clientSnap.exists()) {
      await setDoc(clientRef, {
        name,
        email,
        phone,
        createdAt: serverTimestamp(),
        totalBookings: 0,
        totalSpent: 0
      });

      // Background trigger of welcome email Firebase Function when someone registers
      try {
        if (functions) {
          const sendWelcomeEmailCallable = httpsCallable(functions, "sendWelcomeEmail");
          await sendWelcomeEmailCallable({ email, name });
          console.log("Automatically triggered Firebase Function welcome email for:", email);
        }
      } catch (fErr) {
        console.warn("Background trigger of welcome email function failed (this is normal if Cloud Function 'sendWelcomeEmail' is not deployed in your specific Firebase environment):", fErr);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Global invocation helper for the 'Send Welcome Email' manual trigger button
export async function triggerWelcomeEmail(email: string, name: string): Promise<{ success: boolean; message: string }> {
  if (!isFirebaseEnabled || !functions) {
    throw new Error("Firebase Functions are currently offline or in local setup mode.");
  }
  try {
    const sendWelcomeEmailCallable = httpsCallable(functions, "sendWelcomeEmail");
    const res = await sendWelcomeEmailCallable({ email, name });
    const data = res.data as any;
    return {
      success: true,
      message: data?.message || `Welcome email function triggered successfully for ${name} (${email})!`
    };
  } catch (error: any) {
    console.error("Failed to trigger welcome email function:", error);
    throw new Error(error?.message || "Cloud Function execution returned an error.");
  }
}
