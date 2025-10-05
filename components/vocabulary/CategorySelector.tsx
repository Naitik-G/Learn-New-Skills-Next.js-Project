import React from 'react';
import { BookOpen, Grid, List } from 'lucide-react';
import { Category } from '@/components/types';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
  learnedWords: Set<string>;
  viewMode: 'grid' | 'cards';
  setViewMode: (mode: 'grid' | 'cards') => void;
  user: User | null;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  learnedWords,
  viewMode,
  setViewMode,
  user,
}) => {
  const router = useRouter();

  return (
    <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BookOpen className="text-indigo-400" size={32} />
          <h1 className="text-3xl font-bold text-gray-100">Vocabulary Builder</h1>
          
        </div>
        <div className="flex items-center space-x-4">
          {!user && (
            <div className="text-right mr-4">
              <p className="text-xs text-amber-400">Guest Mode</p>
              <button
                onClick={() => router.push('/login')}
                className="text-sm text-indigo-400 hover:text-indigo-300 underline"
              >
                Log in to save progress
              </button>
            </div>
          )}
          <div className="text-right">
            <p className="text-sm text-gray-400">Words Learned</p>
            <p className="text-2xl font-bold text-indigo-400">{learnedWords.size}</p>
          </div>
          <button
            onClick={() => setViewMode(viewMode === 'cards' ? 'grid' : 'cards')}
            className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
            title={viewMode === 'cards' ? 'Grid View' : 'Card View'}
          >
            {viewMode === 'cards' ? <Grid size={20} /> : <List size={20} />}
          </button>
        </div>
      </div>

      {/* Guest Mode Banner */}
      {!user && (
        <div className="mb-4 p-4 bg-blue-950/30 border border-blue-800 rounded-lg">
          <div className="flex items-start space-x-3">
            <BookOpen className="text-blue-400 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <p className="text-blue-300 font-medium mb-1">👋 You're in Guest Mode</p>
              <p className="text-blue-400 text-sm mb-2">
                You can explore and learn vocabulary, but your progress won't be saved.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Log in to Save Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Selection */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map(category => {
          const IconComponent = category.icon;
          const isSelected = selectedCategory === category.id;
          const learnedInCategory = category.items.filter(item => 
            learnedWords.has(item.word)
          ).length;

          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? `border-${category.color}-500 bg-${category.color}-950/50`
                  : 'border-gray-700 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <IconComponent 
                  size={28} 
                  className={isSelected ? `text-${category.color}-400` : 'text-gray-500'}
                />
              </div>
              <h3 className={`font-semibold text-sm ${
                isSelected ? `text-${category.color}-300` : 'text-gray-300'
              }`}>
                {category.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {learnedInCategory}/{category.items.length} learned
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelector;