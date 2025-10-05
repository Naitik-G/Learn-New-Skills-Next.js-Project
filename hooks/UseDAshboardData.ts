// hooks/useDashboardData.ts
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { UserStats, QuizResult, StatCardProps, LearningModuleProps } from "@/components/types";
import { Award, Mic, MessageCircle, Target, Zap, Clock, LucideIcon, Music, BookOpen } from "lucide-react";

const INITIAL_STATS: UserStats = {
  totalQuizzes: 0,
  averageScore: 0,
  pronunciationAttempts: 0,
  customConversations: 0,
  streak: 0,
  totalLearningTime: 0
};

export const useDashboardData = () => {
  const { user, loading: loadingAuth } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [results, setResults] = useState<QuizResult[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [vocabularyStats, setVocabularyStats] = useState({
    totalLearned: 0,
    progressPercentage: 0,
    categoriesCompleted: 0,
    quizAverage: 0
  });

  // --- Data Fetching Functions ---

  const fetchResults = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching results:", error.message);
    } else {
      setResults(data || []);
    }
  }, [user, supabase]);

  const fetchUserStats = useCallback(async () => {
    if (!user) return;
    try {
      // Fetch quiz stats
      const { data: quizData } = await supabase
        .from("quizzes")
        .select("score, total_questions")
        .eq("user_id", user.id);

      // Fetch other counts
      const [{ count: pronunciationCount }, { count: conversationCount }] = await Promise.all([
        supabase.from("pronunciation_attempts").select("*", { count: 'exact', head: true }).eq("user_id", user.id),
        supabase.from("custom_conversations").select("*", { count: 'exact', head: true }).eq("user_id", user.id)
      ]);

      const totalQuizzes = quizData?.length || 0;
      const averageScore = quizData?.length 
        ? (quizData.reduce((sum, q) => sum + (q.score / q.total_questions * 100), 0) / quizData.length)
        : 0;

      setStats({
        totalQuizzes,
        averageScore: Math.round(averageScore),
        pronunciationAttempts: pronunciationCount || 0,
        customConversations: conversationCount || 0,
        streak: 7, // Placeholder logic
        totalLearningTime: Math.round((totalQuizzes * 5 + (pronunciationCount || 0) * 2) / 60) // Estimated hours
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, [user, supabase]);

  const fetchVocabularyStats = useCallback(async () => {
    if (!user) return;
    try {
      // Fetch vocabulary progress
      const { data: vocabData, error: vocabError } = await supabase
        .from('vocabulary_progress')
        .select('*')
        .eq('user_id', user.id);

      if (vocabError) throw vocabError;

      // Fetch vocabulary quiz results
      const { data: vocabQuizData, error: vocabQuizError } = await supabase
        .from('vocabulary_quiz_results')
        .select('percentage')
        .eq('user_id', user.id);

      if (vocabQuizError) throw vocabQuizError;

      // Calculate vocabulary stats
      const totalWords = 40; // Total vocabulary words across all categories
      const totalLearned = vocabData?.length || 0;
      const progressPercentage = Math.round((totalLearned / totalWords) * 100);
      
      // Count categories with at least one learned word
      const categories = new Set(vocabData?.map(item => item.category) || []);
      const categoriesCompleted = categories.size;

      // Calculate average quiz score
      const quizAverage = vocabQuizData && vocabQuizData.length > 0
        ? Math.round(vocabQuizData.reduce((sum, q) => sum + q.percentage, 0) / vocabQuizData.length)
        : 0;

      setVocabularyStats({
        totalLearned,
        progressPercentage,
        categoriesCompleted,
        quizAverage
      });
    } catch (error) {
      console.error("Error fetching vocabulary stats:", error);
    }
  }, [user, supabase]);

  // --- Effects and Handlers ---

  useEffect(() => {
    if (!loadingAuth && !user) {
      router.push("/login");
    } else if (user) {
      setLoadingData(true);
      Promise.all([fetchResults(), fetchUserStats(), fetchVocabularyStats()]).finally(() => {
        setLoadingData(false);
      });
    }
  }, [user, loadingAuth, router, fetchResults, fetchUserStats, fetchVocabularyStats]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/login");
  }, [supabase, router]);

  // --- Memoized UI Data ---

  const statCards: StatCardProps[] = useMemo(() => [
    { label: "Total Quizzes", value: stats.totalQuizzes, icon: Award, color: "text-purple-400", bgColor: "bg-purple-500/10" },
    { label: "Avg Score", value: `${stats.averageScore}%`, icon: Target, color: "text-green-400", bgColor: "bg-green-500/10" },
    { label: "Pronunciation", value: stats.pronunciationAttempts, icon: Mic, color: "text-blue-400", bgColor: "bg-blue-500/10" },
    { label: "Conversations", value: stats.customConversations, icon: MessageCircle, color: "text-pink-400", bgColor: "bg-pink-500/10" },
    { label: "Day Streak", value: stats.streak, icon: Zap, color: "text-yellow-400", bgColor: "bg-yellow-500/10" },
    { label: "Learning Hours", value: stats.totalLearningTime, icon: Clock, color: "text-cyan-400", bgColor: "bg-cyan-500/10" },
    { label: "Words Learned", value: vocabularyStats.totalLearned, icon: BookOpen, color: "text-orange-400", bgColor: "bg-orange-500/10" },
    { label: "Categories", value: `${vocabularyStats.categoriesCompleted}/5`, icon: BookOpen, color: "text-teal-400", bgColor: "bg-teal-500/10" }
  ], [stats, vocabularyStats]);

  const learningModules: LearningModuleProps[] = useMemo(() => [
    { title: "AI Topics & Conversations", description: "Explore diverse topics and generate custom AI conversations", icon: MessageCircle as LucideIcon, path: "/dashboard/aiTopic", color: "from-purple-500 to-pink-500", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/20" },
    { title: "Pronunciation Practice", description: "Improve your speaking with AI-powered feedback", icon: Mic as LucideIcon, path: "/dashboard/pronunciation", color: "from-green-500 to-emerald-500", bgColor: "bg-green-500/10", borderColor: "border-green-500/20" },
    { title: "Custom Sentences", description: "Practice with your own AI-generated sentences", icon: Zap as LucideIcon, path: "/dashboard/custom-sentences", color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20" },
    { title: "Quiz Master", description: "Test your knowledge with interactive quizzes", icon: Award as LucideIcon, path: "/dashboard/quiz", color: "from-orange-500 to-red-500", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/20" },
    { title: "Karaoke Learning", description: "Learn through music and sing-along practice", icon: Music as LucideIcon, path: "/dashboard/karaoke", color: "from-indigo-500 to-violet-500", bgColor: "bg-indigo-500/10", borderColor: "border-indigo-500/20" },
    { title: "Vocabulary Builder", description: "Learn fruits, foods, dishes, and more with interactive quizzes", icon: BookOpen as LucideIcon, path: "/dashboard/vocabulary", color: "from-orange-500 to-amber-500", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/20" }
  ], []);

  return {
    user,
    stats,
    results,
    loading: loadingAuth || loadingData,
    handleLogout,
    statCards,
    learningModules,
    vocabularyStats
  };
};