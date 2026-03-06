import admin from 'firebase-admin';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

// 🛡️ Flag to check if initialization actually succeeded
let isInitialized = false;

if (projectId && clientEmail && privateKey) {
    if (!admin.apps.length) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
                databaseURL: `https://${projectId}.firebaseio.com`,
            });
            isInitialized = true;
        } catch (error) {
            console.error('Firebase admin initialization error', error);
        }
    } else {
        isInitialized = true;
    }
} else {
    console.warn('Firebase admin environment variables missing. Firebase Admin will not be fully initialized.');
}

// 🛡️ Export non-nullable placeholders if not initialized (Prevents Build Crashes)
const adminDb = (isInitialized ? admin.firestore() : {
    collection: () => ({
        doc: () => ({ get: () => Promise.resolve({ exists: false, data: () => ({}) }) }),
        where: () => ({ orderBy: () => ({ limit: () => ({ get: () => Promise.resolve({ docs: [] }) }) }) })
    }),
    batch: () => ({
        set: () => { },
        update: () => { },
        delete: () => { },
        commit: () => Promise.resolve()
    }),
} as any) as admin.firestore.Firestore;

const adminAuth = (isInitialized ? admin.auth() : {
    verifyIdToken: () => Promise.resolve({ role: 'NONE' }),
} as any) as admin.auth.Auth;

export { adminDb, adminAuth };
