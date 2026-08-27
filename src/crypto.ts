import type { AppState } from './types';
import { validateState } from './storage';

interface EncryptedExport {
  format: 'objective-loop-encrypted';
  version: 1;
  kdf: 'PBKDF2-SHA256';
  iterations: number;
  salt: string;
  iv: string;
  data: string;
}

const encode = (bytes: Uint8Array): string => {
  let binary = '';
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
};

const decode = (value: string): Uint8Array => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

async function keyFor(passphrase: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptState(state: AppState, passphrase: string): Promise<string> {
  if (passphrase.length < 8) throw new Error('Use a passphrase with at least 8 characters.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const iterations = 250_000;
  const key = await keyFor(passphrase, salt, iterations);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    new TextEncoder().encode(JSON.stringify(state)),
  );
  return JSON.stringify({
    format: 'objective-loop-encrypted', version: 1, kdf: 'PBKDF2-SHA256', iterations,
    salt: encode(salt), iv: encode(iv), data: encode(new Uint8Array(encrypted)),
  } satisfies EncryptedExport);
}

export async function decryptState(payload: string, passphrase: string): Promise<AppState> {
  try {
    const parsed = JSON.parse(payload) as EncryptedExport;
    if (parsed.format !== 'objective-loop-encrypted' || parsed.version !== 1) throw new Error();
    const key = await keyFor(passphrase, decode(parsed.salt), parsed.iterations);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: decode(parsed.iv) as BufferSource },
      key,
      decode(parsed.data) as BufferSource,
    );
    return validateState(JSON.parse(new TextDecoder().decode(decrypted)));
  } catch {
    throw new Error('Could not decrypt this file. Check the file and passphrase.');
  }
}
