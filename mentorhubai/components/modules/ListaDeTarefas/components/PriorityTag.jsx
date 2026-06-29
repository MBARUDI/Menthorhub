import { PRIORITIES } from '../context/TaskContext';

const colorMap = {
  rose: {
    bg: 'bg-rose-500/15',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
  },
  amber: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  teal: {
    bg: 'bg-teal-500/15',
    text: 'text-teal-400',
    border: 'border-teal-500/20',
  },
};

const icons = {
  alta: '↑',
  media: '→',
  baixa: '↓',
};

export default function PriorityTag({ priority }) {
  const pri = PRIORITIES[priority];
  if (!pri) return null;
  const colors = colorMap[pri.color];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      <span className="text-[10px]">{icons[priority]}</span>
      {pri.label}
    </span>
  );
}
