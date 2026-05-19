import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  enableIndexedDbPersistence,
} from "firebase/firestore";

// ── Firebase config from environment variables ────────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// ✅ FIX: Validate Firebase config before initialization
const validateConfig = (): { valid: boolean; missingKeys: string[] } => {
  const requiredKeys = ['apiKey', 'projectId', 'authDomain', 'appId'];
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);
  
  if (missingKeys.length > 0) {
    console.error(
      "❌ Firebase Configuration Error\n\n" +
      "Missing required environment variables:\n" +
      missingKeys.map(k => `  - VITE_FIREBASE_${k.toUpperCase().replace(/([A-Z])/g, '_$1').toUpperCase()}`).join('\n') +
      "\n\nPlease check your .env.local file and add all required Firebase variables.\n" +
      "See .env.example for reference."
    );
    return { valid: false, missingKeys };
  }
  
  return { valid: true, missingKeys: [] };
};

const configValidation = validateConfig();

// ✅ FIX: Use let to allow assignment after validation
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let initError: Error | null = null;

if (configValidation.valid) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // ── Offline persistence ────────────────────────────────────────────────────
    // Queues writes when offline and syncs when back online.
    // "failed-precondition" fires when multiple tabs are open — safe to ignore.
    if (db) {
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === "failed-precondition") {
          console.warn("⚠️ Firestore persistence: multiple tabs open. Offline mode may be limited.");
        } else if (err.code === "unimplemented") {
          console.warn("⚠️ Firestore persistence: browser not supported. App will work online-only.");
        } else {
          console.warn("⚠️ Firestore persistence error:", err.message);
        }
      });
    }

    console.log("✅ Firebase initialized successfully");
  } catch (error) {
    initError = error instanceof Error ? error : new Error(String(error));
    console.error(
      "❌ Firebase Initialization Error\n\n" +
      `${initError.message}\n\n` +
      "This could be due to:\n" +
      "  • Invalid Firebase credentials in .env.local\n" +
      "  • Network connectivity issues\n" +
      "  • Firebase project being deleted or disabled\n\n" +
      "Please verify your Firebase project configuration."
    );
  }
} else {
  initError = new Error(
    `Firebase configuration invalid. Missing: ${configValidation.missingKeys.join(', ')}`
  );
}

// ✅ FIX: Proper exports - explicitly export auth and db
// This ensures they're available and not minified incorrectly during build
const exportAuth = auth;
const exportDb = db;

export const authExport = exportAuth;
export const dbExport = exportDb;

// Also export with standard names for compatibility
export { exportAuth as auth, exportDb as db };

// ✅ FIX: Export helper functions
export function getFirebaseError(): Error | null {
  return initError;
}

export function isFirebaseReady(): boolean {
  return auth !== null && db !== null && initError === null;
}

// ✅ FIX: Provide helpful warning if Firebase isn't ready
if (!isFirebaseReady()) {
  console.warn(
    "⚠️ FIREBASE NOT READY\n\n" +
    "The app will work in offline mode using IndexedDB,\n" +
    "but online sync and authentication won't work.\n\n" +
    "Check browser console for detailed error messages."
  );
}
