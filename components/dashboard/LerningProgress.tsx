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
};

export function LearningProgress({ stats, vocabularyStats }: LearningProgressProps) {
  const pronunciationProgress = Math.min(stats.pronunciationAttempts * 2, 100);
  const conversationProgress = Math.min(stats.customConversations * 5, 100);
  const vocabularyProgress = vocabularyStats?.progressPercentage || 0;

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
                {vocabularyStats.totalLearned}/40 words
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
        </div>

        {/* Conversation Skills */}
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
        </div>

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