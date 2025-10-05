// components/pronunciation/CustomSentenceModal.tsx
import { Sparkles, Loader2, Save } from 'lucide-react';

interface CustomSentenceModalProps {
  show: boolean;
  sentenceText: string;
  isGenerating: boolean;
  onTextChange: (text: string) => void;
  onAdd: () => void;
  onClose: () => void;
}

export const CustomSentenceModal = ({
  show, sentenceText, isGenerating,
  onTextChange, onAdd, onClose
}: CustomSentenceModalProps) => {
  if (!show) return null;

  // The rest of your modal JSX goes here, using onAdd and onClose directly.
  // ...
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        {/* ... Modal content JSX ... */}
    </div>
  );
};