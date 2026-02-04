import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDeHhqLaa6Ozj54So4jGTYAa2rO0MCv4yY",
  authDomain: "thibautcheringouarchi.firebaseapp.com",
  projectId: "thibautcheringouarchi",
  storageBucket: "thibautcheringouarchi.firebasestorage.app",
  messagingSenderId: "298168418621",
  appId: "1:298168418621:web:dd43bb7adf09e379614554"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;
