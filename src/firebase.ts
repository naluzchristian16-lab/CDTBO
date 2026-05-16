import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  enableIndexedDbPersistence,
} from "firebase/firestore";

// ── Replace these with your actual Firebase project values ────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env."AIzaSyCSSId4EnYdoeoex_-1zLl327kbyWgbbds",
  authDomain:        import.meta.env."cdtpos-2946a.firebaseapp.com",
  projectId:         import.meta.env."cdtpos-2946a",
  storageBucket:     import.meta.env."cdtpos-2946a.firebasestorage.app",
  messagingSenderId: import.meta.env."952364279531",
  appId:             import.meta.env."1:952364279531:web:8630a2203c15a7d10340ae",
};

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

// ── Offline persistence ────────────────────────────────────────────────────────
// Queues writes when offline and syncs when back online.
// "failed-precondition" fires when multiple tabs are open — safe to ignore.
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    console.warn("Firestore persistence: multiple tabs open.");
  } else if (err.code === "unimplemented") {
    console.warn("Firestore persistence: browser not supported.");
  }
});
