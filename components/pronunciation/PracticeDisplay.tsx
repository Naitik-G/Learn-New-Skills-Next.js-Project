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
                          ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700'
                          : 'bg-red-900/50 text-red-300 border border-red-700'
                        : 'bg-gray-700 text-gray-300'
                }`}
            >
                {word}
            </span>
        );
    };

    const renderEmptyStateForCustom = () => (
        <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">No Custom Sentences Yet</h3>
            {/* The main page handles the full empty state, but this is a fallback for the display area */}
            <p className="text-gray-400">Add a custom sentence above to start practicing.</p>
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
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Current sentence display */}
            <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-700">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-sm text-gray-400">
                    Sentence {currentSentenceIndex + 1} of {currentSentencesLength}
                  </span>
                  {selectedLevel === 'custom' && (
                    <button
                      onClick={() => deleteCustomSentence(currentSentenceIndex)}
                      className="text-red-400 hover:text-red-300 p-1"
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
                  <span className="text-gray-200">{currentSentenceData.text}</span>
                )}
              </div>
              
              {/* Phonetic transcription */}
              <div className="text-center text-gray-400 text-sm mb-4">
                <span className="font-mono bg-gray-800 px-3 py-1 rounded border border-gray-700">
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
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
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
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                    : speechRecognitionSupported
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
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
                className="flex items-center space-x-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                <RotateCcw size={20} />
                <span>Reset</span>
              </button>
            </div>

            {/* User's transcript */}
            {userTranscript && (
              <div className="bg-blue-950/30 border border-blue-800 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-blue-300 mb-2">You said:</h3>
                <p className="text-blue-200 text-lg">{userTranscript}</p>
              </div>
            )}

            {/* Accuracy feedback */}
            {wordAccuracy.length > 0 && (
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-200 mb-3">Accuracy Feedback:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {wordAccuracy.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded ${
                        item.isCorrect ? 'bg-emerald-950/30 border border-emerald-800' : 'bg-red-950/30 border border-red-800'
                      }`}
                    >
                      <span className={`font-medium ${item.isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>{item.word}</span>
                      <span className={`text-sm ${
                        item.isCorrect ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {Math.round(item.accuracy * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Overall accuracy score */}
                <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-300">Overall Accuracy:</span>
                    <span className={`text-lg font-bold ${
                      isOverallCorrect ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {Math.round(overallAccuracy * 100)}%
                    </span>
                  </div>
                  {isOverallCorrect ? (
                    <p className="text-sm text-emerald-400 mt-1">You met the {currentLevelConfig.name} level requirement!</p>
                  ) : (
                    <p className="text-sm text-red-400 mt-1">
                      Keep practicing! You need {Math.round(currentLevelConfig.accuracyThreshold * 100)}% for {currentLevelConfig.name} level.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Recording playback */}
            {currentRecording && (
              <div className="bg-amber-950/30 border border-amber-800 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-amber-300 mb-2">Your Recording:</h3>
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
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <ChevronLeft size={20} />
                <span>Previous</span>
              </button>

              <div className="text-center">
                <span className="text-gray-300">
                  {currentSentenceIndex + 1} / {currentSentencesLength}
                </span>
                <div className="text-xs text-gray-500 mt-1">
                  {currentLevelConfig.name} Level
                </div>
              </div>

              <button
                onClick={goToNextSentence}
                disabled={currentSentenceIndex === currentSentencesLength - 1}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentSentenceIndex === currentSentencesLength - 1
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <span>Next</span>
                <ChevronRight size={20} />
              </button>
            </div>
        </>
    );
};