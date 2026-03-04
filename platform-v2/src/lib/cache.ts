import { openDB } from 'idb';

const DB_NAME = 'teach-connect-cache';
const STORE_NAME = 'platform-metadata';

export async function initCacheDB() {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        },
    });
}

export async function setCache(key: string, value: any) {
    const db = await initCacheDB();
    return db.put(STORE_NAME, value, key);
}

export async function getCache(key: string) {
    const db = await initCacheDB();
    return db.get(STORE_NAME, key);
}

export async function clearCache() {
    const db = await initCacheDB();
    return db.clear(STORE_NAME);
}
