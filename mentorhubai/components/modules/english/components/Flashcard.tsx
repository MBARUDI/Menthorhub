import React, { useState } from 'react';
import { SpeakerWaveIcon, SoundWaveAnimation } from './icons';

interface FlashcardProps {
  word: string;
  meaning: string;
  onSpeak: (text: string) => void;
  speakingText: string | null;
}

const Flashcard: React.FC<FlashcardProps> = ({ word, meaning, onSpeak, speakingText }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSpeak(word);
  };

  return (
    <div 
      className="group h-48 w-full cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className="relative h-full w-full transition-all duration-500"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        
        {/* Front */}
        <div 
          className="absolute inset-0 h-full w-full rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg p-4 flex flex-col items-center justify-center text-white border-2 border-blue-400"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <h3 className="text-2xl font-bold text-center mb-2">{word}</h3>
          <p className="text-xs text-blue-100 mb-4">(Clique para virar)</p>
          <button 
            onClick={handleSpeak}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
             {speakingText === word ? <SoundWaveAnimation className="text-white" /> : <SpeakerWaveIcon className="w-6 h-6 text-white" />}
          </button>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 h-full w-full rounded-xl bg-white shadow-lg p-4 flex flex-col items-center justify-center border-2 border-slate-200"
          style={{ 
            backfaceVisibility: 'hidden', 
            transform: 'rotateY(180deg)' 
          }}
        >
          <h3 className="text-xl font-bold text-slate-800 text-center mb-2">{meaning}</h3>
          <div className="w-8 h-1 bg-blue-500 rounded-full mb-2"></div>
          <p className="text-xs text-slate-400">Tradução</p>
        </div>

      </div>
    </div>
  );
};

export default Flashcard;
