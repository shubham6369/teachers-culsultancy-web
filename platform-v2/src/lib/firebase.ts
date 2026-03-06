import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDA_OCD4M_UDkCBRrNQgqjhK3AZTQyTDlQ",
    authDomain: "guruwale-963df.firebaseapp.com",
    projectId: "guruwale-963df",
    storageBucket: "guruwale-963df.firebasestorage.app",
    messagingSenderId: "715687093230",
    appId: "1:715687093230:web:b2bd8986044fb223c824ff",
    measurementId: "G-GQ0T99EJF7"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// Initialize Analytics (Safe for SSR)
const analytics = typeof window !== 'undefined' ? isSupported().then((yes: boolean) => yes ? getAnalytics(app) : null) : null;

export { app, db, auth, analytics };
