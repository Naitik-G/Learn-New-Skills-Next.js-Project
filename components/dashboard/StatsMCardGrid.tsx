// components/dashboard/StatCardGrid.tsx
import { StatCardProps } from "@/components/types";

type StatCardGridProps = {
  statCards: StatCardProps[];
};

export function StatCardGrid({ statCards }: StatCardGridProps) {
  return (
    <section aria-label="Your stats" className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="card-surface flex items-center gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${stat.bgColor}`}>
              <Icon className={`size-5 ${stat.color}`} />
            </span>
            <div className="min-w-0">
              <div className="font-display text-2xl font-semibold leading-none">{stat.value}</div>
              <div className="mt-1 truncate text-xs text-muted-foreground">{stat.label}</div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
