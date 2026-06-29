export enum Step {
  REFLECTION = 0,
  IMPROVEMENT = 1,
  PLANNING = 2,
  GRATITUDE = 3,
  FORGIVENESS = 4,
  REVIEW = 5,
}

export interface JournalEntry {
  userName: string;              // Nome do usuário
  date: string;
  positiveHighlight: string;     // Correspondente a: Por que valeu a pena viver hoje?
  contributionIdea: string;      // Correspondente a: Ideia para contribuir com o mundo
  rewindChange: string;          // Correspondente a: Se pudesse voltar no tempo...
  tomorrowActions: string[];     // Correspondente a: 6 ações para amanhã
  productivityScore: number;     // Correspondente a: Escala 0-10
  productivityReason: string;    // Argumentos da nota
  gratitudeList: string[];       // Correspondente a: 3 acontecimentos/gratidão
  forgivenessSelf: string;       // Meditação do perdão (eu mesmo)
  forgivenessOthers: string;     // Meditação do perdão (outros)
  learningConclusion: string;    // Conclusão/Aprendizados
}

export interface AiFeedbackState {
  loading: boolean;
  content: string | null;
  error: string | null;
}