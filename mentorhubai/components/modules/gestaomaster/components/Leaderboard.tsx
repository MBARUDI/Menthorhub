import React from 'react';
import { Competitor } from '../types';
import { Medal, User } from 'lucide-react';

interface LeaderboardProps {
  competitors: Competitor[];
  isLoading?: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ competitors, isLoading }) => {
  
  if (isLoading) {
      return (
        <div className="h-full p-8 flex items-center justify-center">
            <p className="text-slate-400 animate-pulse">Carregando ranking...</p>
        </div>
      )
  }

  const displayList = [...competitors].sort((a, b) => b.score - a.score);
  
  const currentUser = displayList.find(c => c.isUser);
  const currentUserRank = displayList.findIndex(c => c.isUser) + 1;

  return (
    <div className="flex flex-col h-full relative bg-slate-50">
      <div className="flex-1 overflow-y-auto p-2 space-y-2 pb-20">
        {displayList.length === 0 && (
            <div className="text-center p-8 text-slate-400 text-sm flex flex-col items-center gap-2">
                <span>🏆</span>
                <span>Seja o primeiro a pontuar!</span>
                <span className="text-xs text-slate-300">Complete as provas para aparecer aqui.</span>
            </div>
        )}

        {displayList.map((item, index) => {
          const rank = index + 1;
          const isUser = item.isUser;
          
          let rankBadge;
          if (rank === 1) rankBadge = <Medal size={20} className="text-yellow-500" />;
          else if (rank === 2) rankBadge = <Medal size={20} className="text-slate-400" />;
          else if (rank === 3) rankBadge = <Medal size={20} className="text-amber-700" />;
          else rankBadge = <span className="font-bold text-slate-400 w-5 text-center text-sm">{rank}º</span>;

          return (
            <div 
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all border 
                ${isUser 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
            >
              <div className="w-8 flex justify-center shrink-0">
                  {rankBadge}
              </div>
              
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 ${item.avatarColor}`}>
                  {isUser ? <User size={18} /> : item.name.substring(0,2).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold truncate ${isUser ? 'text-blue-700' : 'text-slate-700'}`}>
                      {item.name} {isUser && '(Você)'}
                  </h3>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isUser ? 'bg-blue-500' : 'bg-slate-300'}`} 
                        style={{ width: `${Math.min((item.score / 500) * 100, 100)}%` }} 
                      ></div>
                  </div>
              </div>

              <div className="text-right shrink-0 min-w-[60px]">
                  <span className={`block font-bold text-sm ${isUser ? 'text-blue-600' : 'text-slate-700'}`}>
                      {item.score || 0}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-medium">XP</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {currentUser && (
          <div className="absolute bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-lg z-20 flex items-center gap-4">
              <div className="flex flex-col items-center justify-center shrink-0 w-10">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Posição</span>
                  <span className="font-bold text-slate-800 text-lg">{currentUserRank}º</span>
              </div>
              
               <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 ${currentUser.avatarColor}`}>
                  <User size={18} />
              </div>
              
              <div className="flex-1 min-w-0">
                  <div className="text-xs text-blue-600 uppercase font-bold mb-0.5">Seu Desempenho</div>
                  <div className="text-sm font-bold text-slate-800 truncate">{currentUser.name}</div>
              </div>
              
              <div className="text-right">
                  <div className="font-black text-blue-600 text-xl leading-none">
                      {currentUser.score}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total XP</span>
              </div>
          </div>
      )}
    </div>
  );
};

export default Leaderboard;
