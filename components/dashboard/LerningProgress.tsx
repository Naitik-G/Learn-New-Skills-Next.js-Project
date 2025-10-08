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
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold">Learning Progress</h3>
      </div>

      <div className="space-y-4">
        {/* Quiz Mastery */}
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
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-slate-500">
              {stats.totalQuizzes} quizzes completed
            </span>
          </div>
        </div>

        {/* Vocabulary Learning */}
        {vocabularyStats && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-300">Vocabulary Learning</span>
              <span className="text-orange-400 font-medium">{vocabularyProgress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                style={{ width: `${vocabularyProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-slate-500">
                {vocabularyStats.totalLearned}/200 words
              </span>
              {vocabularyStats.quizAverage > 0 && (
                <span className="text-xs text-slate-500">
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
              <span className="text-slate-300">Pronunciation Practice</span>
              <span className="text-green-400 font-medium">{pronunciationProgress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${pronunciationProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-slate-500">
                {pronunciationStats.totalAttempts} attempts
              </span>
              {pronunciationStats.averageAccuracy > 0 && (
                <span className="text-xs text-slate-500">
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
              <span className="text-slate-300">Conversation Skills</span>
              <span className="text-blue-400 font-medium">{conversationProgress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${conversationProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-slate-500">
                {conversationStats.totalConversations} conversations
              </span>
            </div>
          </div>
        )}

        {/* Total Learning Time */}
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
  );
}