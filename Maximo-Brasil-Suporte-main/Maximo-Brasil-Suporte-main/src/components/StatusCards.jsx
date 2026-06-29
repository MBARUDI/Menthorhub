import { MessageSquare, Clock, Wrench, CheckCircle2, ShieldCheck, Ticket } from 'lucide-react';

const StatusCards = ({ tickets = [] }) => {
  const stats = [
    { 
      label: 'Chamados Abertos', 
      value: tickets.filter(t => t.status === 'Pendente').length, 
      icon: Ticket, 
      color: 'blue'
    },
    { 
      label: 'Em Atendimento', 
      value: tickets.filter(t => t.status === 'Em Progresso').length, 
      icon: Wrench, 
      color: 'amber'
    },
    { 
      label: 'Validando Solução', 
      value: tickets.filter(t => t.status === 'Validando').length, 
      icon: CheckCircle2, 
      color: 'purple'
    },
    { 
      label: 'Concluídos', 
      value: tickets.filter(t => t.status === 'Concluído').length, 
      icon: ShieldCheck, 
      color: 'emerald'
    },
  ];

  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="card-stat group">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl border ${colors[stat.color]}`}>
              <stat.icon size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 w-[70%] ${
              stat.color === 'blue' ? 'bg-blue-500' : 
              stat.color === 'amber' ? 'bg-amber-500' : 
              stat.color === 'purple' ? 'bg-purple-500' : 
              'bg-emerald-500'
            }`}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusCards;
