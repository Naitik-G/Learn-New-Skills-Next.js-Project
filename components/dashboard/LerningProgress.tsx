// components/dashboard/LearningProgress.tsx
import { UserStats } from "@/components/types";
import { BarChart3, TrendingUp } from "lucide-react";

type LearningProgressProps = {
  stats: UserStats;
  vocabularyStats?: {
    totalLearned: number;
    progressPercentage: number;
    categoriesCompleted: number;
    quizAverage: number;
  };
  pronunciationStats?: {
    totalAttempts: number;
    averageAccuracy: number;
    progressPercentage: number;
  };
  conversationStats?: {
    totalConversations: number;
    progressPercentage: number;
  };
};

export function LearningProgress({ 
  stats, 
  vocabularyStats,
  pronunciationStats,
  conversationStats 
}: LearningProgressProps) {
  const vocabularyProgress = vocabularyStats?.progressPercentage || 0;
  const pronunciationProgress = pronunciationStats?.progressPercentage || 0;
  const conversationProgress = conversationStats?.progressPercentage || 0;

  return (
    <section className="card-surface p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="grid size-10 place-items-center rounded-xl bg-info/12 text-info">
          <BarChart3 className="size-5" />
        </span>
        <h3 className="text-xl font-semibold">Learning progress</h3>
      </div>

      <div className="space-y-4">
        {/* Quiz Mastery */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-foreground/80">Quiz Mastery</span>
            <span className="text-brand font-medium">{stats.averageScore}%</span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand to-brand/60 transition-all duration-500"
              style={{ width: `${stats.averageScore}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">
              {stats.totalQuizzes} quizzes completed
            </span>
          </div>
        </div>

        {/* Vocabulary Learning */}
        {vocabularyStats && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-foreground/80">Vocabulary Learning</span>
              <span className="text-amber-700 dark:text-amber-400 font-medium">{vocabularyProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                style={{ width: `${vocabularyProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                {vocabularyStats.totalLearned}/200 words
              </span>
              {vocabularyStats.quizAverage > 0 && (
                <span className="text-xs text-muted-foreground">
                  Quiz avg: {vocabularyStats.quizAverage}%
                </span>
              )}
            </div>
          </div>
        )}

        {/* Pronunciation Practice */}
        {pronunciationStats && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-foreground/80">Pronunciation Practice</span>
              <span className="text-success font-medium">{pronunciationProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-success to-success/60 transition-all duration-500"
                style={{ width: `${pronunciationProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                {pronunciationStats.totalAttempts} attempts
              </span>
              {pronunciationStats.averageAccuracy > 0 && (
                <span className="text-xs text-muted-foreground">
                  Avg accuracy: {pronunciationStats.averageAccuracy}%
                </span>
              )}
            </div>
          </div>
        )}

        {/* Conversation Skills */}
        {conversationStats && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-foreground/80">Conversation Skills</span>
              <span className="text-info font-medium">{conversationProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-info to-info/60 transition-all duration-500"
                style={{ width: `${conversationProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                {conversationStats.totalConversations} conversations
              </span>
            </div>
          </div>
        )}

        {/* Total Learning Time */}
        <div className="pt-4 mt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <span className="text-sm text-foreground/80">Keep it up!</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {stats.totalLearningTime}h total learning
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
