// components/dashboard/RecentQuizResults.tsx
import Link from "next/link";
import { QuizResult } from "@/components/types";
import { Trophy, ChevronRight, Award, ArrowRight } from "lucide-react";

type RecentQuizResultsProps = {
  results: QuizResult[];
};

export function RecentQuizResults({ results }: RecentQuizResultsProps) {
  return (
    <section className="card-surface p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
            <Trophy className="size-5" />
          </span>
          <h3 className="text-xl font-semibold">Recent quizzes</h3>
        </div>
        <Link href="/quiz" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
          Take a quiz <ChevronRight size={16} />
        </Link>
      </div>

      {results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-10 text-center">
          <Award className="mx-auto mb-3 size-10 text-muted-foreground/60" />
          <p className="mb-4 text-muted-foreground">No quiz attempts yet</p>
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Take your first quiz <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {results.map((result) => {
            const pass = (result.score / result.total_questions) * 100 >= 70;
            return (
              <li
                key={result.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:bg-accent/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{result.subject}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    <span className="capitalize">{result.difficulty}</span> · {new Date(result.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                    pass ? "bg-success/15 text-success" : "bg-destructive/12 text-destructive"
                  }`}
                >
                  {result.score}/{result.total_questions}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
