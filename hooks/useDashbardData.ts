// hooks/useDashboardData.ts
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import {
  UserStats,
  QuizResult,
  StatCardProps,
  LearningModuleProps,
} from "@/components/types";
import {
  Award,
  Mic,
  MessageCircle,
  Target,
  Zap,
  Clock,
  LucideIcon,
  Music,
  BookOpen,
} from "lucide-react";

const INITIAL_STATS: UserStats = {
  totalQuizzes: 0,
  averageScore: 0,
  pronunciationAttempts: 0,
  customConversations: 0,
  streak: 0,
  totalLearningTime: 0,
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
    quizAverage: 0,
  });
  const [pronunciationStats, setPronunciationStats] = useState({
    totalAttempts: 0,
    averageAccuracy: 0,
    progressPercentage: 0,
  });
  const [conversationStats, setConversationStats] = useState({
    totalConversations: 0,
    progressPercentage: 0,
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
      const [{ count: pronunciationCount }, { count: conversationCount }] =
        await Promise.all([
          supabase
            .from("pronunciation_attempts")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id),
          supabase
            .from("custom_conversations")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id),
        ]);

      const totalQuizzes = quizData?.length || 0;
      const averageScore = quizData?.length
        ? quizData.reduce(
            (sum, q) => sum + (q.score / q.total_questions) * 100,
            0
          ) / quizData.length
        : 0;

      setStats({
        totalQuizzes,
        averageScore: Math.round(averageScore),
        pronunciationAttempts: pronunciationCount || 0,
        customConversations: conversationCount || 0,
        streak: 7, // Placeholder logic
        totalLearningTime: Math.round(
          (totalQuizzes * 5 + (pronunciationCount || 0) * 2 + (conversationCount || 0) * 3) / 60
        ),
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
        .from("vocabulary_progress")
        .select("*")
        .eq("user_id", user.id);

      if (vocabError) throw vocabError;

      // Fetch vocabulary quiz results
      const { data: vocabQuizData, error: vocabQuizError } = await supabase
        .from("vocabulary_quiz_results")
        .select("percentage")
        .eq("user_id", user.id);

      if (vocabQuizError) throw vocabQuizError;

      // Calculate vocabulary stats
      const totalWords = 200; // Updated total: 40 words per category × 5 categories
      const totalLearned = vocabData?.length || 0;
      const progressPercentage = Math.round((totalLearned / totalWords) * 100);

      // Count categories with at least one learned word
      const categories = new Set(vocabData?.map((item) => item.category) || []);
      const categoriesCompleted = categories.size;

      // Calculate average quiz score
      const quizAverage =
        vocabQuizData && vocabQuizData.length > 0
          ? Math.round(
              vocabQuizData.reduce((sum, q) => sum + q.percentage, 0) /
                vocabQuizData.length
            )
          : 0;

      setVocabularyStats({
        totalLearned,
        progressPercentage,
        categoriesCompleted,
        quizAverage,
      });
    } catch (error) {
      console.error("Error fetching vocabulary stats:", error);
    }
  }, [user, supabase]);

  const fetchPronunciationStats = useCallback(async () => {
    if (!user) return;
    try {
      const { data: pronunciationData, error } = await supabase
        .from("pronunciation_attempts")
        .select("accuracy")
        .eq("user_id", user.id);

      if (error) throw error;

      const totalAttempts = pronunciationData?.length || 0;
      
      // Calculate average accuracy from all attempts
      let averageAccuracy = 0;
      if (totalAttempts > 0) {
        const totalAccuracy = pronunciationData.reduce((sum, attempt) => {
          // accuracy is an array of word accuracies
          const attemptAvg = Array.isArray(attempt.accuracy)
            ? attempt.accuracy.reduce((a, b) => a + b, 0) / attempt.accuracy.length
            : 0;
          return sum + attemptAvg;
        }, 0);
        averageAccuracy = Math.round((totalAccuracy / totalAttempts) * 100);
      }

      // Progress based on number of attempts (cap at 50 attempts = 100%)
      const progressPercentage = Math.min((totalAttempts / 50) * 100, 100);

      setPronunciationStats({
        totalAttempts,
        averageAccuracy,
        progressPercentage: Math.round(progressPercentage),
      });
    } catch (error) {
      console.error("Error fetching pronunciation stats:", error);
    }
  }, [user, supabase]);

  const fetchConversationStats = useCallback(async () => {
    if (!user) return;
    try {
      const { count, error } = await supabase
        .from("custom_conversations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (error) throw error;

      const totalConversations = count || 0;
      // Progress based on number of conversations (cap at 20 conversations = 100%)
      const progressPercentage = Math.min((totalConversations / 20) * 100, 100);

      setConversationStats({
        totalConversations,
        progressPercentage: Math.round(progressPercentage),
      });
    } catch (error) {
      console.error("Error fetching conversation stats:", error);
    }
  }, [user, supabase]);

  // --- Effects and Handlers ---

  useEffect(() => {
    if (!loadingAuth && !user) {
      router.push("/auth/login");
    } else if (user) {
      setLoadingData(true);
      Promise.all([
        fetchResults(),
        fetchUserStats(),
        fetchVocabularyStats(),
        fetchPronunciationStats(),
        fetchConversationStats(),
      ]).finally(() => {
        setLoadingData(false);
      });
    }
  }, [
    user,
    loadingAuth,
    router,
    fetchResults,
    fetchUserStats,
    fetchVocabularyStats,
    fetchPronunciationStats,
    fetchConversationStats,
  ]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }, [supabase, router]);

  // --- Memoized UI Data ---

  const statCards: StatCardProps[] = useMemo(
    () => [
      {
        label: "Total Quizzes",
        value: stats.totalQuizzes,
        icon: Award,
        color: "text-brand",
        bgColor: "bg-brand/10",
      },
      {
        label: "Avg Score",
        value: `${stats.averageScore}%`,
        icon: Target,
        color: "text-success",
        bgColor: "bg-success/10",
      },
      {
        label: "Pronunciation",
        value: stats.pronunciationAttempts,
        icon: Mic,
        color: "text-info",
        bgColor: "bg-info/10",
      },
      {
        label: "Conversations",
        value: stats.customConversations,
        icon: MessageCircle,
        color: "text-fuchsia-600 dark:text-fuchsia-400",
        bgColor: "bg-fuchsia-500/10",
      },
      {
        label: "Day Streak",
        value: stats.streak,
        icon: Zap,
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-500/10",
      },
      {
        label: "Learning Hours",
        value: stats.totalLearningTime,
        icon: Clock,
        color: "text-cyan-700 dark:text-cyan-400",
        bgColor: "bg-cyan-500/10",
      },
      {
        label: "Words Learned",
        value: vocabularyStats.totalLearned,
        icon: BookOpen,
        color: "text-amber-700 dark:text-amber-400",
        bgColor: "bg-amber-500/10",
      },
      {
        label: "Categories",
        value: `${vocabularyStats.categoriesCompleted}/5`,
        icon: BookOpen,
        color: "text-teal-700 dark:text-teal-400",
        bgColor: "bg-teal-500/10",
      },
    ],
    [stats, vocabularyStats]
  );

  const learningModules: LearningModuleProps[] = useMemo(
    () => [
      {
        title: "Conversations",
        description: "Explore diverse topics and generate custom AI conversations",
        icon: MessageCircle as LucideIcon,
        path: "/aiTopic",
        tone: "bg-info/12 text-info",
      },
      {
        title: "Pronunciation Practice",
        description: "Improve your speaking with AI-powered feedback",
        icon: Mic as LucideIcon,
        path: "/pronunciation",
        tone: "bg-success/12 text-success",
      },
      {
        title: "Quiz Master",
        description: "Test your knowledge with interactive quizzes",
        icon: Award as LucideIcon,
        path: "/quiz",
        tone: "bg-brand/12 text-brand",
      },
      {
        title: "Vocabulary Builder",
        description: "Learn fruits, foods, dishes, and more with interactive quizzes",
        icon: BookOpen as LucideIcon,
        path: "/vocabulary",
        tone: "bg-warning/20 text-amber-700 dark:text-warning",
      },
    ],
    []
  );

  return {
    user,
    stats,
    results,
    loading: loadingAuth || loadingData,
    handleLogout,
    statCards,
    learningModules,
    vocabularyStats,
    pronunciationStats,
    conversationStats,
  };
};