
import React, { useState } from 'react';
import { Level, UserProgress, LessonProgress } from '../types';
import { LEVELS, LESSONS_PER_LEVEL } from '../constants';
import { CheckCircleIcon, TrophyIcon, ChartBarIcon } from './icons';

interface ProgressDashboardProps {
  userProgress: UserProgress;
  onClose: () => void;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ userProgress, onClose }) => {
  const [activeTab, setActiveTab] = useState<Level>(Level.Beginner);

  // Filter levels to only show the main learning levels (excluding Conversation for now as it's open-ended)
  const progressLevels = LEVELS.filter(l => l !== Level.Conversation);

  const calculateLevelStats = (level: Level) => {
    const levelData = userProgress[level];
    if (!levelData) return { completed: 0, totalCorrect: 0, totalExercises: 0 };

    let completed = 0;
    let totalCorrect = 0;
    let totalExercises = 0;

    Object.values(levelData.lessons).forEach((lesson: LessonProgress) => {
      if (lesson.isCompleted) completed++;
      totalCorrect += lesson.correctExercises;
      totalExercises += lesson.totalExercises;
    });

    return { completed, totalCorrect, totalExercises };
  };

  const renderLessonList = () => {
    const levelData = userProgress[activeTab];
    const lessons = [];

    for (let i = 1; i <= LESSONS_PER_LEVEL; i++) {
      const lessonData = levelData?.lessons[i];
      const isLocked = i > 1 && (!levelData?.lessons[i - 1]?.isCompleted && !lessonData);
      
      // Calculate percentage if data exists
      const percentage = lessonData && lessonData.totalExercises > 0 
        ? Math.round((lessonData.correctExercises / lessonData.totalExercises) * 100) 
        : 0;

      lessons.push(
        <div key={i} className={`p-4 rounded-lg border mb-3 flex items-center justify-between ${
          lessonData?.isCompleted 
            ? 'bg-green-50 border-green-200' 
            : isLocked 
              ? 'bg-slate-50 border-slate-200 opacity-60' 
              : 'bg-white border-slate-300'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              lessonData?.isCompleted ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {i}
            </div>
            <div>
              <p className="font-semibold text-slate-800">Lição {i}</p>
              <p className="text-xs text-slate-500">
                {lessonData ? new Date(lessonData.lastPlayed).toLocaleDateString() : isLocked ? 'Bloqueado' : 'Não iniciado'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {lessonData && (
              <div className="text-right">
                <span className={`text-sm font-bold ${percentage >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                  {percentage}%
                </span>
                <p className="text-xs text-slate-500">Acertos</p>
              </div>
            )}
            {lessonData?.isCompleted && (
               <CheckCircleIcon className="w-6 h-6 text-green-500" />
            )}
          </div>
        </div>
      );
    }
    return lessons;
  };

  const stats = calculateLevelStats(activeTab);
  const progressPercent = Math.round((stats.completed / LESSONS_PER_LEVEL) * 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrophyIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Meu Progresso</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {progressLevels.map(level => (
            <button
              key={level}
              onClick={() => setActiveTab(level)}
              className={`px-6 py-4 font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === level 
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          
          {/* Summary Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
            <div className="flex justify-between items-end mb-2">
              <h3 className="font-bold text-slate-700">Progresso do Nível</h3>
              <span className="text-blue-600 font-bold">{stats.completed}/{LESSONS_PER_LEVEL} Lições</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="mt-3 text-sm text-slate-500">
                {stats.totalExercises > 0 
                    ? `Precisão total nos exercícios: ${Math.round((stats.totalCorrect / stats.totalExercises) * 100)}%`
                    : "Complete lições para ver suas estatísticas."}
            </p>
          </div>

          {/* Lesson List */}
          <div>
            {renderLessonList()}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 text-center">
          <button 
            onClick={onClose}
            className="px-8 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
