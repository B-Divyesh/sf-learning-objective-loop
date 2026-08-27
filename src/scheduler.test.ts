import { describe, expect, it } from 'vitest';
import { dueReason, effectiveDueAt, isDue, scheduleReview } from './scheduler';
import type { Prompt } from './types';

const reviewedAt = new Date('2026-08-27T09:00:00.000Z');

describe('explainable scheduler', () => {
  it('resets an incorrect answer to one day', () => {
    const result = scheduleReview(4, false, 2, reviewedAt);
    expect(result.stage).toBe(0);
    expect(result.intervalDays).toBe(1);
    expect(result.dueAt).toBe('2026-08-28T09:00:00.000Z');
    expect(result.explanation).toContain('resets');
  });

  it('advances a high-confidence correct answer by one stage', () => {
    const result = scheduleReview(1, true, 5, reviewedAt);
    expect(result.stage).toBe(2);
    expect(result.intervalDays).toBe(7);
  });

  it('repeats the stage for medium confidence', () => {
    expect(scheduleReview(3, true, 3, reviewedAt).intervalDays).toBe(14);
  });

  it('never advances beyond the 120-day stage', () => {
    expect(scheduleReview(6, true, 5, reviewedAt).intervalDays).toBe(120);
  });

  it('makes a manual date visible and authoritative', () => {
    const prompt = { dueAt: '2026-08-20T09:00:00.000Z', manualDueAt: '2026-09-01T09:00:00.000Z', reviews: [{ intervalDays: 7 }] } as Prompt;
    expect(effectiveDueAt(prompt)).toBe(prompt.manualDueAt);
    expect(isDue(prompt, reviewedAt)).toBe(false);
    expect(dueReason(prompt, reviewedAt)).toContain('Manual override');
  });
});
