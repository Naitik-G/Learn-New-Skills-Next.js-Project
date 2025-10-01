"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { 
  BookOpen, Mic, MessageCircle, Award, TrendingUp, Clock, 
  Target, BarChart3, Calendar, Sparkles, Music, LogOut,
  ArrowRight, Activity, Trophy, Zap, ChevronRight
} from "lucide-react";

type QuizResult = {
  id: string;
  subject: string;
  difficulty: string;
  score: number;
  total_questions: number;
  created_at: string;
};

type UserStats = {
  totalQuizzes: number;
  averageScore: number;
  pronunciationAttempts: number;
  customConversations: number;
  streak: number;
  totalLearningTime: number;
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [results, setResults] = useState<QuizResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    totalQuizzes: 0,
    averageScore: 0,
    pronunciationAttempts: 0,
    customConversations: 0,
    streak: 0,
    totalLearningTime: 0
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      fetchResults();
      fetchUserStats();
    }
  }, [user, loading]);

  const fetchResults = async () => {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching results:", error.message);
    } else {
      setResults(data || []);
    }
    setLoadingResults(false);
  };

  const fetchUserStats = async () => {
    try {
      // Fetch quiz stats
      const { data: quizData } = await supabase
        .from("quizzes")
        .select("score, total_questions")
        .eq("user_id", user?.id);

      // Fetch pronunciation attempts
      const { count: pronunciationCount } = await supabase
        .from("pronunciation_attempts")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user?.id);

      // Fetch custom conversations
      const { count: conversationCount } = await supabase
        .from("custom_conversations")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user?.id);

      const totalQuizzes = quizData?.length || 0;
      const averageScore = quizData?.length 
        ? (quizData.reduce((sum, q) => sum + (q.score / q.total_questions * 100), 0) / quizData.length)
        : 0;

      setStats({
        totalQuizzes,
        averageScore: Math.round(averageScore),
        pronunciationAttempts: pronunciationCount || 0,
        customConversations: conversationCount || 0,
        streak: 7, // Calculate based on consecutive days
        totalLearningTime: Math.round((totalQuizzes * 5 + (pronunciationCount || 0) * 2) / 60) // Estimated hours
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const learningModules = [
    {
      title: "AI Topics & Conversations",
      description: "Explore diverse topics and generate custom AI conversations",
      icon: MessageCircle,
      path: "/dashboard/aiTopic",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    },
    {
      title: "Pronunciation Practice",
      description: "Improve your speaking with AI-powered feedback",
      icon: Mic,
      path: "/dashboard/pronunciation",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      title: "Custom Sentences",
      description: "Practice with your own AI-generated sentences",
      icon: Sparkles,
      path: "/dashboard/custom-sentences",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      title: "Quiz Master",
      description: "Test your knowledge with interactive quizzes",
      icon: Award,
      path: "/dashboard/quiz",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20"
    },
    {
      title: "Karaoke Learning",
      description: "Learn through music and sing-along practice",
      icon: Music,
      path: "/dashboard/karaoke",
      color: "from-indigo-500 to-violet-500",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20"
    }
  ];

  const statCards = [
    {
      label: "Total Quizzes",
      value: stats.totalQuizzes,
      icon: Award,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10"
    },
    {
      label: "Avg Score",
      value: `${stats.averageScore}%`,
      icon: Target,
      color: "text-green-400",
      bgColor: "bg-green-500/10"
    },
    {
      label: "Pronunciation",
      value: stats.pronunciationAttempts,
      icon: Mic,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      label: "Conversations",
      value: stats.customConversations,
      icon: MessageCircle,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10"
    },
    {
      label: "Day Streak",
      value: stats.streak,
      icon: Zap,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10"
    },
    {
      label: "Learning Hours",
      value: stats.totalLearningTime,
      icon: Clock,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10"
    }
  ];

  if (loading || loadingResults) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  LearnHub
                </h1>
                <p className="text-xs text-slate-400">Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-slate-400">Welcome back,</p>
                <p className="font-medium text-slate-200">{user?.email?.split('@')[0]}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-700"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {user?.email?.split('@')[0]}
            </span>!
          </h2>
          <p className="text-slate-400 text-lg">Ready to continue your learning journey?</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className={`p-4 rounded-xl ${stat.bgColor} border border-slate-700/50 backdrop-blur-sm transition-transform hover:scale-105`}
              >
                <Icon className={`w-6 h-6 ${stat.color} mb-2`} />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Learning Modules */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Learning Modules</h3>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Activity className="w-4 h-4" />
              <span>Choose your adventure</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningModules.map((module, index) => {
              const Icon = module.icon;
              return (
                <Link
                  key={index}
                  href={module.path}
                  className={`group p-6 rounded-xl ${module.bgColor} border ${module.borderColor} backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg hover:shadow-${module.color.split('-')[1]}-500/20`}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-slate-300">
                    {module.title}
                  </h4>
                  <p className="text-slate-400 text-sm mb-4">{module.description}</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-300 group-hover:text-white">
                    Start Learning
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Quiz History */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold">Recent Quiz Results</h3>
              </div>
              <Link 
                href="/dashboard/quiz"
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                View All
                <ChevronRight size={16} />
              </Link>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">No quiz attempts yet</p>
                <Link
                  href="/dashboard/quiz"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors"
                >
                  Take Your First Quiz
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((result) => (
                  <div 
                    key={result.id}
                    className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{result.subject}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        (result.score / result.total_questions * 100) >= 70 
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {result.score}/{result.total_questions}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 capitalize">{result.difficulty}</span>
                      <span className="text-slate-500 text-xs">
                        {new Date(result.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Progress Chart Placeholder */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold">Learning Progress</h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Quiz Mastery</span>
                  <span className="text-purple-400 font-medium">{stats.averageScore}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${stats.averageScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Pronunciation Practice</span>
                  <span className="text-green-400 font-medium">{Math.min(stats.pronunciationAttempts * 2, 100)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.min(stats.pronunciationAttempts * 2, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Conversation Skills</span>
                  <span className="text-blue-400 font-medium">{Math.min(stats.customConversations * 5, 100)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                    style={{ width: `${Math.min(stats.customConversations * 5, 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-slate-300">Keep it up!</span>
                  </div>
                  <span className="text-sm text-slate-400">
                    {stats.totalLearningTime}h total learning
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}