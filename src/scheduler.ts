import type { Confidence, Prompt, ScheduleResult } from './types';

export const INTERVALS = [1, 3, 7, 14, 30, 60, 120] as const;

const day = 86_400_000;

export function scheduleReview(
  stage: number,
  correct: boolean,
  confidence: Confidence,
  reviewedAt = new Date(),
): ScheduleResult {
  let nextStage: number;
  let reason: string;

  if (!correct) {
    nextStage = 0;
    reason = 'An incorrect answer resets the prompt to the 1-day step.';
  } else if (confidence <= 2) {
    nextStage = Math.max(0, stage - 1);
    reason = 'A correct answer with low confidence steps back one interval.';
  } else if (confidence === 3) {
    nextStage = Math.max(0, stage);
    reason = 'A correct answer with medium confidence repeats the current interval.';
  } else {
    nextStage = Math.min(INTERVALS.length - 1, stage + 1);
    reason = 'A correct answer with high confidence advances one interval.';
  }

  const intervalDays = INTERVALS[nextStage];
  return {
    stage: nextStage,
    intervalDays,
    dueAt: new Date(reviewedAt.getTime() + intervalDays * day).toISOString(),
    explanation: `${reason} Next review: ${intervalDays} ${intervalDays === 1 ? 'day' : 'days'}.`,
  };
}

export function effectiveDueAt(prompt: Prompt): string {
  return prompt.manualDueAt || prompt.dueAt;
}

export function isDue(prompt: Prompt, now = new Date()): boolean {
  return new Date(effectiveDueAt(prompt)).getTime() <= now.getTime();
}

export function dueReason(prompt: Prompt, now = new Date()): string {
  const due = new Date(effectiveDueAt(prompt));
  if (prompt.manualDueAt) {
    return `Manual override set this review for ${formatDate(due)}.`;
  }
  if (!prompt.reviews.length) {
    return 'New prompt — it has not been reviewed yet.';
  }
  const last = prompt.reviews[prompt.reviews.length - 1];
  const relation = due.getTime() <= now.getTime() ? 'reached' : 'will reach';
  return `Its ${last.intervalDays}-day interval ${relation} ${formatDate(due)}.`;
}

export function formatDate(date: Date | string): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(value);
}

export function localDateValue(date: string): string {
  const value = new Date(date);
  const offset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 10);
}

export function dateInputToIso(value: string): string {
  const [year, month, date] = value.split('-').map(Number);
  return new Date(year, month - 1, date, 9, 0, 0).toISOString();
}
