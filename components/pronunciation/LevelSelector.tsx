// components/pronunciation/LevelSelector.tsx
import { Level, levelConfig } from '@/components/types';

interface LevelSelectorProps {
  levelConfig: any;
  selectedLevel: Level;
  onLevelChange: (level: Level) => void;
  customSentenceCount: number;
  beginnerSentenceCount: number;
  intermediateSentenceCount: number;
  advancedSentenceCount: number;
}

export const LevelSelector = ({
  levelConfig,
  selectedLevel,
  onLevelChange,
  customSentenceCount,
  beginnerSentenceCount,
  intermediateSentenceCount,
  advancedSentenceCount,
}: LevelSelectorProps) => {
  const sentenceCounts: Record<string, number> = {
    beginner: beginnerSentenceCount,
    intermediate: intermediateSentenceCount,
    advanced: advancedSentenceCount,
    custom: customSentenceCount,
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-foreground mb-4 text-center">Choose Your Level</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(levelConfig).map(([level, config]: [string, any]) => {
          const IconComponent = config.icon;
          const isSelected = selectedLevel === level;
          const count = sentenceCounts[level] ?? 0;

          return (
            <button
              key={level}
              onClick={() => onLevelChange(level as Level)}
              className={`
                group p-4 rounded-lg border-2 transition-all duration-200 text-center
                ${isSelected
                  ? 'border-brand bg-accent text-accent-foreground shadow-soft'
                  : 'border-border bg-card text-foreground hover:border-brand/60 hover:bg-accent/50'
                }
              `}
            >
              <div className="flex items-center justify-center mb-2">
                <IconComponent
                  size={32}
                  className={isSelected ? 'text-brand' : 'text-muted-foreground group-hover:text-brand'}
                />
              </div>
              <h3 className={`font-semibold mb-1 text-foreground`}>
                {config.name}
              </h3>
              <p className={`text-sm text-muted-foreground`}>
                {config.description}
              </p>
              <div className={`mt-2 text-xs text-muted-foreground`}>
                {count} sentences
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};