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
const AI_CATEGORY_PREFIX = '__ai__';

// Shape of a saved AI vocabulary set row in Supabase
export interface AIVocabularySet {
  id: string;
  topic: string;
  words: VocabularyItem[];
  created_at: string;
}

// Shape passed to CategorySelector as aiCategories
export interface AICategory {
  id: string;          // e.g. "__ai__<uuid>" or "__ai__pending"
  name: string;
  items: VocabularyItem[];
  isSaved: boolean;
  supabaseId: string | null;
}

const VocabularyPage = () => {
  // --- State ---
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

  // AI vocabulary sets fetched from Supabase (logged-in users)
  const [aiSets, setAiSets] = useState<AIVocabularySet[]>([]);
  // Temporary in-memory set for guest users
  const [pendingAiCategory, setPendingAiCategory] = useState<{
    name: string;
    items: VocabularyItem[];
  } | null>(null);

  const supabase = createClient();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // --- Derived categories ---
  const limitedCategories = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      items: user ? cat.items : cat.items.slice(0, GUEST_LIMIT_PER_CATEGORY),
    }));
  }, [user]);

  // Convert aiSets + optional pending into AICategory[]
  const aiCategories = useMemo((): AICategory[] => {
    const saved: AICategory[] = aiSets.map(set => ({
      id: `${AI_CATEGORY_PREFIX}${set.id}`,
      name: set.topic,
      items: set.words,
      isSaved: true,
      supabaseId: set.id,
    }));

    if (!user && pendingAiCategory) {
      return [
        {
          id: `${AI_CATEGORY_PREFIX}pending`,
          name: pendingAiCategory.name,
          items: pendingAiCategory.items,
          isSaved: false,
          supabaseId: null,
        },
        ...saved,
      ];
    }

    return saved;
  }, [aiSets, pendingAiCategory, user]);

  const allCategories = useMemo(
    () => [...limitedCategories, ...aiCategories] as any[],
    [limitedCategories, aiCategories]
  );

  const currentCategory = useMemo(
    () => allCategories.find(cat => cat.id === selectedCategory) || allCategories[0],
    [selectedCategory, allCategories]
  );

  const currentItem = useMemo(
    () => currentCategory?.items?.[currentIndex] ?? null,
    [currentCategory, currentIndex]
  );

  const totalWordsInAllCategories = useMemo(
    () => limitedCategories.reduce((sum, cat) => sum + cat.items.length, 0),
    [limitedCategories]
  );

  const totalActualWords = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.items.length, 0),
    []
  );

  const totalAllWords =
    totalWordsInAllCategories +
    aiCategories.reduce((s, c) => s + c.items.length, 0);

  // --- Load learned words + saved AI sets on mount ---
  useEffect(() => {
    const init = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const [progressRes, aiRes] = await Promise.all([
          supabase
            .from('vocabulary_progress')
            .select('word, category')
            .eq('user_id', user.id),
          supabase
            .from('ai_vocabulary_sets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
        ]);

        if (progressRes.data) {
          setLearnedWords(new Set(progressRes.data.map(item => item.word)));
        }

        if (aiRes.data) {
          setAiSets(
            aiRes.data.map(row => ({
              id: row.id,
              topic: row.topic,
              words: row.words,
              created_at: row.created_at,
            }))
          );
        }
      } catch (err) {
        console.error('Init error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) init();
  }, [user, authLoading, supabase]);

  // --- AI Words Handler ---
  const handleAIWordsGenerated = async (topic: string, words: VocabularyItem[]) => {
    if (user) {
      // Logged-in: persist to Supabase immediately (same pattern as custom_conversations)
      try {
        const { data: savedData, error } = await supabase
          .from('ai_vocabulary_sets')
          .insert({
            user_id: user.id,
            topic,
            words,       // stored as jsonb column
          })
          .select()
          .single();

        if (error) throw error;

        const newSet: AIVocabularySet = {
          id: savedData.id,
          topic: savedData.topic,
          words: savedData.words,
          created_at: savedData.created_at,
        };

        // Prepend to list and switch to it
        setAiSets(prev => [newSet, ...prev]);
        setSelectedCategory(`${AI_CATEGORY_PREFIX}${savedData.id}`);
      } catch (err) {
        console.error('Error saving AI vocabulary set:', err);
        // Graceful fallback — show in memory even if DB write failed
        setPendingAiCategory({ name: topic, items: words });
        setSelectedCategory(`${AI_CATEGORY_PREFIX}pending`);
      }
    } else {
      // Guest: memory only — prompt to log in to persist
      setPendingAiCategory({ name: topic, items: words });
      setSelectedCategory(`${AI_CATEGORY_PREFIX}pending`);
    }

    setCurrentIndex(0);
    resetQuiz();
  };

  // --- Delete a saved AI set ---
  const handleDeleteAISet = async (supabaseId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('ai_vocabulary_sets')
      .delete()
      .eq('id', supabaseId)
      .eq('user_id', user.id);

    if (!error) {
      setAiSets(prev => prev.filter(s => s.id !== supabaseId));
      if (selectedCategory === `${AI_CATEGORY_PREFIX}${supabaseId}`) {
        setSelectedCategory(limitedCategories[0]?.id || 'fruits');
        setCurrentIndex(0);
      }
    }
  };

  // --- Supabase: save quiz result ---
  const saveQuizResult = async (score: number, total: number, category: string) => {
    if (!user) return;
    try {
      await supabase.from('vocabulary_quiz_results').insert({
        user_id: user.id,
        category,
        score,
        total_questions: total,
        percentage: Math.round((score / total) * 100),
      });
    } catch (err) {
      console.error('Error saving quiz result:', err);
    }
  };

  // --- Helpers ---
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

  const toggleLearned = async (word: string) => {
    const newLearned = new Set(learnedWords);
    const isLearning = !newLearned.has(word);
    isLearning ? newLearned.add(word) : newLearned.delete(word);
    setLearnedWords(newLearned);

    if (user) {
      setIsSaving(true);
      try {
        if (isLearning) {
          const { error } = await supabase.from('vocabulary_progress').insert({
            user_id: user.id,
            word,
            category: selectedCategory,
          });
          if (error && error.code !== '23505') {
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
            newLearned.add(word);
            setLearnedWords(new Set(newLearned));
          }
        }
      } catch (err) {
        console.error('toggleLearned error:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const goToNext = () =>
    setCurrentIndex(i => (i < currentCategory.items.length - 1 ? i + 1 : 0));

  const goToPrevious = () =>
    setCurrentIndex(i => (i > 0 ? i - 1 : currentCategory.items.length - 1));

  const generateQuizQuestion = () => {
    const items = currentCategory?.items || [];
    if (items.length < 4) return;
    const correct = items[Math.floor(Math.random() * items.length)];
    const wrong = items
      .filter(item => item.word !== correct.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(item => item.word);
    const options = [...wrong, correct.word].sort(() => Math.random() - 0.5);
    setCurrentQuizWord(correct);
    setQuizOptions(options);
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
      total: quizScore.total + 1,
    };
    setQuizScore(newScore);
    setCurrentQuizWord(null);
    setTimeout(() => {
      if (newScore.total < 5) {
        generateQuizQuestion();
      } else {
        if (user) saveQuizResult(newScore.correct, newScore.total, selectedCategory);
        setShowQuiz(false);
      }
    }, 1000);
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-900 p-6">
      {authLoading || isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-400" />
            <p className="text-gray-300">Loading vocabulary...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {/* Guest Banner */}
          {!user && (
            <div className="mb-6 p-4 bg-amber-950/30 border border-amber-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <Lock className="text-amber-400 mt-0.5 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <p className="text-amber-300 font-medium mb-1">Guest Mode - Limited Access</p>
                  <p className="text-amber-400 text-sm mb-2">
                    You have access to {totalWordsInAllCategories} out of {totalActualWords} words (
                    {GUEST_LIMIT_PER_CATEGORY} per category). Log in to unlock all words, save AI sets, and track your progress!
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

          {/* Category Selector */}
          <CategorySelector
            categories={limitedCategories}
            selectedCategory={selectedCategory}
            setSelectedCategory={handleCategoryChange}
            learnedWords={learnedWords}
            viewMode={viewMode}
            setViewMode={setViewMode}
            user={user}
            guestLimit={GUEST_LIMIT_PER_CATEGORY}
            onAIWordsGenerated={handleAIWordsGenerated}
            aiCategories={aiCategories}
            onDeleteAISet={handleDeleteAISet}
          />

          {/* Main Content */}
          {currentItem && (
            showQuiz || quizScore.total > 0 ? (
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
            )
          )}

          {/* Stats Footer */}
          <div className="mt-6 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-gray-400 text-sm">{user ? 'Total Words' : 'Available Words'}</p>
                <p className="text-2xl font-bold text-gray-200">
                  {totalAllWords}
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
                  {totalAllWords > 0
                    ? Math.round((learnedWords.size / totalAllWords) * 100)
                    : 0}%
                </p>
              </div>
            </div>
            {!user && (
              <div className="mt-4 p-3 bg-amber-950/30 border border-amber-800 rounded-lg text-center">
                <p className="text-sm text-amber-300">
                  🔒 Log in to save your AI-generated vocabulary sets and track progress
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