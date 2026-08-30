import type { AppState } from './types';

export type StorageScope = 'real' | 'demo';

const DB_NAME = 'objective-loop';
const STORE = 'records';
const STATE_KEY = 'state';
const FALLBACK_KEY = 'objective-loop:state';
const saveQueues: Record<StorageScope, Promise<void>> = {
  real: Promise.resolve(),
  demo: Promise.resolve(),
};

const dbName = (scope: StorageScope): string => scope === 'demo' ? `${DB_NAME}-demo` : DB_NAME;
const fallbackKey = (scope: StorageScope): string => scope === 'demo' ? `demo:${FALLBACK_KEY}` : FALLBACK_KEY;

/** Evidence is rendered as an outbound link, so only ordinary web protocols
 * may enter either local storage or an imported backup. */
export function isAllowedEvidenceUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function discardUnsafeStoredEvidence(state: AppState): AppState {
  state.objectives.forEach((objective) => {
    if (Array.isArray(objective.evidence)) {
      objective.evidence = objective.evidence.filter((evidence) => isAllowedEvidenceUrl(evidence?.url));
    }
  });
  return state;
}

export const emptyState = (): AppState => ({
  version: 1,
  objectives: [],
  prompts: [],
  updatedAt: new Date().toISOString(),
});

function openDb(scope: StorageScope): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName(scope), 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadState(scope: StorageScope = 'real'): Promise<AppState> {
  const fallback = readFallback(scope);
  try {
    const db = await openDb(scope);
    try {
      const stored = await new Promise<AppState | undefined>((resolve, reject) => {
        const transaction = db.transaction(STORE, 'readonly');
        const request = transaction.objectStore(STORE).get(STATE_KEY);
        request.onsuccess = () => resolve(request.result as AppState | undefined);
        request.onerror = () => reject(request.error);
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error || new Error('Browser storage read was aborted.'));
      });
      return discardUnsafeStoredEvidence(newestState(stored, fallback) || emptyState());
    } finally {
      db.close();
    }
  } catch {
    return fallback ? discardUnsafeStoredEvidence(fallback) : emptyState();
  }
}

function readFallback(scope: StorageScope): AppState | undefined {
  try {
    const value = localStorage.getItem(fallbackKey(scope));
    return value ? JSON.parse(value) as AppState : undefined;
  } catch {
    return undefined;
  }
}

function newestState(stored: AppState | undefined, fallback: AppState | undefined): AppState | undefined {
  if (!stored) return fallback;
  if (!fallback) return stored;
  return Date.parse(fallback.updatedAt) > Date.parse(stored.updatedAt) ? fallback : stored;
}

export async function saveState(state: AppState, scope: StorageScope = 'real'): Promise<void> {
  const previousUpdatedAt = Date.parse(state.updatedAt);
  state.updatedAt = new Date(Math.max(Date.now(), Number.isFinite(previousUpdatedAt) ? previousUpdatedAt + 1 : 0)).toISOString();
  // IndexedDB request success only means the request was accepted. Waiting for
  // transaction completion makes a save durable before the app navigates or a
  // user reloads. Each scope also serializes saves so quick successive actions
  // cannot let an older snapshot finish after a newer one.
  const snapshot = structuredClone(state);
  const serializedSnapshot = JSON.stringify(snapshot);
  // A reload can interrupt an IndexedDB transaction after a button click but
  // before its async handler returns. This scoped journal is synchronous and
  // exists only until the IndexedDB transaction commits; it is never shared
  // between the real and demo notebooks.
  try {
    localStorage.setItem(fallbackKey(scope), serializedSnapshot);
  } catch {
    // IndexedDB remains the primary store when localStorage is unavailable.
  }
  const write = async (): Promise<void> => {
    try {
      const db = await openDb(scope);
      try {
        await new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(STORE, 'readwrite');
          transaction.objectStore(STORE).put(snapshot, STATE_KEY);
          transaction.oncomplete = () => {
            try {
              if (localStorage.getItem(fallbackKey(scope)) === serializedSnapshot) localStorage.removeItem(fallbackKey(scope));
            } catch {
              // The durable IndexedDB write succeeded; an unavailable journal needs no action.
            }
            resolve();
          };
          transaction.onerror = () => reject(transaction.error);
          transaction.onabort = () => reject(transaction.error || new Error('Browser storage save was aborted.'));
        });
      } finally {
        db.close();
      }
    } catch {
      // Keep the synchronous journal as the localStorage fallback.
    }
  };
  const queued = saveQueues[scope].catch(() => undefined).then(write);
  saveQueues[scope] = queued;
  return queued;
}

export async function clearState(scope: StorageScope): Promise<void> {
  await saveQueues[scope].catch(() => undefined);
  localStorage.removeItem(fallbackKey(scope));
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName(scope));
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Close other demo tabs, then try again.'));
  });
}

export function validateState(value: unknown): AppState {
  if (!value || typeof value !== 'object') throw new Error('This file does not contain Objective Loop data.');
  const candidate = value as Partial<AppState>;
  if (candidate.version !== 1 || !Array.isArray(candidate.objectives) || !Array.isArray(candidate.prompts)) {
    throw new Error('This export version is not supported.');
  }
  const unsafeEvidence = candidate.objectives.some((objective) => Array.isArray(objective.evidence)
    && objective.evidence.some((evidence) => !isAllowedEvidenceUrl(evidence?.url)));
  if (unsafeEvidence) throw new Error('This backup contains an evidence link that is not an HTTP(S) web address.');
  return candidate as AppState;
}
