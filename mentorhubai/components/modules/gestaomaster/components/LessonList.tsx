import React from 'react';
import { Lesson } from '../types';
import { PlayCircle, CheckCircle2 } from 'lucide-react';

interface LessonListProps {
  lessons: Lesson[];
  currentLessonId: string;
  onSelectLesson: (lesson: Lesson) => void;
  completedLessonIds: string[];
}

const LessonList: React.FC<LessonListProps> = ({ lessons, currentLessonId, onSelectLesson, completedLessonIds }) => {
  const progressPercentage = Math.round((completedLessonIds.length / lessons.length) * 100);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <div className="flex justify-between items-end mb-2">
           <h2 className="font-bold text-slate-800 text-lg">Conteúdo do Curso</h2>
           <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{progressPercentage}% Concluído</span>
        </div>
        
        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progressPercentage}%` }}
            ></div>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-right">{completedLessonIds.length} de {lessons.length} aulas</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {lessons.map((lesson, index) => {
          const isActive = lesson.id === currentLessonId;
          const isCompleted = completedLessonIds.includes(lesson.id);
          
          return (
            <button
              key={lesson.id}
              onClick={() => onSelectLesson(lesson)}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-start gap-3 group border border-transparent
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'hover:bg-slate-100 hover:border-slate-200 text-slate-700'
                }
                ${isCompleted && !isActive ? 'bg-slate-50/80' : ''}
              `}
            >
              <div className={`mt-0.5 shrink-0 transition-colors
                 ${isActive ? 'text-blue-200' : ''}
                 ${!isActive && isCompleted ? 'text-green-500' : 'text-slate-400 group-hover:text-blue-500'}
              `}>
                {isActive ? (
                    <PlayCircle size={18} />
                ) : isCompleted ? (
                    <CheckCircle2 size={18} className="fill-green-100 stroke-green-600" />
                ) : (
                    <div className="font-mono text-xs font-bold w-5 text-center">{index + 1}</div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-medium leading-tight mb-1 truncate ${isActive ? 'text-white' : isCompleted ? 'text-slate-600' : 'text-slate-800'}`}>
                  {lesson.title}
                </h3>
                <div className="flex items-center gap-2">
                   <span className={`text-[10px] uppercase tracking-wider font-semibold 
                      ${isActive ? 'text-blue-200' : isCompleted ? 'text-green-600' : 'text-slate-400'}
                   `}>
                    {isCompleted ? 'Concluído' : (lesson.duration || 'Vídeo')}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LessonList;
