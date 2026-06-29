import React, { useState } from 'react';
import { LevelTest, TestQuestion } from '../types';
import { SpeakerWaveIcon, SoundWaveAnimation, CheckCircleIcon } from './icons';

interface LevelTestComponentProps {
  testData: LevelTest;
  onFinishTest: (answers: Record<number, string>) => void;
  speakingText: string | null;
  onSpeak: (text: string) => void;
  results?: Record<number, { userAnswer: string, correctAnswer: string, isCorrect: boolean }> | null;
}

const SpeakButton: React.FC<{
  text: string;
  speakingText: string | null;
  onSpeak: (text: string) => void;
  small?: boolean;
}> = ({ text, speakingText, onSpeak, small }) => {
  const isSpeaking = speakingText === text;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSpeak(text);
      }}
      className={`rounded-full hover:bg-slate-200 transition-colors flex-shrink-0 flex items-center justify-center ${small ? 'w-6 h-6 ml-2' : 'w-10 h-10'}`}
      aria-label={isSpeaking ? "Parar leitura" : "Ouvir"}
    >
      {isSpeaking ? (
        <SoundWaveAnimation className={small ? "w-4 h-4" : ""} />
      ) : (
        <SpeakerWaveIcon className={`${small ? "w-4 h-4" : "w-6 h-6"} text-slate-500`} />
      )}
    </button>
  );
};

const TestQuestionComponent: React.FC<{
  question: TestQuestion;
  questionNumber: number;
  userAnswer: string | undefined;
  onAnswerChange: (questionId: number, answer: string) => void;
  speakingText: string | null;
  onSpeak: (text: string) => void;
  result?: { userAnswer: string, correctAnswer: string, isCorrect: boolean } | null;
}> = ({ question, questionNumber, userAnswer, onAnswerChange, speakingText, onSpeak, result }) => {
  return (
    <div className={`mb-6 p-4 border-l-4 rounded-r-lg ${result ? (result.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-slate-200'}`}>
      {question.audioText && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between border border-blue-100">
             <span className="text-sm font-bold text-blue-700 uppercase tracking-wide flex items-center gap-2">
                 Audio Clip
             </span>
             <SpeakButton text={question.audioText} speakingText={speakingText} onSpeak={onSpeak} />
        </div>
      )}
      <div className="flex items-start gap-4 mb-3">
        <p className="flex-1 font-semibold text-slate-700">
            {questionNumber}. {question.question}
        </p>
        <SpeakButton text={question.question} speakingText={speakingText} onSpeak={onSpeak} />
      </div>
      <div className="space-y-2">
        {question.options.map((option, index) => {
          let optionClass = 'bg-white border-slate-300';
          
          if (result) {
              if (option === result.correctAnswer) {
                  optionClass = 'bg-green-100 border-green-500 font-bold text-green-800';
              } else if (option === result.userAnswer && !result.isCorrect) {
                  optionClass = 'bg-red-100 border-red-500 text-red-800 line-through';
              } else {
                  optionClass = 'opacity-60 bg-slate-50';
              }
          } else if (userAnswer === option) {
              optionClass = 'bg-blue-100 border-blue-400';
          }

          return (
            <label
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${optionClass} ${!result ? 'hover:bg-slate-50' : ''}`}
            >
                <div className="flex items-center flex-1">
                    <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={result ? option === result.userAnswer : userAnswer === option}
                        onChange={() => !result && onAnswerChange(question.id, option)}
                        disabled={!!result}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{option}</span>
                </div>
                
                <div className="flex items-center">
                    {/* Add Speak Button for Options */}
                    <SpeakButton text={option} speakingText={speakingText} onSpeak={onSpeak} small={true} />
                    {result && option === result.correctAnswer && <CheckCircleIcon className="w-5 h-5 text-green-600 ml-2"/>}
                </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

const LevelTestComponent: React.FC<LevelTestComponentProps> = ({ testData, onFinishTest, speakingText, onSpeak, results }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };
  
  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
      
      {/* Reading Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-700 mb-4 border-b pb-2">Reading</h2>
        <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200">
            <div className="flex items-start gap-4">
                <div className="prose prose-slate max-w-none flex-1">
                    <p>{testData.reading.passage}</p>
                </div>
                <SpeakButton text={testData.reading.passage} speakingText={speakingText} onSpeak={onSpeak} />
            </div>
        </div>
        {testData.reading.questions.map((q, i) => (
          <TestQuestionComponent
            key={q.id}
            question={q}
            questionNumber={i + 1}
            userAnswer={answers[q.id]}
            onAnswerChange={handleAnswerChange}
            speakingText={speakingText}
            onSpeak={onSpeak}
            result={results ? results[q.id] : null}
          />
        ))}
      </section>

      {/* Listening Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-700 mb-4 border-b pb-2">Listening</h2>
         <p className="text-slate-600 mb-4">Listen to the audio clips and answer the questions.</p>
        {testData.listening.questions.map((q, i) => (
          <TestQuestionComponent
            key={q.id}
            question={q}
            questionNumber={testData.reading.questions.length + i + 1}
            userAnswer={answers[q.id]}
            onAnswerChange={handleAnswerChange}
            speakingText={speakingText}
            onSpeak={onSpeak}
            result={results ? results[q.id] : null}
          />
        ))}
      </section>

      {/* Grammar Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-700 mb-4 border-b pb-2">Grammar</h2>
        {testData.grammar.questions.map((q, i) => (
          <TestQuestionComponent
            key={q.id}
            question={q}
            questionNumber={testData.reading.questions.length + testData.listening.questions.length + i + 1}
            userAnswer={answers[q.id]}
            onAnswerChange={handleAnswerChange}
            speakingText={speakingText}
            onSpeak={onSpeak}
            result={results ? results[q.id] : null}
          />
        ))}
      </section>

      {!results && (
          <div className="text-center mt-8">
            <button
            onClick={() => onFinishTest(answers)}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors text-lg"
            >
            Submeter Prova
            </button>
        </div>
      )}
    </div>
  );
};

export default LevelTestComponent;
