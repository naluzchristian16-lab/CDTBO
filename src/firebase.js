import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCSSId4EnYdoeoex_-1zLl327kbyWgbbds",
  authDomain: "cdtpos-2946a.firebaseapp.com",
  projectId: "cdtpos-2946a",
  storageBucket: "cdtpos-2946a.firebasestorage.app",
  messagingSenderId: "952364279531",
  appId: "1:952364279531:web:8630a2203c15a7d10340ae",
  measurementId: "G-0RSY50BRFJ"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
