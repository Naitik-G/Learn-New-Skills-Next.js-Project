// components/dashboard/StatCardGrid.tsx
import { StatCardProps } from "@/components/types";

type StatCardGridProps = {
  statCards: StatCardProps[];
};

export function StatCardGrid({ statCards }: StatCardGridProps) {
  return (
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
  );
}