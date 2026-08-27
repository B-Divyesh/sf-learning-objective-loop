import { describe, expect, it } from 'vitest';
import { decryptState, encryptState } from './crypto';
import { emptyState } from './storage';

describe('encrypted backup', () => {
  it('round-trips local study data without plaintext leakage', async () => {
    const state = emptyState();
    state.objectives.push({ id: 'o1', title: 'Private objective', description: '', parentId: null, evidence: [], archived: false, createdAt: state.updatedAt, updatedAt: state.updatedAt });
    const encrypted = await encryptState(state, 'correct horse battery staple');
    expect(encrypted).not.toContain('Private objective');
    expect((await decryptState(encrypted, 'correct horse battery staple')).objectives[0].title).toBe('Private objective');
  });

  it('rejects the wrong passphrase with an actionable message', async () => {
    const encrypted = await encryptState(emptyState(), 'correct horse battery staple');
    await expect(decryptState(encrypted, 'wrong horse battery staple')).rejects.toThrow('Check the file and passphrase');
  });
});
