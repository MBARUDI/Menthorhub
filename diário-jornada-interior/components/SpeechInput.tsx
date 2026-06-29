import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface SpeechInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isTextArea?: boolean;
  className?: string;
  label?: React.ReactNode;
}

export const SpeechInput: React.FC<SpeechInputProps> = ({
  value,
  onChange,
  placeholder,
  isTextArea = false,
  className = '',
  label
}) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize recognition instance once on mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Seu navegador não suporta reconhecimento de voz.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Capture the value at the moment we start listening
      const initialValue = value || '';
      
      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        // Accumulate transcript from the current session
        for (let i = 0; i < event.results.length; ++i) {
             transcript += event.results[i][0].transcript;
        }
        
        // Smartly add a space if the initial text didn't end with one and we have new text
        const prefix = (initialValue && !initialValue.endsWith(' ') && transcript) ? ' ' : '';
        onChange(initialValue + prefix + transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Improved visibility classes:
  // - bg-white: solid background
  // - text-stone-900: high contrast text
  // - disabled:opacity-100: prevents text from fading when recording
  const baseClasses = `w-full border border-stone-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white text-stone-900 placeholder:text-stone-400 transition-all disabled:opacity-100 disabled:bg-stone-50 disabled:text-stone-900 ${className}`;

  return (
    <div className="relative group">
      {label && <div className="mb-2">{label}</div>}
      
      <div className="relative">
        {isTextArea ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${baseClasses} pr-12 resize-none`}
            style={{ minHeight: '120px' }}
            disabled={isListening} 
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${baseClasses} pr-12`}
            disabled={isListening}
          />
        )}

        <button
          type="button"
          onClick={toggleListening}
          className={`absolute right-3 top-3 p-2 rounded-full transition-all duration-300 z-10 ${
            isListening 
              ? 'bg-red-50 text-red-600 animate-pulse ring-2 ring-red-400' 
              : 'text-stone-400 hover:text-brand-600 hover:bg-brand-50'
          }`}
          title={isListening ? "Parar gravação" : "Gravar resposta"}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
      </div>
      
      {isListening && (
        <div className="absolute right-14 top-4 flex items-center gap-2 pointer-events-none">
             <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-xs text-red-500 font-medium">Gravando...</span>
        </div>
      )}
    </div>
  );
};