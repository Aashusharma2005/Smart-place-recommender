import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 🔥 ADD

const firebaseConfig = {
  apiKey: "AIzaSyCgaGwmH_lopMjOjkSH7qcX8eekFrA1Et4",
  authDomain: "exploreindia-4cfc7.firebaseapp.com",
  projectId: "exploreindia-4cfc7",
  storageBucket: "exploreindia-4cfc7.firebasestorage.app",
  messagingSenderId: "1014581087853",
  appId: "1:1014581087853:web:981864a7e095e3f6183964"
};

const app = initializeApp(firebaseConfig);

// ✅ EXISTING (unchanged)
export const auth = getAuth(app);

// 🔥 NEW (reviews ke liye)
export const db = getFirestore(app);