import React from 'react';
import { Volume2, Star, Check, Trophy } from 'lucide-react';
import { Category } from '@/components/types';

interface VocabularyGridProps {
  currentCategory: Category;
  learnedWords: Set<string>;
  speakWord: (word: string) => void;
  toggleLearned: (word: string) => Promise<void>;
  startQuiz: () => void;
  setCardView: (index: number) => void;
}

const VocabularyGrid: React.FC<VocabularyGridProps> = ({
  currentCategory,
  learnedWords,
  speakWord,
  toggleLearned,
  startQuiz,
  setCardView,
}) => {
  return (
    <div className="bg-muted rounded-2xl shadow-2xl p-8 border border-border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          All {currentCategory.name}
        </h2>
        <button
          onClick={startQuiz}
          className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
        >
          <Trophy size={16} />
          <span>Quiz</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentCategory.items.map((item, index) => (
          <div
            key={index}
            className="bg-card rounded-lg p-4 border border-border hover:border-input transition-all cursor-pointer group"
            onClick={() => setCardView(index)}
          >
            <div className="text-center">
              <div className="text-5xl mb-2">{item.image}</div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-brand transition-colors">
                {item.word}
              </h3>
              <p className="text-xs text-muted-foreground font-mono mb-2">{item.phonetic}</p>
              
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakWord(item.word);
                  }}
                  className="p-2 bg-muted hover:bg-secondary text-foreground/80 rounded transition-colors"
                >
                  <Volume2 size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLearned(item.word);
                  }}
                  className={`p-2 rounded transition-colors ${
                    learnedWords.has(item.word)
                      ? 'bg-success text-success-foreground'
                      : 'bg-muted hover:bg-secondary text-foreground/80'
                  }`}
                >
                  {learnedWords.has(item.word) ? <Check size={14} /> : <Star size={14} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VocabularyGrid;