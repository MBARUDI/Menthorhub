
import React from 'react';
import { ReflectionResponse, Situation } from '../types';

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  situation: Situation | null;
  reflection: ReflectionResponse | null;
  isLoading: boolean;
  error: string | null;
}

const ReflectionModal: React.FC<ReflectionModalProps> = ({ isOpen, onClose, situation, reflection, isLoading, error }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border-t-8 border-blue-500">
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="bg-white px-6 pt-8 pb-10 sm:p-10">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-slate-600 italic">Buscando sabedoria nas Escrituras...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100 text-red-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900">{error}</h3>
                <button
                  onClick={onClose}
                  className="mt-6 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                  Voltar
                </button>
              </div>
            ) : reflection && situation ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="border-b border-slate-100 pb-6">
                  <div className="text-blue-600 font-medium text-sm mb-1 uppercase tracking-wider">Reflexão para quem está</div>
                  <h2 className="text-3xl font-bold text-slate-900 serif leading-tight">{situation.title}</h2>
                  <p className="mt-2 text-slate-500 text-sm font-medium">
                    Passagens: <span className="italic">{situation.references}</span>
                  </p>
                </header>

                <section>
                  <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">Mensagem de Consolo</h3>
                  <p className="text-lg text-slate-700 leading-relaxed italic serif">
                    "{reflection.message}"
                  </p>
                </section>

                <section className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">Mentoria Espiritual</h3>
                  <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {reflection.mentorship}
                  </div>
                </section>

                {reflection.prayer && (
                  <section className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h3 className="text-sm font-bold text-blue-700 uppercase tracking-widest mb-3">Uma Oração para você</h3>
                    <p className="text-blue-800 leading-relaxed serif italic">
                      {reflection.prayer}
                    </p>
                  </section>
                )}

                <div className="pt-6">
                  <button
                    onClick={onClose}
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                  >
                    Amém
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReflectionModal;
