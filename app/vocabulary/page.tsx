// app/vocabulary/page.tsx
"use client"
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Loader2, Lock, LogIn } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/navigation';

// Data and Types
import { categories } from "@/data/vocabularyData";
import { VocabularyItem } from "@/components/types";

// Components
import CategorySelector from '@/components/vocabulary/CategorySelector';
import VocabularyCard from '@/components/vocabulary/VocabularyCard';
import VocabularyGrid from '@/components/vocabulary/VocabularyGrid';
import QuizMode from '@/components/vocabulary/QuizMode';

const GUEST_LIMIT_PER_CATEGORY = 10;

const VocabularyPage = () => {
  // --- State Initialization ---
  const [selectedCategory, setSelectedCategory] = useState<string>('fruits');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'cards'>('cards');
  const [isPlaying, setIsPlaying] = useState(false);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [currentQuizWord, setCurrentQuizWord] = useState<VocabularyItem | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- Hooks and Context ---
  const supabase = createClient();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // --- Computed Values ---
  // Limit categories for guest users
  const limitedCategories = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      items: user ? cat.items : cat.items.slice(0, GUEST_LIMIT_PER_CATEGORY)
    }));
  }, [user]);

  const currentCategory = useMemo(() => 
    limitedCategories.find(cat => cat.id === selectedCategory) || limitedCategories[0]
  , [selectedCategory, limitedCategories]);
  
  const currentItem = useMemo(() => 
    currentCategory.items[currentIndex]
  , [currentCategory, currentIndex]);

  const totalWordsInAllCategories = useMemo(() => 
    limitedCategories.reduce((sum, cat) => sum + cat.items.length, 0)
  , [limitedCategories]);

  const totalActualWords = useMemo(() => 
    categories.reduce((sum, cat) => sum + cat.items.length, 0)
  , []);
  
  // --- Functions (Supabase & Logic) ---

  const resetQuiz = () => {
    setQuizScore({ correct: 0, total: 0 });
    setCurrentQuizWord(null);
    setShowQuiz(false);
  };

  const handleCategoryChange = (id: string) => {
      setSelectedCategory(id);
      setCurrentIndex(0);
      resetQuiz();
  };

  // Load learned words from database
  useEffect(() => {
    const loadLearnedWords = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('vocabulary_progress')
          .select('word, category')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error loading learned words:', error);
          setIsLoading(false);
          return;
        }

        const learned = new Set(data?.map(item => item.word) || []);
        setLearnedWords(learned);
      } catch (error) {
        console.error('Error loading learned words:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      loadLearnedWords();
    }
  }, [user, authLoading, supabase]);

  // Save quiz results to database
  const saveQuizResult = async (score: number, total: number, category: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('vocabulary_quiz_results')
        .insert({
          user_id: user.id,
          category: category,
          score: score,
          total_questions: total,
          percentage: Math.round((score / total) * 100)
        });

      if (error) {
        console.error('Error saving quiz result:', error);
      }
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  };

  // Speak the word
  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  // Mark word as learned
  const toggleLearned = async (word: string) => {
    const newLearned = new Set(learnedWords);
    const isLearning = !newLearned.has(word);

    if (isLearning) {
      newLearned.add(word);
    } else {
      newLearned.delete(word);
    }
    setLearnedWords(newLearned);

    // Save to database if user is logged in
    if (user) {
      setIsSaving(true);
      try {
        if (isLearning) {
          const { error } = await supabase
            .from('vocabulary_progress')
            .insert({
              user_id: user.id,
              word: word,
              category: selectedCategory
            });

          if (error && error.code !== '23505') {
            console.error('Error saving learned word:', error);
            newLearned.delete(word);
            setLearnedWords(new Set(newLearned));
          }
        } else {
          const { error } = await supabase
            .from('vocabulary_progress')
            .delete()
            .eq('user_id', user.id)
            .eq('word', word);

          if (error) {
            console.error('Error removing learned word:', error);
            newLearned.add(word);
            setLearnedWords(new Set(newLearned));
          }
        }
      } catch (error) {
        console.error('Error updating learned word:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Navigation
  const goToNext = () => {
    if (currentIndex < currentCategory.items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(currentCategory.items.length - 1);
    }
  };

  // Quiz Logic
  const generateQuizQuestion = () => {
    const availableItems = currentCategory.items;
    if (availableItems.length < 4) return; 

    const randomIndex = Math.floor(Math.random() * availableItems.length);
    const correctWord = availableItems[randomIndex];
    
    const wrongOptions = availableItems
      .filter(item => item.word !== correctWord.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(item => item.word);
    
    const allOptions = [...wrongOptions, correctWord.word].sort(() => Math.random() - 0.5);
    
    setCurrentQuizWord(correctWord);
    setQuizOptions(allOptions);
  };
  
  const startQuiz = () => {
    setQuizScore({ correct: 0, total: 0 });
    generateQuizQuestion();
    setShowQuiz(true);
  };

  const handleQuizAnswer = (selectedWord: string) => {
    if (!currentQuizWord) return;
    
    const isCorrect = selectedWord === currentQuizWord.word;
    const newScore = {
      correct: quizScore.correct + (isCorrect ? 1 : 0),
      total: quizScore.total + 1
    };
    setQuizScore(newScore);
    setCurrentQuizWord(null);

    setTimeout(() => {
      if (newScore.total < 5) {
        generateQuizQuestion();
      } else {
        if (user) {
          saveQuizResult(newScore.correct, newScore.total, selectedCategory);
        }
        setShowQuiz(false);
      }
    }, 1000);
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-900 p-6">
      {(authLoading || isLoading) ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-400" />
            <p className="text-gray-300">Loading vocabulary...</p>
          </div>
        </div>
      ) : (
      <div className="max-w-7xl mx-auto">
        
        {/* Guest Limit Banner */}
        {!user && (
          <div className="mb-6 p-4 bg-amber-950/30 border border-amber-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <Lock className="text-amber-400 mt-0.5 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="text-amber-300 font-medium mb-1">Guest Mode - Limited Access</p>
                <p className="text-amber-400 text-sm mb-2">
                  You have access to {totalWordsInAllCategories} out of {totalActualWords} words 
                  ({GUEST_LIMIT_PER_CATEGORY} per category). Log in to unlock all {totalActualWords} words and save your progress!
                </p>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="flex items-center space-x-2 text-sm bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <LogIn size={16} />
                  <span>Unlock All Words</span>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Category Selector Component */}
        <CategorySelector
          categories={limitedCategories}
          selectedCategory={selectedCategory}
          setSelectedCategory={handleCategoryChange}
          learnedWords={learnedWords}
          viewMode={viewMode}
          setViewMode={setViewMode}
          user={user}
          guestLimit={GUEST_LIMIT_PER_CATEGORY}
        />

        {/* Conditional Content */}
        {showQuiz || quizScore.total > 0 ? (
          <QuizMode
            currentQuizWord={currentQuizWord}
            quizOptions={quizOptions}
            quizScore={quizScore}
            handleQuizAnswer={handleQuizAnswer}
            resetQuiz={resetQuiz}
          />
        ) : viewMode === 'cards' ? (
          <VocabularyCard
            currentCategory={currentCategory}
            currentItem={currentItem}
            currentIndex={currentIndex}
            learnedWords={learnedWords}
            isSaving={isSaving}
            isPlaying={isPlaying}
            goToPrevious={goToPrevious}
            goToNext={goToNext}
            speakWord={speakWord}
            toggleLearned={toggleLearned}
            startQuiz={startQuiz}
          />
        ) : (
          <VocabularyGrid
            currentCategory={currentCategory}
            learnedWords={learnedWords}
            speakWord={speakWord}
            toggleLearned={toggleLearned}
            startQuiz={startQuiz}
            setCardView={(index) => {
                setCurrentIndex(index);
                setViewMode('cards');
            }}
          />
        )}

        {/* Stats Footer */}
        <div className="mt-6 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-gray-400 text-sm">
                {user ? 'Total Words' : 'Available Words'}
              </p>
              <p className="text-2xl font-bold text-gray-200">
                {totalWordsInAllCategories}
                {!user && <Lock className="inline ml-1" size={16} />}
              </p>
            </div>
            <div className="text-center flex-1">
              <p className="text-gray-400 text-sm">Learned</p>
              <p className="text-2xl font-bold text-green-400">{learnedWords.size}</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-gray-400 text-sm">Progress</p>
              <p className="text-2xl font-bold text-indigo-400">
                {Math.round((learnedWords.size / totalWordsInAllCategories) * 100)}%
              </p>
            </div>
          </div>
          {!user && (
            <div className="mt-4 p-3 bg-amber-950/30 border border-amber-800 rounded-lg text-center">
              <p className="text-sm text-amber-300">
                🔒 Log in to save your progress and see it on your dashboard
              </p>
            </div>
          )}
        </div>
      </div>
      )}

      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default VocabularyPage;