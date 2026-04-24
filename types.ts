
import { LucideIcon } from 'lucide-react';

export enum ModuleType {
  LANGUAGE = 'LANGUAGE',
  SAFETY = 'SAFETY',
  FINANCE = 'FINANCE',
  CHAT_GENERAL = 'CHAT_GENERAL',
  LEADERSHIP = 'LEADERSHIP',
  PODCAST = 'PODCAST',
  VIDEOS_SST = 'VIDEOS_SST',
  CALCULATOR = 'CALCULATOR',
  NEWS = 'NEWS',
  MILLION = 'MILLION',
  GUIDE = 'GUIDE',
  COMMUNITY = 'COMMUNITY',
}

export type AppCategory = 'learning' | 'safety' | 'tools' | 'media' | 'social' | 'stories' | 'ai_assistants' | 'civil_engineering' | 'utilities' | 'health';

export interface AppIcon {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  type: ModuleType;
  description: string;
  category: AppCategory;
  externalUrl?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface SafetyQuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface SafetyQuizResponse {
  questions: SafetyQuizQuestion[];
}
