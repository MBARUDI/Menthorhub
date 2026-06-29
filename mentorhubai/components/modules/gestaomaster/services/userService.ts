import { supabase } from './supabase';
import { UserProfile, Competitor } from '../types';

export const getOrCreateUser = async (userId: string, name: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('gestaomaster_users')
    .select('*')
    .eq('id', userId)
    .single();

  if (data) {
    return {
        ...data,
        completed_quizzes: data.completed_quizzes || [],
        xp: data.xp || 0
    } as UserProfile;
  }

  const newUser = {
    id: userId,
    name: name,
    xp: 0,
    current_lesson_id: '1',
    completed_quizzes: []
  };

  const { data: createdData, error: createError } = await supabase
    .from('gestaomaster_users')
    .insert([newUser])
    .select()
    .single();

  if (createError) {
    console.error("Erro ao criar usuário:", createError);
    return null;
  }

  return {
      ...createdData,
      completed_quizzes: createdData.completed_quizzes || [],
      xp: createdData.xp || 0
  } as UserProfile;
};

export const updateUserProgress = async (userId: string, updates: Partial<UserProfile>) => {
  const { error } = await supabase
    .from('gestaomaster_users')
    .update(updates)
    .eq('id', userId);

  if (error) console.error("Erro ao atualizar progresso:", error);
};

export const getAllUsers = async (): Promise<Partial<UserProfile>[]> => {
  const { data, error } = await supabase
    .from('gestaomaster_users')
    .select('id, name, xp')
    .order('xp', { ascending: false });

  if (error) {
    console.error("Erro ao buscar lista de usuários:", error);
    return [];
  }
  return data || [];
};

export const getLeaderboard = async (currentUserId: string): Promise<Competitor[]> => {
  const { data, error } = await supabase
    .from('gestaomaster_users')
    .select('id, name, xp')
    .order('xp', { ascending: false })
    .limit(50);

  if (error || !data) {
    console.error("Erro ao buscar ranking:", error);
    return [];
  }

  const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'];

  return data.map((user: any) => ({
    id: user.id,
    name: user.name,
    score: user.xp || 0,
    avatarColor: colors[(user.name?.length || 0) % colors.length],
    isUser: user.id === currentUserId
  }));
};
