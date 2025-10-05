// components/ai-topics/AIGenerationModal.tsx
import { cn } from '@/lib/utils';
import { Sparkles, X, Loader2, Save } from 'lucide-react';

interface AIGenerationModalProps {
  show: boolean;
  topic: string;
  setTopic: (topic: string) => void;
  participantCount: 2 | 3;
  setParticipantCount: (count: 2 | 3) => void;
  isGenerating: boolean;
  errorMessage: string;
  onGenerate: () => void;
  onClose: () => void;
  getParticipantIcon: (count: number) => React.ElementType;
}

export function AIGenerationModal({
  show, topic, setTopic, participantCount, setParticipantCount,
  isGenerating, errorMessage, onGenerate, onClose, getParticipantIcon
}: AIGenerationModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <Sparkles className="text-purple-400" size={24} />
            Generate AI Conversation
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Conversation Topic
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Describe the topic you want people to discuss... (e.g., 'The impact of artificial intelligence on education')"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isGenerating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Number of Participants
            </label>
            <div className="flex gap-3">
              {[2, 3].map((count) => {
                const Icon = getParticipantIcon(count);
                return (
                  <button
                    key={count}
                    onClick={() => setParticipantCount(count as 2 | 3)}
                    disabled={isGenerating}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-lg border transition-all",
                      participantCount === count
                        ? "bg-purple-600/20 border-purple-500 text-purple-300"
                        : "bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500"
                    )}
                  >
                    <Icon size={16} />
                    <span>{count} People</span>
                  </button>
                );
              })}
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {errorMessage}
            </div>
          )}

          {isGenerating && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center gap-2 text-purple-400">
              <Loader2 className="animate-spin" size={16} />
              <span>Generating conversation with AI...</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onGenerate}
              disabled={!topic.trim() || isGenerating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Generate
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-400">
              <strong>AI-Powered:</strong> Gemini will create realistic conversations between multiple people discussing your chosen topic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}