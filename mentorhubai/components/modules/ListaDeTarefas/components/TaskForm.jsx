import { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { useTasks, CATEGORIES, PRIORITIES } from '../context/TaskContext';

export default function TaskForm() {
  const { addTask } = useTasks();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('pessoal');
  const [priority, setPriority] = useState('media');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({ title: title.trim(), category, priority, dueDate });
    setTitle('');
    setCategory('pessoal');
    setPriority('media');
    setDueDate('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        id="btn-add-task"
        onClick={() => setIsOpen(true)}
        className="w-full glass-card-hover p-4 flex items-center gap-3 text-white/40 hover:text-cyan-400 group cursor-pointer"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center group-hover:from-cyan-500/30 group-hover:to-teal-500/30 transition-all duration-300">
          <Plus size={20} className="text-cyan-400" />
        </div>
        <span className="font-medium text-sm">Adicionar nova tarefa...</span>
        <Sparkles size={14} className="ml-auto text-white/20 group-hover:text-cyan-400/50 transition-colors" />
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card p-5 animate-scale-in"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-cyan-400" />
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Nova Tarefa</h3>
      </div>

      <input
        id="input-task-title"
        type="text"
        placeholder="O que precisa ser feito?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="glass-input w-full mb-4 text-base font-display"
        autoFocus
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Categoria</label>
          <select
            id="select-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="glass-select w-full text-sm"
          >
            {Object.entries(CATEGORIES).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Prioridade</label>
          <select
            id="select-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="glass-select w-full text-sm"
          >
            {Object.entries(PRIORITIES).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider">Data</label>
          <input
            id="input-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="glass-input w-full text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="glass-btn-ghost text-sm"
        >
          Cancelar
        </button>
        <button
          id="btn-submit-task"
          type="submit"
          disabled={!title.trim()}
          className="glass-btn-primary text-sm disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:transform-none"
        >
          <span className="flex items-center gap-2">
            <Plus size={16} />
            Adicionar
          </span>
        </button>
      </div>
    </form>
  );
}
