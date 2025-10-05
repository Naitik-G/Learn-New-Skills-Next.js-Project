// components/dashboard/RecentQuizResults.tsx
import Link from "next/link";
import { QuizResult } from "@/components/types";
import { Trophy, ChevronRight, Award, ArrowRight } from "lucide-react";

type RecentQuizResultsProps = {
  results: QuizResult[];
};

export function RecentQuizResults({ results }: RecentQuizResultsProps) {
  return (
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
  );
}