import { openDB } from 'idb';

const DB_NAME = 'shield-safety-db';
const STORE_NAME = 'safety-store';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME);
    }
  },
});

export async function getCachedData(key) {
  try {
    const db = await dbPromise;
    return await db.get(STORE_NAME, key);
  } catch (err) {
    console.error('IndexedDB get error:', err);
    return null;
  }
}

export async function setCachedData(key, value) {
  try {
    const db = await dbPromise;
    await db.put(STORE_NAME, value, key);
    return true;
  } catch (err) {
    console.error('IndexedDB put error:', err);
    return false;
  }
}
