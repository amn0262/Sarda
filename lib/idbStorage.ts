import { StateStorage } from 'zustand/middleware';

const DB_NAME = 'sarda_cms_db';
const STORE_NAME = 'app_state';
const DB_VERSION = 1;

function getIndexedDB(): IDBFactory | null {
  if (typeof window === 'undefined') return null;
  return (
    window.indexedDB ||
    (window as any).mozIndexedDB ||
    (window as any).webkitIndexedDB ||
    (window as any).msIndexedDB ||
    null
  );
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const idb = getIndexedDB();
    if (!idb) {
      return reject(new Error('IndexedDB is not supported'));
    }
    const request = idb.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

export async function idbGet(key: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => {
          resolve(req.result !== undefined ? req.result : null);
        };
        req.onerror = () => {
          resolve(null);
        };
      } catch {
        resolve(null);
      }
    });
  } catch {
    return null;
  }
}

export async function idbSet(key: string, value: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve(); // Avoid throwing
      } catch {
        resolve();
      }
    });
  } catch {
    // Graceful fallback
  }
}

export async function idbDelete(key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  } catch {
    // Graceful fallback
  }
}

/**
 * Custom resilient storage for Zustand:
 * 1. Uses IndexedDB as primary (virtually unlimited quota vs localStorage's 5MB).
 * 2. Migrates existing localStorage data into IndexedDB automatically and frees localStorage.
 * 3. Keeps lightweight theme/lang in localStorage for instant layout styling.
 * 4. Catches QuotaExceededError and never crashes the app.
 */
export const sardaStateStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null;

    // 1. Try reading from IndexedDB first
    try {
      const idbData = await idbGet(name);
      if (idbData) {
        return idbData;
      }
    } catch (e) {
      console.warn('Error reading from IndexedDB:', e);
    }

    // 2. Migration: If not in IndexedDB, check localStorage
    try {
      const localData = window.localStorage.getItem(name);
      if (localData) {
        // Migrate to IndexedDB asynchronously
        idbSet(name, localData).catch(() => {});
        // Free localStorage to eliminate QuotaExceededError!
        try {
          window.localStorage.removeItem(name);
        } catch {}
        return localData;
      }
    } catch (e) {
      console.warn('Error checking localStorage fallback:', e);
    }

    return null;
  },

  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return;

    // Sync lightweight theme and language to localStorage (few bytes only, never exceeds quota)
    try {
      const parsed = JSON.parse(value);
      if (parsed?.state?.theme) {
        window.localStorage.setItem('sarda-theme', parsed.state.theme);
      }
      if (parsed?.state?.language) {
        window.localStorage.setItem('sarda-lang', parsed.state.language);
      }
    } catch {}

    // 1. Primary: Save to IndexedDB (multi-gigabyte quota, immune to QuotaExceededError)
    try {
      if (getIndexedDB()) {
        await idbSet(name, value);
        // Make sure localStorage doesn't have the old giant string
        try {
          window.localStorage.removeItem(name);
        } catch {}
        return;
      }
    } catch (idbErr) {
      console.warn('IndexedDB write failed, falling back to safe localStorage', idbErr);
    }

    // 2. Fallback: localStorage with QuotaExceededError protection
    try {
      window.localStorage.setItem(name, value);
    } catch (err: any) {
      // Catch QuotaExceededError and never throw!
      const isQuotaError =
        err?.name === 'QuotaExceededError' ||
        err?.code === 22 ||
        err?.code === 1014 ||
        err?.number === -2147024882 ||
        (typeof err?.message === 'string' && err.message.toLowerCase().includes('quota'));

      if (isQuotaError) {
        console.warn('Storage quota exceeded in localStorage fallback. Cleaning up and preserving vital data.');
        try {
          // Attempt to strip large non-essential fields (like floatingStory or deleted items)
          const parsed = JSON.parse(value);
          if (parsed?.state) {
            delete parsed.state.floatingStory;
            if (Array.isArray(parsed.state.stories)) {
              parsed.state.stories = parsed.state.stories.filter((s: any) => !s?.isDeleted);
            }
            if (Array.isArray(parsed.state.folders)) {
              parsed.state.folders = parsed.state.folders.filter((f: any) => !f?.isDeleted);
            }
            const reduced = JSON.stringify(parsed);
            window.localStorage.setItem(name, reduced);
            return;
          }
        } catch (cleanupErr) {
          console.warn('Failed to save even reduced state to localStorage', cleanupErr);
        }
      }
      // Silently prevent unhandled exception crash
    }
  },

  removeItem: async (name: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    try {
      await idbDelete(name);
    } catch {}
    try {
      window.localStorage.removeItem(name);
    } catch {}
  },
};
