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
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
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
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : speechRecognitionSupported
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
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
        className="flex items-center space-x-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
      >
        <RotateCcw size={20} />
        <span>Reset</span>
      </button>
    </div>
  );
};