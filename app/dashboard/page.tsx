// app/dashboard/page.tsx
"use client";
import { LoadingState } from "@/components/dashboard/LoadingStats";
import { StatCardGrid } from "@/components/dashboard/StatsMCardGrid";
import { LearningModules } from "@/components/dashboard/LearningModules";
import { RecentQuizResults } from "@/components/dashboard/RecentQuizResult";
import { LearningProgress } from "@/components/dashboard/LerningProgress";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function Dashboard() {
  const { 
    user,
    stats,
    results,
    loading,
    handleLogout,
    statCards,
    learningModules,
    vocabularyStats,
    pronunciationStats,
    conversationStats,
  } = useDashboardData();

  if (loading) {
    return <LoadingState />;
  }

  // user will be defined here because of the redirect logic in the hook
  const displayUsername = user?.email?.split('@')[0] || "Learner";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {displayUsername}
            </span>!
          </h2>
          <p className="text-slate-400 text-lg">Ready to continue your learning journey? 🚀</p>
        </div>

        {/* Stats Grid */}
        <StatCardGrid statCards={statCards} />

        {/* Learning Modules */}
        <LearningModules modules={learningModules} />

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Quiz History */}
          <RecentQuizResults results={results} />

          {/* Progress Chart */}
          <LearningProgress 
            stats={stats} 
            vocabularyStats={vocabularyStats}
            pronunciationStats={pronunciationStats}
            conversationStats={conversationStats}
          />
        </div>
      </main>
    </div>
  );
}