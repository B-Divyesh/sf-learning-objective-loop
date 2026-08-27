export type Confidence = 1 | 2 | 3 | 4 | 5;

export interface Evidence {
  id: string;
  label: string;
  url: string;
  createdAt: string;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  parentId: string | null;
  evidence: Evidence[];
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  at: string;
  correct: boolean;
  confidence: Confidence;
  priorStage: number;
  newStage: number;
  intervalDays: number;
}

export interface Prompt {
  id: string;
  objectiveId: string;
  question: string;
  answer: string;
  notes: string;
  stage: number;
  dueAt: string;
  manualDueAt: string | null;
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  version: 1;
  objectives: Objective[];
  prompts: Prompt[];
  updatedAt: string;
}

export interface ScheduleResult {
  stage: number;
  intervalDays: number;
  dueAt: string;
  explanation: string;
}
