import { Monitor, Zap, Building2, ShieldCheck, Radio } from 'lucide-react';

const CategoryFilters = ({ activeCategory, setActiveCategory }) => {
  const categories = [
    { id: 'all', label: 'Todos', icon: null, color: 'slate' },
    { id: 'it', label: 'Informática/TI', icon: Monitor, color: 'blue' },
    { id: 'electric', label: 'Elétrica', icon: Zap, color: 'amber' },
    { id: 'civil', label: 'Predial/Civil', icon: Building2, color: 'orange' },
    { id: 'security', label: 'Segurança', icon: ShieldCheck, color: 'indigo' },
    { id: 'telecom', label: 'Telecom', icon: Radio, color: 'purple' },
  ];

  const colorClasses = {
    slate: 'hover:bg-slate-100 text-slate-600',
    blue: 'hover:bg-blue-50 text-blue-600 active:bg-blue-600 active:text-white',
    amber: 'hover:bg-amber-50 text-amber-600 active:bg-amber-600 active:text-white',
    orange: 'hover:bg-orange-50 text-orange-600 active:bg-orange-600 active:text-white',
    indigo: 'hover:bg-indigo-50 text-indigo-600 active:bg-indigo-600 active:text-white',
    purple: 'hover:bg-purple-50 text-purple-600 active:bg-purple-600 active:text-white',
  };

  const activeClasses = {
    slate: 'bg-slate-900 text-white shadow-lg',
    blue: 'bg-blue-600 text-white shadow-lg shadow-blue-200',
    amber: 'bg-amber-500 text-white shadow-lg shadow-amber-200',
    orange: 'bg-orange-500 text-white shadow-lg shadow-orange-200',
    indigo: 'bg-indigo-600 text-white shadow-lg shadow-indigo-200',
    purple: 'bg-purple-600 text-white shadow-lg shadow-purple-200',
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setActiveCategory(cat.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-transparent ${
            activeCategory === cat.id 
              ? activeClasses[cat.color] 
              : `bg-white border-slate-200 ${colorClasses[cat.color]}`
          }`}
        >
          {cat.icon && <cat.icon size={16} />}
          {cat.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilters;
