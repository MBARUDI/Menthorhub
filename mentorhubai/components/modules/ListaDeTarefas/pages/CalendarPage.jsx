import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTasks, CATEGORIES, PRIORITIES } from '../context/TaskContext';

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const priorityDotColors = {
  alta: 'bg-rose-400',
  media: 'bg-amber-400',
  baixa: 'bg-teal-400',
};

export default function CalendarPage() {
  const { tasks } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, daysInPrevMonth - i),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // Next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  }, [year, month]);

  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((task) => {
      if (task.dueDate) {
        const key = task.dueDate;
        if (!map[key]) map[key] = [];
        map[key].push(task);
      }
    });
    return map;
  }, [tasks]);

  const getDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(year, month + direction, 1));
    setSelectedDate(null);
  };

  const selectedDateKey = selectedDate ? getDateKey(selectedDate) : null;
  const selectedTasks = selectedDateKey ? tasksByDate[selectedDateKey] || [] : [];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-3xl text-white tracking-tight mb-1">
          Calendário
        </h1>
        <p className="text-white/40 text-sm">Visualize suas tarefas no tempo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 glass-card p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-white/50 hover:text-white cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="font-display font-semibold text-xl text-white">
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-white/50 hover:text-white cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="text-center text-xs text-white/30 font-medium uppercase tracking-wider py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayInfo, idx) => {
              const dateKey = getDateKey(dayInfo.date);
              const dayTasks = tasksByDate[dateKey] || [];
              const hasOverdue = dayTasks.some(
                (t) => !t.completed && dayInfo.date < new Date(new Date().setHours(0, 0, 0, 0))
              );
              const isSelected =
                selectedDate &&
                dayInfo.date.getDate() === selectedDate.getDate() &&
                dayInfo.date.getMonth() === selectedDate.getMonth() &&
                dayInfo.date.getFullYear() === selectedDate.getFullYear();

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(dayInfo.date)}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-sm transition-all duration-200 cursor-pointer ${
                    !dayInfo.isCurrentMonth
                      ? 'text-white/10'
                      : isToday(dayInfo.date)
                      ? 'bg-cyan-500/15 text-cyan-400 font-bold'
                      : isSelected
                      ? 'bg-white/[0.08] text-white'
                      : 'text-white/60 hover:bg-white/[0.04]'
                  } ${hasOverdue && dayInfo.isCurrentMonth ? 'ring-1 ring-rose-500/30' : ''}`}
                >
                  <span>{dayInfo.day}</span>
                  {dayTasks.length > 0 && dayInfo.isCurrentMonth && (
                    <div className="flex gap-0.5">
                      {dayTasks.slice(0, 3).map((t, i) => (
                        <span
                          key={i}
                          className={`w-1 h-1 rounded-full ${
                            t.completed ? 'bg-white/20' : priorityDotColors[t.priority] || 'bg-cyan-400'
                          }`}
                        />
                      ))}
                      {dayTasks.length > 3 && (
                        <span className="text-[8px] text-white/30 leading-none">+</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Detail Sidebar */}
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-white mb-4">
            {selectedDate
              ? selectedDate.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })
              : 'Selecione um dia'}
          </h3>

          {selectedDate ? (
            selectedTasks.length > 0 ? (
              <div className="flex flex-col gap-3">
                {selectedTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] ${
                      task.completed ? 'opacity-50' : ''
                    }`}
                  >
                    <p
                      className={`text-sm font-medium mb-1.5 ${
                        task.completed ? 'line-through text-white/30' : 'text-white/80'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex gap-1.5">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                          {
                            trabalho: 'bg-blue-500/15 text-blue-400',
                            pessoal: 'bg-emerald-500/15 text-emerald-400',
                            estudos: 'bg-amber-500/15 text-amber-400',
                          }[task.category]
                        }`}
                      >
                        {CATEGORIES[task.category]?.label}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          {
                            alta: 'bg-rose-500/15 text-rose-400',
                            media: 'bg-amber-500/15 text-amber-400',
                            baixa: 'bg-teal-500/15 text-teal-400',
                          }[task.priority]
                        }`}
                      >
                        {PRIORITIES[task.priority]?.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/20 text-sm">Nenhuma tarefa neste dia</p>
            )
          ) : (
            <p className="text-white/20 text-sm">
              Clique em um dia no calendário para ver as tarefas
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
