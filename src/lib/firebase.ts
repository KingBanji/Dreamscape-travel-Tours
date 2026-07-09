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
  persistentMultipleTabManager,
  setLogLevel
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
    setLogLevel("silent");
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

    // Dynamically and safely check for browser storage availability to prevent SecurityError inside sandbox iframes
    let isStorageAccessBlocked = false;
    try {
      if (typeof window !== "undefined") {
        // Simple synchronous check for localStorage availability
        localStorage.setItem("__test_storage_access__", "1");
        localStorage.removeItem("__test_storage_access__");
        
        // Ensure indexedDB is present and properties are accessible
        if (!window.indexedDB) {
          isStorageAccessBlocked = true;
        }
      } else {
        isStorageAccessBlocked = true;
      }
    } catch (e) {
      isStorageAccessBlocked = true;
    }

    const firestoreSettings: any = {
      experimentalForceLongPolling: true,
      experimentalLongPollingOptions: {
        useFetchStreams: false,
      },
    };

    if (!isStorageAccessBlocked) {
      try {
        const isIframe = typeof window !== "undefined" && window.self !== window.top;
        if (isIframe) {
          // Inside preview/sandbox iframes, avoid persistentMultipleTabManager to prevent lock failures and BroadcastChannel blockages
          firestoreSettings.localCache = persistentLocalCache({});
        } else {
          firestoreSettings.localCache = persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          });
        }
      } catch (cacheErr) {
        console.warn("Firestore: Failed to prepare persistent local cache config, falling back to default cache.", cacheErr);
      }
    }

    try {
      db = initializeFirestore(app, firestoreSettings, (firebaseConfig as any).firestoreDatabaseId || undefined);
    } catch (e: any) {
      console.warn("Failed to initialize Firestore with customized settings, retrying with minimal long polling settings:", e);
      try {
        db = initializeFirestore(app, {
          experimentalForceLongPolling: true,
          experimentalLongPollingOptions: {
            useFetchStreams: false,
          },
        } as any, (firebaseConfig as any).firestoreDatabaseId || undefined);
      } catch (innerErr: any) {
        console.error("Critical: Could not initialize Firestore even with minimal settings:", innerErr);
        db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || undefined);
      }
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
  const errMessage = error instanceof Error ? error.message : String(error);
  const errCode = error && typeof error === "object" && "code" in error ? (error as any).code : "";
  
  const isPermissionError = 
    errCode === "permission-denied" || 
    errMessage.toLowerCase().includes("permission") || 
    errMessage.toLowerCase().includes("insufficient");

  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
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

  if (isPermissionError) {
    console.error("Firestore Permission Error: ", JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  } else {
    // Non-permission error (e.g. timeout, offline state, connection refused).
    // Conforming to offline-first/resilience principles: log a warning but don't crash/throw.
    console.warn("Firestore Non-Fatal Connection/Sync Notice (Operating in offline mode):", errMessage, "Details:", JSON.stringify(errInfo));
  }
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
