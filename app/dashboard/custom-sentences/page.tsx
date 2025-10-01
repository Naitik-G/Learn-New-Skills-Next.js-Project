"use client"
import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Mic, MicOff, RotateCcw, Volume2, ChevronLeft, ChevronRight, 
  AlertTriangle, Star, TrendingUp, Award, Plus, Sparkles, Loader2, Save, Trash2 
} from 'lucide-react';
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { sentencesByLevel, type Sentence } from "@/data/pronunciation";
import { useRouter } from 'next/navigation';

const PronunciationPractice = () => {
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'custom'>('beginner');
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

  // Custom sentence states
  const [customSentences, setCustomSentences] = useState<Sentence[]>([]);
  const [customSentenceText, setCustomSentenceText] = useState('');
  const [isGeneratingPhonetic, setIsGeneratingPhonetic] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const supabase = createClient();
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
  }, [user, loading, router]);

  // Level configuration
  const levelConfig = {
    beginner: {
      name: "Beginner",
      icon: Star,
      description: "Simple sentences with basic vocabulary",
      color: "green",
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
    },
    custom: {
      name: "Custom",
      icon: Plus,
      description: "Your own sentences with AI-generated phonetics",
      color: "indigo",
      accuracyThreshold: 0.7
    }
  };

  // Get current sentences based on selected level
  const getCurrentSentences = (): Sentence[] => {
    if (selectedLevel === 'custom') {
      return customSentences;
    }
    return sentencesByLevel[selectedLevel] || [];
  };

  const currentSentences = getCurrentSentences();
  const currentLevelConfig = levelConfig[selectedLevel];

  // Load custom sentences from database
  useEffect(() => {
    const loadCustomSentences = async () => {
      if (!user || selectedLevel !== 'custom') return;

      try {
        const { data, error } = await supabase
          .from('custom_sentences')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading custom sentences:', error);
          return;
        }

        const sentences: Sentence[] = data?.map(item => ({
          text: item.text,
          phonetic: item.phonetic || '',
          readablePhonetic: item.readable_phonetic || '',
          words: item.words || []
        })) || [];

        setCustomSentences(sentences);
      } catch (error) {
        console.error('Error loading custom sentences:', error);
      }
    };

    loadCustomSentences();
  }, [user, selectedLevel, supabase]);

  useEffect(() => {
    // Initialize recordings array when level changes
    setRecordings(new Array(currentSentences.length).fill(null));
    setCurrentSentence(0);
    setUserTranscript('');
    setWordAccuracy([]);
    setCurrentRecording(null);
    
    // Check speech recognition support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechRecognitionSupported(false);
      setErrorMessage('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
    }
  }, [selectedLevel, currentSentences.length]);

  // Generate phonetic using Gemini AI
  const generatePhoneticWithGemini = async (text: string): Promise<{phonetic: string, readablePhonetic: string, words: string[]}> => {
    try {
      const response = await fetch('/api/generate_phonetic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return {
        phonetic: data.phonetic || '',
        readablePhonetic: data.readablePhonetic || '',
        words: text.split(' ').map(word => word.replace(/[.,!?;:]/g, ''))
      };
    } catch (error) {
      console.error('Error generating phonetic:', error);
      throw error;
    }
  };

  // Add custom sentence
  const addCustomSentence = async () => {
    if (!customSentenceText.trim() || !user) {
      setErrorMessage('Please enter a valid sentence');
      return;
    }

    setIsGeneratingPhonetic(true);
    setErrorMessage('');

    try {
      const { phonetic, readablePhonetic, words } = await generatePhoneticWithGemini(customSentenceText.trim());

      const newSentence: Sentence = {
        text: customSentenceText.trim(),
        phonetic,
        readablePhonetic,
        words
      };

      const { data, error } = await supabase
        .from('custom_sentences')
        .insert({
          user_id: user.id,
          text: newSentence.text,
          phonetic: newSentence.phonetic,
          readable_phonetic: newSentence.readablePhonetic,
          words: newSentence.words
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setCustomSentences(prev => [...prev, newSentence]);
      setCustomSentenceText('');
      setShowCustomModal(false);
      setRecordings(new Array(customSentences.length + 1).fill(null));

    } catch (error: any) {
      console.error('Error adding custom sentence:', error);
      setErrorMessage(`Failed to generate phonetics: ${error.message}`);
    } finally {
      setIsGeneratingPhonetic(false);
    }
  };

  // Delete custom sentence
  const deleteCustomSentence = async (index: number) => {
    if (!user) return;

    try {
      const sentenceToDelete = customSentences[index];
      
      const { error } = await supabase
        .from('custom_sentences')
        .delete()
        .eq('user_id', user.id)
        .eq('text', sentenceToDelete.text);

      if (error) {
        throw new Error(error.message);
      }

      const newCustomSentences = customSentences.filter((_, i) => i !== index);
      setCustomSentences(newCustomSentences);
      
      if (currentSentence >= newCustomSentences.length && newCustomSentences.length > 0) {
        setCurrentSentence(newCustomSentences.length - 1);
      } else if (newCustomSentences.length === 0) {
        setCurrentSentence(0);
      }
      
      setRecordings(new Array(newCustomSentences.length).fill(null));

    } catch (error: any) {
      console.error('Error deleting custom sentence:', error);
      setErrorMessage(`Failed to delete sentence: ${error.message}`);
    }
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const clearError = () => {
    setErrorMessage('');
    setIsRetrying(false);
    retryCountRef.current = 0;
  };

  const handleLevelChange = (level: 'beginner' | 'intermediate' | 'advanced' | 'custom') => {
    if (isListening) {
      stopRecording();
    }
    if (isPlaying) {
      stopSpeech();
    }
    
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
    if (!speechRecognitionSupported) {
      return null;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      if ('grammars' in recognition) {
        recognition.grammars = new ((window as any).SpeechGrammarList || (window as any).webkitSpeechGrammarList)();
      }

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
          if (currentSentences[currentSentence]) {
            analyzeAccuracy(finalTranscript.trim(), currentSentences[currentSentence].words);
          }
          retryCountRef.current = 0;
        } else if (interimTranscript) {
          setUserTranscript(interimTranscript.trim() + '...');
        }
      };
      
      recognition.onerror = (event: any) => {
        const errorMessages: {[key: string]: string} = {
          'network': 'Network connection issue. Please check your internet connection and try again.',
          'not-allowed': 'Microphone access denied. Please allow microphone permissions and try again.',
          'no-speech': 'No speech detected. Please speak clearly into the microphone.',
          'audio-capture': 'No microphone found. Please connect a microphone and try again.',
          'service-not-allowed': 'Speech recognition service not allowed. Please check your browser settings.',
          'bad-grammar': 'Speech recognition grammar error. Please try again.',
          'language-not-supported': 'Language not supported. Please check your browser settings.',
          'aborted': 'Speech recognition was aborted.'
        };

        const userFriendlyMessage = errorMessages[event.error] || `Speech recognition error: ${event.error}`;
        
        if (event.error === 'network') {
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            setErrorMessage(`Connection issue. Retrying... (${retryCountRef.current}/${maxRetries})`);
            setIsRetrying(true);
            
            setTimeout(() => {
              if (isListening && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (error) {
                  setIsListening(false);
                  setIsRetrying(false);
                  setErrorMessage('Unable to connect to speech recognition service. Please try again later.');
                }
              }
            }, 2000);
            return;
          } else {
            setErrorMessage('Unable to connect to speech recognition service after multiple attempts. Please check your internet connection.');
          }
        } else if (event.error === 'no-speech') {
          return;
        } else {
          setErrorMessage(userFriendlyMessage);
        }
        
        setIsListening(false);
        setIsRetrying(false);
      };
      
      recognition.onend = () => {
        if (isListening && !isRetrying && retryCountRef.current === 0) {
          setTimeout(() => {
            if (isListening && recognitionRef.current && !errorMessage) {
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
      setErrorMessage('Failed to initialize speech recognition. Please refresh the page and try again.');
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
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
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
      
      recorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };
      
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(blob);

        const newRecordings = [...recordings];
        newRecordings[currentSentence] = audioUrl;
        setRecordings(newRecordings);
        setCurrentRecording(audioUrl);

        if (user && currentSentences[currentSentence]) {
          try {
            const fileName = `${user.id}/${selectedLevel}/${Date.now()}-sentence-${currentSentence + 1}.wav`;

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from("pronunciation-audio")
              .upload(fileName, blob, { 
                contentType: "audio/wav",
                cacheControl: '3600',
                upsert: false 
              });

            if (uploadError) {
              setErrorMessage(`Failed to save recording: ${uploadError.message}`);
              return;
            }

            const { data: publicUrlData } = supabase.storage
              .from("pronunciation-audio")
              .getPublicUrl(fileName);

            const { data: insertData, error: insertError } = await supabase
              .from("pronunciation_attempts")
              .insert({
                user_id: user.id,
                sentence: currentSentences[currentSentence].text,
                spoken_text: userTranscript || '',
                audio_url: publicUrlData.publicUrl,
                accuracy: wordAccuracy.map((w) => w.accuracy),
                difficulty_level: selectedLevel,
                sentence_index: currentSentence
              })
              .select();

            if (insertError) {
              setErrorMessage(`Failed to save attempt: ${insertError.message}`);
              return;
            }

          } catch (uploadError: any) {
            setErrorMessage(`Unexpected error: ${uploadError.message}`);
          }
        }

        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsListening(true);
      retryCountRef.current = 0;
      
      const recognition = initializeSpeechRecognition();
      recognitionRef.current = recognition;
      
      if (recognition) {
        setTimeout(() => {
          if (recognitionRef.current && isListening) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              setErrorMessage('Failed to start speech recognition. Please try again.');
              setIsListening(false);
            }
          }
        }, 100);
      } else {
        setErrorMessage('Speech recognition is not available. You can still record audio.');
      }
      
    } catch (error: any) {
      setErrorMessage('Error accessing microphone. Please check permissions and try again.');
      setIsListening(false);
    }
  };

  const stopRecording = () => {
    setIsListening(false);
    setIsRetrying(false);
    retryCountRef.current = 0;
    
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log('Recognition already stopped');
      }
    }
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
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log('Recognition already stopped');
      }
    }
    
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  };

  const currentSentenceData = currentSentences[currentSentence];

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header with user info */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Pronunciation Practice
          </h1>
          <div className="text-right">
            <p className="text-sm text-gray-600">Welcome back,</p>
            <p className="font-medium text-gray-800">{user.email}</p>
          </div>
        </div>

        {/* Level Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Choose Your Level</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(levelConfig).map(([level, config]) => {
              const IconComponent = config.icon;
              const isSelected = selectedLevel === level;
              
              return (
                <button
                  key={level}
                  onClick={() => handleLevelChange(level as any)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? `border-${config.color}-500 bg-${config.color}-50`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <IconComponent 
                      size={32} 
                      className={`${
                        isSelected ? `text-${config.color}-600` : 'text-gray-400'
                      }`}
                    />
                  </div>
                  <h3 className={`font-semibold mb-1 ${
                    isSelected ? `text-${config.color}-700` : 'text-gray-700'
                  }`}>
                    {config.name}
                  </h3>
                  <p className={`text-sm ${
                    isSelected ? `text-${config.color}-600` : 'text-gray-500'
                  }`}>
                    {config.description}
                  </p>
                  <div className="mt-2 text-xs text-gray-400">
                    {level === 'custom' ? `${customSentences.length} sentences` : `${currentSentences.length} sentences`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Sentence Controls */}
        {selectedLevel === 'custom' && (
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="text-indigo-600" size={20} />
                <h3 className="text-lg font-medium text-indigo-800">Custom Sentences with AI</h3>
              </div>
              <button
                onClick={() => setShowCustomModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
              >
                <Plus size={16} />
                <span>Add Sentence</span>
              </button>
            </div>
            {customSentences.length === 0 && (
              <p className="text-indigo-600 text-center py-4">
                No custom sentences yet. Add your first sentence to get started!
              </p>
            )}
          </div>
        )}

        {/* Current Level Badge */}
        {currentSentences.length > 0 && (
          <div className="flex justify-center mb-6">
            <div className={`inline-flex items-center px-4 py-2 rounded-full bg-${currentLevelConfig.color}-100 text-${currentLevelConfig.color}-800`}>
              <currentLevelConfig.icon size={16} className="mr-2" />
              <span className="font-medium">{currentLevelConfig.name} Level</span>
              <span className="ml-2 text-xs opacity-75">
                ({Math.round(currentLevelConfig.accuracyThreshold * 100)}% accuracy needed)
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="text-red-500 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-red-700">{errorMessage}</p>
                {isRetrying && (
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                    <span className="text-sm text-red-600">Retrying...</span>
                  </div>
                )}
                <button
                  onClick={clearError}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Show content only if there are sentences */}
        {currentSentences.length > 0 ? (
          <>
            {/* Progress indicator */}
            <div className="flex justify-center mb-6">
              <div className="flex space-x-2">
                {currentSentences.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentSentence 
                        ? `bg-${currentLevelConfig.color}-500`
                        : index < currentSentence 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Current sentence display */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-sm text-gray-500">
                    Sentence {currentSentence + 1} of {currentSentences.length}
                  </span>
                  {selectedLevel === 'custom' && (
                    <button
                      onClick={() => deleteCustomSentence(currentSentence)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete this sentence"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Target sentence with word highlighting */}
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
                              ? 'bg-green-200 text-green-800'
                              : 'bg-red-200 text-red-800'
                            : 'bg-gray-200'
                        }`}
                      >
                        {word}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-gray-700">{currentSentenceData.text}</span>
                )}
              </div>
              
              {/* Phonetic transcription */}
              <div className="text-center text-gray-600 text-sm mb-4">
                <span className="font-mono bg-gray-100 px-3 py-1 rounded">
                  {currentSentenceData.readablePhonetic}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {/* Listen button */}
              <button
                onClick={() => isPlaying ? stopSpeech() : speakText(currentSentenceData.text)}
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
                onClick={isListening ? stopRecording : startRecording}
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
                onClick={resetPractice}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                <RotateCcw size={20} />
                <span>Reset</span>
              </button>
            </div>

            {/* User's transcript */}
            {userTranscript && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-blue-800 mb-2">You said:</h3>
                <p className="text-blue-700 text-lg">{userTranscript}</p>
              </div>
            )}

            {/* Accuracy feedback */}
            {wordAccuracy.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Accuracy Feedback:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {wordAccuracy.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded ${
                        item.isCorrect ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      <span className="font-medium">{item.word}</span>
                      <span className={`text-sm ${
                        item.isCorrect ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Math.round(item.accuracy * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Overall accuracy score */}
                <div className="mt-4 p-3 bg-white rounded border">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Overall Accuracy:</span>
                    <span className={`text-lg font-bold ${
                      (wordAccuracy.reduce((sum, w) => sum + w.accuracy, 0) / wordAccuracy.length) >= currentLevelConfig.accuracyThreshold
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {Math.round((wordAccuracy.reduce((sum, w) => sum + w.accuracy, 0) / wordAccuracy.length) * 100)}%
                    </span>
                  </div>
                  {(wordAccuracy.reduce((sum, w) => sum + w.accuracy, 0) / wordAccuracy.length) >= currentLevelConfig.accuracyThreshold ? (
                    <p className="text-sm text-green-600 mt-1">You met the {currentLevelConfig.name} level requirement!</p>
                  ) : (
                    <p className="text-sm text-red-600 mt-1">
                      Keep practicing! You need {Math.round(currentLevelConfig.accuracyThreshold * 100)}% for {currentLevelConfig.name} level.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Recording playback */}
            {currentRecording && (
              <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Your Recording:</h3>
                <button
                  onClick={() => playRecording(currentRecording)}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
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
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                }`}
              >
                <ChevronLeft size={20} />
                <span>Previous</span>
              </button>

              <div className="text-center">
                <span className="text-gray-600">
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
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                }`}
              >
                <span>Next</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </>
        ) : (
          /* Empty state for custom level */
          selectedLevel === 'custom' && (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">No Custom Sentences Yet</h3>
              <p className="text-gray-500 mb-6">
                Create your first custom sentence with AI-generated phonetics to get started!
              </p>
              <button
                onClick={() => setShowCustomModal(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
              >
                <Plus size={20} />
                <span>Add Your First Sentence</span>
              </button>
            </div>
          )
        )}

        {/* Level progression hint */}
        {currentSentences.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              {selectedLevel === 'beginner' && "Master the basics here, then try Intermediate level!"}
              {selectedLevel === 'intermediate' && "Challenge yourself with Advanced level next!"}
              {selectedLevel === 'advanced' && "You're practicing at the highest level. Keep up the work!"}
              {selectedLevel === 'custom' && "Practice with your own sentences and AI-generated phonetics!"}
            </p>
          </div>
        )}

        {/* Custom Sentence Modal */}
        {showCustomModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Sparkles className="text-indigo-500" size={24} />
                <span>Add Custom Sentence</span>
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your sentence:
                </label>
                <textarea
                  value={customSentenceText}
                  onChange={(e) => setCustomSentenceText(e.target.value)}
                  placeholder="Type any sentence and AI will generate phonetics..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={3}
                  disabled={isGeneratingPhonetic}
                />
              </div>

              {isGeneratingPhonetic && (
                <div className="mb-4 p-3 bg-indigo-50 rounded-lg flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                  <span className="text-indigo-700">Generating phonetics with AI...</span>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <button
                  onClick={addCustomSentence}
                  disabled={!customSentenceText.trim() || isGeneratingPhonetic}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                >
                  {isGeneratingPhonetic ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Add Sentence</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setShowCustomModal(false);
                    setCustomSentenceText('');
                    clearError();
                  }}
                  disabled={isGeneratingPhonetic}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>AI-Powered:</strong> Our Gemini AI will automatically generate readable phonetics 
                  for any sentence you type, making pronunciation practice easier than ever!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hidden audio element for playback */}
        <audio ref={audioRef} className="hidden" controls />
      </div>
    </div>
  );
};

export default PronunciationPractice;