// src/firebase-config.js
// Firebase Configuration for SportsChatPlus
// Updated with correct API key values
// =========================================

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence 
} from 'firebase/auth';
import { 
  getFirestore, 
  enableNetwork,
  disableNetwork 
} from 'firebase/firestore';

// Your Firebase project configuration (CORRECTED VALUES)
const firebaseConfig = {
  apiKey: "AIzaSyAUUsWQfw-jbUZZ7vnZdwpMxku2Ku2dG38",
  authDomain: "sportschatplus-8239d.firebaseapp.com",
  projectId: "sportschatplus-8239d",
  storageBucket: "sportschatplus-8239d.firebasestorage.app",
  messagingSenderId: "182698049606",
  appId: "1:182698049606:web:417f967694b27df6160a47",
  measurementId: "G-W0Y5XXD4DX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Set auth persistence to local (survives browser restarts)
setPersistence(auth, browserLocalPersistence);

// Initialize Firestore Database
export const db = getFirestore(app);

// Network management functions for offline support
export const goOnline = () => enableNetwork(db);
export const goOffline = () => disableNetwork(db);

// Export the app instance
export default app;