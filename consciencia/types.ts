
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
