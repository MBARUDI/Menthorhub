export enum PDCAStage {
  PLAN = 'PLAN',
  DO = 'DO',
  CHECK = 'CHECK',
  ACT = 'ACT',
  COMPLETED = 'COMPLETED'
}

export interface Task {
  id: string;
  description: string;
  completed: boolean;
}

export interface Cycle {
  id: string;
  title: string;
  goal: string;
  startDate: string;
  currentStage: PDCAStage;
  tasks: Task[];
  
  // Check Phase
  checkObservations?: string;
  checkRating?: number; // 1-5
  checkAiAnalysis?: string;

  // Act Phase
  actImprovements?: string;
  actNextSteps?: string;
  actAiSuggestions?: string;
}

export interface AIPlanResponse {
  tasks: string[];
}

export interface UserProfile {
  id?: string;
  name: string;
  created_at?: string;
}