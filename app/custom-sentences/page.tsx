"use client"
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Loader2, AlertTriangle, } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { sentencesByLevel, type Sentence } from "@/data/pronunciation";
import { useRouter } from 'next/navigation';

// Import new components
import { LevelSelector, LevelConfig } from '@/components/pronunciation/LevelSelector';
import { CustomSentenceSection } from '@/components/pronunciation/CustomSentenceSection';
import { PracticeDisplay } from '@/components/pronunciation/PracticeDisplay';
import { CustomSentenceModal } from '@/components/pronunciation/CustomSentenceModal';

export type Level = 'beginner' | 'intermediate' | 'advanced' | 'custom';
export type WordAccuracy = Array<{word: string, accuracy: number, isCorrect: boolean}>;

// Level configuration
const levelConfig: { [key in Level]: LevelConfig & { accuracyThreshold: number } } = {
  beginner: {
    name: "Beginner",
    description: "Simple sentences with basic vocabulary",
    color: "emerald",
    icon: AlertTriangle, // Placeholder, replaced with actual Lucide imports in LevelSelector
    accuracyThreshold: 0.6
  },
  intermediate: {
    name: "Intermediate", 
    description: "Medium complexity sentences with varied vocabulary",
    color: "blue",
    icon: AlertTriangle, // Placeholder
    accuracyThreshold: 0.7
  },
  advanced: {
    name: "Advanced",
    description: "Complex sentences with advanced vocabulary",
    color: "purple",
    icon: AlertTriangle, // Placeholder
    accuracyThreshold: 0.8
  },
  custom: {
    name: "Custom",
    description: "Your own sentences with AI-generated phonetics",
    color: "indigo",
    icon: AlertTriangle, // Placeholder
    accuracyThreshold: 0.7
  }
};

const PronunciationPractice = () => {
  const [selectedLevel, setSelectedLevel] = useState<Level>('beginner');
  const [currentSentence, setCurrentSentence] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [wordAccuracy, setWordAccuracy] = useState<WordAccuracy>([]);
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

  // Memoized sentence data
  const currentSentences = useMemo((): Sentence[] => {
    if (selectedLevel === 'custom') {
      return customSentences;
    }
    return sentencesByLevel[selectedLevel] || [];
  }, [selectedLevel, customSentences]);

  const currentLevelConfig = levelConfig[selectedLevel];
  const currentSentenceData = currentSentences[currentSentence];

  // --- Helper Functions ---

  const clearError = useCallback(() => {
    setErrorMessage('');
    setIsRetrying(false);
    retryCountRef.current = 0;
  }, []);

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

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const analyzeAccuracy = (userText: string, targetWords: string[]) => {
    const userWords = userText.toLowerCase().split(' ');
    const accuracy: WordAccuracy = [];
    const threshold = currentLevelConfig.accuracyThreshold;
    
    targetWords.forEach((targetWord, index) => {
      const userWord = userWords[index] || '';
      const similarity = calculateSimilarity(
        targetWord.toLowerCase().replace(/[.,!?;:]/g, ''),
        userWord.replace(/[.,!?;:]/g, '')
      );
      
      accuracy.push({
        word: targetWord,
        accuracy: similarity,
        isCorrect: similarity > threshold
      });
    });
    
    setWordAccuracy(accuracy);
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
          // ... (Error messages from original code)
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
        // console.log('Recognition already stopped');
      }
    }
  };

  const startRecording = async () => {
    clearError();
    if (isPlaying) stopSpeech();

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

        // Save to Supabase logic (for logged-in users)
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

  const resetPractice = () => {
    setUserTranscript('');
    setWordAccuracy([]);
    stopSpeech();
    clearError();
    stopRecording();
  };

  const playRecording = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  };

  const goToNextSentence = () => {
    if (currentSentence < currentSentences.length - 1) {
      const nextIndex = currentSentence + 1;
      setCurrentSentence(nextIndex);
      setUserTranscript('');
      setWordAccuracy([]);
      setCurrentRecording(recordings[nextIndex]);
      clearError();
    }
  };

  const goToPreviousSentence = () => {
    if (currentSentence > 0) {
      const prevIndex = currentSentence - 1;
      setCurrentSentence(prevIndex);
      setUserTranscript('');
      setWordAccuracy([]);
      setCurrentRecording(recordings[prevIndex]);
      clearError();
    }
  };

  const handleLevelChange = (level: Level) => {
    if (isListening) stopRecording();
    if (isPlaying) stopSpeech();
    
    setSelectedLevel(level);
    clearError();
  };

  // --- Custom Sentence Handlers ---

  const generatePhoneticWithGemini = async (text: string): Promise<{phonetic: string, readablePhonetic: string, words: string[]}> => {
    try {
      const response = await fetch('/api/generate-phonetic', {
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

  const addCustomSentence = async () => {
    if (!customSentenceText.trim()) {
      setErrorMessage('Please enter a valid sentence');
      return;
    }

    if (!user) {
      setErrorMessage('You must be logged in to use AI-generated phonetics');
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

  // --- Effects ---

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

  // Reset state on level change
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


  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-slate-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // --- Render ---

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gradient-to-br from-gray-900 to-slate-900 min-h-screen">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
        
        {/* Header with user info */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Pronunciation Practice</h1>
          <div className="text-right">
            {user ? (
              <>
                <p className="text-sm text-gray-400">Welcome back,</p>
                <p className="font-medium text-gray-200">{user.email}</p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-400">Guest Mode</p>
                <button
                  onClick={() => router.push('/login')}
                  className="text-sm text-indigo-400 hover:text-indigo-300 underline"
                >
                  Log in for full features
                </button>
              </>
            )}
          </div>
        </div>

        {/* Level Selection */}
        <LevelSelector 
          levelConfig={levelConfig}
          selectedLevel={selectedLevel}
          onLevelChange={handleLevelChange}
          customSentenceCount={customSentences.length}
          beginnerSentenceCount={sentencesByLevel.beginner.length}
          intermediateSentenceCount={sentencesByLevel.intermediate.length}
          advancedSentenceCount={sentencesByLevel.advanced.length}
        />

        {/* Custom Sentence Controls */}
        {selectedLevel === 'custom' && (
          <CustomSentenceSection 
            user={user}
            customSentencesCount={customSentences.length}
            setShowCustomModal={setShowCustomModal}
            setErrorMessage={setErrorMessage}
            router={router}
          />
        )}
        
        {/* Current Level Badge */}
        {currentSentences.length > 0 && (
          <div className="flex justify-center mb-6">
            <div className={`inline-flex items-center px-4 py-2 rounded-full bg-${currentLevelConfig.color}-950/50 text-${currentLevelConfig.color}-300 border border-${currentLevelConfig.color}-800`}>
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
          <div className="mb-6 p-4 bg-red-950/30 border border-red-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="text-red-400 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-red-300">{errorMessage}</p>
                {isRetrying && (
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                    <span className="text-sm text-red-400">Retrying...</span>
                  </div>
                )}
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

        {/* Practice Display or Empty State */}
        {currentSentences.length > 0 ? (
          <PracticeDisplay
            currentSentenceData={currentSentenceData}
            currentSentencesLength={currentSentences.length}
            currentSentenceIndex={currentSentence}
            wordAccuracy={wordAccuracy}
            selectedLevel={selectedLevel}
            currentLevelConfig={currentLevelConfig}
            isListening={isListening}
            isPlaying={isPlaying}
            userTranscript={userTranscript}
            currentRecording={currentRecording}
            speechRecognitionSupported={speechRecognitionSupported}
            speakText={() => speakText(currentSentenceData.text)}
            stopSpeech={stopSpeech}
            startRecording={startRecording}
            stopRecording={stopRecording}
            resetPractice={resetPractice}
            playRecording={playRecording}
            goToPreviousSentence={goToPreviousSentence}
            goToNextSentence={goToNextSentence}
            deleteCustomSentence={deleteCustomSentence}
            router={router}
            user={user}
          />
        ) : (
          /* Empty state for custom level */
          selectedLevel === 'custom' && (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-300 mb-2">No Custom Sentences Yet</h3>
              <p className="text-gray-400 mb-6">
                Please log in to create custom sentences with AI-generated phonetics.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                <span>Log In to Add Sentences</span>
              </button>
            </div>
          )
        )}

        {/* Level progression hint */}
        {currentSentences.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-400">
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
          <CustomSentenceModal
            customSentenceText={customSentenceText}
            setCustomSentenceText={setCustomSentenceText}
            isGeneratingPhonetic={isGeneratingPhonetic}
            addCustomSentence={addCustomSentence}
            setShowCustomModal={setShowCustomModal}
            clearError={clearError}
            user={user}
            router={router}
          />
        )}

        {/* Hidden audio element for playback */}
        <audio ref={audioRef} className="hidden" controls />
      </div>
    </div>
  );
};

export default PronunciationPractice;