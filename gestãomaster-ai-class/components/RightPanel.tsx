import React from 'react';
import { Lesson } from '../types';
import LessonList from './LessonList';

interface RightPanelProps {
  lessons: Lesson[];
  currentLesson: Lesson;
  onSelectLesson: (lesson: Lesson) => void;
  userScore: number;
  userId: string;
  completedLessonIds: string[];
}

const RightPanel: React.FC<RightPanelProps> = ({ lessons, currentLesson, onSelectLesson, completedLessonIds }) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Como o Ranking agora está no cabeçalho global, mantemos aqui apenas a lista de aulas */}
        <div className="h-full">
            <LessonList 
                lessons={lessons} 
                currentLessonId={currentLesson.id} 
                onSelectLesson={onSelectLesson}
                completedLessonIds={completedLessonIds}
            />
        </div>
    </div>
  );
};

export default RightPanel;