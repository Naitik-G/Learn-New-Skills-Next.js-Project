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
      <h2 className="text-xl font-semibold text-white mb-4 text-center">Choose Your Level</h2>
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
                  ? 'border-white bg-white text-black'
                  : 'border-gray-600 bg-gray-900 text-white hover:bg-white hover:border-white hover:text-black'
                }
              `}
            >
              <div className="flex items-center justify-center mb-2">
                <IconComponent
                  size={32}
                  className={isSelected ? 'text-black' : 'text-gray-400 group-hover:text-black'}
                />
              </div>
              <h3 className={`font-semibold mb-1 ${isSelected ? 'text-black' : 'text-white group-hover:text-black'}`}>
                {config.name}
              </h3>
              <p className={`text-sm ${isSelected ? 'text-gray-700' : 'text-gray-400 group-hover:text-gray-700'}`}>
                {config.description}
              </p>
              <div className={`mt-2 text-xs ${isSelected ? 'text-gray-600' : 'text-gray-500 group-hover:text-gray-600'}`}>
                {count} sentences
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};