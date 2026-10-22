import React from 'react';
import { Play, Pause, Mic, MicOff, RotateCcw, Volume2, ChevronLeft, ChevronRight, Trash2, Sparkles } from 'lucide-react';
import { Sentence } from "@/data/pronunciation";
import { Level, WordAccuracy, LevelConfig } from '@/app/pronunciation/page'; // Adjust import path

interface PracticeDisplayProps {
    currentSentenceData: Sentence;
    currentSentencesLength: number;
    currentSentenceIndex: number;
    wordAccuracy: WordAccuracy;
    selectedLevel: Level;
    currentLevelConfig: LevelConfig & { accuracyThreshold: number };
    isListening: boolean;
    isPlaying: boolean;
    userTranscript: string;
    currentRecording: string | null;
    speechRecognitionSupported: boolean;
    
    // Handlers
    speakText: () => void;
    stopSpeech: () => void;
    startRecording: () => void;
    stopRecording: () => void;
    resetPractice: () => void;
    playRecording: (audioUrl: string) => void;
    goToPreviousSentence: () => void;
    goToNextSentence: () => void;
    deleteCustomSentence: (index: number) => void;
    
    router: { push: (path: string) => void };
    user: any; // User type
}

export const PracticeDisplay: React.FC<PracticeDisplayProps> = ({
    currentSentenceData,
    currentSentencesLength,
    currentSentenceIndex,
    wordAccuracy,
    selectedLevel,
    currentLevelConfig,
    isListening,
    isPlaying,
    userTranscript,
    currentRecording,
    speechRecognitionSupported,
    speakText,
    stopSpeech,
    startRecording,
    stopRecording,
    resetPractice,
    playRecording,
    goToPreviousSentence,
    goToNextSentence,
    deleteCustomSentence,
    router,
    user
}) => {
    
    const overallAccuracy = wordAccuracy.length > 0 
        ? wordAccuracy.reduce((sum, w) => sum + w.accuracy, 0) / wordAccuracy.length 
        : 0;

    const isOverallCorrect = overallAccuracy >= currentLevelConfig.accuracyThreshold;

    const renderWordFeedback = (word: string, index: number) => {
        const accuracy = wordAccuracy[index];
        return (
            <span
                key={index}
                className={`mx-1 px-2 py-1 rounded transition-colors duration-300 ${
                    accuracy
                        ? accuracy.isCorrect
                          ? 'bg-success/10 text-success border border-success/30'
                          : 'bg-destructive/10 text-destructive border border-destructive/40'
                        : 'bg-secondary text-foreground/80'
                }`}
            >
                {word}
            </span>
        );
    };

    const renderEmptyStateForCustom = () => (
        <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground/80 mb-2">No Custom Sentences Yet</h3>
            {/* The main page handles the full empty state, but this is a fallback for the display area */}
            <p className="text-muted-foreground">Add a custom sentence above to start practicing.</p>
        </div>
    );
    
    if (!currentSentenceData) {
        return renderEmptyStateForCustom();
    }

    return (
        <>
            {/* Progress indicator */}
            <div className="flex justify-center mb-6">
              <div className="flex space-x-2">
                {Array.from({ length: currentSentencesLength }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentSentenceIndex 
                        ? `bg-${currentLevelConfig.color}-500`
                        : index < currentSentenceIndex 
                        ? 'bg-emerald-500' 
                        : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Current sentence display */}
            <div className="bg-card rounded-lg p-6 mb-6 border border-border">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Sentence {currentSentenceIndex + 1} of {currentSentencesLength}
                  </span>
                  {selectedLevel === 'custom' && (
                    <button
                      onClick={() => deleteCustomSentence(currentSentenceIndex)}
                      className="text-destructive hover:text-destructive p-1"
                      title="Delete this sentence"
                      disabled={!user}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Target sentence with word highlighting */}
              <div className="text-xl mb-4 text-center leading-relaxed">
                {wordAccuracy.length > 0 ? (
                  currentSentenceData.words.map(renderWordFeedback)
                ) : (
                  <span className="text-foreground">{currentSentenceData.text}</span>
                )}
              </div>
              
              {/* Phonetic transcription */}
              <div className="text-center text-muted-foreground text-sm mb-4">
                <span className="font-mono bg-muted px-3 py-1 rounded border border-border">
                  {currentSentenceData.readablePhonetic}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {/* Listen button */}
              <button
                onClick={isPlaying ? stopSpeech : speakText}
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
                onClick={isListening ? stopRecording : startRecording}
                disabled={!speechRecognitionSupported && !isListening}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  isListening
                    ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground animate-pulse'
                    : speechRecognitionSupported
                    ? 'bg-success hover:bg-success/90 text-success-foreground'
                    : 'bg-secondary text-muted-foreground cursor-not-allowed'
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
                onClick={resetPractice}
                className="flex items-center space-x-2 px-6 py-3 bg-secondary hover:bg-muted-foreground/30 text-foreground rounded-lg font-medium transition-colors"
              >
                <RotateCcw size={20} />
                <span>Reset</span>
              </button>
            </div>

            {/* User's transcript */}
            {userTranscript && (
              <div className="bg-brand/10 border border-brand rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-brand mb-2">You said:</h3>
                <p className="text-brand text-lg">{userTranscript}</p>
              </div>
            )}

            {/* Accuracy feedback */}
            {wordAccuracy.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-foreground mb-3">Accuracy Feedback:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {wordAccuracy.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded ${
                        item.isCorrect ? 'bg-success/10 border border-success/30' : 'bg-destructive/10 border border-destructive/30'
                      }`}
                    >
                      <span className={`font-medium ${item.isCorrect ? 'text-success' : 'text-destructive'}`}>{item.word}</span>
                      <span className={`text-sm ${
                        item.isCorrect ? 'text-success' : 'text-destructive'
                      }`}>
                        {Math.round(item.accuracy * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Overall accuracy score */}
                <div className="mt-4 p-3 bg-muted rounded border border-border">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground/80">Overall Accuracy:</span>
                    <span className={`text-lg font-bold ${
                      isOverallCorrect ? 'text-success' : 'text-destructive'
                    }`}>
                      {Math.round(overallAccuracy * 100)}%
                    </span>
                  </div>
                  {isOverallCorrect ? (
                    <p className="text-sm text-success mt-1">You met the {currentLevelConfig.name} level requirement!</p>
                  ) : (
                    <p className="text-sm text-destructive mt-1">
                      Keep practicing! You need {Math.round(currentLevelConfig.accuracyThreshold * 100)}% for {currentLevelConfig.name} level.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Recording playback */}
            {currentRecording && (
              <div className="bg-amber-500/10 border border-amber-500/40 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-amber-700 dark:text-amber-300 mb-2">Your Recording:</h3>
                <button
                  onClick={() => playRecording(currentRecording)}
                  className="flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                >
                  <Volume2 size={16} />
                  <span>Play Recording</span>
                </button>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={goToPreviousSentence}
                disabled={currentSentenceIndex === 0}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentSentenceIndex === 0
                    ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                <ChevronLeft size={20} />
                <span>Previous</span>
              </button>

              <div className="text-center">
                <span className="text-foreground/80">
                  {currentSentenceIndex + 1} / {currentSentencesLength}
                </span>
                <div className="text-xs text-muted-foreground mt-1">
                  {currentLevelConfig.name} Level
                </div>
              </div>

              <button
                onClick={goToNextSentence}
                disabled={currentSentenceIndex === currentSentencesLength - 1}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentSentenceIndex === currentSentencesLength - 1
                    ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                <span>Next</span>
                <ChevronRight size={20} />
              </button>
            </div>
        </>
    );
};