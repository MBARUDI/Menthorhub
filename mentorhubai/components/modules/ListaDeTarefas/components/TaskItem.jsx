import { useState } from 'react';
import { Trash2, Calendar, Check, Pencil, X } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import CategoryTag from './CategoryTag';
import PriorityTag from './PriorityTag';

export default function TaskItem({ task }) {
  const { toggleTask, deleteTask, updateTask } = useTasks();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => deleteTask(task.id), 300);
  };

  const handleEdit = () => {
    if (isEditing) {
      if (editTitle.trim() && editTitle !== task.title) {
        updateTask(task.id, { title: editTitle.trim() });
      }
      setIsEditing(false);
    } else {
      setEditTitle(task.title);
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setIsEditing(false);
  };

  const isOverdue =
    !task.completed &&
    task.dueDate &&
    new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <div
      className={`glass-card-hover p-4 flex items-start gap-4 animate-slide-up ${
        isDeleting ? 'task-exit' : ''
      } ${task.completed ? 'opacity-50' : ''}`}
    >
      {/* Custom Checkbox */}
      {!isEditing && (
        <button
          onClick={() => toggleTask(task.id)}
          className={`custom-checkbox mt-0.5 ${task.completed ? 'checked' : ''}`}
          aria-label={task.completed ? 'Desmarcar tarefa' : 'Marcar como concluída'}
        >
          {task.completed && (
            <Check size={12} className="text-white" strokeWidth={3} />
          )}
        </button>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="glass-input w-full mb-2 text-base font-display py-1 px-2"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleEdit();
              if (e.key === 'Escape') handleCancel();
            }}
          />
        ) : (
          <h3
            className={`font-display font-medium text-base leading-snug mb-2 transition-all duration-300 ${
              task.completed
                ? 'line-through text-white/30'
                : 'text-white/90'
            }`}
          >
            {task.title}
          </h3>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <CategoryTag category={task.category} />
          <PriorityTag priority={task.priority} />

          {task.dueDate && (
            <span
              className={`inline-flex items-center gap-1.5 text-xs ${
                isOverdue
                  ? 'text-rose-400'
                  : task.completed
                  ? 'text-white/25'
                  : 'text-white/40'
              }`}
            >
              <Calendar size={12} />
              {formatDate(task.dueDate)}
              {isOverdue && (
                <span className="ml-1 text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded-md font-semibold">
                  ATRASADA
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {isEditing ? (
          <>
            <button
              onClick={handleEdit}
              className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all duration-200 cursor-pointer"
              aria-label="Salvar alterações"
            >
              <Check size={16} />
            </button>
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg text-white/20 hover:text-white/40 hover:bg-white/5 transition-all duration-200 cursor-pointer"
              aria-label="Cancelar edição"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleEdit}
              className="p-2 rounded-lg text-white/20 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-200 cursor-pointer"
              aria-label="Editar tarefa"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 flex-shrink-0 cursor-pointer"
              aria-label="Excluir tarefa"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
