import React from 'react';
import { Volume2, Pause, ChevronLeft, ChevronRight, Star, Check, Trophy, Loader2 } from 'lucide-react';
import { Category, VocabularyItem } from '@/components/types';

interface VocabularyCardProps {
  currentCategory: Category;
  currentItem: VocabularyItem;
  currentIndex: number;
  learnedWords: Set<string>;
  isSaving: boolean;
  isPlaying: boolean;
  goToPrevious: () => void;
  goToNext: () => void;
  speakWord: (word: string) => void;
  toggleLearned: (word: string) => Promise<void>;
  startQuiz: () => void;
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({
  currentCategory,
  currentItem,
  currentIndex,
  learnedWords,
  isSaving,
  isPlaying,
  goToPrevious,
  goToNext,
  speakWord,
  toggleLearned,
  startQuiz,
}) => {
  return (
    <div className="bg-muted rounded-2xl shadow-2xl p-8 border border-border">
      {/* Progress Indicator */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-2">
          {currentCategory.items.map((item, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex 
                  ? `bg-${currentCategory.color}-500`
                  : learnedWords.has(item.word)
                  ? 'bg-green-500'
                  : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Vocabulary Card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-xl p-8 border border-border text-center mb-6">
          <div className="text-8xl mb-4">{currentItem.image}</div>
          
          <h2 className="text-4xl font-bold text-foreground mb-2">{currentItem.word}</h2>
          
          <div className="flex items-center justify-center space-x-4 mb-4">
            <span className="text-muted-foreground font-mono bg-muted px-4 py-2 rounded border border-border">
              {currentItem.phonetic}
            </span>
            <button
              onClick={() => speakWord(currentItem.word)}
              className="p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Volume2 size={20} />}
            </button>
          </div>

          <div className="bg-muted rounded-lg p-4 border border-border mb-4">
            <p className="text-foreground/80 italic">&quot;{currentItem.example}&quot;</p>
          </div>

          <button
            onClick={() => toggleLearned(currentItem.word)}
            disabled={isSaving}
            className={`flex items-center space-x-2 mx-auto px-4 py-2 rounded-lg font-medium transition-colors ${
              learnedWords.has(currentItem.word)
                ? 'bg-success hover:bg-success/90 text-success-foreground'
                : 'bg-secondary hover:bg-muted-foreground/30 text-foreground'
            } ${isSaving ? 'opacity-50 cursor-wait' : ''}`}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : learnedWords.has(currentItem.word) ? (
              <>
                <Check size={16} />
                <span>Learned</span>
              </>
            ) : (
              <>
                <Star size={16} />
                <span>Mark as Learned</span>
              </>
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={goToPrevious}
            className="flex items-center space-x-2 px-6 py-3 bg-secondary hover:bg-muted-foreground/30 text-foreground rounded-lg font-medium transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Previous</span>
          </button>

          <div className="text-center">
            <span className="text-foreground/80">
              {currentIndex + 1} / {currentCategory.items.length}
            </span>
          </div>

          <button
            onClick={goToNext}
            className="flex items-center space-x-2 px-6 py-3 bg-secondary hover:bg-muted-foreground/30 text-foreground rounded-lg font-medium transition-colors"
          >
            <span>Next</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Quiz Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={startQuiz}
          className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
        >
          <Trophy size={20} />
          <span>Test Your Knowledge</span>
        </button>
      </div>
    </div>
  );
};

export default VocabularyCard;