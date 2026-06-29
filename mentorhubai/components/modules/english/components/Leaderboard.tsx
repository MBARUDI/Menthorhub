import React from 'react';
import { LeaderboardEntry } from '../types';
import { TrophyIcon } from './icons';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  onClose: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ entries, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden relative">
        
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 transform -skew-y-6 scale-150 origin-top-left"></div>
          <TrophyIcon className="w-12 h-12 mx-auto mb-2 drop-shadow-md" />
          <h2 className="text-3xl font-black tracking-tight drop-shadow-sm">TOP 10 DA SEMANA</h2>
          <p className="text-white/90 text-sm mt-1 font-medium">Quem está dominando o ranking?</p>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl leading-none hover:scale-110 transition-transform"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          <div className="space-y-3">
            {entries.map((entry, index) => {
              let rankStyle = "bg-white border-slate-200 text-slate-600";
              let rankIcon = null;

              if (index === 0) {
                rankStyle = "bg-yellow-50 border-yellow-300 text-yellow-700 shadow-sm";
                rankIcon = "🥇";
              } else if (index === 1) {
                rankStyle = "bg-slate-50 border-slate-300 text-slate-700 shadow-sm";
                rankIcon = "🥈";
              } else if (index === 2) {
                rankStyle = "bg-orange-50 border-orange-200 text-orange-700 shadow-sm";
                rankIcon = "🥉";
              }

              if (entry.isCurrentUser) {
                  rankStyle += " ring-2 ring-blue-500 ring-offset-2";
              }

              return (
                <div key={index} className={`flex items-center p-3 rounded-xl border ${rankStyle} transition-transform hover:scale-[1.01]`}>
                  <div className="w-8 text-center font-bold text-lg">
                    {rankIcon || (index + 1)}
                  </div>
                  <div className="mx-3">
                     <img src={entry.avatar} alt={entry.name} className="w-10 h-10 rounded-full bg-slate-200 shadow-sm" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold ${entry.isCurrentUser ? 'text-blue-600' : ''}`}>
                        {entry.name} {entry.isCurrentUser && "(Você)"}
                    </p>
                  </div>
                  <div className="text-right font-mono font-bold text-lg">
                    {entry.score.toLocaleString()} <span className="text-xs font-normal opacity-70">XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-200 text-center">
          <p className="text-xs text-slate-400 mb-3">Continue praticando para subir no ranking!</p>
          <button 
            onClick={onClose}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
