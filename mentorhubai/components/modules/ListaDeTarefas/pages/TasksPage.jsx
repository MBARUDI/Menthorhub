import { useState } from 'react';
import ProgressBar from '../components/ProgressBar';
import TaskForm from '../components/TaskForm';
import FilterBar from '../components/FilterBar';
import TaskList from '../components/TaskList';
import { useTasks } from '../context/TaskContext';

export default function TasksPage() {
  const [filter, setFilter] = useState('todas');
  const { stats } = useTasks();

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-white tracking-tight mb-1">
            Minhas Tarefas
          </h1>
          <p className="text-white/40 text-sm">
            {stats.total === 0
              ? 'Comece adicionando sua primeira tarefa'
              : `${stats.pending} tarefa${stats.pending !== 1 ? 's' : ''} pendente${stats.pending !== 1 ? 's' : ''}`}
          </p>
        </div>
        <FilterBar currentFilter={filter} onFilterChange={setFilter} />
      </div>

      {/* Progress */}
      {stats.total > 0 && <ProgressBar />}

      {/* Add Task */}
      <TaskForm />

      {/* Task List */}
      <TaskList filter={filter} />
    </div>
  );
}
