import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const TaskContext = createContext(null);

export const CATEGORIES = {
  trabalho: { label: 'Trabalho', color: 'blue' },
  pessoal: { label: 'Pessoal', color: 'emerald' },
  estudos: { label: 'Estudos', color: 'amber' },
};

export const PRIORITIES = {
  alta: { label: 'Alta', color: 'rose' },
  media: { label: 'Média', color: 'amber' },
  baixa: { label: 'Baixa', color: 'teal' },
};

export function TaskProvider({ children }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregar tarefas apenas quando o usuário estiver logado
  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData) => {
    if (!user) return;
    
    try {
      const newTask = {
        title: taskData.title,
        category: taskData.category,
        priority: taskData.priority,
        dueDate: taskData.dueDate || null,
        completed: false,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select();

      if (error) throw error;
      setTasks((prev) => [data[0], ...prev]);
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error.message);
    }
  };

  const toggleTask = async (id) => {
    try {
      const taskToUpdate = tasks.find((t) => t.id === id);
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !taskToUpdate.completed })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error.message);
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select();

      if (error) throw error;
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
      );
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error.message);
    }
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(
      (t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date(new Date().setHours(0, 0, 0, 0))
    ).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    const byCategory = Object.keys(CATEGORIES).map((key) => ({
      key,
      ...CATEGORIES[key],
      count: tasks.filter((t) => t.category === key).length,
      completed: tasks.filter((t) => t.category === key && t.completed).length,
    }));

    const byPriority = Object.keys(PRIORITIES).map((key) => ({
      key,
      ...PRIORITIES[key],
      count: tasks.filter((t) => t.priority === key).length,
      completed: tasks.filter((t) => t.priority === key && t.completed).length,
    }));

    return { total, completed, pending, overdue, percentage, byCategory, byPriority };
  }, [tasks]);

  return (
    <TaskContext.Provider value={{ tasks, addTask, toggleTask, updateTask, deleteTask, stats, loading }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
