// components/pronunciation/ControlPanel.tsx
import { 
  Play, Pause, Mic, MicOff, RotateCcw, Volume2 
} from 'lucide-react';

interface ControlPanelProps {
  sentenceText: string;
  isListening: boolean;
  isPlaying: boolean;
  speechRecognitionSupported: boolean;
  onListen: () => void;
  onRecord: () => void;
  onReset: () => void;
}

export const ControlPanel = ({
  sentenceText, isListening, isPlaying, speechRecognitionSupported,
  onListen, onRecord, onReset
}: ControlPanelProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-6">
      {/* Listen button */}
      <button
        onClick={onListen}
        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
          isPlaying
            ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
            : 'bg-primary hover:bg-primary/90 text-primary-foreground'
        }`}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        <span>{isPlaying ? 'Stop' : 'Listen'}</span>
      </button>

      {/* Record button */}
      <button
        onClick={onRecord}
        disabled={!speechRecognitionSupported && !isListening}
        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
          isListening
            ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground animate-pulse'
            : speechRecognitionSupported
            ? 'bg-success hover:bg-success/90 text-success-foreground'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        }`}
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        <span>
          {isListening 
            ? 'Stop Recording' 
            : speechRecognitionSupported 
            ? 'Practice' 
            : 'Not Supported'
          }
        </span>
      </button>

      {/* Reset button */}
      <button
        onClick={onReset}
        className="flex items-center space-x-2 px-6 py-3 bg-secondary hover:bg-accent text-secondary-foreground border border-border rounded-lg font-medium transition-colors"
      >
        <RotateCcw size={20} />
        <span>Reset</span>
      </button>
    </div>
  );
};