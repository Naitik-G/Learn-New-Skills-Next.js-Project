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
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="text-brand" size={24} />
            Generate AI Conversation
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">
              Conversation Topic
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Describe the topic you want people to discuss... (e.g., 'The impact of artificial intelligence on education')"
              className="w-full px-3 py-2 bg-muted border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              rows={3}
              disabled={isGenerating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">
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
                        ? "bg-brand/20 border-brand text-brand"
                        : "bg-muted border-input text-foreground/80 hover:border-input"
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
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {errorMessage}
            </div>
          )}

          {isGenerating && (
            <div className="p-3 bg-brand/10 border border-brand/20 rounded-lg flex items-center gap-2 text-brand">
              <Loader2 className="animate-spin" size={16} />
              <span>Generating conversation with AI...</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onGenerate}
              disabled={!topic.trim() || isGenerating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-brand to-brand/70 hover:opacity-90 disabled:from-muted-foreground/40 disabled:to-muted-foreground/40 text-primary-foreground rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
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
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-brand/10 border border-brand/20 rounded-lg">
            <p className="text-sm text-brand">
              <strong>AI-Powered:</strong> Gemini will create realistic conversations between multiple people discussing your chosen topic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}