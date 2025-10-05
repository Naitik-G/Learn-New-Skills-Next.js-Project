// components/dashboard/LearningModules.tsx
import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { LearningModuleProps } from "@/components/types";

type LearningModulesProps = {
  modules: LearningModuleProps[];
};

export function LearningModules({ modules }: LearningModulesProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Learning Modules</h3>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Activity className="w-4 h-4" />
          <span>Choose your adventure</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module, index) => {
          const Icon = module.icon;
          return (
            <Link
              key={index}
              href={module.path}
              className={`group p-6 rounded-xl ${module.bgColor} border ${module.borderColor} backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg hover:shadow-${module.color.split('-')[1]}-500/20`}
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold mb-2 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-slate-300">
                {module.title}
              </h4>
              <p className="text-slate-400 text-sm mb-4">{module.description}</p>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300 group-hover:text-white">
                Start Learning
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}