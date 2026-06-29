
export interface Situation {
  id: string;
  title: string;
  references: string;
  category?: 'Conforto' | 'Orientação' | 'Crescimento' | 'Oração';
}

export interface ReflectionResponse {
  message: string;
  mentorship: string;
  prayer?: string;
}
