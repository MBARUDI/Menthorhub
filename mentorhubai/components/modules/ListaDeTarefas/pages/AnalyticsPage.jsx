import { useTasks, CATEGORIES, PRIORITIES } from '../context/TaskContext';
import { TrendingUp, CheckCircle2, Clock, AlertTriangle, Target } from 'lucide-react';

const categoryColors = {
  blue: { bar: 'bg-blue-500', text: 'text-blue-400' },
  emerald: { bar: 'bg-emerald-500', text: 'text-emerald-400' },
  amber: { bar: 'bg-amber-500', text: 'text-amber-400' },
};

const priorityColors = {
  rose: { bar: 'bg-rose-500', text: 'text-rose-400' },
  amber: { bar: 'bg-amber-500', text: 'text-amber-400' },
  teal: { bar: 'bg-teal-500', text: 'text-teal-400' },
};

function MetricCard({ icon: Icon, label, value, accent, subtext }) {
  return (
    <div className="metric-card animate-slide-up">
      <div className="flex items-center gap-3 mb-1">
        <div className={`w-10 h-10 rounded-xl ${accent} flex items-center justify-center`}>
          <Icon size={18} />
        </div>
        <span className="text-xs text-white/40 uppercase tracking-wider font-medium">{label}</span>
      </div>
      <span className="text-3xl font-display font-bold text-white">{value}</span>
      {subtext && <span className="text-xs text-white/30">{subtext}</span>}
    </div>
  );
}

function DistributionBar({ items, colorMap, maxCount }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const colors = colorMap[item.color];
        const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
        return (
          <div key={item.key}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-sm font-medium ${colors.text}`}>{item.label}</span>
              <span className="text-xs text-white/40">
                {item.completed}/{item.count}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={`h-full rounded-full ${colors.bar} transition-all duration-700 ease-out`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const { stats } = useTasks();

  const maxCatCount = Math.max(...stats.byCategory.map((c) => c.count), 1);
  const maxPriCount = Math.max(...stats.byPriority.map((p) => p.count), 1);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl text-white tracking-tight mb-1">
          Análises
        </h1>
        <p className="text-white/40 text-sm">Visão geral do seu progresso</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Target}
          label="Total"
          value={stats.total}
          accent="bg-cyan-500/15 text-cyan-400"
          subtext="tarefas criadas"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Concluídas"
          value={stats.completed}
          accent="bg-emerald-500/15 text-emerald-400"
          subtext={`${stats.percentage}% do total`}
        />
        <MetricCard
          icon={Clock}
          label="Pendentes"
          value={stats.pending}
          accent="bg-amber-500/15 text-amber-400"
          subtext="em andamento"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Atrasadas"
          value={stats.overdue}
          accent="bg-rose-500/15 text-rose-400"
          subtext="precisam de atenção"
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-cyan-400" />
            <h2 className="font-display font-semibold text-white text-lg">Por Categoria</h2>
          </div>
          <DistributionBar items={stats.byCategory} colorMap={categoryColors} maxCount={maxCatCount} />
        </div>

        <div className="glass-card p-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-cyan-400" />
            <h2 className="font-display font-semibold text-white text-lg">Por Prioridade</h2>
          </div>
          <DistributionBar items={stats.byPriority} colorMap={priorityColors} maxCount={maxPriCount} />
        </div>
      </div>

      {/* Completion Rate */}
      {stats.total > 0 && (
        <div className="glass-card p-6 animate-slide-up">
          <h2 className="font-display font-semibold text-white text-lg mb-4">Taxa de Conclusão</h2>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeDasharray={`${stats.percentage}, 100`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-display font-bold text-gradient">{stats.percentage}%</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-sm leading-relaxed">
                Você completou <span className="text-white font-semibold">{stats.completed}</span> de{' '}
                <span className="text-white font-semibold">{stats.total}</span> tarefas.
                {stats.percentage >= 80 && ' Excelente trabalho! 🎯'}
                {stats.percentage >= 50 && stats.percentage < 80 && ' Continue assim! 💪'}
                {stats.percentage < 50 && stats.percentage > 0 && ' Você consegue! Foque nas prioridades. ⚡'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
