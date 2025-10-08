"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Mic, MicOff, RotateCcw, Volume2, ChevronLeft, ChevronRight, AlertTriangle, Star, TrendingUp, Award, Lock, LogIn } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { sentencesByLevel, type Sentence } from "@/data/pronunciation";
import { useRouter } from 'next/navigation';

const PronunciationPractice = () => {
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [currentSentence, setCurrentSentence] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [wordAccuracy, setWordAccuracy] = useState<Array<{word: string, accuracy: number, isCorrect: boolean}>>([]);
  const [recordings, setRecordings] = useState<(string | null)[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [currentRecording, setCurrentRecording] = useState<string | null>(null);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const supabase = createClient();
  const { user, loading } = useAuth();
  const router = useRouter();

  // Guest user limit
  const GUEST_LIMIT = 20;

  // Level configuration
  const levelConfig = {
    beginner: {
      name: "Beginner",
      icon: Star,
      description: "Simple sentences with basic vocabulary",
      color: "emerald",
      accuracyThreshold: 0.6
    },
    intermediate: {
      name: "Intermediate", 
      icon: TrendingUp,
      description: "Medium complexity sentences with varied vocabulary",
      color: "blue",
      accuracyThreshold: 0.7
    },
    advanced: {
      name: "Advanced",
      icon: Award,
      description: "Complex sentences with advanced vocabulary",
      color: "purple",
      accuracyThreshold: 0.8
    }
  };

  // Get limited or full sentences based on user status
  const getAllSentences = () => {
    const allLevels = Object.values(sentencesByLevel).flat();
    return user ? allLevels : allLevels.slice(0, GUEST_LIMIT);
  };

  const currentSentences = user 
    ? sentencesByLevel[selectedLevel]
    : sentencesByLevel[selectedLevel].slice(0, Math.floor(GUEST_LIMIT / 2));

  const currentLevelConfig = levelConfig[selectedLevel];
  const totalAccessibleSentences = getAllSentences().length;
  const totalSentences = Object.values(sentencesByLevel).flat().length;

  useEffect(() => {
    setRecordings(new Array(currentSentences.length).fill(null));
    setCurrentSentence(0);
    setUserTranscript('');
    setWordAccuracy([]);
    setCurrentRecording(null);
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechRecognitionSupported(false);
      setErrorMessage('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
    }
  }, [selectedLevel, currentSentences.length]);

  const clearError = () => {
    setErrorMessage('');
    setIsRetrying(false);
    retryCountRef.current = 0;
  };

  const handleLevelChange = (level: 'beginner' | 'intermediate' | 'advanced') => {
    if (isListening) stopRecording();
    if (isPlaying) stopSpeech();
    setSelectedLevel(level);
    clearError();
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = selectedLevel === 'beginner' ? 0.7 : selectedLevel === 'intermediate' ? 0.8 : 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeech = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const initializeSpeechRecognition = () => {
    if (!speechRecognitionSupported) return null;

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage('');
        setIsRetrying(false);
        if (retryCountRef.current === 0) {
          setUserTranscript('');
          setWordAccuracy([]);
        }
      };
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setUserTranscript(finalTranscript.trim());
          analyzeAccuracy(finalTranscript.trim(), currentSentences[currentSentence].words);
          retryCountRef.current = 0;
        } else if (interimTranscript) {
          setUserTranscript(interimTranscript.trim() + '...');
        }
      };
      
      recognition.onerror = (event: any) => {
        const errorMessages: {[key: string]: string} = {
          'network': 'Network connection issue. Please check your internet connection.',
          'not-allowed': 'Microphone access denied. Please allow microphone permissions.',
          'no-speech': 'No speech detected. Please speak clearly.',
          'audio-capture': 'No microphone found. Please connect a microphone.',
        };

        if (event.error === 'no-speech') return;
        setErrorMessage(errorMessages[event.error] || `Error: ${event.error}`);
        setIsListening(false);
        setIsRetrying(false);
      };
      
      recognition.onend = () => {
        if (isListening && !isRetrying) {
          setTimeout(() => {
            if (isListening && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                setIsListening(false);
              }
            }
          }, 100);
        } else if (!isRetrying) {
          setIsListening(false);
        }
      };
      
      return recognition;
    } catch (error) {
      setSpeechRecognitionSupported(false);
      setErrorMessage('Failed to initialize speech recognition.');
      return null;
    }
  };

  const analyzeAccuracy = (userText: string, targetWords: string[]) => {
    const userWords = userText.toLowerCase().split(' ');
    const accuracy: Array<{word: string, accuracy: number, isCorrect: boolean}> = [];
    const threshold = currentLevelConfig.accuracyThreshold;
    
    targetWords.forEach((targetWord, index) => {
      const userWord = userWords[index] || '';
      const similarity = calculateSimilarity(
        targetWord.toLowerCase().replace(/[.,!?]/g, ''),
        userWord.replace(/[.,!?]/g, '')
      );
      
      accuracy.push({
        word: targetWord,
        accuracy: similarity,
        isCorrect: similarity > threshold
      });
    });
    
    setWordAccuracy(accuracy);
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    if (longer.length === 0) return 1.0;
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];
    for (let i = 0; i <= str2.length; i++) matrix[i] = [i];
    for (let j = 0; j <= str1.length; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  const startRecording = async () => {
    clearError();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      
      recorder.ondataavailable = (event) => chunksRef.current.push(event.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(blob);
        const newRecordings = [...recordings];
        newRecordings[currentSentence] = audioUrl;
        setRecordings(newRecordings);
        setCurrentRecording(audioUrl);

        if (user) {
          try {
            const fileName = `${user.id}/${selectedLevel}/${Date.now()}-sentence-${currentSentence + 1}.wav`;
            await supabase.storage.from("pronunciation-audio").upload(fileName, blob);
            const { data: publicUrlData } = supabase.storage.from("pronunciation-audio").getPublicUrl(fileName);
            await supabase.from("pronunciation_attempts").insert({
              user_id: user.id,
              sentence: currentSentences[currentSentence].text,
              spoken_text: userTranscript || '',
              audio_url: publicUrlData.publicUrl,
              accuracy: wordAccuracy.map((w) => w.accuracy),
              difficulty_level: selectedLevel,
              sentence_index: currentSentence
            });
          } catch (error) {
            console.error('Upload error:', error);
          }
        }
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsListening(true);
      
      const recognition = initializeSpeechRecognition();
      recognitionRef.current = recognition;
      if (recognition) {
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (error) {
            setErrorMessage('Failed to start speech recognition.');
            setIsListening(false);
          }
        }, 100);
      }
    } catch (error) {
      setErrorMessage('Error accessing microphone. Please check permissions.');
      setIsListening(false);
    }
  };

  const stopRecording = () => {
    setIsListening(false);
    setIsRetrying(false);
    if (mediaRecorder?.state === 'recording') {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
    try {
      recognitionRef.current?.stop();
    } catch {}
  };

  const playRecording = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  };

  const goToNextSentence = () => {
    if (currentSentence < currentSentences.length - 1) {
      setCurrentSentence(currentSentence + 1);
      setUserTranscript('');
      setWordAccuracy([]);
      setCurrentRecording(recordings[currentSentence + 1]);
      clearError();
    }
  };

  const goToPreviousSentence = () => {
    if (currentSentence > 0) {
      setCurrentSentence(currentSentence - 1);
      setUserTranscript('');
      setWordAccuracy([]);
      setCurrentRecording(recordings[currentSentence - 1]);
      clearError();
    }
  };

  const resetPractice = () => {
    setUserTranscript('');
    setWordAccuracy([]);
    stopSpeech();
    clearError();
    setIsListening(false);
    try {
      recognitionRef.current?.stop();
    } catch {}
    if (mediaRecorder?.state === 'recording') {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  };

  const currentSentenceData = currentSentences[currentSentence];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-100">
              Pronunciation Practice
            </h1>
            {/* {!user && (
              <button
                onClick={() => router.push('/login')}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <LogIn size={16} />
                <span>Log In for Full Access</span>
              </button>
            )} */}
          </div>

          {/* Guest Limit Banner */}
          {!user && (
            <div className="mb-6 p-4 bg-amber-950/30 border border-amber-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <Lock className="text-amber-400 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <p className="text-amber-300 font-medium mb-1">Guest Mode - Limited Access</p>
                  <p className="text-amber-400 text-sm mb-2">
                    You have access to 10 out of {totalSentences} sentences. 
                    Log in to unlock all {totalSentences} sentences and save your progress!
                  </p>
                  <button
                    onClick={() => router.push('/login')}
                    className="text-sm bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Unlock All Sentences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Level Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-200 mb-4 text-center">Choose Your Level</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(levelConfig).map(([level, config]) => {
                const IconComponent = config.icon;
                const isSelected = selectedLevel === level;
                const levelSentences = user 
                  ? sentencesByLevel[level as keyof typeof sentencesByLevel].length
                  : Math.floor(GUEST_LIMIT / 2);
                
                return (
                  <button
                    key={level}
                    onClick={() => handleLevelChange(level as 'beginner' | 'intermediate' | 'advanced')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? `border-${config.color}-500 bg-${config.color}-950/50`
                        : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <IconComponent 
                        size={32} 
                        className={isSelected ? `text-${config.color}-400` : 'text-gray-500'}
                      />
                    </div>
                    <h3 className={`font-semibold mb-1 ${
                      isSelected ? `text-${config.color}-300` : 'text-gray-300'
                    }`}>
                      {config.name}
                    </h3>
                    <p className={`text-sm ${
                      isSelected ? `text-${config.color}-400` : 'text-gray-500'
                    }`}>
                      {config.description}
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      {levelSentences} sentences
                      {!user && <Lock className="inline ml-1" size={10} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Level Badge */}
          <div className="flex justify-center mb-6">
            <div className={`inline-flex items-center px-4 py-2 rounded-full bg-${currentLevelConfig.color}-950/50 text-${currentLevelConfig.color}-300 border border-${currentLevelConfig.color}-800`}>
              <currentLevelConfig.icon size={16} className="mr-2" />
              <span className="font-medium">{currentLevelConfig.name} Level</span>
              <span className="ml-2 text-xs opacity-75">
                ({Math.round(currentLevelConfig.accuracyThreshold * 100)}% accuracy needed)
              </span>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-950/30 border border-red-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="text-red-400 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-red-300">{errorMessage}</p>
                  <button
                    onClick={clearError}
                    className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Progress indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {currentSentences.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentSentence 
                      ? `bg-${currentLevelConfig.color}-500`
                      : index < currentSentence 
                      ? 'bg-green-500' 
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Current sentence display */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-700">
            <div className="text-center mb-4">
              <span className="text-sm text-gray-400">
                Sentence {currentSentence + 1} of {currentSentences.length}
              </span>
            </div>
            
            <div className="text-xl mb-4 text-center leading-relaxed">
              {wordAccuracy.length > 0 ? (
                currentSentenceData.words.map((word, index) => {
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
                })
              ) : (
                <span className="text-gray-200">{currentSentenceData.text}</span>
              )}
            </div>
            
            <div className="text-center text-gray-400 text-sm mb-4">
              <span className="font-mono bg-gray-800 px-3 py-1 rounded border border-gray-700">
                {currentSentenceData.readablePhonetic}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <button
              onClick={() => isPlaying ? stopSpeech() : speakText(currentSentenceData.text)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                isPlaying
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              <span>{isPlaying ? 'Stop' : 'Listen'}</span>
            </button>

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
                {isListening ? 'Stop Recording' : speechRecognitionSupported ? 'Practice' : 'Not Supported'}
              </span>
            </button>

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
                    <span className={`text-sm ${item.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                      {Math.round(item.accuracy * 100)}%
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-300">Overall Accuracy:</span>
                  <span className={`text-lg font-bold ${
                    (wordAccuracy.reduce((sum, w) => sum + w.accuracy, 0) / wordAccuracy.length) >= currentLevelConfig.accuracyThreshold
                      ? 'text-emerald-400' 
                      : 'text-red-400'
                  }`}>
                    {Math.round((wordAccuracy.reduce((sum, w) => sum + w.accuracy, 0) / wordAccuracy.length) * 100)}%
                  </span>
                </div>
                {(wordAccuracy.reduce((sum, w) => sum + w.accuracy, 0) / wordAccuracy.length) >= currentLevelConfig.accuracyThreshold ? (
                  <p className="text-sm text-emerald-400 mt-1">Great job! You met the {currentLevelConfig.name} level requirement!</p>
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
              disabled={currentSentence === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentSentence === 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <ChevronLeft size={20} />
              <span>Previous</span>
            </button>

            <div className="text-center">
              <span className="text-gray-300">
                {currentSentence + 1} / {currentSentences.length}
              </span>
              <div className="text-xs text-gray-500 mt-1">
                {currentLevelConfig.name} Level
              </div>
            </div>

            <button
              onClick={goToNextSentence}
              disabled={currentSentence === currentSentences.length - 1}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentSentence === currentSentences.length - 1
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <span>Next</span>
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Level progression hint */}
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>
              {selectedLevel === 'beginner' && "Master the basics here, then try Intermediate level!"}
              {selectedLevel === 'intermediate' && "Challenge yourself with Advanced level next!"}
              {selectedLevel === 'advanced' && "You're practicing at the highest level. Keep up the excellent work!"}
            </p>
          </div>

          <audio ref={audioRef} className="hidden" controls />
        </div>
      </div>
    </div>
  );
};

export default PronunciationPractice;