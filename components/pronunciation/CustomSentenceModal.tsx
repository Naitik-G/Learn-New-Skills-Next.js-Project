// components/pronunciation/CustomSentenceModal.tsx
import { Sparkles, Loader2, Save, X } from 'lucide-react';

interface CustomSentenceModalProps {
  show: boolean;
  sentenceText: string;
  isGenerating: boolean;
  onTextChange: (text: string) => void;
  onAdd: () => void;
  onClose: () => void;
}

export const CustomSentenceModal = ({
  show,
  sentenceText,
  isGenerating,
  onTextChange,
  onAdd,
  onClose,
}: CustomSentenceModalProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-muted rounded-2xl shadow-2xl border border-border w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <Sparkles className="text-brand" size={22} />
            <h2 className="text-xl font-semibold text-foreground">Add Custom Sentence</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">
              Your sentence
            </label>
            <textarea
              value={sentenceText}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Type or paste an English sentence here…"
              rows={4}
              disabled={isGenerating}
              className="w-full px-4 py-3 bg-card border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none disabled:opacity-50 transition"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              AI will generate IPA and readable phonetics for your sentence.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onAdd}
              disabled={isGenerating || !sentenceText.trim()}
              className="flex items-center space-x-2 px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Generating…</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Sentence</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};