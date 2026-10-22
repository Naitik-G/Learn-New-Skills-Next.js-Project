// app/dashboard/page.tsx
"use client";
import { Flame } from "lucide-react";
import { LoadingState } from "@/components/dashboard/LoadingStats";
import { StatCardGrid } from "@/components/dashboard/StatsMCardGrid";
import { LearningModules } from "@/components/dashboard/LearningModules";
import { RecentQuizResults } from "@/components/dashboard/RecentQuizResult";
import { LearningProgress } from "@/components/dashboard/LerningProgress";
import { useDashboardData } from "@/hooks/useDashbardData";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const {
    user,
    stats,
    results,
    loading,
    statCards,
    learningModules,
    vocabularyStats,
    pronunciationStats,
    conversationStats,
  } = useDashboardData();

  if (loading) {
    return <LoadingState />;
  }

  const displayUsername = user?.email?.split("@")[0] || "Learner";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container-app py-8 md:py-10">
        {/* Welcome */}
        <section className="bg-hero-glow card-surface relative mb-8 overflow-hidden p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{greeting()}</p>
              <h1 className="mt-1 text-3xl font-semibold md:text-4xl">
                Welcome back, <span className="text-brand-gradient">{displayUsername}</span>
              </h1>
              <p className="mt-2 text-muted-foreground">Pick up where you left off, a few minutes a day goes a long way.</p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-soft">
              <Flame className="size-5 text-orange-500" />
              <span className="text-sm font-semibold">{stats.streak}-day streak</span>
            </div>
          </div>
        </section>

        <StatCardGrid statCards={statCards} />
        <LearningModules modules={learningModules} />

        <div className="grid gap-6 lg:grid-cols-2">
          <RecentQuizResults results={results} />
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
