
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
  TST = 'TST',
  GRATITUDE = 'GRATITUDE',
  LUMEN = 'LUMEN',
  PARAKLESIS = 'PARAKLESIS',
  STUDIES = 'STUDIES',
  CONSCIOUS_WALLET = 'CONSCIOUS_WALLET',
  GESTAO_MASTER = 'GESTAO_MASTER',
  ENGLISH = 'ENGLISH',
  JORNADA_INTERIOR = 'JORNADA_INTERIOR',
  PDCA_MASTER = 'PDCA_MASTER',
  NEON_RACER = 'NEON_RACER',
  LISTA_TAREFAS = 'LISTA_TAREFAS',
  SMART_MARKET = 'SMART_MARKET',
}

export type AppCategory = 'learning' | 'safety' | 'tools' | 'media' | 'social' | 'stories' | 'finance' | 'health' | 'tst' | 'studies' | 'games';

export interface AppIcon {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  type: ModuleType;
  description: string;
  category: AppCategory;
  externalUrl?: string;
  imageUrl?: string;
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

export enum QuadrantType {
  MOTIVATORS = 'Motivadores',
  SABOTEURS = 'Sabotadores',
  GAINS = 'Ganhos (Consumo Consciente)',
  LOSSES = 'Perdas (Consumo Impulsivo)'
}

export interface QuadrantItem {
  id: string;
  text: string;
  type: QuadrantType;
}

export interface FiveQsData {
  what: string;
  why: string;
  how: string;
  who: string;
  usage: string;
}

export interface AnalysisResult {
  markdown: string;
  loading: boolean;
  error: string | null;
}

export interface IncomeItem {
  id: string;
  source: string;
  periodicity: string;
  amount: number;
}

export interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
}

export interface InvestmentItem {
  id: string;
  type: string;
  monthlyApplication: number;
  totalValue: number;
}

export enum GoalTimeframe {
  TODAY = 'TODAY',
  SHORT = 'SHORT',
  MEDIUM = 'MEDIUM',
  LONG = 'LONG',
  VERY_LONG = 'VERY_LONG'
}

export interface GoalItem {
  id: string;
  description: string;
  value: number;
  timeframe: GoalTimeframe;
  completed: boolean;
}

export interface WorkItem {
  id: string;
  area: string;
  currentIncome: number;
}
