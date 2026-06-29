import { useTasks } from '../context/TaskContext';
import TaskItem from './TaskItem';
import { ClipboardList } from 'lucide-react';

export default function TaskList({ filter }) {
  const { tasks } = useTasks();

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pendentes') return !task.completed;
    if (filter === 'concluidas') return task.completed;
    return true;
  });

  if (filteredTasks.length === 0) {
    return (
      <div className="glass-card p-12 flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
          <ClipboardList size={28} className="text-white/20" />
        </div>
        <p className="text-white/30 font-display text-lg mb-1">
          {filter === 'pendentes'
            ? 'Nenhuma tarefa pendente'
            : filter === 'concluidas'
            ? 'Nenhuma tarefa concluída'
            : 'Nenhuma tarefa ainda'}
        </p>
        <p className="text-white/15 text-sm">
          {filter === 'todas'
            ? 'Clique em "Adicionar nova tarefa" para começar'
            : 'Tarefas aparecerão aqui conforme você avança'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {filteredTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
