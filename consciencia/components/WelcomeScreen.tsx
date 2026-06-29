import React, { useState } from 'react';
import { ArrowRight, BrainCircuit, Target, Heart } from 'lucide-react';
import MicButton from './MicButton';

interface WelcomeScreenProps {
  onStart: (name: string, age: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age.trim()) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    onStart(name, age);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side - Info */}
        <div className="md:w-1/2 bg-indigo-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Background Decor */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-10 right-10 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-32 h-32 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xl shadow-lg">
                CW
              </div>
              <span className="text-2xl font-bold tracking-tight">ConsciousWallet</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Sua jornada para a liberdade financeira começa na mente.
            </h1>
            
            <p className="text-indigo-100 text-lg mb-8 leading-relaxed">
              Diferente de planilhas comuns, unimos <strong>Economia Comportamental</strong> e <strong>Inteligência Artificial</strong> para ajudar você a entender não apenas "quanto" gasta, mas "por que" gasta.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-4 bg-indigo-700/50 p-4 rounded-xl backdrop-blur-sm">
              <BrainCircuit className="text-yellow-400 w-6 h-6 flex-shrink-0" />
              <span className="text-sm font-medium">Análise de padrões subconscientes e sabotadores</span>
            </div>
            <div className="flex items-center gap-4 bg-indigo-700/50 p-4 rounded-xl backdrop-blur-sm">
              <Target className="text-green-400 w-6 h-6 flex-shrink-0" />
              <span className="text-sm font-medium">Plano de vida alinhado aos seus sonhos reais</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center bg-slate-50">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Bem-vindo(a)</h2>
            <p className="text-slate-600 mb-8">Vamos personalizar sua experiência.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Como você quer ser chamado?</label>
                <div className="relative flex items-center bg-white border border-slate-300 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                    <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent text-slate-900 focus:outline-none rounded-xl"
                    placeholder="Seu nome"
                    />
                    <MicButton onTranscript={(text) => setName(text)} className="mr-2" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Qual sua idade?</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Ex: 30"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl flex items-center justify-center gap-2 group"
              >
                Iniciar Jornada
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
            
            <p className="text-center text-xs text-slate-400 mt-8">
              Seus dados são processados localmente e usados apenas para gerar insights personalizados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;