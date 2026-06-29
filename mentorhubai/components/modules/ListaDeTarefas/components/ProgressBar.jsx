import { useTasks } from '../context/TaskContext';

export default function ProgressBar() {
  const { stats } = useTasks();
  const { total, completed, percentage } = stats;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse-slow" />
          <span className="text-sm font-medium text-white/70">Progresso Geral</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold font-display text-gradient">{percentage}%</span>
          <span className="text-xs text-white/40">
            ({completed}/{total})
          </span>
        </div>
      </div>

      <div className="relative h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        >
          {percentage > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer bg-[length:200%_100%]" />
          )}
        </div>
      </div>

      {total > 0 && (
        <div className="flex justify-between mt-2 text-xs text-white/30">
          <span>{stats.pending} pendente{stats.pending !== 1 ? 's' : ''}</span>
          {stats.overdue > 0 && (
            <span className="text-rose-400/80">
              {stats.overdue} atrasada{stats.overdue !== 1 ? 's' : ''}
            </span>
          )}
          <span>{completed} concluída{completed !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
}
