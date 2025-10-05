// components/pronunciation/LevelSelector.tsx
import { Level, levelConfig } from '@/components/types';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility

interface LevelSelectorProps {
  selectedLevel: Level;
  sentenceCount: number;
  onLevelChange: (level: Level) => void;
  customSentenceCount: number;
}

export const LevelSelector = ({ selectedLevel, sentenceCount, onLevelChange, customSentenceCount }: LevelSelectorProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Choose Your Level</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(levelConfig).map(([level, config]) => {
          const IconComponent = config.icon;
          const isSelected = selectedLevel === level;
          const count = level === 'custom' ? customSentenceCount : sentenceCount;
          const themeColor = config.color;

          return (
            <button
              key={level}
              onClick={() => onLevelChange(level as Level)}
              // Note: Dynamic Tailwind classes must be fully defined (e.g., bg-green-50, border-green-500)
              // in your source code or safelisted for Tailwind JIT to work correctly.
              className={`p-4 rounded-lg border-2 transition-all duration-200 
                ${isSelected
                  ? `border-${themeColor}-500 bg-${themeColor}-50`
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center justify-center mb-2">
                <IconComponent 
                  size={32} 
                  className={cn(`text-${themeColor}-600`, isSelected ? `text-${themeColor}-600` : 'text-gray-400')}
                />
              </div>
              <h3 className={`font-semibold mb-1 text-${themeColor}-700`}>
                {config.name}
              </h3>
              <p className={`text-sm text-${themeColor}-600`}>
                {config.description}
              </p>
              <div className="mt-2 text-xs text-gray-400">
                {count} sentences
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};