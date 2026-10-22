// components/dashboard/LearningModules.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LearningModuleProps } from "@/components/types";

type LearningModulesProps = {
  modules: LearningModuleProps[];
};

export function LearningModules({ modules }: LearningModulesProps) {
  return (
    <section className="mb-10">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Continue learning</h2>
          <p className="mt-1 text-sm text-muted-foreground">Choose what to practise today</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link
              key={module.title}
              href={module.path}
              className="group card-surface flex flex-col p-5 transition-all hover:-translate-y-1 hover:shadow-lift"
            >
              <span className={`mb-4 grid size-12 place-items-center rounded-2xl transition-transform group-hover:scale-105 ${module.tone}`}>
                <Icon className="size-6" />
              </span>
              <h3 className="text-lg font-semibold">{module.title}</h3>
              <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{module.description}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-all group-hover:gap-2.5">
                Start <ArrowRight className="size-4" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
