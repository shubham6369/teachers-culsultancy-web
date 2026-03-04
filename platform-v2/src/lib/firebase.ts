import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // Should use process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    authDomain: "teachconnect-platform.firebaseapp.com",
    projectId: "teachconnect-platform",
    storageBucket: "teachconnect-platform.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
