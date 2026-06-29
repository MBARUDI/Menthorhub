export interface Lesson {
  id: string;
  youtubeId: string;
  title: string;
  duration?: string;
}

export interface AIAnalysis {
  description: string;
  keyTakeaways: string[];
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface QuizData {
  questions: Question[];
}

export interface Competitor {
  id: string;
  name: string;
  score: number;
  avatarColor: string;
  isUser?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  xp: number;
  current_lesson_id: string;
  completed_quizzes: string[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}