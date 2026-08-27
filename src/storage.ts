import type { AppState } from './types';

const DB_NAME = 'objective-loop';
const STORE = 'records';
const STATE_KEY = 'state';
const FALLBACK_KEY = 'objective-loop:state';

export const emptyState = (): AppState => ({
  version: 1,
  objectives: [],
  prompts: [],
  updatedAt: new Date().toISOString(),
});

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadState(): Promise<AppState> {
  try {
    const db = await openDb();
    const state = await new Promise<AppState | undefined>((resolve, reject) => {
      const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(STATE_KEY);
      request.onsuccess = () => resolve(request.result as AppState | undefined);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return state || emptyState();
  } catch {
    const fallback = localStorage.getItem(FALLBACK_KEY);
    return fallback ? (JSON.parse(fallback) as AppState) : emptyState();
  }
}

export async function saveState(state: AppState): Promise<void> {
  state.updatedAt = new Date().toISOString();
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(state, STATE_KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    db.close();
  } catch {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(state));
  }
}

export function validateState(value: unknown): AppState {
  if (!value || typeof value !== 'object') throw new Error('This file does not contain Objective Loop data.');
  const candidate = value as Partial<AppState>;
  if (candidate.version !== 1 || !Array.isArray(candidate.objectives) || !Array.isArray(candidate.prompts)) {
    throw new Error('This export version is not supported.');
  }
  return candidate as AppState;
}
