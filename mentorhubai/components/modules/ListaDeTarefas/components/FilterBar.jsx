export default function FilterBar({ currentFilter, onFilterChange }) {
  const filters = [
    { key: 'todas', label: 'Todas' },
    { key: 'pendentes', label: 'Pendentes' },
    { key: 'concluidas', label: 'Concluídas' },
  ];

  return (
    <div className="flex gap-2">
      {filters.map((filter) => (
        <button
          key={filter.key}
          id={`filter-${filter.key}`}
          onClick={() => onFilterChange(filter.key)}
          className={`glass-btn-ghost text-sm ${
            currentFilter === filter.key ? 'active' : ''
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
