import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { storageService } from '../services/storageService';
import { UserCircleIcon, LockClosedIcon, ArrowRightOnRectangleIcon, ChevronRightIcon, CheckCircleIcon, EnvelopeIcon } from './icons';

interface AuthScreenProps {
  onAuthenticated: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingUsers, setExistingUsers] = useState<User[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const users = storageService.getAllUsers();
    setExistingUsers(users);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Por favor, preencha o campo Nome Completo.");
      return;
    }

    if (!login.trim()) {
      setError("Por favor, preencha o campo Login.");
      return;
    }

    if (!password.trim()) {
      setError("Por favor, preencha o campo Senha.");
      return;
    }

    if (token !== 'testelinguas') {
        setError("Token inválido. O token secreto é necessário para acessar.");
        return;
    }

    const emailKey = login.trim().toLowerCase();

    try {
      let user = storageService.getUser(emailKey);
      
      if (user) {
         if (user.phone !== password) {
             setError("Senha incorreta para este usuário.");
             return;
         }
      } else {
         user = storageService.register({
             name: name.trim(),
             email: emailKey, 
             phone: password
         });
      }
      
      onAuthenticated(user);
    } catch (err: any) {
      setError("Ocorreu um erro ao entrar.");
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start md:justify-center bg-slate-950 p-4 py-8 font-sans text-white relative overflow-y-auto">
      {/* Decorative Glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-25">
         <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600 rounded-full blur-[140px] animate-pulse" />
         <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-700 rounded-full blur-[140px] animate-pulse" />
      </div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-3xl p-8 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border border-white/10 relative z-10 animate-fade-in my-4 md:my-auto">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2 tracking-tight">GIVE ME</h1>
            <p className="text-slate-400 text-sm font-semibold tracking-wide">Aprenda Inglês, Espanhol e Italiano com IA</p>
        </div>

        {error && (
            <div className="bg-red-950/50 text-red-400 p-3 rounded-2xl mb-4 text-xs font-bold text-center border border-red-500/20">
                {error}
            </div>
        )}

        {success && (
            <div className="bg-green-950/50 text-green-400 p-3 rounded-2xl mb-4 text-xs font-bold text-center flex items-center justify-center gap-2 border border-green-500/20">
                <CheckCircleIcon className="w-4 h-4" /> {success}
            </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="auth-name" className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Seu Nome</label>
                {existingUsers.length > 0 && (
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="text-xs font-black text-blue-400 hover:text-blue-300 flex items-center gap-0.5 uppercase tracking-wider transition-colors"
                        >
                             Selecionar Salvo <ChevronRightIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${showUserMenu ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {showUserMenu && (
                            <>
                                <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowUserMenu(false)}></div>
                                
                                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="bg-white/5 px-4 py-2 border-b border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between items-center">
                                        <span>Usuários Salvos</span>
                                        <span className="bg-blue-950 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full text-[9px] font-black">{existingUsers.length}</span>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                        {existingUsers.map((u, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => {
                                                    setName(u.name);
                                                    setLogin(u.email);
                                                    setPassword(u.phone || '');
                                                    setShowUserMenu(false);
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-white/5 text-slate-300 hover:text-white transition-colors border-b border-white/5 last:border-0 flex items-center gap-2 group font-semibold text-xs"
                                            >
                                               <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-blue-400 transition-colors"></div>
                                               <span className="truncate">{u.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
              </div>
              <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <UserCircleIcon className="h-5 w-5 text-slate-500" />
                  </span>
                  <input
                      id="auth-name"
                      name="auth-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-11 w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold"
                      placeholder="Digite seu nome completo"
                      autoFocus
                      autoComplete="name"
                  />
              </div>
            </div>

            <div>
              <label htmlFor="auth-login" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Login (E-mail ou Usuário)</label>
              <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-slate-500" />
                  </span>
                  <input
                      id="auth-login"
                      name="auth-login"
                      type="text"
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                      className="pl-11 w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold"
                      placeholder="exemplo@email.com"
                      autoComplete="email"
                  />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Senha de Acesso</label>
              <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-slate-500" />
                  </span>
                  <input
                      id="auth-password"
                      name="auth-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold"
                      placeholder="Senha secreta"
                      autoComplete="current-password"
                  />
              </div>
            </div>

            <div>
              <label htmlFor="auth-token" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Token Secreto</label>
              <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-slate-500" />
                  </span>
                  <input
                      id="auth-token"
                      name="auth-token"
                      type="password"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="pl-11 w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold"
                      placeholder="Token de acesso"
                      autoComplete="off"
                  />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-black hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/10 mt-8 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" /> Entrar
            </button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;
