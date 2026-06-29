import { useState } from 'react';
import { LogIn, Lock, Mail, Settings, Shield, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        onLogin(data.user);
      } else {
        setError(data.message || 'E-mail ou senha incorretos.');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Erro na requisição:', err);
      setError('Erro ao conectar ao servidor.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center">
            <img src="/imgMaximo.png" alt="Maximo Logo" className="w-full h-full object-contain drop-shadow-xl" />
          </div>
          <h1 className="text-4xl font-black text-navy-900 tracking-tight mb-2">Máximo Brasil</h1>
          <p className="text-slate-500 font-medium italic">Acesse seu painel de atendimento</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50"
        >
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu e-mail" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none border hover:border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex justify-between">
                <span>Senha</span>
                <button type="button" className="text-blue-600 hover:underline lowercase">Esqueci a senha</button>
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha secreta" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none border hover:border-slate-200"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-red-500 text-center bg-red-50 py-2 rounded-lg">{error}</p>
            )}

            <button 
              type="submit" 
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 mt-4"
            >
              <LogIn size={20} />
              Entrar no Sistema
            </button>
          </form>
        </motion.div>

        <div className="mt-8 flex items-center justify-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
          <div className="flex items-center gap-1"><Shield size={12} /> Seguro</div>
          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
          <div>v1.0.0</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
