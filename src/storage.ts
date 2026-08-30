import type { AppState } from './types';

export type StorageScope = 'real' | 'demo';

const DB_NAME = 'objective-loop';
const STORE = 'records';
const STATE_KEY = 'state';
const FALLBACK_KEY = 'objective-loop:state';

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
  try {
    const db = await openDb(scope);
    const state = await new Promise<AppState | undefined>((resolve, reject) => {
      const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(STATE_KEY);
      request.onsuccess = () => resolve(request.result as AppState | undefined);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return state ? discardUnsafeStoredEvidence(state) : emptyState();
  } catch {
    const fallback = localStorage.getItem(fallbackKey(scope));
    return fallback ? discardUnsafeStoredEvidence(JSON.parse(fallback) as AppState) : emptyState();
  }
}

export async function saveState(state: AppState, scope: StorageScope = 'real'): Promise<void> {
  state.updatedAt = new Date().toISOString();
  try {
    const db = await openDb(scope);
    await new Promise<void>((resolve, reject) => {
      const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(state, STATE_KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    db.close();
  } catch {
    localStorage.setItem(fallbackKey(scope), JSON.stringify(state));
  }
}

export async function clearState(scope: StorageScope): Promise<void> {
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
