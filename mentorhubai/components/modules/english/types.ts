export enum Level {
  Beginner = "Básico",
  Intermediate = "Intermediário",
  Advanced = "Avançado",
  Conversation = "Conversação",
}

export type TargetLanguage = 'English' | 'Italian' | 'Spanish';

export interface ExerciseData {
  type: 'multiple-choice' | 'fill-in-the-blank';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface VocabularyItem {
  word: string;
  meaning: string;
  example: string;
}

export interface IdiomItem {
  expression: string;
  meaning: string;
  example: string;
}

export interface PhrasalVerbItem {
  verb: string;
  meaning: string;
  example: string;
}

export interface TextAnalysis {
  vocabularyFromText: {
    word: string;
    meaning: string;
  }[];
  verbsFromText: {
    base: string;
    past: string;
    participle: string;
    meaning: string;
  }[];
  expressionsInText: {
    expression: string;
    meaning: string;
  }[];
}

export interface ConversationLine {
  speaker: string;
  line: string;
}

export interface Lesson {
  id: number;
  title: string;
  text: string;
  imageUrl?: string;
  textAnalysis?: TextAnalysis;
  grammar: {
    explanation: string;
    examples: {
      target: string;
      portuguese: string;
    }[];
  };
  exercises: ExerciseData[];
  conversationPractice: ConversationLine[];
  vocabulary: VocabularyItem[];
  idiomaticExpressions: IdiomItem[];
  phrasalVerbs: PhrasalVerbItem[];
}

export interface TestQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  audioText?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ReadingSection {
  passage: string;
  questions: TestQuestion[];
}

export interface ListeningSection {
  questions: TestQuestion[];
}

export interface GrammarSection {
  questions: TestQuestion[];
}

export interface LevelTest {
  reading: ReadingSection;
  listening: ListeningSection;
  grammar: GrammarSection;
}

export interface WritingCorrection {
  isCorrect: boolean;
  score: number;
  feedback: string;
  correctedText?: string;
}

export interface ConversationCorrection {
  isCorrect: boolean;
  feedback: string;
  correctedText?: string;
}

export interface ConversationMessage {
  speaker: 'ai' | 'user';
  text: string;
  translation?: string;
  correction?: ConversationCorrection;
}

export interface NextConversationTurn {
    correction: ConversationCorrection;
    userTranslation: string;
    nextMessage: string;
    nextMessageTranslation: string;
}

export interface LessonProgress {
  totalExercises: number;
  correctExercises: number;
  isCompleted: boolean;
  lastPlayed: string;
  completedSections?: string[];
}

export interface LevelProgress {
  lessons: Record<number, LessonProgress>;
}

export type UserProgress = {
  [key in Level]?: LevelProgress;
} & {
  totalScore: number;
  lastLevel?: Level;
  lastLesson?: number;
  lastLanguage?: TargetLanguage;
};

export interface ActivityLog {
  type: 'exercise' | 'writing' | 'section_complete' | 'placement_test';
  description: string;
  result: string;
  timestamp: string;
}

export interface LessonHistory {
  id: string;
  userName: string;
  level: Level;
  lessonNumber: number;
  targetLanguage: TargetLanguage;
  date: string;
  totalScoreEarned: number;
  activities: ActivityLog[];
}

export interface FullBackup {
  user: User;
  progress: UserProgress;
  history: LessonHistory[];
  timestamp: string;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  isCurrentUser: boolean;
  avatar?: string;
}

export interface User {
  name: string;
  email: string;
  phone: string;
}
