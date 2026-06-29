import React, { useState, useEffect } from 'react';
import { UserCircle2, ArrowRight, Loader2, Search, UserPlus, User } from 'lucide-react';
import { getAllUsers } from '../services/userService';
import { UserProfile } from '../types';

interface OnboardingModalProps {
  onComplete: (name: string, existingId?: string) => void;
  isLoading: boolean;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete, isLoading }) => {
  const [name, setName] = useState('');
  const [existingUsers, setExistingUsers] = useState<Partial<UserProfile>[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers();
        setExistingUsers(users);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingList(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length > 2) {
      onComplete(name.trim());
    }
  };

  const handleSelectUser = (user: Partial<UserProfile>) => {
    if (user.name && user.id) {
      onComplete(user.name, user.id);
    }
  };

  const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-emerald-500'];
  const getColor = (n: string) => colors[(n.length) % colors.length];

  const filteredUsers = existingUsers.filter(u => 
    u.name?.toLowerCase().includes(name.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative flex flex-col max-h-[90vh]">
        
        <div className="p-6 pb-2 text-center shrink-0">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-sm">
               <UserCircle2 size={32} />
            </div>

            <h2 className="text-xl font-bold text-slate-900">Quem é você?</h2>
            <p className="text-sm text-slate-500 mt-1">Selecione seu perfil ou crie um novo.</p>
        </div>

        <div className="px-6 py-2 shrink-0">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Buscar ou digitar novo nome..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium"
                    autoFocus
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-2 min-h-[150px]">
            {isLoadingList ? (
                <div className="flex justify-center py-8 text-slate-400">
                    <Loader2 className="animate-spin" />
                </div>
            ) : (
                <>
                    {filteredUsers.length > 0 && (
                        <div className="space-y-2">
                             <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">Alunos Cadastrados</div>
                             {filteredUsers.map(user => (
                                navigateToSelectUser(user)
                             ))}
                        </div>
                    )}

                    {name.trim().length > 2 && !filteredUsers.find(u => u.name?.toLowerCase() === name.trim().toLowerCase()) && (
                         <div className="mt-4 pt-2 border-t border-slate-100">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Novo Aluno</div>
                            <button 
                                onClick={handleSubmitNew}
                                disabled={isLoading}
                                className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-all text-left group"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                                    <UserPlus size={18} />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-blue-900">Entrar como "{name}"</div>
                                    <div className="text-xs text-blue-600">Criar novo perfil e começar do zero</div>
                                </div>
                                {isLoading ? <Loader2 className="animate-spin text-blue-600" /> : <ArrowRight size={18} className="text-blue-600" />}
                            </button>
                         </div>
                    )}

                    {filteredUsers.length === 0 && name.trim().length <= 2 && (
                         <div className="text-center py-8 text-slate-400 text-sm">
                             Nenhum aluno encontrado com esse nome.<br/>Digite para criar um novo.
                         </div>
                    )}
                </>
            )}
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-400">
            GestãoMaster AI • Login Seguro
        </div>
      </div>
    </div>
  );

  function navigateToSelectUser(user: Partial<UserProfile>) {
    return (
      <button
          key={user.id}
          onClick={() => handleSelectUser(user)}
          disabled={isLoading}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group text-left"
      >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 ${getColor(user.name || '')}`}>
              <User size={18} />
          </div>
          <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-700 group-hover:text-blue-700 truncate">{user.name}</div>
              <div className="text-xs text-slate-400 font-medium">{user.xp || 0} XP acumulados</div>
          </div>
          <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500" />
      </button>
    );
  }
};

export default OnboardingModal;
