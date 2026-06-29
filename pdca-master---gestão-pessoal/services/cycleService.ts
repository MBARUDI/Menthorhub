
import { supabase } from './supabaseClient';
import { Cycle, PDCAStage } from '../types';

// Helper to map DB snake_case to App camelCase
const mapToAppCycle = (dbCycle: any): Cycle => ({
  id: dbCycle.id,
  title: dbCycle.title || 'Sem título',
  goal: dbCycle.goal || '',
  startDate: dbCycle.start_date,
  currentStage: dbCycle.current_stage as PDCAStage,
  tasks: dbCycle.tasks || [],
  checkObservations: dbCycle.check_observations,
  checkRating: dbCycle.check_rating,
  checkAiAnalysis: dbCycle.check_ai_analysis,
  actImprovements: dbCycle.act_improvements,
  actNextSteps: dbCycle.act_next_steps,
  actAiSuggestions: dbCycle.act_ai_suggestions,
});

// Helper to map App camelCase to DB snake_case
const mapToDbCycle = (cycle: Cycle, userId: string) => ({
  id: cycle.id,
  user_id: userId,
  title: cycle.title,
  goal: cycle.goal,
  start_date: cycle.startDate,
  current_stage: cycle.currentStage,
  tasks: cycle.tasks,
  check_observations: cycle.checkObservations,
  check_rating: cycle.checkRating,
  check_ai_analysis: cycle.checkAiAnalysis,
  act_improvements: cycle.actImprovements,
  act_next_steps: cycle.actNextSteps,
  act_ai_suggestions: cycle.actAiSuggestions,
});

export const fetchCycles = async (userId: string): Promise<Cycle[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('cycles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar ciclos:', error);
    return [];
  }

  return data.map(mapToAppCycle);
};

export const saveCycle = async (cycle: Cycle, userId: string): Promise<void> => {
  if (!supabase) return;

  const dbData = mapToDbCycle(cycle, userId);

  const { error } = await supabase
    .from('cycles')
    .upsert(dbData, { onConflict: 'id' });

  if (error) {
    console.error('Erro ao salvar ciclo:', error);
  }
};

export const deleteCycle = async (cycleId: string): Promise<void> => {
  if (!supabase) return;

  const { error } = await supabase
    .from('cycles')
    .delete()
    .eq('id', cycleId);

  if (error) {
    console.error('Erro ao deletar ciclo:', error);
  }
};
