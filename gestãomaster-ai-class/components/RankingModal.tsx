import React, { useEffect, useState } from 'react';
import { X, Trophy } from 'lucide-react';
import Leaderboard from './Leaderboard';
import { Competitor } from '../types';
import { getLeaderboard } from '../services/userService';

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const RankingModal: React.FC<RankingModalProps> = ({ isOpen, onClose, userId }) => {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchRanking = async () => {
        setIsLoading(true);
        const data = await getLeaderboard(userId);
        setCompetitors(data);
        setIsLoading(false);
      };
      fetchRanking();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
               <Trophy size={20} className="text-yellow-600" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-900">Ranking Global</h2>
                <p className="text-xs text-slate-500 font-medium">Sua posição entre os alunos</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden bg-slate-50">
           <Leaderboard competitors={competitors} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default RankingModal;