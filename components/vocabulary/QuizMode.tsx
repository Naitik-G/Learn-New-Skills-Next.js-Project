// components/vocabulary/QuizMode.tsx
import React, { useState, useEffect } from 'react';
import { Trophy, RotateCcw } from 'lucide-react';
import { VocabularyItem } from '@/components/types';

interface QuizScore {
  correct: number;
  total: number;
}

interface QuizModeProps {
  currentQuizWord: VocabularyItem | null;
  quizOptions: string[];
  quizScore: QuizScore;
  handleQuizAnswer: (selectedWord: string) => void;
  resetQuiz: () => void;
}

const QuizMode: React.FC<QuizModeProps> = ({
  currentQuizWord,
  quizOptions,
  quizScore,
  handleQuizAnswer,
  resetQuiz,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [displayedWord, setDisplayedWord] = useState<VocabularyItem | null>(currentQuizWord);
  const [displayedOptions, setDisplayedOptions] = useState<string[]>(quizOptions);

  const isQuizFinished = quizScore.total >= 5;

  // Update displayed content and reset states when new question arrives
  useEffect(() => {
    if (currentQuizWord && quizOptions.length > 0 && !selectedAnswer) {
      setDisplayedWord(currentQuizWord);
      setDisplayedOptions(quizOptions);
    }
  }, [currentQuizWord, quizOptions, selectedAnswer]);

  // Reset answer states when moving to next question
  useEffect(() => {
    if (currentQuizWord && displayedWord && currentQuizWord.word !== displayedWord.word) {
      setSelectedAnswer(null);
      setIsCorrect(null);
      setDisplayedWord(currentQuizWord);
      setDisplayedOptions(quizOptions);
    }
  }, [currentQuizWord, displayedWord, quizOptions]);

  const handleAnswerClick = (option: string) => {
    if (selectedAnswer || !displayedWord) return;

    const correct = option === displayedWord.word;
    setSelectedAnswer(option);
    setIsCorrect(correct);

    // Immediately call parent handler
    handleQuizAnswer(option);
  };

  // --- Quiz Finished View ---
  if (isQuizFinished && !displayedWord) {
    const percentage = Math.round((quizScore.correct / quizScore.total) * 100);
    
    return (
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700 text-center">
        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-100 mb-4">Quiz Complete!</h2>
        <p className="text-2xl text-indigo-400 mb-2">
          Your Score: {quizScore.correct}/{quizScore.total}
        </p>
        <p className="text-lg text-gray-400 mb-6">
          {percentage}% Correct
        </p>
        
        <div className="mb-6">
          {percentage >= 80 ? (
            <p className="text-green-400 text-lg">Excellent work!</p>
          ) : percentage >= 60 ? (
            <p className="text-yellow-400 text-lg">Good job! Keep practicing.</p>
          ) : (
            <p className="text-orange-400 text-lg">Keep learning, you&apos;ll improve!</p>
          )}
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={resetQuiz}
            className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            <RotateCcw size={20} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // --- Current Question View ---
  if (displayedWord) {
    return (
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700 transition-all duration-300">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-100 mb-2">Quiz Time!</h2>
          <p className="text-gray-400">Question {quizScore.total + 1} of 5</p>
          
          <div className={`mt-4 text-6xl transition-transform duration-500 ${
            selectedAnswer ? 'scale-110' : 'scale-100'
          }`}>
            {displayedWord.image}
          </div>
          
          <p className="mt-4 text-gray-300">What is this?</p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
          {displayedOptions.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isAnswerCorrect = isCorrect && isSelected;
            const isAnswerWrong = isCorrect === false && isSelected;
            const isCorrectAnswer = selectedAnswer && option === displayedWord.word;

            return (
              <button
                key={index}
                onClick={() => handleAnswerClick(option)}
                disabled={selectedAnswer !== null}
                className={`p-4 rounded-lg font-medium transition-all duration-300 border-2 ${
                  isAnswerCorrect
                    ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-500/30'
                    : isAnswerWrong
                    ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/30'
                    : isCorrectAnswer
                    ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-500/30'
                    : selectedAnswer
                    ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed opacity-60'
                    : 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:border-indigo-500 cursor-pointer'
                } ${isSelected ? 'scale-105' : 'scale-100'}`}
              >
                <span className="flex items-center justify-center gap-2">
                  {option}
                  {isAnswerCorrect && <span className="text-xl">✓</span>}
                  {isAnswerWrong && <span className="text-xl">✗</span>}
                  {isCorrectAnswer && !isSelected && <span className="text-xl">✓</span>}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Score: <span className="text-indigo-400 font-bold">{quizScore.correct}/{quizScore.total}</span>
          </p>
        </div>

        {selectedAnswer && (
          <div className="mt-4 text-center animate-fade-in">
            {isCorrect ? (
              <p className="text-green-400 font-medium text-lg">Correct!</p>
            ) : (
              <p className="text-red-400 font-medium text-lg">
                The answer was {displayedWord.word}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
  
  return null;
};

export default QuizMode;