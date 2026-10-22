// components/vocabulary/CategorySelector.tsx
import React from 'react';
import { BookOpen, Grid, List, Lock, Sparkles, Trash2 } from 'lucide-react';
import { Category, VocabularyItem } from '@/components/types';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import AIVocabularyGenerator from './AIVocabularyGenerator';
import { AICategory } from '@/app/vocabulary/page';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
  learnedWords: Set<string>;
  viewMode: 'grid' | 'cards';
  setViewMode: (mode: 'grid' | 'cards') => void;
  user: User | null;
  guestLimit?: number;
  onAIWordsGenerated: (topic: string, words: VocabularyItem[]) => void;
  aiCategories: AICategory[];
  onDeleteAISet: (supabaseId: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  learnedWords,
  viewMode,
  setViewMode,
  user,
  guestLimit = 10,
  onAIWordsGenerated,
  aiCategories,
  onDeleteAISet,
}) => {
  const router = useRouter();

  return (
    <div className="bg-muted rounded-2xl shadow-2xl p-8 border border-border mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <BookOpen className="text-brand" size={32} />
          <h1 className="text-3xl font-bold text-foreground">Vocabulary Builder</h1>
        </div>
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          {!user && (
            <div className="text-right mr-2">
              <p className="text-xs text-amber-600 dark:text-amber-400">Guest Mode</p>
              <button
                onClick={() => router.push('/auth/login')}
                className="text-sm text-brand hover:text-brand underline"
              >
                Log in to save progress
              </button>
            </div>
          )}
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Words Learned</p>
            <p className="text-2xl font-bold text-brand">{learnedWords.size}</p>
          </div>

          {/* AI Generate button */}
          <AIVocabularyGenerator onWordsGenerated={onAIWordsGenerated} />

          <button
            onClick={() => setViewMode(viewMode === 'cards' ? 'grid' : 'cards')}
            className="p-2 bg-secondary hover:bg-muted-foreground/30 text-foreground rounded-lg transition-colors"
            title={viewMode === 'cards' ? 'Grid View' : 'Card View'}
          >
            {viewMode === 'cards' ? <Grid size={20} /> : <List size={20} />}
          </button>
        </div>
      </div>

      {/* Static Category Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map(category => {
          const IconComponent = category.icon;
          const isSelected = selectedCategory === category.id;
          const learnedInCategory = category.items.filter(item =>
            learnedWords.has(item.word)
          ).length;
          const isLimited = !user && category.items.length === guestLimit;

          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? `border-${category.color}-500 bg-${category.color}-950/50`
                  : 'border-border bg-card hover:border-input'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <IconComponent
                  size={28}
                  className={isSelected ? `text-${category.color}-400` : 'text-muted-foreground'}
                />
              </div>
              <h3 className={`font-semibold text-sm ${
                isSelected ? `text-${category.color}-300` : 'text-foreground/80'
              }`}>
                {category.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                {learnedInCategory}/{category.items.length} learned
                {isLimited && <Lock size={10} className="text-amber-600 dark:text-amber-400" />}
              </p>
            </button>
          );
        })}
      </div>

      {/* AI-Generated Categories */}
      {aiCategories.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles size={12} className="text-brand" />
            AI Generated Sets
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {aiCategories.map(aiCat => {
              const isSelected = selectedCategory === aiCat.id;
              const learnedInCat = aiCat.items.filter(i => learnedWords.has(i.word)).length;

              return (
                <div key={aiCat.id} className="relative group">
                  <button
                    onClick={() => setSelectedCategory(aiCat.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? 'border-brand bg-brand/10'
                        : 'border-border bg-card hover:border-brand/60'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <Sparkles
                        size={28}
                        className={isSelected ? 'text-brand' : 'text-muted-foreground'}
                      />
                    </div>
                    <h3 className={`font-semibold text-sm truncate text-center ${
                      isSelected ? 'text-brand' : 'text-foreground/80'
                    }`}>
                      {aiCat.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      {learnedInCat}/{aiCat.items.length} learned
                    </p>
                    {!aiCat.isSaved && (
                      <p className="text-xs text-amber-500 mt-1 text-center">unsaved</p>
                    )}
                  </button>

                  {/* Delete button — only for saved (logged-in) sets */}
                  {aiCat.isSaved && user && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAISet(aiCat.supabaseId!);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-destructive/10 hover:bg-destructive/90 text-destructive hover:text-white rounded transition-all"
                      title="Delete this set"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;