import { supabase } from './supabaseClient';
import { UserProfile } from '../types';

export const fetchUsers = async (): Promise<UserProfile[]> => {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }

    return data as UserProfile[];
  } catch (e) {
    console.error('Exceção ao buscar usuários:', e);
    return [];
  }
};

export const createUser = async (name: string): Promise<UserProfile | null> => {
  // Fallback local se sem configuração: Gera um ID aleatório para permitir o funcionamento da UI
  if (!supabase) return { id: crypto.randomUUID(), name }; 

  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{ name }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return null;
    }

    return data as UserProfile;
  } catch (e) {
    console.error('Exceção ao criar usuário:', e);
    return null;
  }
};