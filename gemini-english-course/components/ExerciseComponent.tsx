import React, { useState } from 'react';
import { ExerciseData, Level, TargetLanguage } from '../types';
import { generateFollowUpExercise } from '../services/geminiService';

interface ExerciseComponentProps {
  exercise: ExerciseData;
  exerciseNumber: number;
  level: Level;
  isFollowUp?: boolean;
  onResult?: (isCorrect: boolean) => void;
  targetLanguage: TargetLanguage;
}

const ExerciseComponent: React.FC<ExerciseComponentProps> = ({ exercise, exerciseNumber, level, isFollowUp = false, onResult, targetLanguage }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [followUpExercise, setFollowUpExercise] = useState<ExerciseData | null>(null);
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState<boolean>(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);

  const handleCheckAnswer = async () => {
    if (submitted) return;
    const isCorrect = userAnswer.trim().toLowerCase() === exercise.correctAnswer.toLowerCase();
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setSubmitted(true);

    if (onResult) {
        onResult(isCorrect);
    }

    if (!isCorrect) {
      setIsLoadingFollowUp(true);
      setFollowUpError(null);
      setExplanation(null);
      try {
        const newExercise = await generateFollowUpExercise(level, exercise, userAnswer, targetLanguage);
        if (newExercise.explanation) {
            setExplanation(newExercise.explanation);
        }
        setFollowUpExercise(newExercise);
      } catch (error) {
        console.error("Failed to generate follow-up exercise", error);
        setFollowUpError("Não foi possível gerar um exercício extra.");
      } finally {
        setIsLoadingFollowUp(false);
      }
    }
  };

  const handleOptionChange = (option: string) => {
    if (submitted) return;
    setUserAnswer(option);
  };

  const renderFeedback = () => {
    if (!feedback) return null;
    if (feedback === 'correct') {
      return (
        <div className="mt-2 text-green-600 font-semibold">
          Correto!
        </div>
      );
    }
    return (
      <div className="mt-2 text-red-600 font-semibold">
        Incorreto. A resposta correta é: {exercise.correctAnswer}
      </div>
    );
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-lg border border-slate-200">
      <p className="font-semibold text-slate-700 mb-3">
        {isFollowUp ? 'Exercício Extra' : `Exercício ${exerciseNumber}`}: {exercise.type === 'fill-in-the-blank' ? "Complete a frase" : exercise.question}
      </p>
      
      {exercise.type === 'multiple-choice' && exercise.options && (
        <div className="space-y-2">
          {exercise.options.map((option, index) => (
            <label key={index} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
              userAnswer === option ? 'bg-blue-100 border-blue-400' : 'bg-white border-slate-300'
            } ${submitted ? 'cursor-not-allowed' : 'hover:bg-slate-50'}`}>
              <input
                type="radio"
                name={`exercise-${exerciseNumber}-${isFollowUp}`}
                value={option}
                checked={userAnswer === option}
                onChange={() => handleOptionChange(option)}
                disabled={submitted}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}
      
      {exercise.type === 'fill-in-the-blank' && (
        <div className="mb-3">
            <p className="text-lg text-slate-800 font-medium mb-2">{exercise.question}</p>
            <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={submitted}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800"
            placeholder="Digite a palavra que falta..."
            autoComplete="off"
            />
        </div>
      )}
      <div className="mt-4">
        {!submitted && (
          <button
            type="button"
            onClick={handleCheckAnswer}
            disabled={!userAnswer}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            Verificar
          </button>
        )}
        {renderFeedback()}
      </div>
      
      {submitted && feedback === 'incorrect' && (
        <div className="mt-4">
          {explanation && (
            <p className="p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-r-lg mb-4">
              {explanation}
            </p>
          )}
          {isLoadingFollowUp && (
            <div className="flex items-center text-slate-500 mt-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <span>Gerando um exercício extra para praticar...</span>
            </div>
          )}
          {followUpError && (
            <p className="text-red-600 bg-red-100 p-3 rounded-lg mt-4">{followUpError}</p>
          )}
          {followUpExercise && (
            <div className="mt-6 border-t border-slate-200 pt-6">
              <ExerciseComponent
                exercise={followUpExercise}
                exerciseNumber={exerciseNumber}
                level={level}
                isFollowUp={true}
                onResult={onResult} 
                targetLanguage={targetLanguage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExerciseComponent;